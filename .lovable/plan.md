
## Plan: Expand Portfolio to Full Spec

Extend the existing portfolio (already has projects, messages, site_settings, social_links, admin panel scaffolding) to match the new detailed spec for Shoibur Rahman.

### 1. Database additions (migration)
Add new tables + GRANTs + RLS:
- `skills` (name, category, sort_order) — public read, admin manage.
- `services` (title, description, icon_name, sort_order) — public read, admin manage.
- `testimonials` (author_name, author_role, content, avatar_path, sort_order) — public read, admin manage.
- `blog_posts` (title, slug, excerpt, content, cover_path, status[draft|published], seo_title, seo_description, published_at) — public read published, admin manage all.
- Extend `site_settings`: add `avatar_path`, `tagline`, `location`, `experience` (text).
- Extend `projects`: add `sort_order`, `tags` (text[]), `detail_content` (text), `images` (text[] for multi-image).
- Extend `messages`: add `archived` (bool).

Seed rows: site_settings name="Shoibur Rahman", bio, tagline. Seed skills (HTML, CSS, JS, Python, Database Configuration, Graphic Design, Professional Logo Creation, Promotional Video Editing). Seed projects (SRS DIGITAL SHOP, Zero To Decor).

### 2. Frontend routes
- `/` Home: Hero with profile picture placeholder, About preview, Featured Projects, Skills grid, Testimonials, CTA.
- `/about`: Full bio, Experience, Education (Class Ten - General Jim), Skills, Resume download.
- `/projects`: Grid with tag filter, click → `/projects/$id` detail.
- `/projects/$id`: Detail page with images, description, live URL.
- `/services`: Service cards + "How I Work" steps.
- `/contact`: Form + social links.
- `/blog`: Public list of published posts, `/blog/$slug` detail.

### 3. Admin panel (`/_authenticated/admin/*`)
- Dashboard: summary cards (projects, messages, blog posts, testimonials) + simple bar chart via recharts.
- Projects Manager: multi-image upload, drag-drop reorder (dnd-kit).
- Blog Manager: title/slug/excerpt/content (textarea-based rich editor with markdown), draft/publish toggle, SEO fields, cover upload.
- Messages Manager: inbox with archive + delete.
- Site Settings: name, bio, tagline, avatar upload, resume upload, social links CRUD.
- Skills Manager, Services Manager, Testimonials Manager (simple CRUD).

### 4. Layout
- Shared Header (glass nav) with links: Home, About, Projects, Services, Blog, Contact + admin link if signed in.
- Footer with social links.

### 5. Technical notes
- Keep existing glassmorphism theme in `src/styles.css`.
- Use existing `SignedImage` for private bucket files.
- Add packages: `recharts`, `@dnd-kit/core`, `@dnd-kit/sortable`.
- Public routes fetch via server publishable client (already patterned) or client-side supabase (public policies).
- Keep admin routes under `_authenticated/`.

### Deliverable
One migration + several new route/component files + package installs. Seed data included in migration.
