import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate size limit (max 250MB for video, 10MB for images)
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 250 * 1024 * 1024 : 10 * 1024 * 1024;

    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: `File exceeds limit of ${isVideo ? '250MB' : '10MB'}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const r2Key = `${folder}/${cleanFileName}`;

    // Cloudflare R2 runtime binding check
    let r2Bucket: any = null;
    try {
      // @ts-ignore
      r2Bucket = (locals as any)?.runtime?.env?.R2_MEDIA;
    } catch {}

    if (r2Bucket && typeof r2Bucket.put === 'function') {
      const buffer = await file.arrayBuffer();
      await r2Bucket.put(r2Key, buffer, {
        httpMetadata: { contentType: file.type },
      });
    }

    // Return public CDN URL format
    const publicUrl = `https://cdn.themedia.local/${r2Key}`;

    return new Response(
      JSON.stringify({
        success: true,
        key: r2Key,
        url: publicUrl,
        fileName: file.name,
        size: file.size,
        type: file.type,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
