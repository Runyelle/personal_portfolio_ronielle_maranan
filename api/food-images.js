import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

const auth = new GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
  // read + write: write access is used only to cache a resolved place name back
  // onto each file's appProperties. If the folder is shared with the service
  // account as Viewer only, the writes fail quietly and geocoding just re-runs.
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

// Drive's thumbnailLink is capped (~s220 by default); ask for a larger render.
function upscale(thumbnailLink) {
  return thumbnailLink.replace(/=s\d+$/, '=s1600');
}

// Drive's imageMediaMetadata.time is EXIF-style ("2015:04:12 20:29:33").
// Normalise to something Date() parses.
function exifToIso(value) {
  if (!value) return null;
  const m = String(value).match(
    /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/
  );
  if (m) return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const SEP_RE = /\s*[~—]\s*|\s+-\s+/;
const DATE_RE = /^\d{4}-\d{2}(-\d{2})?$/;

// Filename convention:  "Place Name ~ Dish Name.jpg"
//   part 1  -> place  (groups the menu; leave it off and the photo lands under "Elsewhere")
//   part 2  -> dish   (the caption under the photo; a Drive "description" overrides it)
//   part 3  -> OPTIONAL date, YYYY-MM or YYYY-MM-DD. Normally omitted — the date comes from
//              the photo's EXIF capture time (imageMediaMetadata.time). Only needed when a
//              photo carries no EXIF date (screenshots, exported/edited images, etc.).
// Separators accepted: " ~ ", " — ", " - ".  With no separator the whole name is treated as the dish.
function parseName(rawName) {
  const name = String(rawName || '')
    .replace(/\.[^.]+$/, '')
    .trim();
  const parts = name
    .split(SEP_RE)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return { place: null, dish: name || null, dateOverride: null };
  }

  let dateOverride = null;
  if (DATE_RE.test(parts[parts.length - 1])) {
    dateOverride = parts.pop();
  }
  const [place, ...rest] = parts;
  return { place: place || null, dish: rest.join(' ~ ') || null, dateOverride };
}

function overrideToIso(value) {
  if (!value) return null;
  return value.length === 7 ? `${value}-01T00:00:00` : `${value}T00:00:00`;
}

// round to ~11 m so every shot taken inside one venue collapses to one key
function geoKey(lat, lng) {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

// Turn GPS coordinates into a place name. Only runs if GOOGLE_MAPS_API_KEY is
// set. Returns { ok } so the caller knows whether the lookup actually completed
// (ok:false on a network error or quota/limit response -> don't cache, retry later).
async function reverseGeocode(lat, lng, cache) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return { ok: false, label: null };

  const key = geoKey(lat, lng);
  if (cache.has(key)) return cache.get(key);

  let result = { ok: false, label: null };
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${key}&key=${apiKey}`
    );
    const data = await res.json();

    if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
      const results = data.results || [];
      const poi = results.find((r) => (r.types || []).includes('point_of_interest'));
      const locality = results.find((r) => (r.types || []).includes('locality'));
      result = {
        ok: true,
        label:
          poi?.address_components?.[0]?.long_name ||
          locality?.address_components?.[0]?.long_name ||
          results[0]?.formatted_address ||
          null,
      };
    } else {
      console.warn(`food-images: geocode ${key} returned ${data.status}`);
    }
  } catch (err) {
    console.warn(`food-images: geocode ${key} failed —`, err.message);
  }

  cache.set(key, result);
  return result;
}

export default async function handler(req, res) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    res.status(500).json({ images: [], error: 'GOOGLE_DRIVE_FOLDER_ID not configured' });
    return;
  }

  try {
    const { data } = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields:
        'files(id, name, description, thumbnailLink, appProperties, imageMediaMetadata(time, location))',
      pageSize: 200,
      orderBy: 'name',
    });

    const geoCache = new Map();
    const persist = []; // resolved place names to write back onto the files
    const images = [];

    for (const f of data.files || []) {
      if (!f.thumbnailLink) continue;

      const { place: namedPlace, dish, dateOverride } = parseName(f.name);
      const meta = f.imageMediaMetadata || {};
      const loc = meta.location || null;
      const lat = typeof loc?.latitude === 'number' ? loc.latitude : null;
      const lng = typeof loc?.longitude === 'number' ? loc.longitude : null;
      const hasGeo = lat != null && lng != null;
      const props = f.appProperties || {};

      // the filename always wins; only fall back to coordinates when it's missing
      let resolvedPlace = namedPlace;

      if (!resolvedPlace && hasGeo) {
        const key = geoKey(lat, lng);

        if (props.faudGeoKey === key) {
          // this exact spot was already resolved on a previous run — reuse it,
          // never hit the Maps API again for this photo
          resolvedPlace = props.faudPlace || null;
        } else {
          const { ok, label } = await reverseGeocode(lat, lng, geoCache);
          if (ok) {
            resolvedPlace = label;
            persist.push({
              fileId: f.id,
              appProperties: label
                ? { faudGeoKey: key, faudPlace: label }
                : { faudGeoKey: key, faudPlace: null }, // null clears any stale value
            });
          }
        }
      }

      images.push({
        id: f.id,
        name: f.name,
        url: upscale(f.thumbnailLink),
        place: resolvedPlace || null,
        caption: f.description || dish || null,
        takenAt: overrideToIso(dateOverride) || exifToIso(meta.time),
        lat,
        lng,
        mapUrl: hasGeo ? `https://www.google.com/maps?q=${lat},${lng}` : null,
      });
    }

    // write the newly-resolved names back onto the files so the next cold start
    // skips geocoding. Best effort: needs Editor access on the folder.
    if (persist.length) {
      const results = await Promise.allSettled(
        persist.map(({ fileId, appProperties }) =>
          drive.files.update({ fileId, requestBody: { appProperties } })
        )
      );
      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length) {
        console.warn(
          `food-images: could not cache ${failed.length}/${persist.length} place name(s) to Drive — ` +
            `share the folder with ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL} as Editor to enable caching. ` +
            `First error: ${failed[0].reason?.message || failed[0].reason}`
        );
      }
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ images });
  } catch (err) {
    console.error('food-images: failed to list Drive folder', err);
    res.status(500).json({ images: [], error: 'Failed to load images' });
  }
}
