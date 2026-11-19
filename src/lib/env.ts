import { z } from 'zod'

// Environment variables are documented one by one in .env.example.
// Phase 0 only needs the public site URL; later phases extend this schema.

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().optional(),
})

// Next.js only inlines NEXT_PUBLIC_* when they are referenced literally.
const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
})

/**
 * Canonical origin of the site, without a trailing slash.
 * Order: explicit NEXT_PUBLIC_SITE_URL -> Vercel production URL -> Vercel deployment URL -> localhost.
 */
export function getSiteUrl(): string {
  if (publicEnv.NEXT_PUBLIC_SITE_URL) return publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const deploymentHost = process.env.VERCEL_URL
  if (process.env.VERCEL_ENV === 'production' && productionHost) return `https://${productionHost}`
  if (deploymentHost) return `https://${deploymentHost}`

  return 'http://localhost:3000'
}
