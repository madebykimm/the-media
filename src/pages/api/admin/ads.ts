import type { APIRoute } from 'astro';

export interface AdConfigItem {
  slot_key: string;
  name: string;
  dimensions: string;
  description: string;
  ad_code: string;
  is_active: boolean;
}

export const INITIAL_AD_CONFIGS: AdConfigItem[] = [
  {
    slot_key: 'top_leaderboard',
    name: 'Top Leaderboard Ad',
    dimensions: '970x250 / 728x90',
    description: 'Sticky or pinned top slot above content fold. Must reserve min-height 90px to prevent CLS.',
    ad_code: `<div id="gpt-top-leaderboard" class="w-full flex items-center justify-center p-4 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs">
  [Google AdManager 728x90 / 970x250 Responsive Leaderboard Tag]
</div>`,
    is_active: true,
  },
  {
    slot_key: 'sticky_sidebar',
    name: 'Sticky Sidebar Unit',
    dimensions: '300x600 Half-page',
    description: 'High RPM sticky sidebar container for desktop users. Retains 30s-60s active viewability.',
    ad_code: `<div id="gpt-sticky-sidebar" class="w-[300px] h-[600px] mx-auto bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center text-xs">
  [Programmatic 300x600 Half-Page Display Ad]
</div>`,
    is_active: true,
  },
  {
    slot_key: 'in_feed_native',
    name: 'In-Feed Native Ad Card',
    dimensions: 'Responsive Native',
    description: 'Blended programmatic sponsored card inserted every 3-6 feed items.',
    ad_code: `<div class="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between text-zinc-400 text-xs">
  <span>Sponsored Headline Recommendation</span>
  <span class="text-[10px] uppercase font-bold text-zinc-500">Ad</span>
</div>`,
    is_active: true,
  },
  {
    slot_key: 'vast_preroll',
    name: 'Video VAST / VPAID Pre-roll Tag',
    dimensions: 'Instream Video',
    description: 'Google IMA SDK pre-roll ad tag URL triggered before primary video stream start.',
    ad_code: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=',
    is_active: true,
  },
  {
    slot_key: 'in_article_mid',
    name: 'Mid-Article In-Content Banner',
    dimensions: '300x250 / 336x280',
    description: 'Injected dynamically between Paragraphs 2 and 3 on long-form editorial posts.',
    ad_code: `<div id="gpt-in-article-mid" class="w-full max-w-[336px] h-[280px] mx-auto bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 text-xs">
  [In-Article Rectangle Unit 336x280]
</div>`,
    is_active: true,
  },
  {
    slot_key: 'bottom_anchor',
    name: 'Bottom Sticky Anchor Banner',
    dimensions: '320x50 (Mobile) / 728x90 (Desktop)',
    description: 'Dismissible anchor unit pinned to bottom of user viewport.',
    ad_code: `<div id="gpt-bottom-anchor" class="w-full text-center text-xs text-zinc-400">
  [Bottom Viewport Sticky Banner 728x90]
</div>`,
    is_active: true,
  },
];

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ configs: INITIAL_AD_CONFIGS }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    return new Response(JSON.stringify({ success: true, updated: body }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
