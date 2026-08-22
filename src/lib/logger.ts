/**
 * Structured logger — production-safe, no-op in production builds.
 *
 * Usage:
 *   import { logger } from '@/lib/logger'
 *   logger.debug('[my-feature]', { foo: 'bar' })
 *   logger.error('[my-feature]', err)
 */

const isProd = process.env.NODE_ENV === 'production'

export const logger = {
  debug: (...args: unknown[]) => {
    if (!isProd) console.debug(...args)
  },
  info: (...args: unknown[]) => {
    if (!isProd) console.info(...args)
  },
  warn: (...args: unknown[]) => {
    if (!isProd) console.warn(...args)
  },
  error: (...args: unknown[]) => {
    if (!isProd) console.error(...args)
  },
}
