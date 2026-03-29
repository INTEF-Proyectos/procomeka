# Tablero de Estado Global (Agents Memory)

**⚠️ IMPORTANTE PARA TODOS LOS AGENTES:**
Debéis leer este archivo antes de comenzar cualquier tarea para entender el contexto global y el progreso del proyecto. Al finalizar una tarea, debéis actualizar vuestro progreso aquí.

## Fase Actual: Fase 1 — MVP de catálogo

- **Épica activa:** Catalogo MVP operativo; flujo editorial completo; busqueda facetada implementada; backoffice con CRUD unificado; entidades (tipos, idiomas, licencias) gestionables desde admin; uploads con IndexedDB en preview mode
- **Agente en turno:** @.agents/skills/frontend-ux-accesibilidad/SKILL.md + @.agents/skills/documentacion-y-roadmap/SKILL.md

## ADRs Bloqueantes (Prioridad Alta)

Antes de escribir código de negocio, se deben resolver las siguientes decisiones arquitectónicas:

- [x] **ADR-0003**: Framework HTTP para API (`docs/negocio/decisiones/0003-framework-http-api.md`)
- [x] **ADR-0004**: Framework Frontend (`docs/negocio/decisiones/0004-framework-frontend.md`)
- [x] **ADR-0005**: Base de datos principal (`docs/negocio/decisiones/0005-base-de-datos-principal.md`)
- [x] **ADR-0006**: ORM y capa de acceso a datos (`docs/negocio/decisiones/0006-orm-y-capa-acceso-datos.md`)
- [x] **ADR-0007**: Autenticación y gestión de sesiones (`docs/negocio/decisiones/0007-autenticacion-y-sesiones.md`)
- [x] **ADR-0008**: Modelo de autorización (`docs/negocio/decisiones/0008-modelo-de-autorizacion.md`)
- [ ] **ADR pendiente**: Motor de búsqueda para catálogo y relevancia (todavía no documentada)

## Registro de Tareas Recientes

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| - | `Director de Producto` | Definición de visión y mapa de capacidades | Completado |
| - | `Project Manager` | Revisión de estructura y setup de entorno de agentes | Completado |

## Reglas de Actualización de este Tablero

1. Nunca borrar historial antiguo, solo añadir nuevas filas al registro.
2. Actualizar siempre la "Fase Actual" y el "Agente en turno" al traspasar responsabilidad.
3. Marcar las ADRs como `[x]` cuando sean aceptadas e incluir el enlace al archivo markdown.

| 2026-03-25 | `evaluacion-tecnologica + direccion-de-plataforma + backend-api-servicios` | ADR-0005 de base de datos principal completada: PostgreSQL (principal) + SQLite (preview PR) en `docs/negocio/decisiones/0005-base-de-datos-principal.md` | Completado |

## Actualización de ADRs Bloqueantes (2026-03-25)

- [x] **ADR-0005**: Base de datos principal (resuelta en `docs/negocio/decisiones/0005-base-de-datos-principal.md`)
- [ ] **Nota**: el tablero histórico listaba numeración distinta para "base de datos" y "motor de búsqueda"; se mantiene el historial y se alinea numeración a la solicitud vigente del usuario.
## Actualización 2026-03-25 (Evaluación tecnológica frontend)

- Se completa la decisión de framework frontend en `docs/negocio/decisiones/0004-framework-frontend.md`.
- Resultado: Astro aceptado como framework frontend base (Fase 0), con enfoque de islas y guardrails de mantenibilidad/lock-in.
- Traspaso sugerido: `@.agents/skills/documentacion-y-roadmap/SKILL.md` para alinear numeración y estado de ADRs bloqueantes en este tablero.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-29 | `@.agents/skills/frontend-ux-accesibilidad` + `@.agents/skills/backend-api-servicios` + `@.agents/skills/documentacion-y-roadmap` | Colecciones públicas reales, gestión editorial de recursos asociados, RBAC elevado a `curator`, tests y trazabilidad documental de issue #66 | Completado con desviación controlada |
| 2026-03-29 | `@.agents/skills/backend-api-servicios` + `@.agents/skills/frontend-ux-accesibilidad` | SSO educativo multi-proveedor (OIDC), Account Linking y Federated Logout | Completado |

## Actualización 2026-03-29 (Feature: SSO educativo multi-proveedor)

- **Agente en turno:** `@.agents/skills/backend-api-servicios/SKILL.md` + `@.agents/skills/frontend-ux-accesibilidad/SKILL.md`
- **Acción realizada:** Implementación de soporte para múltiples proveedores OIDC institucionales, vinculación automática de cuentas y cierre de sesión federado.
- **Cambios aplicados:**
  - `apps/api` permite configurar múltiples IdPs mediante la variable de entorno `OIDC_PROVIDERS` (JSON).
  - `Better Auth` configurado con `accountLinking` habilitado.
  - Implementado Federated Logout: el sistema rastrea el último proveedor usado y redirige al IdP institucional al cerrar sesión si el proveedor tiene `endSessionUrl` configurado.
  - La página de Login renderiza dinámicamente botones para cada proveedor configurado.
  - `ADR-0007` y `Roadmap` actualizados para reflejar estas capacidades.
- **Validación:**
  - Tests unitarios de parsing de proveedores en `apps/api/src/auth/config.unit.test.ts`.
  - Verificación visual de botones de login dinámicos.
  - Redirección de logout verificada mediante mocks.
- **Traspaso recomendado:** `@.agents/skills/seguridad-privacidad-legal/SKILL.md` para auditoría de flujos SSO en entornos reales.

## Actualización 2026-03-29 (Feature: colecciones públicas y gestión editorial)

- **Agente en turno:** `@.agents/skills/frontend-ux-accesibilidad/SKILL.md` + `@.agents/skills/backend-api-servicios/SKILL.md` + `@.agents/skills/documentacion-y-roadmap/SKILL.md`
- **Acción realizada:** Se completa la issue #66 con persistencia real de colecciones en API pública, mejora del backoffice editorial y endurecimiento de permisos.
- **Cambios aplicados:**
  - `packages/db` amplía listado y detalle de colecciones con portada, curador, conteo de recursos y reordenación.
  - La API pública deja de responder con stubs en `GET /api/v1/collections` y `GET /api/v1/collections/:slug`.
  - El CRUD editorial de colecciones añade portada, descripción y gestión de recursos asociados desde la misma pantalla.
  - El backoffice deja de mostrar colecciones a `author`; la gestión queda reservada a `curator` y `admin`.
  - La navegación pública sustituye los placeholders "Artículos" e "Itinerarios" por `Colecciones` y la home enlaza a la nueva experiencia pública.
  - Se documenta la feature en `docs/epics/epic-003/features/feature-colecciones-publicas-y-gestion/`.
- **Validación:**
  - `bun test packages/db/src/repository.unit.test.ts`: verde.
  - `bun test apps/api/src/index.unit.test.ts apps/api/src/routes/admin.unit.test.ts`: verde.
  - `cd apps/frontend && bun test`: verde.
  - `cd apps/frontend && bun run build`: verde.
  - `bun run test`: verde (`337 pass`, `0 fail`, cobertura 91.77%).
- **Riesgos abiertos:**
  - El detalle público se resuelve en `/colecciones?slug=...` y no en una ruta dinámica literal `/colecciones/:slug` mientras se mantenga la salida estática actual de Astro.
  - La portada de colección usa URL directa; no existe todavía un flujo específico de upload o media picker dedicado.
