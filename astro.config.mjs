import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://devarshi16.github.io',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  vite: { build: { sourcemap: true } },
  devToolbar: { enabled: false },
});
