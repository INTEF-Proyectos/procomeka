# ADR-0004 Framework frontend para la plataforma pública y editorial

* Estado: Aceptado
* Fecha: 2026-03-25
* Agentes Implicados: [@.agents/skills/evaluacion-tecnologica/SKILL.md, @.agents/skills/direccion-de-plataforma/SKILL.md]

## Contexto y Problema

En Fase 0 del sustituto de Procomún se debe seleccionar el framework frontend base para:
- la experiencia pública de descubrimiento de recursos,
- la experiencia editorial de curación,
- y futuras capacidades de interoperabilidad en UI.

El stack no negociable es TypeScript (strict) + Bun. La decisión debe priorizar accesibilidad, rendimiento, mantenibilidad y bajo lock-in, minimizando complejidad operativa y deuda técnica temprana.

## Opciones Consideradas

* React
* Astro
* Svelte
* Lit (Web Components)
* Vue

### Matriz comparativa (criterios del skill)

Escala: 1 (peor) a 5 (mejor). Coste de integración: 5 = menor coste.

| Criterio | React | Astro | Svelte | Lit | Vue |
|---|---:|---:|---:|---:|---:|
| Ajuste funcional | 5 | 4 | 4 | 3 | 4 |
| Compatibilidad Bun | 4 | 4 | 4 | 5 | 4 |
| Madurez | 5 | 4 | 4 | 4 | 5 |
| Rendimiento | 4 | 5 | 5 | 5 | 4 |
| Coste de integración | 4 | 4 | 3 | 2 | 4 |
| Lock-in (bajo = mejor) | 3 | 4 | 4 | 5 | 4 |
| Licencia | 5 | 5 | 5 | 5 | 5 |
| Operación (self-hosted/simple) | 4 | 5 | 4 | 4 | 4 |
| **Total** | **34** | **35** | **33** | **34** | **34** |

### Evaluación cualitativa por opción

#### React
**Pros**
- Ecosistema y comunidad más amplios; alta empleabilidad y disponibilidad de perfiles.
- Excelente cobertura de librerías de accesibilidad, testing y diseño de sistemas.
- Integración natural con arquitecturas híbridas (SSR/SPA/islas) mediante frameworks.

**Contras**
- Riesgo de lock-in indirecto al ecosistema React (routing, estado, data fetching).
- Mayor probabilidad de sobreingeniería si no se delimitan patrones desde el inicio.
- Coste de bundle y complejidad pueden crecer rápidamente sin gobernanza.

#### Astro
**Pros**
- Muy buen rendimiento por defecto (islas + envío mínimo de JS).
- Excelente ajuste para contenido público, catálogo y páginas informativas.
- Menor coste operativo para servir frontend estático o híbrido.

**Contras**
- Para backoffice editorial altamente interactivo puede requerir más decisiones de composición.
- Dependencia de integración con framework UI para componentes complejos.

#### Svelte
**Pros**
- Rendimiento alto y DX muy buena.
- Menor overhead conceptual en componentes.
- Potencial de bundles pequeños.

**Contras**
- Ecosistema menor que React/Vue para necesidades enterprise/editoriales complejas.
- Mayor riesgo de dependencia de conocimiento específico del equipo.

#### Lit (Web Components)
**Pros**
- Lock-in muy bajo: estándar web nativo y alta portabilidad.
- Excelente reutilización transversal de componentes entre contextos.
- Rendimiento alto en componentes aislados.

**Contras**
- Coste de integración más alto para construir una app completa (routing, estado, SSR, DX).
- Curva para equipos no habituados a Web Components en arquitectura de producto completa.

#### Vue
**Pros**
- Framework equilibrado en DX, rendimiento y curva de aprendizaje.
- Ecosistema maduro con buenas opciones para apps públicas y administrativas.
- Menor fricción conceptual que React para muchos equipos.

**Contras**
- Menor disponibilidad de talento en algunos mercados frente a React.
- Riesgo moderado de lock-in al stack Vue (router/store/SSR).

## Decisión

Se **adopta Astro como framework frontend base de plataforma**, con estrategia de componentes interactivos mediante “islas” y posibilidad de usar React solo donde aporte valor claro.

Justificación principal:
1. Maximiza rendimiento por defecto para el caso de uso principal (descubrimiento y consulta pública).
2. Favorece accesibilidad y mantenibilidad al reducir JS cliente y complejidad inicial.
3. Mantiene lock-in relativamente bajo y buena reversibilidad arquitectónica.
4. Encaja con la directriz de Dirección de Plataforma: solución simple, reversible y con menor carga operativa en fase temprana.

## Consecuencias

### Positivas
* Menor tiempo hasta una experiencia pública rápida y estable, alineada con SEO y Core Web Vitals.
* Base adecuada para crecimiento incremental: contenido estático, híbrido y componentes interactivos bajo demanda.
* Menor complejidad operativa inicial en despliegue y coste de infraestructura frontend.
* Facilita control de rendimiento desde arquitectura (islas como frontera explícita).

### Negativas / Riesgos
* Riesgo de fragmentación tecnológica si se mezclan demasiados frameworks en islas sin gobernanza.
* En backoffice editorial complejo podría aparecer deuda si Astro no se acota como capa de shell/composición.
* Dependencia de disciplina de arquitectura para evitar “escape” a SPA completa no planificada.
* Posible curva de aprendizaje inicial del equipo en patrones de islas e hidratación parcial.

## Recomendación final, riesgos y consecuencias de plataforma

Recomendación final: **Astro como estándar por defecto** para frontend público y shell de experiencia editorial, con guardrails de arquitectura para garantizar bajo lock-in y mantenibilidad.

Riesgos de plataforma a vigilar:
1. **Lock-in de componentes interactivos**: limitar acoplamiento a librerías específicas de estado/routing en cliente.
2. **Deriva de complejidad**: establecer límites de hidratación y presupuestos de JS desde el inicio.
3. **Consistencia UX/A11y**: definir design system y reglas WCAG comunes para páginas e islas.
4. **Operación multicanal**: separar claramente frontend público y herramientas editoriales para escalar sin fricción.

## Notas de Implementación

1. Crear guía de arquitectura frontend en `docs/` con:
   - política de islas,
   - criterios para cuándo usar componentes interactivos,
   - presupuestos de rendimiento y accesibilidad.
2. Definir un “baseline técnico”:
   - TypeScript strict,
   - reglas lint/format,
   - testing de componentes y smoke tests de rutas.
3. Establecer gobernanza de dependencias UI para evitar lock-in accidental.
4. Diseñar interfaz entre frontend y API pensando en interoperabilidad y versionado temprano.
5. Revisión de esta ADR al cerrar Fase 1 o si:
   - el backoffice supera umbral alto de interactividad,
   - no se cumplen objetivos de rendimiento/a11y,
   - o el coste de mantenimiento real excede lo estimado.
