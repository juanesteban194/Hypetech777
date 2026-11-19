'use client'

import { useEffect } from 'react'

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // The message is never shown to visitors: it may contain internal details.
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-page flex-col justify-center gap-6 px-(--gutter) py-(--section-y)">
      <p className="font-mono text-micro tracking-mono text-text-3 uppercase">Error</p>
      <h1 className="font-display text-display-l font-extrabold tracking-display uppercase font-stretch-expanded">
        Algo salió mal
      </h1>
      <p className="max-w-prose text-text-2">
        No pudimos cargar esta página. Inténtalo de nuevo en un momento.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="inline-flex h-11 w-fit cursor-pointer items-center rounded-pill bg-cta px-6 font-medium text-cta-text"
      >
        Intentar de nuevo
      </button>
    </main>
  )
}
