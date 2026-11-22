# What the privacy protections do and do not do

The public demo uses fictional content only. Do not enter names, personal details, health stories or patient information. The demo is not a clinical tool or a system approved for research with people.

## What happens to demo information

The browser does not save session or research records in its local storage. It uses a protected session cookie to reconnect to the same temporary demo session. The service worker, which helps the website load, does not cache API responses. API answers are marked not to be cached.

The server stores short-lived records in D1. A session expires after two hours. Reset removes the session and linked records. Expired records become inaccessible and are removed when cleanup runs. This is not a promise that every infrastructure copy is physically erased exactly two hours later.

For an approved demo task, the server sends only selected synthetic text to Cloudflare Workers AI. Cloudflare is an outside service. Its operations and records are outside MindCommons' deletion controls.

## What withdrawal can do

If a permission or community rule changes while the model is working, the service can stop the result from being saved and shown. But the model provider may already have received and processed the text. The service cannot undo that, recall a result already shared, delete outside copies, or remove information from model weights.

These checks work only in services that use the agreement and keep their policy and permission records current. The agreement cannot force unrelated services to follow it.

## What is needed before real research

Nigeria's Data Protection Act 2023 treats health information as sensitive personal data. This prototype does not establish a lawful reason for using such information, valid consent, privacy compliance, or ethics approval. Get Nigerian legal and data-protection advice before planning a human-subject study.

A future study would also need suitable ethics review, accessible participation, safeguarding, secure data handling, agreed retention and deletion rules, incident response, and a community-approved way to raise concerns. The model provider's current data-handling terms must be checked before any real information is considered.

## Static future-design page

The GitHub Pages vision page is only a visual design; it does not collect form entries or call the demo API. GitHub says it logs visitor IP addresses for security. See [GitHub's Pages privacy information](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
