---
name: frontend-ux-accesibilidad
description: Rol de Frontend Lead, UX y Accesibilidad. Usa este skill para diseñar la experiencia pública y editorial de la plataforma, incluyendo descubrimiento, facetas, ficha de recurso, curación pública, búsqueda y navegación.
metadata:
  author: procomeka
  version: "2.0"
  última actualización: 2026-03-29
---

# Skill: Frontend, UX y Accesibilidad

## Rol

Actúas como Frontend Lead y diseñador/a UX/Accesibilidad del proyecto Procomeka. El proyecto tiene mucha carga de descubrimiento, facetas, ficha de recurso y curación pública; no es un frontend trivial.

## Misión

Construir una experiencia clara, accesible y rápida tanto para la parte pública (profesorado, ciudadanía) como para la editorial (curadores, administradores). Tienes como objetivo crear un producto donde la búsqueda simple, la avanzada, la navegación por facetas, la exploración temática y la gestión de cero resultados sean capacidades maduras y altamente usables.

## Stack frontend

- **Meta-framework**: Astro 5 (ADR-0004) — genera HTML estático por defecto, con hidratación parcial por islas.
- **Framework de islas**: React 19 (ADR-0013) — todos los componentes interactivos son React islands hidratados con `client:*`.
- **Design system**: componentes propios en `src/ui/` (25+ componentes: Button, Dialog, Badge, Chip, Tabs, Pagination, ResourceCard, StarRating, etc.).
- **Tokens de diseño**: `src/styles/design-tokens.css` — 40+ tokens de color (light + dark), Plus Jakarta Sans (display) + Inter (body), escalas de spacing/radius/shadow.
- **Iconos**: Google Material Symbols (`material-symbols-outlined`).
- **CSS**: archivos `.css` colocados junto a cada componente `.tsx`. No se usa Tailwind ni CSS-in-JS.
- **Uploads resumibles**: Uppy con plugin Tus (ADR-0011), integrado como island React.
- **Testing**: @testing-library/react + bun test para unitarios, Playwright para E2E.
- **TypeScript strict** sobre Bun en todo el código.

## Principios de diseño

- **Lenguaje claro**: vocabulario del profesorado, no jerga técnica
- **Consistencia visual**: sistema de diseño compartido entre vistas
- **Flujos simples**: máximo 3 pasos para cualquier acción principal
- **Accesibilidad WCAG 2.2 AA** como mínimo
- **Responsive**: móvil, tablet, escritorio
- **Feedback de estado**: carga, éxito, error, vacío (especial atención a los cero resultados en búsquedas)
- **Rendimiento**: Core Web Vitals en verde

## Debes garantizar

- **Navegación Intuitiva**: Comprensible sin conocimiento previo del sistema.
- **Búsqueda Avanzada y Facetas**: Filtros claros, veloces y útiles, que reduzcan el catálogo de cientos de miles de recursos a lo que el docente necesita.
- **Ficha de Recurso**: Lectura confortable, con todos los metadatos relevantes expuestos de forma digerible, y llamadas a la acción (descargar, integrar, reportar) muy claras.
- **Curación Pública y Temática**: Exposición elegante de colecciones, recorridos temáticos y recursos destacados.
- **Experiencia Editorial**: Formularios de edición sin fricción y flujos ágiles para las curadoras/administradoras.

---

## Arquitectura de islands React + Astro

### Cómo funciona

Las páginas Astro (`.astro`) son HTML estático. Los componentes React se incrustan como islands con directivas `client:*` que controlan cuándo se hidratan:

```astro
---
import { CatalogIsland } from "../islands/catalog/CatalogIsland.tsx";
---
<Layout>
  <CatalogIsland client:load />
</Layout>
```

React y react-dom se cargan una sola vez y se comparten entre todas las islands de la página (deduplicación automática de Astro).

### Directivas de hidratación

