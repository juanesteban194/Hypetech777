# PROMPT MAESTRO — `[NOMBRE_TIENDA]`

> Instrucciones para Claude Code. Este documento es la fuente de verdad del proyecto y vive en `docs/PROMPT_MAESTRO.md`. Léelo completo antes de actuar. Si una instrucción posterior lo contradice, pregunta antes de seguir.

---

## 0. Rol y reglas de trabajo

Actúas como ingeniero full-stack principal y director de diseño de un e-commerce profesional. Orden de prioridades: **integridad de datos** (una pieza única jamás se vende dos veces) > seguridad > rendimiento y accesibilidad > estética > velocidad de entrega.

1. Trabajas por fases (§15). En cada fase: modo plan → plan corto (archivos, migraciones, dependencias, riesgos) → implementación → verificación → commits → resumen → **te detienes y esperas aprobación**.
2. Verificación obligatoria al cerrar cada fase: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, e2e de la fase con Playwright y capturas a 390, 768, 1024 y 1440 px en tema oscuro y claro. Revisa tú mismo las capturas contra §4 y corrige antes de reportar.
3. Antes de instalar o usar una dependencia, verifica su versión estable actual (`pnpm view <paquete> version`) y su documentación vigente. No asumas APIs de memoria: Next.js, Supabase, Tailwind y Wompi cambian con frecuencia.
4. Una rama por fase (`feat/fase-N-<tema>`), Conventional Commits en inglés, PR hacia `main` con descripción y checklist.
5. Código, identificadores, tablas y commits en inglés. Interfaz completa en español de Colombia (`es-CO`). Rutas públicas en español.
6. Nunca subas secretos: `.env.local` en `.gitignore`; `.env.example` documentado variable por variable.
7. No inventes datos del negocio: usa `src/config/site.ts` con valores marcados `TODO(owner)`.
8. Ambigüedad que bloquea → pregunta. Ambigüedad que no bloquea → elige la opción más simple, regístrala en `docs/DECISIONES.md` (fecha, decisión, alternativa descartada, motivo) y continúa.
9. En la Fase 0 crea `CLAUDE.md` (≤ 150 líneas): stack, comandos, estructura, convenciones, tokens y un resumen de este documento. Mantenlo actualizado.
10. Prohibido copiar logos, tipografías propietarias, imágenes o textos de Nike, Apple, Oakley o Ralph Lauren: son referencias de criterio, no material a replicar. Prohibido dibujar, recrear o descargar logotipos de marcas (ver §5.6).

---

## 1. Datos del negocio

Completar antes de la Fase 3. Mientras falten, usa placeholders en `src/config/site.ts`.

| Campo | Valor |
|---|---|
| Nombre de la tienda | `[NOMBRE_TIENDA]` |
| Eslogan | `[ESLOGAN]` |
| WhatsApp de ventas (formato E.164) | `[+57XXXXXXXXXX]` |
| Ciudad base | `[CIUDAD]` |
| Correo de contacto | `[CORREO]` |
| Redes | `[INSTAGRAM]` · `[TIKTOK]` |
| Dominio | `[DOMINIO]` |
| Pasarela | Wompi (adaptador alterno futuro: Mercado Pago) |
| Pagos manuales | `[Nequi · transferencia Bancolombia · Daviplata · efectivo]` |
| Envíos y tarifas | `[Domicilio área metropolitana: $X · Nacional: $Y · Recoger en punto: gratis]` |
| Anticipo de preventas y encargos | `[30–50 %]` |
| Vigencia de reservas | 30 min (pago en línea) · 24 h (WhatsApp) |
| Vigencia de cotizaciones de encargo | `[3]` días |
| Días visibles de un artículo vendido | `[7]` |
| Umbral de «precio bajo» en menús | `[$100.000]` |

---

## 2. Producto

Tienda en línea con cuatro secciones:

1. **Ropa de segunda**: piezas únicas (stock = 1) con estado, medidas, fotos de detalle y de defectos.
2. **Ropa nueva**: productos con variantes (talla, color) y stock por variante.
3. **Tecnología**: celulares, tablets y accesorios, en estado nuevo, reacondicionado o usado.
4. **Encargos**: (a) **a pedido**: el cliente solicita algo que no está en el catálogo; la tienda cotiza, cobra anticipo y lo consigue; (b) **preventa**: reservar con anticipo productos del catálogo que aún no han llegado. Ambos con seguimiento por código.

Compra como invitado, sin cuentas de cliente. Dos formas de cerrar la compra: **pago en línea (Wompi)** o **pedido por WhatsApp con pago manual**. Toda la operación se gestiona desde el panel `/admin`.

Referencias y función exacta de cada una:

| Referencia | Qué aporta |
|---|---|
| Oakley | Identidad visual dominante: futurismo técnico, fondos oscuros, producto presentado como objeto de ingeniería |
| Apple | Estructura y movimiento: espacio negativo, tipografía grande, foco absoluto en el producto, transiciones suaves, navegación translúcida |
| Ralph Lauren | Acento editorial: serif elegante y ritmo de revista en bloques de campaña. Nunca en UI funcional |
| Nike | Arquitectura de información y patrones de e-commerce (§5) |

Regla de conflicto: en usabilidad gana Nike; en estética, Oakley; en espacio y movimiento, Apple.

---

## 3. Stack

