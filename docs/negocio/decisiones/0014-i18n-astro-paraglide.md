# ADR-0014 Sistema de internacionalización con Astro i18n + Paraglide JS

* Estado: Aceptado
* Fecha: 2026-03-29
* Agentes Implicados: [@.agents/skills/frontend-ux-accesibilidad], [@.agents/skills/evaluacion-tecnologica]

## Contexto y Problema

El Procomún actual soporta 5 idiomas (Español, Inglés, Catalán, Gallego y Vasco). La nueva plataforma necesita mantener esta capacidad multilingüe con un selector de idioma visible y URLs localizadas.

Se evaluaron varias opciones: astro-i18next (incompatible con Astro 5), @astrolicious/i18n (lock-in de routing), i18next + react-i18next (runtime pesado, sin type-safety), y Paraglide JS (compilador con type-safety).

## Opciones Consideradas

* **astro-i18next**: Descartado. Incompatible con Astro 5, sin mantenimiento desde 2024.
* **@astrolicious/i18n**: Descartado. Reemplaza el routing nativo de Astro, creando lock-in.
* **i18next + react-i18next**: Ecosistema maduro pero runtime pesado (40-50 KB), sin tree-shaking de mensajes, sin type-safety por defecto, y requiere wiring separado para .astro vs React.
* **Astro i18n nativo + Paraglide JS v2**: Compilador que genera funciones TypeScript tree-shakeable por mensaje.

## Decisión

**Astro built-in i18n** para routing + **Paraglide JS v2** para traducciones.

Paraglide compila `messages/*.json` a funciones TypeScript. La misma API `m.clave()` funciona en `.astro` y en React islands. El routing de Astro maneja los prefijos de URL: `/` para español (default), `/en/`, `/ca/`, `/gl/`, `/eu/`.

## Consecuencias

### Positivas
* Hasta 70% menos bundle que soluciones runtime — cada mensaje se compila a una función tree-shakeable
* Type-safety total: claves faltantes o parámetros incorrectos dan error en compilación
* API unificada: mismo `m.clave()` en `.astro` y en React islands
* Zero JS runtime en páginas sin islands interactivos
* Compatible con `output: "static"` y el modo preview (GitHub Pages + PGlite)

### Negativas / Riesgos
* Las páginas localizadas requieren archivos `[locale]/*.astro` duplicados para cada página pública
* El bridge SSR (`setSsrLocale`) requiere llamada explícita en cada página/layout para que los mensajes resuelvan al locale correcto
* Paraglide v2 no tiene adaptador oficial para Astro — la integración es manual via Vite plugin

## Notas de Implementación

* Configuración en `astro.config.ts`: bloque `i18n` + `paraglideVitePlugin` con strategy `["url", "baseLocale"]`
* Mensajes en `messages/{locale}.json` — formato plugin-message-format de inlang
* Bridge locale en `src/lib/i18n.ts` con `overwriteGetLocale` + `setSsrLocale`
* Selector de idioma integrado en `PublicNavIsland.tsx` como componente `LanguageSwitcher`
* Las páginas admin quedan solo en español en esta primera fase