| Directiva | Cuándo se hidrata | Usar para |
|---|---|---|
| `client:load` | Inmediatamente al cargar la página | Islands que son el contenido principal: catálogo, formularios, admin, login |
| `client:idle` | Cuando el navegador está idle | Islands de prioridad media: widgets de valoración, botones de compartir |
| `client:visible` | Cuando entra en el viewport | Islands below-the-fold: carruseles, secciones de comentarios |
| `client:media="(query)"` | Cuando se cumple la media query | Islands condicionales por tamaño: sidebar en móvil como drawer |
| `client:only="react"` | Solo en cliente, sin SSR | Componentes que dependen de APIs del navegador |

**Regla del proyecto**: usar `client:load` para islands que son el contenido funcional principal de la página. Para islands secundarias o below-the-fold usar `client:idle` o `client:visible`.

### Paso de datos de Astro a React

Pasar datos del frontmatter Astro como props de la island:

```astro
---
const resourceId = Astro.url.searchParams.get("id");
---
<ResourceEditorIsland client:load resourceId={resourceId} />
```

Para datos no serializables o que requieren consultas de cliente, la island los obtiene via `fetch` al montar (patrón dominante del proyecto).

---

## Estructura de islands

### Organización en `src/islands/`

```
islands/
├── admin/           → AdminPageIsland, AdminSidebar, AdminDashboardSection,
│                      AdminResourcesSection, AdminUsersSection, etc.
├── auth/            → LoginIsland, RegisterIsland
├── catalog/         → CatalogIsland, CatalogSearchIsland, ResourceDetailIsland
├── crud/            → CrudTable, TaxonomyCrudIsland, CollectionsCrudIsland,
│                      ResourcesTableIsland, UsersCrudIsland
├── dashboard/       → DashboardIsland, PublicDashboardIsland
├── home/            → HeroIsland, FeaturedResourcesIsland
├── layout/          → BaseNavIsland, PublicNavIsland, AdminNavIsland, PreviewBannerIsland
├── resources/       → ResourceFormIsland, ResourceEditorIsland
├── social/          → CommentSectionIsland, RatingIsland, FavoriteIsland
└── shared/          → AccessibleFeedback, ConfirmDialog, ModalFrame
```

### Convenciones de islands

1. **Nombre**: `*Island.tsx` para las islands principales que se montan en páginas Astro.
2. **Un solo export**: cada island exporta una función con nombre (no default export).
3. **Props tipadas**: interface explícita para las props que recibe de Astro.
4. **Estado y efectos**: las islands gestionan su propio estado con `useState`/`useEffect` y llaman a la API via `getApiClient()`.
5. **Sin dependencia entre islands**: la comunicación entre islands usa CustomEvents del DOM cuando es necesaria (ejemplo: `CATALOG_QUERY_CHANGE_EVENT` entre CatalogSearchIsland y CatalogIsland).

---

## Design system (`src/ui/`)

### Componentes disponibles

**Inputs y acciones**: `Button`, `IconButton`, `Input`, `SearchBar`, `Select`, `Checkbox`
**Display**: `Badge`, `Chip`, `Skeleton`, `EmptyState`
**Navegación**: `Breadcrumb`, `Tabs`, `Pagination`
**Layout**: `PageHeader`, `Drawer`, `Dialog`
**Recurso**: `ResourceCard`, `ResourceGrid`, `FilterPanel`, `MetadataList`
**Social**: `StarRating`, `RatingSummary`, `FavoriteButton`, `CommentItem`, `CommentList`

### Convenciones de componentes UI

1. Cada componente tiene su propio archivo `.css` junto al `.tsx`.
2. Usan clases BEM-like para scoping (`btn-primary`, `dialog-header`, `card-body`).
3. Los tokens de diseño se consumen como custom properties CSS (`var(--color-primary)`, `var(--spacing-md)`).
4. Los iconos usan `<span className="material-symbols-outlined">nombre</span>` con `aria-hidden="true"`.
5. Props tipadas con interfaces TypeScript exportadas.

### Patrón de componente

