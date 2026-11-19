# Registro de decisiones

Formato (PROMPT_MAESTRO §0.8): fecha, decisión, alternativa descartada, motivo. Los IDs se citan desde
el código (`docs/DECISIONES.md, D-008`), así que **no se renumeran**: una decisión nueva usa el
siguiente ID y una revocada se marca como reemplazada.

Las comprobaciones de plataforma se hicieron el 2026-11-19 contra documentación oficial y el registro
de npm; cuando una afirmación no se pudo verificar se dice.

---

## D-001 · pnpm 12.21.0

- **Fecha:** 2026-11-19
- **Decisión:** `packageManager: pnpm@12.21.0`. En la máquina se instaló con `npm i -g pnpm@12.21.0`
  (Node 26 ya no incluye Corepack). `pnpm/action-setup@v6` lee `packageManager` en CI.
- **Descartado:** npm o yarn. §3 exige pnpm.
- **Motivo/notas:** pnpm 12 bloquea los scripts de instalación de las dependencias salvo que estén en
  `allowBuilds` (`pnpm-workspace.yaml`) y aplica por defecto una edad mínima de publicación (ver D-016).

## D-002 · Next.js 16.4.6 con Cache Components

- **Fecha:** 2026-11-19
- **Decisión:** `cacheComponents: true`, `partialPrefetching: true` y `typedRoutes: true`, que son los
  valores de la plantilla oficial de 16.4.
- **Descartado:** el modelo anterior (ISR con `revalidate` + `unstable_cache`).
- **Motivo:** Next 17 hará obligatorias las dos primeras opciones; da una cáscara estática con
  _streaming_ y `use cache` + `cacheTag` encaja con "revalidación bajo demanda" (§10.1).
- **Consecuencias para las fases siguientes:**
  - El layout raíz **no** puede leer `cookies()` ni `headers()` (volvería dinámica toda la tienda).
  - Las lecturas públicas del catálogo (`src/lib/data/*`) usan un cliente Supabase **sin cookies**
    dentro de funciones `use cache` con `cacheTag`; las lecturas del admin usan el cliente con cookies
    fuera de caché.
  - Invalidación: `revalidateTag(tag, 'max')` (el segundo argumento es obligatorio) o
    `updateTag(tag)` en Server Actions. Disponibilidad (reservado/vendido) nunca en caché larga.
  - `middleware.ts` ya no existe: se usa `proxy.ts` (solo runtime Node.js).
  - La prop `priority` de `next/image` está obsoleta; usar `preload` (§10.2 todavía dice `priority`).

## D-003 · Node 26.x en todas partes

- **Fecha:** 2026-11-19
- **Decisión:** `.node-version` = 26, `engines.node` = `26.x`, `@types/node` ^26 y la misma versión en CI.
- **Descartado:** Node 24 (mantenimiento).
- **Motivo:** Node 26 es LTS activo desde 2026-10-28, es el valor por defecto de Vercel y la máquina de
  desarrollo ya lo usa. Varias herramientas exigen ≥ 22 (`@lhci/cli` ≥ 22.19, `lint-staged` ≥ 22.22).
- **Riesgo conocido:** ninguna página de Next.js lista Node 26 como probado (solo `engines >=20.9`). En
  Node 26 `fetch` negocia HTTP/2 y `statusText` llega vacío: usar siempre `response.status`.

## D-004 · TypeScript ~5.9.3

- **Fecha:** 2026-11-19
- **Decisión:** TypeScript 5.9.x.
- **Descartado:** 7.0.2 (`latest`) y, de momento, 6.0.3.
- **Motivo:** la plantilla oficial de Next usa `^5`; `typescript-eslint@8.73` declara `typescript <6.1.0`,
  así que 7.x no se puede enlazar con el lint (7.x ya no trae API de compilador en JS). Next 16.3+ sí
  comprueba tipos con 6 y 7. **6.0.3** (última línea basada en JS) es el candidato para subir; el
  `tsconfig.json` se mantiene limpio para TS 7 (sin `baseUrl`, sin `moduleResolution: node`).

## D-005 · ESLint 9.39

