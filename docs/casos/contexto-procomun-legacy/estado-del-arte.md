# Estado del arte: Procomún Educativo del INTEF

> Caso de análisis — Fecha: 2026-03-27
> Objetivo: documentar el estado actual de la plataforma Procomún como base para planificar la migración de datos y funcionalidades a procomeka.

## 1. Descripción general

Procomún es la red de recursos educativos en abierto del Ministerio de Educación y Formación Profesional, gestionada a través del INTEF (Instituto Nacional de Tecnología y Formación del Profesorado). Es la plataforma pública de referencia para la catalogación, descubrimiento y reutilización de Recursos Educativos Abiertos (REA) en el sistema educativo español.

La plataforma tiene su origen en 2014, evolucionada a partir del proyecto Agrega/Agrega2, y ha integrado progresivamente funcionalidades como el Banco de imágenes y sonidos, eXeLearning online y el repositorio Agrega3.

## 2. Stack tecnológico confirmado

| Componente | Tecnología | Fuente |
|------------|-----------|--------|
| CMS / Portal web | **Drupal** | Fuente complementaria (ICA) + observación directa |
| Analítica | **Matomo** | Observación directa (procomun.intef.es) |
| App móvil | Nativa **iOS** y **Android** | Fuente oficial INTEF + fuente complementaria |
| Preprocesador CSS | Migración a **LESS** (eliminando Bootstrap 3) | Fuente complementaria (ICA) |
| Contenedores | **Docker** (dockerización del portal Drupal) | Fuente complementaria (ICA) |
| Autenticación | Proveedores externos integrados | Fuente complementaria (ICA) |

### Sobre la fiabilidad de estos datos

- **Drupal como CMS**: mencionado explícitamente por la empresa adjudicataria (ICA) y consistente con la observación del sitio.
- **Docker, LESS, Bootstrap 3**: mencionados solo por ICA; no verificados independientemente.
- **Matomo**: observable directamente en el código fuente de procomun.intef.es.

## 3. Componentes funcionales del sistema

Según las fuentes públicas, Procomún se compone de tres subsistemas principales:

### 3.1. Sistema PROCOMUN central

Portal web con funcionalidades de:
- Catalogación y gestión de Objetos Digitales Educativos (ODEs)
- Búsqueda y navegación con filtros por área, nivel educativo, tipo de contenido e idioma
- Flujo editorial (publicación, revisión)
- Gestión de usuarios y perfiles
- Comunidades temáticas (55 grupos activos)
- Artículos y publicaciones editoriales
- Itinerarios de aprendizaje (371 documentados)

### 3.2. Repositorio Agrega3

Repositorio de objetos de aprendizaje integrado en la plataforma. Gestiona:
- Paquetes SCORM
- Objetos .elpx (eXeLearning)
- Metadatos LOM (Learning Object Metadata)
- Interoperabilidad con nodos federados

### 3.3. Banco Multimedia

Anteriormente conocido como "Banco de imágenes y sonidos del INTEF". Integrado en Procomún desde la actualización de abril de 2023:
- Más de 100.000 recursos multimedia
- Tipos: fotografías, vídeos, ilustraciones, audios
- Sistema de licencias seleccionable por el usuario al compartir
- Búsqueda integrada con el buscador principal
- Informes de administración del Banco Multimedia

## 4. Cifras de la plataforma actual

| Métrica | Valor | Fuente |
|---------|-------|--------|
| Recursos educativos (ODEs) | 78.798 | procomun.intef.es (observación directa) |
| Recursos multimedia | +100.000 | Fuente oficial INTEF |
| Itinerarios de aprendizaje | 371 | procomun.intef.es |
| Artículos | 23.509 | procomun.intef.es |
| Comunidades | 55 | procomun.intef.es |
| Usuarios registrados | 109.707 | procomun.intef.es |
| Newsletters | 69 | procomun.intef.es |

## 5. Funcionalidades clave observadas

### Búsqueda y descubrimiento

- Búsqueda textual en recursos y multimedia simultáneamente
- Filtros por: área temática, contexto educativo, tipo de contenido, idioma
- Idiomas soportados: español, inglés, catalán, gallego, euskera
- Interfaz descrita como "sencilla e intuitiva" (INTEF, 2023)

### Edición y creación

- **eXeLearning online**: versión integrada en la plataforma para editar recursos interactivos directamente en el navegador
- Permite modificar recursos propios tras su publicación
- Catalogación de ODEs con alineación al formato eXeLearning

### Gestión editorial

- Rol de "Publicador certificado" (mencionado por ICA)
- Flujo de publicación con revisión
- Sistema de catalogación adaptado

### Usuarios y comunidad

- Registro con proveedores externos de autenticación
- Perfiles de usuario con historial de contribuciones
- Comunidades temáticas
- Compartición de recursos multimedia con licencia