- **Traspaso recomendado:** `@.agents/skills/direccion-de-plataforma/SKILL.md` si se quiere desbloquear rutas dinámicas reales de colecciones en frontend, o `@.agents/skills/qa-validacion/SKILL.md` para ampliar cobertura E2E del flujo editorial de colecciones.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-25 | `@.agents/skills/evaluacion-tecnologica` + `@.agents/skills/direccion-de-plataforma` | ADR-0004 Framework Frontend creada y aceptada | Completado |

## Actualización 2026-03-25 (Evaluación Tecnológica)

- **Agente en turno:** `@.agents/skills/evaluacion-tecnologica/SKILL.md`
- **Acción realizada:** Se completa propuesta ADR de framework HTTP para API backend en `docs/negocio/decisiones/0003-framework-http-api.md`.
- **Estado del entregable:** Aceptado.
- **Riesgos abiertos:**
  - Validar benchmark en caso real de dominio antes de congelar plantilla de servicio.
  - Confirmar si el tablero global renumera ADRs bloqueantes (el encargo actual usa ADR-0003 para HTTP).
- **Traspaso de turno sugerido:** `@.agents/skills/direccion-de-plataforma/SKILL.md` para aceptación/rechazo de ADR y orden de implementación.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-25 | `@.agents/skills/evaluacion-tecnologica/SKILL.md` | ADR-0003 framework HTTP API (`docs/negocio/decisiones/0003-framework-http-api.md`) | Propuesto |

## Actualización 2026-03-25 (Alineación documental de estado)

- **Resumen ejecutivo:**
  - El repositorio ya no está en fase de inicialización.
  - Están presentes y aceptadas las ADR-0001 a ADR-0008.
  - La base técnica existe en código: `apps/api`, `apps/frontend`, `apps/cli` y `packages/db`.
  - La autenticación y autorización tienen implementación inicial con tests unitarios pasando.
  - El núcleo funcional del catálogo sigue pendiente: metadatos mínimos, persistencia real de recursos, búsqueda y flujo editorial.
- **Validación actual:**
  - `bun test` en raíz no está verde todavía.
  - Resultado observado el 2026-03-25: tests unitarios de API/auth/RBAC pasan, pero la ejecución global falla al intentar cargar `e2e/example.spec.ts` desde Bun en vez de Playwright.
- **Bloqueos reales actuales:**
  - Ya no bloquean ADRs de framework HTTP, frontend ni base de datos.
  - El bloqueo práctico es de implementación funcional y de disciplina de testing.
- **Traspaso sugerido:**
  - `@.agents/skills/metadatos-y-curacion/SKILL.md` para cerrar modelo mínimo de metadatos.
  - `@.agents/skills/backend-api-servicios/SKILL.md` para reemplazar placeholders por persistencia real.
  - `@.agents/skills/qa-validacion/SKILL.md` para dejar separación limpia entre unit/e2e.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-25 | `@.agents/skills/documentacion-y-roadmap/SKILL.md` | Roadmap y tablero global alineados con el estado real de código, ADRs y validación | Completado |

## Actualización 2026-03-25 (Coordinación PM + Documentación: alineación y preparación de Épica 001)

- **Fase actual corregida:** Fase 1 — MVP de catálogo (sin cambio de fase, se confirma estado real).
- **Épica activa corregida:** `epic-001-mvp-recursos-metadatos-minimos` (nueva épica creada en `docs/epics/`).
- **Agente en turno corregido:** `@.agents/skills/project-manager/SKILL.md` + `@.agents/skills/documentacion-y-roadmap/SKILL.md`.
- **ADRs resueltas confirmadas:** ADR-0001 a ADR-0008 aceptadas; pendiente ADR de motor de búsqueda/relevancia para fases posteriores.

### Desajustes detectados y alineación
1. El estado documental indicaba avance técnico correcto, pero no existía aún una primera épica real estructurada en `docs/epics/`.
2. `bun test` incluía accidentalmente `e2e/example.spec.ts` (Playwright), rompiendo la validación unitaria en raíz.
3. El roadmap ya reflejaba prioridades correctas, pero faltaba trazabilidad operativa de tareas ejecutables para la primera épica.

### Acciones realizadas
- Se crea la Épica 001 con artefactos mínimos: `requirements.md`, `design.md`, `tasks.md`, `validation.md`.
- Se corrige separación unit/e2e en testing:
  - test E2E renombrado a `e2e/example.e2e.ts`.
  - `playwright.config.ts` añadido para `testMatch: **/*.e2e.ts`.
  - scripts de test en raíz acotados a `tests/` para evitar ejecución accidental de E2E en `bun test`.
  - test automatizado agregado para verificar esta separación.

### Riesgos abiertos
- Persisten dependencias de negocio sin validar end-to-end (CRUD real aún no implementado en rutas placeholder).
- ADR de motor de búsqueda y ADR de perfil mínimo de metadatos siguen pendientes de formalización.
- Se necesita ampliar cobertura con tests de servicios de recursos y persistencia real.

### Traspaso recomendado
- Siguiente agente: `@.agents/skills/metadatos-y-curacion/SKILL.md` para cerrar perfil mínimo de metadatos + ADR.
- Después: `@.agents/skills/backend-api-servicios/SKILL.md` y `@.agents/skills/data-db-architect/SKILL.md` para CRUD real y migraciones.
- QA de cierre de tramo: `@.agents/skills/qa-validacion/SKILL.md`.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-25 | `@.agents/skills/project-manager` + `@.agents/skills/documentacion-y-roadmap` | Creación de Épica 001, alineación de trazabilidad y corrección de separación `bun test` vs Playwright E2E | Completado |

## Actualización 2026-03-26 (QA/Tooling: endurecimiento de `make test`)

- **Agente en turno:** `@.agents/skills/qa-validacion/SKILL.md`
- **Acción realizada:** Se endurece la orquestación de pruebas para que `make test` ejecute solo la suite estándar reproducible, sin globs frágiles ni `|| true`.
- **Cambios aplicados:**
  - `Makefile` alineado con `package.json`: `test` pasa a ejecutar suite estándar + coverage; `test-all` agrega E2E.
  - Nuevo descubrimiento explícito de suites unitarias e integración mediante `scripts/run-bun-suite.ts`.
  - Preflight de Playwright añadido con `scripts/check-e2e-env.ts` para fallos de entorno más claros.
  - Tests automatizados añadidos para validar descubrimiento de suites y mensajes de preflight E2E.
- **Riesgos abiertos:**
  - No hay tests de integración reales todavía; el target los informa como omitidos en lugar de fingir ejecución.
  - Los targets E2E siguen requiriendo un entorno con permisos de navegador.
- **Traspaso recomendado:** `@.agents/skills/backend-api-servicios/SKILL.md` o `@.agents/skills/qa-validacion/SKILL.md` para introducir la primera suite de integración real cuando exista persistencia/servicios que lo justifiquen.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-26 | `@.agents/skills/qa-validacion` | Endurecimiento de `Makefile` y scripts de test; `make test` separado de E2E y validado con tests automatizados | Completado |

## Actualización 2026-03-26 (Auth/config: URL pública canónica en local)

- **Agente en turno:** `@.agents/skills/qa-validacion/SKILL.md` + `@.agents/skills/documentacion-y-roadmap/SKILL.md`
- **Acción realizada:** Se alinea la configuración de Better Auth con la URL pública real de desarrollo local.
- **Cambios aplicados:**
  - El fallback de `BETTER_AUTH_URL` pasa a usar `http://localhost:4321` como URL pública canónica en local.
  - Se añaden helpers testeables en `apps/api/src/auth/config.ts` para fijar semántica de `FRONTEND_URL` y `BETTER_AUTH_URL`.
  - Se añade test automatizado para evitar regresiones en defaults de auth.
  - Se actualizan `.env.example` y `README.md` para explicar que Astro expone la app en `4321` y proxya `/api` al backend `3000`.
