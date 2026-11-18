/* global document */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const baseUrl =
  process.env.MINDCOMMONS_DEMO_URL ?? 'https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/';
const target = new URL(baseUrl);
assert.equal(target.protocol, 'https:', 'the recording must use HTTPS');
assert.equal(
  target.hostname,
  'mindcommons-mozilla-demo.bepoadewale1.workers.dev',
  'refusing to record an unexpected host',
);

const outputDirectory =
  process.env.MINDCOMMONS_VIDEO_DIR ?? '/private/tmp/mindcommons-reviewer-video';
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
  acceptDownloads: true,
  recordVideo: { dir: outputDirectory, size: { width: 1920, height: 1080 } },
});
const page = await context.newPage();
const pageErrors = [];
const researchSubmissions = [];
page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('request', (request) => {
  if (request.url().endsWith('/api/research/run') && request.method() === 'POST') {
    researchSubmissions.push(request);
  }
});
const pause = (milliseconds) => page.waitForTimeout(milliseconds);

async function caption(text, duration = 4500) {
  await page.evaluate((message) => {
    let element = document.querySelector('#mindcommons-video-caption');
    if (!element) {
      element = document.createElement('div');
      element.id = 'mindcommons-video-caption';
      Object.assign(element.style, {
        position: 'fixed',
        zIndex: '2147483647',
        left: '50%',
        bottom: '34px',
        transform: 'translateX(-50%)',
        width: 'min(1400px, 78vw)',
        padding: '22px 32px',
        border: '1px solid rgba(255, 255, 255, .25)',
        borderRadius: '16px',
        background: 'rgba(16, 29, 39, .96)',
        boxShadow: '0 12px 42px rgba(12, 20, 27, .35)',
        color: '#fff',
        font: '600 30px/1.35 system-ui, sans-serif',
        textAlign: 'center',
        letterSpacing: '.01em',
      });
      document.body.append(element);
    }
    element.textContent = message;
  }, text);
  await pause(duration);
}

async function selectRole(role, label) {
  await page.getByLabel('Acting as').selectOption(role);
  await page.getByText(`Demo seat changed to ${label}. This is a fictional role.`).waitFor();
}

