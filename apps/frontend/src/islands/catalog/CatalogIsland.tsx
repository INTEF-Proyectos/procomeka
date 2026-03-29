import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import type { Resource } from "../../lib/api-client.ts";
import {
	CATALOG_QUERY_CHANGE_EVENT,
	dispatchCatalogQuerySync,
	type CatalogQueryDetail,
} from "../../lib/catalog-events.ts";
import { getApiClient } from "../../lib/get-api-client.ts";
import {
	buildListingUrl,
	readListingState,
	writeListingStateToHistory,
	type ListingState,
} from "../../lib/listing-history.ts";
import { DEFAULT_PAGE_SIZE, getPaginationState } from "../../lib/pagination.ts";
import { url } from "../../lib/paths.ts";
import {
	LANGUAGE_OPTIONS,
	LICENSE_OPTIONS,
	loadFilterOptions,
	RESOURCE_TYPE_OPTIONS,
	type FilterOption,
} from "../../lib/resource-filters.ts";
import { TYPE_ICONS } from "../../lib/resource-display.ts";
import "../../lib/paraglide-client.ts";
import * as m from "../../paraglide/messages.js";

type ViewMode = "grid" | "list";
type SortMode = "relevance" | "recent";
type HistoryMode = "push" | "replace";

const DEFAULT_LISTING_STATE: ListingState = {
	query: "",
	page: 1,
	resourceType: "",
	language: "",
	license: "",
};

function getResourceIcon(type: string) {
	return TYPE_ICONS[type] ?? "&#128196;";
}

function renderPaginationPages(currentPage: number, totalPages: number): Array<number | "..."> {
	const pages: Array<number | "..."> = [];

	for (let page = 1; page <= totalPages; page += 1) {
		if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
			pages.push(page);
			continue;
		}

		if (pages[pages.length - 1] !== "...") {
			pages.push("...");
		}
	}

	return pages;
}

