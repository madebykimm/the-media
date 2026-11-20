import type { APIRoute } from 'astro';
import { SEEDED_ACCOUNTS, createSessionToken, verifyPassword } from '../../../lib/auth';
import { getDbClient } from '../../../lib/db';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let authenticatedUser: any = null;

    const query = 'SELECT id, username, email, password_hash, name, role FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1';

    // 1. Query database (Cloudflare D1 binding or local client)
    try {
      const handle = await getDbClient();
      if (handle?.type === 'd1') {
        const row: any = await handle.db.prepare(query).bind(username, username).first();
        if (row && row.password_hash) {
          const isValid = await verifyPassword(password, row.password_hash);
          if (isValid) {
            authenticatedUser = {
              id: row.id,
              username: row.username,
              email: row.email,
              name: row.name,
              role: row.role,
            };
          }
        }
      } else if (handle?.type === 'libsql') {
        const rs = await handle.client.execute({ sql: query, args: [username, username] });
        const row = rs.rows[0] as any;
        if (row && row.password_hash) {
          const isValid = await verifyPassword(password, row.password_hash);
          if (isValid) {
            authenticatedUser = {
              id: row.id,
              username: row.username,
              email: row.email,
              name: row.name,
              role: row.role,
            };
          }
        }
      }
    } catch (e) {
      console.warn('[Login] DB query failed, falling back:', e);
    }

    // 2. Fallback to bcrypt-verified SEEDED_ACCOUNTS
    if (!authenticatedUser) {
      const match = SEEDED_ACCOUNTS.find(
        (acc) =>
          acc.username.toLowerCase() === username.toLowerCase() ||
          acc.email.toLowerCase() === username.toLowerCase()
      );
      if (match && match.user.password_hash) {
        const isValid = await verifyPassword(password, match.user.password_hash);
        if (isValid) {
          authenticatedUser = match.user;
        }
      }
    }

    if (authenticatedUser) {
      const token = await createSessionToken({
        id: authenticatedUser.id,
        username: authenticatedUser.username,
        email: authenticatedUser.email,
        name: authenticatedUser.name,
        role: authenticatedUser.role,
      });

      cookies.set('themedia_session', token, {
        path: '/',
        httpOnly: true,
        secure: false, // allow local dev HTTP
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return new Response(JSON.stringify({ success: true, user: authenticatedUser }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
