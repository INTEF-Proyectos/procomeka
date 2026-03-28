# Estado del arte: Espacio Procomún Educativo (Procomún – Agrega3)

> Caso de análisis — Fecha: 2026-03-27
> Objetivo: documentar el estado actual de la plataforma Procomún como base para planificar la migración de datos y funcionalidades a procomeka.

---

**Fuentes documentales utilizadas:**

- **Pliego oficial**: Invitación a la Licitación del Contrato (50 páginas), que incluye ANEXO I (entorno tecnológico), ANEXO II (requisitos funcionales), ANEXO III (SLAs de mantenimiento) y ANEXO V (perfiles profesionales).
- **Observación directa**: procomun.intef.es (marzo 2026).
- **Fuente complementaria**: web corporativa de ICA (adjudicatario del contrato CE01698/2023).

---

## 1. Descripción general

El sistema se denomina oficialmente **Espacio Procomún Educativo (Procomún – Agrega3)** (fuente: pliego oficial, ANEXO I). Es la plataforma pública de referencia para la catalogación, descubrimiento y reutilización de Recursos Educativos Abiertos (REA) del Ministerio de Educación y Formación Profesional, gestionada por el INTEF (Instituto Nacional de Tecnología y Formación del Profesorado).

El portal se construyó inicialmente en 2014 sobre la federación de nodos educativos Agrega 2 (tecnología originaria de 2006, actualmente obsoleta). La dependencia directa con Agrega2 ha sido eliminada. Posteriormente se integraron el Banco Multimedia y eXeLearning online, además de una capa social con comunidades de aprendizaje para usuarios registrados.

Todos los componentes del sistema se ejecutan actualmente sobre una máquina virtual de 2018, con documentación insuficiente para una instalación desde cero (fuente: pliego oficial, ANEXO II, Evo1).

## 2. Stack tecnológico confirmado

### 2.1. Componentes principales (fuente: pliego oficial, ANEXO I)

| Componente | Tecnología | Versión / Detalle |
|------------|-----------|-------------------|
| Frontal web / CMS | **Drupal** (PHP) | 9.4.8 |
| Motor de búsqueda | **ElasticSearch** | 7.17.2 |
| Visualización ES | **Kibana** | (asociado a ES 7.17.2) |
| Aplicación de ingesta y publicación de ODEs | **Agrega3Web** | Java 1.8.0_342 |
| Servicio batch de harvesting | **Agrega3Batch** | Spring Boot 2.02 + Java 1.8.0_342 |
| Repositorio de ficheros ODE | **Apache** | 2.4.6 (CentOS) |
| Base de datos | **MariaDB** | (confirmado en ANEXO V: todos los perfiles requieren conocimiento de MariaDB) |
| Editor de contenido educativo | **eXeOnline** (eXeLearning online) | Integrado vía web services |
| App móvil | **Microsoft Xamarin 5 Forms** | .NET, REST, SQLite, OAuth, JSON |
| Analítica | **Matomo** | Observación directa (procomun.intef.es) |
| Administración de configuración | **Agrega3webadmin** | Angular (código fuente perdido; solo existe JS/HTML/CSS transpilado) |

### 2.2. Infraestructura y herramientas (fuente: pliego oficial, ANEXO II)

| Aspecto | Tecnología / Requisito |
|---------|----------------------|
| Control de versiones | Git en **git.intef.es** (instancia GitLab) |
| Calidad de código | **SonarQube** |
| Contenedores | **Docker** (obligatorio para todos los despliegues) |
| Tests funcionales/regresión | **Selenium** |
| Tests de carga/estrés | **JMeter** |
| Cobertura de tests unitarios | **80%** de interfaces públicas |
| Compatibilidad de red | **IPv6** completa |
| Metodología | **Métrica** |
| Licenciamiento | Compatible con licencias de software libre |
| Seguridad | Cumplimiento del **ENS** (Esquema Nacional de Seguridad) |

### 2.3. Entornos (fuente: pliego oficial, ANEXO II)

| Entorno | Responsable | Detalle |
|---------|------------|---------|
| **DEV** | Adjudicatario | Entorno propio del contratista |
| **PRE** | INTEF (con soporte del adjudicatario) | Preproducción |
| **PRO** | INTEF (con soporte del adjudicatario) | Producción |

Despliegue automático al hacer push a las ramas `master` (PRO) y `PRE`.

### 2.4. Nota sobre fuentes complementarias

- **Docker, LESS, Bootstrap 3**: mencionados por ICA como trabajos realizados; consistentes con los requisitos del pliego (Evo1 y Evo9).
- **Matomo**: observable directamente en el código fuente de procomun.intef.es.

