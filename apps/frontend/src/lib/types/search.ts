/** Sort options for search results */
export type SearchSort = "relevance" | "date_desc" | "date_asc" | "rating" | "popularity";

/** Date range filter presets */
export type DateRangePreset = "last_month" | "last_year" | "last_2_years" | "any";

/** Active filters on a search query */
export interface SearchFilters {
  resourceType?: string;
  language?: string;
  license?: string;
  subject?: string;
  level?: string;
  collection?: string;
  tag?: string;
  dateRange?: DateRangePreset;
}

/** Full search query with filters, pagination, and sorting */
export interface SearchQuery {
  q?: string;
  filters: SearchFilters;
  sort?: SearchSort;
  page?: number;
  pageSize?: number;
}

/** A single facet value with its count */
export interface FacetItem {
  value: string;
  label: string;
  count: number;
}

/** A group of facet values for a filter dimension */
export interface FacetGroup {
  key: string;
  label: string;
  items: FacetItem[];
}

/** Paginated search result with optional facets */
export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets?: FacetGroup[];
}
