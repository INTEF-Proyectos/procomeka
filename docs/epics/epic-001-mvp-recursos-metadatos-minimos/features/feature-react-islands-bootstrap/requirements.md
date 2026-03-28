# Requirements — Feature React Islands Bootstrap

## Fecha
2026-03-28

## Objetivo
Materializar la ADR-0013 integrando React como framework de islands en Astro, con un primer piloto funcional en el backoffice de categorías.

## Requisitos funcionales
- Integrar React en `apps/frontend` sin convertir el shell de Astro en SPA.
- Migrar `admin/categorias` desde script imperativo `.astro` a una island React.
- Mantener las capacidades actuales: listado, filtros, paginación, alta, edición y borrado.
- Mantener feedback accesible (`role="status"` y `role="alert"`).

## Requisitos no funcionales
- Validación obligatoria con `bun test`.
- Compatibilidad con build normal y preview estático.
- Cambios reversibles y acotados a la frontera `src/islands/`.
- Reutilización posterior en otros CRUDs del backoffice.
