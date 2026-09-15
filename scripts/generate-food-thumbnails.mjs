// Build-time step for the Food Album (src/components/FoodAlbum.jsx).
//
// Reads the curated originals in src/assets/food/, and for each one writes a
// uniform square thumbnail (center-cropped, never stretched) to
// src/assets/food-thumbs/, plus a manifest.json describing place/caption/date
// metadata so the component doesn't need to touch the filesystem itself.
//
// Runs automatically before `dev` and `build` (see package.json).

import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(__dirname, '..', 'src', 'assets', 'food');
const OUT_DIR = path.join(__dirname, '..', 'src', 'assets', 'food-thumbs');

const THUMB_SIZE = 640;
const IMAGE_RE = /\.(jpe?g|png|avif|webp|gif|heic|heif)$/i;

// mirrors parseFoodName() previously in Showcase.jsx / parseName() in
// api/food-images.js — "Place Name ~ Dish Name ~ 2026-03-14.jpg"
const SEP_RE = /\s*[~—]\s*|\s+-\s+/;
const DATE_RE = /^\d{4}-\d{2}(-\d{2})?$/;

function parseFoodName(rawName) {
  const name = rawName.replace(/\.[^.]+$/, '').trim();
  const parts = name
    .split(SEP_RE)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length <= 1) return { place: null, dish: name || null, dateOverride: null };

  let dateOverride = null;
  if (DATE_RE.test(parts[parts.length - 1])) dateOverride = parts.pop();
  const [place, ...rest] = parts;
  return { place: place || null, dish: rest.join(' ~ ') || null, dateOverride };
}

function overrideToIso(value) {
  if (!value) return null;
  return value.length === 7 ? `${value}-01T00:00:00` : `${value}T00:00:00`;
}

function slugify(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

async function main() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  let files;
  try {
    files = readdirSync(SRC_DIR).filter((f) => IMAGE_RE.test(f));
  } catch {
    files = [];
  }

  if (!files.length) {
    writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify([], null, 2));
    console.log('generate-food-thumbnails: no source photos found in src/assets/food/');
    return;
  }

  const manifest = [];

  for (const file of files) {
    const srcPath = path.join(SRC_DIR, file);
    const { place, dish, dateOverride } = parseFoodName(file);
    const takenAt = overrideToIso(dateOverride) || statSync(srcPath).mtime.toISOString();
    const id = slugify(file);
    const outFile = `${id}.webp`;

    await sharp(srcPath)
      .rotate() // apply EXIF orientation before cropping
      .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover', position: 'centre' })
      .webp({ quality: 82 })
      .toFile(path.join(OUT_DIR, outFile));

    // srcFile lets the component fall back to the full, uncropped original
    // (browsers auto-rotate JPEGs per EXIF, so no extra processing is needed
    // for that — the square `file` thumbnail is for the grid only)
    manifest.push({ id, file: outFile, srcFile: file, place, caption: dish, takenAt });
  }

  manifest.sort((a, b) => Date.parse(b.takenAt) - Date.parse(a.takenAt));

  writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`generate-food-thumbnails: wrote ${manifest.length} thumbnail(s) to src/assets/food-thumbs/`);
}

main().catch((err) => {
  console.error('generate-food-thumbnails failed:', err);
  process.exit(1);
});