| Capa | Elección |
|---|---|
| Framework | Next.js (última estable), App Router, TypeScript `strict`, Server Components y Server Actions |
| Estilos | Tailwind CSS v4 con tokens en CSS (`@theme`) |
| Primitivas accesibles | Radix UI (NavigationMenu, Dialog, Accordion, Select, Slider, Tabs, Toast), con estilo propio desde cero |
| Movimiento | Motion (motion.dev) con `LazyMotion` para UI; CSS scroll-driven animations con fallback `IntersectionObserver`. Sin librerías de smooth scroll |
| Estado de filtros | Query params tipados (nuqs o equivalente) |
| Formularios | React Hook Form + Zod; el mismo esquema valida en cliente y servidor |
| Datos | Supabase: Postgres, Storage, Auth (solo administradores), RLS, `pg_cron`, `pg_trgm`, `unaccent` |
| Pagos | Wompi detrás de una interfaz `PaymentProvider` |
| Anti-spam | Cloudflare Turnstile en formularios públicos |
| Correo (opcional) | Resend |
| Pruebas | Vitest + Testing Library · Playwright (e2e, capturas, axe) · pruebas de RLS contra Supabase local |
| Hosting | Vercel con integración Git: preview por PR, producción desde `main` |
| Paquetes | pnpm |

Restricciones de plataforma que condicionan el diseño:

- El plan Hobby de Vercel no admite uso comercial: desarrollo y previews en Hobby; plan Pro antes de vender. No uses servicios exclusivos de Vercel (KV, Blob, Edge Config): todo el estado vive en Supabase y el proyecto debe poder migrar de hosting.
- Supabase Free: 500 MB de base de datos, 1 GB de archivos, 5 GB de egress, pausa por baja actividad semanal, sin backups descargables. Consecuencias: imágenes comprimidas y con caché agresiva (§10.2), backups propios (§12), dos proyectos: `staging` y `production`.
- La UI nunca consulta Supabase directamente: lecturas en `src/lib/data/*`, escrituras en Server Actions o RPC.

---

## 4. Dirección de arte

### 4.1 Concepto: «Artefactos»

Cada producto se presenta como un artefacto con ficha técnica y código único (`ART-000123`). En segunda mano la pieza es irrepetible y se rotula **«Pieza única · 1/1»**. Las especificaciones (talla, estado, medidas, batería, almacenamiento) se muestran en microtipografía monoespaciada, como etiquetas de ingeniería. El estado se representa con un medidor segmentado de 10 pasos.

Voz: segura, técnica, breve. Ejemplos: «Pieza única. Cuando se va, no vuelve.» · «Estado 9/10. Sin señales de uso.» · «¿No lo encuentras? Lo conseguimos.»

### 4.2 Color

Tema oscuro por defecto; claro con `data-theme="light"` (respeta `prefers-color-scheme` en la primera visita; conmutador en el footer y en el menú móvil).

```css
:root {                          /* Oscuro · «Obsidiana» (por defecto) */
  --bg: #07080A; --surface-1: #0E0F12; --surface-2: #15171B; --surface-3: #1D2025;
  --line: rgb(255 255 255 / .08); --line-strong: rgb(255 255 255 / .16);
  --text: #F3F4F6; --text-2: #A0A5AD; --text-3: #7A808A;
  --cta-bg: #F3F4F6; --cta-text: #07080A; --focus: #4FD1FF;
  --glass: rgb(7 8 10 / .64);

  /* Comunes a ambos temas */
  --vitrina: #ECECEE;
  --success: #3DDC97; --warning: #F2B84B; --danger: #FF5C5C;
  --prizma: linear-gradient(115deg, #8A7CFF 0%, #4FD1FF 38%, #8BFFB0 68%, #FFD27A 100%);
  --heritage-ivory: #F2ECE1; --heritage-navy: #0F1E33;
}
[data-theme="light"] {           /* Claro · «Porcelana» */
  --bg: #F7F7F8; --surface-1: #FFFFFF; --surface-2: #F0F0F2; --surface-3: #E6E7EA;
  --line: rgb(0 0 0 / .08); --line-strong: rgb(0 0 0 / .16);
  --text: #0B0C0E; --text-2: #4B515A; --text-3: #697079;
  --cta-bg: #0B0C0E; --cta-text: #FFFFFF; --focus: #0A84FF;
  --glass: rgb(247 247 248 / .72);
}
```

Reglas:
- UI monocromática. La CTA primaria es una píldora de máximo contraste (`--cta-bg`).
- `--prizma` (iridiscente, inspirado en lentes técnicos) es el único acento cromático: línea de progreso de encargos, borde del badge «Nuevo», destello de hover y selección de texto. Máximo un uso por viewport.
- `--heritage-*` solo en bloques editoriales (§5.5).
- El hero y los bloques de tecnología son oscuros en ambos temas (identidad Oakley); el resto sigue el tema activo.
- Toda foto de producto se muestra sobre `--vitrina` en ambos temas, por fidelidad de color. En tema oscuro las vitrinas claras funcionan como cajas iluminadas.
- Los colores de estado se usan como indicador (punto, ícono, borde), no como color de texto sobre fondos claros.
- Contraste: texto ≥ 4.5:1 y componentes de UI ≥ 3:1, verificado con axe en e2e.

### 4.3 Tipografía

Todas con licencia OFL, autohospedadas con `next/font`, subset latin.

| Rol | Familia | Uso |
|---|---|---|
| Display | Archivo variable, eje `wdth` 125 (expandida), peso 700–800, `letter-spacing: -0.02em` | Hero y titulares de sección; mayúsculas en titulares de ≤ 4 palabras |
| UI y texto | Geist Sans | Todo lo funcional; base 16 px, interlineado 1.5 |
| Técnica | Geist Mono | Códigos, specs y etiquetas: 11–12 px, mayúsculas, `letter-spacing: 0.08em` |
| Editorial | Instrument Serif (regular e itálica) | Solo titulares de bloques editoriales y citas |