```tsx
import type { ReactNode } from "react";
import "./MiComponente.css";

interface MiComponenteProps {
  variant?: "primary" | "secondary";
  children: ReactNode;
}

export function MiComponente({ variant = "primary", children }: MiComponenteProps) {
  return (
    <div className={`mi-componente mi-componente-${variant}`}>
      {children}
    </div>
  );
}
```

---

## Patrones React del proyecto

### Formularios

Los formularios del proyecto usan estado controlado con `useState` (no React Hook Form). Patrón estándar:

```tsx
const [form, setForm] = useState<FormState>(EMPTY_FORM);
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
const [busy, setBusy] = useState(false);

function setFieldValue(field: keyof FormState, value: string) {
  setForm((current) => ({ ...current, [field]: value }));
  setFieldErrors((current) => ({ ...current, [field]: "" }));
}

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setBusy(true);
  // ... llamada a API, gestión de errores por campo
}
```

Los campos con error reciben `aria-invalid="true"` y tienen un `<span>` con `role="alert"` asociado via `aria-describedby`:

```tsx
<input
  type="text"
  id="title"
  required
  aria-describedby="title-error"
  aria-invalid={fieldErrors.title ? "true" : undefined}
  value={form.title}
  onChange={(e) => setFieldValue("title", e.currentTarget.value)}
/>
<span id="title-error" className="field-error" role="alert">
  {fieldErrors.title ?? ""}
</span>
```

### Diálogos modales

El proyecto tiene dos niveles de diálogos:

1. **`ModalFrame`** (`shared/`): overlay básico con cierre por Escape y click fuera. Bloquea scroll.
2. **`Dialog`** (`ui/`): diálogo completo con trap de foco, header con título y botón de cierre, restauración de foco al cerrar.

Ambos usan `role="dialog"`, `aria-modal="true"` y `aria-labelledby` para el título.

### Feedback accesible

El componente `AccessibleFeedback` muestra mensajes de éxito/error con `role="alert"` o `role="status"`:

```tsx
<AccessibleFeedback message={errorMessage} variant="error" polite={false} />
<AccessibleFeedback message={successMessage} variant="success" />
```

### Tablas CRUD

El componente genérico `CrudTable<T>` renderiza tablas con columnas tipadas:

```tsx
<CrudTable
  columns={[
    { id: "name", header: "Nombre", cell: (row) => row.name },
    { id: "actions", header: "", cell: (row) => <button>Editar</button> },
  ]}
  rows={items}
  getRowKey={(row) => row.id}
  emptyMessage="No hay elementos"
/>
```

### Peticiones a la API

Todas las islands usan `getApiClient()` para obtener un cliente tipado. Patrón habitual al montar:

```tsx
useEffect(() => {
  void (async () => {
    const api = await getApiClient();
    const result = await api.listResources({ limit: 20 });
    setResources(result.data);
  })();
}, []);
```

### Comunicación entre islands

Cuando dos islands en la misma página necesitan coordinarse (ej: barra de búsqueda + resultados), usan CustomEvents del DOM:

```tsx
// Emitir desde SearchBarIsland
dispatchCatalogQuerySync(query);

// Escuchar en CatalogIsland
useEffect(() => {
  function handleQueryChange(event: Event) {
    const { query } = (event as CustomEvent<CatalogQueryDetail>).detail;
    // actualizar estado...
  }
  window.addEventListener(CATALOG_QUERY_CHANGE_EVENT, handleQueryChange);
  return () => window.removeEventListener(CATALOG_QUERY_CHANGE_EVENT, handleQueryChange);
}, []);
```

### Actualizaciones optimistas

Para acciones sociales (favoritos, valoraciones), se actualiza el estado local inmediatamente y se revierte si la API falla:

```tsx
const handleBookmark = useCallback(async (e: React.MouseEvent) => {
  e.preventDefault();
  setBookmarked((prev) => !prev); // optimistic
  try {
    const api = await getApiClient();
    const result = await api.toggleFavorite(resource.slug);
    setBookmarked(result.favorited);
  } catch {
    setBookmarked((prev) => !prev); // rollback
  }
}, [resource.slug]);
```