## 3. Componentes funcionales del sistema

Según el pliego oficial (ANEXO I), el sistema se compone de **cuatro subsistemas principales**:

### 3.1. Frontal web (Drupal 9.4.8 / PHP)

URL: https://procomun.intef.es

Funcionalidades confirmadas (fuente: pliego oficial):
- **Base de datos centralizada de usuarios** del sistema
- Gestión de la aplicación **Banco Multimedia**
- Publicación, edición y compartición de contenido en comunidades
- Búsqueda y navegación con filtros por área, nivel educativo, tipo de contenido e idioma
- Flujo editorial (publicación, revisión)
- Gestión de perfiles de usuario e historial de contribuciones
- Comunidades temáticas (55 grupos activos)
- Artículos y publicaciones editoriales
- Itinerarios de aprendizaje (371 documentados)

### 3.2. Agrega3 (Java 1.8 / Spring Boot)

Suite de aplicaciones Java que gestiona los Objetos Digitales Educativos (ODEs):

- **Agrega3Web** (Java 1.8.0_342): parsea ODEs, extrae información, almacena y sirve contenido vía Apache.
- **Agrega3Batch** (Spring Boot 2.02 + Java 1.8.0_342): servicio en segundo plano que cosecha (harvest) ODEs desde otros nodos educativos (procedentes de Agrega2).
- **ElasticSearch 7.17.2**: índice de todo el contenido servido por Drupal y otros nodos. Drupal consulta ElasticSearch directamente (NoSQL).
- **Kibana**: herramienta de visualización de datos de ElasticSearch.
- **Repositorio de ODEs**: Apache 2.4.6 (CentOS) — almacena los ficheros ODE físicos.
- **Agrega3webadmin**: aplicación de administración de configuración (código fuente original en Angular perdido).

### 3.3. eXeOnline (eXeLearning online)

Versión online de eXeLearning para la creación y edición de contenido educativo interactivo, integrada con Procomún mediante web services. Permite:
- Crear recursos educativos directamente en el navegador
- Editar recursos propios tras su publicación
- Catalogación de ODEs alineada con el formato eXeLearning

### 3.4. Aplicación móvil (Xamarin 5 / .NET)

Disponible en iOS y Android (fuente: pliego oficial, ANEXO I):
- Construida con **Microsoft Xamarin 5 Forms**
- Tecnologías: REST services, SQLite, OAuth, .NET, JSON
- Muestra el contenido web de Drupal mediante llamadas a la API REST
- Funcionalidades parcialmente sincronizadas con la web

## 4. Cifras de la plataforma actual

| Métrica | Valor | Fuente |
|---------|-------|--------|
| Recursos educativos (ODEs) | 78.798 | procomun.intef.es (observación directa, marzo 2026) |
| Recursos multimedia | +100.000 | Fuente oficial INTEF |
| Usuarios registrados | 109.707 | procomun.intef.es |
| Itinerarios de aprendizaje | 371 | procomun.intef.es |
| Artículos | 23.509 | procomun.intef.es |
| Comunidades | 55 | procomun.intef.es |
| Newsletters | 69 | procomun.intef.es |

### Estimación de carga de mantenimiento (fuente: pliego oficial, ANEXO III)

- ~2.400 incidencias estimadas en 18 meses
- Distribución: 80% leves, 15% graves, 5% críticas

## 5. Funcionalidades y requisitos confirmados

### 5.1. Nueva funcionalidad (fuente: pliego oficial, ANEXO II)

| Código | Descripción |
|--------|-------------|
| **F1** | Crear nueva versión de "Agrega3webadmin" (aplicación de administración de configuración). La aplicación original fue desarrollada en Angular, pero **el código fuente se ha perdido** — solo existe JS/HTML/CSS transpilado. Requiere ingeniería inversa. |

### 5.2. Mantenimiento evolutivo (fuente: pliego oficial, ANEXO II)

| Código | Descripción |
|--------|-------------|
| **Evo1** | Documentación completa + instalación Docker desde cero (Dockerfiles, docker-compose para TODOS los componentes: Agrega3web, Agrega3batch, RepositorioODEs, AgregaEK, Agrega3webadmin). Debe funcionar sobre CentOS limpio + cualquier Linux con Docker. |
| **Evo2** | Plan de migración de datos desde la VM actual a instalación Docker limpia. |
| **Evo3** | Detectar y eliminar recursos en ElasticSearch que no existen en Drupal (restos de la migración Solr → ElasticSearch, inconsistencias de datos). |
| **Evo4** | Optimización mediante unificación de AgregaBatch y AgregaWeb en un único proceso. |
| **Evo5** | Limpieza del código del proceso de publicación. |
| **Evo6** | Mejora de la gestión de colecciones de ODEs (actualmente las colecciones usan metadatos del ODE; se busca asignación directa colección → ODE sin pasar por metadatos). |
| **Evo7** | Integración del Banco Multimedia en la aplicación móvil. |
| **Evo8** | Atomización del sistema de etiquetado para mejorar la búsqueda. |
| **Evo9** | Estudio de actualización de versiones de Drupal y Bootstrap. |
| **Evo10** | Mejora del tiempo de publicación de ODEs (cuello de botella en almacenamiento NFS). |

