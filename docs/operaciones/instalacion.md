# Guía de Instalación y Despliegue

Esta guía detalla los pasos necesarios para desplegar Procomeka desde cero utilizando Docker.

## Requisitos del sistema

### Hardware
- **CPU**: Mínimo 2 cores (recomendado 4 cores).
- **RAM**: Mínimo 4 GB (recomendado 8 GB).
- **Almacenamiento**: Mínimo 20 GB de espacio libre (dependiendo del volumen de recursos educativos y uploads).

### Software
- **Docker**: Engine v24+
- **Docker Compose**: v2.20+
- **Sistema Operativo**: Linux (Ubuntu 22.04 LTS recomendado) o macOS.

### Red
- Puertos abiertos: 80 (HTTP), 443 (HTTPS).
- Acceso a internet para descarga de imágenes de registro (GHCR).

## Instalación paso a paso

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/intef-proyectos/procomeka.git
   cd procomeka
   ```

2. **Configurar variables de entorno**
   Copia el archivo de ejemplo y edítalo con tus credenciales:
   ```bash
   cp .env.example .env
   nano .env
   ```

3. **Desplegar con Docker Compose**
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

4. **Inicializar base de datos y semilla (opcional)**
   ```bash
   docker compose run --rm cli seed
   ```

## Catálogo de Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgres://user:pass@db:5432/procomeka` |
| `BETTER_AUTH_SECRET` | Secreto para firma de sesiones (32+ chars) | Obligatorio |
| `PUBLIC_URL` | URL pública de la aplicación (HTTPS) | Obligatorio |
| `FRONTEND_URL` | URL del frontend para CORS | Misma que `PUBLIC_URL` |
| `UPLOAD_STORAGE_DIR` | Directorio local para almacenamiento de archivos | `/app/uploads` |
| `OIDC_ENABLED` | Activar autenticación OIDC | `false` |
| `SMTP_HOST` | Host del servidor SMTP | - |
| `SMTP_PORT` | Puerto del servidor SMTP | - |
| `UPLOAD_S3_ENABLED` | Activar almacenamiento en S3 | `false` |
| `UPLOAD_S3_BUCKET` | Nombre del bucket S3 | - |

## Configuración de PostgreSQL

En producción, el contenedor de base de datos utiliza volúmenes Docker para persistencia. Se recomienda configurar backups periódicos del volumen `pgdata`.

## Configuración de Almacenamiento

Por defecto, los archivos subidos se guardan en el volumen `uploads` dentro de `/app/uploads`. Para producción a escala, se recomienda activar S3 configurando las variables `UPLOAD_S3_*`.

## Configuración de SMTP

Para que el sistema envíe emails de verificación de cuenta y recuperación de contraseña, configure los parámetros `SMTP_*` en su archivo `.env`.

## Configuración de Proveedores OIDC

Procomeka soporta OpenID Connect para login institucional. Requiere configurar `OIDC_ISSUER`, `OIDC_CLIENT_ID` y `OIDC_CLIENT_SECRET`.
