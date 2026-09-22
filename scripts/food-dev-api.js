// Dev-only (`vite` serve) route for /api/food-images. In production Vercel serves
// api/food-images.js directly; plain `vite` has no serverless runtime, so this
// plugin mounts that same handler locally. Without it the fetch in FoodAlbum.jsx
// 404s in dev and the album silently falls back to the bundled sharp thumbnails,
// which means a broken Drive credential only ever shows up in production.

import { loadEnv } from 'vite';
import { withVercelHelpers } from './vercel-dev-helpers.js';

// api/food-images.js builds its GoogleAuth client at module scope, so it has to
// be imported AFTER loadEnv has populated process.env — a static import here
// would evaluate while vite.config.js is still loading and the credentials
// would be undefined. On Vercel the env is already in the process, so the
// production handler is unaffected.
let handlerPromise;

export default function foodDevApi() {
  return {
    name: 'food-dev-api',
    apply: 'serve',

    configResolved(config) {
      // expose only the GOOGLE_* values to the handler, the way Vercel would
      const env = loadEnv(config.mode, config.envDir || config.root, ['GOOGLE_']);
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value;
      }
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          if (new URL(req.url, 'http://127.0.0.1').pathname !== '/api/food-images') {
            next();
            return;
          }
          handlerPromise ??= import('../api/food-images.js').then((m) => m.default);
          const foodImagesHandler = await handlerPromise;
          await foodImagesHandler(req, withVercelHelpers(res));
        } catch (err) {
          next(err);
        }
      });
    },
  };
}