### 5.3. Requisitos no funcionales (fuente: pliego oficial, ANEXO II)

- **Responsive design**: todos los dispositivos
- **Accesibilidad**: WCAG 2.1 nivel AA (obligatorio para administración pública)
- **Multilingüe**: es, ca, eu, gl + en (para proyectos internacionales)
- **Compatibilidad IPv6** completa
- **Cobertura de tests unitarios**: 80% de interfaces públicas
- **Tests funcionales/regresión**: Selenium
- **Tests de carga/estrés**: JMeter
- **Calidad de código**: SonarQube
- **Contenedorización**: Docker obligatorio para todos los despliegues
- **Seguridad**: cumplimiento del ENS (Esquema Nacional de Seguridad)
- **Licenciamiento**: compatible con licencias de software libre
- **Metodología**: Métrica

### 5.4. SLAs de mantenimiento (fuente: pliego oficial, ANEXO III)

| Código | Métrica | Valor |
|--------|---------|-------|
| — | Horario de servicio | Lunes a viernes, 8:00–16:00 |
| ANS_01 | Tiempo de respuesta | 8 horas |
| ANS_02 | Resolución incidencia leve | 48 horas |
| ANS_03 | Resolución incidencia grave | 24 horas |
| ANS_04 | Resolución incidencia crítica | 8 horas |

## 6. Actualización de abril de 2023

La noticia oficial del INTEF (24/04/2023) documenta una actualización importante:

1. **Integración del Banco Multimedia**: fusión del antiguo Banco de imágenes y sonidos como sección integrada.
2. **Nuevo buscador**: interfaz unificada para buscar recursos y multimedia.
3. **eXeLearning online**: integración de la herramienta de edición de recursos interactivos.
4. **Nueva interfaz**: rediseño visual con nuevo logo, homepage y páginas internas.
5. **Mejoras internas**: cambios en código y estructura, mejoras en administración.
6. **App móvil actualizada**: funcionalidades parcialmente actualizadas.

## 7. Trabajos de mantenimiento documentados (fuente complementaria)

Según la web corporativa de ICA (adjudicatario del contrato CE01698/2023):

> **Aviso:** Esta información proviene de una fuente corporativa no oficial. Debe tratarse como referencia complementaria, aunque es consistente con los requisitos del pliego.

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

## 8. Diagrama de arquitectura confirmado

Diagrama basado en la información oficial del pliego (ANEXO I):

```
eXeOnline ←——→ [web services]
     ↓
Portal web (Drupal 9.4.8 / PHP) ←——→ Agrega3 (Java 1.8 / Spring Boot 2.02)
     │                                       │
     ├── MariaDB                             ├── ElasticSearch 7.17.2
     │                                       │        │
     ├── Banco Multimedia                    │     Kibana
     │                                       │
     ├── REST API                            └── Repositorio ODEs
     │                                            (Apache 2.4.6 / CentOS)
     │
     └── Agrega3webadmin (config)
              (código fuente perdido)

         │
    ┌────┴────────────────┐
    │  App móvil           │
    │  (Xamarin 5 / .NET)  │
    │  REST + SQLite       │
    │  OAuth + JSON        │
    │  iOS + Android       │
    └──────────────────────┘

Infraestructura transversal:
  - Git (git.intef.es / GitLab)
  - SonarQube
  - Docker
  - Matomo (analítica)
  - ENS (seguridad)
  - Entornos: DEV → PRE → PRO
```

## 9. Problemas conocidos confirmados

Problemas documentados oficialmente en el pliego o derivados directamente de los requisitos evolutivos:

### 9.1. Código fuente perdido de Agrega3webadmin

La aplicación de administración de configuración del sistema (Agrega3webadmin) fue desarrollada originalmente en Angular, pero **el código fuente se ha perdido**. Solo se conserva el JS/HTML/CSS transpilado. El pliego exige (F1) su reconstrucción completa mediante ingeniería inversa del código transpilado existente. Esto evidencia un problema grave de gobernanza del código fuente.

