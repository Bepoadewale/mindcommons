# Demonstration video

## Current recording

The latest browser recording is `apps/web/public/mindcommons-demo-authorization.mp4`. It is a genuine 92.40-second, 1920×1080, 25 fps H.264 MP4 encoded at CRF 18 (5,202,681 bytes). It was captured from a clean Chromium session against the live Worker. It demonstrates a contributor withdrawal in the policy preview, the policy change, a real server-side denial because the agreed benefit terms are missing, the actual session receipt, and a preview becoming eligible after the fictional community and research team accept the obligation. The script asserts that the one submitted research request is denied, the receipt says inference was not attempted and output was not released, and a separate session cannot read that receipt. No Workers AI inference is called during this recording.

The new recording is silent with burned-in explanatory captions; the captions are not speech subtitles. It contains no participant footage or community endorsement. The temporary receipt viewer in the video displays the exact JSON returned for that synthetic session; it is a viewer used for recording, not a new product feature.

After the documentation PR merges, the video will be publicly hosted at <https://bepoadewale.github.io/mindcommons/mindcommons-demo-authorization.mp4>. It is a GitHub Pages static fallback and does not depend on the Mac. The deployed Worker continues to serve the previous recordings; no Worker deployment is needed for the Pages copy. The earlier captioned and original recordings remain unchanged:

- Previous captioned Worker video: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo-captioned.mp4>
- Previous captioned Pages fallback: <https://bepoadewale.github.io/mindcommons/mindcommons-demo-captioned.mp4>
- Original Worker MP4: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo.mp4>
- Original Pages fallback: <https://bepoadewale.github.io/mindcommons/mindcommons-demo.mp4>

## Caption sequence

The recorder inserts captions over the real browser interaction. The video distinguishes the no-inference preview from the denied server request and does not claim that AI ran:

1. “Community contributions should come with a continuing say in AI research.”
2. “MindCommons is an independent technical prototype. Every person and record in this demo is fictional.”
3. “First, inspect the community rule and each person’s separate permission.”
4. “This preview applies the shared agreement rules. It makes no model call.”
5. “Withdrawing one person’s permission removes that person’s fictional contribution.”
6. “The approved policy also requires community agreement and research-team acceptance of a shared-results commitment.”
7. “The server denies the request before inference and offers a session-only JSON receipt.”
8. “The receipt records the denied outcome and says inference was not attempted.”
9. “Receipt data is scoped to this synthetic session and omits the model output.”
10. “After the fictional team accepts, the same rules preview changes to eligible. No AI job is run.”
11. “The future roadmap is proposed work for genuine community co-design, not completed validation.”
12. “Open-source code, evidence and limitations are available for independent review.”

## Reproduce and verify

Run `npm run demo:record` from a local development checkout. The script targets only the MindCommons production Worker using a fresh, synthetic browser session. It performs one denied research request and verifies a receipt with `inferenceAttempted: false`; it never invokes the Workers AI binding. It also checks the future-vision page, repository, receipt isolation, and zero browser errors. Playwright saves WebM under `/private/tmp/mindcommons-reviewer-video`. Encode it to the preserved sibling MP4 path with:

```bash
ffmpeg -i <playwright-recording.webm> -map 0:v:0 -an -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart apps/web/public/mindcommons-demo-authorization.mp4
```

The video is checked with `ffprobe` and decoded. After the PR publishes GitHub Pages, verify unauthenticated HTTPS 200 and `video/mp4` for the new asset. The previous Worker and Pages recordings remain independently available. Do not describe a preview as execution or claim inference happened in this new recording.
