import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Página no encontrada' }

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-page flex-col justify-center gap-6 px-(--gutter) py-(--section-y)">
      <p className="font-mono text-micro tracking-mono text-text-3 uppercase">Error 404</p>
      <h1 className="font-display text-display-l font-extrabold tracking-display uppercase font-stretch-expanded">
        No encontrada
      </h1>
      <p className="max-w-prose text-text-2">
        La página que buscas no existe o ya no está disponible.
      </p>
      <Link
        href="/"
        className="inline-flex h-11 w-fit items-center rounded-pill bg-cta px-6 font-medium text-cta-text"
      >
        Volver al inicio
      </Link>
    </main>
  )
}
