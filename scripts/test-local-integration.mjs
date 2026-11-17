import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';

const base = 'http://127.0.0.1:8789';
const server = spawn(
  process.execPath,
  [
    'node_modules/wrangler/bin/wrangler.js',
    'dev',
    '--local',
    '--ip',
    '127.0.0.1',
    '--port',
    '8789',
    '--var',
    'DEMO_AI_MODE:mock-delay',
    '--var',
    'LOCAL_DEVELOPMENT:true',
  ],
  {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
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
const inferenceStartWaiters = [];
server.stderr.setEncoding('utf8');
const captureServerOutput = (chunk) => {
  stderr = (stderr + chunk).slice(-3000);
  if (chunk.includes('LOCAL_MOCK_INFERENCE_STARTED')) {
    inferenceStartWaiters.shift()?.();
  }
};
server.stdout.setEncoding('utf8');
server.stdout.on('data', captureServerOutput);
server.stderr.on('data', captureServerOutput);

function waitForMockInferenceStart() {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const index = inferenceStartWaiters.indexOf(onStarted);
      if (index >= 0) inferenceStartWaiters.splice(index, 1);
      reject(new Error(`Local mock inference did not signal its start: ${stderr}`));
    }, 8000);
    const onStarted = () => {
      clearTimeout(timer);
      resolve();
    };
    inferenceStartWaiters.push(onStarted);
  });
}

async function waitUntilReady() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Local Worker process exited: ${stderr}`);
    try {
      const response = await fetch(`${base}/api/demo`);
      if (response.status === 200) return response;
    } catch {
      /* The local runtime is still starting. */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Local Worker API did not become ready: ${stderr}`);
}

function cookieFrom(response) {
  const cookie = response.headers.get('set-cookie')?.split(';', 1)[0];
  assert.ok(cookie, 'the API should issue an HttpOnly demo-session cookie');
  assert.match(response.headers.get('set-cookie') ?? '', /HttpOnly/);
  return cookie;
}

