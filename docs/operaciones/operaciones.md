# Guía de Operaciones

Esta guía describe las tareas operativas rutinarias y la resolución de problemas para el administrador del sistema Procomeka.

## Procedimientos de Backup y Restauración

### Copia de seguridad de la base de datos
```bash
docker exec -t procomeka-db-1 pg_dumpall -c -U procomeka > dump_`date +%d-%m-%Y"_"%H_%M`.sql
```

### Copia de seguridad de archivos (Uploads)
Si no usa S3, haga un backup del volumen `uploads`:
```bash
tar -cvf uploads_backup.tar /var/lib/docker/volumes/procomeka_uploads/_data
```

### Restauración
```bash
cat dump_XX.sql | docker exec -i procomeka-db-1 psql -U procomeka
```

## Monitorización y Health Checks

### Endpoints de Salud
- **API Health Check**: `GET /health` (Retorna 200 si el servidor está vivo).
- **Docker Health Checks**: Configurados internamente en el `docker-compose.prod.yml`.

### Métricas de Sistema
Se recomienda el uso de Prometheus y Grafana para monitorizar el consumo de CPU, RAM y latencia de base de datos.

## Rotación de Logs

Docker gestiona la rotación de logs de forma nativa mediante el driver `json-file`. Configúrelo en `/etc/docker/daemon.json`:
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
2. **Descargar nuevas imágenes**:
   ```bash
   docker compose -f docker-compose.prod.yml pull
   ```
3. **Reiniciar servicios**:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```
4. **Ejecutar migraciones (si aplica)**:
   ```bash
   docker compose run --rm cli migrate
   ```

## Troubleshooting: problemas comunes y soluciones

- **Error de Conexión a DB**: Verifique que el contenedor `db` esté `healthy` con `docker ps`.
- **Fallos en Subida de Archivos**: Compruebe permisos del volumen `uploads` y el espacio en disco.
- **Sesiones caducadas prematuramente**: Verifique que la variable `BETTER_AUTH_SECRET` sea idéntica en todos los nodos si usa balanceo de carga.

## Gestión de usuarios y roles desde CLI

Utilice el contenedor `cli` para tareas administrativas:
```bash
# Listar usuarios
docker compose run --rm cli user-list

# Crear administrador
docker compose run --rm cli user-create --email admin@midominio.com --name "Admin Local" --role admin --password "mi-pass-seguro"
```
