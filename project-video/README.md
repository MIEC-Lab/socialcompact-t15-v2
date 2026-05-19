# SocialCOMPACT CS183 Video

This folder contains a reproducible "video as code" explainer for the CS183 SocialCOMPACT project.

## Project Title

SocialCOMPACT: From Static Results to Live Multi-Agent Arena

## CS Concept Explained

The video explains asynchronous multi-service orchestration and event-log visualization in a real web deployment. The core technical idea is that a long-running Agent match should not block the user interface. Instead, the backend creates a match id immediately, runs the Arena in the background, stores structured log events, and lets the frontend poll and render the newest state.

## Version Comparison

### Version 1

Version 1 is the MIEC submission at commit `f22f70c` / tag `v1`: `Stream live agent events to polling logs`.

It provided the first working web flow and polling logs for SocialCOMPACT, but the deployed user experience was still fragile. Users could see a queued/running state and final results, yet Render cold starts, service health checks, and Agent reasoning were not presented as a polished, readable experience.

### Version 2

Version 2 is the current `origin/main` line. It adds:

- Public Vercel + Render deployment configuration.
- Responsive Agent health checks.
- Backend orchestration that returns a running match quickly while the real Arena run continues.
- Live Agent artifact polling.
- A refined results page with Agent chat, reasoning, prediction, decision cards, and the mini theater UI.

## Evidence Used for Comparison

- Git comparison: `git diff --stat v1..HEAD`
- Public deployment evidence: Vercel frontend plus Render backend/Arena/Agent services.
- UX evidence: Version 2 exposes live `chat`, `reasoning`, `prediction`, `decision`, and `observation` logs on the results page.
- Operational evidence: Version 2 includes Render health paths and public deployment docs.

## Folder Structure

```text
project-video/
  manim/
    socialcompact_pipeline.py
    version1_scene.py
    version2_scene.py
    comparison_scene.py
    comparison_demo.mp4
  hyperframes/
    index.html
    package.json
    hyperframes.json
    meta.json
  assets/
    screenshots/
    diagrams/
    metrics/
    manim/
    audio/
  script.md
  reflection.md
```

## Rendered Output

The latest local render is:

```text
project-video/hyperframes/final_video.mp4
```

The rendered Manim clip used inside the final video is:

```text
project-video/assets/manim/socialcompact_pipeline.mp4
```

## How to Render the Manim Animation

From the repository root:

```powershell
.\project-video\render_manim.ps1
```

The script creates a local Python virtual environment, installs Manim, renders the custom `SocialCompactPipeline` scene, and copies the clip into `project-video/assets/manim/socialcompact_pipeline.mp4`.

It also copies the same rendered technical comparison clip to `project-video/manim/comparison_demo.mp4` so the submitted folder matches the assignment's requested Manim deliverable name.

## How to Render the HyperFrames Video

From the HyperFrames folder:

```powershell
.\project-video\render_hyperframes.ps1
```

The script installs the local Node dependencies, prepares local FFmpeg/FFprobe shims, uses local Chrome when available, and renders:

```text
project-video/hyperframes/final_video.mp4
```

## Dependencies

- Node.js 22+
- HyperFrames CLI
- Chrome or Chromium for HyperFrames preview/render
- Local FFmpeg and FFprobe via the `ffmpeg-static` and `ffprobe-static` npm packages
- Python 3.10+
- Manim

## Notes

The final HyperFrames MP4 and generated dependency folders are intentionally ignored by Git. Commit the source folder, then upload or submit `project-video/hyperframes/final_video.mp4` separately when the course platform asks for the final video file.
