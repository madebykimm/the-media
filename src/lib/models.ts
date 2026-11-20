import { getDbClient } from './db';

export interface Post {
  id: string;
  title: string;
  slug: string;
  post_type: 'article' | 'video';
  excerpt: string;
  content_html?: string;
  thumbnail_url: string;
  video_url?: string;
  video_duration?: number;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  author_id?: string;
  author_name?: string;
  is_featured?: boolean;
  status: 'draft' | 'published';
  views_count: number;
  published_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export function formatDuration(seconds?: number): string {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const handle = await getDbClient();
    if (handle?.type === 'd1') {
      const { results } = await handle.db.prepare('SELECT id, name, slug, description FROM categories ORDER BY id ASC').all();
      return results as Category[];
    }
    if (handle?.type === 'libsql') {
      const rs = await handle.client.execute('SELECT id, name, slug, description FROM categories ORDER BY id ASC');
      return rs.rows as unknown as Category[];
    }
  } catch (err) {
    console.error('[getAllCategories] error:', err);
  }
  return [];
}

const POST_SELECT_FIELDS = `
  p.id, p.title, p.slug, p.post_type, p.excerpt, p.content_html,
  p.thumbnail_url, p.video_url, p.video_duration, p.category_id,
  p.author_id, p.is_featured, p.status, p.views_count, p.published_at,
  c.name AS category_name, c.slug AS category_slug,
  u.name AS author_name
`;

export async function getAllPosts(): Promise<Post[]> {
  const query = `
    SELECT ${POST_SELECT_FIELDS}
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN users u ON p.author_id = u.id
    ORDER BY p.published_at DESC
  `;

  try {
    const handle = await getDbClient();
    if (handle?.type === 'd1') {
      const { results } = await handle.db.prepare(query).all();
      return results as Post[];
    }
    if (handle?.type === 'libsql') {
      const rs = await handle.client.execute(query);
      return rs.rows as unknown as Post[];
    }
  } catch (err) {
    console.error('[getAllPosts] error:', err);
  }
  return [];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const query = `
    SELECT ${POST_SELECT_FIELDS}
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.slug = ?
    LIMIT 1
  `;

  try {
    const handle = await getDbClient();
    if (handle?.type === 'd1') {
      const row = await handle.db.prepare(query).bind(slug).first();
      return (row as Post) || null;
    }
    if (handle?.type === 'libsql') {
      const rs = await handle.client.execute({ sql: query, args: [slug] });
      return (rs.rows[0] as unknown as Post) || null;
    }
  } catch (err) {
    console.error('[getPostBySlug] error:', err);
  }
  return null;
}

export async function getPostById(id: string): Promise<Post | null> {
  const query = `
    SELECT ${POST_SELECT_FIELDS}
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.id = ?
    LIMIT 1
  `;

  try {
    const handle = await getDbClient();
    if (handle?.type === 'd1') {
      const row = await handle.db.prepare(query).bind(id).first();
      return (row as Post) || null;
    }
    if (handle?.type === 'libsql') {
      const rs = await handle.client.execute({ sql: query, args: [id] });
      return (rs.rows[0] as unknown as Post) || null;
    }
  } catch (err) {
    console.error('[getPostById] error:', err);
  }
  return null;
}

export interface PostInput {
  title: string;
  slug?: string;
  post_type: 'article' | 'video';
  excerpt: string;
  content_html?: string;
  thumbnail_url: string;
  video_url?: string;
  video_duration?: number;
  category_id: number;
  author_id?: string;
  is_featured?: boolean;
  status?: 'draft' | 'published';
}

