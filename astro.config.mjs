import { fileURLToPath } from 'node:url';

import vercel from '@astrojs/vercel';
import svelte from '@astrojs/svelte';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [svelte()],
  security: { checkOrigin: true },
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: { sourcemap: true },
  },
});
