# Validation — Feature Ayuda y Manual de Usuario

## Fecha
2026-03-29

## Validaciones previstas
- `cd apps/frontend && bun test`
- `cd apps/frontend && bun run build`

## Criterios de aceptación
- El header público muestra un acceso visible a ayuda.
- El backoffice editorial muestra un acceso contextual a ayuda para roles `author+`.
- La ruta `/ayuda` existe y contiene secciones navegables en español.
- Los enlaces del footer apuntan a secciones reales de la página de ayuda.

## Resultado de validación — 2026-03-29
- `cd apps/frontend && bun test` ✅
- `cd apps/frontend && bun run build` ✅

## Observaciones
- La build estática genera correctamente la nueva ruta `/ayuda/index.html`.
- Se mantienen warnings previos de build relacionados con `@electric-sql/pglite` en navegador y un import no usado de `drizzle-orm`; no son introducidos por esta feature.
