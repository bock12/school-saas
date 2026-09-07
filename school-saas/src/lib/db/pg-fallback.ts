import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { Pool, PoolConfig } from 'pg';

let pool: Pool | null = null;

function resolveCaCertificate(): string | undefined {
  const envCa = process.env.DATABASE_SSL_CA;
  if (envCa) {
    if (fs.existsSync(envCa)) {
      return fs.readFileSync(envCa, 'utf8');
    }
    if (envCa.includes('BEGIN CERTIFICATE')) {
      return envCa;
    }
  }

  const defaultCaPath = path.join(process.cwd(), 'supabase', 'certs', 'prod-ca-2021.crt');
  if (fs.existsSync(defaultCaPath)) {
    return fs.readFileSync(defaultCaPath, 'utf8');
  }

  return undefined;
}

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
      const ca = resolveCaCertificate();
      config.ssl = ca
        ? { rejectUnauthorized: true, ca }
        : { rejectUnauthorized: true };
    }

    pool = new Pool(config);
  }
  return pool;
}
