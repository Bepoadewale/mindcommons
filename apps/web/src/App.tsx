import { useCallback, useEffect, useMemo, useState } from 'react';

type Role = 'community_representative' | 'researcher' | 'community_member';
type EventRecord = {
  event_id: string;
  actor: string;
  action: string;
  policy_version: number | null;
  decision: string | null;
  job_status: string | null;
  correlation_id: string;
  occurred_at: string;
};
type RunRecord = {
  run_id: string;
  purpose: string;
  job_type: string;
  status: string;
  policy_version: number | null;
  reasons: string[];
  model_id: string | null;
  output: unknown;
  contributionDecisions?: {
    processedContributionIds: string[];
    excludedContributions: { contributionId: string; contributorId: string; reason: string }[];
  };
  created_at: string;
  completed_at: string | null;
};
type PermissionHistoryRecord = {
  permission_id: string;
  version: number;
  purpose: string;
  status: string;
  expires_at: string;
  action: string;
  actor: string;
  correlation_id: string;
  recorded_at: string;
};
type PermissionRecord = {
  permission_id: string;
  purpose: string;
  status: string;
  expires_at: string;
  version: number;
};
type ContributionRecord = {
  contributionId: string;
  contributorId: string;
  purpose: string;
};
type DemoState = {
  community: { id: string; name: string; location: string };
  synthetic: boolean;
  demoRole: Role;
  availableRoles: Role[];
  expiresAt: string;
  policy: {
    version: number;
    status: string;
    allowed_purpose: string;
    commercialAllowed: boolean;
    withdrawalMode: string;
  };
  proposal: {
    proposal_id: string;
    status: string;
    title: string;
    proposed_purpose: string;
    proposedCommercialAllowed: boolean;
    withdrawalMode: string;
  };
  contributions: ContributionRecord[];
  permissions: PermissionRecord[];
  permissionHistory: PermissionHistoryRecord[];
  benefit: {
    title: string;
    owner: string;
    due_at: string;
    evidence: string | null;
    status: string;
  };
  events: EventRecord[];
  runs: RunRecord[];
};

function displayInferenceOutput(output: unknown): string {
  if (output && typeof output === 'object' && 'text' in output && typeof output.text === 'string') {
    const fencedJson = output.text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (fencedJson) {
      try {
        return JSON.stringify(JSON.parse(fencedJson[1]), null, 2);
      } catch {
        // Keep the model's original text when it is not valid JSON.
      }
    }
    return output.text;
  }
  return JSON.stringify(output, null, 2);
}
type ActionResponse = {
  status?: string;
  error?: string;
  message?: string;
  decision?: { allowed: boolean; reasons: string[] };
  output?: unknown;
  modelId?: string;
  provider?: string;
  inferenceMode?: string;
  inputContributionIds?: string[];
  excludedContributions?: { contributionId: string; contributorId: string; reason: string }[];
  correlationId?: string;
};

const roleLabels: Record<Role, string> = {
  community_representative: 'Community representative',
  researcher: 'Researcher',
  community_member: 'Community member',
};
const contributorLabels: Record<string, string> = {
  'contributor-a': 'Fictional contributor A',
  'contributor-b': 'Fictional contributor B',
  'contributor-c': 'Fictional contributor C',
};

function purposeLabel(purpose: string): string {
  if (purpose === 'community-wellbeing-research') return 'Community wellbeing research';
  if (purpose === 'community-access-research') return 'Community access research';
  return 'Commercial advertising';
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const parsed: unknown = await response.json().catch(() => null);
  const body = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  if (!response.ok)
    throw Object.assign(
      new Error(String(body.message ?? body.error ?? 'Request could not be completed.')),
      { response: body },
    );
  return body as T;
}

