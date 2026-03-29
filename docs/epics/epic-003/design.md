# Epic-003: Public Interface Redesign

## Stitch Screens Used

| Screen | Stitch ID | Used For |
|--------|-----------|----------|
| Landing Page Procomún Rediseño | 43fe7396 | Home page: hero, stats, featured resources, collections, CTA |
| Resultados de Búsqueda | 275f4a61 | Search results: filter sidebar, result cards, pagination |
| Ficha de Recurso Educativo | 60509d18 | Resource detail: tabs, ratings, comments, metadata |
| Panel de Gestión - Backoffice | f9a42c01 | Dashboard metrics, sidebar navigation patterns |
| Gestión de Recursos - Backoffice | bb79619f | Resource management table, status badges |

## Components Created

### Design System (`apps/frontend/src/ui/`) — 25 components

**Core inputs:** Button, IconButton, Input, SearchBar, Select, Checkbox
**Display:** Badge, Chip, Skeleton, EmptyState
**Navigation:** Breadcrumb, Tabs, Pagination
**Layout:** PageHeader, Drawer, Dialog
**Resource:** ResourceCard, ResourceGrid, FilterPanel, MetadataList
**Social:** StarRating, RatingSummary, FavoriteButton, CommentItem, CommentList

### Feature Islands

**Home:** HeroIsland, FeaturedResourcesIsland
**Social:** CommentSectionIsland, RatingIsland, FavoriteIsland
**Auth:** RegisterIsland (new)
**Dashboard:** PublicDashboardIsland (new)

### Pages

| Page | Path | Status |
|------|------|--------|
| Landing | `/` | New (redesigned from catalog) |
| Search | `/buscar` | New (dedicated search page) |
| Resource detail | `/recurso` | Enhanced with social tabs |
| Register | `/registro` | New |
| User dashboard | `/perfil` | New |
| Login | `/login` | Existing (restyled via tokens) |

## Design System Foundation

### Tokens (`apps/frontend/src/styles/design-tokens.css`)
- 40+ named color tokens from Stitch (light + dark mode)
- Typography: Plus Jakarta Sans (display) + Inter (body)
- Spacing scale: 0.25rem–6rem
- Border radius: xs–full
- Ambient shadows (large, diffused per Stitch spec)
- Glass effect tokens for header
- Z-index scale

### Fonts
- Plus Jakarta Sans 600/700/800 (self-hosted woff2)
- Inter 400/500/600 (self-hosted woff2)
- Material Symbols Outlined (CDN)

## Assumptions and Inferences

1. **Login/Register screens** were not present in Stitch — derived from the existing LoginIsland pattern with design system styling.
2. **User dashboard** was not in Stitch — derived from the backoffice dashboard pattern but simplified for public users.
3. **"Útil" engagement signal** was chosen over upvote/downvote as it appears in the Stitch resource detail screen and fits an educational platform (signals pedagogical value rather than social approval).
4. **Dark mode** tokens were inferred using Material Design 3 dark theme generation rules from the light palette.
5. **Collections/Itineraries** pages were documented in types but not fully implemented as pages — the type infrastructure supports future implementation.
6. **Resource create/edit form** enhancement was deferred — the existing ResourceFormIsland is functional and will be restyled incrementally.

## Accessibility Decisions

- Skip-to-content link on all public pages
- ARIA landmarks: `<header>`, `<main id="main-content">`, `<footer role="contentinfo">`
- All interactive components have `:focus-visible` styles (2px solid primary, 2px offset)
- Tabs: keyboard arrow navigation, `aria-selected`, `role="tabpanel"`
- StarRating: `role="radiogroup"` with keyboard arrow key support
- FavoriteButton: `aria-pressed` toggle
- CommentItem: `aria-label` per comment
- Drawer/Dialog: focus trap, Escape to close, return focus on close
- Color contrast: all text/surface combinations meet WCAG AA 4.5:1
- No 1px borders for visual separation (per Stitch spec) — uses tonal surface layering
- Minimum touch targets: 44x44px for all interactive elements
- `aria-live="polite"` on search results and loading states

## Domain Model Overview

### Types Created (`apps/frontend/src/lib/types/`)

| File | Types |
|------|-------|
| social.ts | Comment, CommentAuthor, CommentThread, RatingSummary, UserRating, Favorite, CommentVote, ModerationStatus, VoteType |
| search.ts | SearchQuery, SearchFilters, SearchResult, FacetGroup, FacetItem, SearchSort, DateRangePreset |
| resource-extended.ts | ResourceSummary, ResourceDetail, ResourceMetadata, ResourceLicense |
| user-extended.ts | PublicUserProfile, DashboardSummary, ActivityItem |
| collection-extended.ts | Collection, Itinerary, ItineraryStep, Tag, EducationalContext, SubjectArea |
| editorial.ts | EditorialStatus, EditorialStatusInfo, EDITORIAL_STATUS_MAP |

