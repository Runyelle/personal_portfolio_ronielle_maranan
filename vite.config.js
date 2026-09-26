import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import contactDevApi from './scripts/contact-dev-api.js';
import foodDevApi from './scripts/food-dev-api.js';
import overwatchDevApi from './scripts/overwatch-dev-api.js';
import resumeDevApi from './scripts/resume-dev-api.js';
import spotifyDevApi from './scripts/spotify-dev-api.js';

export default defineConfig({
  plugins: [
    react(),
    spotifyDevApi(),
    overwatchDevApi(),
    contactDevApi(),
    foodDevApi(),
    resumeDevApi(),
  ],
  // Spotify only accepts loopback-IP redirect URIs (not "localhost"), and the
  // registered one is http://127.0.0.1:5173/callback — fail loudly rather than
  // silently moving to another port and breaking the login redirect
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
});