- **Riesgos abiertos:**
  - Conviene validar manualmente el inicio de flujo OIDC con proveedor demo tras cambios en `BETTER_AUTH_URL`.
  - La documentación global de roadmap sigue parcialmente desalineada respecto al estado real de varias épicas.
- **Traspaso recomendado:** `@.agents/skills/documentacion-y-roadmap/SKILL.md` para seguir corrigiendo desalineaciones de estado y roadmap tras consolidar validación funcional.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-26 | `@.agents/skills/qa-validacion` + `@.agents/skills/documentacion-y-roadmap` | Alineación de `BETTER_AUTH_URL` con la URL pública local (`4321`) y documentación asociada | Completado |

## Actualización 2026-03-26 (Frontend: historial navegable en paginación)

- **Agente en turno:** `@.agents/skills/frontend-ux-accesibilidad/SKILL.md`
- **Acción realizada:** Se corrige la escritura de historial en listado para que la paginación cree entradas navegables de Back/Forward.
- **Cambios aplicados:**
  - Se introduce helper de historial/URL para listados (`buildListingUrl`, `writeListingStateToHistory`).
  - La búsqueda sigue usando `replaceState` para evitar ruido por tecleo.
  - Los botones de paginación (`Anterior`/`Siguiente`) pasan a usar `pushState`.
  - Se añaden tests unitarios del helper de historial.
- **Validación:** `bun test` en verde tras añadir suite nueva.
- **Traspaso recomendado:** `@.agents/skills/qa-validacion/SKILL.md` para ampliar cobertura con pruebas de integración UI (popstate + paginación + scroll).

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-26 | `@.agents/skills/frontend-ux-accesibilidad` | Paginación del listado usa `pushState` y mantiene `replaceState` para búsqueda; helper y tests unitarios añadidos | Completado |

## Actualización 2026-03-26 (Catálogo público: filtros básicos y alineación documental)

- **Agente en turno:** `@.agents/skills/frontend-ux-accesibilidad/SKILL.md` + `@.agents/skills/documentacion-y-roadmap/SKILL.md`
- **Acción realizada:** Se completa el siguiente tramo del catálogo público con filtros básicos por tipo, idioma y licencia, y se alinea la documentación de estado con la implementación real.
- **Cambios aplicados:**
  - Búsqueda pública ampliada con filtros por `resourceType`, `language` y `license`.
  - Estado del listado sincronizado en URL junto con búsqueda y paginación.
  - API pública y repositorio compartido alineados con el nuevo contrato de filtros.
  - Roadmap actualizado para reflejar que el catálogo público ya dispone de listado, ficha, paginación y filtros básicos.
  - Trazabilidad de Épica 001 ampliada para reflejar cierre documental y el estado real del MVP base.
- **Validación:**
  - `make test`
  - `bun run lint`
- **Riesgos abiertos:**
  - Colecciones públicas siguen en placeholder.
  - Flujo editorial de recursos sigue sin materializarse como experiencia completa de producto.
  - La búsqueda sigue siendo básica: sin facetas contadas, sin nivel/materia y sin ranking avanzado.
- **Traspaso recomendado:** `@.agents/skills/frontend-ux-accesibilidad/SKILL.md` + `@.agents/skills/backend-api-servicios/SKILL.md` para el siguiente tramo de flujo editorial o profundización de búsqueda.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-26 | `@.agents/skills/frontend-ux-accesibilidad` + `@.agents/skills/documentacion-y-roadmap` | Filtros básicos del catálogo público (tipo, idioma, licencia) y alineación de roadmap/estado con la implementación actual | Completado |

## Actualización 2026-03-27 (Hotfix: seed de recursos en dashboard)

- **Agente en turno:** `@.agents/skills/frontend-ux-accesibilidad/SKILL.md` + `@.agents/skills/backend-api-servicios/SKILL.md`
- **Acción realizada:** Se corrige el error del botón "Generar recursos aleatorios" que devolvía "Solo disponible en modo desarrollo" aun ejecutando la app en desarrollo.
- **Cambios aplicados:**
  - Se añade helper de entorno en API para resolver `NODE_ENV` desde `process.env` y `Bun.env`.
  - La ruta `POST /api/dev/seed-resources` pasa a usar esa utilidad en lugar de depender solo de `process.env.NODE_ENV`.
  - El script `apps/api` `dev` fija `NODE_ENV=development` al arrancar con Bun hot reload.
  - Se añaden tests unitarios del helper y cobertura del fallback `Bun.env.NODE_ENV`.
- **Validación:**
  - `bun test src/env.unit.test.ts src/routes/dev.unit.test.ts` en `apps/api`: verde.
- **Riesgos abiertos:**
  - `bun test` completo de `apps/api` sigue fallando por una incidencia previa ajena en `src/index.unit.test.ts` relacionada con una foreign key (`resources.assigned_curator_id -> user.id`) durante publicación de recursos.
- **Traspaso recomendado:** `@.agents/skills/backend-api-servicios/SKILL.md` o `@.agents/skills/qa-validacion/SKILL.md` para sanear la suite completa del API y cerrar el fallo previo de integridad de datos.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-27 | `@.agents/skills/frontend-ux-accesibilidad` + `@.agents/skills/backend-api-servicios` | Hotfix del endpoint dev de seed: detección robusta de entorno con Bun + tests unitarios específicos | Completado |

## Actualización 2026-03-29 (Feature: ayuda y manual de usuario)

- **Agente en turno:** `@.agents/skills/frontend-ux-accesibilidad/SKILL.md` + `@.agents/skills/documentacion-y-roadmap/SKILL.md`
- **Acción realizada:** Se implementa la página pública `/ayuda` y se conecta desde la cabecera pública, el footer y el sidebar editorial.
- **Cambios aplicados:**
  - Se centraliza el contenido y los enlaces de ayuda en `apps/frontend/src/lib/help-content.ts`.
  - Se añade la ruta `apps/frontend/src/pages/ayuda.astro` con secciones ancladas para primeros pasos, exploración, publicación, colecciones, FAQ, roles, contacto y mapa web.
  - La navegación pública añade acceso visible a ayuda incluso durante la carga del estado de sesión.
  - El footer enlaza `Contacto`, `Mapa Web` y `Preguntas Frecuentes` a secciones reales.
  - El backoffice añade acceso contextual a ayuda para perfiles editoriales y se sincroniza `backoffice-nav.ts`.
  - Se documenta la feature en `docs/epics/epic-003/features/feature-ayuda-manual-usuario/`.
- **Validación:**
  - `cd apps/frontend && bun test`: verde.
  - `cd apps/frontend && bun run build`: verde.
- **Riesgos abiertos:**
  - El canal operativo de soporte sigue siendo descriptivo; todavía no existe una configuración o integración específica para ticketing/contacto.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-29 | `@.agents/skills/frontend-ux-accesibilidad` + `@.agents/skills/documentacion-y-roadmap` | Página `/ayuda`, enlaces reales en header/footer/backoffice, tests y trazabilidad documental de la feature | Completado |

## Actualización 2026-03-27 (Backoffice: navegación y CRUD mínimos)

