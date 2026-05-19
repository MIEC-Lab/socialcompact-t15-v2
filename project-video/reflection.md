# Reflection Draft

The CS concept visualized in this video is asynchronous multi-service orchestration with event-log based UI rendering. SocialCOMPACT runs a multi-agent Survivor game across a frontend, a backend, an Arena service, and two Agent services. The important technical change between Version 1 and Version 2 is that the user no longer has to wait for a mostly opaque long-running request. Instead, Version 2 turns the match into a sequence of visible events: chat, reasoning, prediction, decision, observation, and final verdict.

Manim is useful for this part because the architecture change is easier to understand as a moving pipeline than as static text. The animation can show Version 1 as a blocking request that waits for a final result, then show Version 2 as an asynchronous flow where the backend returns a match id, runs the Arena in the background, writes log events, and lets the frontend poll for updates.

HyperFrames is useful for the final composition because the full video needs more than an algorithm animation. It needs a title screen, captions, screenshots of the deployed app, before/after labels, metrics, and a polished final takeaway. HTML and CSS are a natural fit for assembling those visual sections.

The main weakness of Version 1 was usability and observability. The web demo worked, but users could still encounter service wake-up delays and generic running states without understanding whether the real Agent run was progressing. Version 2 introduced a clearer deployment flow, faster health responses, background orchestration, and a live Agent mini theater.

The evidence for improvement is visible in the UI and codebase. Version 2 exposes live Agent artifacts, distinguishes real Arena runs from fallback results, adds public deployment configuration, and improves health checks. The trade-off is that the system is more operationally complex: four deployed services must be available, and free Render services can still cold start.

The most effective visual comparison is the side-by-side event pipeline. It shows that the core improvement is not just a prettier page, but a change in system behavior: from waiting for a final artifact to rendering a live stream of structured Agent events. In a second version, I would improve tie handling in the Arena result interpretation, add durable replay storage, and add a one-click preflight check before starting a match.

