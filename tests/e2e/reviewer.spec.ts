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
    withdrawalMode: 'exclude-withdrawn',
    requiredBenefitObligationIds: [],
  },
  proposal: {
    proposal_id: 'proposal-v2',
    status: 'reviewed',
    title: 'Require every contributor to permit the research request',
    proposed_purpose: 'community-wellbeing-research',
    proposedCommercialAllowed: false,
    withdrawalMode: 'require-all',
    requiredBenefitObligationIds: ['benefit-findings'],
  },
  contributions: ['a', 'b', 'c'].map((letter) => ({
    contributionId: `response-${letter}`,
    contributorId: `contributor-${letter}`,
    purpose: 'community-wellbeing-research',
  })),
  permissions: ['a', 'b', 'c'].map((letter) => ({
    permission_id: `contributor-${letter}:community-wellbeing-research`,
    purpose: 'community-wellbeing-research',
    status: 'granted',
    expires_at: '2026-11-30T12:00:00.000Z',
    version: 1,
  })),
  permissionHistory: ['a', 'b', 'c'].map((letter) => ({
    permission_id: `contributor-${letter}:community-wellbeing-research`,
    version: 1,
    purpose: 'community-wellbeing-research',
    status: 'granted',
    expires_at: '2026-11-30T12:00:00.000Z',
    action: 'created',
    actor: 'demo-service',
    correlation_id: `fixture-correlation-${letter}`,
    recorded_at: '2026-11-16T12:00:00.000Z',
  })),
  benefit: {
    title: 'Share an accessible summary of findings',
    owner: 'Fictional research team',
    due_at: '2026-12-16T12:00:00.000Z',
    evidence: null,
    status: 'proposed',
    agreed_at: null,
    agreed_by: null,
    accepted_at: null,
    accepted_by: null,
    review_outcome: null,
    reviewed_at: null,
    reviewed_by: null,
  },
  events: [],
  runs: [],
};

