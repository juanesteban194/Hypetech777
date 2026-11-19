# CLAUDE.md

Tienda en línea (es-CO): ropa de segunda (piezas únicas), ropa nueva, tecnología y encargos. Compra como
invitado con pago en línea (Wompi) o pedido por WhatsApp. Panel `/admin` para toda la operación.

**Fuente de verdad:** [`docs/PROMPT_MAESTRO.md`](docs/PROMPT_MAESTRO.md). Si una instrucción lo contradice,
pregunta antes de seguir. Decisiones y su motivo: [`docs/DECISIONES.md`](docs/DECISIONES.md). Riesgos
conocidos por fase: [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).

## Reglas de trabajo

- Prioridad: **integridad de datos** (una pieza única jamás se vende dos veces) > seguridad > rendimiento y
  accesibilidad > estética > velocidad.
- Se trabaja por fases (§15): plan corto → implementación → verificación → commits → resumen → **parar y
  esperar aprobación**. Una rama por fase: `feat/fase-N-<tema>`; PR hacia `main`.
- Cierre de fase: `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build &&
pnpm test:e2e`, y revisar a mano las capturas (390, 768, 1024 y 1440 px, oscuro y claro) contra §4.
- Antes de usar una dependencia o API: verificar versión (`pnpm view <paquete> version`) y documentación
  vigente. Next incluye la suya en `node_modules/next/dist/docs/`: leerla antes de tocar APIs de Next.
- Código, identificadores, tablas y commits en **inglés**; interfaz y documentación en **español** (es-CO).
- Commits: Conventional Commits, líneas de cuerpo ≤ 100 caracteres. **Sin `Co-Authored-By` ni firmas de
  herramientas**: el propietario pidió no aparecer ningún asistente como colaborador. No saltarse los hooks.
- Nunca subir secretos. Todo valor de entorno se documenta en `.env.example`.
- No inventar datos del negocio: valores pendientes en `src/config/site.ts` con `TODO(owner)`.
- Duda que bloquea → preguntar. Duda que no bloquea → opción más simple y registrarla en `DECISIONES.md`.
- Prohibido copiar logos, tipografías, imágenes o textos de Nike, Apple, Oakley o Ralph Lauren, y dibujar o
  descargar logotipos de marcas. Sin imágenes descargadas de internet (placeholders generados en local).

## Stack (versiones verificadas el 2026-11-19)

Next.js 16.4.6 (App Router, **Cache Components** y Partial Prefetching activos) · React 19.3 · TypeScript
~5.9 · Tailwind 4.3 (`@tailwindcss/turbopack`) · Zod 4 · Supabase (CLI 3.2, Postgres 17) · Vitest 5 ·
Playwright 1.65 + axe · ESLint 9 · pnpm 12.21 · Node 26. Pendientes de instalar (se añaden en su fase):
Radix UI, Motion, nuqs, React Hook Form, `@supabase/*`, Turnstile.

## Comandos

```bash
pnpm dev | build | start          # desarrollo, build de producción, servidor
pnpm lint                         # ESLint + scripts/check-todos.mjs (TODO sin responsable)
pnpm format | format:check        # Prettier (con plugin de Tailwind)
pnpm typecheck                    # next typegen && tsc --noEmit
pnpm test | test:watch            # Vitest (tests/unit)
pnpm test:e2e                     # Playwright: construye, sirve y prueba; capturas en test-results/screenshots
pnpm db:start | db:stop | db:reset | db:types   # Supabase local (requiere Docker)
```

## Estructura

```
src/app/(store)/        rutas públicas        src/app/admin/        panel (fase 6)
src/app/api/webhooks/   Wompi (fase 4)        src/components/{ui,store,admin}
src/lib/{data,actions,payments,storage,search,validation,format,analytics}
src/config/             site.ts (negocio), taxonomy.ts (categorías, géneros, tallas)
src/styles/tokens.css   tokens de diseño      supabase/{migrations,seed.sql,config.toml}
tests/{unit,e2e,rls}    docs/                 .github/{workflows,dependabot.yml}
```

