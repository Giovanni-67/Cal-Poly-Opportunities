# Cal Poly Opportunity Matcher

An independent student-built discovery tool for Cal Poly students looking for clubs, research, competitions, startups, hands-on projects, and internship resources.

Search by major or interest, select multiple interests, and refine by opportunity type. Open a card for its matching explanation and official Learn more link. Browse all is always available; major associations are discovery suggestions, not eligibility filters.

## Current version

- 429 sourced entries, including all 406 San Luis Obispo student organizations in the reviewed public Cal Poly Now snapshot. The original 18 entries are retained, 401 additional clubs are included without duplicates, and 10 research, startup, competition, and hands-on programs are added. Sources reviewed September 12, 2026.
- Business, Arts, Service, and Outdoors interest filters join the original six. Search suggestions reflect the collection’s major and interest tags.
- Results appear in batches of 24 with a Show more control. Searches cover the whole collection, including cards that have not been displayed yet. General-interest clubs can have no major association.
- Responsive green-and-gold interface, animated centered cards and background blur, expandable details, keyboard focus management, and reduced-motion support.
- Four primary tabs in order: Opportunities, Study Spots, Campus Resources, and Bookmarks. About stays in the footer. Desktop tabs become a keyboard-accessible mobile menu, with hash links, Back/Forward support, and preserved search state.
- 10 study spots with source-backed feature filters, locations, and access notes; 14 campus resources spanning learning, making, technology, careers, support, research, and recreation. Reviewed September 13, 2026; seats, noise, equipment, and hours are not live.
- Related activities appear separately after direct matches, with explicit topic or shared-tag explanations. Swimming directly finds Swim and Triathlon while suggesting other water activities. Connections cover diverse interests and respect opportunity type filters.
- Bookmark any opportunity, study spot, or resource using its icon or detail dialog. Search and filter saved items. Bookmarks stay in this browser using localStorage, without accounts or cross-device sync; blocked, corrupt, or full storage produces a visible session-only warning.
- Static HTML/CSS/JavaScript with no framework, installation, accounts, API keys, or analytics. Discovery and bookmarks run locally. The explicitly approved bug-report form sends a visitor's name, email, and report to FormSubmit for delivery to gpeila@calpoly.edu; other external links may lead to services with their own sign-in requirements.
- Report bugs from the footer: a form with native validation and a short FAQ inspired by Polyratings' green headings and gold dividers. FormSubmit opens in a separate tab for its delivery confirmation and spam checks. The original draft stays on the page; there is a direct email fallback. Submitting is never labeled as confirmed inbox delivery by this app.
- Deterministic local matching with common aliases (AI, CS, CPE, EE, ME), type filters, and stable discovery ordering without duplicates.
- Honest empty and data-error states. Club coverage is a dated public SLO directory snapshot; additional programs are curated, and this is not a live vacancies feed. Internship entries link to official discovery resources, not specific open positions.
- Submitting an empty or whitespace-only search shows all opportunities (or the selected filters' matches), announces the result count, and brings results into view. Search focus follows the rounded outer control; keyboard focus remains visible on interactive controls.

## Run and verify

Serve this folder with any static HTTP server, such as `python -m http.server 8000` (or `py -m http.server 8000` on Windows with the Python launcher), then open `http://localhost:8000/`. No build step is required. GitHub Pages uses the existing root publishing setup.

Run the dependency-free automated tests with Node.js 18 or newer:

```sh
node --test tests/matcher.test.cjs tests/catalog.test.cjs tests/discovery.test.cjs tests/campus.test.cjs
node tests/check.cjs
```

Open `http://localhost:8000/tests/browser.html` for the real-DOM browser regression suite. It tests the actual page/controller in an iframe, including malformed data and safe text rendering. Native keyboard interaction, responsive layouts, and visual fidelity also require browser review; the suite's simulated reduced-motion preference tests the JavaScript branch, not the OS setting.

Data and matching rules are in `data.js`, `club-data.js`, `campus-data.js`, `matcher.js`, and `discovery.js`; local bookmark persistence is in `bookmarks.js`; UI behavior is in `app.js`. Read [SPEC.md](SPEC.md), [AGENTS.md](AGENTS.md), and [SOURCES.md](SOURCES.md) before changes. Verify the official page before adding or updating a record, and keep its source/review date accurate. Tags, major mappings, and related-topic groups are editorial associations. Related matches never replace or duplicate direct matches. Study/resource filters require all selected features; bookmark type filters preserve the saved collection. Browser tests use isolated storage and never clear a visitor’s real bookmarks. Search text and interest chips combine with AND; multiple selected interests combine with OR. Only current matches are shown; previously seen matches retain discovery order and new matches append. Browse all clears filters and resets ordering.

The original teaching guide follows. The coastal example and shared teaching documents are preserved independently of this app; their historical test notes describe the template, not current matcher verification.

### Bug-report delivery setup

The user approved FormSubmit on September 13, 2026. Its first submission triggers an activation email to gpeila@calpoly.edu. The mailbox owner must confirm that email before delivery can be relied on, then send a clearly labeled test report from the deployed site and verify receipt. No mailbox credentials belong in this repository. Keep the provider's default CAPTCHA enabled and the honeypot field in place. Browser tests intercept the native form submission and inspect its payload without sending reports. They verify local behavior, not inbox delivery or provider availability. FormSubmit processes reports under its [privacy terms](https://formsubmit.co/privacy.pdf); its [documentation](https://formsubmit.co/documentation) describes activation and spam controls. The user-facing form discloses the recipient and processor. No report contents are stored in this repository or in localStorage.

---

# The Understudy

**Last week you told AI what to build. This week, teach it how to work for you.**

Build a one-page website or mini-app about something you care about, with one thing a visitor can actually do. Your agent handles implementation. You choose the idea, set the rules, check the result, and decide whether to publish it.

[See the coastal demo](https://calpolyvibecoding-01.github.io/cpvc-02-understudy-template/examples/coast/). It is one example, not your assignment. Your project can be about music, sports, fashion, a business idea, a fandom, or something else.

**Start here, before anything else:**

> What's something you're into, or something you wish existed, that you could turn into a website you'd actually use or send a friend?

Then finish this sentence:

> **I'm building ___ for ___ so they can ___.**

Who is it for, and what is the one thing they can do on it? Scope for today is **one page, one main interaction, no required external service.** You can revisit last week's idea in this week's fresh template.

**Finish line:** a working public page, one saved instruction visibly followed, and the same live link you registered at the beginning.

## 1. Copy and deploy the untouched starter

Before setup, write one sentence with your idea and the one thing a visitor will do. Save the full TARGET brief for after STOP 1.

In the club template on GitHub, choose **Use this template → Create a new repository**. Choose your own account, make the repository **Public**, and copy only the default branch. Suggested name: `cpvc-02-understudy`. If you already used that name, choose a distinct new name. Keep last week's repo.

Confirm your copy has `index.html`, `README.md`, `SPEC.md`, and `AGENTS.md` on `main`. Do not edit them yet.

In **your repository's Settings → Pages**, choose **Deploy from a branch → main → /(root) → Save**. Open the site URL GitHub displays after deployment. You should see the working starter, not a GitHub file listing.

| Link | What it is |
| --- | --- |
| `https://github.com/YOUR-USERNAME/YOUR-REPO` | Your project files. Give this to the coding agent. |
| `https://YOUR-USERNAME.github.io/YOUR-REPO/` | Your public website. Submit this to the club portal. |

A temporary 404 does not necessarily mean setup failed. Check **Actions** for the deployment, then retry the displayed site URL. See [setup and recovery help](docs/HELP.md).

## 2. Submit the live starter before building

Your public page should still be the untouched starter. Register it now; do not wait for the finished project.

1. Open [the CPVC portal](https://calpolyvibecoding.com/portal).
2. Log in or sign up, then open **Builds**.
3. Under **Post this week's build**, paste the **live GitHub Pages URL** into **Link**, not the repository URL.
4. In **What is it?**, write: **“Session 2 starter. Planned: [my idea] with [one interaction].”**
5. Click **Post it** and confirm the entry exists. If submission fails, ask an officer before proceeding.

> **STOP 1: Live and submitted.**
>
> Do not build or customize your actual site until the starter opens at your public URL and your portal submission succeeds. Keep that URL. Merging your later build updates the same link. Do not create a duplicate submission just because the page changed.

## 3. Connect your agent to your copy

Use the personal account and GitHub connection demonstrated in the room. Connect the account that owns your copy and authorize the intended repository. Signing in alone does not prove the agent can read your project. See [connection and preview help](docs/HELP.md).

No card or agent access? Use the [browser fallback](docs/HELP.md#browser-fallback). You still choose the idea, own the instructions, inspect the result, and decide whether to ship.

Start a new coding task with GitHub available. Replace both links in this prompt:

```text
My starter is live and I have successfully submitted its URL to the club:
[paste my live Pages URL]

Work only in my repository:
[paste my GitHub repository URL]

Read README.md, SPEC.md, AGENTS.md, and index.html from main. Do not edit yet.
Confirm the actual owner/repo, branch, and files. Tell me where your tools
execute and demonstrate a reachable interactive preview of the starter.
Do not assume a remote GitHub connection is a populated local checkout.
If the preview cannot work here, give me the documented recovery step.
```

You should see details from your copy and a working starter preview. If not, stop and use the help route. Do not create repeated empty copies to fix access.

## 4. Approve your idea and instructions

You make the choices; the agent can help phrase and save them. `SPEC.md` is today's target. `AGENTS.md` is the standing brief the agent should read whenever it works. Neither file runs the website.

Use a visual reference when useful. Say which composition, color, or interaction qualities matter instead of asking only for a “beautiful modern site.” Image generation is optional.

```text
My idea: [one sentence about something I want to make]
For: [one specific person and what they want to do]
Main interaction: [one thing a visitor can do]
Visual direction: [a reference and what I like, or a short description]

Help me choose one observable standing rule that matters to this project.
Ask only the questions needed to make this one-page idea achievable.
Propose the six TARGET lines for SPEC.md and my rule for AGENTS.md.
Keep the provided guardrails. Show me the wording for approval first.
After I approve, create a build branch, save the brief there, and read it
back from the saved files. Do not build the personal site yet.
```

For example, a lineup picker could use: **“Keep my chosen headliner first and allow no more than five selected acts.”** Your rule should protect something you care about.

> **STOP 2: Correct brief and usable preview.**
>
> Your saved SPEC says what you want. Your AGENTS rule is something you can check. The agent can read your files and provide a usable preview. Approve the build only when those are true.

## 5. Build, inspect, and revise once

```text
Read the approved SPEC.md and AGENTS.md from my build branch.
Build the smallest useful version of my idea with one main interaction.
Use my visual direction without copying unsupported facts from a mockup.
Preserve examples/ and the deployment setup. Run relevant checks and show
an interactive preview of the actual proposed files. Identify the branch.
Summarize changes and anything untested. Do not open a PR or merge yet.
```

Your public Pages link still shows `main`, so it may still show the starter. The build-branch preview shows the proposed change. Try the main action yourself. Find the effect of your standing rule. Check one relevant boundary or factual claim.

Then request one small revision:

```text
Change [one specific thing]. Read the saved instructions first and preserve
my original requirements. Recheck the main action and standing rule, then
show me the updated preview and what changed. Do not merge.
```

If the preview fails, use the documented recovery route or ask an officer. Do not merge just to see the page. GitHub's **Preview changes** shows code differences, not the running website.

## 6. Approve and publish the checked change

A **branch** keeps proposed work separate from `main`. A **commit** saves a change. A **pull request**, or PR, proposes bringing the branch into `main`. **Merge** accepts it.

After you inspect the preview, ask:

```text
I approve the previewed result. Open a pull request from this build branch
to main. Summarize the changed files, the checks you ran, and any limits.
Give me the PR link. Do not merge it for me.
```

Open the PR and review **Files changed**. You do not need to understand every line, but you should recognize the intended changes and any unexpected files. You decide whether to click **Merge**.

After merging, check deployment and refresh the **same Pages URL** you submitted in Step 2. Test the live main action. Keep your original portal entry.

> **STOP 3: Reviewed, live, and explainable.**
>
> Show your live page, identify the effect of your saved rule, and explain what the branch and PR did. Extra features belong in open build.

## What you practiced

**Context:** TARGET and instructions. **Capability:** an agent reading and changing files. **Orchestration:** a branch and reviewed PR. **Judgment:** your choices, tests, and shipping approval. **Evidence:** a live result you can explain.

**The Loop:** spec → build → test → deploy → iterate.

AI helped at build time. Ordinary static code runs for visitors, with no runtime model or secret API key.
