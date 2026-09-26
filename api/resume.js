// Streams the current resume PDF from a Drive folder so the site never needs
// a new commit when the resume changes — just drop a new PDF in the folder.
//
// Uses the same service account as api/food-images.js (GOOGLE_SERVICE_ACCOUNT_EMAIL /
// GOOGLE_PRIVATE_KEY); it must additionally be shared (Viewer is enough) on the
// resume folder, whose id goes in GOOGLE_DRIVE_RESUME_FOLDER_ID.
//
// "Current" = the PDF whose filename encodes the latest date, filename
// convention "Resume-M-D-YYYY" (month/day may or may not be zero-padded, e.g.
// both "Resume-9-2-2026.pdf" and "Resume-09-02-2026.pdf" work). Old versions
// can stay in the folder for history; only the one with the latest date is
// served. If no filename in the folder matches, falls back to the PDF with
// the most recent Drive modifiedTime.

import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

const auth = new GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

// "Resume-9-2-2026.pdf" / "Resume-09-02-2026.pdf" -> Date. Returns null for
// anything that doesn't match or names an impossible calendar date.
const NAME_DATE_RE = /^Resume-(\d{1,2})-(\d{1,2})-(\d{4})\b/i;

function dateFromName(name) {
  const m = NAME_DATE_RE.exec(name);
  if (!m) return null;

  const month = Number(m[1]);
  const day = Number(m[2]);
  const year = Number(m[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  // catches out-of-range values like "Resume-9-31-2026" (Sept has 30 days),
  // which Date() would otherwise silently roll into October
  const valid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  return valid ? date : null;
}

export default async function handler(req, res) {
  const folderId = process.env.GOOGLE_DRIVE_RESUME_FOLDER_ID;
  if (!folderId) {
    res.status(500).json({ error: 'GOOGLE_DRIVE_RESUME_FOLDER_ID not configured' });
    return;
  }

  try {
    const { data } = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/pdf' and trashed = false`,
      fields: 'files(id, name, modifiedTime)',
      orderBy: 'modifiedTime desc',
      pageSize: 100,
    });

    const files = data.files || [];
    if (!files.length) {
      res.status(404).json({ error: 'No PDF found in resume folder' });
      return;
    }

    const dated = files
      .map((f) => ({ file: f, date: dateFromName(f.name) }))
      .filter((f) => f.date);

    let file;
    if (dated.length) {
      file = dated.reduce((latest, f) => (f.date > latest.date ? f : latest)).file;
    } else {
      // nothing matched the "Resume-M-D-YYYY" convention — fall back to
      // whatever Drive says was modified most recently (files is already
      // sorted that way)
      console.warn(
        `resume: no file in the folder matches "Resume-M-D-YYYY.pdf", falling back to modifiedTime`
      );
      file = files[0];
    }

    const { data: pdfStream } = await drive.files.get(
      { fileId: file.id, alt: 'media' },
      { responseType: 'stream' }
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${file.name}"`);
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

    pdfStream.on('error', (err) => {
      console.error('resume: stream from Drive failed', err);
      if (!res.headersSent) res.status(502).end('Failed to load resume');
      else res.end();
    });
    pdfStream.pipe(res);
  } catch (err) {
    console.error('resume: failed to fetch from Drive', err);
    res.status(500).json({ error: 'Failed to load resume' });
  }
}