function ResourceCard({ resource, initialFavorited = false, isLoggedIn = false, badges }: { resource: Resource; initialFavorited?: boolean; isLoggedIn?: boolean; badges?: { text: string; variant: "primary" | "tertiary" }[] }) {
	const description = resource.description || "";
	const clipped = description.length > 140 ? `${description.slice(0, 140)}...` : description;
	const hasPreview = !!resource.elpxPreview?.previewUrl;
	const previewRef = useRef<HTMLDivElement>(null);
	const authorInitial = (resource.createdByName || resource.author || "?").charAt(0).toUpperCase();
	const [bookmarked, setBookmarked] = useState(initialFavorited);
	const [copied, setCopied] = useState(false);

	// Sync when initialFavorited changes (loaded async)
	useEffect(() => {
		setBookmarked(initialFavorited);
	}, [initialFavorited]);

	const handleBookmark = useCallback(async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isLoggedIn) {
			window.location.href = url("login");
			return;
		}
		setBookmarked((prev) => !prev); // optimistic
		setFavCount((prev) => prev + (bookmarked ? -1 : 1)); // optimistic
		try {
			const api = await getApiClient();
			const result = await api.toggleFavorite(resource.slug);
			setBookmarked(result.favorited);
			setFavCount(result.count);
		} catch {
			setBookmarked((prev) => !prev); // rollback
			setFavCount((prev) => prev + (bookmarked ? 1 : -1)); // rollback
		}
	}, [resource.slug, isLoggedIn]);

	const handleShare = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const resourceUrl = new URL(url(`recurso?slug=${resource.slug}`), window.location.origin).href;
		navigator.clipboard.writeText(resourceUrl).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}, [resource.slug]);

	useEffect(() => {
		if (!previewRef.current) return;
		const wrapper = previewRef.current;
		const iframe = wrapper.querySelector("iframe");
		if (!iframe) return;
		const IFRAME_W = 1200, IFRAME_H = 675;
		function rescale() {
			const w = wrapper.clientWidth || 280;
			const h = wrapper.clientHeight || 158;
			const scale = Math.min(w / IFRAME_W, h / IFRAME_H);
			iframe!.style.transform = `scale(${scale})`;
		}
		rescale();
		window.addEventListener("resize", rescale);
		return () => window.removeEventListener("resize", rescale);
	}, [hasPreview]);

	const [favCount, setFavCount] = useState(Number((resource as Record<string, unknown>).favoriteCount ?? 0));
	const rating = (resource as Record<string, unknown>).rating as { average: number; count: number } | undefined;

	const badgeOverlay = badges && badges.length > 0 ? (
		<div className="card-badges">
			{badges.map((b) => (
				<span key={b.text} className={`card-badge card-badge-${b.variant}`}>{b.text}</span>
			))}
		</div>
	) : null;

	return (
		<a href={url(`recurso?slug=${resource.slug}`)} className={`resource-card${hasPreview ? " has-preview" : ""}`}>
			{hasPreview ? (
				<div className="card-preview" ref={previewRef}>
					<iframe
						src={resource.elpxPreview!.previewUrl}
						loading="lazy"
						tabIndex={-1}
						sandbox="allow-scripts allow-same-origin"
						title={m.catalog_preview()}
					/>
					<div className="card-preview-overlay" />
					{badgeOverlay}
				</div>
			) : (
				<div className="card-preview" style={{ background: `linear-gradient(135deg, var(--color-surface-container-low) 0%, var(--color-surface-container-high) 100%)` }}>
					<div
						style={{ fontSize: "3rem", opacity: 0.4 }}
						aria-hidden="true"
						dangerouslySetInnerHTML={{ __html: getResourceIcon(resource.resourceType) }}
					/>
					{badgeOverlay}
				</div>
			)}
			<div className="card-body">
				<div className="card-tags">
					<span className="pill pill-type">{resource.resourceType}</span>
					<span className="pill pill-lang">
						{resource.language ? `\u2022 ${(resource.language).toUpperCase()}` : ""}
					</span>
				</div>
				<h3>{resource.title}</h3>
				<p>{clipped}</p>
				<div className="card-footer">
					<div className="card-author">
						<div className="card-author-avatar">{authorInitial}</div>
						<span className="card-author-name">
							{resource.createdByName || resource.author || m.common_anonymous()}
						</span>
					</div>
					<div className="card-actions">
						{rating && rating.count > 0 && (
							<span className="card-rating">
								<span className="material-symbols-outlined card-rating-star" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
								<span className="card-rating-value">{rating.average.toFixed(1)}</span>
							</span>
						)}
						<button
							className={`card-action-btn${bookmarked ? " card-action-active" : ""}`}
							aria-label={bookmarked ? m.common_remove_favorite() : m.common_save_favorite()}
							aria-pressed={bookmarked}
							onClick={handleBookmark}
							type="button"
						>
							<span className="material-symbols-outlined" style={bookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}>bookmark</span>
							{favCount > 0 && <span className="card-fav-count">{favCount}</span>}
						</button>
						<button
							className={`card-action-btn${copied ? " card-action-copied" : ""}`}
							aria-label={copied ? m.common_link_copied() : m.common_copy_link()}
							onClick={handleShare}
							type="button"
						>
							<span className="material-symbols-outlined">{copied ? "check" : "share"}</span>
						</button>
					</div>
				</div>
			</div>
		</a>
	);
}

