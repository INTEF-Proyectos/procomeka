# ADR-0015 Infraestructura de Despliegue Docker y Operaciones (Evo1)

* Estado: Aceptado
* Fecha: 2026-03-31
* Agentes Implicados: [@.agents/skills/devops-sre]

## Contexto y Problema

El pliego CE01698/2023 (Evo1) exige la capacidad de despliegue desde cero mediante Docker y documentación completa para operadores. Aunque existía una base incipiente de Dockerización para desarrollo, era necesario formalizar una configuración de producción (incluyendo proxy inverso, almacenamiento escalable y correos transaccionales) que permitiera la entrega del sistema.

## Opciones Consideradas

* **Ejecución directa con Bun (Desarrollo):** Rápida y ligera pero insuficiente para entornos aislados de producción.
* **Docker Compose (Estandarización):** Permite orquestar base de datos, API, frontend y proxy en una sola unidad reproducible.
* **Kubernetes:** Sobredimensionado para los requisitos actuales de Evo1, aunque se deja la puerta abierta mediante imágenes Docker estándar.

## Decisión

Se opta por una infraestructura basada en **Docker Compose** con las siguientes características:

1.  **Dockerización por servicio:** Dockerfiles específicos y optimizados para `apps/api` (Hono/Bun), `apps/frontend` (Astro/Nginx) y `apps/cli` (Bun).
2.  **Proxy Inverso:** Inclusión de un servicio `proxy` con Nginx para gestionar el enrutado, terminación TLS (preparado) y rate limiting básico.
3.  **Persistencia:** Uso de volúmenes Docker para PostgreSQL (`pgdata`) y almacenamiento local de archivos (`uploads`).
4.  **Almacenamiento Escalable (S3):** Implementación de soporte nativo para buckets S3 en la API mediante `@tus/s3-store`.
5.  **Emails Transaccionales:** Configuración de SMTP mediante `nodemailer` para comunicaciones del sistema (verificación, recuperación).
6.  **Observability:** Implementación de endpoints `/health` (liveness) y `/ready` (readiness con comprobación de DB).
7.  **Documentación Operativa:** Creación de guías de instalación, operaciones y administración en `docs/operaciones/`.

## Consecuencias

### Positivas
* **Portabilidad:** Despliegue reproducible "de cero" en cualquier entorno Linux/macOS.
* **Escalabilidad:** Separación clara de responsabilidades (API vs Frontend vs DB).
* **Cumplimiento Contractual:** Satisface los requisitos de Evo1 del pliego CE01698/2023.
* **Seguridad:** Aislamiento de servicios y control de tráfico centralizado en el proxy.

### Negativas / Riesgos
* **Complejidad:** El stack Docker añade una capa extra sobre el desarrollo nativo con Bun.
* **Mantenimiento:** Requiere gestionar actualizaciones de imágenes base (Bun 1.2.14, Nginx 1.27.4-alpine).

## Notas de Implementación

* El despliegue de desarrollo sigue siendo `docker-compose.yml` (con construcción desde código).
* El despliegue de producción usa `docker-compose.prod.yml` (orientado a imágenes pre-construidas en GHCR).
* Las variables de entorno críticas se detallan en `.env.example`.
