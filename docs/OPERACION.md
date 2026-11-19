# Manual del propietario

Cómo operar la tienda y el proyecto. Las secciones marcadas **(fase N)** se completan cuando esa fase
exista; no se documenta nada que todavía no funcione.

## 1. Trabajar en local

Requisitos: Node 26, pnpm 12 (`npm i -g pnpm@12.21.0`) y Docker (Docker Desktop, OrbStack o Colima) para
la base de datos local.

```bash
pnpm install
cp .env.example .env.local   # la fase 0 funciona sin rellenar nada
pnpm dev                     # http://localhost:3000

pnpm db:start                # Supabase local (la primera vez descarga ~2 GB de imágenes)
pnpm db:reset                # recrea la base: migraciones + seed
pnpm db:stop
```

Antes de abrir un PR: `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build &&
pnpm test:e2e`. Las capturas de las pruebas e2e quedan en `test-results/screenshots/` (390, 768, 1024 y
1440 px, tema oscuro y claro).

## 2. Cuentas y accesos que solo puede abrir el propietario

| Cuenta               | Para qué                                  | Cuándo se necesita | Notas                                                                                             |
| -------------------- | ----------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------- |
| GitHub               | Repositorio, CI y PR                      | Fase 0             | Decidir visibilidad y plan: ver D-014. `gh auth login` para trabajar desde la terminal.           |
| Vercel               | Hosting y _previews_                      | Fase 0             | Repo en la cuenta personal. Plan Hobby solo hasta antes de vender (D-015).                        |
| Supabase             | Base de datos, archivos y administradores | Fase 2             | Dos proyectos (`staging`, `production`). Free permite 2 en total entre todas tus organizaciones.  |
| Cloudflare Turnstile | Anti-spam de formularios                  | Fase 4             | Gratis. Hay claves de prueba para local y CI.                                                     |
| Wompi                | Pagos en línea                            | Fase 4 (sandbox)   | El sandbox es inmediato. **Producción lleva días**: empezar el registro en la fase 4 (RUT o NIT). |
| Resend               | Alertas internas y correos (opcional)     | Fase 7             | Requiere verificar un dominio (SPF/DKIM).                                                         |
| Dominio              | Dirección pública                         | Fase 8             | Quién lo registra y dónde se gestiona el DNS.                                                     |

## 3. Conectar Vercel (fase 0)

1. En vercel.com: _Add New → Project_ e importar el repositorio de GitHub (instalar la app de GitHub de
   Vercel si lo pide).
2. Dejar el _framework preset_ en Next.js. `vercel.json` ya fija la región y la instalación con pnpm 12.
3. _Team Settings → Data Preferences_: desactivar el entrenamiento de IA con tu contenido.
4. _Settings → Deployment Protection_: elegir **All Deployments** hasta el lanzamiento (D-015).
5. Abrir un PR y comprobar el comentario del bot de Vercel con la URL del _preview_.

La primera importación siempre despliega a Producción, aunque venga de una rama de PR.

## 4. Secciones por completar

- Subir una pieza de segunda — **(fase 6)**
- Gestionar un pedido (cambiar estado, registrar un pago manual, guía de envío) — **(fases 4 y 6)**
- Cotizar un encargo — **(fases 5 y 6)**
- Abrir una preventa y cobrar saldos — **(fases 5 y 6)**
- Restaurar una copia de seguridad — **(fase 8)**
- Respuesta a una alerta de pedido en revisión (`needs_review`) — **(fase 4)**
- Retención y borrado de datos personales — **(fase 7)**