export async function createPost(input: PostInput): Promise<Post> {
  const id = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.title);
  if (!slug) slug = `post-${Date.now()}`;

  const post_type = input.post_type || 'video';
  const excerpt = input.excerpt || '';
  const content_html = input.content_html || '';
  const thumbnail_url = input.thumbnail_url || '';
  const video_url = input.video_url || null;
  const video_duration = input.video_duration ? Number(input.video_duration) : (post_type === 'video' ? 0 : null);
  const category_id = Number(input.category_id) || 1;
  const author_id = input.author_id || 'usr_admin_1';
  const is_featured = input.is_featured ? 1 : 0;
  const status = input.status || 'published';
  const views_count = 0;
  const published_at = new Date().toISOString();

  const handle = await getDbClient();
  const insertSql = `
    INSERT INTO posts (
      id, title, slug, post_type, excerpt, content_html, thumbnail_url,
      video_url, video_duration, category_id, author_id, is_featured,
      status, views_count, published_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const args = [
    id,
    input.title,
    slug,
    post_type,
    excerpt,
    content_html,
    thumbnail_url,
    video_url,
    video_duration,
    category_id,
    author_id,
    is_featured,
    status,
    views_count,
    published_at,
  ];

  if (handle?.type === 'd1') {
    await handle.db.prepare(insertSql).bind(...args).run();
  } else if (handle?.type === 'libsql') {
    await handle.client.execute({ sql: insertSql, args });
  } else {
    throw new Error('Database client not available');
  }

  const created = await getPostById(id);
  if (!created) {
    throw new Error('Failed to retrieve newly created post');
  }
  return created;
}

export async function updatePost(id: string, input: Partial<PostInput>): Promise<Post> {
  const existing = await getPostById(id);
  if (!existing) {
    throw new Error('Post not found');
  }

  const title = input.title ?? existing.title;
  let slug = existing.slug;
  if (input.slug && input.slug.trim()) {
    slug = slugify(input.slug);
  } else if (input.title && !input.slug) {
    slug = existing.slug; // Keep existing slug if title changed but custom slug not requested
  }

  const post_type = input.post_type ?? existing.post_type;
  const excerpt = input.excerpt ?? existing.excerpt;
  const content_html = input.content_html ?? existing.content_html ?? '';
  const thumbnail_url = input.thumbnail_url ?? existing.thumbnail_url;
  const video_url = input.video_url !== undefined ? (input.video_url || null) : (existing.video_url || null);
  const video_duration = input.video_duration !== undefined ? Number(input.video_duration) : (existing.video_duration || 0);
  const category_id = input.category_id !== undefined ? Number(input.category_id) : existing.category_id;
  const is_featured = input.is_featured !== undefined ? (input.is_featured ? 1 : 0) : (existing.is_featured ? 1 : 0);
  const status = input.status ?? existing.status;

  const updateSql = `
    UPDATE posts SET
      title = ?,
      slug = ?,
      post_type = ?,
      excerpt = ?,
      content_html = ?,
      thumbnail_url = ?,
      video_url = ?,
      video_duration = ?,
      category_id = ?,
      is_featured = ?,
      status = ?
    WHERE id = ?
  `;

  const args = [
    title,
    slug,
    post_type,
    excerpt,
    content_html,
    thumbnail_url,
    video_url,
    video_duration,
    category_id,
    is_featured,
    status,
    id,
  ];

  const handle = await getDbClient();
  if (handle?.type === 'd1') {
    await handle.db.prepare(updateSql).bind(...args).run();
  } else if (handle?.type === 'libsql') {
    await handle.client.execute({ sql: updateSql, args });
  } else {
    throw new Error('Database client not available');
  }

  const updated = await getPostById(id);
  if (!updated) {
    throw new Error('Failed to retrieve updated post');
  }
  return updated;
}

export async function deletePost(id: string): Promise<boolean> {
  const handle = await getDbClient();
  const deleteSql = 'DELETE FROM posts WHERE id = ?';

  if (handle?.type === 'd1') {
    await handle.db.prepare(deleteSql).bind(id).run();
    return true;
  }
  if (handle?.type === 'libsql') {
    await handle.client.execute({ sql: deleteSql, args: [id] });
    return true;
  }
  return false;
}
