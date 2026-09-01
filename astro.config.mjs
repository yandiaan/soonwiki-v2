import { fileURLToPath } from 'node:url';

import svelte from '@astrojs/svelte';
import vercel from '@astrojs/vercel';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [svelte()],
  security: { checkOrigin: true },
  vite: {
    optimizeDeps: {
      include: ['leaflet'],
    },
    ssr: {
      noExternal: ['leaflet'],
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: { sourcemap: true },
  },
});