test.beforeEach(async ({ page }) => {
  let role = 'community_representative';
  let permissions = demo.permissions.map((permission) => ({ ...permission }));
  let permissionHistory = [...demo.permissionHistory];
  let benefit = {
    ...demo.benefit,
    evidence: null as string | null,
    agreed_at: null as string | null,
    agreed_by: null as string | null,
    accepted_at: null as string | null,
    accepted_by: null as string | null,
    review_outcome: null as 'accepted' | 'changes-requested' | null,
    reviewed_at: null as string | null,
    reviewed_by: null as string | null,
  };
  await page.route('**/api/demo', async (route) =>
    route.fulfill({ json: { ...demo, demoRole: role, permissions, permissionHistory, benefit } }),
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
    const { action, contributorId } = route.request().postDataJSON() as {
      action: 'grant' | 'withdraw';
      contributorId: string;
    };
    const status = action === 'withdraw' ? 'withdrawn' : 'granted';
    const permissionId = `${contributorId}:community-wellbeing-research`;
    const permission = permissions.find((item) => item.permission_id === permissionId)!;
    const version = permission.version + 1;
    const recordedAt = '2026-11-17T12:00:00.000Z';
    permissions = permissions.map((item) =>
      item.permission_id === permissionId ? { ...item, status, version } : item,
    );
    permissionHistory = [
      {
        ...demo.permissionHistory.find((record) => record.permission_id === permissionId)!,
        status,
        version,
        action: status,
        actor: `demo:${contributorId}`,
        correlation_id: `fixture-correlation-${version}`,
        recorded_at: recordedAt,
      },
      ...permissionHistory,
    ];
    await route.fulfill({
      json: { contributorId, status, version, correlationId: `fixture-correlation-${version}` },
    });
  });
  await page.route('**/api/benefit', async (route) => {
    const body = route.request().postDataJSON() as
      | { action: 'agree' }
      | { action: 'accept' }
      | { action: 'withdraw-acceptance' }
      | { action: 'submit-evidence'; evidence: string }
      | { action: 'review'; outcome: 'accepted' | 'changes-requested' };
    if (body.action === 'agree') {
      benefit = {
        ...benefit,
        agreed_at: '2026-11-17T12:00:00.000Z',
        agreed_by: 'demo:community_representative',
      };
    } else if (body.action === 'accept') {
      benefit = {
        ...benefit,
        accepted_at: '2026-11-17T12:01:00.000Z',
        accepted_by: 'demo:researcher',
        status: 'in_progress',
      };
    } else if (body.action === 'withdraw-acceptance') {
      benefit = {
        ...benefit,
        accepted_at: null,
        accepted_by: null,
        status: 'proposed',
      };
    } else if (body.action === 'submit-evidence') {
      benefit = {
        ...benefit,
        evidence:
          body.evidence === 'accessible-summary-prepared'
            ? 'Synthetic summary draft prepared.'
            : 'Synthetic review scheduled.',
        status: 'in_progress',
        review_outcome: null,
        reviewed_at: null,
        reviewed_by: null,
      };
    } else {
      benefit = {
        ...benefit,
        review_outcome: body.outcome,
        reviewed_at: '2026-11-17T12:02:00.000Z',
        reviewed_by: 'demo:community_representative',
        status: 'reviewed',
      };
    }
    await route.fulfill({ json: { status: benefit.status, synthetic: true } });
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
  const contributorHistory = page.getByRole('region', {
    name: 'Fictional contributor A permission history',
  });
  await expect(
    contributorHistory.getByRole('heading', { name: 'Permission history' }),
  ).toBeVisible();
  await expect(page.getByText('Version 1 · granted').first()).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'View this session’s Community AI Agreement (JSON)' }),
  ).toHaveAttribute('href', '/api/agreement');
  await expect(page.getByRole('link', { name: 'View its JSON Schema' })).toHaveAttribute(
    'href',
    '/api/agreement/schema',
  );
  await expect(page.getByRole('link', { name: 'View the open source' })).toHaveAttribute(
    'href',
    'https://github.com/Bepoadewale/mindcommons',
  );
  await expect(
    page.getByRole('link', { name: 'Watch the captioned project demo' }),
  ).toHaveAttribute('href', '/mindcommons-demo-captioned.mp4');
  await expect(
    page.getByRole('link', { name: 'View the original screen recording' }),
  ).toHaveAttribute('href', '/mindcommons-demo.mp4');
  for (const video of ['/mindcommons-demo-captioned.mp4', '/mindcommons-demo.mp4']) {
    const videoResponse = await page.request.head(new URL(video, page.url()).toString());
    expect(videoResponse.ok()).toBe(true);
    expect(videoResponse.headers()['content-type']).toContain('video/mp4');
  }
});

test('a contributor withdrawal creates a visible history version for that contributor', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Acting as').selectOption('community_member');
  await page.getByRole('button', { name: 'Withdraw Fictional contributor B permission' }).click();
  await expect(page.getByText('Version 2 · withdrawn')).toBeVisible();
  await expect(page.getByText('Recorded by contributor-b')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Grant Fictional contributor B permission' }),
  ).toBeVisible();
});

test('fictional benefit commitment requires agreement, team acceptance, evidence and review', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Agree to commitment' }).click();
  await expect(page.getByText('Agreed by demo:community_representative')).toBeVisible();
  await page.getByLabel('Acting as').selectOption('researcher');
  await page.getByRole('button', { name: 'Accept as fictional research team' }).click();
  await page.getByRole('button', { name: 'Submit fictional evidence' }).click();
  await expect(page.getByText('Synthetic summary draft prepared.')).toBeVisible();
  await page.getByLabel('Acting as').selectOption('community_representative');
  await page.getByRole('button', { name: 'Accept evidence marker' }).click();
  await expect(page.getByText('accepted by demo:community_representative')).toBeVisible();
  await expect(page.getByText('Evidence and review history are fictional records.')).toBeVisible();
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
