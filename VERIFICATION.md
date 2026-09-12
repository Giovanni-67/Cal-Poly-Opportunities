# Opportunity Matcher verification

September 12, 2026 — first implementation on `build/opportunity-matcher`.

## Functional checks

- `node --test tests/matcher.test.cjs`: 12 tests passed.
- `node tests/check.cjs`: all 48 existing template/example checks passed, including 20 coastal preference combinations.
- `tests/browser.html` in Codex's in-app Chromium browser: 17 integration tests passed, 0 failed. Tests exercise the real page/controller in an iframe, not a mocked matcher.
- JavaScript syntax checks passed for app, matcher, data, and browser tests. `git diff --check` passed.
- Real keyboard checks: Enter submits search and opens a card; Tab and Shift+Tab wrap within the modal; Escape closes and restores the originating card's focus. Clicking the blurred backdrop also closes and restores focus.
- Desktop 1366px, tablet 768px, and phone 390px widths were rendered. No horizontal overflow. The phone modal fits within its viewport and exposes the source link.
- No warnings or errors observed in the main app's browser log. Source descriptions were checked against official pages; these are not live-opening claims.

Covered boundaries: empty and unknown searches, case and punctuation, common major aliases, whole-word AI matching, multiple interests, all categories, repeated operations, stable append order, stale-result removal, duplicate data, missing data/matcher, invalid filters/types, 200/201-character inputs, spoofed/unsafe URLs, untrusted text, modal reopening, rapid double close, detail collapse, and focus restoration.

The automated focus test initially attempted to focus a link before its reveal transition completed; it now waits for that transition and asserts the link actually has focus before testing the wrap. The real-keyboard path was separately exercised.

## Design fidelity review

The approved concept is a two-state presentation board, rather than a single browser viewport. Its discovery and expanded-card states were compared with local browser screenshots using `view_image`; the original concept and final desktop, tablet, and phone/modal screenshots were inspected. Production checks used 1366×900 desktop, 768×1000 tablet, and 390×844 phone viewports; the combined presentation board is not a meaningful app viewport.

| Comparison | Result |
| --- | --- |
| Headline, search placeholder, CTA and navigation | Approved visible copy retained. |
| Palette | Warm off-white canvas, white surfaces, forest green and muted gold retained. |
| Typography | System sans-serif hierarchy, strong headline, restrained labels and readable descriptions. |
| Layout and spacing | Open header/hero, integrated search, pill filters and four-column desktop grid. Header/hero spacing tightened during review. |
| Cards and icons | Top-right type tags, local outline icons, concise descriptions, match reasons and Explore action. |
| Expanded state | Centered sharp card, animated backdrop blur, match explanation, expanding details and official Learn more link. |
| Responsive continuation | Two tablet columns and one phone column; wrapped filters and full-width phone search action. |
| Motion and keyboard | Finite transitions, native dialog, explicit focus wrap and reduced-motion branch. |

Intentional differences: real opportunity names replace fictional examples; Curated collection replaces the sample label; status and Browse all provide necessary feedback/recovery; Startups and Hands-on filters implement the full requested scope; source context and review dates replace sample footnotes. Browser chrome/fictitious university hostname are not page content. The small decorative landscape and decorative slogan were omitted; the interface uses local icons and no photo assets. Footer About/Resources links have real destinations. The above-the-fold copy was compared against the approved concept plus these recorded functional additions. No unexplained material design mismatch remains.

## Limits

The JavaScript reduced-motion branch is tested with a simulated media preference; CSS media-query handling was inspected. The actual OS reduced-motion setting, screen-reader output, Safari/Firefox, and a complete automated accessibility audit were not tested in this environment. No authenticated internship applications were accessed or submitted. The dataset is curated, not exhaustive. Local preview evidence does not by itself establish deployment; live Pages verification occurs after merge.

`examples/`, shared `docs/`, and `.nojekyll` are unchanged from the original repository.
