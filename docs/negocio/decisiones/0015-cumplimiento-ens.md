# ADR-0015 Cumplimiento del Esquema Nacional de Seguridad (ENS)

* Estado: Aceptado
* Fecha: 2024-05-24
* Agentes Implicados: [@.agents/skills/seguridad-privacidad-legal, @.agents/skills/devops-sre, @.agents/skills/backend-api-servicios]

## Contexto y Problema

El sistema Procomeka gestiona recursos educativos públicos y datos de usuarios (profesorado). Según el Real Decreto 311/2022, es obligatorio el cumplimiento del Esquema Nacional de Seguridad (ENS) para sistemas de la Administración Pública o que presten servicios a esta.

Se requiere categorizar el sistema, realizar un análisis de riesgos y aplicar medidas de seguridad proporcionales a la categoría resultante para garantizar la seguridad de la información y los servicios.

## Opciones Consideradas

* **Cumplimiento Básico**: Aplicable si el impacto de un incidente es bajo en todas las dimensiones.
* **Cumplimiento Medio**: Aplicable si al menos una dimensión tiene un impacto medio.
* **Cumplimiento Alto**: Aplicable si alguna dimensión tiene un impacto alto.

## Decisión

Se adopta la **Categoría MEDIA** para el sistema Procomeka.

Justificación:
- **Disponibilidad**: El servicio es importante para el funcionamiento diario del profesorado (Nivel Medio).
- **Confidencialidad**: Se gestionan datos personales de miles de usuarios (Nivel Medio).
- **Integridad y Autenticidad**: Los recursos educativos deben ser veraces y su autoría debe estar garantizada (Nivel Medio).
- **Trazabilidad**: Es crítico saber quién accede y modifica la información (Nivel Medio).

## Consecuencias

### Positivas
* Cumplimiento legal con el RD 311/2022.
* Aumento de la confianza de los usuarios y del INTEF/MEFP.
* Mejora de la resiliencia y seguridad del sistema.
* Trazabilidad completa de acciones críticas.

### Negativas / Riesgos
* Aumento de la complejidad en el desarrollo y despliegue (middlewares de auditoría, análisis estático obligatorio).
* Sobrecarga ligera en el rendimiento debido al logging persistente de accesos.
* Necesidad de mantenimiento de la documentación de seguridad.

## Notas de Implementación

1. **GitHub Advanced Security**: Configurar CodeQL, Dependabot y Secret Scanning.
2. **Auditoría**: Implementar middleware en la API para registrar todos los accesos en base de datos.
3. **Trazabilidad**: Registrar eventos de autenticación y cambios de roles administrativos.
4. **Cifrado**: Asegurar TLS y evaluar cifrado en reposo según el entorno de despliegue.