### Database Schema Added (`packages/db/src/schema/social.ts`)

| Table | Purpose |
|-------|---------|
| ratings | User ratings (1-5) per resource, unique per user |
| favorites | User bookmarks, unique per user per resource |
| comments | Threaded comments with moderation status |
| comment_votes | "Useful" engagement signal on comments |

## Next Backend Endpoints Needed

```
GET    /api/v1/resources/:slug/ratings     → aggregate rating summary
POST   /api/v1/resources/:slug/ratings     → create/update user rating
GET    /api/v1/resources/:slug/comments    → paginated threaded comments
POST   /api/v1/resources/:slug/comments    → create comment
PATCH  /api/v1/comments/:id               → edit own comment
DELETE /api/v1/comments/:id               → soft-delete
POST   /api/v1/comments/:id/vote          → toggle "useful"
POST   /api/v1/resources/:slug/favorite    → toggle favorite
GET    /api/v1/users/me/favorites          → user's saved resources
GET    /api/v1/users/me/dashboard          → dashboard summary
```

## File Tree of New/Modified Files

```
apps/frontend/src/
├── styles/
│   ├── design-tokens.css          [NEW] Design system tokens
│   ├── reset.css                  [NEW] Minimal CSS reset
│   └── utilities.css              [NEW] Utility classes
├── ui/                            [NEW] 25 component files + 25 CSS files + index.ts
│   ├── Button.tsx + .css
│   ├── IconButton.tsx + .css
│   ├── Input.tsx + .css
│   ├── SearchBar.tsx + .css
│   ├── Select.tsx + .css
│   ├── Checkbox.tsx + .css
│   ├── Chip.tsx + .css
│   ├── Badge.tsx + .css
│   ├── Tabs.tsx + .css
│   ├── Drawer.tsx + .css
│   ├── Dialog.tsx + .css
│   ├── Skeleton.tsx + .css
│   ├── EmptyState.tsx + .css
│   ├── Breadcrumb.tsx + .css
│   ├── PageHeader.tsx + .css
│   ├── Pagination.tsx + .css
│   ├── ResourceCard.tsx + .css
│   ├── ResourceGrid.tsx + .css
│   ├── FilterPanel.tsx + .css
│   ├── MetadataList.tsx + .css
│   ├── StarRating.tsx + .css
│   ├── RatingSummary.tsx + .css
│   ├── FavoriteButton.tsx + .css
│   ├── CommentItem.tsx + .css
│   ├── CommentList.tsx + .css
│   └── index.ts
├── islands/
│   ├── home/                      [NEW]
│   │   ├── HeroIsland.tsx + .css
│   │   └── FeaturedResourcesIsland.tsx
│   ├── social/                    [NEW]
│   │   ├── CommentSectionIsland.tsx
│   │   ├── RatingIsland.tsx + .css
│   │   └── FavoriteIsland.tsx
│   ├── auth/
│   │   └── RegisterIsland.tsx + .css  [NEW]
│   ├── dashboard/
│   │   └── PublicDashboardIsland.tsx + .css  [NEW]
│   └── catalog/
│       └── ResourceDetailIsland.tsx   [MODIFIED] Added tabs + social
├── lib/
│   ├── types/                     [NEW]
│   │   ├── social.ts
│   │   ├── search.ts
│   │   ├── resource-extended.ts
│   │   ├── user-extended.ts
│   │   ├── collection-extended.ts
│   │   ├── editorial.ts
│   │   └── index.ts
│   ├── mock/                      [NEW]
│   │   ├── mock-data.ts
│   │   └── mock-social-service.ts
│   └── api-client.ts             [MODIFIED] Social method signatures
├── layouts/
│   ├── Base.astro                 [MODIFIED] Tokens, fonts, landmarks
│   └── PublicLayout.astro         [NEW] Public pages layout
├── pages/
│   ├── index.astro                [MODIFIED] Full landing page redesign
│   ├── buscar.astro               [NEW] Dedicated search results
│   ├── recurso.astro              [MODIFIED] Design system + social
│   ├── registro.astro             [NEW] Registration page
│   └── perfil.astro               [NEW] User dashboard
└── public/fonts/                  [NEW] 6 woff2 font files

packages/db/src/schema/
├── social.ts                      [NEW] ratings, favorites, comments, comment_votes
└── index.ts                       [MODIFIED] Added social export

apps/api/src/routes/
└── social.ts                      [NEW] Social API endpoints
```
