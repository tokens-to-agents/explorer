# Tokens to Agents — Explorer

The interactive companion of the [Tokens to Agents wiki](https://tokens-to-agents.gitbook.io/wiki).
The wiki explains; the Explorer lets you turn the globe, filter the timeline and sort the models.
The wiki stays the primary product: each wiki page links here with a button under its diagram, and every view here links back.

**Status:** first draft. Some data rows are drafts. A row with an empty `checked` column shows "Not verified yet" in the UI.

## Run it

You need Node 22 (see `.nvmrc`).

```bash
npm install
npm run dev          # http://localhost:3000
npm run check        # data validation + typecheck + lint
npm run build        # validates the data first (prebuild), then builds
```

You do not need Node to publish. Vercel builds the site from the GitHub repo.

## Architecture

```
data/                     The only source of facts: one CSV per kind of row
public/textures/          Globe images (NASA Blue/Black Marble, relief, water mask, star sky)
scripts/validate-data.ts  Checks every row (types, dates, duplicates, links between files)
src/
  config/                 Everything you change without touching components
    site.ts               Name, wiki URL, navigation (live / planned views)
    wiki.ts               Wiki pages the Explorer links to (title, path, live)
    taxonomy.ts           Palette, timeline tags (with definitions), eras, flow kinds, enums and their labels
    layers.ts             Map layers: one entry per layer (points, countries or flows)
    globe.ts              Looks of the globe (Night, Day, Minimal)
    benchmarks.ts         Benchmark columns of the Models table
  lib/data/               schema.ts (zod), source.ts (where CSVs come from), load.ts (parse + check)
  components/ui/          shadcn-style primitives (button, badge, input, table, tooltip)
  components/             Shared pieces (header, footer, filter chip, wiki link, page intro)
  features/<view>/        One folder per view: map, timeline, models
  app/(pages)/            Reading pages (home, timeline, models): centered column + footer
  app/(fullscreen)/map/   Full-screen views: the map fills the window, no footer
```

Rules the code follows:

- **Data flows one way.** CSV → zod schema → `loadAll()` → a server page → a client feature. Components never read files.
- **Pages are static.** Every route is prerendered at build time, so the site is fast, and changing the data means redeploying.
- **Config, not code.** Labels, colors, eras, layers and wiki links live in `src/config/`. A component that hard-codes one of them is a bug.
- **A color is never the only cue.** Every colored dot has a text label next to it.
- **Every row has a source.** Rows that have been checked also carry a `checked` date (YYYY-MM-DD).

## Common changes

| I want to… | Change |
| --- | --- |
| Add an event, a lab, a model | One row in the matching `data/*.csv`, then `npm run validate-data` |
| Add a column | The CSV header + `src/lib/data/schema.ts` (+ where it is displayed) |
| Add a map layer | `src/config/layers.ts` (+ rows in `places.csv` with a new `type` declared in `taxonomy.ts`) |
| Add a supply-chain arc | One row in `flows.csv` (both ends must be rows of `places.csv`) |
| Add a globe look | `src/config/globe.ts` + its images in `public/textures/` |
| Add a benchmark column | `src/config/benchmarks.ts` + its scores in `benchmarks.csv` |
| Add a timeline tag or rename an era | `src/config/taxonomy.ts` |
| A wiki page went live | `live: true` for it in `src/config/wiki.ts` |
| Add a view | `src/features/<view>/`, `src/app/(pages)/<view>/page.tsx` (or `(fullscreen)`), one entry in `nav` (`site.ts`) |
| Add a shadcn component | `npx shadcn@latest add <name>` (`components.json` is set up) |

## Data files

| File | One row is | Key columns |
| --- | --- | --- |
| `labs.csv` | an AI lab | id, name, country, city, lat, lon, type, founded |
| `places.csv` | a data center or a supply-chain site | id, name, type, owner, lat, lon, status, capacity_mw |
| `events.csv` | a dated event | id, date (YYYY, YYYY-MM or YYYY-MM-DD), title, tags (`models;research`, first = main) |
| `flows.csv` | an arc of the supply chain | id, from_id → places.csv, to_id → places.csv, kind, label |
| `benchmarks.csv` | one score of one model | model_id → models.csv, benchmark (declared in `benchmarks.ts`), score, variant |
| `models.csv` | a model | id, name, lab_id → labs.csv, openness, released, params, context, prices |
| `countries.csv` | a country's AI rules | iso_numeric (as in world-atlas), regulation, note |

Every file ends with `source` (a URL) and `checked` (empty = not verified yet). Quote any field that contains a comma.

These files are the single source of facts for the whole project. The wiki repo holds no data files: when a GitBook page needs a table, it is generated from these CSVs and pasted into the page with an "As of …" date. If the data ever has to live elsewhere, only `src/lib/data/source.ts` changes (or set `EXPLORER_DATA_DIR`).

## Deploy (Vercel)

1. Push this folder to its own **public** GitHub repository (the Vercel Hobby plan cannot deploy private repos owned by a GitHub organization).
2. On Vercel, choose "Add New → Project", import the repository and keep the defaults. Next.js is detected, and `npm run build` runs `validate-data` first, so bad data fails the deploy instead of shipping.
3. Optional: add a custom domain.

The Vercel Hobby plan is for personal, non-commercial use. If the project starts making money, move to Pro.

## Stack

Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v4, shadcn-style components (Radix Slot + cva), TanStack Table v8, react-globe.gl (three.js), zod 4, Papa Parse, Geist fonts, lucide icons.

## Credits

Globe images: NASA Blue Marble and Black Marble imagery (public domain) and the relief, water and sky images shipped with [three-globe](https://github.com/vasturiano/three-globe) (MIT).

## Privacy

No analytics, no cookies, no author name. Keep it that way: the project is published anonymously.
