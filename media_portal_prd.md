# Product Requirements Document (PRD)
**Project Name:** Media & Video Content Portal (KGNow-Inspired Architecture)  
**Tech Stack:** Astro (Hybrid SSG/SSR) + Cloudflare Ecosystem (Pages, D1, R2) + Programmatic Ad Engine  
**Document Status:** Draft v1.0  

---

## 1. Product Overview & Objectives

### 1.1 Product Vision
Build a high-speed, media-centric digital publishing portal combining short-form/long-form video streams and editorial articles, modeled after the UI/UX patterns of **KGNow.com**. The platform is engineered for rapid content publishing, paid traffic acquisition (digital marketing), and high-yield programmatic ad monetization (Display + Instream/Outstream Video Ads) while maintaining near-zero server infrastructure costs.

### 1.2 Core Business Objectives
* **Low-Cost Scalability:** Handle sudden traffic spikes from social media and paid ad campaigns without server downtime or bandwidth overage fees.
* **High Ad Viewability & RPM:** Maximize revenue per mille (RPM) through strategic programmatic display slots and VAST/VPAID video pre-roll/mid-roll placements.
* **Streamlined Publishing:** Provide an intuitive, authenticated internal CMS for writers/editors to upload videos, images, and articles with rich SEO attributes.
* **Policy-Compliant Monetization:** Ensure 100% compliance with Google AdSense / AdX / programmatic network policies (avoiding invalid traffic mechanisms like auto-clickers or forced page refreshes, focusing instead on viewability, lazy-loading, and video ad yield).

---

## 2. System Architecture & Tech Stack

| Layer | Technology | Role & Justification |
| :--- | :--- | :--- |
| **Frontend & Backend Framework** | **Astro** (Hybrid Mode) | Generates ultra-fast static HTML (SSG) for public pages (ensuring clean DOM reloads for programmatic ad scripts) while supporting SSR & API routes for the `/admin` CMS. |
| **Interactive UI Islands** | **React / Vanilla JS** | Used selectively for the custom video player, interactive carousels, and the CMS rich-text/media editor. |
| **Hosting & Edge Compute** | **Cloudflare Pages & Workers** | Global CDN edge caching, zero cold-start SSR execution, and automatic scaling for traffic surges. |
| **Primary Database** | **Cloudflare D1** (SQLite) | Stores article bodies, video metadata, categories, tags, SEO fields, and user roles with zero-latency edge reads. |
| **Media & Asset Storage** | **Cloudflare R2** | Stores thumbnails, article images, and `.mp4`/HLS video files with **zero egress (bandwidth) fees**. |
| **Authentication** | **Clerk** or **Better Auth** | Secures `/admin` routes and API endpoints with role-based access control (Admin, Editor, Writer). |
| **Video & Ad Player** | **Video.js + Google IMA SDK** | Lightweight HTML5 video player supporting VAST/VPAID/VMAP programmatic video ads (pre-roll, mid-roll, outstream). |

---

## 3. Frontend UI/UX Concept (Inspired by KGNow.com)

The frontend adopts a **dark-and-light hybrid media portal layout** designed to emphasize visual thumbnails, continuous video discovery, and high-visibility ad placements without degrading Core Web Vitals.

### 3.1 Global Navigation & Header
* **Sticky Top Bar:** Brand logo, primary category navigation (`Home`, `News`, `Entertainment`, `Sport`, `Lifestyle`, `Tekno`, `Trending`), search trigger, and dark/light mode toggle.
* **Top Leaderboard Ad Slot:** Dedicated `970x250` / `728x90` (Desktop) and `320x100` (Mobile) container above or immediately below the main navbar with reserved CSS `min-height` to prevent Cumulative Layout Shift (CLS).

### 3.2 Homepage Layout Structure
1. **Hero Spotlight Section (2-Column Grid):**
   * **Left (65% width):** Featured Autoplay-Muted Video Player / Lead Story with bold headline overlay, category badge, publish timestamp, and duration pill.
   * **Right (35% width):** "Up Next / Editor's Picks" vertical scrollable playlist (4–5 compact cards with thumbnails and duration tags).
2. **Trending Horizontal Carousel ("Terpopuler"):**
   * Horizontal swipeable card row featuring 16:9 thumbnails, play icon overlays, view count indicators, and category tags.
3. **Category-Segmented Feeds (Grid + Sidebar):**
   * **Main Feed (Left 70%):** Modular content blocks grouped by category (e.g., *Latest Videos*, *Deep Dive Articles*), alternating between 3-column video grids and horizontal list cards.
   * **Sticky Right Sidebar (30%):** "Most Watched" ranked list (1–5) paired with a sticky `300x250` / `300x600` programmatic display ad unit.
4. **In-Feed Native Ad Slots:**
   * Programmatic native ad cards injected seamlessly after every 6th content card in the feed.

### 3.3 Content Detail Page (`/watch/[slug]` & `/read/[slug]`)
* **Primary Media Stage:**
  * **Video Posts:** Full-width theatrical dark container housing the Video.js player with pre-roll VAST ad integration, playback speed controls, and picture-in-picture (PiP) mini-player on scroll.
  * **Article Posts:** Hero cover image, structured H1/H2 typography, reading time estimate, and optional floating **Outstream Video Ad** player embedded mid-article.
* **Metadata & Engagement Bar:** Author profile, publish date, category/tag pills, and social share buttons (WhatsApp, X/Twitter, Facebook, Copy Link).
* **In-Content Ad Injection:** Automated ad slots placed after Paragraph 2, Paragraph 5, and at the end of the article body.
* **Related Content Infinite/Paginated Grid:** Recommended videos and articles below the content to maximize pages-per-session.
* **Bottom Sticky Anchor Ad:** Dismissible `320x50` / `728x90` anchor banner pinned to the bottom viewport.

