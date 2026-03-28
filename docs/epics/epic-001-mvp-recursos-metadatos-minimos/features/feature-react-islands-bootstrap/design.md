# Design — Feature React Islands Bootstrap

## Fecha
2026-03-28

## Decisiones de diseño
- Astro sigue siendo shell, layout y routing; React solo entra en `src/islands/`.
- La integración usa `@astrojs/react` y `client:load` para el piloto de categorías.
- El piloto reutiliza `ApiClient` existente; no se cambian contratos HTTP ni preview.
- Se crean primitivas reutilizables para la siguiente ola de migraciones:
  - `AccessibleFeedback`
  - `ConfirmDialog`
  - `CrudTable`

## Estructura
- `apps/frontend/src/islands/shared/`: feedback y confirmaciones accesibles.
- `apps/frontend/src/islands/crud/`: base de tabla CRUD y piloto de taxonomías.
- `apps/frontend/src/pages/admin/categorias/index.astro`: shell Astro con island React.

## Decisión de testing
- Se mantiene `bun test` como runner estándar del repositorio.
- Las pruebas de la island usan `@testing-library/react` sobre Bun, sin introducir Vitest.
