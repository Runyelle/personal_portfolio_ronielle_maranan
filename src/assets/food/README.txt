Source photos for the Food Album (src/components/FoodAlbum.jsx).

These originals are never shipped as-is. `npm run gen:food-thumbs`
(auto-run before `dev` and `build`, see scripts/generate-food-thumbnails.mjs)
uses sharp to center-crop each one into a uniform square thumbnail in
src/assets/food-thumbs/ (generated, gitignored) plus a manifest.json with the
place/caption/date metadata the grid needs. Drop a new photo here and it
picks it up on the next dev/build.

NAME EACH FILE LIKE THIS:

    Place Name ~ Dish Name.jpg

  - part 1  -> place    (shown as the album cover's tooltip alongside the dish)
  - part 2  -> dish     (caption shown on hover)

The grid sorts newest-first. Without EXIF parsing at build time, the date
comes from an optional third segment:

    Place Name ~ Dish Name ~ 2026-03-14.jpg     (YYYY-MM or YYYY-MM-DD)

Skip it and the photo sorts by its file's last-modified time instead.

Separators accepted: " ~ ", " - ", " em dash ". With no separator the whole
name is treated as the dish.
