# Requirements — Feature Ayuda y Manual de Usuario

## Fecha
2026-03-29

## Objetivo
Habilitar una página pública de ayuda que oriente a usuarios nuevos y editoriales sobre búsqueda, publicación, colecciones, roles y soporte, con acceso directo desde la navegación principal, el backoffice y el footer.

## Problema público o educativo
Sin una guía visible, el profesorado y los equipos editoriales pierden tiempo entendiendo cómo descubrir, reutilizar y publicar recursos abiertos, lo que reduce la reutilización y la calidad del catálogo.

## Usuario principal beneficiado
- Profesorado y autores que llegan por primera vez a la plataforma.
- Equipos curatoriales que necesitan soporte contextual dentro del backoffice.

## Requisitos funcionales
- Crear la ruta pública `/ayuda` con secciones navegables en español.
- Exponer el acceso a ayuda desde la cabecera pública y desde el backoffice editorial.
- Reenlazar `Contacto`, `Mapa Web` y `Preguntas Frecuentes` del footer hacia anclas reales de la página de ayuda.
- Cubrir primeros pasos, exploración, publicación, colecciones, FAQ, roles/permisos, contacto y mapa web.

## Requisitos no funcionales
- Diseño responsive y accesible con navegación por teclado y anclas semánticas.
- Validación obligatoria mediante tests TypeScript y ejecución exitosa de `bun test`.
- Cambios confinados a `apps/frontend` y documentación de trazabilidad en `docs/`.
