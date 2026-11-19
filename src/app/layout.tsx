import type { Metadata, Viewport } from 'next'
import { siteConfig } from '@/config/site'
import { getSiteUrl } from '@/lib/env'
import { THEME_INIT_SCRIPT } from '@/lib/theme'
import { fontVariables } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  // Not indexable until launch (phase 8). TODO(owner): remove this line when the store goes live.
  robots: { index: false, follow: false },
  formatDetection: { telephone: false, email: false, address: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#07080A' },
    { media: '(prefers-color-scheme: light)', color: '#F7F7F8' },
  ],
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // suppressHydrationWarning: the inline script sets data-theme before React hydrates.
    <html lang="es-CO" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
