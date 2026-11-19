import { Wordmark } from '@/components/ui/wordmark'

export default function HomePage() {
  return (
    <main
      id="contenido"
      className="mx-auto flex min-h-dvh w-full max-w-page flex-col justify-center gap-10 px-(--gutter) py-(--section-y)"
    >
      <Wordmark className="text-small" />

      <div className="flex flex-col gap-4">
        <p className="font-mono text-micro tracking-mono text-text-3 uppercase">
          Fase 0 · Fundaciones
        </p>
        <h1 className="font-display text-display-xl font-extrabold tracking-display uppercase font-stretch-expanded">
          Pieza única.
        </h1>
        <p className="text-h3 text-text-2">Cuando se va, no vuelve.</p>
      </div>

      <p className="font-mono text-micro tracking-mono text-text-3 uppercase">
        Sitio en construcción
      </p>
    </main>
  )
}
