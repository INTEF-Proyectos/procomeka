# Caso de análisis: Contexto de Procomún Legacy

> **Tipo:** Caso (análisis sin implementación)
> **Fecha de inicio:** 2026-03-27
> **Issue:** #47
> **Fase del roadmap relacionada:** Fase 2 — Migración y calidad

## Objetivo

Documentar el estado actual del Espacio Procomún Educativo del INTEF a partir de fuentes públicas, como base para planificar la migración de datos y funcionalidades a procomeka.

## Contenido

| Documento | Descripción |
|-----------|-------------|
| [estado-del-arte.md](estado-del-arte.md) | Análisis del stack tecnológico, componentes funcionales, cifras y arquitectura de Procomún |
| [requisitos-funcionales.md](requisitos-funcionales.md) | Requisitos funcionales observados, mapeo a procomeka y gaps identificados |
| [pliegos/README.md](pliegos/README.md) | Información contractual pública y guía para obtener los pliegos técnicos |

## Fuentes utilizadas

1. **Contratación pública** — Expediente CE01698/2023 ([Gobierto](https://contratos.gobierto.es/contratos/4830730?locale=ca))
2. **Noticia oficial INTEF** — [Procomún: nueva versión actualizada y mejorada](https://intef.es/Noticias/procomun-nueva-version-actualizada-y-mejorada/) (24/04/2023)
3. **Observación directa** — [procomun.intef.es](https://procomun.intef.es) (marzo 2026)
4. **Fuente complementaria** — [Web corporativa ICA](https://www.grupoica.com/-/ica-encargada-del-mantenimiento-adaptativo-evolutivo-y-correctivo-para-el-espacio-procomun-educativo-) (no oficial)

## Resumen de hallazgos clave

- **Stack legacy:** Drupal + Matomo + Docker + apps nativas iOS/Android
- **Volumen de datos:** ~78.800 ODEs, ~100.000 multimedia, ~109.700 usuarios, ~23.500 artículos, 371 itinerarios, 55 comunidades
- **3 subsistemas:** Procomún central, Agrega3 (SCORM/LOM), Banco Multimedia
- **6 gaps funcionales críticos** respecto a procomeka: Banco Multimedia como entidad propia, eXeLearning online, comunidades, artículos, app móvil, i18n de interfaz

## Siguiente paso

Obtener el Pliego de Prescripciones Técnicas (PPT) del expediente CE01698/2023 para cruzar los requisitos formales con los observados.
