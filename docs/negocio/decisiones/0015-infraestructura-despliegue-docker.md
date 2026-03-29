# ADR-0015 Infraestructura de Despliegue Docker (Evo1)

* Estado: Aceptado
* Fecha: 2026-03-31
* Agentes Implicados: [@.agents/skills/devops-sre]

## Contexto y Problema

El pliego CE01698/2023 (Evo1) exige la capacidad de despliegue desde cero mediante Docker y documentación completa para operadores. Es necesario formalizar la arquitectura de despliegue basada en los contenedores existentes para garantizar la portabilidad y el cumplimiento del contrato.

## Opciones Consideradas

* **Ejecución directa con Bun (Desarrollo):** Ligera pero no recomendada para producción debido a la falta de aislamiento y orquestación.
* **Docker Compose (Estandarización):** Permite orquestar la base de datos y la aplicación en una unidad reproducible, facilitando el despliegue "de cero".
* **Kubernetes:** Considerado para fases futuras si la escalabilidad lo requiere, pero descartado para Evo1 por complejidad innecesaria.

## Decisión

Se formaliza el uso de **Docker Compose** como la base de la infraestructura de despliegue para los entornos de desarrollo y producción de Evo1.

1.  **Imágenes:** Uso del `Dockerfile` raíz basado en `oven/bun` para la API y la CLI.
2.  **Base de Datos:** Servicio `db` con `postgres:17-alpine` y persistencia mediante volúmenes.
3.  **Orquestación:** Un solo archivo `docker-compose.yml` que define la red, los volúmenes y las dependencias entre servicios.
4.  **Carga de datos:** Servicio `seed` para inicialización automatizada.

## Consecuencias

### Positivas
* **Portabilidad:** Despliegue consistente en cualquier host con Docker.
* **Simplicidad:** Proceso de arranque de un solo paso (`docker compose up`).
* **Cumplimiento:** Satisface el requisito de despliegue "desde cero" del pliego.

### Negativas / Riesgos
* **Acoplamiento:** El flujo de despliegue depende de Docker Compose.

## Notas de Implementación

* La documentación de instalación y operación reside en `docs/operaciones/`.
* El despliegue se inicia mediante `docker compose up -d`.
