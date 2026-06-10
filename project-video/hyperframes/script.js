/*
 * Authorship: Runze Chen (F) owns the HyperFrames animation timeline for the final project video.
 * Scope: GSAP-driven scene timing, transitions, and motion choreography for the formal comparison cut.
 */

// Author: Runze Chen (F) - builds the master HyperFrames timeline used to animate the formal video sequence.
window.buildSocialCompactTimeline = () => {
  const tl = gsap.timeline({ paused: true });
  const soft = { ease: "power2.out" };
  const punch = { ease: "back.out(1.5)" };

  tl.to(".spark-a", { x: 220, y: 90, duration: 300, ease: "none" }, 0)
    .to(".spark-b", { x: -180, y: 140, duration: 300, ease: "none" }, 0)
    .to(".spark-c", { x: -140, y: -180, duration: 300, ease: "none" }, 0);

  tl.from("#hero .survivor-stage", { opacity: 0, x: -70, scale: 0.94, duration: 0.8, ...soft }, 0.1)
    .from("#hero .stage-header", { opacity: 0, y: -14, duration: 0.35, ...soft }, 0.55)
    .from("#hero .actual-theater-window", { opacity: 0, y: 26, scale: 0.96, duration: 0.62, ...soft }, 0.78)
    .to("#hero .actual-theater-window img", { scale: 1.035, duration: 12, ease: "none" }, 0.9)
    .from("#hero .secret-card", { opacity: 0, y: -16, scale: 0.75, rotation: -18, duration: 0.55, ...punch }, 2.05)
    .from("#hero .betray-stamp", { opacity: 0, scale: 1.8, rotation: -22, duration: 0.42, ...punch }, 2.85)
    .from("#hero .attack-line", { opacity: 0, scaleX: 0, duration: 0.38, ...soft }, 3.05)
    .from("#hero .hook-v1", { opacity: 0, x: -24, duration: 0.4, ...soft }, 4.15)
    .from("#hero .hook-v2", { opacity: 0, x: 24, duration: 0.4, ...soft }, 4.65)
    .to("#hero .betray-stamp", { scale: 1.06, duration: 0.28, yoyo: true, repeat: 3, ease: "sine.inOut" }, 5.1)
    .from("#hero .hook-copy", { opacity: 0, x: 72, duration: 0.75, ...soft }, 5.55)
    .from("#hero .eyebrow", { opacity: 0, y: 18, duration: 0.42 }, 5.75)
    .from("#hero h1", { opacity: 0, y: 42, duration: 0.75, ...soft }, 6.05)
    .from("#hero .lede", { opacity: 0, y: 24, duration: 0.6, ...soft }, 6.7)
    .from("#hero .hook-metrics div", { opacity: 0, y: 28, scale: 0.92, stagger: 0.12, duration: 0.42, ...punch }, 7.35)
    .from("#hero .hero-question", { opacity: 0, scale: 0.94, duration: 0.55, ...soft }, 8.25)
    .to("#hero .hook-v2", { boxShadow: "0 0 42px rgba(74, 222, 128, 0.38)", duration: 0.7, yoyo: true, repeat: 8, ease: "sine.inOut" }, 8.9);

  tl.from("#overview .eyebrow", { opacity: 0, y: 18, duration: 0.4 }, 18.2)
    .from("#overview h2", { opacity: 0, y: 40, duration: 0.7, ...soft }, 18.45)
    .from("#overview .text-panel", { opacity: 0, x: -60, duration: 0.8, ...soft }, 19.0)
    .from("#overview .shot-home", { opacity: 0, x: 90, y: 20, duration: 0.6, ...punch }, 19.4)
    .from("#overview .shot-start", { opacity: 0, x: 120, y: 40, duration: 0.6, ...punch }, 20.0)
    .from("#overview .shot-result", { opacity: 0, x: 160, y: 60, duration: 0.7, ...punch }, 20.7)
    .to("#overview .shot-card", { y: -10, stagger: 0.12, duration: 1.2, yoyo: true, repeat: 6, ease: "sine.inOut" }, 22.0);

  tl.from("#architecture .eyebrow", { opacity: 0, y: 18, duration: 0.4 }, 42.2)
    .from("#architecture h2", { opacity: 0, y: 36, duration: 0.7, ...soft }, 42.45)
    .from("#architecture .image-frame", { opacity: 0, scale: 0.96, duration: 0.8, ...soft }, 43.0)
    .from("#architecture .callout-bar", { opacity: 0, y: 24, duration: 0.5, ...soft }, 44.1)
    .to("#architecture .image-frame img", { scale: 1.03, duration: 22, ease: "none" }, 43.0);

  tl.from("#version-1 .eyebrow", { opacity: 0, y: 18, duration: 0.4 }, 66.2)
    .from("#version-1 h2", { opacity: 0, y: 36, duration: 0.7, ...soft }, 66.45)
    .from("#version-1 .version-card", { opacity: 0, y: 30, scale: 0.95, stagger: 0.16, duration: 0.6, ...punch }, 67.2)
    .to("#version-1 .spinner-ring", { rotation: 3360, duration: 28, ease: "none" }, 68.0);

  tl.from("#blockers .eyebrow", { opacity: 0, y: 18, duration: 0.4 }, 96.2)
    .from("#blockers h2", { opacity: 0, y: 36, duration: 0.7, ...soft }, 96.45)
    .from("#blockers .boss-pair", { opacity: 0, y: 38, stagger: 0.18, duration: 0.6, ...punch }, 97.1)
    .to("#blockers .boss-images img:first-child", { scale: 1.04, duration: 1.2, stagger: 0.2, yoyo: true, repeat: 7, ease: "sine.inOut" }, 98.0)
    .to("#blockers .boss-images img:last-child", { scale: 1.02, duration: 1.2, stagger: 0.2, yoyo: true, repeat: 7, ease: "sine.inOut" }, 98.5);

  tl.from("#backend .eyebrow", { opacity: 0, y: 18, duration: 0.4 }, 126.2)
    .from("#backend h2", { opacity: 0, y: 36, duration: 0.7, ...soft }, 126.45)
    .from("#backend .image-frame", { opacity: 0, scale: 0.96, duration: 0.8, ...soft }, 127.0)
    .from("#backend .three-tags span", { opacity: 0, y: 18, stagger: 0.14, duration: 0.42, ...punch }, 128.0)
    .to("#backend .image-frame img", { scale: 1.025, duration: 34, ease: "none" }, 127.0);

  tl.from("#a2a .eyebrow", { opacity: 0, y: 18, duration: 0.4 }, 162.2)
    .from("#a2a h2", { opacity: 0, y: 36, duration: 0.7, ...soft }, 162.45)
    .from("#a2a .image-frame", { opacity: 0, scale: 0.965, duration: 0.8, ...soft }, 163.0)
    .from("#a2a .callout-bar", { opacity: 0, y: 20, duration: 0.45, ...soft }, 164.0)
    .to("#a2a .image-frame img", { scale: 1.025, duration: 28, ease: "none" }, 163.0);

  tl.from("#game-logic .eyebrow", { opacity: 0, y: 18, duration: 0.4 }, 192.2)
    .from("#game-logic h2", { opacity: 0, y: 36, duration: 0.7, ...soft }, 192.45)
    .from("#game-logic .image-frame", { opacity: 0, scale: 0.965, duration: 0.8, ...soft }, 193.0)
    .from("#game-logic .three-tags span", { opacity: 0, y: 18, stagger: 0.14, duration: 0.42, ...punch }, 194.0)
    .to("#game-logic .image-frame img", { scale: 1.03, duration: 28, ease: "none" }, 193.0);

  tl.from("#manim .eyebrow", { opacity: 0, y: 18, duration: 0.4 }, 222.2)
    .from("#manim h2", { opacity: 0, y: 36, duration: 0.7, ...soft }, 222.45)
    .from("#manim .video-card", { opacity: 0, y: 28, stagger: 0.15, duration: 0.65, ...punch }, 223.0)
    .from(".manim-float-left, .manim-float-right", { opacity: 0, y: 28, stagger: 0.12, duration: 0.65, ...soft }, 223.15)
    .to("#manim .video-card", { y: -8, stagger: 0.12, duration: 1.0, yoyo: true, repeat: 5, ease: "sine.inOut" }, 224.2);

  tl.from("#compare .eyebrow", { opacity: 0, y: 18, duration: 0.4 }, 246.2)
    .from("#compare h2", { opacity: 0, y: 36, duration: 0.7, ...soft }, 246.45)
    .from("#compare .metrics-column > *", { opacity: 0, x: -40, stagger: 0.12, duration: 0.5, ...soft }, 247.2)
    .from("#compare .image-frame", { opacity: 0, x: 60, duration: 0.7, ...soft }, 247.5)
    .to("#compare .image-frame img", { scale: 1.03, duration: 22, ease: "none" }, 247.5);

  tl.from("#demo .eyebrow", { opacity: 0, y: 18, duration: 0.4 }, 270.2)
    .from("#demo h2", { opacity: 0, y: 36, duration: 0.7, ...soft }, 270.45)
    .from("#demo .demo-main", { opacity: 0, x: -40, duration: 0.7, ...soft }, 271.0)
    .from("#demo .demo-side", { opacity: 0, x: 40, duration: 0.7, ...soft }, 271.4)
    .to("#demo .image-frame img", { scale: 1.025, duration: 20, ease: "none" }, 271.0);

  tl.from("#reflection .eyebrow", { opacity: 0, y: 18, duration: 0.4 }, 292.15)
    .from("#reflection h1", { opacity: 0, y: 38, duration: 0.65, ...soft }, 292.45)
    .from("#reflection p", { opacity: 0, y: 24, duration: 0.5, ...soft }, 293.2)
    .from("#reflection .role-note span", { opacity: 0, y: 18, stagger: 0.12, duration: 0.38, ...soft }, 294.0);

  return tl;
};
