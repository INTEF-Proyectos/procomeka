# Tablero de Estado Global (Agents Memory)

**⚠️ IMPORTANTE PARA TODOS LOS AGENTES:**
Debéis leer este archivo antes de comenzar cualquier tarea para entender el contexto global y el progreso del proyecto. Al finalizar una tarea, debéis actualizar vuestro progreso aquí.

## Fase Actual: Definición Inicial y Skills

- **Épica activa:** Ninguna (Fase de inicialización)
- **Agente en turno:** @.agents/skills/project-manager/SKILL.md (Orquestador pendiente de definir primera épica)

## ADRs Bloqueantes (Prioridad Alta)

Antes de escribir código de negocio, se deben resolver las siguientes decisiones arquitectónicas:

- [ ] **ADR-0002**: Framework HTTP para API (Pendiente de `@.agents/skills/evaluacion-tecnologica/SKILL.md`)
- [ ] **ADR-0003**: Framework Frontend (Pendiente de `@.agents/skills/evaluacion-tecnologica/SKILL.md`)
- [ ] **ADR-0004**: Base de datos principal (Pendiente de `@.agents/skills/evaluacion-tecnologica/SKILL.md`)
- [ ] **ADR-0005**: Motor de búsqueda (Pendiente de `@.agents/skills/evaluacion-tecnologica/SKILL.md`)

## Registro de Tareas Recientes

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| - | `Director de Producto` | Definición de visión y mapa de capacidades | Completado |
| - | `Project Manager` | Revisión de estructura y setup de entorno de agentes | Completado |

## Reglas de Actualización de este Tablero

1. Nunca borrar historial antiguo, solo añadir nuevas filas al registro.
2. Actualizar siempre la "Fase Actual" y el "Agente en turno" al traspasar responsabilidad.
3. Marcar las ADRs como `[x]` cuando sean aceptadas e incluir el enlace al archivo markdown.

## Actualización 2026-03-25 (Evaluación tecnológica frontend)

- Se completa la decisión de framework frontend en `docs/negocio/decisiones/0004-framework-frontend.md`.
- Resultado: Astro aceptado como framework frontend base (Fase 0), con enfoque de islas y guardrails de mantenibilidad/lock-in.
- Traspaso sugerido: `@.agents/skills/documentacion-y-roadmap/SKILL.md` para alinear numeración y estado de ADRs bloqueantes en este tablero.

| Fecha | Agente | Acción / Entregable | Estado |
|-------|--------|---------------------|--------|
| 2026-03-25 | `@.agents/skills/evaluacion-tecnologica` + `@.agents/skills/direccion-de-plataforma` | ADR-0004 Framework Frontend creada y aceptada | Completado |
