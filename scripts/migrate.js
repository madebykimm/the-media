import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve(process.cwd(), 'local.db');
const MIGRATION_FILE = path.resolve(process.cwd(), 'migrations/0001_init_schema.sql');

console.log(`[Database] Initializing SQLite database at: ${DB_PATH}`);

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Read migration file
if (!fs.existsSync(MIGRATION_FILE)) {
  console.error(`[Error] Migration file not found at: ${MIGRATION_FILE}`);
  process.exit(1);
}

const sql = fs.readFileSync(MIGRATION_FILE, 'utf-8');

// Execute migration and seeder
try {
  db.exec(sql);
  console.log('[Migration] Successfully executed migrations/0001_init_schema.sql');

  // Verify Users Table & Seeded Accounts
  const users = db.prepare("SELECT id, username, email, role, name, SUBSTR(password_hash, 1, 12) || '...' AS hash_preview FROM users").all();
  console.log('\n--- Seeded Users in local.db ---');
  console.table(users);

  // Verify Categories
  const categories = db.prepare('SELECT id, name, slug FROM categories').all();
  console.log('\n--- Seeded Categories in local.db ---');
  console.table(categories);

  // Verify Ad Configurations
  const ads = db.prepare('SELECT slot_key, is_active FROM ad_configs').all();
  console.log('\n--- Seeded Ad Units in local.db ---');
  console.table(ads);

  console.log('\n[Success] Local SQLite database migration and seeding verified.');
} catch (err) {
  console.error('[Error] Migration failed:', err);
  process.exit(1);
} finally {
  db.close();
}
