# Plan de Continuidad del Servicio

## 1. Escenarios de Crisis
- **Fallo de infraestructura**: Caída del proveedor de nube o base de datos.
- **Ataque de seguridad**: Compromiso de la base de datos o denegación de servicio masiva.
- **Corrupción de datos**: Error en una migración masiva o borrado accidental.

## 2. Estrategia de Copias de Seguridad (Backup)
- **Base de Datos**: Copias automáticas diarias con retención mínima de 30 días (gestión Cloud).
- **Archivos/Recursos**: Almacenamiento con redundancia geográfica (S3/equivalente).
- **Código**: Repositorio Git distribuido en GitHub con historial completo.

## 3. Recuperación ante Desastres (DRP)
- **RTO (Recovery Time Objective)**: Máximo 24 horas para servicios críticos.
- **RPO (Recovery Point Objective)**: Máximo 24 horas de pérdida de datos.
- **Procedimiento**:
    1. Notificación al equipo de DevOps y Dirección de Producto.
    2. Evaluación del alcance del daño.
    3. Restauración de la última copia de seguridad estable.
    4. Verificación de integridad.
    5. Comunicación a los usuarios si el tiempo de inactividad supera las 4 horas.

## 4. Mantenimiento y Pruebas
- Revisión anual del plan de continuidad.
- Pruebas semestrales de restauración de copias de seguridad en entornos de staging.
