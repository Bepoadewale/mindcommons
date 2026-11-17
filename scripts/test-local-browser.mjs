import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const base = 'http://127.0.0.1:8790';
const server = spawn(
  process.execPath,
  [
    'node_modules/wrangler/bin/wrangler.js',
    'dev',
    '--local',
    '--ip',
    '127.0.0.1',
    '--port',
    '8790',
    '--var',
    'DEMO_AI_MODE:mock',
    '--var',
    'LOCAL_DEVELOPMENT:true',
  ],
  {
    cwd: process.cwd(),
    stdio: ['ignore', 'ignore', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '0' },
    detached: process.platform !== 'win32',
  },
);

async function stopServer() {
  if (server.exitCode !== null || server.signalCode !== null) return;
  const waitForExit = (milliseconds) =>
    new Promise((resolve) => {
      if (server.exitCode !== null || server.signalCode !== null) return resolve(true);
      const timer = setTimeout(() => {
        server.removeListener('exit', onExit);
        resolve(false);
      }, milliseconds);
      const onExit = () => {
        clearTimeout(timer);
        resolve(true);
      };
      server.once('exit', onExit);
    });
  try {
    process.kill(process.platform === 'win32' ? server.pid : -server.pid, 'SIGTERM');
  } catch {
    server.kill('SIGTERM');
  }
  if (await waitForExit(5000)) return;
  try {
    process.kill(process.platform === 'win32' ? server.pid : -server.pid, 'SIGKILL');
  } catch {
    server.kill('SIGKILL');
  }
  await waitForExit(2000);
}
let stderr = '';
server.stderr.setEncoding('utf8');
server.stderr.on('data', (chunk) => {
  stderr = (stderr + chunk).slice(-3000);
});

async function waitUntilReady() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Local Worker process exited: ${stderr}`);
    try {
      if ((await fetch(base)).status === 200) return;
    } catch {
      /* The local runtime is still starting. */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Local Worker application did not become ready: ${stderr}`);
}

let browser;
try {
  await waitUntilReady();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  await page.addInitScript({ path: 'node_modules/axe-core/axe.min.js' });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(base);
  await page
    .getByRole('heading', {
      name: /communities should shape how their contributions are used in AI/i,
    })
    .waitFor();
  const checkAccessibility = async () => {
    const violations = await page.evaluate(async () =>
      globalThis.axe.run(globalThis.document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      }),
    );
    const targets = violations.violations.map(({ id, nodes }) => ({
      id,
      targets: nodes.map(({ target }) => target),
    }));
    assert.deepEqual(
      violations.violations.map(({ id, impact }) => ({ id, impact })),
      [],
      `accessibility violations: ${JSON.stringify(targets)}`,
    );
  };
  await checkAccessibility();
  await page.getByLabel('Acting as').selectOption('researcher');
  await page.getByRole('button', { name: /check rules and run evaluation/i }).click();
  await page.locator('.result-heading strong').waitFor();
  await page.locator('.result-heading strong').filter({ hasText: 'completed' }).waitFor();
  await page.getByText(/no AI inference occurred/i).waitFor();

  await page.getByLabel('Requested purpose').selectOption('commercial-advertising');
  await page.getByRole('button', { name: /check rules and run evaluation/i }).click();
  await page.locator('.result-heading strong').filter({ hasText: 'denied' }).waitFor();
  await page.getByText(/community-policy-prohibits-commercial-use/i).waitFor();

  await page.getByLabel('Acting as').selectOption('community_member');
  await page.getByRole('button', { name: /Withdraw Fictional contributor B permission/i }).click();
  await page.getByLabel('Acting as').selectOption('researcher');
  await page.getByLabel('Requested purpose').selectOption('community-wellbeing-research');
  await page.getByRole('button', { name: /check rules and run evaluation/i }).click();
  await page.locator('.result-heading strong').filter({ hasText: 'completed' }).waitFor();
  await page.getByText(/Processed records: response-a, response-c/).waitFor();
  await page.getByText(/response-b \(individual-permission-not-active\)/).waitFor();

  await page.getByLabel('Acting as').selectOption('community_representative');
  await page.getByRole('button', { name: 'Approve policy' }).click();
  await page.getByText('ACTIVE · V2').waitFor();
  await page.getByLabel('Acting as').selectOption('researcher');
  await page.getByRole('button', { name: /check rules and run evaluation/i }).click();
  await page.locator('.result-heading strong').filter({ hasText: 'denied' }).waitFor();
  await page
    .getByText(/community-policy-requires-all-contributors-to-have-active-permission/i)
    .waitFor();
  await page.getByLabel('Acting as').selectOption('community_representative');
  await page.getByRole('button', { name: 'Agree to commitment' }).click();
  await page.getByText('Agreed by demo:community_representative').waitFor();
  await page.getByLabel('Acting as').selectOption('researcher');
  await page.getByRole('button', { name: 'Accept as fictional research team' }).click();
  await page.getByRole('button', { name: 'Submit fictional evidence' }).click();
  await page.getByText(/Synthetic evidence: an accessible summary draft was prepared/i).waitFor();
  await page.getByLabel('Acting as').selectOption('community_representative');
  await page.getByRole('button', { name: 'Accept evidence marker' }).click();
  await page.getByText('accepted by demo:community_representative').waitFor();

  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) await navigator.serviceWorker.ready;
  });
  await page.reload();
  assert.equal(
    await page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    true,
    'the active service worker should control the reviewer page after reload',
  );
  const apiWasCached = await page.evaluate(
    async () => (await globalThis.caches.match('/api/demo')) !== undefined,
  );
  assert.equal(apiWasCached, false, 'the service worker must not cache API responses');
  const browserStorage = await page.evaluate(() => ({
    local: localStorage.length,
    session: sessionStorage.length,
  }));
  assert.deepEqual(
    browserStorage,
    { local: 0, session: 0 },
    'the demo must not persist session data in browser storage',
  );

  await page.goto(`${base}/vision/`);
  await page.locator('.vision-hero h1').waitFor();
  assert.match(await page.locator('.vision-hero h1').innerText(), /A commons takes/);
  await checkAccessibility();
  await page.goto(`${base}/offline.html`);
  await page
    .getByRole('heading', { name: /The public guide is available\. The demo needs a connection/i })
    .waitFor();
  assert.deepEqual(pageErrors, [], `browser errors: ${pageErrors.join('; ')}`);
  console.log(
    'Full-stack browser acceptance passed against the local Worker + D1. AI used a labeled mock; no live model call was made.',
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await browser?.close();
  await stopServer();
}
