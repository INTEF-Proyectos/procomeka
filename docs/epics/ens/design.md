# Diseño: Cumplimiento ENS

## Categorización ENS (Propuesta)
Dada la naturaleza de los recursos (recursos educativos públicos) y el volumen de usuarios (+109k), se propone una categoría **MEDIA**.

| Dimensión | Nivel | Justificación |
|-----------|-------|---------------|
| Disponibilidad | Media | El sistema debe estar disponible para el profesorado, pero no es crítico para la vida humana. |
| Autenticidad | Media | Importante asegurar que el autor del recurso es quien dice ser. |
| Integridad | Media | Los recursos educativos deben ser veraces y no haber sido alterados. |
| Confidencialidad | Media | Gestión de datos personales de docentes y posiblemente alumnos. |
| Trazabilidad | Media | Necesario saber quién ha publicado o modificado qué contenido. |

## Arquitectura de Seguridad
- **Identificación y Autenticación**: Basada en Better Auth (ADR-0007). Soporte OIDC para integración institucional.
- **Control de Acceso**: RBAC (Role Based Access Control) ya implementado (ADR-0008).
- **Análisis Estático**: GitHub CodeQL integrado en el workflow de CI.
- **Auditoría**:
    - Ampliación de `activity_events` para cubrir operaciones CRUD críticas.
    - Implementación de middleware de logging para accesos API (Hono logger + almacenamiento en DB/Logs).
- **Cifrado**: TLS en tránsito. Cifrado de datos sensibles en reposo (gestionado por el proveedor de Cloud/DB).

## Registro de Actividad
Se utilizará la tabla `activity_events` existente, asegurando que se registren:
- Inicios/cierres de sesión (a través de hooks de Better Auth o middleware).
- Operaciones CRUD sobre recursos, colecciones y usuarios.
- Cambios de privilegios.
- Intentos de acceso fallidos (si es posible capturarlos desde Better Auth).

## Protección de Datos (RGPD)
- Minimización de datos en el esquema de usuarios.
- Auditoría de acceso a datos personales.
- Procedimiento de supresión (ya iniciado con `deletedAt` en recursos, extender a usuarios si es necesario).