### 9.2. Inconsistencias de datos Solr → ElasticSearch

Existen recursos indexados en ElasticSearch que no tienen correspondencia en Drupal, como consecuencia de la migración desde Solr a ElasticSearch. El pliego exige (Evo3) la detección y eliminación de estos registros huérfanos. Implica que los datos del índice de búsqueda no son fiables al 100%.

### 9.3. VM de 2018 sin documentación de instalación

Todos los componentes del sistema se ejecutan sobre una máquina virtual provisionada en 2018. La documentación existente es **insuficiente para realizar una instalación desde cero**. El pliego exige (Evo1) la documentación completa y la creación de Dockerfiles y docker-compose para todos los componentes, precisamente porque este conocimiento no existe actualmente de forma reproducible.

### 9.4. Cuello de botella de almacenamiento NFS

El tiempo de publicación de ODEs está degradado por un cuello de botella en el almacenamiento NFS. El pliego exige (Evo10) la mejora de este rendimiento.

### 9.5. Acoplamiento entre colecciones y metadatos de ODE

Las colecciones de ODEs actualmente dependen de los metadatos del propio ODE para establecer la relación. El pliego exige (Evo6) una asignación directa colección → ODE sin pasar por metadatos, lo que indica un diseño deficiente del modelo de datos de colecciones.

### 9.6. Tecnología obsoleta y deuda técnica

- Java 1.8 (EOL desde marzo 2022)
- Spring Boot 2.02 (versión muy antigua)
- Drupal 9.4.8 (Drupal 9 llegó a EOL en noviembre 2023)
- Bootstrap 3 (EOL desde julio 2019)
- Xamarin 5 Forms (Microsoft anunció el fin de soporte de Xamarin en mayo 2024)
- Dos procesos Java separados (AgregaBatch y AgregaWeb) que el propio pliego reconoce que deberían unificarse (Evo4)

## 10. Implicaciones para la migración a procomeka

### Datos a migrar (estimación)

| Entidad | Volumen estimado | Complejidad | Notas |
|---------|-----------------|-------------|-------|
| ODEs (recursos educativos) | ~78.800 | Alta | Metadatos inconsistentes, múltiples formatos, posibles registros huérfanos en ES |
| Recursos multimedia | ~100.000 | Media | Archivos binarios + metadatos, almacenados en Banco Multimedia |
| Usuarios | ~109.700 | Media | Perfiles, historial, roles; base centralizada en Drupal/MariaDB |
| Itinerarios | ~371 | Baja | Estructura secuencial |
| Artículos | ~23.500 | Media | Contenido editorial |
| Comunidades | ~55 | Baja | Estructura + miembros |

### Retos identificados

1. **MariaDB → nuevo stack**: la base de datos es MariaDB (no MySQL ni PostgreSQL como se podía suponer); el ETL debe diseñarse para este motor.
2. **Metadatos inconsistentes**: el sistema legacy ha acumulado años de catalogación con criterios variables, agravado por las inconsistencias Solr → ES.
3. **Formatos heterogéneos**: SCORM, .elpx, enlaces externos, multimedia en múltiples formatos.
4. **Drupal 9 + Java 1.8 → TypeScript**: cambio completo de stack; no hay migración directa posible.
5. **Banco Multimedia**: volumen alto de archivos binarios que requerirán almacenamiento y servicio.
6. **eXeLearning online**: funcionalidad compleja de edición en navegador que requiere análisis separado (integración vía web services).
7. **Agrega3/LOM**: interoperabilidad con metadatos LOM y nodos federados.
8. **Usuarios y permisos**: mapeo de roles legacy → RBAC de procomeka.
9. **App móvil**: tecnología Xamarin en EOL; decisión sobre mantener, reescribir (API-first) o eliminar.
10. **Colecciones**: modelo actual acoplado a metadatos; requiere rediseño del modelo de datos.
11. **Índice de búsqueda**: no se puede confiar en el índice ES actual como fuente de verdad por las inconsistencias conocidas.

### Información crítica pendiente

- **Esquema de base de datos MariaDB de Drupal**: necesario para diseñar el ETL.
- **Formato exacto de metadatos LOM/Dublin Core** usado en Agrega3.
- **Endpoints de la API REST existente**: formatos de respuesta, autenticación, cobertura funcional.
- **Estructura de archivos multimedia**: ubicación, naming, formatos en el Repositorio de ODEs (Apache/CentOS).
- **Protocolo de integración eXeOnline ↔ Procomún**: contrato de web services.
- **Volumen real de datos inconsistentes** en ElasticSearch (alcance de Evo3).
