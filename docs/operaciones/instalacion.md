# Guía de Instalación y Despliegue

Esta guía detalla los pasos necesarios para desplegar Procomeka utilizando Docker.

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
   docker compose up -d
   ```

4. **Inicializar base de datos y semilla (opcional)**
   ```bash
   docker compose run --rm seed
   ```

## Catálogo de Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgres://user:pass@db:5432/procomeka` |
| `BETTER_AUTH_SECRET` | Secreto para firma de sesiones (32+ chars) | Obligatorio |
| `FRONTEND_URL` | URL del frontend para CORS | `http://localhost:4321` |
| `BETTER_AUTH_URL` | URL pública de la API para redirecciones de Auth | `http://localhost:3000` |
| `UPLOAD_STORAGE_DIR` | Directorio local para almacenamiento de archivos | `./local-data/uploads` |
| `OIDC_ENABLED` | Activar autenticación OIDC | `false` |

## Configuración de PostgreSQL

La base de datos se despliega como un servicio `db` en Docker Compose utilizando la imagen `postgres:17-alpine`. Los datos se persisten en un volumen llamado `pgdata`.

## Configuración de Almacenamiento

Los archivos subidos se guardan localmente en el directorio configurado mediante `UPLOAD_STORAGE_DIR`. Se recomienda montar un volumen dedicado para esta ruta en el servicio `api`.

## Configuración de Proveedores OIDC

Procomeka soporta OpenID Connect para login institucional. Requiere configurar `OIDC_ISSUER`, `OIDC_CLIENT_ID` y `OIDC_CLIENT_SECRET` en el archivo `.env`.
