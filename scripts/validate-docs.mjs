import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const required = [
  'GOAL.md',
  'PLAN.md',
  'STATE.md',
  'CHECKLIST.md',
  'SESSION_LOG.md',
  'README.md',
  'LICENSE',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'docs/architecture/system-overview.md',
  'docs/architecture/decisions.md',
  'docs/engineering/davdeploy-lessons.md',
  'docs/research/technical-validation.md',
  'docs/research/existing-solutions.md',
  'docs/governance/community-authority.md',
  'docs/governance/consent-and-benefit-sharing.md',
  'docs/security/threat-model.md',
  'docs/security/privacy-limitations.md',
  'docs/demo/reviewer-guide.md',
  'docs/demo/video-script.md',
  'docs/fellowship/rfp-alignment.md',
  'docs/fellowship/12-month-roadmap.md',
  'docs/fellowship/evidence-links.md',
  'docs/fellowship/project-status.md',
];

const errors = [];
for (const file of required) {
  if (!existsSync(join(root, file))) errors.push(`Missing required file: ${file}`);
}

function markdownFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return extname(entry.name).toLowerCase() === '.md' ? [path] : [];
  });
}

const markdown = [join(root, 'README.md'), ...markdownFiles(join(root, 'docs'))];
for (const file of markdown) {
  const source = readFileSync(file, 'utf8');
  for (const [, target] of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const cleanTarget = target.trim().replace(/^<|>$/g, '').split('#', 1)[0];
    if (!cleanTarget || /^(?:[a-z]+:|\/\/|\/)/i.test(cleanTarget)) continue;
    const resolved = resolve(file.slice(0, file.lastIndexOf('/')), decodeURIComponent(cleanTarget));
    if (!existsSync(resolved)) {
      errors.push(`${file.slice(root.length + 1)} links to missing ${cleanTarget}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Documentation structure and local links verified (${markdown.length} Markdown files).`,
  );
}
