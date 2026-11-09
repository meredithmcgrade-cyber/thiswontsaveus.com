# This Won’t Save Us

A privacy-first web app for Brynne Musser’s progressive voter guide for Kansas City, Missouri. Each election is its own guide; the layout, navigation and recommendation system stay the same from cycle to cycle.

## Stack

- **Next.js 16** (App Router, Cache Components, TypeScript) with **Tailwind v4** and design tokens as CSS variables in `src/app/globals.css`
- **Lenis** smooth scrolling (disabled automatically for people who prefer reduced motion)
- **Sanity** as the editor-facing CMS, embedded at `/studio`
- Deployed on **Vercel**

Readers never talk to Sanity. Content is fetched on the server, pages are statically generated and a webhook refreshes them when Brynne publishes. There are no accounts, cookies, analytics or third-party scripts on the public site, fonts are self-hosted and a strict Content Security Policy is set in `next.config.ts`.

## Local development

```bash
npm install
npm run dev
```

With no Sanity project configured the site reads the seed data in `src/content/seed/`, which already holds the full November 3, 2026 guide. That is enough to work on design and layout.

Other scripts: `npm run build`, `npm run lint`, `npm run typecheck`.

## Content model

| Type | What it is | Key fields |
| --- | --- | --- |
| `election` | One guide, e.g. 2026-11-03 | title, subtitle, date, slug, status (draft / live / archived), intro (“Don’t skip this”), where to help, methodology |
| `section` | A group inside a guide, e.g. “State Representatives”, “16th Judicial Circuit” | title, category (federal, state, county, city, schools, judges, ballot, other), order, job description |
| `race` | A contested or uncontested office | office, district, candidates (name, party, incumbent, website), recommendation, deep dive |
| `judge` | A retention vote | name, recommendation (retain / do not retain), review link, deep dive |
| `measure` | An amendment, proposition or question | title, short title, ballot language, recommendation (yes / HELL YES / no / HELL NO), deep dive, who’s behind it |
| `siteSettings` | Site-wide text | site title, tagline, author, Instagram, contact email, about |

Categories drive the sticky navigation on the guide page. Sections group items under a category and carry the shared “what does this job do?” text. Every item can have a one-line `summary` that shows in quick view. Links inside the text are collected automatically into a Sources list on each item.

Routes: `/` (current live guide), `/<election-slug>` (a specific guide), `/<election-slug>/<item-slug>` (shareable item page), `/elections` (archive), `/about`, `/studio` (editors).

## Setting up Sanity (one time)

1. Create a free project at sanity.io/manage. Note the **project ID** and create a dataset called `production`.
2. In the project’s **API** tab, add CORS origins for `http://localhost:3000` and your production domain, with credentials allowed.
3. Create an API token with **Editor** permissions (used only for the seed import).
4. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SANITY_PROJECT_ID`, `SANITY_API_WRITE_TOKEN` and a random `SANITY_REVALIDATE_SECRET`.
5. Import this cycle’s guide: `npm run seed:import`
6. Run `npm run dev` and open `http://localhost:3000/studio`. Sign in with the account that owns the project.
7. Invite Brynne under **Members** in sanity.io/manage with the **Editor** role. She signs in at `https://<your-domain>/studio`.
8. Under **API → Webhooks**, add a webhook: URL `https://<your-domain>/api/revalidate`, dataset `production`, trigger on create, update and delete, HTTP method POST, secret = `SANITY_REVALIDATE_SECRET`. This is what makes a publish show up on the site within seconds.

The import is safe to re-run; it replaces documents by `_id`.

## Deploying to Vercel

Import the GitHub repo in Vercel and set these environment variables for Production and Preview:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET` = `production`
- `SANITY_REVALIDATE_SECRET`
- `NEXT_PUBLIC_SITE_URL` = `https://thiswontsaveus.com`

Point the domain at Vercel, then update the bit.ly link to `https://thiswontsaveus.com/2026-11-03`. Old shared links keep working forever because each guide lives at its dated path.

## How Brynne adds a new election

1. In the Studio, open **Elections** and create a new one. Set the date, slug (use the date, e.g. `2027-04-06`) and leave status as **Draft** while writing.
2. Open that election and add **Sections** first (for example “Mayor”, “City Council”, “School Board”, “Ballot Questions”), picking a category for each.
3. Add **Races**, **Judges** and **Ballot measures** inside the election. Creating from inside the election pre-fills the election reference, so only the section needs choosing.
4. Fill in the intro, “Where to help” cards and methodology on the election itself.
5. Flip status to **Live**. The home page switches to the newest live election; the previous one can be set to **Archived** so it moves to the Past page.

Nothing in the Studio is election-specific, so a city primary, a school board race or a special election all use the same forms.

## Converting a Google Doc guide

`scripts/gdoc-to-seed.py` turns a Google Docs API JSON export of a guide written in the existing document format (H1 categories, H2 sections, H3 items with bold “The candidates:” / “Deep Dive” / “Ballot Language” / “Who’s behind it?” labels) into seed JSON:

```bash
python3 scripts/gdoc-to-seed.py doc.json 2026-11-03 2026-11-03 > src/content/seed/2026-11-03.json
npm run seed:import -- 2026-11-03.json
```

Going forward Brynne writes directly in the Studio, so this is mainly useful for backfilling older guides into the archive.

## Privacy checklist

- No cookies, no analytics, no ad or social scripts, no embeds
- Fonts self-hosted from `src/fonts` (OFL licensed)
- `Referrer-Policy: no-referrer`, strict CSP, HSTS and no `X-Powered-By`
- The only client-side storage is `localStorage` for the theme and quick view toggles
- `/studio` and `/api` are excluded from search indexing
- If a “find my ballot” feature is ever added, do the lookup in the browser against bundled district data so addresses never leave the device