export default function App() {
  const [data, setData] = useState<DemoState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [purpose, setPurpose] = useState('community-wellbeing-research');
  const [benefitEvidence, setBenefitEvidence] = useState('accessible-summary-prepared');
  const [latest, setLatest] = useState<ActionResponse | null>(null);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

  const refresh = useCallback(async () => {
    try {
      const state = await request<DemoState>('/api/demo');
      setData(state);
      setError('');
    } catch {
      setError('The demo service is not available right now. Try again when the API is reachable.');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const role = data?.demoRole;
  const latestRun = useMemo(() => data?.runs[0] ?? null, [data]);

  async function act(action: () => Promise<ActionResponse>, successMessage: string) {
    setBusy(true);
    setError('');
    setNotice('');
    setLatest(null);
    try {
      const result = await action();
      setLatest(result);
      setNotice(successMessage);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The request failed.');
      const response = (caught as { response?: ActionResponse }).response;
      if (response) setLatest(response);
    } finally {
      setBusy(false);
    }
  }

  async function chooseRole(nextRole: Role) {
    await act(
      () => request('/api/role', { method: 'POST', body: JSON.stringify({ role: nextRole }) }),
      `Demo seat changed to ${roleLabels[nextRole]}. This is a fictional role.`,
    );
  }

  async function decidePolicy(decision: 'approve' | 'reject') {
    await act(
      () =>
        request('/api/policy/decision', {
          method: 'POST',
          body: JSON.stringify({ proposalId: 'proposal-v2', decision }),
        }),
      decision === 'approve'
        ? 'The proposal is active as a new synthetic policy version.'
        : 'The proposal was rejected; the active rule remains in force.',
    );
  }

  async function changePermission(action: 'withdraw' | 'grant', contributorId: string) {
    await act(
      () =>
        request('/api/consent', {
          method: 'POST',
          body: JSON.stringify({ action, contributorId }),
        }),
      action === 'withdraw'
        ? `The fictional ${contributorId.replace('contributor-', 'contributor ')} withdrew permission.`
        : `The fictional ${contributorId.replace('contributor-', 'contributor ')} granted permission.`,
    );
  }

  async function runResearch() {
    await act(
      () =>
        request('/api/research/run', {
          method: 'POST',
          body: JSON.stringify({ purpose, jobType: 'theme-classification' }),
        }),
      'Research request processed. Review the decision and execution record below.',
    );
  }

  async function recordBenefit() {
    await act(
      () =>
        request('/api/benefit', {
          method: 'POST',
          body: JSON.stringify({ evidence: benefitEvidence }),
        }),
      'A fictional evidence marker was added to this demo commitment.',
    );
  }

  async function reset() {
    setBusy(true);
    setError('');
    setNotice('');
    setLatest(null);
    try {
      await request('/api/demo', { method: 'DELETE' });
      await refresh();
      setNotice('A fresh synthetic session is ready.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not reset the demo.');
    } finally {
      setBusy(false);
    }
  }

  async function install() {
    if (!installPrompt) return;
    const prompt = installPrompt as Event & {
      prompt(): Promise<void>;
      userChoice: Promise<{ outcome: string }>;
    };
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') setNotice('MindCommons was added to your home screen.');
    setInstallPrompt(null);
  }

  const visionPath = `${import.meta.env.BASE_URL}vision`;
  if ([visionPath, `${visionPath}/`].includes(window.location.pathname)) return <Vision />;

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="topbar">
        <a className="brand" href={import.meta.env.BASE_URL}>
          <span className="brand-mark" aria-hidden="true">
            m
          </span>
          <span>mindcommons</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#why">Why</a>
          <a href="#demo">Demo</a>
          <a href={`${import.meta.env.BASE_URL}vision/`}>Future vision</a>
        </nav>
        <div className="top-actions">
          {installPrompt && (
            <button className="button button-quiet install-button" onClick={() => void install()}>
              Install app
            </button>
          )}
          <a className="button button-dark" href="#demo">
            Explore the demo <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="why">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="pulse-dot" /> Open infrastructure for shared authority
            </div>
            <h1>Communities should shape how their contributions are used in AI.</h1>
            <p className="hero-intro">
              MindCommons explores a practical alternative: community rules and individual
              permissions that are checked before a research model runs.
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href="#demo">
                Try the synthetic scenario <span aria-hidden="true">↓</span>
              </a>
              <a className="text-link" href="https://github.com/Bepoadewale/mindcommons">
                View the open source ↗
              </a>
              <a
                className="text-link"
                href={`${import.meta.env.BASE_URL}mindcommons-demo.mp4`}
                target="_blank"
                rel="noreferrer"
              >
                Watch the project demo ↗
              </a>
            </div>
            <div className="hero-note">
              <span className="note-icon" aria-hidden="true">
                ✳
              </span>
              <span>
                Early technical prototype · Fictional Nigerian community · No health records
              </span>
            </div>
          </div>
          <div
            className="hero-art"
            aria-label="Illustration of community members sharing decisions around an AI model"
          >
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit-label label-top">community rule</div>
            <div className="orbit-label label-right">individual choice</div>
            <div className="orbit-label label-bottom">shared benefit</div>
            <div className="core-card">
              <div className="core-spark" aria-hidden="true">
                ✳
              </div>
              <div className="core-title">AI research</div>
              <div className="core-rule">
                Use follows
                <br />
                the community's terms
              </div>
            </div>
            <div className="person person-one">
              <span>O</span>
            </div>
            <div className="person person-two">
              <span>A</span>
            </div>
            <div className="person person-three">
              <span>N</span>
            </div>
            <div className="art-caption">
              A model can be useful while still answering to the people whose contributions shape
              it.
            </div>
          </div>
          <div className="hero-index">
            01 <span /> GOVERNANCE THAT TRAVELS WITH THE WORK
          </div>
        </section>

        <section className="principles section-wrap" aria-label="MindCommons principles">
          <div className="principle">
            <span className="principle-num">01</span>
            <h2>Collective rules</h2>
            <p>Communities describe acceptable research uses and review changes.</p>
          </div>
          <div className="principle">
            <span className="principle-num">02</span>
            <h2>Individual choice</h2>
            <p>Each person's permission is checked separately and can be withdrawn.</p>
          </div>
          <div className="principle">
            <span className="principle-num">03</span>
            <h2>Visible accountability</h2>
            <p>Research decisions, model activity, and promised benefits leave evidence.</p>
          </div>
        </section>

        <section className="demo-section section-wrap" id="demo">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" /> Walk through the prototype
              </div>
              <h2>
                Rules become real
                <br />
                <em>at the point of use.</em>
              </h2>
            </div>
            <p>
              This scenario uses invented records only. The API applies the decision on the server.
              A live deployment will run a small model call for an allowed request; local mock
              results are always identified.
            </p>
          </div>
          <div className="demo-banner">
            <span className="banner-icon" aria-hidden="true">
              ◇
            </span>
            <div>
              <strong>Fictional community scenario</strong>
              <span>No real community, participant or partnership is represented here.</span>
            </div>
            <div className="session-expiry">
              {data
                ? `Session ends ${new Date(data.expiresAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                : 'Connecting…'}
            </div>
          </div>

          {(error || notice) && (
            <div
              className={`feedback ${error ? 'feedback-error' : 'feedback-success'}`}
              role={error ? 'alert' : 'status'}
            >
              {error || notice}
            </div>
          )}
          {!data && !error && (
            <div className="loading-card" aria-live="polite">
              <span className="loading-ring" /> Opening a private synthetic session…
            </div>
          )}
          {data && (
            <>
              <div className="workspace-heading">
                <div>
                  <span className="workspace-kicker">DEMO WORKSPACE</span>
                  <h3>{data.community.name}</h3>
                  <p>{data.community.location} · all names and records are fictional</p>
                </div>
                <div className="role-control">
                  <label htmlFor="demo-role">Acting as</label>
                  <select
                    id="demo-role"
                    value={role}
                    disabled={busy}
                    onChange={(event) => void chooseRole(event.target.value as Role)}
                  >
                    {data.availableRoles.map((value) => (
                      <option value={value} key={value}>
                        {roleLabels[value]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="workspace-grid">
                <article className="panel policy-panel">
                  <div className="panel-topline">
                    <span className="panel-icon icon-leaf" aria-hidden="true">
                      ✳
                    </span>
                    <span className="status-pill status-active">
                      ACTIVE · V{data.policy.version}
                    </span>
                  </div>
                  <div className="panel-label">COMMUNITY RULE</div>
                  <h3>Research with a clear purpose</h3>
                  <p>
                    Approved use: {purposeLabel(data.policy.allowed_purpose)}. Commercial use is{' '}
                    {data.policy.commercialAllowed ? 'permitted' : 'prohibited'} by this fictional
                    rule.
                  </p>
                  <div className="rule-row">
                    <span>Purpose allowed</span>
                    <strong>{purposeLabel(data.policy.allowed_purpose)}</strong>
                  </div>
                  <div className="rule-row">
                    <span>Withdrawal rule</span>
                    <strong>
                      {data.policy.withdrawalMode === 'require-all'
                        ? 'Require every contributor'
                        : 'Exclude only withheld contributions'}
                    </strong>
                  </div>
                  <div className="proposal-box">
                    <div className="proposal-title">
                      <span>REVIEWED PROPOSAL</span>
                      <span className="proposal-state">{data.proposal.status}</span>
                    </div>
                    <h4>{data.proposal.title}</h4>
                    <p>
                      If approved, the same research request will require active permission from
                      every contributor; one withdrawal will block the full job.
                    </p>
                    {data.proposal.status === 'reviewed' ? (
                      role === 'community_representative' ? (
                        <div className="button-row">
                          <button
                            className="button button-dark"
                            disabled={busy}
                            onClick={() => void decidePolicy('approve')}
                          >
                            Approve policy
                          </button>
                          <button
                            className="button button-outline"
                            disabled={busy}
                            onClick={() => void decidePolicy('reject')}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <p className="inline-note">
                          Switch to the fictional representative seat to review this proposal.
                        </p>
                      )
                    ) : (
                      <p className="inline-note">
                        This proposal is {data.proposal.status}. The active community rule is
                        version {data.policy.version}.
                      </p>
                    )}
                  </div>
                  <p className="panel-footnote">
                    Demo authority is simulated for this fictional scenario; it is not real-world
                    identity verification.
                  </p>
                </article>

                <article className="panel permission-panel">
                  <div className="panel-topline">
                    <span className="panel-icon icon-person" aria-hidden="true">
                      ◉
                    </span>
                    <span className="status-pill status-active">3 FICTIONAL CONTRIBUTORS</span>
                  </div>
                  <div className="panel-label">INDIVIDUAL PERMISSION</div>
                  <h3>A separate say for each person</h3>
                  <p>
                    Each synthetic contribution has a separate permission for its stated purpose.
                    Collective policy cannot override an individual's refusal.
                  </p>
                  <div className="contributor-permission-list">
                    {data.permissions.map((permission) => {
                      const contributorId = permission.permission_id.split(':')[0];
                      const history = data.permissionHistory.filter(
                        (record) => record.permission_id === permission.permission_id,
                      );
                      return (
                        <section className="contributor-permission" key={permission.permission_id}>
                          <div className="permission-detail">
                            <div>
                              <span>{contributorLabels[contributorId] ?? contributorId}</span>
                              <strong
                                className={permission.status === 'granted' ? '' : 'text-denied'}
                              >
                                {permission.status.toUpperCase()} · v{permission.version}
                              </strong>
                            </div>
                            <div>
                              <span>Purpose and expiry</span>
                              <strong>
                                {purposeLabel(permission.purpose)} ·{' '}
                                {new Date(permission.expires_at).toLocaleDateString()}
                              </strong>
                            </div>
                          </div>
                          <section
                            className="permission-history"
                            aria-label={`${contributorLabels[contributorId]} permission history`}
                          >
                            <h4>Permission history</h4>
                            <p>Up to 50 versions are kept in this short-lived synthetic session.</p>
                            <ol>
                              {history.map((record) => (
                                <li key={`${record.permission_id}-${record.version}`}>
                                  <div className="permission-history-heading">
                                    <strong>
                                      Version {record.version} · {record.status}
                                    </strong>
                                    <time dateTime={record.recorded_at}>
                                      {new Date(record.recorded_at).toLocaleString()}
                                    </time>
                                  </div>
                                  <span>
                                    {record.action === 'created'
                                      ? 'Initial synthetic permission record'
                                      : record.action === 'migration-backfill'
                                        ? 'Synthetic record added during migration'
                                        : `Recorded by ${record.actor.replace('demo:', '')}`}
                                  </span>
                                </li>
                              ))}
                            </ol>
                          </section>
                          {role === 'community_member' && (
                            <button
                              className={
                                permission.status === 'granted'
                                  ? 'button button-outline'
                                  : 'button button-dark'
                              }
                              disabled={busy}
                              onClick={() =>
                                void changePermission(
                                  permission.status === 'granted' ? 'withdraw' : 'grant',
                                  contributorId,
                                )
                              }
                            >
                              {permission.status === 'granted'
                                ? `Withdraw ${contributorLabels[contributorId]} permission`
                                : `Grant ${contributorLabels[contributorId]} permission`}
                            </button>
                          )}
                        </section>
                      );
                    })}
                  </div>
                  {role !== 'community_member' && (
                    <p className="inline-note">
                      Switch to the fictional member seat to simulate each contributor's own
                      permission change.
                    </p>
                  )}
                  <p className="panel-footnote">
                    These controls simulate contributor choices, not verified identities.
                    Withdrawals block future processing under the current community rule; this demo
                    cannot remove copies from model weights.
                  </p>
                </article>

                <article className="panel research-panel">
                  <div className="panel-topline">
                    <span className="panel-icon icon-research" aria-hidden="true">
                      ⌕
                    </span>
                    <span className="status-pill status-experimental">FIXED SYNTHETIC JOB</span>
                  </div>
                  <div className="panel-label">RESEARCH REQUEST</div>
                  <h3>Run a bounded theme review</h3>
                  <p>
                    A fixed job scans a tiny fictional corpus for broad themes. It does not diagnose
                    or give health advice.
                  </p>
                  <div className="field-grid">
                    <label htmlFor="request-purpose">
                      Requested purpose
                      <select
                        id="request-purpose"
                        value={purpose}
                        onChange={(event) => setPurpose(event.target.value)}
                        disabled={busy}
                      >
                        <option value="community-wellbeing-research">
                          Community wellbeing research
                        </option>
                        <option value="commercial-advertising">
                          Commercial advertising (prohibited)
                        </option>
                      </select>
                    </label>
                    <label>
                      Job type<span className="readonly-field">Theme classification · fixed</span>
                    </label>
                  </div>
                  {role === 'researcher' ? (
                    <button
                      className="button button-dark run-button"
                      disabled={busy}
                      onClick={() => void runResearch()}
                    >
                      {busy ? (
                        <>
                          <span className="button-spinner" /> Checking rules…
                        </>
                      ) : (
                        <>
                          Check rules and run evaluation <span aria-hidden="true">→</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <p className="inline-note">
                      Switch to the fictional researcher seat to submit this request.
                    </p>
                  )}
                  <div className="execution-note">
                    <span className="execution-dot" />
                    <span>
                      The server checks every contribution's purpose and permission, sends only
                      eligible records, and rechecks authorization before releasing results.
                    </span>
                  </div>
                  {(latest || latestRun) && (
                    <div className="result-box" aria-live="polite">
                      <div className="result-heading">
                        <strong>{latest?.status ?? latestRun?.status}</strong>
                        {latest?.modelId && <span>{latest.modelId}</span>}
                      </div>
                      <p>
                        {latest?.decision?.allowed
                          ? latest.inferenceMode === 'mock'
                            ? 'Mock result: local tests used a fixed response; no AI inference occurred.'
                            : `Inference ran with ${latest.provider}. Inputs were synthetic.`
                          : (latest?.decision?.reasons.join(' · ') ??
                            latest?.message ??
                            (latestRun?.reasons ?? []).join(' · '))}
                      </p>
                      {(
                        latest?.inputContributionIds ??
                        latestRun?.contributionDecisions?.processedContributionIds ??
                        []
                      ).length > 0 && (
                        <p>
                          Processed records:{' '}
                          {(
                            latest?.inputContributionIds ??
                            latestRun?.contributionDecisions?.processedContributionIds ??
                            []
                          ).join(', ')}
                          .
                        </p>
                      )}
                      {(
                        latest?.excludedContributions ??
                        latestRun?.contributionDecisions?.excludedContributions ??
                        []
                      ).length > 0 && (
                        <p>
                          Excluded records:{' '}
                          {(
                            latest?.excludedContributions ??
                            latestRun?.contributionDecisions?.excludedContributions ??
                            []
                          )
                            .map((item) => `${item.contributionId} (${item.reason})`)
                            .join('; ')}
                          .
                        </p>
                      )}
                      {latest?.output !== undefined && latest.output !== null && (
                        <pre>{displayInferenceOutput(latest.output)}</pre>
                      )}
                    </div>
                  )}
                </article>

                <article className="panel benefit-panel">
                  <div className="panel-topline">
                    <span className="panel-icon icon-benefit" aria-hidden="true">
                      ↗
                    </span>
                    <span className="status-pill status-proposed">HYPOTHETICAL</span>
                  </div>
                  <div className="panel-label">COMMUNITY BENEFIT</div>
                  <h3>{data.benefit.title}</h3>
                  <p>
                    A proposed commitment attached to this synthetic research scenario. No work or
                    payment has been delivered.
                  </p>
                  <div className="benefit-owner">
                    <div className="owner-avatar">FC</div>
                    <div>
                      <strong>{data.benefit.owner}</strong>
                      <span>Fictional accountable owner</span>
                    </div>
                    <span className="benefit-status">{data.benefit.status}</span>
                  </div>
                  <div className="rule-row">
                    <span>Proposed due date</span>
                    <strong>{new Date(data.benefit.due_at).toLocaleDateString()}</strong>
                  </div>
                  <div className="evidence-box">
                    <span>DELIVERY EVIDENCE</span>
                    <strong>{data.benefit.evidence ?? 'No evidence recorded yet'}</strong>
                  </div>
                  {role === 'community_representative' && !data.benefit.evidence ? (
                    <div className="benefit-update">
                      <label htmlFor="benefit-evidence">Add a fictional evidence marker</label>
                      <select
                        id="benefit-evidence"
                        value={benefitEvidence}
                        onChange={(event) => setBenefitEvidence(event.target.value)}
                        disabled={busy}
                      >
                        <option value="accessible-summary-prepared">
                          Accessible summary draft prepared
                        </option>
                        <option value="community-review-scheduled">
                          Community review scheduled
                        </option>
                      </select>
                      <button
                        className="button button-outline"
                        disabled={busy}
                        onClick={() => void recordBenefit()}
                      >
                        Record demo evidence
                      </button>
                    </div>
                  ) : null}
                  <p className="panel-footnote">
                    Evidence markers are fictional demo records, not proof that a real community
                    benefit was delivered.
                  </p>
                </article>
              </div>

              <section className="activity-section" aria-labelledby="activity-title">
                <div className="activity-heading">
                  <div>
                    <div className="panel-label">DECISION RECORD</div>
                    <h3 id="activity-title">Recent activity</h3>
                  </div>
                  <button
                    className="button button-quiet"
                    disabled={busy}
                    onClick={() => void reset()}
                  >
                    Reset demo <span aria-hidden="true">↻</span>
                  </button>
                </div>
                <p className="activity-intro">
                  Session-scoped application records. This database log is useful evidence, not a
                  tamper-proof ledger.
                </p>
                <div className="event-list">
                  {data.events.length ? (
                    data.events.map((event) => (
                      <div className="event-row" key={event.event_id}>
                        <span className="event-glyph">
                          {event.decision === 'denied' ? '×' : '·'}
                        </span>
                        <div className="event-description">
                          <strong>{event.action.replaceAll('-', ' ')}</strong>
                          <span>
                            {event.actor} ·{' '}
                            {event.policy_version ? `Policy v${event.policy_version} · ` : ''}
                            {event.job_status ?? event.decision ?? 'recorded'}
                          </span>
                        </div>
                        <time dateTime={event.occurred_at}>
                          {new Date(event.occurred_at).toLocaleTimeString([], {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </time>
                      </div>
                    ))
                  ) : (
                    <p>No activity yet.</p>
                  )}
                </div>
                <div className="activity-foot">
                  <span>Correlation IDs link this list to backend decision records.</span>
                  <a href="https://github.com/Bepoadewale/mindcommons/tree/main/docs/security">
                    Read the privacy limits ↗
                  </a>
                </div>
              </section>
            </>
          )}
        </section>

        <section className="closing section-wrap">
          <div className="closing-mark" aria-hidden="true">
            ✳
          </div>
          <div>
            <div className="eyebrow">A prototype is a starting point</div>
            <h2>
              Governance has to be
              <br />
              <em>built with people.</em>
            </h2>
          </div>
          <div className="closing-copy">
            <p>
              Before a real pilot, affected young people, people with lived experience and community
              health workers need to shape the rules, safety measures and benefit commitments. This
              code does not stand in for that work.
            </p>
            <a href={`${import.meta.env.BASE_URL}vision/`} className="text-link">
              Explore the proposed future experience ↗
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="brand" href={import.meta.env.BASE_URL}>
          <span className="brand-mark" aria-hidden="true">
            m
          </span>
          <span>mindcommons</span>
        </a>
        <p>Open technical exploration · synthetic data only</p>
        <div>
          <a href="https://github.com/Bepoadewale/mindcommons">GitHub</a>
          <a href={`${import.meta.env.BASE_URL}vision/`}>Future vision</a>
          <a href="https://github.com/Bepoadewale/mindcommons/blob/main/SECURITY.md">Security</a>
        </div>
      </footer>
    </div>
  );
}

export function Vision({ standalone = false }: { standalone?: boolean }) {
  const screens = [
    {
      num: '01',
      title: 'Community onboarding',
      description:
        'A community describes its purpose, chosen languages, representatives, and how people can ask questions or raise concerns.',
      status: 'PROPOSED',
      preview: [
        'Community purpose and boundaries',
        'Chosen languages and access needs',
        'Representative roles and questions channel',
      ],
    },
    {
      num: '02',
      title: 'Governance proposals',
      description:
        'Members review a proposed research use, see what changes, and record the process that makes a decision legitimate.',
      status: 'PROPOSED',
      preview: [
        'Research purpose and requested change',
        'Review process and decision evidence',
        'Conditions, dissent, and next review date',
      ],
    },
    {
      num: '03',
      title: 'Consent and permissions',
      description:
        'People inspect and change their own choices in accessible language, separately from collective rules.',
      status: 'PROPOSED',
      preview: [
        'Allowed purposes and restrictions',
        'Permission expiry and version history',
        'Withdrawal route and confirmation',
      ],
    },
    {
      num: '04',
      title: 'Research requests',
      description:
        'Researchers submit a fixed, purpose-limited job with a dataset, model, intended output, and community benefit commitment.',
      status: 'PROTOTYPE',
      preview: [
        'Purpose and fixed job type',
        'Community rule and permission checks',
        'Decision reasons before execution',
      ],
    },
    {
      num: '05',
      title: 'Model activity',
      description:
        'A community inspects which approved models ran, under which policy version, and what results were shared.',
      status: 'PROTOTYPE',
      preview: [
        'Model and dataset identifiers',
        'Policy version and authorization decision',
        'Execution status and result reference',
      ],
    },
    {
      num: '06',
      title: 'Benefit commitments',
      description:
        'Shared commitments show who is responsible, when they are due, and what evidence is ready for community review.',
      status: 'PROPOSED',
      preview: [
        'Agreed benefit and accountable owner',
        'Due date and review status',
        'Evidence shared with the community',
      ],
    },
    {
      num: '07',
      title: 'Community transparency',
      description:
        'A public-facing record summarizes active rules, approved uses, policy changes, and available research outputs.',
      status: 'PROPOSED',
      preview: [
        'Current rules and their version',
        'Approved and denied use summaries',
        'Shared findings and update history',
      ],
    },
    {
      num: '08',
      title: 'Accountability and complaints',
      description:
        'People can raise a concern, request review, and see who is responsible for following up and responding.',
      status: 'PROPOSED',
      preview: [
        'Concern or review request',
        'Responsible contact and response timeline',
        'Follow-up status and available remedy',
      ],
    },
  ];
  return (
    <div className="site-shell vision-shell">
      <a className="skip-link" href="#vision-main">
        Skip to content
      </a>
      <header className="topbar">
        <a className="brand" href={standalone ? '#vision-main' : import.meta.env.BASE_URL}>
          <span className="brand-mark" aria-hidden="true">
            m
          </span>
          <span>mindcommons</span>
        </a>
        <nav aria-label="Main navigation">
          {!standalone && <a href={`${import.meta.env.BASE_URL}#why`}>Why</a>}
          {!standalone && <a href={`${import.meta.env.BASE_URL}#demo`}>Demo</a>}
          <a
            href={standalone ? '#vision-main' : `${import.meta.env.BASE_URL}vision/`}
            aria-current="page"
          >
            Future vision
          </a>
        </nav>
        {standalone ? (
          <a className="button button-dark" href="https://github.com/Bepoadewale/mindcommons">
            Prototype source ↗
          </a>
        ) : (
          <a className="button button-dark" href={`${import.meta.env.BASE_URL}#demo`}>
            Back to the demo ↗
          </a>
        )}
      </header>
      <main id="vision-main">
        <section className="vision-hero">
          <div className="eyebrow">
            <span className="eyebrow-line" /> FUTURE PRODUCT VISUALIZATION
          </div>
          <h1>
            A commons takes
            <br />
            <em>more than a screen.</em>
          </h1>
          <p>
            A proposed set of experiences for communities, contributors and researchers. Screens
            marked “proposed” are not implemented. The current prototype supports a narrow synthetic
            scenario.
          </p>
          <div className="vision-status-key">
            <span>
              <i className="key-dot key-live" /> Implemented in prototype
            </span>
            <span>
              <i className="key-dot key-proposed" /> Proposed for co-design
            </span>
          </div>
        </section>
        <section className="vision-grid section-wrap">
          {screens.map(({ num, title, description, status, preview }) => (
            <article className="vision-card" key={num}>
              <div className="vision-card-top">
                <span>{num}</span>
                <span
                  className={
                    status === 'PROTOTYPE'
                      ? 'status-pill status-experimental'
                      : 'status-pill status-proposed'
                  }
                >
                  {status}
                </span>
              </div>
              <div className={`wireframe wireframe-${num}`} aria-hidden="true">
                <div className="wire-line wire-line-long" />
                <div className="wire-line wire-line-short" />
                <div className="wire-block" />
                <div className="wire-line wire-line-mid" />
                <div className="wire-row">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <h2>{title}</h2>
              <p>{description}</p>
              <details className="vision-preview">
                <summary>Explore concept</summary>
                <div className="vision-preview-content">
                  <span className="panel-label">PROPOSED SCREEN CONTENT</span>
                  <ul>
                    {preview.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p>This is a design idea for co-design, not a working control.</p>
                </div>
              </details>
            </article>
          ))}
        </section>
        <section className="vision-boundary section-wrap">
          <span className="boundary-mark">✳</span>
          <div>
            <div className="eyebrow">What has to come first</div>
            <h2>People decide how the tool should work.</h2>
          </div>
          <p>
            These concepts need to be refined with people who would use and be affected by them.
            Community authority, privacy safeguards and benefit-sharing are design questions, not
            presets a software team can settle alone.
          </p>
        </section>
      </main>
      <footer className="footer">
        <a className="brand" href={standalone ? '#vision-main' : import.meta.env.BASE_URL}>
          <span className="brand-mark" aria-hidden="true">
            m
          </span>
          <span>mindcommons</span>
        </a>
        <p>
          {standalone
            ? 'Public wireframe · proposed screens clearly labelled · static preview only'
            : 'Public interactive wireframe · proposed screens clearly labelled'}
        </p>
        <div>
          <a href="https://github.com/Bepoadewale/mindcommons">GitHub</a>
          {!standalone && <a href={`${import.meta.env.BASE_URL}#demo`}>Working prototype</a>}
        </div>
      </footer>
    </div>
  );
}
