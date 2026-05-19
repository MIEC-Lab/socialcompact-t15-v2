# SocialCOMPACT Video Script

Working title: **SocialCOMPACT: From Static Results to Live Multi-Agent Arena**

Target length: 85-90 seconds.

## Narration

What if a web app could show two AI agents negotiating, predicting, and acting in a social survival game, live?

SocialCOMPACT is a CS183 deployment project for multi-agent game evaluation. A Next.js frontend starts a Survivor match, a FastAPI backend coordinates the run, and Render services host the Arena and two Agent endpoints.

Version 1, the MIEC submission, exposed the first working web flow and polling logs. It could start a match and eventually show results, but the user experience was still fragile: Render services could be asleep, requests could wait too long, and the game process was mostly hidden behind generic running states.

Version 2 redesigns the flow around asynchronous orchestration. The backend returns a match id immediately, wakes the Arena and Agent services, streams live artifacts into logs, and the frontend polls those logs every few seconds.

The key change is turning an opaque blocking run into an event pipeline. Chat, reasoning, prediction, decisions, observations, and final verdicts become visible states that the UI can render.

The result is a more playable public demo. Users can verify whether the run came from the real Arena, inspect Agent reasoning, and watch the match as a mini theater instead of waiting on a blank queued screen.

The trade-off is operational complexity: four deployed services must stay healthy, and free Render instances can still cold start. Next, I would improve winner tie handling, add persistent match replay storage, and add a one-click health preflight before every run.

## Timing

| Time | Segment | Visual |
| --- | --- | --- |
| 0-8s | Hook | Title card with two Agents and Arena |
| 8-18s | Project overview | Architecture diagram |
| 18-34s | Version 1 | Blocking flow and hidden logs |
| 34-55s | Version 2 | Manim event pipeline |
| 55-70s | Comparison | Side-by-side metrics |
| 70-82s | Demo | SocialCOMPACT UI screenshots |
| 82-90s | Reflection | Takeaways and future work |

## Required comparison claim

Version 1 made the web demo possible. Version 2 made it understandable and playable by replacing a mostly opaque request/result flow with visible live Agent artifacts.

