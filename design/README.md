# Campus guide redesign

Status: direction approved September 14, 2026; visual mockup pending review. The user asked to see the proposed desktop and mobile design before the live interface changes.

## Direction

Make the site feel like a practical Cal Poly student guide with editorial typography, compact information, restrained green and gold, and fewer decorative containers. Keep search the main task. Proposed headline: "Find clubs, projects, and career events at Cal Poly."

Career announcements stay below filters and above opportunity results. Use an agenda with a prominent next date and concise subsequent rows. Give comparable opportunity results consistent visual weight. Reduce oversized icon tiles, repeated category pills, decorative borders and generic section copy. Study spots can use real location photos with verified reuse permission; resources should be grouped by student need; bookmarks should prioritize retrieval.

Preserve official sources, honest matching, unrestricted exploration, bookmark storage, the four navigation destinations, accessible expanding details, and the voluntary bug report flow. Illustrative mockups do not establish factual claims or authorize new event data. Do not present generated campus imagery as real photography.

## Checkpoints

1. Save the redesign brief on `design/campus-guide-refresh`.
2. Save the desktop/mobile visual proposal and open a review PR. Get visual approval before implementing the redesign.
3. Implement the approved Opportunities layout, typography, filters, and career agenda as a coherent tested checkpoint.
4. Apply appropriate layouts to Study Spots, Campus Resources, and Bookmarks, with focused commits as each coherent unit is ready.
5. Address verified accessibility, performance, metadata, and regression findings. Test, review the diff, commit and push each completed unit.
6. Merge approved, verified PRs and confirm both GitHub Actions deployment and the live site. Preserve normal history and avoid force pushes or cosmetic commits solely to increase the count.

Use further branches and PRs for later implementation milestones. The initial design PR contains review artifacts only. No changes to publishing settings or the instructor example are needed.

## Verification

For documentation and mockups: inspect artifacts, check local links and the diff. For implementation: run the relevant Node, browser integration and shared template checks; verify desktop/mobile rendering, keyboard operation, reduced motion, matching, bookmarks, event expiry, empty/error states and official links. Measure performance and contrast rather than assume failures from the visual style.