### App móvil

- Disponible en iOS y Android
- Funcionalidades parcialmente sincronizadas con la web
- Conexión futura planificada con Banco Multimedia (según INTEF, abril 2023)
- Según ICA: desarrollo de nueva app con framework diferente al original

## 6. Actualización de abril de 2023

La noticia oficial del INTEF (24/04/2023) documenta una actualización importante:

1. **Integración del Banco Multimedia**: fusión del antiguo Banco de imágenes y sonidos como sección integrada
2. **Nuevo buscador**: interfaz unificada para buscar recursos y multimedia
3. **eXeLearning online**: integración de la herramienta de edición de recursos interactivos
4. **Nueva interfaz**: rediseño visual con nuevo logo, homepage y páginas internas
5. **Mejoras internas**: cambios en código y estructura, mejoras en administración
6. **App móvil actualizada**: funcionalidades parcialmente actualizadas

## 7. Trabajos de mantenimiento documentados (fuente complementaria)

Según la web corporativa de ICA (adjudicatario del contrato CE01698/2023), los trabajos incluyen:

> **Aviso:** Esta información proviene de una fuente corporativa no oficial. Debe tratarse como referencia complementaria.

- Mantenimiento correctivo del sistema y de la app móvil iOS/Android
- Creación de nueva app móvil con framework diferente
- Dockerización del portal Drupal
- Actualización de Drupal
- Migración de CSS a LESS (eliminando dependencia de Bootstrap 3)
- Mejoras en el buscador de ODEs
- Adaptación del sistema de catalogación de ODEs (alineación con eXeLearning)
- Integración de proveedores externos de autenticación
- Nuevo rol de "Publicador certificado"
- Informes del Banco Multimedia para administradores
- Optimización de calidad del código Drupal

## 8. Diagrama de componentes (inferido)

```
┌─────────────────────────────────────────────────────────┐
│                    PROCOMÚN (Drupal)                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Catálogo     │  │   Banco      │  │  Agrega3     │  │
│  │  ODEs         │  │   Multimedia │  │  (SCORM/LOM) │  │
│  │  (78.798)     │  │   (+100.000) │  │              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│  ┌──────▼─────────────────▼──────────────────▼───────┐  │
│  │              Buscador unificado                    │  │
│  │     (texto + filtros: área, nivel, tipo, idioma)  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  eXeLearning │  │  Comunidades │  │  Editorial    │  │
│  │  Online      │  │  (55)        │  │  (artículos)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Auth         │  │  Perfiles    │  │  Itinerarios │  │
│  │  (ext. prov.) │  │  (109.707)   │  │  (371)       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│              Docker │ Matomo │ LESS/CSS                  │
└─────────────────────────────────────────────────────────┘
         │                              │
    ┌────▼────┐                    ┌────▼────┐
    │ App iOS │                    │App Andr.│
    └─────────┘                    └─────────┘
```

## 9. Implicaciones para la migración a procomeka

### Datos a migrar (estimación)

| Entidad | Volumen estimado | Complejidad |
|---------|-----------------|-------------|
| ODEs (recursos educativos) | ~78.800 | Alta — metadatos inconsistentes, múltiples formatos |
| Recursos multimedia | ~100.000 | Media — archivos binarios + metadatos |
| Usuarios | ~109.700 | Media — perfiles, historial, roles |
| Itinerarios | ~371 | Baja — estructura secuencial |
| Artículos | ~23.500 | Media — contenido editorial |
| Comunidades | ~55 | Baja — estructura + miembros |

### Retos identificados

1. **Metadatos inconsistentes**: el sistema legacy ha acumulado años de catalogación con criterios variables
2. **Formatos heterogéneos**: SCORM, .elpx, enlaces externos, multimedia en múltiples formatos
3. **Drupal → TypeScript**: cambio completo de stack; no hay migración directa posible
4. **Banco Multimedia**: volumen alto de archivos binarios que requerirán almacenamiento y servicio
5. **eXeLearning online**: funcionalidad compleja de edición en navegador que requiere análisis separado
6. **Agrega3/LOM**: interoperabilidad con metadatos LOM y nodos federados
7. **Usuarios y permisos**: mapeo de roles legacy → RBAC de procomeka
8. **App móvil**: decisión sobre mantener, reescribir o eliminar

### Información crítica pendiente

- **Esquema de base de datos de Drupal**: necesario para diseñar el ETL
- **Formato exacto de metadatos LOM/Dublin Core** usado en Agrega3
- **API existente** (si la hay): endpoints, formatos de respuesta, autenticación
- **Estructura de archivos multimedia**: ubicación, naming, formatos
- **Pliego técnico (PPT)**: requisitos funcionales detallados del contrato vigente
