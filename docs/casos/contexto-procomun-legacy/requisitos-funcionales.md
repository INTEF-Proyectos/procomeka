# Requisitos funcionales de Procomún (plataforma a migrar)

> Caso de análisis — Fecha: 2026-03-27
> Objetivo: catalogar los requisitos funcionales observados y documentados de la plataforma Procomún actual, como base para planificar la migración a procomeka.

## Método de recopilación

Estos requisitos se han extraído de:
- Observación directa de procomun.intef.es (marzo 2026)
- Noticia oficial del INTEF (24/04/2023)
- Información contractual pública (expediente CE01698/2023)
- Información complementaria de la web corporativa del adjudicatario (ICA)
- **Documento oficial de licitación** (Invitación a la Licitación del contrato CE01698/2023, 50 páginas, ANEXO I y ANEXO II) — fuente primaria para los requisitos formales del contrato

> **Nota:** Los requisitos inferidos de fuentes públicas (RF-01 a RF-13) se mantienen como referencia contextual. La sección "Requisitos funcionales formales del contrato" recoge los requisitos confirmados del documento oficial.

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

## Requisitos funcionales formales del contrato CE01698/2023

> Fuente: Invitación a la Licitación, ANEXO II — Pliego de Prescripciones Técnicas
> Los siguientes requisitos son los contratados oficialmente para el mantenimiento evolutivo y correctivo de Procomún en el periodo 2023-2025.

### II.1. Desarrollo de nueva funcionalidad

#### F1. Nueva aplicación Agrega3webadmin

Crear una nueva aplicación Agrega3webadmin y conectarla con Agrega3web y Agrega3batch. La aplicación actual fue desarrollada con Angular, pero **el código fuente se ha perdido**. Solo quedan los ficheros transpilados (JS/HTML/CSS). Se requiere:
- Ingeniería inversa para comprender cómo la aplicación configura Procomún-Agrega3
- Construcción de una aplicación de reemplazo con código fuente bajo control de versiones
- Integración con Agrega3web y Agrega3batch

> **Implicación para procomeka:** confirma que la gestión de Agrega3 era frágil y dependía de una aplicación sin código fuente. procomeka elimina este componente por completo.

### II.1. Mantenimiento evolutivo (Evo1–Evo10)

#### Evo1. Análisis y documentación para instalación completa desde cero

Análisis y documentación completa para una instalación limpia del sistema. Incluye:
- **Evo1.1**: Actualización del documento de diseño
- **Evo1.2**: Documento de instalación sobre CentOS
- **Evo1.3**: Dockerfiles para todos los componentes (Agrega3web, Agrega3batch, RepositorioODEs, AgregaEK, Agrega3webadmin)
- **Evo1.4**: Plan de pruebas con datos de test
- **Evo1.5**: Código fuente para compilación e instalación
- Docker-compose para el sistema completo

#### Evo2. Plan de migración de datos

Plan de migración de datos desde la VM actual a una instalación limpia en Docker.

#### Evo3. Limpieza de recursos huérfanos en ElasticSearch

Detectar y eliminar recursos presentes en ElasticSearch que no existen en Drupal. Estos registros huérfanos son residuos de la migración Solr → ElasticSearch y causan inconsistencias en los resultados de búsqueda.

#### Evo4. Optimización de Procomún-Agrega3

Unificar AgregaBatch y AgregaWeb en un único proceso unificado para simplificar la arquitectura de Agrega3.

#### Evo5. Limpieza del proceso de publicación de ODEs

Limpieza y optimización del código del proceso de publicación de ODEs.

#### Evo6. Mejora de la gestión de colecciones de ODEs

Mejorar la gestión de colecciones en Procomún. Actualmente las colecciones se asignan a través de los metadatos del ODE, lo que hace las modificaciones difíciles. Objetivo: permitir crear colecciones y asignar ODEs directamente sin necesidad de modificar metadatos.

> **Implicación para procomeka:** confirma que la gestión de colecciones era un punto de dolor reconocido. procomeka ya modela colecciones como entidad independiente con asignación directa de recursos.