Escala: display-xl `clamp(3rem, 8vw, 7.5rem)` · display-l `clamp(2.25rem, 5vw, 4.5rem)` · h1 `2.5rem/1.1` · h2 `1.75rem/1.2` · h3 `1.25rem/1.3` · body `1rem/1.5` · small `.875rem/1.45` · micro mono `.6875rem/1.4`.

Precarga solo Geist Sans y Archivo. Verifica que `next/font/google` exponga el eje `wdth` de Archivo; si no, usa el archivo variable con `next/font/local`.

### 4.4 Espacio, forma y materiales

- Unidad base de 4 px. Contenedor máximo de 1440 px; márgenes laterales de 16 px (móvil), 24 px (tablet) y 48 px (desktop). Secciones con padding vertical `clamp(4rem, 10vw, 10rem)`.
- Grilla de 12 columnas en desktop y 4 en móvil.
- Radios: 6 px en tarjetas e inputs; píldora (999 px) en botones, chips y búsqueda; 0 en imágenes a sangre.
- Esquinas biseladas (`clip-path`) solo en badges técnicos y marcos del hero.
- Sin sombras grandes: profundidad con bordes `--line`, superficies escalonadas y brillos internos sutiles.
- Vidrio (header, bolsa, menús): `backdrop-filter: blur(20px) saturate(160%)` sobre `--glass`, con fallback sólido.
- Texturas: ruido fotográfico (SVG, 3–4 % de opacidad) y retícula técnica de 1 px (4 %) solo en hero, encargos y fondos editoriales oscuros. Nunca sobre fotos de producto.
- Íconos: Lucide, trazo 1.5, 20/24 px.

### 4.5 Movimiento

Tokens: `--ease-out: cubic-bezier(.22, 1, .36, 1)` · `--ease-in-out: cubic-bezier(.65, 0, .35, 1)` · 120 ms (hover) · 240 ms (UI) · 480 ms (revelados) · 800 ms (hero).

- Animar solo `transform` y `opacity`. Objetivo: 60 fps en un Android de gama media (prueba con CPU throttling 4×).
- Revelado al hacer scroll: opacidad 0→1 y `translateY(16px)`→0, escalonado de 40 ms, una sola vez.
- Hero: al hacer scroll la imagen escala de 1 a 1.06 y el titular se desvanece. Scroll nativo, nunca secuestrado.
- Tarjeta de producto en desktop: crossfade a la segunda foto y un destello diagonal que cruza la vitrina en 600 ms, como un reflejo sobre un lente.
- Transiciones de página: View Transitions API si es estable en la versión instalada (imagen de la tarjeta → galería del PDP como elemento compartido); si no, crossfade con Motion.
- Bolsa, filtros y menús: hojas que deslizan con un spring corto, sin rebote visible.
- Navegación instantánea: prefetch de enlaces visibles, UI optimista en bolsa y favoritos, `loading.tsx` con skeletons por ruta. Nunca spinners en listados.
- `prefers-reduced-motion: reduce` elimina desplazamientos, destellos y parallax; quedan fundidos ≤ 120 ms.

### 4.6 Estándar de fotografía

Documentarlo en `docs/FOTOGRAFIA.md` y mostrarlo como ayuda en el formulario de carga del admin.

- Fondo gris claro liso, luz difusa, misma distancia y encuadre en todas las piezas.
- Ropa 4:5, tecnología 1:1; lado mayor ≥ 1600 px.
- Orden: frente → espalda → etiqueta de marca y talla → detalles → defectos (obligatoria si existen) → puesta (opcional).
- Se aceptan PNG/WebP con transparencia (recortes hechos fuera del sistema); se muestran sobre `--vitrina`.

### 4.7 Prohibido

Carruseles autoplay en el hero · popups al entrar · neón y gradientes por todas partes · glassmorphism en tarjetas · sombras difusas grandes · emoji en la interfaz · lorem ipsum · más de un acento cromático por vista · texto sobre foto sin contraste garantizado · animaciones que retrasen la interacción · páginas pesadas. **Estética de Oakley, peso de Apple.**

---

## 5. Arquitectura de información (patrón Nike)

### 5.1 Header

Desktop (≥ 1024 px):
- Izquierda: logotipo (placeholder tipográfico en Archivo expandida hasta tener logo).
- Centro: Novedades · Ropa de segunda · Ropa nueva · Tecnología · Encargos · Marcas.
- Derecha: búsqueda (píldora expandible), Favoritos y Bolsa con contador.
- Barra promocional superior opcional, editable en el admin, sin rotación automática.
- Sticky con vidrio, 64 px de alto; se oculta al bajar y reaparece al subir.
- Mega menú: abre con hover con intención (150 ms), foco o clic; panel a todo el ancho con columnas; cierra con Esc, al salir o al navegar; operable con teclado (Radix NavigationMenu).

Móvil (< 1024 px): logotipo, búsqueda, bolsa y menú. El menú es un panel a pantalla completa con navegación en profundidad (sección → grupo → categoría), botón «Atrás», objetivos táctiles ≥ 44 px y accesos fijos a Encargos y WhatsApp.

### 5.2 Mega menús

Se generan desde la tabla `categories` y ocultan las categorías sin productos visibles en esa sección.

