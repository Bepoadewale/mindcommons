# Project status

**Status on 2026-11-17:** MindCommons is a public technical prototype, not an awarded Mozilla project, established cooperative, SRHIN partnership, or real community pilot. It uses fictional Nigerian community records and synthetic mental-health research material only.

The public application is deployed at <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/>. Its dedicated Cloudflare Worker Static Assets service uses the `mindcommons-demo-d1` D1 database and the Workers AI binding. Chromium has verified session isolation, a policy/individual-permission controlled permitted research request with visible output from real Cloudflare Workers AI inference, and a server-side denial of commercial advertising use. The denied run has no model ID. No paid plan or unrelated DavDeploy resource was enabled or changed.

PR #19 is merged and deployed. The API returns only user-facing model text, omits reasoning metadata, treats empty output as failure, and presents the result readably. The production landing page links to the genuine 90.44-second, 1920×1080 MP4 at <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo.mp4>. The MP4 returned unauthenticated HTTPS 200 with `video/mp4`; Chromium verified the page link and no browser errors. The owner plans to upload the file to YouTube later; no upload has occurred.

The independent future-product visualization is public at <https://bepoadewale.github.io/mindcommons/>. It is a static eight-screen wireframe with no API or AI behavior. The same 90.44-second, 1920×1080 H.264 screen capture is mirrored at <https://bepoadewale.github.io/mindcommons/mindcommons-demo.mp4>; the Pages publish passed, and both URLs were checked unauthenticated. The media URL returned HTTPS 200, `video/mp4`, and 3,759,462 bytes.

Local checks include 23 unit tests, 4 fixture-backed reviewer browser tests, 3 vision browser tests, local Worker + D1 integration, a full-stack browser journey using an explicitly labeled deterministic mock, accessibility scans, type checks, lint, production/vision builds, and documentation validation. Production Chromium also verified the manifest and service-worker registration, 192/512 px icons, a 390 px viewport without horizontal overflow, and graceful offline API failure; API responses were not present in the public asset cache. The live recording script requires actual non-empty Workers AI output and denies the commercial request. Physical Android installation prompt and installed-app behavior remain unverified because `adb` and an emulator are unavailable.

The GitHub Pages workflow for PR #19 failed (`44070661332`) because it built only `dist-vision`, while the validator also verifies production `dist/index.html` remains present and separate. PR #20 added `npm run build` before `npm run build:vision`, passed all four required checks, and merged at `0899d29`. Post-merge Pages publish run `44072149990` succeeded. The public vision page and mirrored video were then checked without authentication. The production Worker video URL remains linked from the live product landing page.

The owner chose to keep the broad account-scoped Cloudflare token in macOS Keychain. Its value has never been printed or committed and is not used in GitHub Actions. The dedicated Worker and D1 are the only MindCommons Cloudflare resources; no paid plan was enabled. The public app is synthetic-only and is not suitable for patient data, clinical decisions, or human-subject research. Real community authority, consent, safeguarding, and benefit-sharing would need participant-led co-design and relevant ethics review before any pilot.

## Next executable work

1. Complete Android PWA installation validation if an Android device becomes available; `adb` and an emulator are not installed in this environment.
2. Continue checking the documented limitations and keep the public artifacts available.
3. The owner can replace the landing page's MP4 destination with a YouTube URL after uploading; until then the production Worker video remains public.