- **Agente en turno:** `@.agents/skills/frontend-ux-accesibilidad/SKILL.md` + `@.agents/skills/backend-api-servicios/SKILL.md` + `@.agents/skills/qa-validacion/SKILL.md`
- **Acción realizada:** Se implementa un backoffice navegable con sidebar persistente y CRUD mínimos para recursos, usuarios, categorías/taxonomías y colecciones, con visibilidad por rol y contratos reales de API/preview.
- **Cambios aplicados:**
  - Nuevo `AdminLayout` con navegación responsive y accesible por rol.
  - Nuevas vistas de backoffice: panel, listado de recursos, usuarios, categorías y colecciones.
  - Recursos mantienen alta/edición y añaden listado paginado y filtrado.
  - API admin ampliada con endpoints reales para usuarios, colecciones y taxonomías, más RBAC por rol y filtros de visibilidad para recursos.
  - `ApiClient`, `HttpApiClient` y `PreviewApiClient` ampliados para soportar el nuevo backoffice.
  - `packages/db` ampliado con esquema de taxonomías y repositorios para usuarios, colecciones y taxonomías.
  - Tests añadidos/actualizados para navegación del backoffice y rutas admin.
- **Validación:**
  - `cd apps/api && bun test src/routes/admin.unit.test.ts`
  - `cd apps/frontend && bun test src/lib/backoffice-nav.unit.test.ts`
  - `cd apps/frontend && bun run build`
- **Riesgos abiertos:**
  - Las vistas de usuarios, categorías y colecciones usan edición inline mínima; no existe aún un formulario dedicado por ruta para todas las entidades.
  - La búsqueda de recursos combina filtrado servidor para `q/status` con una UI todavía básica; faltan ordenación avanzada y filtros más ricos.
  - No se han añadido tests E2E del sidebar y de los flujos CRUD en navegador; la cobertura actual valida contratos y visibilidad base, no el recorrido visual completo.
- **Traspaso recomendado:** `@.agents/skills/qa-validacion/SKILL.md` para ampliar cobertura E2E y `@.agents/skills/documentacion-y-roadmap/SKILL.md` para reflejar el estado del backoffice en épicas/roadmap.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-27 | `@.agents/skills/frontend-ux-accesibilidad` + `@.agents/skills/backend-api-servicios` + `@.agents/skills/qa-validacion` | Backoffice con sidebar responsive y CRUD mínimos para recursos, usuarios, categorías y colecciones; API y clientes alineados | Completado |

## Actualización 2026-03-26 (Flujo editorial de recursos)

- **Agente en turno:** `@.agents/skills/backend-api-servicios/SKILL.md` + `@.agents/skills/frontend-ux-accesibilidad/SKILL.md`
- **Acción realizada:** Se implementa el flujo editorial completo de recursos como experiencia end-to-end.
- **Cambios aplicados:**
  - Reglas de transición editorial con validación por rol en `packages/db/src/validation.ts` (`TRANSITION_RULES`, `validateTransition`).
  - Endpoint `PATCH /api/admin/resources/:id/status` abierto a `author` con validación de transiciones (antes solo `curator`).
  - Campo `createdBy` en schema de recursos con resolución de nombre vía LEFT JOIN.
  - Stepper visual en `editar.astro` con 3 pasos (Borrador/En revisión/Aprobado) y colores semafóricos (rojo/naranja/verde).
  - Botones de acción dinámicos según estado y rol del usuario.
  - Nombre del creador visible en listado público, dashboard, ficha y vista de edición.
  - Botón "Editar" en ficha pública para usuarios autenticados (author+).
  - Badges de estado con colores semafóricos en todas las vistas.
  - Método `updateResourceStatus` añadido a `ApiClient`, `HttpApiClient` y `PreviewApiClient`.
- **Validación:**
  - `make test`: 132 tests, 94.57% cobertura.
  - `bun run lint`: limpio.
- **Riesgos abiertos:**
  - Colecciones públicas siguen en placeholder.
  - La búsqueda sigue siendo básica: sin facetas contadas, sin nivel/materia y sin ranking avanzado.
- **Traspaso recomendado:** `@.agents/skills/busqueda-y-descubrimiento/SKILL.md` para profundización de búsqueda o `@.agents/skills/backend-api-servicios/SKILL.md` para colecciones reales.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-26 | `@.agents/skills/backend-api-servicios` + `@.agents/skills/frontend-ux-accesibilidad` | Flujo editorial completo: transiciones por rol, stepper visual, campo createdBy, botón editar en ficha pública | Completado |

## Actualización 2026-03-27 (Cobertura mínima de tests)

- **Agente en turno:** `@.agents/skills/backend-api-servicios/SKILL.md` + `@.agents/skills/qa-validacion/SKILL.md`
- **Acción realizada:** Se sube la cobertura de líneas por encima del umbral mínimo del 90% tras la regresión introducida por el soporte de seed sobre PostgreSQL real.
- **Cambios aplicados:**
  - Refactor del flujo común de seed en `apps/cli/src/commands/seed.ts` para concentrar la lógica en un helper testeable y reutilizable por PGlite y PostgreSQL.
  - Tests unitarios ampliados en `apps/cli/src/commands/seed.unit.test.ts` para inserción completa, omisión de duplicados y cierre correcto del cliente ante error.
  - Nueva suite `packages/db/src/repository.unit.test.ts` para cubrir usuarios, colecciones y taxonomías sobre PGlite real.
- **Validación:**
  - `cd apps/cli && bun test src/commands/seed.unit.test.ts`
  - `env -u DATABASE_URL bun run check-coverage`
- **Resultado:**
  - `158 pass, 0 fail`
  - Cobertura de líneas: `91.07%`
- **Riesgos abiertos:**
  - `apps/api/src/routes/admin.ts` sigue siendo el principal punto ciego de cobertura por ramas; no bloquea el umbral actual, pero conviene seguir ampliándolo si se endurece la política.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-27 | `@.agents/skills/backend-api-servicios` + `@.agents/skills/qa-validacion` | Refuerzo de cobertura con tests del seed CLI y del repositorio compartido; cobertura total recuperada a 91.07% | Completado |

## Actualización 2026-03-27 (Alineación documental)

- **Agente en turno:** `@.agents/skills/documentacion-y-roadmap/SKILL.md`
- **Acción realizada:** Revisión de coherencia entre implementación y documentación tras los cambios de backoffice, PostgreSQL real en desarrollo y refuerzo de cobertura.
- **Cambios aplicados:**
  - `README.md` actualizado para reflejar que el flujo manual con PostgreSQL real debe esperar salud del contenedor (`docker compose up -d --wait db`).
  - `docs/producto/roadmap.md` actualizado para reflejar que el panel editorial interno ya está en desarrollo y que el backoffice mínimo existe en el repositorio.
  - `docs/epics/epic-001-mvp-recursos-metadatos-minimos/tasks.md` actualizado con la cifra vigente de validación (`159 tests`, `91.13%` cobertura).
- **Validación documental:**
  - Revisión cruzada contra `Makefile`, `apps/cli/src/commands/seed.ts`, `apps/frontend/src/layouts/AdminLayout.astro`, `apps/frontend/src/pages/admin/*` y `apps/api/src/routes/admin.ts`.
- **Riesgos abiertos:**
  - Siguen faltando artefactos vivos de `docs/producto/deuda-tecnica.md` y `docs/producto/riesgos.md`, que el skill considera deseables para trazabilidad continua.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-27 | `@.agents/skills/documentacion-y-roadmap` | Alineación de README, roadmap y tasks con la implementación real de PostgreSQL dev, backoffice y cobertura | Completado |

## Actualización 2026-03-27 (Caso de análisis: contexto de Procomún legacy)