- **Fecha:** 2026-11-19
- **Decisión:** ESLint `^9.39.5` con `eslint-config-next@16.4.6`.
- **Descartado:** ESLint 10.15 (`latest`).
- **Motivo:** `eslint-plugin-react@7.37.5`, `eslint-plugin-import@2.32.0` y `eslint-plugin-jsx-a11y@6.10.2`
  (dependencias de `eslint-config-next`) solo declaran soporte hasta ESLint 9. La documentación de Next
  dice que admite 9 y 10, pero avisa de que esos plugins no listan ESLint 10 en sus `peerDependencies`.
- **Ojo:** el preset de Next activa como **error** las reglas de React Compiler de
  `eslint-plugin-react-hooks` 7 (p. ej. `set-state-in-effect`) y `@next/next/no-img-element` como aviso; el
  logo de marca debe renderizarse con `<img>` (§5.6), así que ese fichero llevará un override puntual.

## D-006 · Tailwind 4.3.5 con `@tailwindcss/turbopack`

- **Fecha:** 2026-11-19
- **Decisión:** integración por el cargador de Turbopack que genera la plantilla oficial (sin
  `postcss.config`). Tokens en `src/styles/tokens.css`: `@theme static` para constantes,
  `@theme inline` para variables que cambian con `data-theme`.
- **Descartado:** `@tailwindcss/postcss`.
- **Notas:** `prettier-plugin-tailwindcss` necesita `tailwindStylesheet` (ver `.prettierrc.json`).

## D-007 · Política de tema claro/oscuro

