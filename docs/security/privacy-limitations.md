# Privacy limits and future safeguards

The MVP uses synthetic content exclusively and should reject free-form health narratives. It is not a clinical tool or a compliant patient-data platform. Do not enter personal data in the public demonstration. The fixed hosted job sends only authorized, selected fictional snippets to Cloudflare Workers AI; Cloudflare is an external processing boundary. Local tests use an explicitly labelled mock.

The browser receives an HttpOnly, SameSite=Lax session cookie (Secure over HTTPS); the React app does not persist session or research state to browser storage. API responses are `no-store`, and the service worker excludes `/api/`. Session access expires after two hours, reset deletes session-linked D1 rows, and periodic cleanup removes expired rows opportunistically. This is not a guarantee of physical deletion at exactly two hours. Provider operational records and processing are outside the app's deletion controls.

If permission or policy changes during inference, MindCommons can withhold the result before storing and returning it. That cannot reverse transmission or processing that already occurred at the model provider. It cannot recall previously released outputs, delete copied datasets, or remove information from model weights. These controls are relevant only inside a service that implements and trusts the agreement evaluator.

Nigeria's Data Protection Act 2023 identifies health information as sensitive personal data and defines conditions for processing. The prototype does not establish a lawful basis, valid informed consent, data-protection impact assessment, controller/processor duties, or compliance. Seek Nigerian legal and data-protection expertise for any proposed human-subject study.

Any future study involving people requires appropriate ethics review through relevant Nigerian health research ethics arrangements, informed and accessible participation, safeguarding, secure data handling, retention and deletion rules, incident response, and community-approved benefit and grievance processes. Design those with participants before collecting data.

Cloud provider logs and model retention/usage terms must be checked before any real data is contemplated. This prototype's model call, if deployed, receives synthetic text only. No model unlearning or removal from externally distributed weights is provided.

## GitHub Pages wireframe

The static future-vision page does not request or store visitor-entered information and does not call the MindCommons API. GitHub states that Pages visitor IP addresses are logged and stored for security purposes. This applies to the public wireframe host and is separate from the application; see [GitHub Pages data collection](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