- **Ropa de segunda**: Destacado (Recién llegado · Piezas premium · Menos de `[UMBRAL]` · Ver todo) | Calzado | Parte superior | Parte inferior | Accesorios | Marcas (8 logos + «Ver todas»).
- **Ropa nueva**: misma estructura.
- **Tecnología**: Celulares · Tablets · Accesorios | Por estado (Nuevo · Reacondicionado · Usado) | Marcas.
- **Encargos**: Cómo funciona · Solicitar un encargo · Preventas abiertas · Seguir mi encargo · Preguntas frecuentes.

### 5.3 Taxonomía inicial (semilla editable desde el admin)

Ropa (árbol compartido por segunda y nueva; la sección la define el producto):
- Calzado: Tenis · Botas · Zapatos formales · Sandalias
- Parte superior: Camisetas · Camisas · Polos · Buzos de lana (sweaters y cárdigans) · Buzos (hoodies y cuello redondo) · Chaquetas y abrigos · Chalecos
- Parte inferior: Jeans · Pantalones · Sudaderas · Shorts · Faldas y vestidos
- Accesorios: Gorras y sombreros · Bolsos y morrales · Cinturones · Gafas · Relojes

Tecnología: Celulares · Tablets · Accesorios (Audífonos · Cargadores y cables · Fundas y protectores · Smartwatches).

Género como filtro, no como navegación principal: Hombre · Mujer · Unisex · Niños.
Colores normalizados, tallas y rangos de precio definidos en `src/config/taxonomy.ts`.

### 5.4 Rutas

```
/                                   home
/novedades
/segunda        /segunda/[categoria]
/nueva          /nueva/[categoria]
/tecnologia     /tecnologia/[categoria]
/marcas         /marcas/[marca]           pestañas: Segunda · Nueva · Tecnología
/p/[slug]                                 PDP · slug = nombre + código: buzo-lana-ralph-lauren-azul-art-000123
/buscar?q=
/bolsa
/checkout
/pedido/[codigo]                          confirmación y seguimiento
/encargos   /encargos/nuevo   /encargos/preventas   /encargos/seguimiento
/favoritos
/ayuda      /ayuda/envios     /ayuda/cambios
/legal/terminos   /legal/privacidad   /legal/retracto
/admin/...
```

Filtros como query params legibles y compartibles: `?marca=nike,ralph-lauren&talla=m,l&genero=hombre&estado=como-nuevo&precio=0-150000&color=azul&orden=recientes`. Render en servidor; «Atrás» restaura filtros y posición de scroll; `canonical` sin filtros, salvo categoría y marca.

### 5.5 Home

1. Hero a sangre: video corto en loop (≤ 2.5 MB, póster AVIF) o imagen; titular display y dos CTA; retícula y ruido. Editable (`banners`).
2. Tres accesos grandes (Segunda · Nueva · Tecnología) y una franja de Encargos.
3. «Recién llegado»: carrusel horizontal con scroll-snap, sin autoplay.
4. «Compra por marca»: riel de logos monocromos.
5. Bloque editorial (acento Ralph Lauren): fondo `--heritage-ivory`, texto `--heritage-navy`, titular en Instrument Serif itálica y 2–3 fotos tipo lookbook. Editable.
6. Tecnología destacada: producto sobre fondo oscuro con tres especificaciones grandes.
7. Encargos en tres pasos y CTA.
8. Confianza: estado verificado, fotos reales de cada pieza, envíos y cambios.
9. Footer.

### 5.6 Marcas y logos

- Tabla `brands` con logo SVG (y PNG de respaldo) que sube el propietario desde el admin. No dibujes, recrees ni descargues logos.
- Al subir un SVG, sanitízalo (elimina scripts y manejadores de eventos). Render siempre con `<img>`, nunca SVG en línea.
- Monocromo por CSS: `filter: brightness(0)` en claro y `brightness(0) invert(1)` en oscuro. Altura uniforme: 20 px en filtros y 28 px en el riel.
- Sin logo: nombre de la marca en Geist Mono mayúsculas.
- Interruptor `brand_logos_enabled` en `settings`: apagado, toda la web usa nombres en texto.
- Footer: «Las marcas y logotipos pertenecen a sus titulares. `[NOMBRE_TIENDA]` no está afiliada a ellas.»

### 5.7 Listado de productos (PLP)

- Encabezado: migas, título y conteo («Buzos de lana (24)»); a la derecha, «Ocultar filtros» y «Ordenar por».
- Desktop: barra lateral de filtros sticky (260 px) con grupos colapsables; filtros activos como chips eliminables sobre la grilla y «Limpiar todo».
- Filtros de ropa: Categoría · Marca (con logo) · Talla (botones: XS–XXXL, numéricas 26–44, calzado US y EU) · Género · Estado (solo segunda) · Color (muestras) · Precio (rangos predefinidos y rango libre) · Ocultar vendidos.
- Filtros de tecnología: Tipo · Marca · Estado · Almacenamiento · Salud de batería (≥ 80 %, ≥ 90 %) · Color · Precio.
- Cada opción muestra su conteo; las que darían 0 resultados se deshabilitan.
- Orden: Recientes (por defecto) · Precio: menor a mayor · Precio: mayor a menor · Destacados.
- Grilla: 2 columnas en móvil, 3 en desktop, 4 con filtros ocultos desde 1440 px. Scroll infinito con botón «Cargar más» de respaldo, 24 por página, skeletons.
- Móvil: barra fija «Filtrar (n) · Ordenar» que abre una hoja a pantalla completa con el botón «Ver N resultados».
- Tarjeta: vitrina 4:5 (1:1 en tecnología); badges arriba a la izquierda (Pieza única · Nuevo · Preventa · Reservado · Vendido · Reacondicionado); favorito arriba a la derecha; debajo, marca (mono micro), título (1 línea), meta (talla · estado, o almacenamiento · batería) y precio (anterior tachado si existe).
- Vendidos: visibles `[7]` días con imagen desaturada y badge «Vendido»; después salen del listado, pero su PDP sigue activa.

