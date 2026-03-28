# Arquitectura del sistema

## Estado

Definida en Fase 0. Tecnologías decididas para todas las capas principales.

---

## Arquitectura del antiguo Procomún y proceso de migración

### Arquitectura actual (Legacy)

> Análisis detallado disponible en `docs/casos/contexto-procomun-legacy/estado-del-arte.md`.

El sistema anterior (el antiguo Procomún) está construido sobre una arquitectura más monolítica (evolucionada desde la red Agrega) e incluye múltiples componentes que han ido creciendo con el tiempo:

**Stack tecnológico confirmado:** Drupal (CMS), Matomo (analítica), Docker (contenedorización), apps nativas iOS/Android. CSS en migración de Bootstrap 3 a LESS.

**Tres subsistemas principales:**

- **Sistema PROCOMÚN central (Drupal):** Portal web con catalogación de ODEs, búsqueda con filtros (área, nivel, tipo, idioma), flujo editorial, gestión de usuarios (109.707 registrados), comunidades temáticas (55), artículos (23.509), itinerarios de aprendizaje (371) y newsletters (69). Autenticación con proveedores externos. Rol de "Publicador certificado".
- **Repositorio Agrega3:** Gestión de paquetes SCORM, objetos .elpx (eXeLearning), metadatos LOM y federación con nodos externos.
- **Banco Multimedia:** Anteriormente "Banco de imágenes y sonidos del INTEF". Integrado desde abril de 2023. Más de 100.000 recursos (fotografías, vídeos, ilustraciones, audios) con licencias seleccionables y búsqueda integrada.
- **eXeLearning Online:** Edición de recursos interactivos directamente en el navegador, permitiendo modificar recursos propios tras publicación.
- **Buscador unificado:** Motor de búsqueda interno que indexa ODEs y multimedia simultáneamente, con filtros por área temática, contexto educativo, tipo de contenido e idioma (es, en, ca, gl, eu).

**Cifras de la plataforma (marzo 2026):** 78.798 ODEs, +100.000 multimedia, 109.707 usuarios, 23.509 artículos, 371 itinerarios, 55 comunidades.

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

El sistema se organiza en capas desacopladas con contratos explícitos entre ellas. El lenguaje de toda la pila es TypeScript (strict). El runtime de servidor es Bun. La arquitectura sigue principios estrictos de simplicidad (KISS) para minimizar la carga operativa, basándose en un diseño monolítico que resuelve el almacenamiento en disco y la búsqueda en base de datos.

```
┌─────────────────────────────────────────────┐
│              Clientes externos               │
│   (navegador, LMS, otros repositorios)       │
└─────────────────┬───────────────────────────┘
                  │ HTTP / OAI-PMH / RSS
┌─────────────────▼───────────────────────────┐
│                 API Layer                    │
│     REST público + Admin API                 │
│     Hono + Bun  (ADR-0003)                   │
│     Auth: Better Auth (ADR-0007)             │
│     RBAC: admin/curator/author/reader (0008) │
│     apps/api/                                │
└────────┬────────────────────────────────────┘
         │
┌────────▼────────┐
│  Frontend       │
│  público        │
│  Astro          │
│  (ADR-0004)     │
│  apps/frontend/ │
└─────────────────┘
         │
┌────────▼────────────────────────────────────┐
│              Capa de datos                   │
│   Drizzle ORM (ADR-0006)                     │
│   packages/db/                               │
│   Esquema pgTable unificado                  │
│   Repositorio compartido (API + preview)     │
└────────┬──────────────────┬─────────────────┘
         │                  │
┌────────▼────────┐ ┌───────▼─────────────────┐
│  PostgreSQL     │ │  Sistema de Archivos     │
│  (ADR-0005)     │ │  Local / Volumen montado │
│  producción     │ └─────────────────────────┘
├─────────────────┤
│  PGlite         │
│  (ADR-0010)     │
│  dev local +    │
│  preview PRs    │
└─────────────────┘
```

## Modos de ejecución

| Modo | Base de datos | Auth | Despliegue |
|------|---------------|------|------------|
| **Producción** | PostgreSQL (`DATABASE_URL`) | Better Auth | Servidor |
| **Desarrollo local** | PGlite (file-backed en `local-data/`) | Better Auth | `make up` |
| **Preview estático** | PGlite WASM (IndexedDB en navegador) | Usuarios demo | GitHub Pages |

### Preview estático de PRs

Cada Pull Request publica automáticamente un preview en GitHub Pages. El preview:

