# Análisis de Riesgos (ENS) - Resumen

## 1. Identificación de Activos
- **Datos**: Datos de usuarios, recursos educativos, metadatos, logs de auditoría.
- **Servicios**: API REST, Frontend Web, Editor eXeLearning.
- **Software**: Bun, Hono, Astro, Drizzle ORM, PGlite/Postgres.
- **Infraestructura**: GitHub Actions, Contenedores Docker.

## 2. Identificación de Amenazas
- **Acceso no autorizado**: Robo de credenciales, escalada de privilegios.
- **Denegación de servicio**: Ataques a la API o al servidor de archivos.
- **Inyección de código**: Vulnerabilidades en el código de la API.
- **Fuga de datos**: Exposición accidental de logs o base de datos.
- **Alteración de contenido**: Modificación maliciosa de recursos educativos.

## 3. Valoración de Riesgos
Considerando la categoría **MEDIA**, el riesgo residual aceptable es bajo.

| Amenaza | Probabilidad | Impacto | Riesgo |
|---------|--------------|---------|--------|
| Acceso no autorizado | Media | Alto | Alto |
| Inyección de código | Baja | Alto | Medio |
| Fuga de datos | Baja | Alto | Medio |
| Denegación de servicio | Media | Medio | Medio |
| Alteración de contenido | Baja | Medio | Bajo |

## 4. Medidas de Mitigación
- **Autenticación**: Uso de Better Auth con soporte OIDC.
- **Autorización**: Middleware de RBAC (Role Based Access Control).
- **Auditoría**: Middleware de logging de API y registro de actividad `activity_events`.
- **Análisis Estático**: CodeQL en CI para detectar inyecciones y vulnerabilidades.
- **Gestión de Parches**: Dependabot para dependencias.
- **Comunicaciones**: Forzar uso de HTTPS/TLS.
