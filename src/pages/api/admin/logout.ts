import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('themedia_session', { path: '/' });
  return redirect('/admin/login');
};
