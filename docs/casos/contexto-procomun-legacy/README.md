# Caso de análisis: Contexto de Procomún Legacy

> **Tipo:** Caso (análisis sin implementación)
> **Fecha de inicio:** 2026-03-27
> **Issue:** #47
> **Fase del roadmap relacionada:** Fase 2 — Migración y calidad

## Objetivo

Documentar el estado actual del Espacio Procomún Educativo (Procomún – Agrega3) del INTEF, como base para planificar la migración de datos y funcionalidades a procomeka.

## Contenido

| Documento | Descripción |
|-----------|-------------|
| [estado-del-arte.md](estado-del-arte.md) | Arquitectura técnica confirmada (Drupal 9.4.8, Agrega3/Java, ElasticSearch 7.17.2, MariaDB, Xamarin), componentes, cifras y problemas conocidos |
| [requisitos-funcionales.md](requisitos-funcionales.md) | Requisitos funcionales observados (RF-01 a RF-13) + requisitos formales del contrato (F1, Evo1-Evo10) + mapeo a procomeka + gaps de migración |
| [pliegos/](pliegos/) | 5 documentos contractuales PDF + índice con datos del expediente CE01698/2023 |

## Fuentes utilizadas

1. **Pliego oficial** — Invitación a la Licitación del contrato CE01698/2023 (50 páginas, ANEXO I-VII) — **fuente primaria**
2. **Anuncio de adjudicación** — Plataforma de Contratación del Sector Público (11/07/2023)
3. **Observación directa** — [procomun.intef.es](https://procomun.intef.es) (marzo 2026)
4. **Noticia oficial INTEF** — [Procomún: nueva versión actualizada y mejorada](https://intef.es/Noticias/procomun-nueva-version-actualizada-y-mejorada/) (24/04/2023)
5. **Fuente complementaria** — [Web corporativa ICA](https://www.grupoica.com/-/ica-encargada-del-mantenimiento-adaptativo-evolutivo-y-correctivo-para-el-espacio-procomun-educativo-) (no oficial)

## Resumen de hallazgos clave

- **Stack confirmado:** Drupal 9.4.8 + MariaDB + ElasticSearch 7.17.2 + Java 1.8/Spring Boot 2.02 + Xamarin 5 + Matomo
- **Volumen de datos:** ~78.800 ODEs, ~100.000 multimedia, ~109.700 usuarios, ~23.500 artículos, 371 itinerarios, 55 comunidades
- **4 subsistemas:** Frontal web (Drupal), Agrega3 (Java/ES/Kibana), eXeOnline, App móvil (Xamarin)
- **Problemas conocidos:** código fuente de Agrega3webadmin perdido, inconsistencias Solr→ES, VM de 2018 sin documentación, cuello de botella NFS, colecciones acopladas a metadatos
- **Cambios de tecnología para migración:** MariaDB→PostgreSQL, ElasticSearch→PG full-text, Java/Spring Boot→TypeScript/Hono, Drupal→Astro, Xamarin→decisión pendiente

## Siguiente paso

Diseñar el plan ETL detallado con mapeo de esquemas MariaDB/Drupal → PostgreSQL/procomeka.