- **Agente en turno:** `@.agents/skills/documentacion-y-roadmap/SKILL.md` + `@.agents/skills/ingestas-y-migraciones/SKILL.md`
- **Acción realizada:** Se documenta el estado del arte de la plataforma Procomún actual como base para planificar la migración de datos y funcionalidades a procomeka.
- **Cambios aplicados:**
  - Nuevo caso de análisis en `docs/casos/contexto-procomun-legacy/` con estado del arte, requisitos funcionales observados e información contractual pública.
  - Stack legacy confirmado: Drupal, Matomo, Docker, apps nativas iOS/Android.
  - Cifras documentadas: ~78.800 ODEs, ~100.000 multimedia, ~109.700 usuarios, ~23.500 artículos, 371 itinerarios, 55 comunidades.
  - 13 grupos de requisitos funcionales observados con mapeo a procomeka y gaps identificados.
  - 6 gaps funcionales críticos: Banco Multimedia como entidad propia, eXeLearning online, comunidades, artículos, app móvil, i18n de interfaz.
  - Información contractual del expediente CE01698/2023 (adjudicación a ICA, 318.599,63 €).
  - Carpeta `pliegos/` preparada para almacenar PPT y PCAP cuando se obtengan.
  - Sección legacy de `docs/producto/arquitectura.md` enriquecida con hallazgos.
  - Roadmap actualizado: migración de Procomún pasa de "No iniciada" a "En progreso" (fase de análisis).
- **Validación:**
  - Fuentes cruzadas: contratación pública, noticia oficial INTEF, observación directa de procomun.intef.es, fuente complementaria ICA.
  - Hechos confirmados separados de hipótesis en toda la documentación.
- **Riesgos abiertos:**
  - El Pliego de Prescripciones Técnicas (PPT) del expediente CE01698/2023 no se ha podido obtener todavía; contiene los requisitos funcionales formales.
  - No se tiene acceso al esquema de base de datos de Drupal/Procomún.
  - No se conoce si existe API pública del Procomún actual.
- **Traspaso recomendado:** `@.agents/skills/ingestas-y-migraciones/SKILL.md` para diseñar el plan ETL detallado una vez se obtengan los pliegos, y `@.agents/skills/metadatos-y-curacion/SKILL.md` para diseñar el mapeo de metadatos LOM → esquema procomeka.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-27 | `@.agents/skills/documentacion-y-roadmap` + `@.agents/skills/ingestas-y-migraciones` | Caso de análisis de Procomún legacy: estado del arte, requisitos funcionales, info contractual, gaps de migración | Completado |
## Actualización 2026-03-27 (Issue #30 — uploads resumables)

- **Agente en turno:** `@.agents/skills/backend-api-servicios/SKILL.md` + `@.agents/skills/frontend-ux-accesibilidad/SKILL.md` + `@.agents/skills/documentacion-y-roadmap/SKILL.md`
- **Acción realizada:** Se implementa un primer sistema de subida resumable multiarchivo para adjuntar binarios a recursos desde el backoffice.
- **Cambios aplicados:**
  - Integración de uploads resumables en `/api/uploads` con `@tus/server` y persistencia de sesiones en `upload_sessions`.
  - Nuevos endpoints admin para listar uploads de recurso, listar `media_items`, obtener configuración y descargar/cancelar uploads autenticados.
  - Panel de uploads en `editar.astro` con drag & drop, cola local, progreso global, cancelación y adjuntos persistidos.
  - Redirección desde creación de recurso al editor para completar adjuntos sobre un recurso ya existente.
  - ADR-0011 y nueva épica documental `docs/epics/epic-002-subidas-resumibles/`.
- **Validación:**
  - `cd apps/api && bun test ./src/routes/admin.unit.test.ts ./src/routes/uploads.unit.test.ts ./src/uploads/config.unit.test.ts`
  - `cd apps/frontend && bun run build`
  - `env -u DATABASE_URL bun run check-coverage`
- **Resultado:**
  - `166 pass, 0 fail`
  - Cobertura de líneas: `91.11%`
- **Riesgos abiertos:**
  - La validación estricta de checksum por chunk aún no está cerrada extremo a extremo; la entrega actual persiste estado resumable y checksum final.
  - El storage sigue siendo disco local/volumen; faltan limpieza programada y política operativa de cuotas/retención.
  - El preview estático no soporta uploads reales, por diseño.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-27 | `@.agents/skills/backend-api-servicios` + `@.agents/skills/frontend-ux-accesibilidad` + `@.agents/skills/documentacion-y-roadmap` | Primera entrega de uploads resumables multiarchivo para recursos con API, editor, ADR y épica documental | Completado |

## Actualización 2026-03-27 (Documentación de ruta efectiva de uploads)

- **Agente en turno:** `@.agents/skills/documentacion-y-roadmap/SKILL.md`
- **Acción realizada:** Se documenta la ruta efectiva de almacenamiento de uploads para evitar confusión entre `local-data/uploads` en raíz y `apps/api/local-data/uploads`.
- **Cambios aplicados:**
  - Aclaración en `README.md` de que `UPLOAD_STORAGE_DIR` relativo se resuelve contra el directorio de trabajo del proceso.
  - Nota operativa en ADR-0011 sobre la caída efectiva del valor por defecto al arrancar la API con `bun run --filter '@procomeka/api' dev`.
- **Validación:**
  - Revisión manual de alineación entre `apps/api/src/uploads/config.ts`, `README.md` y ADR-0011.
- **Resultado:**
  - La documentación ya explica por qué el valor por defecto `./local-data/uploads` queda en `apps/api/local-data/uploads` con el flujo de desarrollo actual.
- **Riesgos abiertos:**
  - El comportamiento sigue dependiendo del `cwd` efectivo del proceso; si se desea una ubicación fija en la raíz del monorepo, hará falta cambiar implementación o fijar `UPLOAD_STORAGE_DIR` absoluto.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-27 | `@.agents/skills/documentacion-y-roadmap` | Documentación del directorio efectivo de uploads en desarrollo local | Completado |

## Actualización 2026-03-27 (Descarga pública de adjuntos en ficha de recurso)

- **Agente en turno:** `@.agents/skills/backend-api-servicios/SKILL.md` + `@.agents/skills/frontend-ux-accesibilidad/SKILL.md`
- **Acción realizada:** Se corrige la exposición de archivos adjuntos en la vista pública `/recurso`.
- **Cambios aplicados:**
  - `getResourceBySlug` ahora incluye `mediaItems` y normaliza URLs antiguas de adjuntos desde `/api/admin/uploads/:id/content` a `/api/v1/uploads/:id/content`.
  - Nueva ruta pública `GET /api/v1/uploads/:id/content` para descargar binarios de recursos publicados.
  - La ficha pública `recurso.astro` muestra la sección `Archivos` con enlaces de descarga.
- **Validación:**
  - `bun test apps/api/src/resources/repository.unit.test.ts apps/api/src/index.unit.test.ts apps/api/src/routes/uploads.unit.test.ts`
  - `bun run --filter '@procomeka/frontend' build`
- **Resultado:**
  - `37 pass, 0 fail`
  - Build de frontend correcto
- **Riesgos abiertos:**
  - Los adjuntos siguen dependiendo de storage local y de que el fichero físico siga presente en disco.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-27 | `@.agents/skills/backend-api-servicios` + `@.agents/skills/frontend-ux-accesibilidad` | Corrección de adjuntos descargables en ficha pública de recurso | Completado |

## Actualización 2026-03-28 (PR #49 — fixes de revisión)

- **Agente en turno:** `@.agents/skills/backend-api-servicios/SKILL.md` + `@.agents/skills/frontend-ux-accesibilidad/SKILL.md`
- **Acción realizada:** Se atienden comentarios de revisión de seguridad y validación sobre la PR de uploads resumables.
- **Cambios aplicados:**
  - Escape explícito de nombres de archivo, mensajes de error y atributos renderizados vía `innerHTML` en `resource-uploader.ts`.
  - Nuevos tests unitarios para el render seguro del uploader.
  - Endurecimiento de `validateUploadCandidate` para rechazar uploads sin extensión o sin tipo MIME permitido.
  - Ampliación de tests unitarios de configuración de uploads para cubrir esos rechazos.
