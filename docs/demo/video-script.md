# What the demonstration videos show

The project has more than one video because each shows a different part of the prototype.

## Policy and benefit walkthrough

[Watch the latest walkthrough](https://bepoadewale.github.io/mindcommons/mindcommons-demo-authorization.mp4). It is a real 92-second browser recording at 1920 × 1080 resolution. It shows a fictional permission change, a policy preview, a server denial because a required benefit has not been accepted, a session-only receipt, and a preview that becomes eligible after fictional agreement and acceptance. The server request is denied; this recording does not call AI.

The video is silent. Explanatory text is shown on screen, but it is not a spoken transcript or closed captions. It contains no participant footage or endorsement. The receipt shown belongs to the fictional demo session. The temporary receipt display used while recording is not a separate product feature.

## Captioned synthetic AI demonstration

[Watch the earlier captioned recording](https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo-captioned.mp4). It shows a separate, limited AI task on fictional research text. The video does not show a real study or real participants.

## Other preserved recordings

- [Original recording on the live demo host](https://mindcommons-mozilla-demo.bepoadewale1.workers.dev/mindcommons-demo.mp4)
- [Original recording on GitHub Pages](https://bepoadewale.github.io/mindcommons/mindcommons-demo.mp4)
- [Captioned recording on GitHub Pages](https://bepoadewale.github.io/mindcommons/mindcommons-demo-captioned.mp4)

## Recreate the walkthrough

From the repository root, run `npm run demo:record`. This uses a fresh fictional session on the live MindCommons demo. It sends one request that is expected to be denied and checks that the receipt says AI was not attempted. It does not call the AI model.

The browser recording is saved under `/private/tmp/mindcommons-reviewer-video`. To make the MP4 in the existing project location:

```sh
ffmpeg -i <playwright-recording.webm> -map 0:v:0 -an -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart apps/web/public/mindcommons-demo-authorization.mp4
```

The recording should be checked with `ffprobe` and decoded before publishing. After GitHub Pages publishes it, verify that it opens without sign-in and is served as an MP4. Never describe the preview as an AI run.
