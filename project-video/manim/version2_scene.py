#
# Authorship: Runze Chen (F) owns the Version 2 Manim cut used in the project-video pipeline.
# Scope: Entry scene focused on the deployed live-demo architecture and streamed event visibility.
#

from manim import *

from socialcompact_pipeline import SocialCompactPipeline


# Author: Runze Chen (F) - wrapper scene for the Version 2-focused Manim segment.
class Version2Scene(SocialCompactPipeline):
    """Assignment entry point for the Version 2 portion of the comparison."""

    # Author: Runze Chen (F) - composes the Version 2-only title, label, and inherited V2 animation.
    def construct(self):
        self.camera.background_color = "#06111f"

        title = Text("Version 2: live public demo", font_size=38, weight=BOLD).to_edge(UP)
        subtitle = Text(
            "The deployed system returns a match id quickly, then streams structured Agent events.",
            font_size=22,
            color=GREEN_A,
        ).next_to(title, DOWN, buff=0.2)
        label = self.section_label("chat / reasoning / prediction / decision", GREEN_A).move_to(UP * 2.1)

        self.play(Write(title), FadeIn(subtitle, shift=DOWN * 0.15), FadeIn(label))
        self.animate_v2()
        self.wait(1.0)