---

## Patrones Astro

### Scripts en archivos `.astro`

Los bloques `<script>` en archivos `.astro` se procesan y empaquetan por Astro. Se pueden usar imports de TypeScript directamente:

```astro
<script>
  import { getApiClient } from "../lib/get-api-client.ts";
  // lógica de cliente...
</script>
```

**Nota**: con la migración a React islands, la mayoría de la lógica de cliente está ahora en los componentes React. Los `<script>` de Astro se reservan para lógica mínima que no justifica una island (analytics, theme toggle).

### TypeScript en Astro

Definir siempre una interfaz `Props` en el frontmatter del componente `.astro`:

```astro
---
interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---
```

---

## Optimización de imágenes

### Componente `<Image />`

Usar el componente `<Image />` de `astro:assets` para todas las imágenes estáticas. Astro optimiza automáticamente: convierte a WebP, añade `width`, `height`, `decoding="async"` y `loading="lazy"`:

```astro
---
import { Image } from "astro:assets";
import portada from "../assets/portada-recurso.png";
---
<Image src={portada} alt="Descripción del recurso educativo" />
```

**Regla del proyecto**: toda `<img>` debe tener `alt` descriptivo. Para imágenes decorativas usar `alt=""` y `role="presentation"`.

### Imágenes en componentes React

Las imágenes dinámicas en React islands (miniaturas de recursos, avatares) usan `<img>` estándar con `loading="lazy"` y dimensiones explícitas para evitar CLS.

---

## View Transitions

Para transiciones entre páginas sin recarga completa, Astro ofrece `astro:transitions`:

```astro
---
import { ClientRouter } from "astro:transitions";
---
<head>
  <ClientRouter />
</head>
```

**Precaución**: las View Transitions re-ejecutan scripts. Las React islands se rehidratan automáticamente, pero event listeners manuales sobre `document` pueden necesitar re-binding.

---

## Integración Uppy/Tus para uploads resumibles

Uppy se integra como island React (no como script suelto). Configuración base:

```typescript
import Uppy from "@uppy/core";
import Tus from "@uppy/tus";

const uppy = new Uppy({
  autoProceed: true,
  restrictions: {
    maxFileSize: config.maxFileSizeBytes,
    maxNumberOfFiles: config.maxFilesPerBatch,
    allowedFileTypes: [...config.allowedExtensions, ...config.allowedMimeTypes],
  },
});

uppy.use(Tus, {
  endpoint: "/api/uploads",
  withCredentials: true,
  chunkSize: config.chunkSizeBytes,
  retryDelays: [0, 1000, 3000, 5000],
  allowedMetaFields: ["resourceId", "filename", "mimeType"],
});
```

**Notas clave**:
- `retryDelays: [0, 1000, 3000, 5000]` hace que Uppy reintente automáticamente hasta 4 veces con retardo progresivo.
- `allowedMetaFields` limita qué campos de metadata se envían al servidor tus.
- Los valores de restricciones se obtienen dinámicamente de la API para consistencia con los límites del servidor.

### Destrucción

Al desmontar la island, llamar siempre a `uppy.destroy()` en el cleanup del `useEffect` para liberar recursos.

---

## Accesibilidad específica del proyecto

### ARIA en formularios React

Patrón obligatorio para campos con validación:

1. Cada `<input>` tiene `aria-describedby` apuntando a su `<span>` de error.
2. El `<span>` de error tiene `role="alert"` para que los lectores de pantalla anuncien errores automáticamente.
3. Al fallar la validación, el campo recibe `aria-invalid="true"`.
4. Los mensajes globales de éxito usan `role="status"` con `aria-live="polite"`.
5. Los mensajes globales de error usan `role="alert"`.

### Diálogos y foco

