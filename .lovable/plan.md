# Digital Diary & Lifestyle Rebuild

Full pivot away from the cinematic dark theme to a bright, bento-grid "Digital Diary" for Shoibur Rahman. All content (except Projects and Blog, which stay usable in admin only) becomes editable through a hidden `/admin` panel.

## 1. Theme reset

Rewrite `src/styles.css`:
- Background `#F9F8F6`, cards pure white with `rounded-2xl`/`rounded-3xl` and soft floating shadows (`0 10px 30px -12px rgba(20,20,40,0.10)`).
- Accents: sky blue `#7CC4F2`, warm yellow `#F5C451`.
- Fonts: **Fraunces** (serif headings), **Inter** (body), **JetBrains Mono** (small captions). Load via `<link>` in `__root.tsx`.
- Utility classes: `bento` (white card + shadow + rounded), `bento-blue`, `bento-yellow` (tinted variants), `chip`.
- Remove/replace cinematic utilities (`film-grain`, `duotone-amber`, `tag-mono`, dark `btn-primary`). Keep the admin `glass` shims but retint for the light theme.

## 2. Navigation & routing

- Replace `TimelineNav` in `src/components/SiteLayout.tsx` with a simple sticky top bar: serif wordmark on left, links (Home, Journey, People, Memories, Diary, Thoughts) on right.
- **Remove the visible `/ADMIN` link entirely.** Admin remains reachable only by typing `/admin`.
- Footer: soft cream, no admin link.

## 3. New database tables (single migration)

All are single-owner editable, publicly readable:

- `education_entries` — kind (`past`|`current`|`future`|`certificate`), title, institution, period, description, sort_order.
- `people` — category (`family`|`friend`|`teacher`), name, relation, note, image_path, sort_order.
- `hobbies` — title, description, image_path, sort_order.
- `memories` — title, location, story, image_path, taken_on, sort_order.
- `foods` — name, cuisine, review, rating (1-5), image_path, sort_order.
- `quotes` — text, author (nullable, defaults to Shoibur), category, sort_order.
- Extend `site_settings` with `greeting`, `hero_image_path`, `identity_line`.

Every table: `GRANT SELECT` to `anon`, full CRUD to `authenticated` gated by `has_role(admin)`, plus `service_role`. `updated_at` trigger via existing `set_updated_at()`.

Seed rows: current 10th grade at "General Jim" (Batch 2026); father "Rafiqul Islam" + younger brother placeholders; Gazipur Safari Park memory; Pizza/Pasta/Indian food entries; a few starter quotes.

## 4. Public pages (bento layout)

Rebuild `src/routes/index.tsx` as a single scrollable bento home with anchor sections, plus dedicated routes for depth:

- `/` — Hero bento (profile image + greeting + short bio), plus preview tiles linking to each section.
- `/journey` — vertical timeline of `education_entries` grouped by kind.
- `/people` — three columns (Family / Teachers / Friends) of portrait cards.
- `/memories` — masonry gallery of `memories` + `hobbies` with lightbox-lite (click to enlarge in a modal).
- `/diary` — food grid with rating stars and reviews.
- `/thoughts` — quote cards, mixed white/blue/yellow bento tints.

Delete or hide from nav the old Projects/Services/Contact/Blog pages. Keep the route files (so admin CRUD keeps working) but drop them from the public nav. Contact form stays available at `/contact` but is not linked from the header (still reachable via footer email).

Strip every mention of "Zero To Decor", YouTube, and video editing from copy, seed data, `__root.tsx` meta, and `public/llms.txt`.

## 5. Admin panel

Keep `/admin` hidden (no public link). Extend the sidebar with new managers:

- Education (`/admin/education`)
- People (`/admin/people`)
- Hobbies (`/admin/hobbies`)
- Memories (`/admin/memories`)
- Foods (`/admin/foods`)
- Quotes (`/admin/quotes`)
- Existing Settings gains: greeting, hero image upload, identity line.

Each manager: list + add/edit dialog + delete, native image upload via existing `uploadFile` helper into the `portfolio-assets` bucket, drag-to-reorder using `@dnd-kit` (already installed).

## 6. SEO & domain

- Set canonical/OG base to `https://shoiburrahman.com` in `__root.tsx` and every route `head()`.
- Update `public/robots.txt` sitemap URL, `src/routes/sitemap[.]xml.ts` base URL, and `public/llms.txt` copy.
- Titles/descriptions rewritten around "Digital Diary of Shoibur Rahman".

## Technical notes

- Tailwind v4 tokens updated in `@theme` (`--color-background`, `--color-primary`, `--color-accent-blue`, `--color-accent-yellow`, `--font-display: "Fraunces"`).
- Image upload path stays: `uploadFile()` → `portfolio-assets` bucket → `SignedImage` for private read (bucket remains private).
- No new npm packages required (`@dnd-kit`, `sonner`, `recharts` already present).
- All new server access uses the browser Supabase client with RLS; no new server functions needed.
- Migration ships GRANTs + RLS + seed rows in one file per the public-schema rule.

## Deliverables

1. One migration (schema + grants + policies + seed).
2. Rewritten `styles.css`, `SiteLayout.tsx`, `__root.tsx` head.
3. New/rewritten public routes: `index`, `journey`, `people`, `memories`, `diary`, `thoughts`.
4. New admin routes: `admin.education`, `admin.people`, `admin.hobbies`, `admin.memories`, `admin.foods`, `admin.quotes` + Settings extensions.
5. SEO files updated to `shoiburrahman.com`.
