# Arquitectura

Resumen técnico del sistema. La especificación completa es [PROMPT_MAESTRO.md](PROMPT_MAESTRO.md); las
decisiones y sus motivos están en [DECISIONES.md](DECISIONES.md).

## 1. Capas

```
Navegador ── RSC / Client Components (src/app, src/components)
                 │  lee            │ escribe
                 ▼                 ▼
          src/lib/data/*     Server Actions / RPC (src/lib/actions/*)
                 │                 │  validan con Zod (src/lib/validation), Turnstile y límites
                 ▼                 ▼
              Supabase (Postgres + RLS + Storage + Auth solo administradores)
                                   │
                     Wompi (src/lib/payments, interfaz PaymentProvider)
```

- **La UI nunca consulta Supabase directamente.** ESLint lo impide (`no-restricted-imports` en
  `src/components` y `src/app`).
- Todo el estado vive en Supabase; nada de servicios exclusivos de Vercel (KV, Blob, Edge Config), para
  poder cambiar de hosting.
- Las imágenes pasan por `src/lib/storage`, una capa abstracta, por si hay que mover el almacenamiento a
  Cloudflare R2.

## 2. Renderizado y caché

Cache Components y Partial Prefetching están activados (D-002).

- Cáscara estática + contenido dinámico en _streaming_. Cada ruta con datos define su `loading.tsx` con
  _skeletons_ (nunca _spinners_ en listados).
- El layout raíz no lee `cookies()` ni `headers()`. El tema se resuelve con un script inline (D-007).
- Catálogo público: funciones `use cache` con `cacheTag` por entidad y un cliente Supabase sin cookies.
  Admin: cliente con cookies, fuera de caché.
- Invalidación al publicar o editar: `revalidateTag(tag, 'max')` o `updateTag(tag)`.
- La disponibilidad es **dependiente del reloj** (fin de reserva, ventana de 7 días de vendidos, banners
  con vigencia). Ningún evento la dispara, así que se lee por petición o con `revalidate` ≤ 60 s.

## 3. Sistema de diseño

Tokens en `src/styles/tokens.css`: variables de tema (`:root` oscuro, `[data-theme='light']` claro) y el
tema de Tailwind (`@theme`). Reglas del concepto «Artefactos» en PROMPT_MAESTRO §4; correcciones de
contraste en D-009. Las fuentes (`src/app/fonts.ts`): Archivo (eje `wdth`), Geist, Geist Mono e Instrument
Serif; solo Geist y Archivo se precargan.

## 4. Datos y pagos: reglas que no se negocian

Resultado de la auditoría del 2026-11-19. Cada punto es una decisión de diseño para la fase indicada.

### Fase 2 (datos)

| Riesgo                                                                                                                                        | Mitigación                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dos fuentes de verdad de disponibilidad** (`variant.stock` y `products.status`): dos checkouts pueden vender la misma pieza única.          | `variant.stock` es la única verdad: `UPDATE … SET stock = stock - q WHERE id = $1 AND stock >= q` y comprobar filas afectadas. `products.status` pasa a ser un valor derivado. |
| **Funciones RPC invocables por `anon`**: Postgres da `EXECUTE` a `PUBLIC` por defecto y PostgREST las expone, saltándose Turnstile y límites. | `alter default privileges … revoke execute on functions from public`; por función: `revoke … from public, anon, authenticated; grant … to service_role`. Probar como `anon`.   |
| La expiración de reservas depende de `pg_cron` (un proyecto Free pausado o un job caído deja piezas «Reservado» para siempre).                | Expiración perezosa: `create_order` y las lecturas tratan `reserved_until < clock_timestamp()` como libre. `pg_cron` solo limpia. Usar `clock_timestamp()`, no `now()`.        |
| Orden de bloqueo en `create_order` (interbloqueos) y líneas duplicadas.                                                                       | Agregar líneas por variante y bloquear con `ORDER BY id FOR UPDATE`, o un `pg_advisory_xact_lock` único.                                                                       |
| `unaccent()` es `STABLE`: falla en columnas generadas e índices.                                                                              | Envoltorio `IMMUTABLE` con diccionario calificado: `f_unaccent(text)` con `search_path = ''`.                                                                                  |
| Reglas entre tablas (p. ej. «una variante con stock 1») no caben en un `CHECK`.                                                               | Copiar `is_unique` a la variante con clave foránea compuesta, `CHECK (NOT is_unique OR stock <= 1)` e índice único parcial.                                                    |
| `payments` con destino polimórfico sin clave foránea; importes sin tipo.                                                                      | Dos claves foráneas reales con `CHECK (num_nonnulls(order_id, request_id) = 1)`. Dinero en `bigint` COP; instantes en `timestamptz`.                                           |
| Auditoría que depende del código de la app; `auth.uid()` es nulo con la clave secreta.                                                        | Disparadores `AFTER` que escriben `order_events`/`audit_log` con `app.actor`; el admin escribe con su propio JWT (RLS decide) y no con la clave secreta.                       |

