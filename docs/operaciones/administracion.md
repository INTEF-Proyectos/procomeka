# Guía de Administración

Esta guía describe el funcionamiento del panel de administración y el flujo editorial para los curadores de Procomeka.

## Panel de administración: funcionalidades y acceso

El panel está disponible en `/admin` tras autenticarse con el rol `admin` o `curator`. Sus funciones incluyen:
- Gestión de usuarios y roles.
- Moderación de contenidos (revisión de recursos).
- Gestión de comentarios y ratings.
- Configuración global del sistema.

## Gestión editorial: flujo de publicación

1. **Creación**: El autor sube un recurso (borrador).
2. **Revisión**: El curador recibe una notificación de nuevo contenido.
3. **Curación**: El curador revisa metadatos, licencias y calidad del objeto.
4. **Publicación**: El curador aprueba el recurso y lo hace público.
5. **Rechazo**: Si el recurso no cumple con los criterios, el curador lo rechaza con feedback para el autor.

## Importación de datos (CSV, OAI-PMH)

### Importación masiva desde CSV
Utilice la herramienta CLI para importar múltiples recursos:
```bash
bun run --filter '@procomeka/cli' cli -- import-csv --file /app/import/recursos.csv
```

### Cosecha OAI-PMH
Configuración del servidor para ser cosechado por terceros o actuar como cliente de otros repositorios. El endpoint se expone en `/api/v1/oai` (Pendiente de implementación en Fase 3).

## Gestión de taxonomías y vocabularios controlados

Procomeka utiliza vocabularios controlados para:
- Niveles educativos (LOM-ES).
- Áreas de conocimiento.
- Tipos de recursos.
- Licencias (Creative Commons).

Estas taxonomías se gestionan a través del panel de administración en el apartado "Taxonomías" para mantener la consistencia en el descubrimiento de contenidos.
