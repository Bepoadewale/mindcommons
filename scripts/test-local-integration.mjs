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
  assert.deepEqual(
    initial.permissionHistory.map(({ version, status, action }) => ({ version, status, action })),
    [{ version: 1, status: 'granted', action: 'created' }],
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
      body: { evidence: 'accessible-summary-prepared' },
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
      body: { action: 'withdraw' },
    }),
    200,
  );
  assert.equal(withdrawnPermission.version, 2);
  const afterWithdrawal = await (await api('/api/demo', { cookie: initialCookie })).json();
  assert.equal(afterWithdrawal.permission.status, 'withdrawn');
  assert.deepEqual(
    afterWithdrawal.permissionHistory.map(({ version, status, action }) => ({
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
  const withdrawn = await expectJson(
    await api('/api/research/run', {
      method: 'POST',
      cookie: initialCookie,
      body: { purpose: 'community-wellbeing-research', jobType: 'theme-classification' },
    }),
    403,
  );
  assert.ok(withdrawn.decision.reasons.includes('individual-permission-not-active'));

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
    `UPDATE individual_permissions SET version = 50 WHERE session_id = '${initialSessionId}' AND permission_id = 'participant-a'`,
  );
  await expectJson(
    await api('/api/consent', {
      method: 'POST',
      cookie: initialCookie,
      body: { action: 'grant' },
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
  assert.equal(secondSession.permission.status, 'granted');
  assert.deepEqual(
    secondSession.permissionHistory.map(({ version, status }) => ({ version, status })),
    [{ version: 1, status: 'granted' }],
    "one visitor must not see another visitor's permission history",
  );

  const resetResponse = await api('/api/demo', { method: 'DELETE', cookie: initialCookie });
  const reset = await expectJson(resetResponse, 200);
  assert.equal(reset.reset, true);
  const resetCookie = cookieFrom(resetResponse);
  const resetState = await (await api('/api/demo', { cookie: resetCookie })).json();
  assert.equal(resetState.proposal.status, 'reviewed');
  assert.equal(resetState.permission.status, 'granted');
  assert.deepEqual(
    resetState.permissionHistory.map(({ version, status, action }) => ({
      version,
      status,
      action,
    })),
    [{ version: 1, status: 'granted', action: 'created' }],
  );
  await expectJson(
    await api('/api/benefit', {
      method: 'POST',
      cookie: resetCookie,
      body: { evidence: 'participant Alice said ...' },
    }),
    400,
  );
  const benefit = await expectJson(
    await api('/api/benefit', {
      method: 'POST',
      cookie: resetCookie,
      body: { evidence: 'accessible-summary-prepared' },
    }),
    200,
  );
  assert.equal(benefit.synthetic, true);
  const benefitState = await (await api('/api/demo', { cookie: resetCookie })).json();
  assert.equal(benefitState.benefit.status, 'reviewed');
  assert.match(benefitState.benefit.evidence, /Synthetic evidence/);
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
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await stopServer();
}
