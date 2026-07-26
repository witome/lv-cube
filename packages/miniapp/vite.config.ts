import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@lv-cube/shared': '../shared/src/index.ts',
    },
  },
  server: {
    port: 5173,
  },
});