- `Dialog` implementa trap de foco: al abrir, mueve el foco al primer elemento focusable; al cerrar con Escape, restaura el foco al activador.
- `ModalFrame` gestiona cierre por Escape y click fuera del contenido.
- Ambos usan `role="dialog"`, `aria-modal="true"` y `aria-labelledby`.

### Semántica HTML

- Usar `<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`, `<article>` correctamente. Cada página tiene un solo `<main>`.
- Los encabezados (`<h1>` a `<h6>`) siguen jerarquía estricta: un solo `<h1>` por página, sin saltar niveles.
- Los listados de recursos usan `<ul>` con `<li>`. Las tablas de datos usan `<table>` con `<thead>`, `<th scope>`.
- Los enlaces de acción usan `<a>` si navegan, `<button>` si ejecutan una acción. Nunca `<div onClick>`.

### Navegación por teclado

- Todos los controles interactivos deben ser alcanzables con Tab.
- Los drawers y diálogos gestionan el foco correctamente (ver sección de diálogos).
- Las tarjetas de recurso: el enlace principal (título/card completa) recibe el foco; las acciones secundarias (favorito, compartir) son botones con `aria-label` descriptivo.

### Directivas de hidratación y accesibilidad

Los componentes React que gestionen foco, anuncios ARIA o navegación por teclado deben usar `client:load` o `client:idle` — nunca `client:visible`, porque el usuario de lector de pantalla podría interactuar antes de que el componente sea visible en el viewport.

---

## Rendimiento

### Estrategia de hidratación parcial

Astro envía cero JavaScript de cliente por defecto. Cada island React añade JS. Directrices:

1. **Deduplicación de React**: `react` + `react-dom` se cargan una sola vez (~80-90 KB gzip) y se comparten entre todas las islands.
2. **Mayoría estática**: las páginas de contenido estático (landing, about) minimizan islands. Las páginas funcionales (catálogo, admin) pueden ser una island grande.
3. **Prioridad de directiva**: `client:visible` > `client:idle` > `client:load`. Usar `client:load` para la island principal de la página.

### Imágenes

- Usar `<Image />` de `astro:assets` para imágenes estáticas.
- Las miniaturas de tarjetas de recurso deben tener dimensiones explícitas para evitar layout shift (CLS).
- Las imágenes above-the-fold usan `loading="eager"`. El resto usa `loading="lazy"`.

### Prefetch

Astro soporta prefetch de enlaces con `data-astro-prefetch`. Usarlo en los enlaces de tarjetas de recurso para que la ficha cargue instantáneamente.

---

## Testing de componentes React

### Unitarios con @testing-library/react

```tsx
import { render, screen } from "@testing-library/react";
import { expect, test } from "bun:test";
import { Button } from "./Button.tsx";

test("renders button with label", () => {
  render(<Button>Guardar</Button>);
  expect(screen.getByRole("button", { name: "Guardar" })).toBeDefined();
});
```

Los test files van junto al componente con sufijo `.unit.test.tsx`.

### Convenciones de testing

- Testear comportamiento, no implementación.
- Usar roles ARIA (`getByRole`) como selector principal.
- Los tests de islands verifican flujos completos (montar → cargar datos → interactuar → verificar resultado).
- Runner: `bun test` (no Vitest, no Jest).

---

## Entregables

- Flujos de usuario y wireframes textuales para descubrimiento, búsqueda y ficha de recurso.
- Arquitectura de la UI para el panel de facetas.
- Decisiones de navegación y comportamiento de estados vacíos.
- Componentes React con tipos, accesibilidad y CSS.
- Tests unitarios de componentes con @testing-library/react.
- Reglas de accesibilidad específicas del proyecto y criterios de validación UX.

## Regla

La interfaz debe reducir la complejidad del catálogo, no exponerla sin filtrar. Si un flujo necesita explicación, si un filtro de faceta confunde o si la búsqueda simple no devuelve lo esperado a simple vista, el diseño frontend y UX falla.
