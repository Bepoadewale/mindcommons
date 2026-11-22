# Why the prototype is built this way

This note records the main design choices. A decision may change if new evidence shows it is unsuitable.

## 1. One small hosted service

**Choice:** Use Cloudflare Workers for the API and website files, D1 for short-lived demo records, and a Workers AI connection for one fixed synthetic task.

**Why:** This keeps the public demo small and avoids a server that must run all the time. Website files are served separately; only API requests run server code. The demo uses a free plan and no paid fallback. Free allowances are limited and shared across an account, so requests can fail if an allowance is unavailable.

**Trade-off:** The project depends on Cloudflare and its model service. Cloudflare is an outside provider. The model receives selected fictional text.

**Other options:** Cloudflare Pages Functions could also provide an API. A conventional paid server or database would violate the no-cost goal. Training a large model is outside the scope and capacity of this prototype.

## 2. Fixed software rules decide access

**Choice:** A TypeScript rules checker evaluates the request on the server before AI runs.

**Why:** A model should not decide whether someone has permission. The same facts should produce the same allow or deny result.

**Trade-off:** The checks can enforce only rules that the service has been configured to understand. They do not prove that a community's decision process was fair or legitimate.

## 3. Fictional roles and temporary sessions

**Choice:** Visitors can switch between fictional roles without creating an account. Each visitor gets a separate temporary session.

**Why:** Reviewers can explore the scenario without registration and without entering personal information.

**Trade-off:** Switching roles is not identity verification. It does not show how a real organization should confirm a person's authority.

## 4. Mock tests and live AI are separate

**Choice:** Most automated tests use a predictable test substitute. A separate bounded request has been checked against the live model.

**Why:** Tests can run repeatedly without using the AI allowance or depending on outside service availability.

**Trade-off:** Passing mock tests alone does not prove live AI works. The project records live checks separately.

## 5. No personal or health data

**Choice:** Keep the demo synthetic. Do not accept health stories or patient records.

**Why:** The prototype has not been approved or prepared for research with people.

**Trade-off:** A future study would need host and community authorization, ethics and legal review, privacy and security safeguards, accessible consent, and a specific data-handling plan before any real data is considered.

## 6. A separate page for future design

**Choice:** GitHub Pages hosts the visual future-product design and video copies. The actual interactive demo is on a separate Cloudflare Worker URL.

**Why:** A static design can explain possible future screens without suggesting that they already work.

**Trade-off:** The static page has no database, API or AI behavior. It should not be confused with the live demo.

For current platform facts and sources, see [technical validation](../research/technical-validation.md).
