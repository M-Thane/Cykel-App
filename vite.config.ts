import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the built app works from any subpath (GitHub Pages
  // project sites, Netlify/Vercel, or opening dist/index.html directly).
  base: './',
  plugins: [react(), tailwindcss()],
})
