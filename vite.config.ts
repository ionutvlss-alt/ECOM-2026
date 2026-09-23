import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'serve-dev-entry',
        transformIndexHtml(html, ctx) {
          if (ctx.server) {
            return html.replace(
              /<script type="module" crossorigin src="[^"]+"><\/script>/,
              '<script type="module" src="/src/main.tsx"></script>'
            );
          }
          return html;
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
