import { defineConfig } from 'vite'

// Note: '@vitejs/plugin-react' can be ESM-only in some environments and
// cause esbuild to error when bundling the config. If your Node environment
// supports ESM and you prefer the plugin, re-add it (or upgrade Node).
export default defineConfig({
  server: { port: 8080 }
})
