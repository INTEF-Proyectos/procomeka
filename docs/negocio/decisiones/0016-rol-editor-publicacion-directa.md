# ADR-0016 Nuevo rol "editor" con publicación directa

* Estado: Aceptado
* Fecha: 2026-03-31
* Agentes Implicados: [@.agents/skills/empresa-y-producto], [@.agents/skills/arquitectura-solucion]

## Contexto y Problema

El sistema RBAC define 4 roles jerárquicos (reader=0, author=1, curator=2, admin=3). Un author siempre debe pasar por la cola de revisión (`draft → review → published`), lo que obliga a que un curator apruebe cada recurso. No existe un perfil intermedio que permita crear contenido y publicarlo directamente sin revisión editorial.

Casos de uso que no están cubiertos:
- **Docentes de confianza** que publican contenido frecuentemente y no necesitan supervisión en cada recurso.
- **Equipos editoriales internos** que crean contenido verificado de origen.

## Opciones Consideradas

* **Opción 1: Flag booleano `canPublishDirectly` en el usuario.** Flexible pero rompe el modelo de roles jerárquico y complica la autorización.
* **Opción 2: Nuevo rol `editor` entre author y curator.** Mantiene la jerarquía, es extensible y coherente con el modelo RBAC existente.
* **Opción 3: Permiso granular `resource:publish_own` asignable a cualquier rol.** Máxima flexibilidad pero requiere refactorizar todo el sistema de permisos hacia permisos atómicos.

## Decisión

**Opción 2**: Crear un rol `editor` con nivel jerárquico 2, reordenando la jerarquía a enteros (reader=0, author=1, editor=2, curator=3, admin=4).

El editor:
- Hereda todas las capacidades del author (crear, leer, actualizar recursos y colecciones propias).
- Puede publicar directamente sus propios recursos (`draft → published`) sin pasar por `review`.
- **No** puede curar recursos ajenos ni aprobar/rechazar en la cola de revisión.
- **No** puede archivar ni gestionar el ciclo de vida de recursos publicados (eso sigue siendo curator+).

La transición `draft → published` con `minRole: "editor"` se añade a `TRANSITION_RULES`. La validación de propiedad del recurso ya la garantiza `canManageResource()` en el endpoint de cambio de estado.

### Nota sobre el rol reader

El rol `reader` (nivel 0) representa acceso público/no autenticado. El rol mínimo asignable a una cuenta registrada es `author`. Se mantiene `reader` en el sistema por compatibilidad con Better Auth (`defaultRole`) y para representar el nivel de acceso de visitantes anónimos.

## Consecuencias

### Positivas
* Desbloquea flujos de publicación rápida para usuarios de confianza sin comprometer la cola de revisión.
* No requiere migración de base de datos (el campo `role` es varchar, no enum).
* Mantiene compatibilidad total con el modelo de roles jerárquico existente.
* La jerarquía se reordena a enteros limpios (0-4), facilitando futuros roles intermedios.

### Negativas / Riesgos
* Duplicación de definiciones de roles entre backend (`validation.ts`) y frontend (`ResourceEditorIsland.tsx`, `shared-utils.ts`) — se debe mantener sincronizado manualmente.

## Notas de Implementación

Archivos modificados:
- `packages/db/src/validation.ts` — `ROLE_LEVELS` + `TRANSITION_RULES`
- `apps/api/src/auth/permissions.ts` — nuevo rol `editor`
- `apps/api/src/auth/config.ts` — registro en Better Auth admin plugin
- `apps/frontend/src/lib/shared-utils.ts` — `ROLE_LEVELS` frontend
- `apps/frontend/src/islands/resources/ResourceEditorIsland.tsx` — transiciones y labels
- `apps/frontend/src/islands/admin/AdminUsersSection.tsx` — selector de roles
- `packages/db/src/seed-data.ts` — usuario demo editor
- Tests actualizados en `permissions.unit.test.ts` y `validation-transitions.unit.test.ts`
