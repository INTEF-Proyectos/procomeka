# Requisitos funcionales de Procomún (plataforma a migrar)

> Caso de análisis — Fecha: 2026-03-27
> Objetivo: catalogar los requisitos funcionales observados y documentados de la plataforma Procomún actual, como base para planificar la migración a procomeka.

## Método de recopilación

Estos requisitos se han extraído de:
- Observación directa de procomun.intef.es (marzo 2026)
- Noticia oficial del INTEF (24/04/2023)
- Información contractual pública (expediente CE01698/2023)
- Información complementaria de la web corporativa del adjudicatario (ICA)

> **Aviso:** Esta recopilación NO sustituye a los requisitos formales del Pliego de Prescripciones Técnicas (PPT), que está pendiente de obtener. Los requisitos aquí listados son inferidos de fuentes públicas.

---

## RF-01. Gestión de recursos educativos (ODEs)

### RF-01.1. Catalogación
- Crear, editar y eliminar recursos educativos digitales (ODEs)
- Campos de metadatos: título, descripción, autor, área temática, nivel educativo, tipo de recurso, idioma, licencia, palabras clave
- Soporte para metadatos LOM (Learning Object Metadata)
- Alineación del sistema de catalogación con formato eXeLearning
- Asignación de licencias Creative Commons y otras

### RF-01.2. Tipos de recurso soportados
- Paquetes SCORM
- Archivos eXeLearning (.elpx)
- Enlaces externos (URLs)
- Documentos (PDF, DOC, etc.)
- Presentaciones
- Vídeos, audios, imágenes
- Actividades interactivas
- Secuencias didácticas

### RF-01.3. Flujo editorial
- Estados: borrador, en revisión, publicado, archivado
- Rol de "Publicador certificado" con permisos especiales
- Revisión y moderación de contenidos
- Posibilidad de modificar recursos propios tras publicación

### RF-01.4. Versionado y trazabilidad
- Registro de autor/creador
- Timestamps de creación y modificación
- Historial de contribuciones por usuario

---

## RF-02. Banco Multimedia

### RF-02.1. Gestión de contenidos multimedia
- Subida de fotografías, vídeos, ilustraciones y audios
- Selección de licencia al compartir contenido
- Más de 100.000 recursos multimedia activos

### RF-02.2. Búsqueda multimedia
- Búsqueda integrada con el buscador principal de ODEs
- Filtros específicos por tipología de contenido multimedia

### RF-02.3. Administración
- Informes del Banco Multimedia para administradores
- Gestión de contenidos por categoría y tipo

---

## RF-03. Búsqueda y descubrimiento

### RF-03.1. Buscador principal
- Búsqueda textual en recursos y multimedia simultáneamente
- Interfaz de búsqueda unificada

### RF-03.2. Filtros y facetas
- Área temática (artes, ciencias, matemáticas, lenguas, educación especial, FP, educación física, educación ambiental, desarrollo profesional)
- Contexto educativo / nivel (infantil, primaria 1-6, ESO 12-16, FP, educación de adultos, enseñanzas de idiomas, enseñanzas artísticas, universidad)
- Tipo de contenido (ODE, multimedia, artículo, itinerario)
- Idioma (español, inglés, catalán, gallego, euskera)

### RF-03.3. Navegación temática
- Acceso por áreas temáticas desde la página principal
- Itinerarios de aprendizaje como rutas de navegación (371 activos)

---

## RF-04. eXeLearning Online

### RF-04.1. Edición en navegador
- Versión integrada de eXeLearning accesible desde la plataforma
- Edición de recursos interactivos directamente en el navegador
- Modificación de recursos propios tras publicación

### RF-04.2. Compatibilidad
- Nota: el sitio actual marca algunos contenidos como "incompatible con eXeLearning versión 3"
- Implica coexistencia de recursos en formatos de distintas versiones de eXeLearning

---

## RF-05. Usuarios y autenticación

### RF-05.1. Registro y autenticación
- Registro de usuarios (109.707 registrados)
- Integración con proveedores externos de autenticación
- Login con credenciales locales

### RF-05.2. Roles y permisos
- Usuario registrado (crear, contribuir, gestionar perfil)
- Publicador certificado (permisos editoriales ampliados)
- Administrador (gestión completa)
- Usuario anónimo (búsqueda y visualización pública)

### RF-05.3. Perfiles de usuario
- Perfil con historial de contribuciones
- Listado de recursos subidos
- Participación en comunidades

---

## RF-06. Comunidades

### RF-06.1. Gestión de comunidades
- Creación y gestión de comunidades temáticas (55 activas)
- Membresía de usuarios
- Espacio de discusión o colaboración por comunidad

---

## RF-07. Contenido editorial

### RF-07.1. Artículos
- Publicación de artículos sobre temas educativos (23.509 activos)
- Sistema de newsletters (69 disponibles)

---

## RF-08. Itinerarios de aprendizaje

### RF-08.1. Gestión de itinerarios
- Creación de secuencias didácticas ordenadas (371 activos)
- Agrupación de recursos en rutas de aprendizaje
- Navegación secuencial por itinerario

---

## RF-09. App móvil

