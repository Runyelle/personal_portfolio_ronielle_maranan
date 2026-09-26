// Dev-only (`vite` serve) route for /api/resume. In production Vercel serves
// api/resume.js directly; plain `vite` has no serverless runtime, so this
// plugin mounts that same handler locally. Without it the Resume links 404 in dev.

import { loadEnv } from 'vite';
import { withVercelHelpers } from './vercel-dev-helpers.js';

// api/resume.js builds its GoogleAuth client at module scope, so it has to be
// imported AFTER loadEnv has populated process.env — a static import here
// would evaluate while vite.config.js is still loading and the credentials
// would be undefined. On Vercel the env is already in the process, so the
// production handler is unaffected.
let handlerPromise;

export default function resumeDevApi() {
  return {
    name: 'resume-dev-api',
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
          if (new URL(req.url, 'http://127.0.0.1').pathname !== '/api/resume') {
            next();
            return;
          }
          handlerPromise ??= import('../api/resume.js').then((m) => m.default);
          const resumeHandler = await handlerPromise;
          await resumeHandler(req, withVercelHelpers(res));
        } catch (err) {
          next(err);
        }
      });
    },
  };
}
