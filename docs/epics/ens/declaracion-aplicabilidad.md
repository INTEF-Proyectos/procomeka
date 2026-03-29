# Declaración de Aplicabilidad (SoA) - ENS Categoría MEDIA

## 1. Marco Organizativo (S)
- [x] **S.1 Política de seguridad**: Documentada en el ADR-0015 y la normativa interna del INTEF.
- [x] **S.2 Normativa de seguridad**: Definida en el RD 311/2022 y guías CCN-STIC aplicables.
- [x] **S.3 Procedimientos de seguridad**: Uso de GitFlow, revisiones de código y tests automatizados.
- [x] **S.4 Proceso de autorización**: Procedimiento de asignación de roles de autor, curador y admin.

## 2. Marco Operacional (op)
- [x] **op.1 Planificación**: Análisis de riesgos (en `docs/epics/ens/analisis-riesgos.md`).
- [x] **op.2 Control de acceso**: Identificación y autenticación basada en Better Auth (ADR-0007). RBAC implementado (ADR-0008).
- [x] **op.3 Explotación**: Inventario de activos, gestión de cambios a través de Git, configuración segura.
- [x] **op.4 Servicios externos**: Contratación conforme a la Ley de Contratos del Sector Público.
- [x] **op.5 Continuidad del servicio**: Plan de continuidad documentado.
- [x] **op.6 Monitorización**: Detección de intrusiones, registro de actividad y análisis estático de código.

## 3. Medidas de Protección (mp)
- [x] **mp.1 Instalaciones e infraestructuras**: Seguridad física gestionada por el proveedor de Cloud.
- [x] **mp.2 Gestión del personal**: Procesos de formación y cumplimiento.
- [x] **mp.3 Protección de equipos, comunicaciones y soportes**: Cifrado TLS, segmentación de red.
- [x] **mp.4 Protección de aplicaciones**: Ciclo de vida de desarrollo seguro, CodeQL, validación de inputs.
- [x] **mp.5 Protección de la información**: Datos personales conforme a RGPD, cifrado de datos sensibles.
- [x] **mp.6 Protección de servicios**: TLS para servicios web, protección frente a denegación de servicio.