### RF-09.1. Funcionalidades
- Acceso a recursos educativos desde dispositivos móviles
- Disponible en iOS y Android
- Funcionalidades parcialmente sincronizadas con la versión web
- Conexión futura planificada con Banco Multimedia

### RF-09.2. Estado técnico (según fuente complementaria)
- App original en mantenimiento correctivo
- Desarrollo de nueva app con framework diferente al original

---

## RF-10. Interoperabilidad

### RF-10.1. Estándares soportados
- LOM (Learning Object Metadata) — metadatos de objetos de aprendizaje
- Integración con Agrega3 (repositorio federado)
- Paquetes SCORM

### RF-10.2. Integración con sistemas externos
- Proveedores de autenticación externos
- Formatos de exportación/importación (pendiente de detallar con PPT)

---

## RF-11. Administración de la plataforma

### RF-11.1. Panel de administración
- Gestión de usuarios y roles
- Gestión de contenidos y catalogación
- Informes y estadísticas (Banco Multimedia, ODEs)
- Moderación de contenidos

### RF-11.2. Operaciones técnicas
- Dockerización del portal (según fuente complementaria)
- Analítica con Matomo
- Gestión de calidad de código

---

## RF-12. Multiidioma

### RF-12.1. Idiomas de interfaz
- Español, inglés, catalán, gallego, euskera

### RF-12.2. Idiomas de contenido
- Recursos catalogados en múltiples idiomas
- Filtro por idioma en búsqueda

---

## RF-13. Accesibilidad y legal

### RF-13.1. Accesibilidad
- Declaración de accesibilidad presente en el sitio
- Requisito legal para portales de la administración pública española

### RF-13.2. Privacidad y legal
- Política de privacidad
- Política de cookies
- Aviso legal
- Contacto de soporte: cau.recursos.intef@educacion.gob.es

---

## Mapeo de requisitos funcionales → procomeka

| RF Procomún | Equivalente en procomeka | Estado en procomeka |
|-------------|------------------------|---------------------|
| RF-01 Gestión ODEs | Resource CRUD + editorial workflow | ✅ MVP implementado (Epic-001) |
| RF-02 Banco Multimedia | MediaItem (asociado a Resource) | ⚠️ Esquema existe, subida no implementada |
| RF-03 Búsqueda | Search + filters | 🔄 Búsqueda básica implementada, facetas avanzadas pendientes |
| RF-04 eXeLearning | No contemplado aún | ❌ Requiere análisis específico |
| RF-05 Usuarios/Auth | Better Auth + RBAC | ✅ Implementado (ADR-0007, ADR-0008) |
| RF-06 Comunidades | No contemplado aún | ❌ No está en roadmap actual |
| RF-07 Artículos | No contemplado aún | ❌ No está en roadmap actual |
| RF-08 Itinerarios | Collection (isOrdered=true) | ⚠️ Esquema existe, CRUD placeholder |
| RF-09 App móvil | No contemplado aún | ❌ Requiere decisión estratégica |
| RF-10 Interoperabilidad | OAI-PMH server/client planificado | 📋 Fase 2-3 del roadmap |
| RF-11 Administración | Backoffice (Astro) | 🔄 CRUD básico implementado |
| RF-12 Multiidioma | Campo language en Resource | ⚠️ Solo metadato, no i18n de interfaz |
| RF-13 Accesibilidad | WCAG AA como requisito base | 🔄 En progreso |

---

## Gaps críticos para la migración

### Funcionalidades de Procomún sin equivalente actual en procomeka

1. **Banco Multimedia como entidad independiente**: en procomeka los media son secundarios a los recursos; en Procomún el Banco Multimedia es un subsistema con entidad propia (+100.000 items)
2. **eXeLearning Online**: funcionalidad de edición interactiva en navegador; requiere análisis profundo
3. **Comunidades**: funcionalidad social/colaborativa no contemplada en procomeka
4. **Artículos editoriales**: contenido editorial no contemplado en el modelo actual
5. **Agrega3 / SCORM**: interoperabilidad con repositorios federados y paquetes SCORM
6. **App móvil**: decisión pendiente sobre si procomeka necesita app nativa
7. **Multiidioma de interfaz**: procomeka no tiene i18n de interfaz (solo idioma como metadato)

### Datos sin modelo de destino definido

| Dato en Procomún | Volumen | Modelo en procomeka |
|------------------|---------|---------------------|
| Recursos multimedia independientes | ~100.000 | No hay entidad separada; solo MediaItem vinculado a Resource |
| Artículos | ~23.500 | No existe modelo |
| Comunidades + membresías | ~55 | No existe modelo |
| Relaciones usuario-comunidad | Desconocido | No existe modelo |
| Paquetes SCORM | Desconocido | No hay soporte específico |
| Metadatos LOM | Desconocido | Mapeo parcial via ADR-0009 |

---

## Siguiente paso recomendado

1. Obtener el Pliego de Prescripciones Técnicas (PPT) del expediente CE01698/2023
2. Extraer de él los requisitos funcionales formales
3. Cruzar con esta lista para identificar gaps reales
4. Diseñar el plan de migración de datos (ETL) con mapeo de esquemas concreto
5. Decidir qué funcionalidades de Procomún se replican, cuáles se transforman y cuáles se descartan