- **Validación:**
  - `bun test apps/frontend/src/lib/resource-uploader.unit.test.ts apps/api/src/uploads/config.unit.test.ts`
  - `bun run --filter '@procomeka/frontend' build`
- **Resultado:**
  - `9 pass, 0 fail`
  - Build de frontend correcto
- **Riesgos abiertos:**
  - La validación sigue basada en metadatos declarados por cliente; si se quiere inspección de contenido real, hará falta añadir sniffing/escaneo en backend.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-28 | `@.agents/skills/backend-api-servicios` + `@.agents/skills/frontend-ux-accesibilidad` | Resolución de comentarios de revisión en PR #49 | Completado |

## Actualización 2026-03-28 (Refactorizacion integral — PR #52)

- **Agente en turno:** Equipo multiagente de auditoria y refactorizacion
- **Accion realizada:** Refactorizacion completa del repositorio cubriendo arquitectura, entidades, API, frontend, skills y testing.

### Arquitectura de codigo
- `admin.ts` (585 lineas) partido en 5 modulos por dominio bajo `routes/admin/`
- `ROLE_LEVELS` consolidado de 3 copias a 1 fuente canonica en `@procomeka/db/validation`
- CRUD route builder generico (`buildCrudRoutes`) elimina ~50% del boilerplate de rutas admin
- Helpers compartidos extraidos: `parsePagination`, `ensureCurrentUser`, `requireOwnedResource`
- Eliminados wrappers innecesarios: `resources/validation.ts`, `resources/repository.ts`

### Entidades y esquemas
- Default de colecciones corregido: `borrador` -> `draft`
- FK self-referencing en `taxonomies.parentId` con ON DELETE SET NULL
- Tipos de recurso, idiomas y licencias ahora son taxonomias gestionables desde admin
- CRUD faltantes: `deleteMediaItem`, `addResourceToCollection`, `removeResourceFromCollection`, `listCollectionResources`
- `VALID_TAXONOMY_TYPES` con validacion
- `ensureUser` simplificado: INSERT ON CONFLICT DO NOTHING

### API
- `requireRole` middleware reemplaza 33 checks inline de `hasMinRole`
- Validacion de role en PATCH users (previene roles arbitrarios)
- Fallback MIME `application/octet-stream` para archivos sin tipo detectado
- Extensiones `.elp`/`.elpx` permitidas
- `tsc --noEmit` en CI pipeline
- Endpoint publico `GET /api/v1/taxonomies/:type` para filtros dinamicos

### Frontend
- Catalogo publico: sidebar facetada, grid/list toggle, paginacion numerada
- Vista de detalle: layout 2 columnas con sidebar de metadatos, pills, tarjetas de archivos
- Admin: CSS unificado en AdminLayout, dialogos nativos, badges de estado
- Logica extraida a `catalog-controller.ts` y `resource-display.ts`
- Filtros cargados dinamicamente desde API con fallback a hardcoded
- Uploads en preview mode via IndexedDB (ADR-0012)

### Skills
- 20 -> 16 skills (4 duplicados fusionados en roles base)
- 9 skills mejorados con documentacion oficial via Context7

### Testing
- Tests de permisos: 5 `toBeDefined` -> 19 assertions de comportamiento
- Tests CRUD para colecciones, taxonomias, usuarios
- PGlite `memory://` para aislamiento de tests
- Dependencias fijadas (sin `^` ni `latest`)

### Documentacion
- Modelo de dominio v0.1 reconciliado con implementacion
- ADR-0012: uploads en preview mode con IndexedDB

### Validacion
- `make test`: 204 tests, 0 fail, 92.59% cobertura
- `make up`: catalogo publico y admin funcionales
- `make up-static`: preview mode con uploads IndexedDB

