# Requirements — Feature Colecciones públicas y gestión editorial

## Fecha
2026-03-29

## Objetivo
Hacer operativas las colecciones como capacidad pública y editorial, con portada, descripción, conteo de recursos, detalle navegable y gestión interna de asociación y orden de recursos.

## Problema público o educativo
Sin colecciones públicas reales, el profesorado no puede descubrir agrupaciones temáticas curadas ni reutilizar secuencias de recursos relacionadas. Sin gestión editorial completa, la curación interna queda bloqueada en un CRUD superficial y no aporta valor de descubrimiento.

## Usuario principal beneficiado
- Profesorado y ciudadanía que exploran recursos publicados agrupados por contexto educativo.
- Curadores y administradores responsables de la organización y mantenimiento editorial de colecciones.

## Datos mínimos necesarios
- `title`
- `slug`
- `description`
- `coverImageUrl`
- `editorialStatus`
- Relación ordenable con recursos existentes
- Conteo de recursos publicados por colección
- Identidad visible del curador responsable

## Requisitos funcionales
- Sustituir en la navegación pública los placeholders "Artículos" e "Itinerarios" por una entrada única "Colecciones".
- Crear una experiencia pública de listado de colecciones publicadas con búsqueda y paginación.
- Mostrar en cada colección portada, título, extracto de descripción, número de recursos y curador responsable.
- Exponer el detalle público de una colección con su descripción completa y recursos asociados publicados.
- Completar el backoffice de colecciones con portada, descripción amplia y gestión de recursos asociados.
- Permitir agregar, quitar y reordenar recursos de una colección desde el backoffice.
- Implementar los endpoints públicos reales para listado y detalle de colecciones.
- Elevar el permiso mínimo de gestión de colecciones a `curator`.

## Requisitos no funcionales
- Accesibilidad WCAG 2.1 AA en vistas públicas y editoriales nuevas.
- Validación obligatoria con tests TypeScript y ejecución satisfactoria de `bun test`.
- Mantener consistencia entre API real, cliente HTTP, cliente preview y navegación por rol.
- No introducir dependencias nuevas ni mover código fuera de `apps/` y `packages/`.
