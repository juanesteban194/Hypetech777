import type { NextConfig } from 'next'

/**
 * Baseline security headers. A full Content-Security-Policy is intentionally NOT set yet:
 * nonce-based CSP forces dynamic rendering and is incompatible with Cache Components / PPR
 * (see docs/DECISIONES.md, D-008). It is designed and rolled out in phase 7.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // No `preload` until the final domain exists: preloading is a long, hard-to-undo commitment.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
]

const nextConfig: NextConfig = {
  // Cache Components + Partial Prefetching: the defaults of the official 16.4 template.
  cacheComponents: true,
  partialPrefetching: true,
  typedRoutes: true,
  poweredByHeader: false,
  // `next dev` would otherwise write AGENTS.md for detected coding agents (docs/DECISIONES.md, D-012).
  agentRules: false,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
