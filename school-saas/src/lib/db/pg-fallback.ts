import 'server-only';
import { Pool, PoolConfig } from 'pg';

let pool: Pool | null = null;

/**
 * Server-only PostgreSQL direct connection pool.
 * Used by performance-critical server actions and queries when DATABASE_URL is configured.
 * Configured with secure TLS (rejectUnauthorized: true) for remote connections.
 * Insecure TLS and direct raw SQL manipulation of auth.users
 * have been decommissioned under TASK-0002.
 */
export function getPgPool(): Pool | null {
  if (!pool && process.env.DATABASE_URL) {
    const isLocalhost =
      process.env.DATABASE_URL.includes('localhost') ||
      process.env.DATABASE_URL.includes('127.0.0.1');

    const config: PoolConfig = {
      connectionString: process.env.DATABASE_URL,
    };

    if (!isLocalhost) {
      config.ssl = { rejectUnauthorized: true };
    }

    pool = new Pool(config);
  }
  return pool;
}
