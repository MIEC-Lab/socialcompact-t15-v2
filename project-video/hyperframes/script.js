window.buildSocialCompactTimeline = () => {
      const tl = gsap.timeline({ paused: true });

      tl.from("#hook h1", { opacity: 0, y: 42, duration: 0.8 }, 0.2)
        .from("#hook .lede", { opacity: 0, y: 28, duration: 0.7 }, 0.8)
        .from("#overview-card", { opacity: 0, x: -70, duration: 0.7 }, 8.1)
        .from("#architecture", { opacity: 0, scale: 0.94, duration: 0.9 }, 8.3)
        .from("#versions-title h1", { opacity: 0, y: 45, duration: 0.8 }, 18.1)
        .from("#v1-card", { opacity: 0, x: -80, duration: 0.8 }, 22)
        .from("#v2-card", { opacity: 0, x: 80, duration: 0.8 }, 22.25)
        .from("#manim-title h1", { opacity: 0, y: 42, duration: 0.7 }, 37)
        .from("#manim-frame", { opacity: 0, y: 45, duration: 0.7 }, 41)
        .to("#manim-frame .manim-placeholder", { opacity: 0.1, duration: 0.5 }, 42.3)
        .from("#metrics-title h1", { opacity: 0, y: 38, duration: 0.7 }, 59)
        .from("#metrics-grid .metric", { opacity: 0, y: 55, stagger: 0.15, duration: 0.7 }, 63)
        .from("#demo-title h1", { opacity: 0, y: 38, duration: 0.6 }, 74)
        .from("#demo-ui", { opacity: 0, scale: 0.96, duration: 0.7 }, 77)
        .from("#demo-ui .bubble", { opacity: 0, y: 30, stagger: 0.2, duration: 0.6 }, 77.4)
        .from("#demo-ui .stick", { opacity: 0, y: 35, stagger: 0.16, duration: 0.55 }, 78)
        .from("#reflection h1", { opacity: 0, y: 38, duration: 0.6 }, 85)
        .from("#reflection .card", { opacity: 0, y: 40, stagger: 0.12, duration: 0.45 }, 85.9);

      return tl;
};