### 5.8 Detalle de producto (PDP)

- Desktop: galería al 60 % (miniaturas verticales + imagen principal; clic → visor a pantalla completa con zoom) y columna de información al 40 %, sticky.
- Información: marca (logo o texto), título, código (mono), precio y badges. Además:
  - Segunda: talla, medidor de estado con explicación, tabla de medidas con un diagrama SVG genérico de la prenda (dibujo propio) y fotos de defectos destacadas.
  - Nueva: selector de talla en grilla (agotadas tachadas), muestras de color y guía de tallas.
  - Tecnología: variantes (almacenamiento, color) y ficha técnica (modelo, almacenamiento, RAM, batería %, pantalla, liberado, qué incluye, garantía, «IMEI verificado» si el admin lo marcó). El IMEI nunca se muestra.
  - Preventa: fecha estimada de llegada, porcentaje de anticipo y cupos disponibles.
- CTA: «Añadir a la bolsa» (píldora primaria), «Favorito» (píldora contorno) y «Preguntar por WhatsApp» (mensaje con el código prellenado).
- Acordeones: Descripción · Medidas y talla · Estado y autenticidad · Envíos, cambios y retracto.
- Debajo: «Te puede interesar» (misma categoría, marca o talla) y «Vistos recientemente».
- Móvil: galería a ancho completo con swipe y puntos; barra inferior fija con precio y CTA.
- Vendido: la página se mantiene con estado «Vendido» y similares; nunca 404.

### 5.9 Búsqueda

- Overlay a pantalla completa: input grande y sugerencias en vivo (debounce 200 ms) con miniaturas, categorías y marcas; búsquedas populares (definidas en el admin) y recientes (localStorage).
- Backend: full-text search de Postgres con configuración `spanish` + `unaccent` + `pg_trgm` para tolerar errores («ralp laurem» → Ralph Lauren). Resultados con el layout de PLP.

### 5.10 Favoritos y vistos recientemente

Sin cuentas: se guardan en localStorage (lecturas y escrituras en `try/catch`). `/favoritos` revalida contra la base y marca los vendidos.

### 5.11 Footer

Columnas Tienda · Encargos · Ayuda · Legal; redes; WhatsApp; conmutador de tema; aviso de marcas; medios de pago en texto.

---

## 6. Compra

### 6.1 Bolsa

Drawer lateral y página `/bolsa`. Piezas únicas con cantidad fija 1. Persistida en localStorage; precios y disponibilidad se revalidan en servidor al abrirla y al pagar. El cliente nunca define precios.

### 6.2 Checkout (una página, tres bloques)

1. Contacto: nombre, celular y correo opcional.
2. Entrega: método desde `settings` (domicilio en área metropolitana, envío nacional, recoger), ciudad, dirección y notas.
3. Pago: **«Pagar en línea»** (Wompi: tarjeta, PSE, Nequi, Botón Bancolombia) o **«Coordinar por WhatsApp»** (transferencia o Nequi).

Autorización de tratamiento de datos obligatoria y Turnstile.

### 6.3 Pago en línea (Wompi)

- Referencia única por intento: `PED-000123-1`. Montos en COP enteros en la base; conversión a centavos solo en la frontera con Wompi.
- Firma de integridad calculada en servidor. Llaves de sandbox en local y preview; de producción solo en producción.
- Webhook `/api/webhooks/wompi`: valida el checksum del evento según la documentación vigente (firma inválida → 400 sin procesar), persiste el evento crudo, procesa de forma idempotente por id de transacción y responde 200.
- La página de retorno consulta el estado al servidor, que a su vez consulta a Wompi. Nunca confíes en los query params de retorno.
- Aprobada → pedido `paid` e ítems `sold`. Rechazada, error o anulada → reintento posible mientras la reserva siga vigente.
- Mientras Wompi reporte la transacción como pendiente (p. ej., PSE), la reserva se extiende hasta un máximo configurable.
- Si un pago se aprueba después de vencida la reserva y la pieza ya no está disponible, el pedido pasa a `needs_review` y se alerta al admin para reembolso manual.

### 6.4 Pedido por WhatsApp

Crea el pedido en `pending_payment` con reserva de 24 h y muestra la confirmación con el botón «Enviar pedido por WhatsApp» (`https://wa.me/<numero>?text=` + mensaje codificado con código del pedido, ítems con código y precio, total y datos de entrega). El admin registra el pago manual.

### 6.5 Reservas y concurrencia (crítico)

- Función Postgres `create_order(...)`: RPC transaccional, `security definer` con `search_path` fijado. Bloquea las variantes con `SELECT … FOR UPDATE`, valida stock, crea pedido e ítems y reserva (pieza única → `reserved` con `reserved_until`; variante → descuenta stock).
- `pg_cron` cada 5 min libera las reservas vencidas de pedidos no pagados y repone stock.
- Prueba obligatoria: dos checkouts simultáneos sobre la misma pieza única; solo uno puede ganar.

