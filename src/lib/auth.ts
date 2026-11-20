import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const SECRET_KEY = new TextEncoder().encode(
  (typeof process !== 'undefined' && process.env?.AUTH_SECRET) || 'themedia-portal-secure-jwt-secret-key-32chars-min'
);

export type UserRole = 'superadmin' | 'admin' | 'writer';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  password_hash?: string;
}

export interface SeedCredential {
  username: string;
  email: string;
  password: string;
  user: AdminUser;
}

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export const SEEDED_ACCOUNTS: SeedCredential[] = [
  {
    username: 'superadmin',
    email: 'superadmin@themedia.local',
    password: 'superadminpassword123',
    user: {
      id: 'usr_superadmin',
      username: 'superadmin',
      email: 'superadmin@themedia.local',
      name: 'Master Superadmin',
      role: 'superadmin',
      password_hash: '$2b$10$PT0qiMTi4jdCA.T3J0RJ4OQ5WuU8pv9tETXzrxMj5gnTPyPvtvKrW',
    },
  },
  {
    username: 'admin',
    email: 'admin@themedia.local',
    password: 'adminpassword123',
    user: {
      id: 'usr_admin_1',
      username: 'admin',
      email: 'admin@themedia.local',
      name: 'Editorial Lead',
      role: 'admin',
      password_hash: '$2b$10$e1VO3gS2vCIJ.Fiw8jzlhuDrooSOksV85bm3Ov33wx73qjeoYRqcu',
    },
  },
  {
    username: 'writer',
    email: 'writer@themedia.local',
    password: 'writerpassword123',
    user: {
      id: 'usr_writer_1',
      username: 'writer',
      email: 'writer@themedia.local',
      name: 'Staff Journalist',
      role: 'writer',
      password_hash: '$2b$10$cflecZF/jADaNkWSIYn5vOQIMZH6VQFfgFrg2eJQP773bl3SqcA0C',
    },
  },
];

export const DEFAULT_ADMIN_CREDENTIALS = SEEDED_ACCOUNTS[0];

export async function createSessionToken(user: AdminUser): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<AdminUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      id: payload.id as string,
      username: (payload.username as string) || (payload.email as string)?.split('@')[0] || 'user',
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}
