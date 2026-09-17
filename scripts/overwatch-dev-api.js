// Dev-only (`vite` serve) route for /api/overwatch. In production Vercel serves
// api/overwatch.js directly; plain `vite` has no serverless runtime, so this
// plugin mounts that same handler locally.

import { loadEnv } from 'vite';
import overwatchHandler from '../api/overwatch.js';
import { withVercelHelpers } from './vercel-dev-helpers.js';

export default function overwatchDevApi() {
  return {
    name: 'overwatch-dev-api',
    apply: 'serve',

    configResolved(config) {
      // expose only the OVERWATCH_* / OVERFAST_* values to the handler, the way Vercel would
      const env = loadEnv(config.mode, config.envDir || config.root, ['OVERWATCH_', 'OVERFAST_']);
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value;
      }
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          if (new URL(req.url, 'http://127.0.0.1').pathname !== '/api/overwatch') {
            next();
            return;
          }
          await overwatchHandler(req, withVercelHelpers(res));
        } catch (err) {
          next(err);
        }
      });
    },
  };
}
