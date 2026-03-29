# Roadmap

## Estado: Fase 1 — MVP de catálogo

Catalogo MVP operativo con busqueda facetada, CRUD unificado, flujo editorial completo y uploads resumables. Refactorizacion de arquitectura completada (PR #52).

---

## Fase 0 — Fundación del sistema ✅

**Objetivo**: establecer las bases técnicas, documentales y de arquitectura antes de escribir código de negocio.

| Hito | Estado |
|------|--------|
| AGENTS.md y sistema de skills definido | Completado |
| Visión y mapa de capacidades | Completado |
| ADR stack base (TypeScript + Bun) | Completado — ADR-0001 |
| ADR capa API | Completado — ADR-0003 (Hono) |
| ADR capa frontend | Completado — ADR-0004 (Astro) |
| ADR base de datos principal | Completado — ADR-0005 (PostgreSQL) |
| ADR ORM y capa de acceso a datos | Completado — ADR-0006 (Drizzle ORM) |
| ADR infraestructura Docker y operaciones | Completado — ADR-0015 (Evo1) |
| Modelo de dominio v0 | Completado — borrador en `docs/producto/modelo-de-dominio.md` |

---

## Fase 1 — MVP de catálogo

**Objetivo**: tener un catálogo funcional con recursos, metadatos básicos, búsqueda y API.

| Épica | Estado |
|-------|--------|
| Modelo de metadatos mínimo | Completado — ADR-0009 aceptada, validación mínima y CRUD real de recursos entregados |
| Arquitectura base del sistema | Completado — monorepo, Hono, Astro, Drizzle, PGlite dev |
| Autenticación y autorización | Completado — Better Auth (password + OIDC), RBAC, CLI usuarios, login/dashboard |
| Flujo editorial de recursos | Completado — stepper visual, transiciones por rol (author→review, curator→publish), campo createdBy, colores semafóricos |
| Busqueda y facetas iniciales | Completado — sidebar facetada (tipo, idioma, licencia), paginacion numerada, grid/list toggle, filtros dinamicos desde taxonomias |
| API REST publica v1 | Completado — listado y detalle de recursos publicados, paginacion, filtros, endpoint publico de taxonomias; colecciones en placeholder |
| Importacion piloto desde CSV | No iniciada |
| Frontend publico minimo | Completado — catalogo con sidebar, ficha de recurso con layout 2 columnas, pills, archivos adjuntos, vista responsive |
| Subidas resumables | Completado — ADR-0011 (Tus), ADR-0012 (IndexedDB preview), panel de uploads multiarchivo |
| CRUD builder generico | Completado — `buildCrudRoutes` elimina boilerplate, entidades unificadas |
| Entidades como taxonomias | Completado — tipos de recurso, idiomas y licencias gestionables desde admin |
| Migracion a React islands | Completado — todas las páginas interactivas migradas (ADR-0013) |
| Design system y rediseño UI | En progreso — 25+ componentes, tokens, social UI lista, endpoints pendientes |
| eXeLearning editor | Completado — integración servidor + estáticos |

---

## Fase 2 — Migración y calidad

**Objetivo**: migrar contenidos de Procomún legacy y mejorar la calidad del catálogo.

| Épica | Estado |
|-------|--------|
| Migración desde Procomún (análisis) | En progreso — contexto legacy documentado en `docs/casos/contexto-procomun-legacy/` (estado del arte, requisitos funcionales, info contractual); pendiente obtener PPT y diseñar ETL |
| Pipeline de ingestión OAI-PMH | No iniciada |
| Flujo de curación y moderación | No iniciada |
| Mejora de relevancia en búsqueda | No iniciada |
| Panel editorial interno | Completado (MVP) — backoffice con sidebar, CSS unificado, CRUD para recursos/colecciones/categorias/usuarios, dialogos nativos, status badges, uploader resumable |

---

## Fase 3 — Descubrimiento avanzado y apertura

**Objetivo**: mejorar el descubrimiento y abrir la plataforma a otros sistemas.

| Épica | Estado |
|-------|--------|
| Colecciones e itinerarios | No iniciada |
| Recomendación de recursos | No iniciada |
| OAI-PMH servidor | No iniciada |
| Exportación bulk del catálogo | No iniciada |
| Analítica de uso y calidad | No iniciada |

---

## Fase 4 — Integraciones y sostenibilidad

**Objetivo**: conectar con el ecosistema educativo y asegurar la operación a largo plazo.

| Épica | Estado |
|-------|--------|
| Integración LTI (Moodle) | No iniciada |
| SSO educativo | Completado |
| Observabilidad y alertas | No iniciada |
| Documentación para operadores (Evo1) | Completado — guías en `docs/operaciones/` |

---

## Actualización de estado — 2026-03-25

### Confirmado en repositorio

- ADR-0001 a ADR-0008 presentes y aceptadas, incluyendo auth y autorización.
- Monorepo operativo con `apps/api`, `apps/frontend`, `apps/cli` y `packages/db`.
- API Hono con separación de rutas públicas (`/api/v1`) y admin (`/api/admin`).
- Better Auth integrado con login por email/password, soporte OIDC configurable y sesiones por cookie.
- RBAC implementado con roles `reader`, `author`, `curator`, `admin`.
- Frontend Astro con páginas `index`, `login` y `dashboard`.
- CLI para seed y gestión básica de usuarios.
- Cobertura unitaria existente en API/auth/rutas admin.

### Lectura ejecutiva

El proyecto ya superó la fase de mera fundación técnica. La base de plataforma está razonablemente asentada y la primera capacidad transversal relevante completada es autenticación/autorización. Lo que aún no existe es el núcleo del producto: modelo de metadatos mínimo cerrado, recursos persistidos de extremo a extremo, búsqueda/facetas, flujo editorial real e importación.

### Riesgos y ajustes inmediatos

- La regla de validación estricta todavía no se cumple a nivel raíz: `bun test` falla porque Bun intenta ejecutar `e2e/example.spec.ts` como si fuera un test unitario de Playwright.
- La API pública y admin siguen devolviendo respuestas placeholder; hay contratos iniciales pero no lógica de negocio de catálogo.
- `STATUS.md` estaba desalineado respecto al roadmap y a las ADRs; se corrige en paralelo para evitar decisiones sobre un estado obsoleto.

### Siguiente tramo recomendado

1. Cerrar la épica de modelo de metadatos mínimo.
2. Convertir recursos y colecciones de placeholders a persistencia real con Drizzle.
3. Separar correctamente tests unitarios y e2e para dejar `bun test` en verde.

## Actualización de trazabilidad — 2026-03-25 (Épica 001 preparada)

- Se formaliza la primera épica real del MVP en `docs/epics/epic-001-mvp-recursos-metadatos-minimos/`.
- Alcance inicial: metadatos mínimos + CRUD real de recursos + validación mínima + base para búsqueda posterior.
- Estado de la épica: **En planificación activa**, con tareas ejecutables por dominios (documentación, backend, BD, frontend, testing).
- Dependencia explícita para próxima iteración: ADR de perfil mínimo de metadatos y ejecución del CRUD persistente.

## Actualización de estado — 2026-03-26

### Confirmado en repositorio

- El catálogo público ya ofrece listado de recursos publicados, ficha de detalle y búsqueda por texto libre.
- La búsqueda pública ya soporta paginación navegable con historial del navegador.
- La búsqueda pública ya soporta filtros básicos por `resourceType`, `language` y `license`.
- El contrato público `/api/v1/resources` acepta `q`, `limit`, `offset`, `resourceType`, `language` y `license`.
- La suite estándar permanece en verde con cobertura por encima del umbral.

### Lectura ejecutiva

El MVP base de catálogo ya no está en fase de mera preparación. La plataforma dispone de CRUD real de recursos, lectura pública de recursos publicados y una primera experiencia de descubrimiento usable para el catálogo. El principal hueco funcional pasa a ser el flujo editorial de recursos y la evolución de búsqueda hacia facetas más ricas.

### Siguiente tramo recomendado

1. Profundizar búsqueda pública con filtros de nivel/materia o facetas contadas.
2. Sustituir placeholders de colecciones públicas por persistencia real.
3. Importación piloto desde CSV.

## Actualización de estado — 2026-03-26 (Flujo editorial)

### Confirmado en repositorio

- Flujo editorial implementado end-to-end: draft → review → published → archived.
- Reglas de transición por rol: author puede enviar a revisión, curator puede aprobar/rechazar/archivar.
- Stepper visual en la página de edición con colores semafóricos (rojo/naranja/verde).
- Campo `createdBy` en recursos, con resolución del nombre del creador vía LEFT JOIN.
- Nombre del creador visible en listado público, dashboard, ficha de recurso y vista de edición.
- Botón "Editar" visible en ficha pública para usuarios autenticados con rol author+.
- Backoffice con sidebar responsive, navegación por rol y CRUD mínimos para recursos, usuarios, categorías y colecciones.
- 159 tests pasando, 91.13% cobertura de líneas.

### Lectura ejecutiva

El flujo editorial de recursos queda completo como experiencia de producto y ya existe una primera base de backoffice para la gestión interna. Los autores pueden crear recursos y enviarlos a revisión; los curadores pueden aprobar, rechazar o archivar. El siguiente foco de Fase 1 es profundizar búsqueda pública y elevar el backoffice desde CRUD mínimo a experiencia editorial más completa.

## Actualización de estado — 2026-03-28 (Bootstrap React islands)

### Confirmado en repositorio

- ADR-0013 deja de ser solo una decisión documental y entra en ejecución real.
- `apps/frontend` integra React como framework de islands en Astro.
- `admin/categorias` se convierte en el primer piloto migrado desde script imperativo a island React.
- Se introduce una base reutilizable para CRUDs hidratados en `src/islands/shared/` y `src/islands/crud/`.
- La estrategia de validación se mantiene consistente con el repositorio: `bun test` + build Astro, sin runner alternativo.

## Actualización de estado — 2026-03-29 (Rediseño completo + React islands migración completa)

### Confirmado en repositorio

- PR #61: rediseño completo de la interfaz pública y backoffice.
- PR #53: integración de eXeLearning editor (servidor + estáticos).
- Migración completa de React islands: todas las páginas interactivas migradas de vanilla JS a React 19.
- Design system con 25+ componentes React en `src/ui/` (Button, Dialog, Badge, Chip, Tabs, Pagination, ResourceCard, StarRating, CommentList, etc.).
- Tokens de diseño: 40+ tokens de color, tipografía (Plus Jakarta Sans + Inter), escalas de spacing, radios, sombras, modo oscuro.
- Feature islands completos en `src/islands/`: admin (6 sections), auth (login + registro), catalog (búsqueda + detalle), crud (taxonomías, colecciones, recursos, usuarios), dashboard, home (hero + featured), layout (nav pública + admin + preview banner), resources (editor + formulario), social (comentarios, rating, favoritos).
- Componentes compartidos: CrudTable genérico, ConfirmDialog, ModalFrame con trap de foco, AccessibleFeedback.
- Catálogo público completo con React: filtros dinámicos, paginación, grid/list toggle, favoritos optimistas, compartir.
- Formulario de recursos en React con validación inline, errores ARIA, estados de carga.
- Epic 003 en progreso: schema social (ratings, favorites, comments, comment_votes) creado en BD, componentes de UI listos (CommentSectionIsland, RatingIsland, FavoriteIsland), endpoints parcialmente implementados.
- Nuevas páginas: landing (`/`), búsqueda (`/buscar`), registro (`/registro`), perfil (`/perfil`).
- React 19.2.4 + @astrojs/react 5.0.2 + @testing-library/react 16.3.2.

### Lectura ejecutiva

La Fase 1 del MVP está prácticamente completa. La migración a React islands abarca todo el frontend interactivo y se ha creado un design system sólido. El principal gap funcional es completar los endpoints de la API social (ratings, comments, favorites) para conectar los componentes de UI ya construidos. La importación piloto CSV sigue sin iniciar.

### Estado de Fase 1 actualizado

| Épica | Estado |
|-------|--------|
| Modelo de metadatos mínimo | **Completado** |
| Arquitectura base del sistema | **Completado** |
| Autenticación y autorización | **Completado** |
| Flujo editorial de recursos | **Completado** |
| Búsqueda y facetas iniciales | **Completado** |
| API REST pública v1 | **Completado** |
| Frontend público mínimo | **Completado** — rediseñado con design system completo |
| Subidas resumables | **Completado** |
| CRUD builder genérico | **Completado** |
| Entidades como taxonomías | **Completado** |
| Migración a React islands | **Completado** — todas las páginas interactivas migradas |
| Design system (Epic 003) | **En progreso** — componentes listos, endpoints social pendientes |
| Importación piloto desde CSV | **No iniciada** |
| eXeLearning editor | **Completado** — integración servidor + estáticos |

### Siguiente tramo recomendado

1. Implementar endpoints API social: ratings, comments, favorites (conectar componentes de UI existentes).
2. Importación piloto desde CSV.
3. Medir rendimiento: Core Web Vitals, bundle sizes, load testing básico.

## Actualización 2026-03-29 — Ayuda y manual de usuario

- Se añade una ruta pública `/ayuda` con manual de uso estructurado para descubrimiento, publicación, colecciones, FAQ, roles y soporte.
- La navegación pública y el footer ya enlazan a ayuda; el backoffice editorial añade acceso contextual para perfiles `author+`.
- El cambio mejora onboarding, reduce fricción en búsqueda/publicación y deja una base reutilizable de contenido en `apps/frontend/src/lib/help-content.ts`.

## Actualización 2026-03-29 — Colecciones públicas y gestión editorial

- Las colecciones dejan de ser un placeholder en API pública y pasan a exponer listado y detalle con datos reales, conteo de recursos y curador responsable.
- La navegación pública sustituye los enlaces provisionales por una entrada única `Colecciones` y la home enlaza a la nueva experiencia pública.
- El backoffice de colecciones amplía el CRUD con portada, descripción, asociación de recursos existentes y reordenación manual.
- El RBAC de colecciones se endurece: la gestión pasa a `curator` y `admin`; `author` queda fuera del backoffice de colecciones.
- La validación completa del repositorio queda verde con `bun run test` (`337 pass`, `0 fail`, cobertura 91.77%).
- Queda una limitación arquitectónica documentada: el detalle público se sirve en `/colecciones?slug=...` mientras el frontend siga en salida estática Astro.
