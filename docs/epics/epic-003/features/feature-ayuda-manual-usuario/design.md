# Design — Feature Ayuda y Manual de Usuario

## Fecha
2026-03-29

## Decisiones de diseño
- Centralizar el contenido y los enlaces de ayuda en `apps/frontend/src/lib/help-content.ts` para reutilizarlos desde layout, sidebar, tests y página Astro.
- Mantener la ayuda pública en Astro (`apps/frontend/src/pages/ayuda.astro`) para servir HTML accesible sin depender de hidratación.
- Añadir acceso a ayuda en dos cromos reales del producto:
  - `PublicLayout.astro` para el header/footer públicos.
  - `PublicNavIsland.tsx` para el acceso visible también durante la carga del estado de sesión y en móvil.
- Añadir ayuda contextual en el backoffice real (`AdminSidebar.tsx`) y al mismo tiempo sincronizar `backoffice-nav.ts` para no dejar la navegación legacy desalineada.

## Datos mínimos necesarios
- Identificador de sección (`id`) para permitir enlaces con anclas.
- Título, descripción e items accionables por sección.
- Mapeo explícito de enlaces del footer a secciones reales (`contacto`, `mapa-web`, `faq`).

## Impacto transversal
- Búsqueda y descubrimiento: explica filtros y facetas, reduciendo fricción de entrada.
- Metadatos y moderación: detalla qué mínimos debe completar un autor y cómo funciona la revisión.
- Accesibilidad: índice semántico, artículos con encabezados, `scroll-margin-top` y enlaces visibles por teclado.

## Riesgos abiertos
- El canal institucional de soporte todavía no está modelado como entidad o configuración editable; la página documenta el proceso, pero no sustituye un sistema de ticketing.
