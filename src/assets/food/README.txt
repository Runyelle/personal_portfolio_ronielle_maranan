Food photos for the FAUD menu (panel 2 of the Showcase).

These local files are only the fallback for `vite` dev with no serverless
functions running. In production the photos come from the Google Drive folder
via /api/food-images.

NAME EACH FILE LIKE THIS:

    Place Name ~ Dish Name.jpg

  - part 1  -> place  (groups the menu; leave it off and the photo lands under "Elsewhere")
  - part 2  -> dish   (caption shown on hover; a Drive "description" overrides it)

The date is read automatically from the photo's EXIF capture time
(imageMediaMetadata.time from the Drive API) — you do NOT normally add it.

Only if a photo has no EXIF date (screenshots, edited/exported images, anything
sent through a messaging app) add a third segment so it still sorts correctly:

    Place Name ~ Dish Name ~ 2026-03-14.jpg     (YYYY-MM or YYYY-MM-DD)

Without any date a place drops to the bottom of the menu with no date label.

Separators accepted: " ~ ", " - ", " em dash ". With no separator the whole
name is treated as the dish.

The menu orders places newest-first by their most recent photo, 6 photos per
page, and a place never shares a page with another place.

If a photo has GPS EXIF and GOOGLE_MAPS_API_KEY is set in the deploy env, a
missing place name is filled in by reverse-geocoding the coordinates.