## Convenciones

- Server Components por defecto; `"use client"` solo donde hay interacción.
- **La UI nunca consulta Supabase directamente**: lecturas en `src/lib/data/*`; escrituras en Server Actions
  o RPC. ESLint lo impone (`no-restricted-imports`).
- Montos en **COP enteros** (`bigint` en la base). Conversión a centavos solo en la frontera con Wompi.
  `formatCOP()` lanza si recibe un decimal.
- Entrada siempre validada con Zod (el mismo esquema en cliente y servidor). Sin `any`, sin `console.log`
  (solo `warn`/`error`), sin `TODO` sin responsable (`TODO(owner)`).
- Alias `@/` → `src/`. Rutas públicas en español. Imports de tipo con `import { type X }`.

## Next 16: lo que cambió (no asumir de memoria)

- `middleware.ts` → **`proxy.ts`** (solo Node.js). No es una barrera de seguridad: autorizar dentro de cada
  Server Action y función de datos.
- `params`, `searchParams`, `cookies()` y `headers()` son asíncronos. `LayoutProps<'/'>` y `PageProps<…>`
  son tipos globales generados por `next typegen`.
- Error boundaries reciben **`retry`** (no `reset`) y `error: unknown`.
- Con Cache Components: el layout raíz **no** puede leer `cookies()`/`headers()`; datos dinámicos van dentro
  de `<Suspense>`; el caché usa `'use cache'` + `cacheTag`; `revalidateTag(tag, 'max')` exige 2.º argumento;
  `updateTag(tag)` solo en Server Actions. Sin `export const dynamic/revalidate/runtime`.
- `next/image`: `priority` está obsoleto, usar `preload`. `<ViewTransition>` es estable (sin flag).
- CSP con nonce vuelve dinámicas todas las páginas: no usarla en el catálogo (D-008).

## Diseño (§4, resumen)

Concepto «Artefactos»: producto como objeto técnico con ficha y código (`ART-000123`), «Pieza única · 1/1».
Tema oscuro por defecto; claro con `data-theme="light"` (D-007). Tokens en `src/styles/tokens.css` (los
valores corregidos por contraste están en D-009). Utilidades: `bg-bg`, `bg-surface-1..3`, `text-text`,
`text-text-2`, `text-text-3`, `border-line`, `bg-cta text-cta-text`, `rounded-card`, `rounded-pill`,
`font-display` (Archivo expandida: `font-stretch-expanded`), `font-mono`, `font-serif` (solo editorial),
tamaños `text-display-xl|display-l|h1|h2|h3|body|small|micro`. Foto de producto siempre sobre `--vitrina`.
`--prizma` es el único acento cromático (máx. uno por viewport). Prohibido: carruseles autoplay en el hero,
popups al entrar, neón, glassmorphism en tarjetas, sombras grandes, emoji, lorem ipsum, páginas pesadas.

## Reglas de datos y seguridad que no se negocian

- `variant.stock` es la única verdad de disponibilidad; reservar con `UPDATE … WHERE stock >= q`.
- Toda función RPC solo de servidor: `revoke … from public, anon, authenticated` y `grant … to service_role`.
- La expiración de reservas no depende de `pg_cron`: expiración perezosa con `clock_timestamp()`.
- Webhook de Wompi: guardar cada evento, validar el checksum, consultar la transacción con la clave privada
  y aplicar el estado con una única función `apply_payment`. Nunca confiar en el `?id=` del retorno.
- Seguimiento por `public_token` aleatorio; los 4 últimos dígitos solo como respaldo con bloqueo.
- Admin: MFA TOTP (`aal2`), escribe con su propio JWT (RLS decide), nunca con la clave secreta.

## Estado

Fase 0 (fundaciones): estructura, tooling, tokens, fuentes, layout vacío, Supabase local y CI base.
Siguiente: fase 1 (sistema de diseño). Pendiente del propietario: ver `docs/OPERACION.md` y D-014.
