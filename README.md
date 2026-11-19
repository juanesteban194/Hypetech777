# Hypetech777

Tienda en línea (es-CO) con cuatro secciones: **ropa de segunda** (piezas únicas), **ropa nueva**,
**tecnología** y **encargos** (a pedido y preventa). Compra como invitado con pago en línea (Wompi) o
pedido por WhatsApp. Se gestiona desde el panel `/admin`.

> Estado: **fase 0 (fundaciones)**. El sitio es un esqueleto; las fases siguientes están en
> [`docs/PROMPT_MAESTRO.md`](docs/PROMPT_MAESTRO.md) §15.

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · Supabase (Postgres, Storage,
Auth) · Wompi · Vercel · pnpm.

## Empezar

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Requiere Node 26 y pnpm 12. Para la base de datos local hace falta Docker (`pnpm db:start`). Todo el
detalle, incluidas las cuentas que hay que abrir, está en [`docs/OPERACION.md`](docs/OPERACION.md).

## Comandos

| Comando                            | Qué hace                                        |
| ---------------------------------- | ----------------------------------------------- |
| `pnpm dev` / `build` / `start`     | Desarrollo, build de producción y servidor      |
| `pnpm lint`                        | ESLint y comprobación de `TODO` sin responsable |
| `pnpm format` / `format:check`     | Prettier                                        |
| `pnpm typecheck`                   | `next typegen` + `tsc --noEmit`                 |
| `pnpm test`                        | Pruebas unitarias (Vitest)                      |
| `pnpm test:e2e`                    | Playwright: e2e, axe y capturas                 |
| `pnpm db:start` / `stop` / `reset` | Supabase local                                  |

## Documentación

| Archivo                                            | Contenido                                               |
| -------------------------------------------------- | ------------------------------------------------------- |
| [`docs/PROMPT_MAESTRO.md`](docs/PROMPT_MAESTRO.md) | Especificación completa (fuente de verdad)              |
| [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md)     | Capas, caché, seguridad y riesgos conocidos por fase    |
| [`docs/DECISIONES.md`](docs/DECISIONES.md)         | Decisiones técnicas con alternativa descartada y motivo |
| [`docs/OPERACION.md`](docs/OPERACION.md)           | Manual del propietario                                  |
| [`docs/FOTOGRAFIA.md`](docs/FOTOGRAFIA.md)         | Estándar de fotografía de producto                      |
| [`CLAUDE.md`](CLAUDE.md)                           | Guía para asistentes de código                          |

Las marcas y logotipos pertenecen a sus titulares. Este proyecto no está afiliado a ellas.
