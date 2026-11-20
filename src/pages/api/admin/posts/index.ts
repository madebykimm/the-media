import type { APIRoute } from 'astro';
import { getAllPosts, createPost, type PostInput } from '../../../../lib/models';

export const GET: APIRoute = async () => {
  try {
    const posts = await getAllPosts();
    return new Response(JSON.stringify({ posts }), {
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

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const user = locals.user;

    if (!body.title || !body.thumbnail_url || !body.excerpt) {
      return new Response(
        JSON.stringify({ error: 'Title, thumbnail URL, and excerpt are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const postInput: PostInput = {
      title: body.title,
      slug: body.slug,
      post_type: body.post_type || 'video',
      excerpt: body.excerpt,
      content_html: body.content_html || '',
      thumbnail_url: body.thumbnail_url,
      video_url: body.video_url || '',
      video_duration: body.video_duration ? Number(body.video_duration) : 0,
      category_id: Number(body.category_id) || 1,
      author_id: user?.id || 'usr_admin_1',
      is_featured: Boolean(body.is_featured),
      status: body.status || 'published',
    };

    const newPost = await createPost(postInput);

    return new Response(JSON.stringify({ success: true, post: newPost }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to create post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