### Fase 4 (compra)

| Riesgo                                                                                                          | Mitigación                                                                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| «Idempotente por id de transacción» pierde o reordena cambios de estado (Wompi reintenta a 30 min, 3 h y 24 h). | Guardar **cada evento** (`checksum` único), no confiar en el orden, consultar `GET /v1/transactions/{id}` (**requiere la clave privada**) y aplicar el estado con precedencia monótona.                |
| El «reintento de pago» propio de Wompi crea varias transacciones con la **misma** `reference`.                  | `provider_tx_id` único; la `reference` identifica el intento, no la transacción.                                                                                                                       |
| La página de retorno y el webhook no ligan transacción, pedido e importe.                                       | Una sola función `apply_payment`: casa por `reference`, exige `amount_in_cents = importe × 100` y moneda COP. El `?id=` de la URL es solo una pista.                                                   |
| Pagos concurrentes del mismo pedido; `amount_paid` sin escritor único.                                          | Índice único parcial de un intento abierto por pedido; `amount_paid` solo lo escribe `apply_payment` como suma de aprobados menos reembolsos.                                                          |
| Aprobado tras vencer la reserva; carreras entre cron, webhook y «cancelar»; stock devuelto dos veces.           | Un único `release_order` y un único `apply_payment`, con `UPDATE … WHERE status = 'pending_payment' RETURNING` condicionado.                                                                           |
| Reservas de 24 h por WhatsApp permiten a un script congelar el catálogo único.                                  | Reserva provisional corta (2 h) que sube a 24 h al confirmar el admin; límites por teléfono/IP y por pedido dentro de `create_order`; tope de piezas únicas retenidas.                                 |
| Seguimiento con código secuencial + 4 dígitos es enumerable.                                                    | `public_token` aleatorio (≥ 64 bits) en el enlace; los 4 dígitos solo como respaldo, con contador de fallos y bloqueo en base de datos; respuestas idénticas para «no existe» y «teléfono incorrecto». |
| Los webhooks de sandbox no llegan a los _previews_ de cada PR (una sola URL de eventos por entorno).            | URL fija en una rama `staging`; los _previews_ prueban el sondeo de la página de retorno; el webhook se prueba con eventos firmados localmente; tarea de reconciliación cada pocos minutos.            |
| Sin modelo de reembolsos, anulaciones ni devoluciones; faltan estados de preventa.                              | `payments.kind = refund`, estados `refund_pending`/`refunded`/`returned` y tablas de transiciones con disparador que rechaza saltos.                                                                   |

Datos de Wompi relevantes (verificados): firma de integridad = SHA-256 de
`reference + amount-in-cents + currency [+ expiration-time] + integrity_secret`; el _checksum_ del evento es
el SHA-256 de los valores de `signature.properties` (leer la lista del propio evento) + `timestamp` +
secreto de eventos, y llega también en la cabecera `X-Event-Checksum`. No hay SDK oficial para Node.
Persona natural: tope de COP 2.500.000 por transacción y el primer desembolso puede tardar hasta 30 días.

## 5. Seguridad

- RLS en todas las tablas, con pruebas por política. `anon` solo lee.
- Pedidos, encargos y pagos se crean solo en servidor, tras Zod + Turnstile + límite de peticiones.
- Admin: Supabase Auth con MFA TOTP (`aal2`), verificación en `proxy.ts` (solo optimista) **y** en cada
  acción de servidor y función de acceso a datos. Registrar dos factores para no quedar fuera.
- Los archivos de las fotos de clientes suben directo al almacenamiento con URLs firmadas (Vercel limita
  los cuerpos de función a 4.5 MB y las Server Actions a 1 MB por defecto): excepción documentada a la
  regla «la UI no consulta Supabase».
- Next.js tuvo unos 60 avisos de seguridad en 2026: fijar un mínimo de 16.4.5, vigilar los parches
  semanales y autorizar dentro de cada acción, no solo en el proxy.
- CSP: ver D-008.

## 6. Presupuestos y mediciones

- Lighthouse ≥ 90 y JS inicial ≤ 170 KB gzip por ruta pública (§10.1). `next build` ya no imprime tamaños;
  la medición se hará con `next analyze` / `.next/diagnostics/route-bundle-stats.json` y Lighthouse CI
  contra `next start`. El presupuesto del admin va aparte.
- Archivo con el eje `wdth` pesa unos 90 KB frente a 35 KB sin él: candidata a una instancia fija con
  `next/font/local` en la fase 7.
- El vídeo del hero necesita control de pausa (WCAG 2.2.2) y el póster es el elemento LCP.