#### Evo7. Integración de Banco Multimedia en la app móvil

Integrar el Banco Multimedia en la aplicación móvil (iOS + Android, desarrollada en Xamarin).

#### Evo8. Atomización del sistema de etiquetado

Atomizar el sistema de etiquetado existente para mejorar la búsqueda y el descubrimiento de recursos.

> **Implicación para procomeka:** confirma la necesidad de un sistema de etiquetado granular. Estado de implementación en Procomún desconocido (pudo haberse completado o no durante el contrato).

#### Evo9. Estudio de actualización de Drupal y Bootstrap

Estudiar los beneficios de actualizar las versiones de Drupal y Bootstrap para futuros contratos.

#### Evo10. Mejora del tiempo de publicación de ODEs

Mejorar el tiempo de publicación de ODEs, actualmente lento debido a:
- Subida de ficheros a almacenamiento NFS
- Tiempo de respuesta de los formularios durante la publicación

> **Implicación para procomeka:** confirma un cuello de botella conocido en el almacenamiento NFS. procomeka usa almacenamiento local/S3 directo sin NFS intermedio.

### II.2. Requisitos no funcionales

| Requisito | Detalle |
|-----------|---------|
| Diseño responsive | Obligatorio |
| Accesibilidad | WCAG 2.1 AA (obligatorio) |
| Multiidioma | es, ca, eu, gl, en |
| Control de versiones | Git (GitLab en git.intef.es) |
| Calidad de código | Informes SonarQube |
| Despliegue | Docker |
| Red | Compatibilidad IPv6 |
| Cobertura de tests | 80% cobertura unitaria |
| Testing | Selenium + JMeter |
| Metodología | Métrica v3 |
| Entornos | DEV / PRE / PRO |
| CI/CD | Auto-deploy en push a ramas master/PRE |
| Seguridad | Cumplimiento ENS (Esquema Nacional de Seguridad) |
| Licencias | Compatibles con software libre |

### II.3. Hitos de entrega

| Hito | Plazo | Peso | Contenido |
|------|-------|------|-----------|
| HITO 1 | Noviembre 2023 | 40% | F1 + Evo1 + Evo2 + Evo10 + mantenimiento correctivo |
| HITO 2 | 12 meses | 30% | Evo4 + Evo5 + Evo7 + mantenimiento correctivo |
| HITO 3 | 18 meses (fin de contrato) | 30% | Evo3 + Evo6 + Evo8 + Evo9 + mantenimiento correctivo + entrega final de código + todos los manuales |

---

## Mapeo de requisitos funcionales → procomeka

| RF Procomún | Req. contrato | Equivalente en procomeka | Estado en procomeka |
|-------------|---------------|------------------------|---------------------|
| RF-01 Gestión ODEs | Evo5, Evo10 | Resource CRUD + editorial workflow | ✅ MVP implementado (Epic-001) |
| RF-02 Banco Multimedia | Evo7 | MediaItem (asociado a Resource) | ⚠️ Esquema existe, subida no implementada |
| RF-03 Búsqueda | Evo3, Evo8 | Search + filters (PostgreSQL full-text) | 🔄 Búsqueda básica implementada, facetas avanzadas pendientes |
| RF-04 eXeLearning | — | No contemplado aún | ❌ Requiere análisis específico |
| RF-05 Usuarios/Auth | — | Better Auth + RBAC | ✅ Implementado (ADR-0007, ADR-0008) |
| RF-06 Comunidades | — | No contemplado aún | ❌ No está en roadmap actual |
| RF-07 Artículos | — | No contemplado aún | ❌ No está en roadmap actual |
| RF-08 Itinerarios / Colecciones | Evo6 | Collection (isOrdered=true) | ⚠️ Esquema existe, CRUD placeholder. Modelo ya resuelve el dolor de Evo6 |
| RF-09 App móvil | Evo7 | No contemplado aún | ❌ Requiere decisión: responsive web vs. app nativa |
| RF-10 Interoperabilidad | F1, Evo4 | OAI-PMH server/client planificado | 📋 Fase 2-3 del roadmap. Agrega3 eliminado por completo |
| RF-11 Administración | F1 (webadmin) | Backoffice (Astro) | 🔄 CRUD básico implementado. Reemplaza Agrega3webadmin |
| RF-12 Multiidioma | II.2 (es,ca,eu,gl,en) | Campo language en Resource | ⚠️ Solo metadato, no i18n de interfaz |
| RF-13 Accesibilidad | II.2 (WCAG 2.1 AA) | WCAG AA como requisito base | 🔄 En progreso |
| — Dockerización | Evo1 | Docker nativo desde el inicio | ✅ Ya implementado |
| — CI/CD | II.2 | GitHub Actions | ✅ Ya implementado |
| — Calidad de código | II.2 (SonarQube) | Biome + Bun test | ✅ Alternativa equivalente |