### 6.6 Estados del pedido

`pending_payment → paid → preparing → shipped → delivered`, con ramas `expired`, `cancelled` y `needs_review`. Cada cambio queda en `order_events`.

### 6.7 Seguimiento

`/pedido/[codigo]` pide los últimos 4 dígitos del celular y muestra la línea de tiempo y la guía de envío.

---

## 7. Encargos

### 7.1 A pedido

- `/encargos`: «¿No lo encuentras? Lo conseguimos.», cuatro pasos (Pides → Cotizamos → Pagas el anticipo → Recibes) y preguntas frecuentes.
- `/encargos/nuevo`, formulario en tres pasos: (1) tipo: ropa, calzado, tecnología u otro; (2) detalle: descripción, link de referencia, hasta 4 fotos, talla o especificación, color, presupuesto máximo y fecha límite deseada; (3) contacto, autorización de datos y Turnstile. Resultado: código `ENC-000123`, enlace de seguimiento y botón de WhatsApp.
- Estados: `received → reviewing → quoted → accepted → deposit_paid → in_transit → ready → delivered`, con ramas `rejected`, `cancelled` y `quote_expired`.
- Con la cotización, el seguimiento muestra precio final, anticipo, tiempo estimado y condiciones, con los botones «Aceptar y pagar anticipo» (Wompi o WhatsApp) y «Rechazar». El saldo se cobra con el mismo flujo antes de la entrega.

### 7.2 Preventa

- Producto del catálogo en estado `preorder` con fecha estimada, porcentaje de anticipo y cupo máximo.
- Comprar en preventa crea un pedido `kind = preorder` que paga el anticipo. Cuando el producto llega, el admin lo marca como recibido, el cliente paga el saldo y sigue el envío normal.
- `/encargos/preventas` lista las preventas abiertas.

### 7.3 Seguimiento

`/encargos/seguimiento` (código + últimos 4 dígitos del celular): línea de tiempo vertical con la línea de progreso en `--prizma`, notas públicas del admin, pagos realizados y saldo pendiente.

---

## 8. Modelo de datos (Postgres)

Enums:
- `section`: `second_hand | new | tech`
- `product_status`: `draft | active | preorder | reserved | sold | archived`
- `item_condition`: `new_with_tags | like_new | excellent | very_good | good | new | refurbished | used` (restricción `CHECK` por sección)
- `gender`: `men | women | unisex | kids`
- `order_kind`: `purchase | preorder`
- `payment_kind`: `full | deposit | balance` · `payment_channel`: `wompi | manual` · `payment_status`: `pending | approved | declined | voided | error`
- Estados de pedido y de encargo según §6.6 y §7.1.

Tablas (columnas clave):

| Tabla | Columnas |
|---|---|
| `categories` | id, parent_id, kind (`apparel`/`tech`), name, slug, sort_order, is_active, seo_title, seo_description |
| `brands` | id, name, slug, logo_svg_path, logo_png_path, is_featured, sort_order, is_active |
| `products` | id, code (`ART-` + secuencia, único), section, category_id, brand_id, title, slug (único), description, gender, color, condition, condition_score (1–10), condition_notes, is_unique, price (COP entero), compare_at_price, status, is_featured, tags[], attributes jsonb (specs técnicas, material), measurements jsonb, preorder_eta, preorder_deposit_pct, preorder_cap, reserved_until, published_at, sold_at, search_vector (generada), timestamps |
| `product_private` | product_id, imei, acquisition_cost, source, notes. **Solo admin**: tabla separada para que la API pública nunca la exponga |
| `product_images` | id, product_id, path, alt, kind (`main`/`back`/`label`/`detail`/`flaw`/`worn`), sort_order, width, height, lqip |
| `product_variants` | id, product_id, sku, size, size_system, color_name, color_hex, storage, stock (≥ 0), price_override. Todo producto tiene ≥ 1 variante; en segunda, exactamente una con stock 1 |
| `orders` | id, code (`PED-`), kind, status, channel, customer_name, phone, email, delivery_method, city, address, notes, subtotal, shipping_cost, total, amount_paid, reserved_until, tracking_number, consent_at, timestamps |
| `order_items` | id, order_id, variant_id, product_snapshot jsonb (título, código, imagen, talla), quantity, unit_price |
| `order_events` | id, order_id, status, note, actor, created_at |
| `sourcing_requests` | id, code (`ENC-`), status, type, customer_name, phone, email, description, reference_url, size_spec, color, budget_max, desired_by, quote_total, quote_deposit, quote_eta, quote_valid_until, quote_terms, public_note, admin_notes, consent_at, timestamps |
| `sourcing_request_images` | id, request_id, path |
| `sourcing_request_events` | id, request_id, status, public_message, actor, created_at |
| `payments` | id, reference (única), target_type (`order`/`request`), target_id, kind, channel, amount, currency, status, provider_tx_id (único), raw_event jsonb, timestamps |
| `banners` | id, placement (`hero`/`editorial`/`promo_bar`/`tech_highlight`), title, subtitle, cta_label, cta_href, image_path, video_path, theme, is_active, starts_at, ends_at, sort_order |
| `settings` | key, value jsonb, is_public (vista `public_settings` solo con los públicos) |
| `admins` | user_id (→ `auth.users`), role (`owner`/`staff`) |
| `audit_log` | id, actor, action, entity, entity_id, diff jsonb, created_at |
| `rate_limits` | key, window_start, count |

