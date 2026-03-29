# Design — Feature Colecciones públicas y gestión editorial

## Fecha
2026-03-29

## Decisiones de diseño
- Resolver la persistencia de colecciones en `packages/db` en lugar de mantener stubs en API pública y preview.
- Reutilizar el CRUD React existente de colecciones y ampliarlo con un subflujo de recursos asociados en la misma pantalla, evitando una vista editorial separada.
- Mantener la navegación pública de colecciones en Astro + island React con hidratación `client:load`, siguiendo el patrón ya usado en catálogo y backoffice.
- Unificar reglas de RBAC en backend, navegación y dashboard para que `author` deje de ver o gestionar colecciones editoriales.

## Solución técnica
- `packages/db/src/repository.ts`
  - Amplía listado y detalle de colecciones con `coverImageUrl`, `curatorName`, `resourceCount` e `isOrdered`.
  - Añade `getCollectionBySlug()` y `reorderCollectionResource()`.
  - Enriquece `listCollectionResources()` con metadatos necesarios para el backoffice y el detalle público.
- `apps/api/src/routes/public.ts`
  - Sustituye stubs por endpoints reales `GET /api/v1/collections` y `GET /api/v1/collections/:slug`.
- `apps/api/src/routes/admin/collections.ts`
  - Limita la gestión a `curator` y `admin`.
  - Añade endpoints para listar, asociar, eliminar y reordenar recursos de una colección.
- `apps/frontend/src/islands/crud/CollectionsCrudIsland.tsx`
  - Integra formulario, edición y gestión de recursos asociados en una sola island.
- `apps/frontend/src/islands/collections/PublicCollectionsIsland.tsx`
  - Implementa la experiencia pública de listado y detalle sobre la ruta `/colecciones`.

## Impacto transversal
- Búsqueda y descubrimiento
  - Las colecciones pasan a ser un recurso curado visible en home y navegación principal.
- Metadatos y curación
  - La portada y la descripción mejoran legibilidad editorial y reutilización.
- Moderación y permisos
  - La curación de colecciones queda alineada con el rol `curator`.
- Accesibilidad
  - Formularios, feedback y navegación mantienen etiquetas, estados ARIA y controles por teclado.

## Riesgos abiertos
- La arquitectura actual de Astro en salida estática no permite publicar un detalle dinámico literal en `/colecciones/:slug` sin introducir `getStaticPaths` con inventario cerrado o cambiar el modo de salida. La experiencia pública de detalle queda resuelta dentro de `/colecciones?slug=...`.
- La portada se resuelve por URL; no existe todavía un flujo específico de upload/selección de imagen para colecciones distinto al uso de una URL.
