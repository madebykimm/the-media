import { defineMiddleware } from 'astro:middleware';
import { verifySessionToken } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Protect /admin routes (except /admin/login) and /api/admin routes (except /api/admin/login)
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin') && pathname !== '/api/admin/login';

  if (isAdminRoute || isAdminApi) {
    const cookie = context.cookies.get('themedia_session');
    const token = cookie?.value;

    const user = token ? await verifySessionToken(token) : null;

    if (!user) {
      if (isAdminApi) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return context.redirect('/admin/login');
    }

    context.locals.user = user;
  }

  return next();
});
