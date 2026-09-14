# Opportunity sources

Reviewed September 12, 2026. These are program descriptions, not a live openings feed. The collection has 429 entries: the original 18 plus 401 additional clubs after merging five overlaps, plus 10 additional programs. No private directories, rosters, contact details, or authenticated listings are stored in the catalog.

## Public club directory snapshot

[Cal Poly Clubs](https://clubs.calpoly.edu/) directs students to the [Cal Poly Now organization directory](https://now.calpoly.edu/organizations). Its public discovery listing was reviewed on September 12, 2026, in five alphabetical pages of 100 records, using `/api/discovery/search/organizations?top=100&skip=0&orderBy=UpperName%20asc` and offsets 0, 100, 200, 300, and 400. No sign-in was used.

- 476 public active directory entries were listed in total.
- 421 belonged to the Recognized Student Organizations branch (321903).
- 15 of those had the official `*Solano Campus` category and were excluded from this SLO collection.
- The remaining **406 SLO student organizations are all included**. Another 55 office/residence entries outside the student-organization branch were excluded.
- CSAI, Security Education, Hack4Impact, WISH, and Game Development already existed in the original collection. Their stable card IDs are retained, their official directory names remain searchable, and Learn more now opens their direct profiles.

`club-data.js` holds each directory ID, title, original short paraphrase, discovery tags, direct official profile URL, and review date. Descriptions were reviewed against the public listing summaries. Topic and major connections are editorial; over 200 general-interest organizations have no assigned major. The coverage test checks the exact reviewed ID set, unique profile URLs, and one-to-one inclusion in the combined catalog. This is complete coverage of that public SLO snapshot, not a guarantee about private, unlisted, newly added, or currently recruiting organizations.

Only public organization facts are retained. Membership rosters, officer names, emails, phone numbers, and other contact fields are not part of this dataset. A public profile was also checked in the browser to confirm the direct destination works without signing in.

## Additional curated sources

| Entries | Official source | Facts used |
| --- | --- | --- |
| CSAI, Robotics, CP Security Education, Hack4Impact, WISH, UX, Game Development, Computing Research Society, SLO Hacks | [Computer Science & Software Engineering club directory](https://csc.calpoly.edu/student-clubs/) | Names and brief descriptions of the organizations' activities. The department directory remains the source for entries absent from the public snapshot; the five overlapping clubs link directly to their Cal Poly Now profiles. |
| Engineering Summer Research | [College of Engineering student research](https://ceng.calpoly.edu/research-innovation/student-research) | Faculty-guided SURP research. |
| Innovation Quest | [CIE Innovation Quest](https://cie.calpoly.edu/prepare/innovation-quest/) | Entrepreneurship competition supporting ideas/prototypes. |
| The Hatchery | [CIE Hatchery](https://cie.calpoly.edu/prepare/hatchery/) | Workshops, mentorship and student startup community. |
| MustangJobs Internship Search | [Career Services job search](https://careerservices.calpoly.edu/explore-services/resource-toolkit/job-search) | Official internship listing route; MustangJobs sign-in happens on the official service. |
| Office of Student Research | [Office of Student Research](https://studentresearch.calpoly.edu/) | Advising and introductory research resources. |
| Business Summer Research | [Orfalea SURP](https://orfalea.calpoly.edu/undergraduate-programs/summer-undergraduate-research-program) | Faculty-mentored business research and thematic areas. |
| Liberal Arts Summer Research | [CLA SURP](https://cla.calpoly.edu/research-innovation/research-surp) | Mentor-led scholarship and creative activities. |
| Research & Creative Activity Competition | [OSR competition](https://studentresearch.calpoly.edu/csu-research-competition) | Route to presenting research/creative work. |
| Career Fairs & Employer Events | [Career Services schedule](https://careerservices.calpoly.edu/career-fairs-schedule) | Employer events can help discover internships. |
| Agriculture, Food & Environmental Sciences Summer Research | [Cal Poly College of Agriculture, Food & Environmental Sciences](https://cafes.calpoly.edu/research-and-innovation/student-research) | Explore faculty-guided research on agriculture, food systems, and environmental challenges. |
| Frost Summer Undergraduate Research | [Cal Poly Bailey College of Science & Mathematics](https://bailey.calpoly.edu/research/undergraduate-research/frost-surp) | Explore faculty-mentored science and mathematics research, with opportunities to share your work. |
| BEACoN Research Scholars | [Cal Poly Office of University Diversity & Inclusion](https://diversity.calpoly.edu/beacon/) | Explore faculty-mentored research, professional development, and opportunities to present your findings. |
| CIE Summer Accelerator | [Cal Poly Center for Innovation & Entrepreneurship](https://cie.calpoly.edu/launch/accelerator/) | Develop a startup through mentorship, workshops, and support for testing a business model. |
| Elevator Pitch Competition | [Cal Poly Center for Innovation & Entrepreneurship](https://cie.calpoly.edu/prepare/elevator-pitch-competition/) | Practice turning an entrepreneurial idea into a concise pitch for a panel of entrepreneurs. |
| Startup Marathon | [Cal Poly Center for Innovation & Entrepreneurship](https://cie.calpoly.edu/prepare/startup-marathon/) | Form a team, develop a business idea over a weekend, and present it to entrepreneurs and investors. |
| Cal Poly College Corps | [Cal Poly Center for Leadership & Service](https://leadandserve.calpoly.edu/college-corps) | Explore community service addressing education, climate action, food insecurity, and healthy futures. |
| Cal Poly Rose Float | [Associated Students, Inc. — Cal Poly](https://www.asi.calpoly.edu/get-involved/rose-float/) | Help design, build, or decorate a Rose Parade float with students combining art and engineering. |
| Cal Poly Racing | [Cal Poly Mechanical Engineering](https://me.calpoly.edu/clubs-2/) | Explore student teams designing, building, and testing vehicles for collegiate engineering competitions. |
| CubeSat & PolySat | [Cal Poly Aerospace Engineering](https://aero.calpoly.edu/cubesat-and-polysat/) | Explore a student-run satellite lab, from spacecraft design and assembly to systems testing. |

Camp PolyHacks was researched but not added: its official program page still advertises a 2022 event. Research and startup program pages may describe past cycles; the cards make no claim that applications are open.

## Interpretation and maintenance

Descriptions are original concise paraphrases. Tags, major associations, category choices, and matching explanations are editorial discovery aids, not eligibility statements. Robotics is categorized Hands-on and SLO Hacks as Competition for the primary activity; neither label is a legal or membership classification. Internship entries are clearly labeled discovery resources rather than fabricated vacancies. There are no current-open, deadline, award, salary, or universal-eligibility claims.

Program sources were reviewed through web research; club summaries and URLs were reviewed through the public directory response. Not every individual club profile was loaded separately. A review date means the source supported the description on that date; it does not certify ongoing operations or recruitment. Before updating `reviewed`, reopen the source and verify the entry. Keep source URLs HTTPS on the Cal Poly domain or its subdomains; extending this requires a deliberate validator/test update. Do not add unsourced records to fill empty searches.

For broader exploration, [Cal Poly clubs and organizations](https://www.calpoly.edu/life-at-cal-poly/clubs-and-organizations) links to the university's campus organization resources.

To refresh club coverage, repeat the public directory pagination and campus/branch checks, review changed descriptions and links, preserve stable IDs, update the documented counts and test ID fingerprint, and run both automated and browser suites. Do not change review dates without a new source review.


## Campus study spots and resources

Reviewed September 13, 2026. The 10 study spots and 14 resources in `campus-data.js` are a separate curated collection, not additions to the 429 opportunity count. Summaries are original paraphrases. These are discovery descriptions, not live opening hours, room bookings, occupancy, equipment inventory, or guarantees of access. Study filters use AND, so every selected feature must be present.

| Entries | Official source | Facts used and limits |
| --- | --- | --- |
| Kennedy Library | [Library](https://library.calpoly.edu/) | Quiet or collaborative study spaces. No quiet-floor claim. |
| Student Fishbowls, DSS 115C, Hub24 | [Study and meeting spaces](https://library.calpoly.edu/visit/study-and-meeting-spaces) | Student fishbowls on level 2 with monitors; student reservations for 115C; Hub24 on levels 1 and 2 with workstations and laptop monitors. Active PolyCard required after hours. 115D is not presented as student-bookable. |
| Library Courtyard | [Refreshed Kennedy Library, January 2026](https://www.calpoly.edu/news/light-spacious-and-bustling-take-look-inside-refreshed-kennedy-library) | Redesigned level 1 courtyard following reopening; outdoor setting, no guaranteed seats or noise level. |
| Chandler and San Luis Study Lounges, UU Plaza, UU Common Areas | [University Union](https://www.asi.calpoly.edu/facilities/university-union/) | Named study lounges, outdoor plaza, open common seating, Wi-Fi and charging stations. Power tag applies only to common-area building amenities; no outlet-at-every-seat claim. Lounges are not tagged quiet without current evidence. |
| The Lounge at the UU | [ASI announcement](https://www.asi.calpoly.edu/asi-now/press-releases/discover-the-lounge-at-the-university-union/) | Room 119 recreational study/social setting; not a silent-study room. |
| Tutoring | [Writing and Learning](https://writingandlearning.calpoly.edu/tutoring) | Course, writing, exam preparation and study-skills help. |
| Academic Advising | [Academic Advising](https://advising.calpoly.edu/) | Advising centers, course planning and registration guidance. |
| Mustang Makerspace | [CENG makerspace announcement](https://ceng.calpoly.edu/connection/2025/09/new-mustang-makerspace-open-to-all-students/) | Bonderson Building 197, 3D printing, laser cutting and sewing; laser certification required. Historical hours are not copied. |
| Craft Center | [ASI Craft Center](https://www.asi.calpoly.edu/experience/craft-center/) | Creative classes and studio passes; fees/registration may apply. |
| Tech Rental & Printing; Library Borrowing | [Checkout and requests](https://library.calpoly.edu/services/checkout-and-requests) | Official route to tech services, borrowing, reserves and interlibrary requests. No claim about particular rentable devices or stock. |
| Digital Scholarship Studio | [Digital Scholarship Studio](https://library.calpoly.edu/research/digital-scholarship-studio) | First-floor research help, digital-project consultations and peer assistance. Separate from the 115C study-room entry because the visitor intent differs. |
| Career Services | [Career Services](https://careerservices.calpoly.edu/) | Career guidance, employer connections and job-search resources; not verified vacancies. |
| Basic Needs Support | [Basic Needs](https://basicneeds.calpoly.edu/) | Food, housing and financial-wellness support routes. |
| Disability Resource Center | [DRC](https://drc.calpoly.edu/) | Accessibility services and accommodation requests. |
| Let’s Talk | [Let’s Talk](https://chw.calpoly.edu/counseling/lets-talk) | Informal drop-in consultations; official schedule and distinction from ongoing counseling. |
| Research help | [Office of Student Research](https://studentresearch.calpoly.edu/) | Getting-started resources and advising. |
| Outdoor Rentals | [ASI fall 2026 guide](https://www.asi.calpoly.edu/asi-now/asi-blog/plan-your-fall-2026-semester-with-asi/) | Rental-center route and example gear including tents, coolers and kayaks. Check current rates and availability. |
| ASI Space Activity | [ASI activity page](https://www.asi.calpoly.edu/asi-current-space-activity/) | External activity indicators for selected spaces. This app has no live occupancy integration. |

Related-activity groups in `discovery.js` are explicitly editorial. A swimming query may suggest water polo or sailing as another water activity, not claim those clubs offer swimming. Topic groups or shared specific tags explain each suggestion. Direct matches are excluded, type constraints remain active, and unrecognized empty searches do not invent recommendations.