- **Fecha:** 2026-11-19
- **Decisión:** resuelve la contradicción de §4.2 ("oscuro por defecto" frente a "respeta
  `prefers-color-scheme` en la primera visita"): elección guardada → `prefers-color-scheme` → oscuro.
  Un script síncrono en `<head>` (`src/lib/theme.ts`) fija `data-theme` antes del primer pintado, con
  `try/catch` alrededor de `localStorage` y `matchMedia`. Quien no ejecuta JS ve el tema oscuro.
- **Descartado:** leer una cookie en el servidor, porque haría dinámico el layout raíz (D-002).

## D-008 · Cabeceras de seguridad y CSP (CSP completa en la fase 7)

- **Fecha:** 2026-11-19
- **Decisión:** ahora solo cabeceras base (`nosniff`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, HSTS sin `preload`). La CSP completa se diseña en la fase 7, primero en modo
  _Report-Only_.
- **Hecho verificado** (guía oficial de Next 16.4.6): con nonces **todas** las páginas deben ser
  dinámicas, ISR queda desactivado y Partial Prerendering / Cache Components es incompatible.
- **Opciones para la fase 7:**
  1. CSP estática en `next.config` (`headers()`) con `'unsafe-inline'` en scripts y lista estricta de
     orígenes (Supabase, Turnstile, Wompi) para el catálogo cacheado. **Recomendada.**
  2. Nonce desde `proxy.ts` solo en grupos que ya son dinámicos (`/admin`, `/checkout`, `/pedido`,
     `/encargos/*`).
  3. `experimental.sri`: sigue experimental y no cubre los scripts inline de _flight_ (issue #95354).
- El script de tema es constante, así que una CSP estricta puede permitirlo **por hash**.

## D-009 · Tokens de color: desviaciones respecto a §4.2

- **Fecha:** 2026-11-19
- **Decisión:** los valores del documento no cumplen su propia regla de contraste (texto ≥ 4.5:1, UI
  ≥ 3:1). Se midió con la fórmula WCAG y se corrigió con el cambio mínimo:

  | Token             | Documento | Ahora     | Resultado (peor caso)           |
  | ----------------- | --------- | --------- | ------------------------------- |
  | `--text-3` oscuro | `#7A808A` | `#838995` | 4.11 → 4.65 sobre `--surface-3` |
  | `--text-3` claro  | `#697079` | `#5F666F` | 4.05 → 4.70 sobre `--surface-3` |
  | `--focus` claro   | `#0A84FF` | `#0A7BF0` | 2.95 → 3.33 sobre `--surface-3` |
  | `--success` claro | `#3DDC97` | `#15764C` | 1.43 → 4.56                     |
  | `--warning` claro | `#F2B84B` | `#8D5F0A` | 1.45 → 4.50                     |
  | `--danger` claro  | `#FF5C5C` | `#D30000` | 2.45 → 4.51                     |

  Añadidos: `--focus-vitrina` (`#0B6FE0`: `--focus` oscuro solo da 1.50:1 sobre `--vitrina`) y
  `--control-border` (`#666C76` oscuro, `#767C85` claro: `--line-strong` da 1.45–1.67:1 y no puede ser el
  único borde de un control).

- `::selection` usa una parada plana de `--prizma` (`rgb(79 209 255 / .32)`) porque `::selection` no
  admite degradados.
- **Descartado:** conservar los valores y limitar dónde se usan. Incumple la regla de §4.2.
- axe no mide contraste no textual; revisar a mano bordes de controles e indicadores de estado.

## D-010 · Estructura y datos del negocio

- **Fecha:** 2026-11-19
- **Decisión:** se crea el árbol completo de §11 con `.gitkeep` en las carpetas aún vacías.
  `src/config/site.ts` lleva placeholders `TODO(owner)`. `taxonomy.ts` solo contiene lo que fija el
  documento (árbol de §5.3, géneros y tallas de letra y numéricas); tallas de calzado, colores y rangos
  de precio quedan como `TODO(owner)` hasta tener catálogo real.

## D-011 · Supabase local

- **Fecha:** 2026-11-19
- **Decisión:** CLI `supabase@3.2.0` como `devDependency` (la v3 ya no usa `postinstall`: los binarios van
  como `optionalDependencies`, así que pnpm no la bloquea). En `config.toml`: `project_id = hypetech777`,
  registro público desactivado, contraseña mínima de 12, MFA TOTP activado, `auto_expose_new_tables =
false` (grants explícitos, como en los proyectos nuevos alojados) y `realtime`, `analytics` y
  `edge_runtime` desactivados (no se usan; la pila es más ligera). Postgres 17.
- **Aplicar lo mismo** en los proyectos `staging` y `production` al crearlos.
- **Nota:** la v3 opera contra la pila **local** por defecto; toda mutación en un proyecto alojado
  requiere `--yes` explícito.

## D-012 · Sin `AGENTS.md` generado

- **Fecha:** 2026-11-19
- **Decisión:** `agentRules: false` en `next.config.ts`. `next dev` escribiría y actualizaría un
  `AGENTS.md` al detectar un agente de código.
- **Motivo:** `CLAUDE.md` (exigido por §0.9) es el único documento para agentes. La documentación de
  Next versionada con el paquete está en `node_modules/next/dist/docs/`.

## D-013 · Autoría de los commits

- **Fecha:** 2026-11-19
- **Decisión:** por instrucción del propietario ("sin que aparezcas de colaborador"), los commits y los PR
  no llevan `Co-Authored-By` ni firmas de herramientas. La identidad es local al repositorio: usuario de
  GitHub + su correo `noreply` de GitHub (`<id>+<usuario>@users.noreply.github.com`).
- **Motivo:** no publicar el correo personal en un repo público, y Vercel Hobby solo despliega commits
  cuyo autor es el propietario del equipo (el correo `noreply` se asocia a su cuenta).

## D-014 · Visibilidad del repositorio y plan de GitHub (PENDIENTE de decisión)

- **Fecha:** 2026-11-19
- **Situación:** §12.1 pide repositorio **privado**; el repositorio existente es **público**.
- **Hechos verificados** (docs.github.com, 2026-11-19):
  - Repo **público** con GitHub Free: protección de ramas y _rulesets_, Environments con revisores
    obligatorios, _secret scanning_, _push protection_ y minutos de Actions, todo gratis.
  - Repo **privado** personal con Free: ninguno de los controles anteriores se aplica.
  - Repo **privado** personal con GitHub Pro (~US$4 al mes): sí protección de ramas y Environments (secretos y
    ramas de despliegue), pero **no** revisores obligatorios en Environments ni _secret scanning_ ni _push
    protection_ (solo existen de pago en organizaciones: Team/Enterprise más US$19 por _committer_ al mes).
- **Consecuencia para §12 y §10.5:** con repo privado, la aprobación manual de `db-migrate` a producción y
  el _secret scanning_ no se pueden cumplir tal como están escritos. Sustitutos: un workflow solo
  `workflow_dispatch` con confirmación escrita, y `gitleaks` (ya incluido en el CI).
- **Opciones:** (A) mantener público: todas las protecciones gratis, pero el código y
  `docs/PROMPT_MAESTRO.md` son legibles por cualquiera. (B) privado + GitHub Pro: cumple "privado" de §12.1 y
  mantiene confidencial el plan, con los sustitutos anteriores. (C) privado en Free: sin protección técnica.

## D-015 · Vercel

- **Fecha:** 2026-11-19
- **Decisión:** `vercel.json` con región `iad1` (emparejada con Supabase `us-east-1`; no hay región en
  Colombia), `installCommand` que instala pnpm 12 de forma explícita y `git.deploymentEnabled` desactivado
  para `dependabot/**`.
- **Motivo:** Vercel infiere pnpm 9/10 del `lockfileVersion: 9.0` salvo que se active Corepack; con pnpm 12
  la instalación podría fallar o cambiar. Hobby solo despliega commits del propietario del equipo.
- **Plan:** Hobby durante el desarrollo; **Pro antes de la primera venta** (los términos de Hobby son solo
  para uso personal no comercial). Mientras tanto, Deployment Protection en _All Deployments_.
- **Acción del propietario:** al crear el equipo, desactivar el entrenamiento de IA en _Team Settings → Data
  Preferences_ (Hobby y la prueba de Pro lo traen activado).

## D-016 · Política de edad mínima de publicación

- **Fecha:** 2026-11-19
- **Decisión:** se respeta `minimumReleaseAge` de pnpm 12. `@testing-library/jest-dom@8.0.0` (publicado el
  día de la instalación) y `@testing-library/user-event@14.6.13` (el día anterior) no hacen falta en la
  fase 0, así que se **difieren a la fase 1**. No se añadió ninguna excepción en `minimumReleaseAgeExclude`.

## D-017 · Regiones

- **Fecha:** 2026-11-19
- **Decisión:** Vercel `iad1` + Supabase `us-east-1`, en la misma región para no pagar latencia en cada
  consulta. `gru1` / `sa-east-1` solo si se mueven los dos juntos. **Pendiente de confirmar** por el
  propietario antes de crear los proyectos.

## D-018 · Sitio no indexable hasta el lanzamiento

- **Fecha:** 2026-11-19
- **Decisión:** `robots: { index: false, follow: false }` en el layout raíz. El alias de producción
  `*.vercel.app` **sí** es indexable (solo los _previews_ llevan `X-Robots-Tag: noindex`). Quitar en la
  fase 8.

## D-019 · Hooks y convenciones de commit

- **Fecha:** 2026-11-19
- **Decisión:** husky 9 + `lint-staged` (ESLint y Prettier sobre lo preparado) + `commitlint` con
  `config-conventional` (Conventional Commits en inglés). El CI usa `HUSKY=0`.

## D-020 · Qué significa "pipeline verde" en la fase 0

- **Fecha:** 2026-11-19
- **Decisión:** instalación con caché, lint, formato, tipos, pruebas unitarias, build, e2e con axe y
  capturas, y `supabase start` + `db reset`. Lighthouse CI y las pruebas de RLS entran en las fases 3 y 2.
- **Motivo:** el `ci.yml` completo de §12.2 no puede estar en verde con un repo sin migraciones, tipos
  generados ni presupuestos. Lighthouse se medirá contra `next start`, no contra _previews_: Vercel añade
  `X-Robots-Tag: noindex` y eso hace fallar la categoría SEO por construcción.

## D-021 · `pnpm audit` como puerta de vulnerabilidades

- **Fecha:** 2026-11-19
- **Decisión:** el CI ejecuta `pnpm audit --prod --audit-level=high`.
- **Motivo:** con pnpm 12 y `packageManager` fijado, `pnpm-lock.yaml` se escribe como **dos documentos
  YAML**; el gráfico de dependencias de GitHub no lo lee, así que Dependabot no genera alertas de
  seguridad (las actualizaciones de versión sí funcionan). El audit cubre ese hueco.
- **Descartado:** quitar el pin de pnpm: Vercel y el CI perderían la versión exacta (ver D-015).

## D-022 · CI endurecido

- **Fecha:** 2026-11-19
- **Decisión:** acciones fijadas por SHA de commit (con el número de versión en un comentario);
  `runs-on: ubuntu-24.04` (`ubuntu-latest` está migrando a 26.04); permisos mínimos
  (`contents: read`); `gitleaks` en cada PR; un único job agregador `ci-ok` como comprobación requerida,
  para que añadir jobs en fases futuras no obligue a tocar las reglas del repositorio.
- **Pendiente:** Dependabot actualiza los SHA de las acciones (ecosistema `github-actions`).
