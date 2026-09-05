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

// Drive's thumbnailLink is capped (~s220 by default); ask for a larger render.
function upscale(thumbnailLink) {
  return thumbnailLink.replace(/=s\d+$/, '=s1600');
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
      fields: 'files(id, name, description, thumbnailLink, imageMediaMetadata(time))',
      pageSize: 100,
      orderBy: 'name',
    });

    const images = (data.files || [])
      .filter((f) => f.thumbnailLink)
      .map((f) => ({
        id: f.id,
        name: f.name,
        url: upscale(f.thumbnailLink),
        caption: f.description || null,
        takenAt: f.imageMediaMetadata?.time || null,
      }));

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ images });
  } catch (err) {
    console.error('food-images: failed to list Drive folder', err);
    res.status(500).json({ images: [], error: 'Failed to load images' });
  }
}
