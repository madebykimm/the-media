import type { Client } from '@libsql/client';

let cachedClient: any = null;

export async function getDbClient(): Promise<any> {
  // 1. Try Cloudflare Worker environment binding (env.DB)
  try {
    const { env } = await import('cloudflare:workers');
    if (env && (env as any).DB) {
      return {
        type: 'd1',
        db: (env as any).DB,
      };
    }
  } catch {}

  // 2. Try Node/local SQLite environment
  if (!cachedClient) {
    try {
      const { createClient } = await import('@libsql/client');
      // In web/workerd mode where createClient only supports http/ws, test or fallback
      cachedClient = {
        type: 'libsql',
        client: createClient({ url: 'file:local.db' }),
      };
    } catch {}
  }

  return cachedClient;
}
