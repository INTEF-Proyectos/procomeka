# Tasks — Feature Colecciones públicas y gestión editorial

## Fecha
2026-03-29

## Estado
Completado con desviación controlada en routing público

## Implementación
- [x] Exponer colecciones publicadas reales en la API pública con listado paginado y detalle por slug.
- [x] Ampliar el repositorio de datos con portada, curador, conteo de recursos y reordenación.
- [x] Elevar el permiso mínimo de gestión de colecciones a `curator`.
- [x] Sustituir los enlaces públicos placeholder por la sección `Colecciones`.
- [x] Crear la ruta pública `/colecciones` con búsqueda, paginación y vista de detalle navegable.
- [x] Añadir al backoffice campos de portada y descripción amplia para colecciones.
- [x] Añadir al backoffice la gestión de agregar, quitar y reordenar recursos asociados.
- [x] Sincronizar dashboard, sidebar y navegación compartida con el nuevo RBAC.

## Testing
- [x] Añadir cobertura TypeScript en `packages/db` para slug público y reordenación.
- [x] Añadir cobertura API para endpoints públicos y RBAC/admin de colecciones.
- [x] Añadir cobertura frontend para navegación pública y shell de colecciones.
- [x] Ejecutar `bun run test` en raíz y registrar resultado satisfactorio.
- [x] Ejecutar `cd apps/frontend && bun run build` y registrar resultado satisfactorio.

## Desviación documentada
- [x] El detalle público se expone dentro de `/colecciones?slug=...` en lugar de un path literal `/colecciones/:slug` por limitación del modo estático actual de Astro.
