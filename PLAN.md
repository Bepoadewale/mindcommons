# Project plan in plain language

## The basic approach

MindCommons is a small website with a server that checks research rules. The website uses fictional contributors and synthetic text. A database keeps temporary demo records. A fixed software checker—not an AI model—decides whether a research task follows the current rule. If allowed, a connected AI model can process selected synthetic text.

Local tests use a mock, which is a predictable substitute that does not call an AI model. A live model call is recorded separately. The project uses a free service plan and must not turn on paid features.

## Work completed

1. **Research and setup:** reviewed the Mozilla fellowship materials, technical options, related projects, data-protection sources and DavDeploy materials in read-only mode.
2. **Public project:** created the open-source repository, protected the main branch, set up automated checks and wrote contributor and security guidance.
3. **Working example:** built separate community rules and individual permissions, server-side checks, a bounded AI task, benefit conditions, a second check before releasing results, and a decision receipt.
4. **Reviewer experience:** published a responsive demo, mobile install option, static future-design page and demonstration videos.
5. **Testing and hosting:** automated checks, local browser tests, live demo behavior and public links have been verified. The demo uses dedicated MindCommons resources and does not depend on the Mac.
6. **Limits:** the project has not involved a real community or pilot. The application must not describe it as community-approved, clinically tested or an SRHIN partnership.
7. **Recent research notes:** PR #49 added plain-language context about Wellcome's GENSCORE grant record and SRHIN's public co-design guide. It changed documentation only.

See the [project status](docs/fellowship/project-status.md) and [acceptance checklist](CHECKLIST.md) for details and evidence.

## Current focus

Make project documentation easy for non-technical reviewers to understand. Lead with the problem, give a concrete example, explain what the software does, and state clearly what it does not prove. Keep technical detail where it is needed to reproduce or check the system.

## Important boundaries

Do not use real personal or health data, alter unrelated DavDeploy resources, spend money, or contact SRHIN or participants before the application is submitted and proper authorization exists. Do not write or submit personal fellowship answers for the applicant.
