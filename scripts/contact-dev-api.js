// Dev-only (`vite` serve) route for /api/contact. In production Vercel serves
// api/contact.js directly; plain `vite` has no serverless runtime, so this
// plugin mounts that same handler locally.

import { loadEnv } from 'vite';
import contactHandler from '../api/contact.js';
import { withVercelHelpers } from './vercel-dev-helpers.js';

export default function contactDevApi() {
  return {
    name: 'contact-dev-api',
    apply: 'serve',

    configResolved(config) {
      // expose only the delivery vars to the handler, the way Vercel would
      const env = loadEnv(config.mode, config.envDir || config.root, ['RESEND_', 'CONTACT_']);
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value;
      }
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          if (new URL(req.url, 'http://127.0.0.1').pathname !== '/api/contact') {
            next();
            return;
          }
          await contactHandler(req, withVercelHelpers(res));
        } catch (err) {
          next(err);
        }
      });
    },
  };
}