| Fecha | Agente | Accion / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-28 | Equipo multiagente | Refactorizacion integral: arquitectura, entidades, API, frontend, skills, testing, documentacion (PR #52) | Completado |

## Actualización 2026-03-28 (Evaluación framework UI para islands)

- **Agente en turno:** `@.agents/skills/evaluacion-tecnologica/SKILL.md`
- **Issue:** #50 — Evaluar framework UI para islands interactivas en Astro
- **Acción realizada:** Se redacta ADR-0013 en `docs/negocio/decisiones/0013-framework-ui-islands.md`.
- **Propuesta:** React como framework UI para islands, con React Aria (Adobe) como librería de componentes accesibles, React Hook Form para formularios y Tanstack Table para tablas.
- **Estado del entregable:** Aceptado.
- **Justificación principal:** Mejor ecosistema WCAG AA (React Aria), formularios y tablas resueltos, testing maduro, TypeScript completo. ADR-0004 ya contemplaba React para islands.
- **Plan de migración:** 7 fases incrementales, de menor a mayor complejidad, empezando por CRUD de categorías y terminando con el formulario de edición de recursos.
- **Impacto en bundle:** ~80-90 KB base (gzip) compartido entre todas las islands; páginas sin islands siguen siendo 0 KB JS.
- **Riesgos abiertos:** Bundle mayor que Svelte/Solid; requiere disciplina para evitar deriva SPA.
- **Traspaso de turno sugerido:** `@.agents/skills/direccion-de-plataforma/SKILL.md` para aceptación/rechazo de ADR.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-28 | `@.agents/skills/evaluacion-tecnologica` | ADR-0013 Framework UI para islands interactivas — Aceptado (Issue #50) | Aceptado |

## Actualización 2026-03-28 (ADR-0013: bootstrap React islands)

- **Agente en turno:** `@.agents/skills/frontend-ux-accesibilidad/SKILL.md` + `@.agents/skills/documentacion-y-roadmap/SKILL.md`
- **Acción realizada:** Se inicia la materialización de la ADR-0013 integrando React en Astro para islands interactivas.
- **Cambios aplicados:**
  - `apps/frontend` integra `@astrojs/react`, `react` y `react-dom`.
  - Se crea la frontera `src/islands/` con primitives compartidas para feedback, confirmación y tabla CRUD.
  - `apps/frontend/src/pages/admin/categorias/index.astro` pasa a shell Astro + island React como piloto de migración.
  - Se añaden artefactos de feature para trazabilidad en la Épica 001.
- **Validación prevista:**
  - `cd apps/frontend && bun test`
  - `bun test`
  - `cd apps/frontend && bun run build`
  - `cd apps/frontend && PREVIEW_STATIC=true bun run build:preview`
- **Riesgos abiertos:**
  - Confirmar compatibilidad completa de React Testing Library sobre `bun test` en CI.
  - Medir el impacto real de bundle antes de repetir el patrón en más rutas.
- **Traspaso recomendado:** `@.agents/skills/frontend-ux-accesibilidad/SKILL.md` para continuar con `admin/colecciones` tras validar esta base.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-28 | `@.agents/skills/frontend-ux-accesibilidad` + `@.agents/skills/documentacion-y-roadmap` | Bootstrap de React islands (ADR-0013), piloto en `admin/categorias` y trazabilidad de feature en Épica 001 | En validación |

## Actualización 2026-03-28 (ADR-0013: validación completada)

- **Validación ejecutada:**
  - `cd apps/frontend && bun test`
  - `cd apps/frontend && bun run build`
  - `cd apps/frontend && PREVIEW_STATIC=true bun run build:preview`
  - `bun run test`
- **Resultado:** validación estándar en verde. La suite estándar del repositorio termina con 204 tests passing y 91.94% de cobertura de líneas.
- **Nota operativa:** `bun test` en la raíz sigue sin ser el comando correcto para este repositorio porque intenta descubrir `e2e/example.spec.ts`; el comando canónico validado es `bun run test`.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-28 | `@.agents/skills/frontend-ux-accesibilidad` + `@.agents/skills/documentacion-y-roadmap` | Bootstrap de React islands (ADR-0013), piloto en `admin/categorias`, documentación y validación estándar completadas | Completado |

## Actualización 2026-03-28 (ADR-0013: migración `admin/colecciones`)

- **Agente en turno:** `@.agents/skills/frontend-ux-accesibilidad/SKILL.md` + `@.agents/skills/documentacion-y-roadmap/SKILL.md`
- **Acción realizada:** Se sustituye el script imperativo de `apps/frontend/src/pages/admin/colecciones/index.astro` por una island React dedicada.
- **Cambios aplicados:**
  - Se crea `apps/frontend/src/islands/crud/CollectionsCrudIsland.tsx`.
  - La ruta `admin/colecciones` pasa a shell Astro + island React `client:load`.
  - El flujo de alta, edición, borrado, búsqueda y paginación queda gestionado con estado React y componentes compartidos.
  - Se añade un test TypeScript del shell inicial de la nueva island.
- **Validación prevista:**
  - `cd apps/frontend && bun test`
  - `cd apps/frontend && bun run build`
  - `cd apps/frontend && PREVIEW_STATIC=true bun run build:preview`
  - `bun run test`
- **Riesgos abiertos:**
  - Medir bundle cuando se aborde `admin/recursos/index`, donde el peso hidratado será más representativo.
  - Extraer una base más genérica de CRUD si `admin/usuarios` y `admin/colecciones` convergen suficientemente en estructura.
- **Traspaso recomendado:** continuar con validación completa y, si queda en verde, seguir con `admin/usuarios`.

## Actualización 2026-03-28 (ADR-0013: `admin/colecciones` validado)

- **Validación ejecutada:**
  - `cd apps/frontend && bun test`
  - `cd apps/frontend && bun run build`
  - `cd apps/frontend && PREVIEW_STATIC=true bun run build:preview`
  - `bun run test`
- **Resultado:** validación estándar en verde. La suite global del repositorio termina con 204 tests passing y 91.94% de cobertura de líneas.
- **Impacto de bundle observado:** `CollectionsCrudIsland` se empaqueta como chunk dedicado de `7.21 kB` (`2.37 kB gzip`), dentro del presupuesto previsto para esta fase.
- **Nota operativa:** los warnings de build observados siguen siendo los ya existentes de PGlite y dependencias de preview, sin cambios de severidad atribuibles a la migración de colecciones.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-28 | `@.agents/skills/frontend-ux-accesibilidad` + `@.agents/skills/documentacion-y-roadmap` | Migración de `admin/colecciones` a React island, test TypeScript y validación estándar completada | Completado |

## Actualización 2026-03-28 (ADR-0013: migración `admin/usuarios`)

- **Agente en turno:** `@.agents/skills/frontend-ux-accesibilidad/SKILL.md` + `@.agents/skills/documentacion-y-roadmap/SKILL.md`
- **Acción realizada:** Se sustituye el script imperativo de `apps/frontend/src/pages/admin/usuarios/index.astro` por una island React dedicada.
- **Cambios aplicados:**
  - Se crea `apps/frontend/src/islands/crud/UsersCrudIsland.tsx`.
  - La ruta `admin/usuarios` pasa a shell Astro + island React `client:load`.
  - El flujo de filtros, paginación, cambio de rol y activación/desactivación queda gestionado con estado React y feedback accesible.
  - Se añade un test TypeScript del shell inicial de la nueva island.
- **Validación ejecutada:**
  - `cd apps/frontend && bun test`
  - `cd apps/frontend && bun run build`
  - `bun run test`
- **Resultado:** validación estándar en verde. La suite global del repositorio termina con 204 tests passing y 91.94% de cobertura de líneas.
- **Impacto de bundle observado:** `UsersCrudIsland` se empaqueta como chunk dedicado de `4.23 kB` (`1.70 kB gzip`), dentro del presupuesto de la fase.
- **Traspaso recomendado:** continuar con `admin/recursos/index`, donde el peso y la complejidad ya justifican medir bundle y separar claramente acciones de tabla frente a navegación.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-28 | `@.agents/skills/frontend-ux-accesibilidad` + `@.agents/skills/documentacion-y-roadmap` | Migración de `admin/usuarios` a React island, test TypeScript y validación estándar completada | Completado |

## Actualización 2026-03-28 (ADR-0013: migración `admin/recursos/index`)

- **Agente en turno:** `@.agents/skills/frontend-ux-accesibilidad/SKILL.md` + `@.agents/skills/documentacion-y-roadmap/SKILL.md`
- **Acción realizada:** Se sustituye el script imperativo de `apps/frontend/src/pages/admin/recursos/index.astro` por una island React dedicada para el listado editorial.
- **Cambios aplicados:**
  - Se crea `apps/frontend/src/islands/crud/ResourcesTableIsland.tsx`.
  - La ruta `admin/recursos/index` pasa a shell Astro + island React `client:load`.
  - El flujo de filtros, paginación, navegación a edición y borrado con confirmación queda gestionado con estado React.
  - Se añade un test TypeScript del shell inicial de la nueva island.
- **Validación ejecutada:**
  - `cd apps/frontend && bun test`
  - `cd apps/frontend && bun run build`
  - `bun run test`
- **Resultado:** validación estándar en verde. La suite global del repositorio termina con 204 tests passing y 91.94% de cobertura de líneas.
- **Impacto de bundle observado:** `ResourcesTableIsland` se empaqueta como chunk dedicado de `3.88 kB` (`1.67 kB gzip`), dentro del presupuesto de la fase.
- **Traspaso recomendado:** continuar con el catálogo público o con los formularios de recurso, dependiendo de si quieres priorizar descubrimiento público o completar el backoffice editorial.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-28 | `@.agents/skills/frontend-ux-accesibilidad` + `@.agents/skills/documentacion-y-roadmap` | Migración de `admin/recursos/index` a React island, test TypeScript y validación estándar completada | Completado |

## Actualización 2026-03-28 (ADR-0013: migración formularios de recurso)

- **Agente en turno:** `@.agents/skills/frontend-ux-accesibilidad/SKILL.md` + `@.agents/skills/documentacion-y-roadmap/SKILL.md`
- **Acción realizada:** Se sustituyen los scripts imperativos de `apps/frontend/src/pages/admin/recursos/nuevo.astro` y `apps/frontend/src/pages/admin/recursos/editar.astro` por islands React dedicadas.
- **Cambios aplicados:**
  - Se crean `apps/frontend/src/islands/resources/ResourceFormIsland.tsx` y `apps/frontend/src/islands/resources/ResourceEditorIsland.tsx`.
  - Se extraen las opciones de formulario compartidas a `apps/frontend/src/islands/resources/resource-form-options.ts`.
  - El editor mantiene el workflow editorial y la integración existente con `initResourceUploader()` dentro de la island React.
  - Se añaden tests TypeScript del shell inicial de alta y edición.
- **Validación ejecutada:**
  - `cd apps/frontend && bun test`
  - `cd apps/frontend && bun run build`
  - `bun run test`
- **Resultado:** validación estándar en verde. La suite global del repositorio termina con 204 tests passing y 91.94% de cobertura de líneas.
- **Impacto de bundle observado:**
  - `ResourceFormIsland`: `6.26 kB` (`2.01 kB gzip`)
  - `ResourceEditorIsland`: `124.90 kB` (`37.22 kB gzip`)
- **Riesgo abierto relevante:** el editor de recurso ya concentra el mayor peso hidratado de la migración por incorporar workflow y uploader; antes de tocar catálogo público conviene decidir si se acepta este coste o si se quiere separar más la carga diferida del uploader.
- **Traspaso recomendado:** siguiente decisión entre migrar el catálogo público o refinar el editor de recurso para recortar peso e hidratar más tarde el uploader.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-28 | `@.agents/skills/frontend-ux-accesibilidad` + `@.agents/skills/documentacion-y-roadmap` | Migración de `admin/recursos/nuevo` y `admin/recursos/editar` a React islands, tests TypeScript y validación estándar completada | Completado |

## Actualización 2026-03-28 (ADR-0013: ajuste del editor de recursos)

- **Agente en turno:** `@.agents/skills/frontend-ux-accesibilidad/SKILL.md`
- **Acción realizada:** Se ajusta el editor de recursos tras la migración a React para recuperar la presentación visual y evitar que el panel de archivos bloquee la hidratación inicial.
- **Cambios aplicados:**
  - La integración de `initResourceUploader()` pasa a cargarse de forma diferida desde la island React.
  - Los estilos de `admin/recursos/nuevo` y `admin/recursos/editar` se convierten en globales y acotados a `.form-container` para que sigan aplicándose al HTML renderizado por React.
  - Se corrige el warning de React por claves en el stepper editorial.
- **Validación ejecutada:**
  - `cd apps/frontend && bun test`
  - `cd apps/frontend && bun run build`
- **Resultado:** validación del frontend en verde tras el ajuste. El editor queda dividido entre una island inicial ligera y un chunk diferido para el uploader.
- **Impacto de bundle observado:**
  - `ResourceEditorIsland`: `11.54 kB` (`3.72 kB gzip`)
  - `resource-uploader`: `114.08 kB` (`34.10 kB gzip`)
- **Nota operativa:** en desarrollo, si Vite mantiene dependencias optimizadas obsoletas de `@uppy/*`, puede seguir siendo necesario reiniciar `bun run dev` para regenerar `.vite/deps`.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-28 | `@.agents/skills/frontend-ux-accesibilidad` | Ajuste del editor de recursos: carga diferida del uploader, estilos restaurados y warning de claves corregido | Completado |

## Actualización 2026-03-28 (ADR-0013: migración del catálogo público y ficha de recurso)

- **Agente en turno:** `@.agents/skills/frontend-ux-accesibilidad/SKILL.md` + `@.agents/skills/documentacion-y-roadmap/SKILL.md`
- **Acción realizada:** Se sustituyen los scripts imperativos del catálogo público y de la ficha pública de recurso por React islands.
- **Cambios aplicados:**
  - Se crean `apps/frontend/src/islands/catalog/CatalogSearchIsland.tsx` y `apps/frontend/src/islands/catalog/CatalogIsland.tsx`.
  - `apps/frontend/src/pages/index.astro` pasa a shell Astro con buscador en cabecera y contenido del catálogo montados como islands React.
  - La búsqueda, los filtros, la paginación y el modo de vista mantienen la URL como fuente de verdad.
  - Se crea `apps/frontend/src/islands/catalog/ResourceDetailIsland.tsx`.
  - `apps/frontend/src/pages/recurso.astro` pasa a shell Astro + island React para la ficha pública.
  - Se añaden tests TypeScript del shell inicial de catálogo y ficha pública.
- **Validación ejecutada:**
  - `cd apps/frontend && bun test`
  - `cd apps/frontend && bun run build`
- **Resultado:** validación del frontend en verde tras la migración pública.
- **Impacto de bundle observado:**
  - `CatalogSearchIsland`: `0.88 kB` (`0.49 kB gzip`)
  - `CatalogIsland`: `8.82 kB` (`3.22 kB gzip`)
  - `ResourceDetailIsland`: `4.64 kB` (`1.59 kB gzip`)
- **Traspaso recomendado:** continuar con `login` y `dashboard`, que siguen usando listeners imperativos y son las siguientes piezas interactivas fuera de React.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-28 | `@.agents/skills/frontend-ux-accesibilidad` + `@.agents/skills/documentacion-y-roadmap` | Migración del catálogo público y de la ficha pública de recurso a React islands; tests y build de frontend en verde | Completado |

## Actualización 2026-03-28 (ADR-0013: migración de login y dashboard)

- **Agente en turno:** `@.agents/skills/frontend-ux-accesibilidad/SKILL.md` + `@.agents/skills/documentacion-y-roadmap/SKILL.md`
- **Acción realizada:** Se sustituyen los scripts imperativos de `apps/frontend/src/pages/login.astro` y `apps/frontend/src/pages/dashboard.astro` por React islands.
- **Cambios aplicados:**
  - Se crean `apps/frontend/src/islands/auth/LoginIsland.tsx` y `apps/frontend/src/islands/dashboard/DashboardIsland.tsx`.
  - `login.astro` pasa a shell Astro + island React para login por correo, arranque OIDC y redirección por sesión existente.
  - `dashboard.astro` pasa a shell Astro + island React para resumen de entidades, visibilidad por rol y herramientas de seed en desarrollo.
  - Se añaden tests TypeScript del shell inicial de ambas islands.
- **Validación ejecutada:**
  - `cd apps/frontend && bun test`
  - `cd apps/frontend && bun run build`
- **Resultado:** validación del frontend en verde tras la migración.
- **Impacto de bundle observado:**
  - `LoginIsland`: `2.88 kB` (`1.12 kB gzip`)
  - `DashboardIsland`: `4.09 kB` (`1.46 kB gzip`)
- **Traspaso recomendado:** quedan como piezas menores fuera de React el banner preview, el shell de navegación del admin y algunos scripts de layout general.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-28 | `@.agents/skills/frontend-ux-accesibilidad` + `@.agents/skills/documentacion-y-roadmap` | Migración de `login` y `dashboard` a React islands; tests y build de frontend en verde | Completado |

## Actualización 2026-03-28 (ADR-0013: migración de layouts y banner preview)

- **Agente en turno:** `@.agents/skills/frontend-ux-accesibilidad/SKILL.md` + `@.agents/skills/documentacion-y-roadmap/SKILL.md`
- **Acción realizada:** Se sustituyen los scripts imperativos residuales del chrome compartido de frontend por React islands.
- **Cambios aplicados:**
  - Se crean `apps/frontend/src/islands/layout/BaseNavIsland.tsx`, `apps/frontend/src/islands/layout/AdminNavIsland.tsx` y `apps/frontend/src/islands/layout/PreviewBannerIsland.tsx`.
  - `Base.astro` pasa a usar una island React para reflejar el estado de sesión en la navegación pública.
  - `AdminLayout.astro` pasa a usar una island React para navegación del backoffice y menú responsive.
  - `PreviewBanner.astro` pasa a usar una island React para cambio de rol y reinicio de datos en preview.
  - Se añaden tests TypeScript del shell inicial de estas islands de layout.
- **Validación ejecutada:**
  - `cd apps/frontend && bun test`
  - `cd apps/frontend && bun run build`
- **Resultado:** validación del frontend en verde tras cerrar el chrome compartido.
- **Impacto de bundle observado:**
  - `BaseNavIsland`: `0.63 kB` (`0.40 kB gzip`)
  - `AdminNavIsland`: `1.38 kB` (`0.71 kB gzip`)
  - `PreviewBannerIsland`: `1.61 kB` (`0.71 kB gzip`)
- **Traspaso recomendado:** la migración principal a React queda funcionalmente completada; lo siguiente ya es consolidación, refactor y validación end-to-end.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-28 | `@.agents/skills/frontend-ux-accesibilidad` + `@.agents/skills/documentacion-y-roadmap` | Migración de `Base`, `AdminLayout` y `PreviewBanner` a React islands; tests y build de frontend en verde | Completado |