---

## Gaps críticos para la migración

### Cambios de tecnología confirmados

| Componente Procomún | Tecnología legacy | Equivalente procomeka | Riesgo/Notas |
|---------------------|-------------------|----------------------|--------------|
| Base de datos | MariaDB (Drupal) | PostgreSQL (Drizzle ORM) | Migración de esquema y datos requerida |
| Motor de búsqueda | ElasticSearch 7.17.2 | PostgreSQL full-text search | Sin ES; menor complejidad operativa, posible pérdida de funcionalidad avanzada |
| Backend Agrega3 | Java / Spring Boot | TypeScript / Hono | Reemplazo completo; sin migración de código |
| App móvil | Xamarin (iOS + Android) | Por decidir | Decisión pendiente: responsive web vs. app nativa |
| CMS | Drupal 9+ | Astro + API Hono | Reemplazo completo |
| Almacenamiento | NFS (cuello de botella conocido, Evo10) | Local / S3 directo | Mejora de rendimiento esperada |

### Funcionalidades de Procomún sin equivalente actual en procomeka

1. **Banco Multimedia como entidad independiente**: en procomeka los media son secundarios a los recursos; en Procomún el Banco Multimedia es un subsistema con entidad propia (+100.000 items)
2. **eXeLearning Online**: funcionalidad de edición interactiva en navegador; requiere análisis profundo
3. **Comunidades**: funcionalidad social/colaborativa no contemplada en procomeka
4. **Artículos editoriales**: contenido editorial no contemplado en el modelo actual
5. **Agrega3 / SCORM**: interoperabilidad con repositorios federados y paquetes SCORM
6. **App móvil**: decisión pendiente sobre si procomeka necesita app nativa o basta con diseño responsive (Evo7 del contrato integraba Banco Multimedia en la app Xamarin)
7. **Multiidioma de interfaz**: procomeka no tiene i18n de interfaz (solo idioma como metadato); el contrato exigía es, ca, eu, gl, en
8. **Gestión de colecciones**: era un punto de dolor reconocido en el contrato (Evo6). procomeka ya modela colecciones como entidad independiente, resolviendo el problema de diseño original
9. **Atomización de etiquetado (Evo8)**: contratado pero estado de implementación desconocido. Si se completó, los datos migrados podrían tener un sistema de tags más granular del esperado
10. **Cuello de botella NFS (Evo10)**: problema de rendimiento confirmado en publicación de ODEs. procomeka elimina NFS del flujo

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

1. ~~Obtener el Pliego de Prescripciones Técnicas (PPT) del expediente CE01698/2023~~ ✅ Obtenido (ANEXO II)
2. ~~Extraer de él los requisitos funcionales formales~~ ✅ Completado (ver sección anterior)
3. Cruzar con esta lista para identificar gaps reales — en progreso (ver tabla de mapeo actualizada)
4. Diseñar el plan de migración de datos (ETL) con mapeo de esquemas concreto (MariaDB → PostgreSQL)
5. Decidir qué funcionalidades de Procomún se replican, cuáles se transforman y cuáles se descartan
6. Investigar el estado real de Evo8 (atomización de etiquetado) y Evo6 (colecciones) en la plataforma actual
7. Tomar decisión estratégica sobre app móvil: responsive web vs. app nativa
