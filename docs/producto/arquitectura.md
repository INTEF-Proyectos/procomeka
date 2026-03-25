# Arquitectura del sistema

## Estado

Borrador. Las capas marcadas como "pendiente de ADR" no tienen tecnología decidida.

---

## Arquitectura del antiguo Procomún y proceso de migración

### Arquitectura actual (Legacy)

El sistema anterior (el antiguo Procomún) está construido sobre una arquitectura más monolítica (evolucionada desde la red Agrega) e incluye múltiples componentes que han ido creciendo con el tiempo:
- **Gestión de contenidos:** Integraba un repositorio documental principal para REA en diversos formatos (como paquetes SCORM).
- **Banco Multimedia:** Un sistema integrado para almacenar, clasificar y servir archivos multimedia (imágenes, audio, vídeo).
- **Herramientas de edición:** Integración embebida de eXeLearning online, permitiendo a los autores la edición en vivo de sus archivos de proyecto (.elpx) sin salir de la plataforma.
- **Buscador:** Un motor de búsqueda interno para indexar recursos y material multimedia, con capacidades de filtrado.

### Proceso de migración

El paso a la nueva arquitectura implicará un proceso de **Migración de Contenidos y Usuarios** (ETL - Extracción, Transformación y Carga) para asegurar que no se pierda el valor generado en la plataforma anterior. Este proceso requerirá:

1. **Extracción (Extract):**
   - Volcar los recursos existentes (paquetes SCORM, archivos .elpx, enlaces).
   - Extraer el catálogo del Banco Multimedia con todas sus imágenes, vídeos y audios.
   - Extraer la base de datos de usuarios (perfiles, historial y aportaciones).
2. **Transformación (Transform):**
   - Mapear y adaptar los metadatos antiguos (que pueden ser inconsistentes) al nuevo esquema unificado y estricto.
   - Limpieza y deduplicación de registros.
   - Transformar los permisos y asociaciones de los recursos para que encajen en el nuevo modelo de moderación, licencias y validación.
3. **Carga (Load):**
   - Ingestar de forma masiva (vía scripts de ingestión) el contenido transformado a la nueva base de datos.


## Visión general

El sistema se organiza en capas desacopladas con contratos explícitos entre ellas. El lenguaje de toda la pila es TypeScript. El runtime de servidor es Bun. La arquitectura sigue principios estrictos de simplicidad (KISS) para minimizar la carga operativa, basándose en un diseño monolítico que resuelve el almacenamiento en disco y la búsqueda en base de datos.

```
┌─────────────────────────────────────────────┐
│              Clientes externos               │
│   (navegador, LMS, otros repositorios)       │
└─────────────────┬───────────────────────────┘
                  │ HTTP / OAI-PMH / RSS
┌─────────────────▼───────────────────────────┐
│                 API Layer                    │
│     REST público + Admin API                 │
│     TypeScript + Bun  [ADR pendiente]        │
└────────┬────────────────────────────────────┘
         │
┌────────▼────────┐
│  Frontend       │
│  público        │
│  [ADR pendiente]│
└─────────────────┘
         │
┌────────▼────────────────────────────────────┐
│              Capa de servicios               │
│   Catálogo, Curación, Búsqueda, Tareas       │
│         TypeScript (dominio puro)            │
└────────┬──────────────────┬─────────────────┘
         │                  │
┌────────▼────────┐ ┌───────▼─────────────────┐
│  Base de datos  │ │  Sistema de Archivos     │
│  [ADR pendiente]│ │  Local / Volumen montado │
└─────────────────┘ └─────────────────────────┘
```

## Capas y responsabilidades

### API Layer
- Expone endpoints REST para clientes externos y frontend
- Valida entrada, aplica autenticación y autorización
- Orquesta tareas programadas o asíncronas sencillas que pueden lanzarse vía API o CLI
- No contiene lógica de negocio; delega en servicios
- Pendiente de ADR: Hono + Bun vs Elysia vs Fastify

### Frontend público
- Interfaz pública para profesorado y ciudadanía
- Búsqueda, fichas de recurso, colecciones, descarga
- Pendiente de ADR: Next.js vs Astro vs Remix

### Capa de servicios
- Lógica de negocio: catálogo, curación, búsqueda (FTS en base de datos), usuarios, importación programada y procesamiento de archivos.
- Tipos y contratos TypeScript compartidos entre capas
- Sin dependencia directa de framework HTTP ni de ORM específico

### Base de datos
- Almacenamiento principal de recursos, metadatos y usuarios
- Índice de búsqueda (usando SQL FTS nativo, ej: Postgres Full-Text Search)
- Pendiente de ADR: PostgreSQL vs SQLite/Turso

### Sistema de Archivos
- Almacenamiento directo en disco físico de los archivos subidos, metadatos voluminosos en crudo o multimedia.
- Decisiones de hardware / replicación delegadas al administrador del sistema (ej: disco local, NAS, SAN, etc.).

## Principios de diseño

1. **Contratos explícitos**: cada capa define tipos TypeScript de entrada y salida
2. **Sin lógica de negocio en la API**: la API valida y delega, los servicios deciden
3. **Simplicidad ante todo (KISS)**: se prescinde de motores de búsqueda dedicados, sistemas de colas o buckets de objetos para mantener la operativa sencilla (monolito + DB + disco).
4. **Tareas de ingestión idempotentes**: toda importación puede reejecutarse sin efectos no deseados
5. **Observabilidad desde el inicio**: logs estructurados, métricas, trazas en todas las capas
6. **Accesibilidad como requisito**: no como añadido posterior
7. **Entorno estático funcional por PR**: Capacidad de generar una versión estática de la plataforma (usando una base de datos local en cliente como PGLite o sql.js) para probar el sistema desde el navegador en cada Pull Request de forma ligera, sin despliegues de backend.

## ADRs relacionadas

- [ADR-0001](../negocio/decisiones/0001-typescript-bun-como-stack-base.md): TypeScript + Bun como stack base
- [ADR-0002](../negocio/decisiones/0002-preview-estatico-prs-con-sqlite.md): Preview estático de PRs (aceptado)
- ADR-0003: Framework HTTP para API (pendiente)
- ADR-0004: Framework frontend (pendiente)
- ADR-0005: Base de datos principal (pendiente)
