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

async function caption(text) {
  await page.evaluate((message) => {
    const doc = globalThis.document;
    let element = doc.querySelector('#mindcommons-video-caption');
    if (!element) {
      element = doc.createElement('div');
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
        background: 'rgba(16, 29, 39, .94)',
        boxShadow: '0 12px 42px rgba(12, 20, 27, .35)',
        color: '#fff',
        font: '600 30px/1.35 system-ui, sans-serif',
        textAlign: 'center',
        letterSpacing: '.01em',
      });
      doc.body.append(element);
    }
    element.textContent = message;
  }, text);
}

async function changeRole(role, label) {
  await page.locator('#demo-role').selectOption(role);
  await page.getByText(`Demo seat changed to ${label}. This is a fictional role.`).waitFor();
}

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
  await caption(
    'Communities can contribute data without a lasting say in how it is used or who benefits.',
  );
  await pause(5000);
  await caption('MindCommons explores community rules before AI research.');
  await pause(4000);

  await page.getByRole('link', { name: /Try the synthetic scenario/ }).click();
  await page.getByRole('heading', { name: 'Riverbend Community (fictional)' }).waitFor();
  await page.getByText('Fictional community scenario').waitFor();
  await caption('A technical prototype using only fictional people and research records.');
  await pause(7000);

  await caption(
    'Community rule v1 excludes a contribution when its individual permission is withdrawn.',
  );
  await pause(5000);
  await changeRole('community_member', 'Community member');
  await page.getByRole('button', { name: 'Withdraw Fictional contributor B permission' }).click();
  await page.getByText('WITHDRAWN · v2').waitFor();
  await caption('Contributor B withdraws. Their fictional record is excluded from the next job.');
  await pause(5000);

  await changeRole('researcher', 'Researcher');
  await page.getByRole('heading', { name: 'Run a bounded theme review' }).scrollIntoViewIfNeeded();
  await caption('A fixed research job checks every contributor before sending eligible records.');
  const allowedRunResponse = page.waitForResponse(
    (item) => item.url().endsWith('/api/research/run') && item.request().method() === 'POST',
    { timeout: 60000 },
  );
  await page.getByRole('button', { name: /Check rules and run evaluation/ }).click();
  const allowedRun = await allowedRunResponse;
  assert.equal(allowedRun.status(), 200, 'the partially permitted research request must succeed');
  const allowedPayload = await allowedRun.json();
  assert.equal(
    allowedPayload.inferenceMode,
    'live',
    'the approved request must use live inference',
  );
  assert.deepEqual(allowedPayload.inputContributionIds, ['response-a', 'response-c']);
  await page.getByText('Inference ran with Cloudflare Workers AI. Inputs were synthetic.').waitFor({
    timeout: 60000,
  });
  await page.getByText('Processed records: response-a, response-c.').waitFor();
  await page.getByText('@cf/google/gemma-4-26b-a4b-it', { exact: true }).waitFor();
  await caption('Live inference ran on records A and C; the withdrawn record was not sent.');
  await pause(10000);

  await changeRole('community_representative', 'Community representative');
  await page
    .getByRole('heading', { name: 'Research with a clear purpose' })
    .scrollIntoViewIfNeeded();
  await caption('The fictional representative approves policy v2: every contributor must agree.');
  await page.getByRole('button', { name: 'Approve policy' }).click();
  await page.getByText('The proposal is active as a new synthetic policy version.').waitFor();
  await page.getByText('ACTIVE · V2').waitFor();
  await pause(7000);

  await changeRole('researcher', 'Researcher');
  await page.getByRole('heading', { name: 'Run a bounded theme review' }).scrollIntoViewIfNeeded();
  await caption('The same request is now denied before inference because contributor B withdrew.');
  const deniedRunResponse = page.waitForResponse(
    (item) => item.url().endsWith('/api/research/run') && item.request().method() === 'POST',
    { timeout: 60000 },
  );
  await page.getByRole('button', { name: /Check rules and run evaluation/ }).click();
  const deniedRun = await deniedRunResponse;
  assert.equal(deniedRun.status(), 403, 'the same request must be blocked under policy v2');
  const deniedPayload = await deniedRun.json();
  assert.equal(deniedPayload.status, 'denied');
  assert.equal(
    deniedPayload.decision.reasons.includes(
      'community-policy-requires-all-contributors-to-have-active-permission',
    ),
    true,
  );
  await page
    .getByText(/community-policy-requires-all-contributors-to-have-active-permission/)
    .waitFor();
  await caption('Server-side authorization blocks the job; no model call is made.');
  await pause(7000);

  await page
    .getByRole('heading', { name: 'Share an accessible summary of findings' })
    .scrollIntoViewIfNeeded();
  await changeRole('community_representative', 'Community representative');
  await caption(
    'Tracks a proposed benefit: shared findings, an accountable owner, evidence and community review.',
  );
  await page.getByRole('button', { name: 'Agree to commitment' }).click();
  await page
    .getByText('The fictional representative agreed to this proposed obligation.')
    .waitFor();
  await changeRole('researcher', 'Researcher');
  await page.getByRole('button', { name: 'Accept as fictional research team' }).click();
  await page
    .getByText('The fictional research team accepted responsibility for this commitment.')
    .waitFor();
  await page
    .getByLabel('Choose a fictional evidence marker')
    .selectOption('accessible-summary-prepared');
  await page.getByRole('button', { name: 'Submit fictional evidence' }).click();
  await page.getByText('A fictional research-team evidence marker was recorded.').waitFor();
  await changeRole('community_representative', 'Community representative');
  await page.getByRole('button', { name: 'Accept evidence marker' }).click();
  await page
    .getByText('The fictional community representative accepted the evidence marker.')
    .waitFor();
  await page.getByText('accepted by demo:community_representative').waitFor();
  await pause(7000);

  await page.getByRole('heading', { name: 'Recent activity' }).scrollIntoViewIfNeeded();
  await caption(
    'This prototype is not a pilot or endorsement. Fellowship work would co-design, review and test the rules with communities.',
  );
  await page.getByText(/research authorization denied/).waitFor();
  await pause(5000);

  const dimensions = await page.locator('html').evaluate((root) => ({
    width: root.scrollWidth,
    viewport: root.ownerDocument.defaultView?.innerWidth ?? 0,
  }));
  assert.ok(
    dimensions.width <= dimensions.viewport,
    'recorded app page must not overflow horizontally',
  );

  const repository = await page.goto('https://github.com/Bepoadewale/mindcommons', {
    waitUntil: 'domcontentloaded',
  });
  assert.equal(repository?.status(), 200, 'the public source repository must open');
  assert.match((await page.locator('body').innerText()).toLowerCase(), /bepoadewale\/mindcommons/);
  await caption(
    'Proposed next: co-design, ethics review, and pilot planning with young people, lived-experience advocates and community health workers.',
  );
  await pause(12000);
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
      contributorBWithheld: true,
      policyV2DeniedSameRequest: true,
      fictionalBenefitReview: 'accepted',
      browserErrors: pageErrors.length,
    }),
  );
} finally {
  await context.close().catch(() => undefined);
  await browser.close();
}