- Se construye como sitio estático con Astro (`PREVIEW_STATIC=true`)
- Usa PGlite compilado a WASM para ejecutar PostgreSQL en el navegador
- Carga datos de demostración desde `apps/frontend/public/preview/seed.json`
- Incluye un banner con selector de rol y botón de reset de datos
- Se publica en `https://intef-proyectos.github.io/procomeka/pr-preview/pr-{N}/`
- La rama `main` se publica en `https://intef-proyectos.github.io/procomeka/`

El frontend usa una abstracción `ApiClient` con dos implementaciones:
- `HttpApiClient`: llama al servidor API real (modo normal)
- `PreviewApiClient`: ejecuta queries directamente en PGlite del navegador (modo preview)

Ambos comparten el mismo esquema Drizzle (`pgTable`) y el mismo repositorio de queries (`packages/db/src/repository.ts`).

## Estructura del monorepo

```
procomeka/
├── apps/
│   ├── api/          # Servidor API — Hono + Better Auth
│   ├── cli/          # CLI de gestión (usuarios, seed, migraciones)
│   └── frontend/     # Frontend público — Astro + preview estático
├── packages/
│   └── db/           # Esquema, repositorio, validación, setup, seed — Drizzle ORM
├── docs/             # Documentación del proyecto
├── e2e/              # Tests end-to-end — Playwright
└── package.json      # Bun workspaces raíz
```

## Capas y responsabilidades

### API Layer — `apps/api/`
- Framework: **Hono** (ADR-0003)
- Autenticación: **Better Auth** (ADR-0007) — password + OpenID Connect configurable
- Autorización: **RBAC** (ADR-0008) — roles admin/curator/author/reader
- Rutas separadas: `/api/v1/*` (pública), `/api/admin/*` (auth+RBAC), `/api/auth/*` (Better Auth)
- Valida entrada, aplica autenticación y autorización
- No contiene lógica de negocio; delega en servicios

### CLI — `apps/cli/`
- Herramienta de gestión desde terminal
- Comandos: `seed`, `user:create`, `user:list`
- Usa PGlite directamente para desarrollo local

### Frontend público — `apps/frontend/`
- Framework: **Astro** (ADR-0004)
- Interfaz pública para profesorado y ciudadanía
- Búsqueda, fichas de recurso, colecciones, descarga
- Arquitectura de islas: mínimo JS en cliente, componentes interactivos solo donde aporten valor
- Modo preview: PGlite WASM en navegador con datos de demostración

### Capa de datos — `packages/db/`
- ORM: **Drizzle** (ADR-0006)
- Esquema TypeScript unificado (`pgTable`) que funciona con PostgreSQL y PGlite
- Repositorio de queries compartido entre API y preview del frontend
- Validación de datos compartida
- Migraciones versionadas en SQL plano (`drizzle-kit`)
- Setup de tablas reutilizable para todos los entornos

### Base de datos — PostgreSQL / PGlite (ADR-0005, ADR-0010)
- **Producción**: PostgreSQL real
- **Desarrollo local**: PGlite (PostgreSQL embebido, sin instalar nada)
- **Preview en navegador**: PGlite WASM (PostgreSQL compilado a WebAssembly)
- Un solo esquema `pgTable` en todos los entornos — sin duplicación

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
7. **Un solo esquema, múltiples entornos**: el mismo esquema PostgreSQL (`pgTable` de Drizzle) funciona en producción, desarrollo local y preview en navegador gracias a PGlite
8. **Preview funcional por PR**: versión estática con PGlite WASM para probar el sistema desde el navegador en cada Pull Request, sin despliegues de backend (ADR-0010)

## ADRs relacionadas

- [ADR-0001](../negocio/decisiones/0001-typescript-bun-como-stack-base.md): TypeScript + Bun como stack base
- [ADR-0002](../negocio/decisiones/0002-preview-estatico-prs-con-sqlite.md): Preview estático de PRs con SQLite (**supersedido por ADR-0010**)
- [ADR-0003](../negocio/decisiones/0003-framework-http-api.md): Framework HTTP para API — Hono
- [ADR-0004](../negocio/decisiones/0004-framework-frontend.md): Framework frontend — Astro
- [ADR-0005](../negocio/decisiones/0005-base-de-datos-principal.md): Base de datos principal — PostgreSQL
- [ADR-0006](../negocio/decisiones/0006-orm-y-capa-acceso-datos.md): ORM y capa de acceso a datos — Drizzle
- [ADR-0007](../negocio/decisiones/0007-autenticacion-y-sesiones.md): Autenticación y sesiones — Better Auth
- [ADR-0008](../negocio/decisiones/0008-modelo-de-autorizacion.md): Modelo de autorización — RBAC
- [ADR-0010](../negocio/decisiones/0010-preview-estatico-pglite-github-pages.md): Preview estático con PGlite + GitHub Pages
