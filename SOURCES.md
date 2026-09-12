# Opportunity sources

Reviewed September 12, 2026. These are program descriptions, not a live openings feed. The collection has 419 entries: the original 18 plus 401 additional clubs after merging five overlaps. No private directories, rosters, contact details, or authenticated listings are stored in the catalog.

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

## Interpretation and maintenance

Descriptions are original concise paraphrases. Tags, major associations, category choices, and matching explanations are editorial discovery aids, not eligibility statements. Robotics is categorized Hands-on and SLO Hacks as Competition for the primary activity; neither label is a legal or membership classification. Internship entries are clearly labeled discovery resources rather than fabricated vacancies. There are no current-open, deadline, award, salary, or universal-eligibility claims.

Program sources were reviewed through web research; club summaries and URLs were reviewed through the public directory response. Not every individual club profile was loaded separately. A review date means the source supported the description on that date; it does not certify ongoing operations or recruitment. Before updating `reviewed`, reopen the source and verify the entry. Keep source URLs HTTPS on the Cal Poly domain or its subdomains; extending this requires a deliberate validator/test update. Do not add unsourced records to fill empty searches.

For broader exploration, [Cal Poly clubs and organizations](https://www.calpoly.edu/life-at-cal-poly/clubs-and-organizations) links to the university's campus organization resources.

To refresh club coverage, repeat the public directory pagination and campus/branch checks, review changed descriptions and links, preserve stable IDs, update the documented counts and test ID fingerprint, and run both automated and browser suites. Do not change review dates without a new source review.