Índices: `products(section, status, published_at desc)`, `(category_id)`, `(brand_id)`, GIN sobre `search_vector`, GIN trigram sobre `title` e índices parciales para los estados visibles.

RLS (activado en todas las tablas; cada política con prueba):
- `anon`: solo `SELECT` en categorías y marcas activas, productos visibles (`active`, `preorder`, `reserved` y `sold` dentro de la ventana), sus imágenes y variantes, banners vigentes y `public_settings`. Ningún `INSERT`, `UPDATE` ni `DELETE`.
- Pedidos, encargos y pagos se crean solo en servidor (Server Actions o RPC) tras validar Zod, Turnstile y rate limit. La clave secreta de Supabase existe únicamente en el servidor.
- Seguimiento mediante RPC (`get_order_public(code, phone_last4)`, `get_request_public(...)`) que devuelven solo campos públicos.
- Admin: acceso total vía la función `is_admin()`, que además exige sesión con MFA (`aal2`).
- Storage: bucket `products` de lectura pública y escritura solo admin; bucket `requests` privado (URLs firmadas para el admin); tipos permitidos jpeg, png, webp y avif; tamaño máximo definido.

Migraciones versionadas en `supabase/migrations`. Tipos generados con la CLI de Supabase en `src/types/database.ts`; CI falla si no coinciden con las migraciones.

---

## 9. Panel de administración (`/admin`)

- Acceso: Supabase Auth (correo y contraseña) con MFA TOTP obligatorio; registro público deshabilitado; el primer admin se crea con `pnpm admin:create`. Verificación en el middleware/proxy de Next.js (según la versión instalada) y en cada acción de servidor.
- Mobile-first: el propietario sube artículos desde el celular. Meta: publicar una pieza de segunda en menos de 60 s.
- Alta de artículo: cámara o galería → compresión en el navegador → reordenar arrastrando → marcar fotos de defecto → sección → categoría → marca (buscador) → talla → estado (con descripciones) → medidas (campos según la categoría) → precio → descripción (plantilla por categoría) → borrador o publicar. Botón «Duplicar» para piezas similares.
- Listados con búsqueda, filtros, pestañas por estado y acciones rápidas: Publicar · Reservar · Marcar vendido · Archivar · Editar precio. Acciones masivas.
- Pedidos: lista, detalle, cambio de estado, registro de pago manual, guía de envío y plantillas de WhatsApp por estado.
- Encargos: tablero kanban por estado (arrastrar entre columnas) y detalle con línea de tiempo, formulario de cotización, notas públicas y privadas, y pagos.
- Preventas: cupos, fecha estimada, compradores y cobro de saldos.
- Catálogo: árbol de categorías reordenable, marcas con carga de logo, banners del home, barra promocional y búsquedas populares.
- Ajustes: WhatsApp, envíos y tarifas, vigencias, días visibles de vendidos e interruptores.
- Dashboard: activos, reservados, vendidos e ingresos de 30 días, encargos abiertos por estado y preventas activas.
- Toda escritura del admin queda en `audit_log`.

---

## 10. Requisitos no funcionales

### 10.1 Rendimiento

Medido en móvil con 4G simulado (Lighthouse CI) en home, PLP y PDP:
- Lighthouse ≥ 90 en las cuatro categorías; LCP < 2.5 s; INP < 200 ms; CLS < 0.1.
- JS inicial de cliente ≤ 170 KB gzip por ruta: Server Components por defecto y `"use client"` solo donde hay interacción.
- Hero ≤ 2.5 MB; máximo dos fuentes precargadas.
- Revalidación bajo demanda (por etiquetas o rutas, con la API vigente de Next.js) al publicar o editar desde el admin.

### 10.2 Imágenes

- Compresión en el navegador al subir (WebP, lado mayor 2000 px).
- Variantes guardadas de 480, 960 y 1600 px más LQIP; nombres inmutables (hash) con `Cache-Control: public, max-age=31536000, immutable`.
- `next/image` con `sizes` correctos y `priority` solo en la imagen LCP. Revisa los límites vigentes de optimización de imágenes del plan de Vercel; si se acercan, sirve las variantes pregeneradas con un loader propio.
- Capa `src/lib/storage` abstracta para poder mover las imágenes a Cloudflare R2 si el egress de Supabase no alcanza.

### 10.3 Accesibilidad (WCAG 2.2 AA)

Teclado en mega menú, filtros, hojas y galería; foco visible con `--focus`; diálogos con roles y aria; alt obligatorio al subir fotos; objetivos táctiles ≥ 44 px; `lang="es-CO"`; axe sin violaciones en e2e.

### 10.4 SEO

Metadata por página; `canonical`; Open Graph dinámico (foto, código y precio); JSON-LD `Product` con `itemCondition` (NewCondition, UsedCondition, RefurbishedCondition) y `availability`, `BreadcrumbList` y `Organization`; `sitemap.xml` dinámico; `robots.txt`; `noindex` en `/admin`, `/bolsa`, `/checkout` y `/pedido`.

### 10.5 Seguridad

RLS con pruebas; Zod en toda entrada; rate limiting en checkout, encargos, seguimiento y búsqueda; Turnstile; cabeceras CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy y `frame-ancestors`; validación de tipo y tamaño de archivos; MFA de admin; sin datos personales en logs; Dependabot y `pnpm audit` en CI; secret scanning y push protection activos en GitHub.

### 10.6 Legal (Colombia)

