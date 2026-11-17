import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const targetUrl =
  process.env.MINDCOMMONS_DEMO_URL ?? 'https://mindcommons-mozilla-demo.bepoadewale1.workers.dev';
const target = new URL(targetUrl);
assert.equal(target.protocol, 'https:', 'the production recording must use HTTPS');
assert.equal(
  target.hostname,
  'mindcommons-mozilla-demo.bepoadewale1.workers.dev',
  'refusing to record an unexpected host',
);

const outputDirectory = process.env.MINDCOMMONS_VIDEO_DIR ?? '/private/tmp/mindcommons-live-video';
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
  recordVideo: { dir: outputDirectory, size: { width: 1920, height: 1080 } },
});
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));
const pause = (milliseconds) => page.waitForTimeout(milliseconds);

try {
  const response = await page.goto(target.href, { waitUntil: 'domcontentloaded' });
  assert.equal(response?.status(), 200, 'the live site must load successfully');
  await page.locator('html').evaluate((root) => {
    root.style.zoom = '1.25';
  });
  await page
    .getByRole('heading', {
      name: /communities should shape how their contributions are used in AI/i,
    })
    .waitFor();
  await pause(10000);

  await page.getByRole('link', { name: /Explore the demo/ }).click();
  await page.getByRole('heading', { name: 'Riverbend Community (fictional)' }).waitFor();
  await page.getByText('Fictional community scenario').waitFor();
  await pause(12000);

  await page.getByRole('button', { name: 'Approve policy' }).click();
  await page.getByText('The proposal is active as a new synthetic policy version.').waitFor();
  await pause(12000);

  await page.getByLabel('Acting as').selectOption('researcher');
  await page.getByText('Demo seat changed to Researcher. This is a fictional role.').waitFor();
  await page.locator('#request-purpose').selectOption('community-wellbeing-research');
  await pause(8000);

  const allowedRunResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/research/run') && response.request().method() === 'POST',
    { timeout: 60000 },
  );
  await page.getByRole('button', { name: /Check rules and run evaluation/ }).click();
  const allowedRun = await allowedRunResponse;
  assert.equal(allowedRun.status(), 200, 'the permitted research request must succeed');
  const allowedPayload = await allowedRun.json();
  const modelAnswer = allowedPayload.output?.choices?.[0]?.message?.content;
  assert.equal(
    typeof modelAnswer === 'string' && modelAnswer.trim().length > 0,
    true,
    'the live inference must produce visible user-facing output',
  );
  await page.getByText('Inference ran with Cloudflare Workers AI. Inputs were synthetic.').waitFor({
    timeout: 60000,
  });
  await page.getByText('@cf/google/gemma-4-26b-a4b-it', { exact: true }).waitFor();
  await pause(14000);

  await page.locator('#request-purpose').selectOption('commercial-advertising');
  await page.getByRole('button', { name: /Check rules and run evaluation/ }).click();
  await page.getByText(/community-policy-prohibits-commercial-use/).waitFor();
  await pause(12000);

  // The app loads the audit feed on entry; refresh it after the denied run so
  // the recording shows the server-recorded decision as well as the response.
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Riverbend Community (fictional)' }).waitFor();

  await page
    .getByRole('heading', { name: 'Share an accessible summary of findings' })
    .scrollIntoViewIfNeeded();
  await pause(9000);
  await page.getByRole('heading', { name: 'Recent activity' }).scrollIntoViewIfNeeded();
  await page.getByText(/research authorization denied/).waitFor();
  await pause(10000);

  const dimensions = await page.locator('html').evaluate((root) => ({
    width: root.scrollWidth,
    viewport: root.ownerDocument.defaultView?.innerWidth ?? 0,
  }));
  assert.ok(
    dimensions.width <= dimensions.viewport,
    'recorded page must not overflow horizontally',
  );
  assert.deepEqual(pageErrors, [], `browser errors: ${pageErrors.join('; ')}`);
  const video = page.video();
  await context.close();
  const videoPath = await video?.path();
  assert.ok(videoPath, 'Playwright should produce a real browser recording');
  console.log(
    JSON.stringify({
      url: target.href,
      recording: videoPath,
      viewport: dimensions,
      actualWorkersAiInference: true,
      prohibitedRequestDenied: true,
      browserErrors: pageErrors.length,
    }),
  );
} finally {
  await context.close().catch(() => undefined);
  await browser.close();
}
