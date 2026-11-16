import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: 'apps/web',
  publicDir: 'public',
  build: { outDir: '../../dist', emptyOutDir: true },
  test: {
    environment: 'node',
    include: ['../../tests/**/*.test.ts'],
    coverage: { reporter: ['text', 'lcov'] },
  },
});