function htmlEscape(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

try {
  const landing = await page.goto(target.href, { waitUntil: 'domcontentloaded' });
  assert.equal(landing?.status(), 200, 'live site must open without authentication');
  await page.locator('html').evaluate((root) => {
    root.style.zoom = '1.2';
  });
  await page
    .getByRole('heading', {
      name: /communities should shape how their contributions are used in AI/i,
    })
    .waitFor();
  await caption('Community contributions should come with a continuing say in AI research.', 5000);
  await caption(
    'MindCommons is an independent technical prototype. Every person and record in this demo is fictional.',
  );

  await page.getByRole('link', { name: /Try the synthetic scenario/ }).click();
  await page.getByText('Fictional community scenario').waitFor();
  await page.getByRole('heading', { name: 'Riverbend Community (fictional)' }).waitFor();
  await caption('First, inspect the community rule and each person’s separate permission.');

  await selectRole('researcher', 'Researcher');
  const preview = page.locator('.authorization-preview');
  await preview.getByText(/would allow the request/i).waitFor();
  await preview.getByText(/PREVIEW ONLY · NO MODEL CALL/i).waitFor();
  await caption('This preview applies the shared agreement rules. It makes no model call.');

  await selectRole('community_member', 'Community member');
  await page.getByRole('button', { name: 'Withdraw Fictional contributor B permission' }).click();
  await page.getByText('WITHDRAWN · v2').waitFor();
  await selectRole('researcher', 'Researcher');
  await preview.getByText(/response-b \(individual permission not active\)/i).waitFor();
  await caption(
    'Withdrawing one person’s permission removes that person’s fictional contribution.',
  );

  await selectRole('community_member', 'Community member');
  await page.getByRole('button', { name: 'Grant Fictional contributor B permission' }).click();
  await selectRole('community_representative', 'Community representative');
  await page.getByRole('button', { name: 'Approve policy' }).click();
  await page.getByText('The proposal is active as a new synthetic policy version.').waitFor();
  await page.getByText('ACTIVE · V2').waitFor();
  await selectRole('researcher', 'Researcher');
  await preview.getByText(/required benefit not agreed/i).waitFor();
  await caption(
    'The approved policy also requires community agreement and research-team acceptance of a shared-results commitment.',
    5500,
  );

  const deniedResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/research/run') && response.request().method() === 'POST',
    { timeout: 30000 },
  );
  await page.getByRole('button', { name: /Check rules and run evaluation/ }).click();
  const deniedResponse = await deniedResponsePromise;
  assert.equal(deniedResponse.status(), 403, 'missing benefit terms must block the request');
  const denied = await deniedResponse.json();
  assert.equal(denied.status, 'denied');
  assert.equal(denied.decision.reasons.includes('required-benefit-not-agreed'), true);
  assert.equal(researchSubmissions.length, 1, 'only the explicitly denied request is submitted');
  const receiptResponse = await page.request.get(
    new URL(`/api/research/receipt?runId=${encodeURIComponent(denied.runId)}`, target).href,
  );
  assert.equal(receiptResponse.status(), 200, 'the same synthetic session must read its receipt');
  const receipt = await receiptResponse.json();
  assert.equal(receipt.authorization.outcome, 'denied');
  assert.equal(receipt.execution.inferenceAttempted, false);
  assert.equal(receipt.execution.outputReleased, false);
  assert.equal(receipt.execution.inferenceMode, null);
  const otherContext = await browser.newContext();
  const otherPage = await otherContext.newPage();
  await otherPage.goto(target.href, { waitUntil: 'domcontentloaded' });
  const otherSession = await otherPage.request.get(new URL('/api/demo', target).href);
  assert.equal(otherSession.status(), 200, 'the second visitor must receive its own session');
  const crossSessionReceipt = await otherPage.request.get(
    new URL(`/api/research/receipt?runId=${encodeURIComponent(denied.runId)}`, target).href,
  );
  assert.equal(crossSessionReceipt.status(), 404, 'a second session must not read the receipt');
  await otherContext.close();
  // Reload so the app displays the persisted run and its receipt link from /api/demo.
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByText('Fictional community scenario').waitFor();
  const receiptLink = page.getByRole('link', { name: /Download this session’s decision receipt/ });
  await receiptLink.waitFor();
  assert.match(await receiptLink.getAttribute('href'), /\/api\/research\/receipt\?runId=/);
  await caption(
    'The server denies the request before inference and offers a session-only JSON receipt.',
  );

  await selectRole('community_representative', 'Community representative');
  await page.getByRole('button', { name: 'Agree to commitment' }).click();
  await selectRole('researcher', 'Researcher');
  await page.getByRole('button', { name: 'Accept as fictional research team' }).click();
  await preview.getByText(/would allow the request/i).waitFor();
  await caption(
    'After the fictional team accepts, the same rules preview changes to eligible. No AI job is run.',
    5500,
  );

  const receiptPath = `${outputDirectory}/decision-receipt.json`;
  const receiptText = JSON.stringify(receipt, null, 2);
  await writeFile(receiptPath, receiptText, { mode: 0o600 });
  const receiptViewerPath = `${outputDirectory}/decision-receipt-view.html`;
  await writeFile(
    receiptViewerPath,
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>MindCommons decision receipt</title><style>body{margin:0;padding:56px;background:#f4f3ee;color:#142a32;font:16px/1.55 system-ui,sans-serif}main{max-width:1180px;margin:auto}p{color:#51646a}pre{overflow:auto;padding:28px;border-radius:16px;background:#142a32;color:#e8f2ef;font:16px/1.5 ui-monospace,monospace}</style><main><p>EXPORTED FROM THE LIVE SYNTHETIC SESSION</p><h1>Decision receipt</h1><p>This is the JSON receipt returned by the session-scoped API. It contains no raw research narrative or model output.</p><pre>${htmlEscape(receiptText)}</pre></main></html>`,
    { mode: 0o600 },
  );
  await caption(
    'The receipt records the denied outcome and says inference was not attempted.',
    4500,
  );
  await page.goto(`file://${receiptViewerPath}`, { waitUntil: 'load' });
  await page.getByRole('heading', { name: 'Decision receipt' }).waitFor();
  await caption(
    'Receipt data is scoped to this synthetic session and omits the model output.',
    5000,
  );
  await pause(3500);

  const vision = await page.goto('https://bepoadewale.github.io/mindcommons/', {
    waitUntil: 'domcontentloaded',
  });
  assert.equal(vision?.status(), 200, 'the public future-vision fallback must open');
  await caption(
    'The future roadmap is proposed work for genuine community co-design, not completed validation.',
  );
  const repository = await page.goto('https://github.com/Bepoadewale/mindcommons', {
    waitUntil: 'domcontentloaded',
  });
  assert.equal(repository?.status(), 200, 'the public source repository must open');
  assert.match((await page.locator('body').innerText()).toLowerCase(), /bepoadewale\/mindcommons/);
  await caption(
    'Open-source code, evidence and limitations are available for independent review.',
    10000,
  );
  assert.deepEqual(pageErrors, [], `browser errors: ${pageErrors.join('; ')}`);

  const recording = page.video();
  await context.close();
  const recordingPath = await recording?.path();
  assert.ok(recordingPath, 'Playwright should produce an actual browser recording');
  console.log(
    JSON.stringify({
      url: target.href,
      recording: recordingPath,
      receipt: receiptPath,
      benefitGateStatus: deniedResponse.status(),
      denialReason: 'required-benefit-not-agreed',
      inferenceAttempted: receipt.execution.inferenceAttempted,
      outputReleased: receipt.execution.outputReleased,
      requestSubmissions: researchSubmissions.length,
      publicVisionStatus: vision?.status(),
      publicRepositoryStatus: repository?.status(),
      browserErrors: pageErrors.length,
    }),
  );
} finally {
  await context.close().catch(() => undefined);
  await browser.close();
}
