#
# Authorship: Runze Chen (F) owns the Manim-based CS concept animation for the final project video.
# Scope: Custom technical animation showing Version 1 blocking flow versus Version 2 event-driven orchestration.
#

from manim import *


class SocialCompactPipeline(Scene):
    """Animate the technical difference between V1 and V2.

    Render:
        manim -pqh project-video/manim/socialcompact_pipeline.py SocialCompactPipeline
    """

    # Author: Runze Chen (F) - orchestrates the full Manim comparison scene shown in the final video.
    def construct(self):
        self.camera.background_color = "#06111f"

        title = Text(
            "SocialCOMPACT: blocking result vs live event pipeline",
            font="Arial",
            font_size=30,
            weight=BOLD,
        ).to_edge(UP)
        subtitle = Text(
            "V1 waits. V2 streams live events into the UI.",
            font="Arial",
            font_size=18,
            color=BLUE_A,
        ).next_to(title, DOWN, buff=0.18)

        self.play(Write(title), FadeIn(subtitle, shift=DOWN * 0.2), run_time=1.2)
        self.wait(0.4)

        left_label = self.section_label("Version 1: MIEC submission", RED_A)
        right_label = self.section_label("Version 2: public live demo", GREEN_A)
        left_label.move_to(LEFT * 3.55 + UP * 2.12)
        right_label.move_to(RIGHT * 3.55 + UP * 2.12)
        divider = Line(UP * 2.2, DOWN * 3.1, color=GRAY_B, stroke_opacity=0.55)
        self.play(FadeIn(left_label), FadeIn(right_label), Create(divider))

        self.animate_v1()
        self.animate_v2()
        self.compare_takeaway()

    # Author: Runze Chen (F) - shared visual helper for labeled scene headers in the Manim clip.
    def section_label(self, text, color):
        label = Text(text, font="Arial", font_size=21, weight=BOLD)
        box = RoundedRectangle(
            corner_radius=0.16,
            width=label.width + 0.45,
            height=0.52,
            color=color,
            fill_color=color,
            fill_opacity=0.16,
        )
        return VGroup(box, label)

    # Author: Runze Chen (F) - shared helper for drawing pipeline and service boxes in the technical animation.
    def service_box(self, text, color, width=2.15):
        label = Text(text, font="Arial", font_size=17, weight=BOLD)
        box = RoundedRectangle(
            corner_radius=0.18,
            width=width,
            height=0.76,
            color=color,
            fill_color=color,
            fill_opacity=0.12,
        )
        return VGroup(box, label)

    # Author: Runze Chen (F) - animates the Version 1 blocking and mostly opaque match flow.
    def animate_v1(self):
        frontend = self.service_box("Frontend", BLUE_B).move_to(LEFT * 5.1 + UP * 1.05)
        backend = self.service_box("Backend", GREEN_B).move_to(LEFT * 3.05 + UP * 0.0)
        arena = self.service_box("Arena + Agents", YELLOW_B, width=2.55).move_to(
            LEFT * 5.1 + DOWN * 1.05
        )
        result = self.service_box("Final result", RED_B, width=2.35).move_to(
            LEFT * 3.05 + DOWN * 2.32
        )

        arrow1 = Arrow(frontend.get_right(), backend.get_left(), buff=0.16, color=BLUE_A)
        arrow2 = Arrow(backend.get_left(), arena.get_right(), buff=0.18, color=YELLOW_A)
        arrow3 = Arrow(arena.get_right(), result.get_left(), buff=0.16, color=RED_A)

        wait_ring = Circle(radius=0.24, color=RED_A).move_to(LEFT * 4.05 + DOWN * 1.7)
        wait_text = Text("waiting...", font="Arial", font_size=17, color=RED_A).next_to(
            wait_ring, RIGHT, buff=0.12
        )
        hidden = Text("process mostly hidden", font="Arial", font_size=18, color=GRAY_B).move_to(
            LEFT * 4.05 + DOWN * 3.0
        )

        self.play(
            LaggedStart(
                FadeIn(frontend, shift=UP * 0.2),
                FadeIn(backend, shift=UP * 0.2),
                FadeIn(arena, shift=UP * 0.2),
                lag_ratio=0.18,
            )
        )
        self.play(Create(arrow1), Create(arrow2), run_time=0.9)
        self.play(Create(wait_ring), Write(wait_text), run_time=0.8)
        self.play(Rotate(wait_ring, angle=TAU, rate_func=linear), run_time=1.4)
        self.play(Create(arrow3), FadeIn(result, shift=UP * 0.2), Write(hidden), run_time=1.1)
        self.wait(0.5)

    # Author: Runze Chen (F) - animates the Version 2 background orchestration and live event stream.
    def animate_v2(self):
        x = 3.35
        services = [
            self.service_box("Start match", BLUE_B, width=2.25).move_to(RIGHT * x + UP * 1.15),
            self.service_box("Match id", GREEN_B, width=2.05).move_to(RIGHT * x + UP * 0.32),
            self.service_box("Background Arena run", YELLOW_B, width=3.05).move_to(
                RIGHT * x + DOWN * 0.51
            ),
            self.service_box("Structured logs", TEAL_B, width=2.55).move_to(
                RIGHT * x + DOWN * 1.34
            ),
            self.service_box("Live mini theater", PURPLE_B, width=2.75).move_to(
                RIGHT * x + DOWN * 2.17
            ),
        ]

        arrows = [
            Arrow(services[i].get_bottom(), services[i + 1].get_top(), buff=0.1, color=BLUE_A)
            for i in range(len(services) - 1)
        ]

        self.play(LaggedStart(*[FadeIn(s, shift=DOWN * 0.15) for s in services], lag_ratio=0.12))
        self.play(LaggedStart(*[Create(a) for a in arrows], lag_ratio=0.16), run_time=1.3)

        events = [
            ("chat", "#67e8f9"),
            ("reasoning", "#c4b5fd"),
            ("prediction", "#fde68a"),
            ("decision", "#fda4af"),
            ("observation", "#86efac"),
        ]
        event_dots = VGroup()
        for index, (name, color) in enumerate(events):
            dot = Dot(color=color).scale(0.82).move_to(RIGHT * 5.25 + UP * (1.18 - index * 0.38))
            label = Text(name, font="Arial", font_size=15, color=color).next_to(
                dot, RIGHT, buff=0.12
            )
            event_dots.add(VGroup(dot, label))

        self.play(LaggedStart(*[FadeIn(e, shift=RIGHT * 0.15) for e in event_dots], lag_ratio=0.12))
        for event_group in event_dots:
            dot = event_group[0]
            target = services[-1].get_right() + RIGHT * 0.15
            trail = dot.copy()
            self.play(
                trail.animate.move_to(target).set_opacity(0.25),
                Flash(dot, color=dot.get_color(), flash_radius=0.35),
                run_time=0.35,
            )
            self.remove(trail)

        insight = Text(
            "The UI can render progress because the run is an event stream.",
            font="Arial",
            font_size=17,
            color=GREEN_A,
        ).move_to(RIGHT * 3.35 + DOWN * 2.72)
        self.play(Write(insight), run_time=1.0)
        self.wait(0.5)

    # Author: Runze Chen (F) - closes the clip with the V1-versus-V2 technical takeaway.
    def compare_takeaway(self):
        panel = RoundedRectangle(
            width=10.7,
            height=1.2,
            corner_radius=0.22,
            color=BLUE_A,
            fill_color="#0b1b2f",
            fill_opacity=0.9,
        ).to_edge(DOWN, buff=0.35)
        text = Text(
            "Core improvement: from final-result waiting to live, inspectable Agent state.",
            font="Arial",
            font_size=24,
            weight=BOLD,
            color=WHITE,
        ).move_to(panel)
        self.play(FadeIn(panel, shift=UP * 0.2), Write(text), run_time=1.1)
        self.wait(1.4)
