import { expect, test } from '@playwright/test';

const demo = {
  community: {
    id: 'demo-community',
    name: 'Riverbend Community (fictional)',
    location: 'Nigeria (scenario only)',
  },
  synthetic: true,
  demoRole: 'community_representative',
  availableRoles: ['community_representative', 'researcher', 'community_member'],
  expiresAt: '2026-11-16T23:00:00.000Z',
  policy: {
    version: 1,
    status: 'active',
    allowed_purpose: 'community-wellbeing-research',
    commercialAllowed: false,
  },
  proposal: {
    proposal_id: 'proposal-v2',
    status: 'reviewed',
    title: 'Keep community wellbeing research in scope',
    proposed_purpose: 'community-wellbeing-research',
    proposedCommercialAllowed: false,
  },
  permission: {
    purpose: 'community-wellbeing-research',
    status: 'granted',
    expires_at: '2026-11-30T12:00:00.000Z',
    version: 1,
  },
  permissionHistory: [
    {
      permission_id: 'participant-a',
      version: 1,
      purpose: 'community-wellbeing-research',
      status: 'granted',
      expires_at: '2026-11-30T12:00:00.000Z',
      action: 'created',
      actor: 'demo-service',
      correlation_id: 'fixture-correlation-1',
      recorded_at: '2026-11-16T12:00:00.000Z',
    },
  ],
  benefit: {
    title: 'Share an accessible summary of findings',
    owner: 'Fictional research team',
    due_at: '2026-12-16T12:00:00.000Z',
    evidence: null,
    status: 'proposed',
  },
  events: [],
  runs: [],
};

test.beforeEach(async ({ page }) => {
  let role = 'community_representative';
  let permission = { ...demo.permission };
  let permissionHistory = [...demo.permissionHistory];
  await page.route('**/api/demo', async (route) =>
    route.fulfill({ json: { ...demo, demoRole: role, permission, permissionHistory } }),
  );
  await page.route('**/api/role', async (route) => {
    role = route.request().postDataJSON().role;
    await route.fulfill({ json: { role, synthetic: true } });
  });
  await page.route('**/api/policy/decision', async (route) =>
    route.fulfill({
      status: role === 'community_representative' ? 200 : 403,
      json: { proposalStatus: 'approved', policyVersion: 2 },
    }),
  );
  await page.route('**/api/consent', async (route) => {
    const action = route.request().postDataJSON().action as 'grant' | 'withdraw';
    const status = action === 'withdraw' ? 'withdrawn' : 'granted';
    const version = permission.version + 1;
    const recordedAt = '2026-11-17T12:00:00.000Z';
    permission = { ...permission, status, version };
    permissionHistory = [
      {
        ...demo.permissionHistory[0],
        status,
        version,
        action: status,
        actor: 'demo:community_member',
        correlation_id: `fixture-correlation-${version}`,
        recorded_at: recordedAt,
      },
      ...permissionHistory,
    ];
    await route.fulfill({
      json: { status, version, correlationId: `fixture-correlation-${version}` },
    });
  });
});

test('public reviewer can understand the scenario and see separate rule and permission records', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', {
      name: /communities should shape how their contributions are used in AI/i,
    }),
  ).toBeVisible();
  await expect(page.getByText('Fictional community scenario')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A separate say for each person' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approve policy' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Permission history' })).toBeVisible();
  await expect(page.getByText('Version 1 · granted')).toBeVisible();
  await expect(page.getByRole('link', { name: 'View the open source' })).toHaveAttribute(
    'href',
    'https://github.com/Bepoadewale/mindcommons',
  );
  await expect(page.getByRole('link', { name: 'Watch the project demo' })).toHaveAttribute(
    'href',
    '/mindcommons-demo.mp4',
  );
  const videoResponse = await page.request.head(
    new URL('/mindcommons-demo.mp4', page.url()).toString(),
  );
  expect(videoResponse.ok()).toBe(true);
  expect(videoResponse.headers()['content-type']).toContain('video/mp4');
});

test('permission withdrawal creates a visible new history version', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Acting as').selectOption('community_member');
  await page.getByRole('button', { name: 'Withdraw permission' }).click();
  await expect(page.getByText('Version 2 · withdrawn')).toBeVisible();
  await expect(page.getByText('Recorded by community_member')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Grant permission' })).toBeVisible();
});

test('proposed future screens are labeled by implementation stage', async ({ page }) => {
  await page.goto('/vision');
  await expect(
    page.getByRole('heading', { name: /A commons takes more than a screen/i }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Community onboarding' })).toBeVisible();
  await expect(page.getByText('PROPOSED').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Model activity' })).toBeVisible();
});

test('mobile reviewer view has no horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Explore the demo' })).toBeVisible();
  const widths = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.viewport);
});

test('role selection reveals only the matching demo action', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Acting as').selectOption('researcher');
  await expect(page.getByRole('button', { name: 'Check rules and run evaluation' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approve policy' })).toHaveCount(0);
});
