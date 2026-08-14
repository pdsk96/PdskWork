/**
 * DB schema scaffolding.
 *
 * The canonical schema lives in `src/db/schema.sql`. This module exposes the
 * schema text and a lazy connection helper so that build/runtime never requires
 * a live database unless code actually calls `getDb()`.
 */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * DB schema scaffolding.
 *
 * The canonical schema lives in `src/db/schema.sql`. This module exposes the
 * schema text and a lazy connection helper so that build/runtime never requires
 * a live database unless code actually calls `getDb()`.
 */

const SCHEMA_PATH = join(process.cwd(), 'src', 'db', 'schema.sql')

export async function loadSchema(): Promise<string> {
  return readFile(SCHEMA_PATH, 'utf8')
}

/**
 * Lazy database accessor. Intentionally minimal: returns the configured
 * DATABASE_URL so downstream iterations can wire a real driver without
 * changing the schema file or this signature.
 */
export function getDbConfig(): { url: string | undefined } {
  return { url: process.env.DATABASE_URL }
}
