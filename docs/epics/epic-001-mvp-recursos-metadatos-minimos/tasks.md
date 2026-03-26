# Tasks — Épica 001: MVP de recursos y metadatos mínimos

## Fecha
2026-03-25

## Estado de la épica
En desarrollo

## Documentación
- [x] Crear artefactos base de la épica (`requirements.md`, `design.md`, `tasks.md`, `validation.md`).
- [x] Crear ADR de perfil mínimo de metadatos usando plantilla `.templates/adr-template.md`.
- [ ] Alinear `docs/producto/roadmap.md` con fecha de inicio de la épica.

## Backend
- [x] Implementar servicio `resourcesService` con operaciones CRUD.
- [x] Sustituir placeholders de rutas `/api/admin/resources` por persistencia real.
- [x] Exponer lectura pública de recursos publicados en `/api/v1/resources`.
- [x] Añadir validación de payload y códigos de error consistentes.

## Base de datos
- [x] Definir esquema Drizzle para `resources` y migración inicial.
- [x] Añadir índices para `slug`, `status` y `resource_type`.
- [x] Implementar soft delete (`deleted_at`) y auditoría mínima (`created_at`, `updated_at`).

## Frontend
- [x] Crear vista editorial mínima para crear/editar recurso.
- [x] Mostrar errores de validación accesibles en formulario.
- [x] Añadir listado mínimo de recursos en dashboard.

## Testing
- [x] Corregir configuración para que `bun test` no ejecute accidentalmente Playwright E2E.
- [x] Añadir test automatizado TypeScript para validar separación unit/e2e.
- [x] Añadir tests unitarios de servicio de recursos (casos válidos e inválidos).
- [x] Añadir tests de rutas admin/públicas con persistencia real (PGlite en test).
- [x] Ejecutar `bun test` en cada cambio de feature y registrar resultados.

## Trazabilidad de ejecución
- 2026-03-25: se prepara la épica y se corrige la separación de tests unitarios vs E2E.
- 2026-03-25: implementación completa de Épica 001:
  - Schema: añadido `deleted_at` a tablas PG, cambiado default status a `draft`, añadidos índices.
  - Validación: módulo `validation.ts` con funciones puras (26 tests).
  - Repository: soft delete, filtro `deleted_at IS NULL`, `getResourceById`, status en inglés.
  - Rutas admin: GET list/detail, POST con validación por campo, PATCH, soft DELETE.
  - Rutas públicas: filtrado exclusivo de recursos `published` no eliminados.
  - Frontend: formularios con accesibilidad WCAG AA (aria-describedby, aria-invalid, role=alert), vista de edición, listado en dashboard.
  - Tests: 73 tests pasando (validación, admin CRUD+RBAC, integración pública, filtrado).
  - ADR-0009: perfil mínimo de metadatos documentado.

## Actualización 2026-03-26

- Se alinea `docs/producto/roadmap.md` con el estado real de la épica y del catálogo público.
- La capacidad pública derivada del MVP ya incluye:
  - listado de recursos publicados,
  - ficha pública de recurso,
  - búsqueda por texto libre,
  - paginación navegable,
  - filtros básicos por tipo, idioma y licencia.
- El entregable funcional base de la Épica 001 queda materializado en código y validado por tests automatizados.
- El siguiente tramo recomendado sale ya fuera del núcleo mínimo de esta épica:
  - flujo editorial de recursos,
  - facetas de búsqueda más ricas,
  - colecciones públicas reales.

## Actualización 2026-03-26 — Flujo editorial de recursos

### Backend
- [x] Añadir reglas de transición editorial (`TRANSITION_RULES`, `validateTransition`) en `packages/db/src/validation.ts`.
- [x] Actualizar endpoint `PATCH /api/admin/resources/:id/status`: abrir a `author` (antes solo `curator`), validar transiciones por rol.
- [x] Añadir campo `createdBy` al schema de recursos (FK a `user.id`) con migración automática.
- [x] Inyectar `createdBy` automáticamente al crear recurso desde la API.
- [x] Resolver `createdByName` via LEFT JOIN con tabla `user` en listados y detalle.

### Frontend
- [x] Stepper visual en `editar.astro`: 3 pasos (Borrador / En revisión / Aprobado) con colores semafóricos (rojo / naranja / verde).
- [x] Botones de acción dinámicos según estado y rol del usuario (Enviar a revisión, Aprobar, Devolver, Archivar, Restaurar).
- [x] Mostrar nombre del creador del recurso en vista de edición, dashboard y listado público.
- [x] Botón "Editar" en ficha pública de recurso (solo si logueado como author+).
- [x] Colores de badges de estado actualizados: draft=rojo, review=naranja, published=verde.

### API Client
- [x] Nuevo método `updateResourceStatus` en interfaz `ApiClient`, `HttpApiClient` y `PreviewApiClient`.

### Testing
- [x] 18 tests unitarios de reglas de transición (`validateTransition`).
- [x] Tests de API actualizados: author puede draft→review, author NO puede review→published, curator puede review→published, 404 para recurso inexistente.
- [x] 132 tests pasando, 94.57% cobertura de líneas.

### Transiciones permitidas
| Desde | Hacia | Rol mínimo |
|-------|-------|------------|
| draft | review | author |
| review | draft | curator |
| review | published | curator |
| published | archived | curator |
| archived | draft | curator |
