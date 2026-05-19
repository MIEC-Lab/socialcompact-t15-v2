from manim import *

from socialcompact_pipeline import SocialCompactPipeline


class Version1Scene(SocialCompactPipeline):
    """Assignment entry point for the Version 1 portion of the comparison."""

    def construct(self):
        self.camera.background_color = "#06111f"

        title = Text("Version 1: MIEC submission", font_size=38, weight=BOLD).to_edge(UP)
        subtitle = Text(
            "A first working web flow, but the long-running Agent process stayed mostly opaque.",
            font_size=22,
            color=BLUE_A,
        ).next_to(title, DOWN, buff=0.2)
        label = self.section_label("queued / running / final result", RED_A).move_to(UP * 2.1)

        self.play(Write(title), FadeIn(subtitle, shift=DOWN * 0.15), FadeIn(label))
        self.animate_v1()
        self.wait(1.0)
