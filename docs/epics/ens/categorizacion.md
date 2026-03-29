# Categorización del Sistema (ENS)

## 1. Introducción
Este documento define la categoría de seguridad del sistema Procomeka de acuerdo con el Anexo I del Real Decreto 311/2022 (ENS).

## 2. Dimensiones de Seguridad

| Dimensión | Nivel | Justificación |
|-----------|-------|---------------|
| **Disponibilidad [D]** | MEDIA | Una interrupción prolongada afecta significativamente a la labor docente, aunque no supone un riesgo vital o de orden público inmediato. |
| **Autenticidad [A]** | MEDIA | Es fundamental asegurar que la identidad de los autores y curadores es genuina para evitar la suplantación en la publicación de contenidos. |
| **Integridad [I]** | MEDIA | La alteración no autorizada de recursos educativos puede propagar errores pedagógicos o desinformación. |
| **Confidencialidad [C]** | MEDIA | El sistema maneja datos de carácter personal de miles de docentes (nombres, correos, perfiles). |
| **Trazabilidad [T]** | MEDIA | Se requiere un registro estricto de quién accede a qué datos y quién realiza modificaciones en el catálogo de recursos. |

## 3. Categoría Resultante
Dada la valoración de las dimensiones, el sistema se clasifica como de **CATEGORÍA MEDIA**.

## 4. Requisitos de Seguridad Asociados
Como sistema de categoría media, se deben aplicar las medidas de seguridad descritas en el Anexo II del RD 311/2022 para este nivel, incluyendo:
- Política de seguridad documentada.
- Análisis de riesgos formal.
- Control de accesos basado en roles.
- Registro de actividad y auditoría.
- Protección de comunicaciones (TLS).
- Análisis estático de código.
- Plan de continuidad.
