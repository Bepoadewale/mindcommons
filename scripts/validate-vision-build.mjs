import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const output = resolve(import.meta.dirname, '../dist');
const html = readFileSync(join(output, 'index.html'), 'utf8');
const errors = [];

if (!html.includes('<title>MindCommons — Future product vision</title>')) {
  errors.push('Static output must identify itself as the future-product vision.');
}
if (!html.includes('A clearly labeled, proposed future-product wireframe')) {
  errors.push('Static output must describe the wireframe accurately.');
}
if (html.includes('rel="manifest"')) {
  errors.push('Static wireframe output must not advertise an installable PWA.');
}

const assets = [...html.matchAll(/(?:src|href)="(\/mindcommons\/[^"]+)"/g)].map(([, path]) => path);
if (!assets.some((asset) => asset.includes('/assets/') && asset.endsWith('.js'))) {
  errors.push('Static output is missing its JavaScript bundle.');
}
if (!assets.some((asset) => asset.includes('/assets/') && asset.endsWith('.css'))) {
  errors.push('Static output is missing its stylesheet.');
}
for (const asset of assets) {
  const file = resolve(output, asset.replace('/mindcommons/', ''));
  if (!file.startsWith(`${output}/`) || !statSync(file, { throwIfNoEntry: false })?.isFile()) {
    errors.push(`Static asset is missing or unsafe: ${asset}`);
  }
}

const js = readdirSync(join(output, 'assets'))
  .filter((name) => name.endsWith('.js'))
  .map((name) => readFileSync(join(output, 'assets', name), 'utf8'))
  .join('\n');
if (!js.includes('FUTURE PRODUCT VISUALIZATION')) {
  errors.push('Static output is missing the future-product visualization.');
}
if (js.includes('/api/') || js.includes('@cf/') || js.includes('serviceWorker')) {
  errors.push('Static wireframe must not include API, model, or service-worker behavior.');
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Vision-only static build verified (${assets.length} local asset links).`);
}
