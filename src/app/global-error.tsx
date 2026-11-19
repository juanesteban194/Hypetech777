'use client'

import { useEffect } from 'react'
import './globals.css'

// Replaces the root layout when it fails, so it must render <html> and <body> itself.
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="es-CO" data-theme="dark">
      <body>
        <main className="mx-auto flex min-h-dvh w-full max-w-page flex-col justify-center gap-6 px-(--gutter) py-(--section-y)">
          <h1 className="text-h1 font-bold">Algo salió mal</h1>
          <p className="max-w-prose text-text-2">
            No pudimos cargar el sitio. Inténtalo de nuevo en un momento.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex h-11 w-fit cursor-pointer items-center rounded-pill bg-cta px-6 font-medium text-cta-text"
          >
            Intentar de nuevo
          </button>
        </main>
      </body>
    </html>
  )
}
