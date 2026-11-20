-- D1 Initial Schema for Media Portal (KGNow-inspired)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK(role IN ('superadmin', 'admin', 'writer')) DEFAULT 'writer',
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  post_type TEXT CHECK(post_type IN ('article', 'video')) NOT NULL,
  excerpt TEXT,
  content_html TEXT,
  thumbnail_url TEXT NOT NULL,
  video_url TEXT,
  video_duration INTEGER DEFAULT 0, -- seconds
  category_id INTEGER REFERENCES categories(id),
  author_id TEXT REFERENCES users(id),
  is_featured BOOLEAN DEFAULT 0,
  status TEXT CHECK(status IN ('draft', 'published')) DEFAULT 'draft',
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT, -- JSON array string
  views_count INTEGER DEFAULT 0,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ad_configs (
  slot_key TEXT PRIMARY KEY,
  ad_code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Categories
INSERT OR IGNORE INTO categories (id, name, slug, description) VALUES
(1, 'News', 'news', 'Breaking global and local news'),
(2, 'Entertainment', 'entertainment', 'Celebrity buzz, movies, music'),
(3, 'Sport', 'sport', 'Match updates, athlete highlights, rankings'),
(4, 'Tekno', 'tekno', 'Gadgets, AI, tech startups'),
(5, 'Lifestyle', 'lifestyle', 'Health, travel, culinary trends'),
(6, 'Trending', 'trending', 'Viral social media moments');

-- Seed Superadmin, Admin, and Writer Users with bcrypt hashes
INSERT OR IGNORE INTO users (id, username, email, password_hash, name, role, avatar_url) VALUES
('usr_superadmin', 'superadmin', 'superadmin@themedia.local', '$2b$10$PT0qiMTi4jdCA.T3J0RJ4OQ5WuU8pv9tETXzrxMj5gnTPyPvtvKrW', 'Master Superadmin', 'superadmin', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop'),
('usr_admin_1', 'admin', 'admin@themedia.local', '$2b$10$e1VO3gS2vCIJ.Fiw8jzlhuDrooSOksV85bm3Ov33wx73qjeoYRqcu', 'Editorial Lead', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop'),
('usr_writer_1', 'writer', 'writer@themedia.local', '$2b$10$cflecZF/jADaNkWSIYn5vOQIMZH6VQFfgFrg2eJQP773bl3SqcA0C', 'Staff Journalist', 'writer', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop');

-- Seed Initial Ad Slots
INSERT OR IGNORE INTO ad_configs (slot_key, ad_code, is_active) VALUES
('top_leaderboard', '<div class="w-full h-full flex items-center justify-center bg-zinc-800/80 text-zinc-400 text-xs tracking-wider border border-zinc-700/60 rounded">SPONSORED LEADERBOARD (728x90 / 970x250)</div>', 1),
('sticky_sidebar', '<div class="w-full h-[600px] flex items-center justify-center bg-zinc-800/80 text-zinc-400 text-xs tracking-wider border border-zinc-700/60 rounded">STICKY HALF-PAGE AD (300x600)</div>', 1),
('in_article_mid', '<div class="w-full h-[250px] flex items-center justify-center bg-zinc-800/80 text-zinc-400 text-xs tracking-wider border border-zinc-700/60 rounded">MID-CONTENT SPONSORED UNIT (300x250)</div>', 1);

-- Seed Initial Posts (Editorial & Video Streams)
INSERT OR IGNORE INTO posts (
  id, title, slug, post_type, excerpt, content_html, thumbnail_url, video_url, video_duration, category_id, author_id, is_featured, status, views_count, published_at
) VALUES
(
  'post_1',
  'Super EV Hypercar Breaks Nürburgring Lap Record With Autonomous AI Assist',
  'super-ev-hypercar-nurburgring-record',
  'video',
  'Witness onboard footage as the all-electric powertrain smashes previous track benchmark by over 4 seconds.',
  '<p>The dawn of algorithmic race telemetry arrived at the Nordschleife this morning. Equipped with real-time torque vectoring governed by an onboard neural processor, the dual-motor prototype delivered continuous 1,400 horsepower.</p><p>Driver and engineers reported sub-millisecond throttle adjustments on damp surface sections, preserving optimal tire footprint temperatures across all 73 corners.</p>',
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1280&auto=format&fit=crop&q=80',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  385,
  4,
  'usr_admin_1',
  1,
  'published',
  142300,
  '2026-11-20T08:30:00Z'
),
(
  'post_2',
  'World Cup Qualifier: Late Stoppage Header Secures Dramatic Comeback Win',
  'world-cup-qualifier-stoppage-header-winner',
  'video',
  'Watch the final 5 minutes of electrifying counter-attacks ending with a 94th-minute match winner.',
  '<p>A raucous home stadium witnessed sheer pandemonium in stoppage time as captain delivered a looping header over the outstretched goalkeeper.</p>',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  214,
  3,
  'usr_writer_1',
  0,
  'published',
  89400,
  '2026-11-20T07:15:00Z'
),
(
  'post_3',
  'Blockbuster Sci-Fi Sequel Drops First Official Teaser Trailer',
  'blockbuster-scifi-sequel-teaser-trailer',
  'video',
  'Director reveals groundbreaking practical miniatures combined with volumetric capture technology.',
  '<p>Fans erupted across social feeds following the two-minute teaser unveiling never-before-seen celestial set pieces.</p>',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  142,
  2,
  'usr_writer_1',
  0,
  'published',
  240500,
  '2026-11-19T21:00:00Z'
),
(
  'post_4',
  'Quantum Computing Consortium Announces 10,000 Logical Qubit Breakthrough',
  'quantum-computing-consortium-logical-qubit',
  'article',
  'Fault-tolerant topological error correction unlocks industrial drug synthesis simulations decades ahead of target schedule.',
  '<p>Researchers at the International Quantum Array have successfully maintained continuous error-corrected quantum states across 10,000 braided qubits.</p><p>The breakthrough relies on specialized surface-code topology cooled near absolute zero, allowing complex enzyme interactions to compute within hours instead of classical centuries.</p><h2>Industrial Implications</h2><p>Pharmaceutical partners have already begun loading active enzyme models onto the distributed cluster to design targeted cellular inhibitors.</p>',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
  NULL,
  0,
  4,
  'usr_admin_1',
  0,
  'published',
  67200,
  '2026-11-19T18:45:00Z'
),
(
  'post_5',
  'Urban High-Speed Rail Corridor Opens Connecting Major Financial Metropolises',
  'urban-high-speed-rail-corridor-opens',
  'article',
  'Magnetic levitation trains reduce four-hour transit times down to a brisk 38 minutes at speeds exceeding 450 km/h.',
  '<p>The infrastructure project cuts carbon emissions by an estimated 60% across the regional trade corridor while handling over 150,000 daily passengers.</p>',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
  NULL,
  0,
  1,
  'usr_writer_1',
  0,
  'published',
  53100,
  '2026-11-19T14:20:00Z'
),
(
  'post_6',
  'Top 7 Coastal Destinations Redefining Sustainable Eco-Tourism in 2026',
  'coastal-destinations-sustainable-eco-tourism',
  'article',
  'Zero-waste island retreats and community-led coral restoration projects set a new benchmark for global wanderlust.',
  '<p>From solar-powered floating bungalows to native mangrove sanctuary tours, travelers increasingly demand authentic regenerative hospitality.</p>',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  NULL,
  0,
  5,
  'usr_writer_1',
  0,
  'published',
  41800,
  '2026-11-19T11:00:00Z'
);