async function api(path, { method = 'GET', cookie, body } = {}) {
  const headers = { Origin: base };
  if (cookie) headers.Cookie = cookie;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return fetch(`${base}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
}

async function expectJson(response, status) {
  const body = await response.json();
  assert.equal(
    response.status,
    status,
    `expected HTTP ${status}, received ${response.status}: ${JSON.stringify(body)}`,
  );
  return body;
}

function executeLocalSql(command) {
  const result = spawnSync(
    process.execPath,
    [
      'node_modules/wrangler/bin/wrangler.js',
      'd1',
      'execute',
      'mindcommons-demo-d1',
      '--local',
      '--command',
      command,
    ],
    { cwd: process.cwd(), encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '0' } },
  );
  assert.equal(result.status, 0, `local test setup SQL failed: ${result.stderr}`);
}

try {
  executeLocalSql(
    `INSERT INTO demo_limits(day, run_count) VALUES (date('now'), 0) ON CONFLICT(day) DO UPDATE SET run_count = 0`,
  );
  executeLocalSql(
    `INSERT INTO demo_session_limits(day, session_count) VALUES (date('now'), 0) ON CONFLICT(day) DO UPDATE SET session_count = 0`,
  );
  const initialResponse = await waitUntilReady();
  const initialCookie = cookieFrom(initialResponse);
  const initial = await initialResponse.json();
  assert.equal(initial.synthetic, true);
  assert.equal(initial.demoRole, 'community_representative');
  assert.equal(initial.policy.version, 1);
  assert.equal(initial.proposal.status, 'reviewed');
  assert.equal(initial.permissions.length, 3);
  assert.equal(initial.policy.withdrawalMode, 'exclude-withdrawn');
  assert.equal(initial.proposal.withdrawalMode, 'require-all');
  const initialAgreement = await expectJson(
    await api('/api/agreement', { cookie: initialCookie }),
    200,
  );
  assert.equal(initialAgreement.policyVersion, 1);
  assert.equal(initialAgreement.contributions.length, 3);
  assert.equal(
    initialAgreement.contributions[0].permission.purpose,
    'community-wellbeing-research',
  );
  assert.equal(initialAgreement.modelUse.trainingAllowed, false);
  assert.equal(initialAgreement.benefitObligations[0].status, 'proposed');
  const agreementSchema = await expectJson(await api('/api/agreement/schema'), 200);
  assert.equal(agreementSchema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.ok(agreementSchema.oneOf.some((variant) => variant.properties.authorizedResearcherIds));
  assert.deepEqual(
    initial.permissionHistory.map(({ permission_id, version, status, action }) => ({
      permission_id,
      version,
      status,
      action,
    })),
    ['contributor-a', 'contributor-b', 'contributor-c'].map((contributorId) => ({
      permission_id: `${contributorId}:community-wellbeing-research`,
      version: 1,
      status: 'granted',
      action: 'created',
    })),
  );

  await expectJson(
    await api('/api/policy/decision', {
      method: 'POST',
      body: { proposalId: 'proposal-v2', decision: 'approve' },
    }),
    401,
  );

  await expectJson(
    await api('/api/role', { method: 'POST', cookie: initialCookie, body: { role: 'researcher' } }),
    200,
  );
  await expectJson(
    await api('/api/policy/decision', {
      method: 'POST',
      cookie: initialCookie,
      body: { proposalId: 'proposal-v2', decision: 'approve' },
    }),
    403,
  );
  await expectJson(
    await api('/api/benefit', {
      method: 'POST',
      cookie: initialCookie,
      body: { action: 'agree' },
    }),
    403,
  );
  await expectJson(
    await api('/api/research/run', {
      method: 'POST',
      cookie: initialCookie,
      body: {
        purpose: 'community-wellbeing-research',
        jobType: 'theme-classification',
        prompt: 'arbitrary prompt',
      },
    }),
    400,
  );
  await expectJson(
    await api('/api/research/run', {
      method: 'POST',
      cookie: initialCookie,
      body: ' '.repeat(520),
    }),
    413,
  );

  const allowed = await expectJson(
    await api('/api/research/run', {
      method: 'POST',
      cookie: initialCookie,
      body: { purpose: 'community-wellbeing-research', jobType: 'theme-classification' },
    }),
    200,
  );
  assert.equal(allowed.status, 'completed');
  assert.equal(allowed.inferenceMode, 'mock');
  assert.equal(allowed.provider, 'Local deterministic test double');
  assert.equal(allowed.synthetic, true);

  const denied = await expectJson(
    await api('/api/research/run', {
      method: 'POST',
      cookie: initialCookie,
      body: { purpose: 'commercial-advertising', jobType: 'theme-classification' },
    }),
    403,
  );
  assert.equal(denied.status, 'denied');
  assert.ok(denied.decision.reasons.includes('community-policy-prohibits-commercial-use'));

  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: initialCookie,
      body: { role: 'community_member' },
    }),
    200,
  );
  const withdrawnPermission = await expectJson(
    await api('/api/consent', {
      method: 'POST',
      cookie: initialCookie,
      body: { action: 'withdraw', contributorId: 'contributor-b' },
    }),
    200,
  );
  assert.equal(withdrawnPermission.version, 2);
  const afterWithdrawal = await (await api('/api/demo', { cookie: initialCookie })).json();
  assert.equal(
    afterWithdrawal.permissions.find(({ permission_id }) =>
      permission_id.startsWith('contributor-b:'),
    ).status,
    'withdrawn',
  );
  const agreementAfterWithdrawal = await expectJson(
    await api('/api/agreement', { cookie: initialCookie }),
    200,
  );
  assert.equal(
    agreementAfterWithdrawal.contributions.find(
      ({ contributorId }) => contributorId === 'contributor-b',
    ).permission.status,
    'withdrawn',
  );
  assert.deepEqual(
    afterWithdrawal.permissionHistory
      .filter(({ permission_id }) => permission_id.startsWith('contributor-b:'))
      .map(({ version, status, action }) => ({
        version,
        status,
        action,
      })),
    [
      { version: 2, status: 'withdrawn', action: 'withdrawn' },
      { version: 1, status: 'granted', action: 'created' },
    ],
  );
  await expectJson(
    await api('/api/role', { method: 'POST', cookie: initialCookie, body: { role: 'researcher' } }),
    200,
  );
  const partial = await expectJson(
    await api('/api/research/run', {
      method: 'POST',
      cookie: initialCookie,
      body: { purpose: 'community-wellbeing-research', jobType: 'theme-classification' },
    }),
    200,
  );
  assert.deepEqual(partial.inputContributionIds, ['response-a', 'response-c']);
  assert.deepEqual(partial.excludedContributions, [
    {
      contributionId: 'response-b',
      contributorId: 'contributor-b',
      reason: 'individual-permission-not-active',
    },
  ]);

  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: initialCookie,
      body: { role: 'community_representative' },
    }),
    200,
  );
  const approvedDifferentRule = await expectJson(
    await api('/api/policy/decision', {
      method: 'POST',
      cookie: initialCookie,
      body: { proposalId: 'proposal-v2', decision: 'approve' },
    }),
    200,
  );
  assert.equal(approvedDifferentRule.policyVersion, 2);
  const agreementAfterPolicyChange = await expectJson(
    await api('/api/agreement', { cookie: initialCookie }),
    200,
  );
  assert.equal(agreementAfterPolicyChange.withdrawalMode, 'require-all');
  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: initialCookie,
      body: { role: 'researcher' },
    }),
    200,
  );
  const blockedByNewRule = await expectJson(
    await api('/api/research/run', {
      method: 'POST',
      cookie: initialCookie,
      body: { purpose: 'community-wellbeing-research', jobType: 'theme-classification' },
    }),
    403,
  );
  assert.ok(
    blockedByNewRule.decision.reasons.includes(
      'community-policy-requires-all-contributors-to-have-active-permission',
    ),
  );
  assert.deepEqual(blockedByNewRule.decision.eligibleContributionIds, []);

  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: initialCookie,
      body: { role: 'community_member' },
    }),
    200,
  );
  const initialSessionId = initialCookie.slice(initialCookie.indexOf('=') + 1);
  executeLocalSql(
    `UPDATE individual_permissions SET version = 50 WHERE session_id = '${initialSessionId}' AND permission_id = 'contributor-a:community-wellbeing-research'`,
  );
  await expectJson(
    await api('/api/consent', {
      method: 'POST',
      cookie: initialCookie,
      body: { action: 'grant', contributorId: 'contributor-a' },
    }),
    429,
  );

  const secondSessionResponse = await api('/api/demo');
  const secondCookie = cookieFrom(secondSessionResponse);
  assert.notEqual(
    secondCookie,
    initialCookie,
    'new visitors must receive separate session identifiers',
  );
  const secondSession = await secondSessionResponse.json();
  assert.equal(
    secondSession.policy.version,
    1,
    "one visitor must not see another visitor's state changes",
  );
  assert.equal(secondSession.permissions.length, 3);
  assert.ok(secondSession.permissions.every(({ status }) => status === 'granted'));
  assert.deepEqual(
    secondSession.permissionHistory.map(({ permission_id, version, status }) => ({
      permission_id,
      version,
      status,
    })),
    ['contributor-a', 'contributor-b', 'contributor-c'].map((contributorId) => ({
      permission_id: `${contributorId}:community-wellbeing-research`,
      version: 1,
      status: 'granted',
    })),
    "one visitor must not see another visitor's permission history",
  );
  const secondSessionId = secondCookie.slice(secondCookie.indexOf('=') + 1);
  await expectJson(await api(`/api/agreement?sessionId=${secondSessionId}`), 401);
  await expectJson(
    await api('/api/research/run', {
      method: 'POST',
      cookie: secondCookie,
      body: {
        purpose: 'community-wellbeing-research',
        jobType: 'theme-classification',
        sessionId: secondSessionId,
      },
    }),
    400,
  );

  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: secondCookie,
      body: { role: 'researcher' },
    }),
    200,
  );
  const inferenceStarted = waitForMockInferenceStart();
  const inFlightResearch = api('/api/research/run', {
    method: 'POST',
    cookie: secondCookie,
    body: { purpose: 'community-wellbeing-research', jobType: 'theme-classification' },
  });
  await inferenceStarted;
  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: secondCookie,
      body: { role: 'community_member' },
    }),
    200,
  );
  await expectJson(
    await api('/api/consent', {
      method: 'POST',
      cookie: secondCookie,
      body: { action: 'withdraw', contributorId: 'contributor-c' },
    }),
    200,
  );
  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: secondCookie,
      body: { role: 'researcher' },
    }),
    200,
  );
  const concurrentResponse = await inFlightResearch;
  const withheld = await expectJson(concurrentResponse, 409);
  assert.equal(withheld.status, 'withheld');
  assert.equal(withheld.output, undefined);
  assert.match(withheld.message, /result was withheld and was not released/);
  const concurrentState = await (await api('/api/demo', { cookie: secondCookie })).json();
  assert.equal(concurrentState.runs[0].status, 'failed');
  assert.equal(concurrentState.runs[0].output, null);
  assert.ok(
    concurrentState.runs[0].reasons.includes('authorization-changed-before-output-release'),
  );
  assert.ok(concurrentState.events.some((event) => event.action === 'research-result-withheld'));

  const resetResponse = await api('/api/demo', { method: 'DELETE', cookie: initialCookie });
  const reset = await expectJson(resetResponse, 200);
  assert.equal(reset.reset, true);
  const resetCookie = cookieFrom(resetResponse);
  const resetState = await (await api('/api/demo', { cookie: resetCookie })).json();
  assert.equal(resetState.proposal.status, 'reviewed');
  assert.ok(resetState.permissions.every(({ status }) => status === 'granted'));
  assert.deepEqual(
    resetState.permissionHistory.map(({ permission_id, version, status, action }) => ({
      permission_id,
      version,
      status,
      action,
    })),
    ['contributor-a', 'contributor-b', 'contributor-c'].map((contributorId) => ({
      permission_id: `${contributorId}:community-wellbeing-research`,
      version: 1,
      status: 'granted',
      action: 'created',
    })),
  );
  await expectJson(
    await api('/api/benefit', {
      method: 'POST',
      cookie: resetCookie,
      body: { action: 'submit-evidence', evidence: 'participant Alice said ...' },
    }),
    400,
  );
  await expectJson(
    await api('/api/benefit', {
      method: 'POST',
      cookie: resetCookie,
      body: { action: 'accept' },
    }),
    403,
  );
  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: resetCookie,
      body: { role: 'researcher' },
    }),
    200,
  );
  await expectJson(
    await api('/api/benefit', {
      method: 'POST',
      cookie: resetCookie,
      body: { action: 'accept' },
    }),
    409,
  );
  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: resetCookie,
      body: { role: 'community_representative' },
    }),
    200,
  );
  const agreedBenefit = await expectJson(
    await api('/api/benefit', {
      method: 'POST',
      cookie: resetCookie,
      body: { action: 'agree' },
    }),
    200,
  );
  assert.equal(agreedBenefit.status, 'agreed');
  assert.equal(agreedBenefit.action, 'agree');
  const acceptedAgreement = await expectJson(
    await api('/api/agreement', { cookie: resetCookie }),
    200,
  );
  assert.equal(acceptedAgreement.benefitObligations[0].status, 'agreed');
  assert.equal(acceptedAgreement.benefitObligations[0].agreedBy, 'demo:community_representative');
  assert.equal(acceptedAgreement.benefitObligations[0].acceptedByResearchTeam, false);
  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: resetCookie,
      body: { role: 'researcher' },
    }),
    200,
  );
  const acceptedBenefit = await expectJson(
    await api('/api/benefit', {
      method: 'POST',
      cookie: resetCookie,
      body: { action: 'accept' },
    }),
    200,
  );
  assert.equal(acceptedBenefit.status, 'in_progress');
  await expectJson(
    await api('/api/benefit', {
      method: 'POST',
      cookie: resetCookie,
      body: { action: 'submit-evidence', evidence: 'accessible-summary-prepared' },
    }),
    200,
  );
  await expectJson(
    await api('/api/benefit', {
      method: 'POST',
      cookie: resetCookie,
      body: { action: 'submit-evidence', evidence: 'accessible-summary-prepared' },
    }),
    409,
  );
  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: resetCookie,
      body: { role: 'community_representative' },
    }),
    200,
  );
  await expectJson(
    await api('/api/benefit', {
      method: 'POST',
      cookie: resetCookie,
      body: { action: 'review', outcome: 'changes-requested' },
    }),
    200,
  );
  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: resetCookie,
      body: { role: 'researcher' },
    }),
    200,
  );
  await expectJson(
    await api('/api/benefit', {
      method: 'POST',
      cookie: resetCookie,
      body: { action: 'submit-evidence', evidence: 'accessible-summary-prepared' },
    }),
    200,
  );
  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: resetCookie,
      body: { role: 'community_representative' },
    }),
    200,
  );
  await expectJson(
    await api('/api/benefit', {
      method: 'POST',
      cookie: resetCookie,
      body: { action: 'review', outcome: 'accepted' },
    }),
    200,
  );
  const benefitState = await (await api('/api/demo', { cookie: resetCookie })).json();
  assert.equal(benefitState.benefit.status, 'reviewed');
  assert.equal(benefitState.benefit.agreed_by, 'demo:community_representative');
  assert.equal(benefitState.benefit.accepted_by, 'demo:researcher');
  assert.equal(benefitState.benefit.review_outcome, 'accepted');
  assert.equal(benefitState.benefit.reviewed_by, 'demo:community_representative');
  assert.match(benefitState.benefit.evidence, /Synthetic evidence/);
  for (const action of [
    'benefit-commitment-agreed',
    'benefit-accepted-by-research-team',
    'benefit-evidence-submitted',
    'benefit-evidence-community-reviewed',
  ]) {
    assert.ok(
      benefitState.events.some((event) => event.action === action),
      action,
    );
  }
  const reviewedAgreement = await expectJson(
    await api('/api/agreement', { cookie: resetCookie }),
    200,
  );
  assert.equal(reviewedAgreement.benefitObligations[0].status, 'community-reviewed');
  assert.equal(reviewedAgreement.benefitObligations[0].reviewOutcome, 'accepted');
  const activated = await expectJson(
    await api('/api/policy/decision', {
      method: 'POST',
      cookie: resetCookie,
      body: { proposalId: 'proposal-v2', decision: 'approve' },
    }),
    200,
  );
  assert.equal(activated.policyVersion, 2);
  const approvedState = await (await api('/api/demo', { cookie: resetCookie })).json();
  assert.equal(approvedState.policy.version, 2);
  assert.equal(approvedState.proposal.status, 'approved');

  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: secondCookie,
      body: { role: 'community_representative' },
    }),
    200,
  );
  const rejected = await expectJson(
    await api('/api/policy/decision', {
      method: 'POST',
      cookie: secondCookie,
      body: { proposalId: 'proposal-v2', decision: 'reject' },
    }),
    200,
  );
  assert.equal(rejected.proposalStatus, 'rejected');
  const rejectedState = await (await api('/api/demo', { cookie: secondCookie })).json();
  assert.equal(rejectedState.proposal.status, 'rejected');
  assert.equal(rejectedState.policy.version, 1);

  // A separate, synthetic session demonstrates a benefit prerequisite as an
  // authorization rule: no model call before acceptance, then the same request works.
  const benefitGateResponse = await api('/api/demo');
  const benefitGateCookie = cookieFrom(benefitGateResponse);
  await benefitGateResponse.json();
  await expectJson(
    await api('/api/policy/decision', {
      method: 'POST',
      cookie: benefitGateCookie,
      body: { proposalId: 'proposal-v2', decision: 'approve' },
    }),
    200,
  );
  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: benefitGateCookie,
      body: { role: 'researcher' },
    }),
    200,
  );
  const benefitNotAgreed = await expectJson(
    await api('/api/research/run', {
      method: 'POST',
      cookie: benefitGateCookie,
      body: { purpose: 'community-wellbeing-research', jobType: 'theme-classification' },
    }),
    403,
  );
  assert.ok(benefitNotAgreed.decision.reasons.includes('required-benefit-not-agreed'));
  const deniedRunState = await (await api('/api/demo', { cookie: benefitGateCookie })).json();
  assert.equal(deniedRunState.runs[0].status, 'denied');
  assert.equal(deniedRunState.runs[0].model_id, null);
  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: benefitGateCookie,
      body: { role: 'community_representative' },
    }),
    200,
  );
  await expectJson(
    await api('/api/benefit', {
      method: 'POST',
      cookie: benefitGateCookie,
      body: { action: 'agree' },
    }),
    200,
  );
  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: benefitGateCookie,
      body: { role: 'researcher' },
    }),
    200,
  );
  const benefitNotAccepted = await expectJson(
    await api('/api/research/run', {
      method: 'POST',
      cookie: benefitGateCookie,
      body: { purpose: 'community-wellbeing-research', jobType: 'theme-classification' },
    }),
    403,
  );
  assert.ok(benefitNotAccepted.decision.reasons.includes('required-benefit-not-accepted'));
  await expectJson(
    await api('/api/benefit', {
      method: 'POST',
      cookie: benefitGateCookie,
      body: { action: 'accept' },
    }),
    200,
  );
  const benefitAcceptedRequest = await expectJson(
    await api('/api/research/run', {
      method: 'POST',
      cookie: benefitGateCookie,
      body: { purpose: 'community-wellbeing-research', jobType: 'theme-classification' },
    }),
    200,
  );
  assert.equal(benefitAcceptedRequest.status, 'completed');
  assert.deepEqual(benefitAcceptedRequest.inputContributionIds, [
    'response-a',
    'response-b',
    'response-c',
  ]);
  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: benefitGateCookie,
      body: { role: 'community_representative' },
    }),
    200,
  );
  await expectJson(
    await api('/api/benefit', {
      method: 'POST',
      cookie: benefitGateCookie,
      body: { action: 'withdraw-acceptance' },
    }),
    403,
  );
  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: benefitGateCookie,
      body: { role: 'researcher' },
    }),
    200,
  );

  const inFlightWithBenefit = api('/api/research/run', {
    method: 'POST',
    cookie: benefitGateCookie,
    body: { purpose: 'community-wellbeing-research', jobType: 'theme-classification' },
  });
  await waitForMockInferenceStart();
  await expectJson(
    await api('/api/benefit', {
      method: 'POST',
      cookie: benefitGateCookie,
      body: { action: 'withdraw-acceptance' },
    }),
    200,
  );
  const benefitWithheld = await expectJson(await inFlightWithBenefit, 409);
  assert.equal(benefitWithheld.status, 'withheld');
  const benefitWithheldState = await (await api('/api/demo', { cookie: benefitGateCookie })).json();
  assert.equal(benefitWithheldState.runs[0].status, 'failed');
  assert.equal(benefitWithheldState.runs[0].output, null);
  assert.ok(
    benefitWithheldState.runs[0].reasons.includes('authorization-changed-before-output-release'),
  );

  const page = await fetch(`${base}/vision/`);
  assert.equal(page.status, 200, 'the public future-vision route should resolve');
  assert.match(await page.text(), /MindCommons/);

  const resetSessionId = resetCookie.slice(resetCookie.indexOf('=') + 1);
  executeLocalSql(
    `INSERT INTO rate_limits(session_id, minute, request_count)
     VALUES ('${resetSessionId}', strftime('%Y-%m-%dT%H:%M','now'), 60),
            ('${resetSessionId}', strftime('%Y-%m-%dT%H:%M','now','+1 minute'), 60)
     ON CONFLICT(session_id, minute) DO UPDATE SET request_count = 60`,
  );
  await expectJson(await api('/api/demo', { cookie: resetCookie }), 429);

  executeLocalSql(
    `INSERT INTO demo_limits(day, run_count) VALUES (date('now'), 100) ON CONFLICT(day) DO UPDATE SET run_count = 100`,
  );
  await expectJson(
    await api('/api/role', {
      method: 'POST',
      cookie: secondCookie,
      body: { role: 'researcher' },
    }),
    200,
  );
  await expectJson(
    await api('/api/research/run', {
      method: 'POST',
      cookie: secondCookie,
      body: { purpose: 'community-wellbeing-research', jobType: 'theme-classification' },
    }),
    429,
  );
  executeLocalSql(
    `INSERT INTO demo_limits(day, run_count) VALUES (date('now'), 0) ON CONFLICT(day) DO UPDATE SET run_count = 0`,
  );
  executeLocalSql(
    `INSERT INTO demo_session_limits(day, session_count) VALUES (date('now'), 500) ON CONFLICT(day) DO UPDATE SET session_count = 500`,
  );
  await expectJson(await api('/api/demo'), 429);
  executeLocalSql(
    `INSERT INTO demo_session_limits(day, session_count) VALUES (date('now'), 0) ON CONFLICT(day) DO UPDATE SET session_count = 0`,
  );
  console.log(
    'Local Worker + D1 integration passed. Workers AI used the explicitly labeled deterministic mock; no live model call was made.',
  );
} catch (error) {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
} finally {
  await stopServer();
}
