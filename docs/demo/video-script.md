# Demonstration video

## Current recording

The new captioned export is `apps/web/public/mindcommons-demo-captioned.mp4`. The original `apps/web/public/mindcommons-demo.mp4` remains unchanged as the uncaptioned recording. Both are 1920×1080, 25 fps H.264 MP4 files; the new export is 92.84 seconds and 4,609,951 bytes. It was captured from the publicly deployed application with Chromium, then encoded with FFmpeg at H.264 CRF 18. The recording script is `scripts/record-live-demo.mjs`.

The video is silent. Its burned-in explanatory captions are not a transcript of speech or closed captions. They accurately describe the visible scenario and clarify the proposed work. There is no narration or participant footage. The recording run passed its assertions: non-empty real Workers AI result, only A and C processed after B withdrew, identical request rejected under policy v2, fictional benefit obligation agreed/accepted/evidenced/reviewed, GitHub repository page opened, no browser errors, and no horizontal app overflow.

The captioned video is published at:

- Worker: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo-captioned.mp4>
- GitHub Pages fallback: <https://bepoadewale.github.io/mindcommons/mindcommons-demo-captioned.mp4>
- Original Worker MP4: <https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo.mp4>
- Original GitHub Pages fallback: <https://bepoadewale.github.io/mindcommons/mindcommons-demo.mp4>

Both versions returned unauthenticated HTTPS 200 with `video/mp4` from the Worker and Pages. The landing page links to both videos, and the Pages copy was downloaded and checked as a decodable 1920×1080, 25 fps, 92.84-second MP4. These are independent public files, not a YouTube upload. The project owner may replace the public landing-page video destination with a YouTube URL later through a PR; no upload is claimed.

## Caption copy and sequence

The recorder inserts each caption over the screen recording at the point where the described action occurs. Text remains long enough to read; the complete phrases below are the recorded copy.

1. “Communities can contribute data without a lasting say in how it is used or who benefits.”
2. “MindCommons explores community rules before AI research.”
3. “A technical prototype using only fictional people and research records.”
4. “Community rule v1 excludes a contribution when its individual permission is withdrawn.”
5. “Contributor B withdraws. Their fictional record is excluded from the next job.”
6. “A fixed research job checks every contributor before sending eligible records.”
7. “Live inference ran on records A and C; the withdrawn record was not sent.”
8. “The fictional representative approves policy v2: every contributor must agree.”
9. “The same request is now denied before inference because contributor B withdrew.”
10. “Server-side authorization blocks the job; no model call is made.”
11. “Tracks a proposed benefit: shared findings, an accountable owner, evidence and community review.”
12. “This prototype is not a pilot or endorsement. Fellowship work would co-design, review and test the rules with communities.”
13. “Proposed next: co-design, ethics review, and pilot planning with young people, lived-experience advocates and community health workers.”

## Reproduce and verify

Run `npm run demo:record` after deployment. The script deliberately targets only the MindCommons production Worker and performs two bounded real model calls in a fresh synthetic session; it refuses to report success if the model response is empty or the denied request is not blocked. By default, Playwright saves a WebM in `/private/tmp/mindcommons-live-video`. Encode it to MP4 with:

```bash
ffmpeg -i <playwright-recording.webm> -map 0:v:0 -an -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart mindcommons-demo-captioned.mp4
```

The checked-in MP4 is also decoded and probed with `ffprobe`; after publishing, open each unauthenticated Worker and GitHub Pages URL and verify HTTPS 200 plus `video/mp4`. Do not describe deterministic local mock runs as live inference evidence.

## Proposed follow-up recording (not yet recorded)

If the receipt and benefit-gate changes are merged and safely deployed, make a new capture rather than editing or replacing the verified files above. The original and current captioned files remain preserved. Target a concise 90–120 second 1080p recording that accurately shows: (1) fictional community rule and individual permission; (2) preview of a contributor withdrawal with eligible records; (3) the same fixed request denied because a required accessible-results obligation has not been agreed and accepted; (4) fictional community agreement and research-team acceptance; (5) actual bounded AI execution only after authorization, or an honest service-limit/error state; (6) downloading and inspecting a receipt that reports inference mode and release outcome without exposing output or narrative; and (7) repository reuse and the proposed, host-dependent co-design roadmap. Explain that the external provider has already received inputs before any post-inference withholding, and that simulated seats do not prove identity or authority. Do not record an un-deployed feature as public or use mock footage as live-model evidence.
