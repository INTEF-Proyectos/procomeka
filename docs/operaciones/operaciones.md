# Guía de Operaciones

Esta guía describe las tareas operativas rutinarias y la resolución de problemas para el administrador del sistema Procomeka.

## Procedimientos de Backup y Restauración

### Copia de seguridad de la base de datos
```bash
docker exec -t procomeka-db-1 pg_dumpall -c -U procomeka > dump_`date +%d-%m-%Y"_"%H_%M`.sql
```

### Copia de seguridad de archivos (Uploads)
Haga un backup del directorio configurado mediante `UPLOAD_STORAGE_DIR`:
```bash
tar -cvf uploads_backup.tar ./local-data/uploads
```

### Restauración
```bash
cat dump_XX.sql | docker exec -i procomeka-db-1 psql -U procomeka
```

## Monitorización y Health Checks

### Endpoints de Salud
- **API Health Check**: `GET /health` (Retorna 200 si el servidor está vivo).
- **Docker Health Checks**: Configurados para el servicio `db` en `docker-compose.yml`.

### Métricas de Sistema
Se recomienda monitorizar el consumo de CPU y RAM de los contenedores mediante `docker stats` o herramientas de terceros.

## Rotación de Logs

Docker gestiona la rotación de logs de forma nativa mediante el driver `json-file`. Configúrelo en `/etc/docker/daemon.json` para evitar que ocupen todo el espacio en disco:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

## Actualización de la Plataforma (Process of Upgrade)

1. **Obtener última versión**:
   ```bash
   git pull origin main
   ```
2. **Construir nuevas imágenes**:
   ```bash
   docker compose build
   ```
3. **Reiniciar servicios**:
   ```bash
   docker compose up -d
   ```

## Troubleshooting: problemas comunes y soluciones

- **Error de Conexión a DB**: Verifique que el contenedor `db` esté `healthy` con `docker ps`.
- **Fallos en Subida de Archivos**: Compruebe permisos de escritura en `UPLOAD_STORAGE_DIR` y espacio en disco.

## Gestión de usuarios y roles desde CLI

Utilice la herramienta CLI de administración:
```bash
# Listar usuarios
bun run --filter '@procomeka/cli' cli -- user-list

# Crear administrador
bun run --filter '@procomeka/cli' cli -- user-create --email admin@midominio.com --name "Admin Local" --role admin --password "mi-pass-seguro"
```