Casilla de autorización de tratamiento de datos (Ley 1581 de 2012) en checkout y encargos, con enlace a la política. Páginas de términos, privacidad, cambios y derecho de retracto (Ley 1480 de 2011, Estatuto del Consumidor). Textos placeholder marcados `REVISAR(owner)`; no redactes asesoría legal definitiva.

### 10.7 Analítica

Vercel Analytics y Speed Insights. Eventos mediante una función `track()`: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, `whatsapp_click`, `request_created`, `preorder_created`.

---

## 11. Estructura del repositorio

```
.
├─ src/
│  ├─ app/
│  │  ├─ (store)/           rutas públicas
│  │  ├─ admin/             panel
│  │  └─ api/webhooks/      wompi
│  ├─ components/{ui,store,admin}
│  ├─ lib/{data,actions,payments,storage,search,validation,format,analytics}
│  ├─ config/{site.ts,taxonomy.ts}
│  ├─ styles/tokens.css
│  └─ types/database.ts
├─ supabase/{migrations/,seed.sql,config.toml}
├─ scripts/                 admin:create, generación de placeholders
├─ tests/{unit,e2e,rls}
├─ docs/{PROMPT_MAESTRO.md,ARQUITECTURA.md,DECISIONES.md,OPERACION.md,FOTOGRAFIA.md}
├─ .github/{workflows/,pull_request_template.md,dependabot.yml}
└─ CLAUDE.md · README.md · .env.example
```

---

## 12. GitHub, CI/CD y operación

1. Repositorio privado. `main` protegida: PR obligatorio, CI en verde, sin push directo.
2. `ci.yml` en cada PR: instalación con caché → lint → typecheck → unit → build → `supabase start` + migraciones + seed → e2e con axe → pruebas de RLS → verificación de tipos generados. Lighthouse CI contra el preview de Vercel con los presupuestos de §10.1.
3. CD con la integración Git de Vercel: preview por PR contra Supabase `staging`; producción al fusionar en `main`.
4. `db-migrate.yml`: al fusionar en `main`, migraciones a `staging`; a `production` con aprobación manual (GitHub Environment `production`).
5. `db-backup.yml`: diario, `pg_dump` de producción → cifrado GPG simétrico (clave en secrets) → artefacto con retención de 14 días. Prueba una restauración y documéntala.
6. Secretos en Vercel y GitHub Secrets. Nombres de variables de Supabase según su nomenclatura vigente (clave publicable y clave secreta).
7. `docs/OPERACION.md`: manual del propietario (subir una pieza, gestionar un pedido, cotizar un encargo, abrir una preventa, restaurar un backup).

---

## 13. Datos de prueba

Seed con unos 60 productos realistas en español y precios plausibles en COP: 30 de segunda (todas las categorías de ropa, estados variados, 3 vendidos y 2 reservados), 15 nuevos con variantes y 15 de tecnología (celulares con batería %, tablets y accesorios), más 2 preventas, 6 encargos en estados distintos y 4 pedidos. Marcas sin logo (fallback de texto). Imágenes: placeholders generados localmente (vitrina gris con el código del artículo); nunca imágenes descargadas de internet.

---

## 14. Definition of Done

- Lint, typecheck, tests y build en verde.
- Responsive verificado en 390, 768, 1024 y 1440 px, en ambos temas.
- Estados cubiertos: cargando (skeleton), vacío, error, vendido o agotado.
- Operable con teclado y lector de pantalla; axe sin violaciones.
- Sin `any`, sin `console.log` y sin TODO sin responsable.
- Documentación actualizada si cambia la operación.

---

## 15. Fases

| # | Alcance | Criterio de aceptación |
|---|---|---|
| 0 | Fundaciones: scaffold, tooling, `CLAUDE.md`, tokens, fuentes, layout vacío, Supabase local, CI base, preview en Vercel | Pipeline verde y URL de preview |
| 1 | Sistema de diseño: componentes base de §4, header con mega menú, menú móvil, footer, tema claro/oscuro, ruta `/estilos` (solo desarrollo y admin) | Capturas en 4 anchos y 2 temas; teclado completo; axe limpio |
| 2 | Datos: migraciones, enums, RLS, RPC, `pg_cron`, seed, tipos, `lib/data` | Pruebas de RLS y de concurrencia en verde |
| 3 | Catálogo: home, secciones, PLP, PDP, marcas, búsqueda, favoritos | e2e: filtrar por marca y talla, y la URL compartida reproduce los filtros; presupuestos de §10.1 |
| 4 | Compra: bolsa, checkout, Wompi en sandbox, WhatsApp, reservas, seguimiento | e2e de ambos flujos; webhook idempotente; doble venta imposible |
| 5 | Encargos: a pedido, preventas, cotización, anticipos, saldos, seguimiento | e2e del ciclo completo de un encargo y de una preventa |
| 6 | Admin completo (§9) | Publicar una pieza en un viewport de 390 px en menos de 60 s |
| 7 | Pulido: SEO, legal, analítica, correo opcional, auditoría de movimiento, accesibilidad y rendimiento | Lighthouse ≥ 90 en home, PLP y PDP |
| 8 | Producción: Supabase `production` (evaluar plan Pro: sin pausa y con backups), Vercel Pro, dominio, Wompi en producción, backups, checklist de lanzamiento | Compra real de bajo valor verificada de punta a punta |

---

## 16. Primera acción

Lee este documento completo. No escribas código todavía. Responde con:

1. Dudas bloqueantes (máximo 5).
2. Riesgos técnicos detectados y su mitigación.
3. Plan detallado de la Fase 0: comandos, archivos y dependencias con versión verificada.

Después espera mi aprobación.
