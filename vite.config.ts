import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // This app is deployed at the site root (not nested under a sub-path), so
  // base stays "/". Static assets in AvatarStage.tsx still go through
  // import.meta.env.BASE_URL rather than a hardcoded "/xxx" string — if this
  // ever gets deployed under a sub-path again, only this line needs to change.
  base: "/",
  server: {
    // The VOICEVOX text-to-speech endpoint lives on the local Express server
    // in server/ (port 8083 by default) — see server/server.mjs.
    proxy: {
      "/api": "http://localhost:8083",
    },
  },
})
