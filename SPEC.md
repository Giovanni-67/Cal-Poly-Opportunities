# TARGET: Cal Poly Opportunity Matcher

Choose the idea, person, interaction, and visual direction. The agent can help phrase and save your decisions after you approve them. The provided scope and review safeguards stay in place.

- **Thing:** A one-page Cal Poly Opportunity Matcher. Search by major or interest, optionally select multiple interests, and click Find Opportunities to discover relevant clubs, research, internships, competitions, startups, and hands-on projects.
- **Audience:** A Cal Poly student who wants to build experience and strengthen their resume but does not know which opportunities match their interests.
- **Requirements:** Either major or interest can start discovery through a search bar labeled "Search for your major or interest". Type filters refine results; newly discovered matches append below existing matches without duplicates, with nonmatching results hidden. Browsing all remains available: majors guide discovery, never determine eligibility. Cards show a title, short description, top-right category tag, and honest match reason. No eligibility fields. Curate real local data from official sources and follow the approved standing rule.
- **Guardrails:** Static browser code. No required external service, keys, accounts, runtime AI, or private data. Label fictional or sample content. Preserve the example and publishing setup. Work on a branch and wait for human review before shipping.
- **Experience:** Match the approved two-state mockup: warm off-white page, white cards, forest green text/buttons, restrained gold accents, modern sans-serif typography, open spacing, clear type filters and a responsive card grid. Clicking a card animates it larger into the center as the background blurs; expandable details reveal a Learn more link. Keep keyboard controls, focus management, Escape dismissal, and reduced-motion support.
- **Test:** Verify major-first and interest-first searches, multiple interests, type filters, stable append ordering, empty/unknown queries, duplicates, malformed/missing data, safe official URLs, modal opening/closing, focus restoration, rapid interactions, reduced motion, and mobile/desktop layouts. Check every factual description against its source. Preview the build branch and verify the same registered Pages URL after the approved release.

The coastal example has a [completed TARGET](examples/coast/SPEC.md). It demonstrates the format, not a required topic.

## Approved project decisions

The student confirmed the starter was live and successfully submitted to the club portal, approved the standing rule and visual concept, and authorized implementation plus meaningful tested commits, pushes, and merges on September 12, 2026. Build branch: `build/opportunity-matcher`. Preserve the template example, shared teaching documentation, and publishing configuration.

Following the student’s approved expansion, club coverage includes the 406 San Luis Obispo student organizations in the public Cal Poly Now directory snapshot reviewed September 12, 2026. Additional programs remain curated; this is not a live openings feed or a claim to include private, unlisted, or future organizations. Official external pages may have their own sign-in or participation requirements; discovery in this app requires neither. Matching tags and major associations are editorial, not admissions criteria. New searches show current matches, retaining the discovery order of previously seen cards and appending new ones; Browse all resets discovery ordering.


## Approved campus discovery expansion — September 13, 2026

The student approved implementing related activities, study spots, expanded campus resources, and bookmarks. Keep the existing single-page design and discovery-first interaction. Primary navigation is Opportunities, Study Spots, Campus Resources, then Bookmarks; use visible desktop tabs and a compact mobile menu. Move About to the footer. Build Experience remains deferred.

Show direct opportunity matches first and related activities separately, explaining the topic or shared discovery tag without implying the activity itself is the searched activity. Preserve type filters, stable result ordering, unrestricted browsing, and official-source requirements. Related connections span interests beyond water activities.

Study spots and resources use a curated local dataset with source dates, search, category or feature filters, and the existing accessible expanding card. Publish only verified location and feature claims. Do not imply live seats, noise, availability, opening hours, or current vacancies.

Save all three item kinds with independent bookmark icon buttons and a searchable Bookmarks view. Use local browser storage, no accounts or device sync. Disclose storage limits and show honest session-only feedback on blocked, corrupt, or full storage. Test persistence, repeated toggles, filtering, pagination, unique accessible IDs, keyboard focus after removal, navigation, and data failures alongside existing regressions. The previously approved static architecture, example preservation, and meaningful tested commit/push workflow remain in force.

## Approved bug reporting — September 13, 2026

The student requested a Report bugs destination with name, email, and bug-description fields, using the Polyratings FAQ as visual inspiration. Keep the four primary tabs; put Report bugs in the footer with a compact FAQ. The student explicitly chose FormSubmit and agreed to confirm its activation email. This is a scoped exception to the no-external-service guardrail for voluntary report submission only: FormSubmit processes those fields and delivers them to gpeila@calpoly.edu. Discovery and bookmarks remain fully local. Disclose the processor and recipient, preserve default provider spam checks, validate required fields and lengths, retain the draft if sending is interrupted, and provide a direct email fallback. Do not claim inbox delivery without verification or store submitted reports in the catalog, repository, or localStorage.

## Approved career event announcements — September 14, 2026

Add a distinct upcoming career fair and company visit section below opportunity filters and above opportunity results. Include independently searchable event/company names and event-type filters, verified dates in Pacific time, verified locations or an explicit MustangJobs lookup, official event links, and a route to current employer lists. Keep the event filters independent of opportunity matching. Use a curated public snapshot with a review date, expire events at their end time, and explain incomplete company coverage and sign-in requirements. Never infer a company visit from an email anecdote or an older event. No inbox access or live-feed claim.
