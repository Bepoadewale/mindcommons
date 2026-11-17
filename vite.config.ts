import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const visionOnly = process.env.VITE_VISION_ONLY === 'true';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'mindcommons-vision-only-html',
      transformIndexHtml(html) {
        if (!visionOnly) return html;
        return html
          .replace(/\s*<link rel="manifest"[^>]*\/>/, '')
          .replace(
            '<meta\n      name="description"\n      content="Explore a synthetic demonstration of community rules and individual permissions governing AI research."\n    />',
            '<meta name="description" content="A clearly labeled, proposed future-product wireframe for MindCommons." />',
          )
          .replace(
            '<title>MindCommons — Community rules for AI research</title>',
            '<title>MindCommons — Future product vision</title>',
          );
      },
    },
  ],
  root: 'apps/web',
  publicDir: 'public',
  base: process.env.VITE_BASE_PATH || '/',
  build: { outDir: visionOnly ? '../../dist-vision' : '../../dist', emptyOutDir: true },
  test: {
    environment: 'node',
    include: ['../../tests/**/*.test.ts'],
    coverage: { reporter: ['text', 'lcov'] },
  },
});
