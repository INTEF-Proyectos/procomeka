# Validation — Feature Colecciones públicas y gestión editorial

## Fecha
2026-03-29

## Validaciones previstas
- `bun test packages/db/src/repository.unit.test.ts`
- `bun test apps/api/src/index.unit.test.ts apps/api/src/routes/admin.unit.test.ts`
- `cd apps/frontend && bun test`
- `cd apps/frontend && bun run build`
- `bun run test`

## Criterios de aceptación cubiertos
- La navegación pública muestra `Colecciones`.
- Existe una vista pública de colecciones publicadas con búsqueda y paginación.
- Cada colección muestra portada, título, descripción y conteo de recursos.
- El backoffice permite asignar portada y descripción a una colección.
- El backoffice permite agregar y quitar recursos de una colección.
- Solo `curator` y `admin` pueden gestionar colecciones.
- Los endpoints públicos devuelven datos reales de colecciones.

## Resultado de validación — 2026-03-29
- `bun test packages/db/src/repository.unit.test.ts` ✅
- `bun test apps/api/src/index.unit.test.ts apps/api/src/routes/admin.unit.test.ts` ✅
- `cd apps/frontend && bun test` ✅
- `cd apps/frontend && bun run build` ✅
- `bun run test` ✅ (`337 pass`, `0 fail`, cobertura de líneas `91.77%`)

## Observaciones
- La build frontend sigue generando la nueva ruta estática `/colecciones/index.html` correctamente.
- El detalle público queda servido por la misma experiencia de `/colecciones` con `slug` en query; la limitación responde al modo `static` actual de Astro y no a un fallo funcional de datos, permisos o UI.