export function CatalogIsland() {
	const [listingState, setListingState] = useState<ListingState>(DEFAULT_LISTING_STATE);
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [sortMode, setSortMode] = useState<SortMode>("relevance");
	const [resourceTypeOptions, setResourceTypeOptions] = useState<FilterOption[]>(RESOURCE_TYPE_OPTIONS);
	const [languageOptions, setLanguageOptions] = useState<FilterOption[]>(LANGUAGE_OPTIONS);
	const [licenseOptions, setLicenseOptions] = useState<FilterOption[]>(LICENSE_OPTIONS);
	const [resources, setResources] = useState<Resource[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [pagination, setPagination] = useState(() => getPaginationState(0, DEFAULT_PAGE_SIZE, 0));
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [favoritedSlugs, setFavoritedSlugs] = useState<Set<string>>(new Set());
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [badgeConfig, setBadgeConfig] = useState<import("../../lib/api-client.ts").BadgeConfig>({ novedadDays: 30, destacadoMinRatings: 3, destacadoMinAvg: 4.0, destacadoMinFavorites: 3 });
	const requestIdRef = useRef(0);
	const listingStateRef = useRef<ListingState>(DEFAULT_LISTING_STATE);

	useEffect(() => {
		listingStateRef.current = listingState;
	}, [listingState]);

	async function loadResources(nextState: ListingState, mode?: HistoryMode) {
		const requestId = requestIdRef.current + 1;
		requestIdRef.current = requestId;
		setLoading(true);
		setError("");

		try {
			const api = await getApiClient();
			const offset = (nextState.page - 1) * DEFAULT_PAGE_SIZE;
			const result = await api.listResources({
				q: nextState.query || undefined,
				limit: DEFAULT_PAGE_SIZE,
				offset,
				resourceType: nextState.resourceType || undefined,
				language: nextState.language || undefined,
				license: nextState.license || undefined,
			});

			if (requestId !== requestIdRef.current) return;

			const paginationState = getPaginationState(result.total, result.limit, result.offset);
			if (nextState.page > paginationState.totalPages) {
				await applyListingState({ ...nextState, page: 1 }, "replace", { syncSearch: false, scrollToTop: false });
				return;
			}

			startTransition(() => {
				setResources(result.data);
				setTotal(result.total);
				setPagination(paginationState);
				setLoading(false);
			});

			if (mode) {
				writeListingStateToHistory(
					window.history,
					buildListingUrl(window.location.pathname, window.location.search, nextState),
					mode,
				);
			}
		} catch {
			if (requestId !== requestIdRef.current) return;
			setResources([]);
			setTotal(0);
			setPagination(getPaginationState(0, DEFAULT_PAGE_SIZE, 0));
			setError(m.catalog_error());
			setLoading(false);
		}
	}

	async function applyListingState(
		nextState: ListingState,
		mode: HistoryMode,
		options?: { syncSearch?: boolean; scrollToTop?: boolean },
	) {
		const syncSearch = options?.syncSearch ?? true;
		const scrollToTop = options?.scrollToTop ?? false;

		setListingState(nextState);
		setSidebarOpen(false);

		if (syncSearch) {
			dispatchCatalogQuerySync(nextState.query);
		}

		await loadResources(nextState, mode);

		if (scrollToTop) {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}

	useEffect(() => {
		const nextViewMode = localStorage.getItem("catalog-view") === "list" ? "list" : "grid";
		const nextState = readListingState(window.location.search);
		setViewMode(nextViewMode);
		setListingState(nextState);
		listingStateRef.current = nextState;
		dispatchCatalogQuerySync(nextState.query);

		void Promise.all([
			loadFilterOptions("resource-type", m.catalog_all_types(), RESOURCE_TYPE_OPTIONS),
			loadFilterOptions("language", m.catalog_all_languages(), LANGUAGE_OPTIONS),
			loadFilterOptions("license", m.catalog_all_licenses(), LICENSE_OPTIONS),
		]).then(([types, languages, licenses]) => {
			setResourceTypeOptions(types);
			setLanguageOptions(languages);
			setLicenseOptions(licenses);
		});

		void loadResources(nextState);

		// Load user session + favorites + badge config
		void (async () => {
			try {
				const api = await getApiClient();
				const [session, config] = await Promise.all([
					api.getSession().catch(() => null),
					api.getBadgeConfig().catch(() => null),
				]);
				if (config) setBadgeConfig(config);
				if (session?.user) {
					setIsLoggedIn(true);
					const favs = await api.getUserFavorites({ limit: 200 });
					setFavoritedSlugs(new Set(favs.data.map((r) => r.slug)));
				}
			} catch {
				// not logged in
			}
		})();

		function handlePopState() {
			const popState = readListingState(window.location.search);
			setListingState(popState);
			dispatchCatalogQuerySync(popState.query);
			void loadResources(popState);
		}

		function handleQueryChange(event: Event) {
			const customEvent = event as CustomEvent<CatalogQueryDetail>;
			const nextQuery = customEvent.detail?.query ?? "";
			void applyListingState({ ...listingStateRef.current, query: nextQuery, page: 1 }, "replace", { syncSearch: false });
		}

		window.addEventListener("popstate", handlePopState);
		window.addEventListener(CATALOG_QUERY_CHANGE_EVENT, handleQueryChange as EventListener);

		return () => {
			window.removeEventListener("popstate", handlePopState);
			window.removeEventListener(CATALOG_QUERY_CHANGE_EVENT, handleQueryChange as EventListener);
		};
	}, []);

	function updateViewMode(nextViewMode: ViewMode) {
		setViewMode(nextViewMode);
		localStorage.setItem("catalog-view", nextViewMode);
	}

	function updateSortMode(nextSort: SortMode) {
		setSortMode(nextSort);
		// TODO: pass sort param to API when backend supports it
		void applyListingState({ ...listingState, page: 1 }, "replace");
	}

	const paginationPages = renderPaginationPages(pagination.currentPage, pagination.totalPages);
	const resourcesClassName = viewMode === "list" ? "resources-list-view" : "resources-grid";

	/* Format total for display */
	const formattedTotal = total.toLocaleString();

	return (
		<div className="catalog">
			<aside className={`sidebar${sidebarOpen ? " open" : ""}`} id="sidebar">
				<h2 className="sidebar-title">{m.catalog_advanced_filters()}</h2>

				<div className="filter-group">
					<label htmlFor="filter-resource-type">{m.catalog_resource_type()}</label>
					<select
						id="filter-resource-type"
						value={listingState.resourceType}
						onChange={(event) => {
							void applyListingState(
								{ ...listingState, resourceType: event.currentTarget.value, page: 1 },
								"replace",
							);
						}}
					>
						{resourceTypeOptions.map((option) => (
							<option key={option.value || "all"} value={option.value}>{option.label}</option>
						))}
					</select>
				</div>

				<div className="filter-group">
					<label htmlFor="filter-language">{m.catalog_language()}</label>
					<select
						id="filter-language"
						value={listingState.language}
						onChange={(event) => {
							void applyListingState(
								{ ...listingState, language: event.currentTarget.value, page: 1 },
								"replace",
							);
						}}
					>
						{languageOptions.map((option) => (
							<option key={option.value || "all"} value={option.value}>{option.label}</option>
						))}
					</select>
				</div>

				<div className="filter-group">
					<label htmlFor="filter-license">{m.catalog_license()}</label>
					<select
						id="filter-license"
						value={listingState.license}
						onChange={(event) => {
							void applyListingState(
								{ ...listingState, license: event.currentTarget.value, page: 1 },
								"replace",
							);
						}}
					>
						{licenseOptions.map((option) => (
							<option key={option.value || "all"} value={option.value}>{option.label}</option>
						))}
					</select>
				</div>

				<button
					id="clear-filters"
					className="clear-btn"
					type="button"
					onClick={() => {
						void applyListingState(DEFAULT_LISTING_STATE, "replace");
					}}
				>
					{m.catalog_clear_filters()}
				</button>
			</aside>

			<section className="content" style={{ flexGrow: 1, minWidth: 0 }}>
				<div className="toolbar">
					<div className="toolbar-left">
						<button
							id="toggle-sidebar"
							className="toggle-sidebar-btn"
							type="button"
							onClick={() => setSidebarOpen((current) => !current)}
						>
							<span className="material-symbols-outlined" style={{ fontSize: "1.125rem" }}>filter_list</span>
							{m.catalog_filters()}
						</button>
						{listingState.query ? (
							<p className="results-summary-query" aria-live="polite">
								{m.catalog_results_for()} &ldquo;{listingState.query}&rdquo;
							</p>
						) : null}
						<h1 className="results-summary-count" aria-live="polite">
							{loading ? m.catalog_searching() : error ? m.catalog_no_results() : m.catalog_resources_count({ count: formattedTotal })}
						</h1>
					</div>
					<div className="toolbar-right">
						{/* View toggle: grid / list */}
						<div className="view-toggle">
							<button
								className={`view-toggle-btn${viewMode === "grid" ? " active" : ""}`}
								type="button"
								title={m.catalog_grid_view()}
								aria-label={m.catalog_grid_view()}
								onClick={() => updateViewMode("grid")}
							>
								<span className="material-symbols-outlined">grid_view</span>
							</button>
							<button
								className={`view-toggle-btn${viewMode === "list" ? " active" : ""}`}
								type="button"
								title={m.catalog_list_view()}
								aria-label={m.catalog_list_view()}
								onClick={() => updateViewMode("list")}
							>
								<span className="material-symbols-outlined">view_list</span>
							</button>
						</div>
						{/* Sort toggle: relevance / recent */}
						<span className="toolbar-sort-label">{m.catalog_sort_by()}</span>
						<div className="sort-toggle">
							<button
								className={`sort-toggle-btn${sortMode === "relevance" ? " active" : ""}`}
								type="button"
								onClick={() => updateSortMode("relevance")}
							>
								{m.catalog_sort_relevance()}
							</button>
							<button
								className={`sort-toggle-btn${sortMode === "recent" ? " active" : ""}`}
								type="button"
								onClick={() => updateSortMode("recent")}
							>
								{m.catalog_sort_recent()}
							</button>
						</div>
					</div>
				</div>

				<div className={resourcesClassName} aria-live="polite">
					{loading ? <p className="loading">{m.catalog_loading()}</p> : null}
					{!loading && error ? <p className="empty">{error}</p> : null}
					{!loading && !error && resources.length === 0 ? (
						<p className="empty">{m.catalog_empty()}</p>
					) : null}
					{!loading && !error && resources.map((resource) => {
						const r = resource as Record<string, unknown>;
						const cardBadges: { text: string; variant: "primary" | "tertiary" }[] = [];
						const createdAt = resource.createdAt ? new Date(resource.createdAt as string) : null;
						if (createdAt && Math.floor((Date.now() - createdAt.getTime()) / 86400000) <= badgeConfig.novedadDays) {
							cardBadges.push({ text: "Novedad", variant: "primary" });
						}
						const rating = r.rating as { average: number; count: number } | undefined;
						const favCount = Number(r.favoriteCount ?? 0);
						if (rating && rating.count >= badgeConfig.destacadoMinRatings && rating.average >= badgeConfig.destacadoMinAvg && favCount >= badgeConfig.destacadoMinFavorites) {
							cardBadges.push({ text: "Destacado", variant: "tertiary" });
						}
						return <ResourceCard key={resource.id} resource={resource} initialFavorited={favoritedSlugs.has(resource.slug)} isLoggedIn={isLoggedIn} badges={cardBadges} />;
					})}
				</div>

				<nav className="pagination" aria-label={m.pagination_label()} hidden={pagination.totalPages <= 1}>
					<button
						type="button"
						className="pag-btn"
						disabled={!pagination.hasPreviousPage}
						onClick={() => {
							void applyListingState(
								{ ...listingState, page: pagination.currentPage - 1 },
								"push",
								{ scrollToTop: true },
							);
						}}
					>
						<span className="material-symbols-outlined">chevron_left</span>
					</button>
					<div className="pag-numbers">
						{paginationPages.map((page, index) => (
							page === "..." ? (
								<span key={`ellipsis-${index}`} className="pag-ellipsis">&hellip;</span>
							) : (
								<button
									key={page}
									type="button"
									className={`pag-num${page === pagination.currentPage ? " active" : ""}`}
									onClick={() => {
										void applyListingState(
											{ ...listingState, page },
											"push",
											{ scrollToTop: true },
										);
									}}
								>
									{page}
								</button>
							)
						))}
					</div>
					<button
						type="button"
						className="pag-btn"
						disabled={!pagination.hasNextPage}
						onClick={() => {
							void applyListingState(
								{ ...listingState, page: pagination.currentPage + 1 },
								"push",
								{ scrollToTop: true },
							);
						}}
					>
						<span className="material-symbols-outlined">chevron_right</span>
					</button>
				</nav>
			</section>
		</div>
	);
}