---

## 4. Functional Requirements

### 4.1 Public Portal (Frontend)
* **FR-01 Hybrid Page Rendering:** Render public homepage, category archives, and detail pages as edge-cached HTML so every page navigation executes a clean lifecycle for Google Publisher Tags (GPT) and header bidding scripts.
* **FR-02 Lazy-Loaded Ad Slots:** Implement `IntersectionObserver` to load below-the-fold programmatic ad units only when the user scrolls within `200px` of the slot, boosting viewability scores and initial page load speed.
* **FR-03 Adaptive Video Playback:** Support MP4 and HLS (`.m3u8`) streams hosted on Cloudflare R2 with automatic fallback, thumbnail poster previews, and Google IMA SDK VAST tag execution.
* **FR-04 SEO & Social Graph Automation:** Auto-generate JSON-LD structured data (`VideoObject` and `NewsArticle` schemas), OpenGraph tags, canonical URLs, and dynamic XML sitemaps (`/sitemap.xml`).

### 4.2 Admin CMS & Authentication (`/admin`)
* **FR-05 Role-Based Login:** Secure `/admin` and `/api/admin/*` via middleware authentication supporting two roles:
  * `Admin`: Full access (manage users, categories, ad slot configurations, publish/delete any post).
  * `Writer`: Create, edit, and upload media for own drafts; submit for review or publish.
* **FR-06 Content Creation & Rich Editor:**
  * Support two post formats: **Video Post** (primary video + summary text) and **Article Post** (long-form rich text + embedded media).
  * Rich text editor (TipTap) supporting headings, blockquotes, bullet lists, inline images, and tweet/YouTube embeds.
* **FR-07 Direct-to-R2 Media Uploader:**
  * Drag-and-drop uploader generating presigned URLs (or streaming via Astro API Worker) to upload thumbnails, article images (auto-converted/validated for WebP/AVIF), and video files directly to **Cloudflare R2**.
  * Automatic generation and copying of public CDN URLs (`https://cdn.yourdomain.com/...`).
* **FR-08 Supporting Attributes & SEO Panel:**
  * Inputs for Custom Slug, Meta Title, Meta Description, Focus Keywords, Category, Multi-Tags, Video Duration (`MM:SS`), Featured Flag (pins to Hero Spotlight), and Publish Status (`Draft`, `Scheduled`, `Published`).
* **FR-09 Dynamic Ad Configuration Manager:**
  * Admin settings panel to paste/update programmatic ad tags (Header scripts, AdSense/AdX slot IDs, VAST video ad tag URLs) stored in D1/KV without requiring code redeployment.

---

## 5. Data Model (Cloudflare D1 Schema)

```sql
-- Users Table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'writer')) DEFAULT 'writer',
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT
);

-- Posts (Articles & Videos) Table
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  post_type TEXT CHECK(post_type IN ('article', 'video')) NOT NULL,
  excerpt TEXT,
  content_html TEXT,
  thumbnail_url TEXT NOT NULL,
  video_url TEXT,
  video_duration INTEGER, -- in seconds
  category_id INTEGER REFERENCES categories(id),
  author_id TEXT REFERENCES users(id),
  is_featured BOOLEAN DEFAULT 0,
  status TEXT CHECK(status IN ('draft', 'published')) DEFAULT 'draft',
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT, -- JSON array string e.g. '["viral","tech"]'
  views_count INTEGER DEFAULT 0,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ad Configurations Table
CREATE TABLE ad_configs (
  slot_key TEXT PRIMARY KEY, -- e.g., 'header_script', 'top_leaderboard', 'in_article_1', 'vast_preroll'
  ad_code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. Non-Functional Requirements & Guardrails

* **Performance:** Google Lighthouse Performance score $\ge 90$ on mobile; Time to First Byte (TTFB) $< 100\text{ms}$ via Cloudflare Edge Cache.
* **Layout Stability:** All ad slots must define explicit dimensions (`min-width` / `min-height`) to maintain CLS $< 0.1$.
* **Ad Network Compliance:** Strictly prohibit automated click scripts, hidden iframes, or forced auto-refresh timers. Implement standard viewable-impression refresh rules (minimum 30–60 seconds active viewport visibility) only if explicitly permitted by the demand partner (e.g., Google Ad Manager Active View).
* **Security:** Sanitize all rich-text HTML output on render to prevent XSS; validate MIME types and file sizes on R2 media uploads (e.g., max 5MB for images, max 250MB for MP4 videos).

---

## 7. Phased Implementation Roadmap

1. **Phase 1: Foundation & Public UI (Week 1)**
   * Initialize Astro project with Cloudflare adapter, D1 database, and R2 bucket bindings.
   * Build KGNow-inspired responsive frontend components (Header, Hero Spotlight, Category Grids, Detail Pages) using mock data.
2. **Phase 2: CMS, Auth & Media Pipeline (Week 2)**
   * Integrate authentication (`Clerk` / `Better Auth`) and build `/admin` dashboard.
   * Implement TipTap article editor, R2 drag-and-drop image/video uploader, and D1 CRUD API endpoints.
3. **Phase 3: Video Player & Programmatic Ad Integration (Week 3)**
   * Integrate Video.js + Google IMA SDK for VAST pre-roll video ads.
   * Wire up lazy-loaded display ad slots (`AdConfigs` table) and verify CLS/viewability metrics.
4. **Phase 4: SEO, Analytics & Traffic Launch (Week 4)**
   * Deploy XML sitemaps, JSON-LD schemas, Cloudflare Web Analytics / GA4, and UTM tracking for digital marketing campaigns.