import { useEffect, useRef, useState } from "react";
import { getApiClient } from "../../lib/get-api-client.ts";
import { url } from "../../lib/paths.ts";
import type { Resource, CollectionRecord, BadgeConfig } from "../../lib/api-client.ts";
import "./HomeDataIsland.css";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string | number | Date | null): string {
	if (!dateStr) return "";
	const d = new Date(dateStr);
	const now = Date.now();
	const diffMs = now - d.getTime();
	const hours = Math.floor(diffMs / 3600000);
	if (hours < 1) return "Hace unos minutos";
	if (hours < 24) return `Hace ${hours}h`;
	const days = Math.floor(hours / 24);
	if (days === 1) return "Ayer";
	if (days < 7) return `Hace ${days} dias`;
	return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function shuffleAndPick<T>(arr: T[], n: number): T[] {
	const copy = [...arr];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j]!, copy[i]!];
	}
	return copy.slice(0, n);
}

// ---------------------------------------------------------------------------
// Scaled iframe preview component
// ---------------------------------------------------------------------------

function IframePreview({ src, className, iframeWidth = 1024, iframeHeight = 768, fillWidth = false }: { src: string; className?: string; iframeWidth?: number; iframeHeight?: number; fillWidth?: boolean }) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!ref.current) return;
		const wrapper = ref.current;
		const iframe = wrapper.querySelector("iframe");
		if (!iframe) return;
		// +20px extra para empujar la scrollbar fuera del overflow:hidden del contenedor
		iframe.style.width = `${iframeWidth + 20}px`;
		iframe.style.height = `${iframeHeight}px`;
		function rescale() {
			const w = wrapper.clientWidth || 280;
			const h = wrapper.clientHeight || 200;
			// fillWidth: scale to fill width (content may overflow vertically, hidden by overflow:hidden)
			const scale = fillWidth ? (w / iframeWidth) : Math.min(w / iframeWidth, h / iframeHeight);
			iframe!.style.transform = `scale(${scale})`;
		}
		rescale();
		window.addEventListener("resize", rescale);
		return () => window.removeEventListener("resize", rescale);
	}, [src, iframeWidth, iframeHeight, fillWidth]);

	return (
		<div className={`home-iframe-wrap ${className ?? ""}`} ref={ref}>
			<iframe src={src} loading="lazy" tabIndex={-1} sandbox="allow-scripts allow-same-origin" title="Vista previa" />
		</div>
	);
}

// ---------------------------------------------------------------------------
// Featured Resources Section
// ---------------------------------------------------------------------------

function FeaturedSection({ resources, badgeConfig }: { resources: Resource[]; badgeConfig: BadgeConfig }) {
	// Pick resources that meet "Destacado" criteria or have featuredAt
	const eligible = resources.filter((r) => {
		const rec = r as Record<string, unknown>;
		const rating = rec.rating as { average: number; count: number } | undefined;
		const favCount = Number(rec.favoriteCount ?? 0);
		const hasFeatured = !!(rec.featuredAt);
		const meetsThreshold = rating &&
			rating.count >= badgeConfig.destacadoMinRatings &&
			rating.average >= badgeConfig.destacadoMinAvg &&
			favCount >= badgeConfig.destacadoMinFavorites;
		return hasFeatured || meetsThreshold;
	});

	const picked = shuffleAndPick(eligible.length >= 2 ? eligible : resources, 2);
	const hero = picked[0];
	const secondary = picked[1];

	if (!hero) return null;

	const heroRec = hero as Record<string, unknown>;
	const heroRating = heroRec.rating as { average: number; count: number } | undefined;
	const heroPreview = hero.elpxPreview?.previewUrl;

	const secRec = secondary as Record<string, unknown> | undefined;
	const secRating = secRec?.rating as { average: number; count: number } | undefined;
	const secPreview = secondary?.elpxPreview?.previewUrl;

	return (
		<div className="home-featured-grid">
			{/* Hero card */}
			<a href={url(`recurso?slug=${hero.slug}`)} className="home-featured-hero">
				<div className="home-featured-hero-preview">
					{heroPreview ? (
						<IframePreview src={heroPreview} className="home-featured-iframe" fillWidth />
					) : (
						<div className="home-featured-placeholder">
							<span className="material-symbols-outlined" style={{ fontSize: "4rem", opacity: 0.3 }}>description</span>
						</div>
					)}
				</div>
				<div className="home-featured-hero-content">
					<div className="home-featured-badges">
						<span className="home-badge home-badge-level">{hero.resourceType}</span>
					</div>
					<h3 className="home-featured-hero-title">{hero.title}</h3>
					<p className="home-featured-hero-desc">{hero.description}</p>
					{heroRating && heroRating.count > 0 && (
						<div className="home-featured-rating">
							<span className="material-symbols-outlined home-star" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
							<span className="home-rating-value">{heroRating.average.toFixed(1)}</span>
							<span className="home-rating-count">({heroRating.count} valoraciones)</span>
						</div>
					)}
				</div>
			</a>

			{/* Secondary card */}
			{secondary && (
				<a href={url(`recurso?slug=${secondary.slug}`)} className="home-featured-secondary">
					<div className="home-featured-sec-preview">
						{secPreview ? (
							<IframePreview src={secPreview} className="home-featured-iframe" fillWidth />
						) : (
							<div className="home-featured-placeholder">
								<span className="material-symbols-outlined" style={{ fontSize: "3rem", opacity: 0.3 }}>description</span>
							</div>
						)}
					</div>
					<div className="home-featured-badges">
						<span className="home-badge home-badge-level">{secondary.resourceType}</span>
					</div>
					<h3 className="home-featured-sec-title">{secondary.title}</h3>
					<p className="home-featured-sec-desc">{secondary.description}</p>
					{secRating && secRating.count > 0 && (
						<div className="home-featured-sec-footer">
							<div className="home-featured-rating">
								<span className="material-symbols-outlined home-star" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
								<span className="home-rating-value">{secRating.average.toFixed(1)}</span>
							</div>
							<span className="home-featured-link">Ver recurso</span>
						</div>
					)}
				</a>
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Collections Section
// ---------------------------------------------------------------------------

const COLLECTION_COLORS = [
	"linear-gradient(135deg, #667eea, #764ba2)",
	"linear-gradient(135deg, #11998e, #38ef7d)",
	"linear-gradient(135deg, #ee9ca7, #ffdde1)",
	"linear-gradient(135deg, #4568dc, #b06ab3)",
	"linear-gradient(135deg, #f6d365, #fda085)",
	"linear-gradient(135deg, #0f2027, #2c5364)",
	"linear-gradient(135deg, #c94b4b, #4b134f)",
	"linear-gradient(135deg, #00b4db, #0083b0)",
];

function CollectionsSection({ collections }: { collections: CollectionRecord[] }) {
	const scrollRef = useRef<HTMLDivElement>(null);

	if (collections.length === 0) return null;

	function scroll(dir: "left" | "right") {
		if (!scrollRef.current) return;
		const cardWidth = scrollRef.current.querySelector(".home-collection-card")?.clientWidth ?? 280;
		scrollRef.current.scrollBy({ left: dir === "left" ? -cardWidth - 24 : cardWidth + 24, behavior: "smooth" });
	}

	return (
		<>
			<div className="home-collections-header">
				<h2 className="home-section-title">Colecciones Tematicas</h2>
				<div className="home-collections-arrows">
					<button className="home-collections-arrow-btn" onClick={() => scroll("left")} aria-label="Anterior" type="button">
						<span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
					</button>
					<button className="home-collections-arrow-btn" onClick={() => scroll("right")} aria-label="Siguiente" type="button">
						<span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
					</button>
				</div>
			</div>
			<div className="home-collections-scroll" ref={scrollRef}>
				{collections.map((col, i) => {
					const curatorInitial = (col.curatorName ?? "?").charAt(0).toUpperCase();
					const resCount = col.resourceCount ?? 0;
					return (
						<a key={col.id} href={url(`colecciones?slug=${col.slug}`)} className="home-collection-card">
							<div className="home-collection-image" style={{ background: COLLECTION_COLORS[i % COLLECTION_COLORS.length] }}>
								<div className="home-collection-overlay" />
							</div>
							<h4 className="home-collection-title">{col.title}</h4>
							<p className="home-collection-count">{resCount} Recursos curados</p>
							<div className="home-collection-avatars">
								<div className="home-collection-avatar" style={{ background: "#94a3b8" }}>{curatorInitial}</div>
								{resCount > 3 && <div className="home-collection-avatar" style={{ background: "#cbd5e1" }} />}
								{resCount > 5 && <div className="home-collection-avatar home-collection-avatar-count">+{resCount}</div>}
							</div>
						</a>
					);
				})}
			</div>
		</>
	);
}

// ---------------------------------------------------------------------------
// Latest News Section
// ---------------------------------------------------------------------------

function NewsSection({ resources }: { resources: Resource[] }) {
	if (resources.length === 0) return null;

	return (
		<div className="home-news-grid">
			{resources.slice(0, 4).map((r) => {
				const previewUrl = r.elpxPreview?.previewUrl;
				return (
					<a key={r.id} href={url(`recurso?slug=${r.slug}`)} className="home-news-card">
						<div className="home-news-preview">
							{previewUrl ? (
								<IframePreview src={previewUrl} className="home-news-iframe" fillWidth />
							) : (
								<div className="home-news-placeholder">
									<span className="material-symbols-outlined" style={{ fontSize: "2rem", opacity: 0.3 }}>description</span>
								</div>
							)}
						</div>
						<span className="home-news-timestamp">{timeAgo(r.createdAt)}</span>
						<h5 className="home-news-title">{r.title}</h5>
					</a>
				);
			})}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Main Island
// ---------------------------------------------------------------------------

export function HomeDataIsland() {
	const [featured, setFeatured] = useState<Resource[]>([]);
	const [collections, setCollections] = useState<CollectionRecord[]>([]);
	const [latest, setLatest] = useState<Resource[]>([]);
	const [stats, setStats] = useState({ resources: 0, users: 0, collections: 0 });
	const [badgeConfig, setBadgeConfig] = useState<BadgeConfig>({ novedadDays: 30, destacadoMinRatings: 3, destacadoMinAvg: 4.0, destacadoMinFavorites: 3 });
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		void (async () => {
			try {
				console.log("[HomeDataIsland] loading...");
				const api = await getApiClient();
				console.log("[HomeDataIsland] api client ready");
				const [resResult, colResult, latestResult, config, platformStats] = await Promise.all([
					api.listResources({ limit: 20 }),
					api.listPublicCollections({ limit: 8 }),
					api.listResources({ limit: 4 }),
					api.getBadgeConfig().catch(() => null),
					api.getPlatformStats().catch(() => ({ users: 0 })),
				]);
				setFeatured(resResult.data);
				setCollections(colResult.data);
				setLatest(latestResult.data);
				setStats({
					resources: resResult.total,
					users: Number(platformStats.users ?? 0),
					collections: colResult.total,
				});
				if (config) setBadgeConfig(config);
			} catch (err) {
				console.error("[HomeDataIsland] error:", err);
			} finally {
				setLoaded(true);
			}
		})();
	}, []);

	if (!loaded) {
		return (
			<div style={{ padding: "4rem 0", textAlign: "center", color: "var(--color-outline)" }}>
				Cargando...
			</div>
		);
	}

	return (
		<>
			{/* Stats */}
			<section className="home-stats-section">
				<div className="home-stats-grid">
					<div className="home-stat-card">
						<div className="home-stat-number">{stats.resources}</div>
						<div className="home-stat-label">Recursos</div>
					</div>
					<div className="home-stat-card">
						<div className="home-stat-number">{stats.users}</div>
						<div className="home-stat-label">Docentes</div>
					</div>
					<div className="home-stat-card">
						<div className="home-stat-number">{stats.collections}</div>
						<div className="home-stat-label">Colecciones</div>
					</div>
					<div className="home-stat-card">
						<div className="home-stat-number">{latest.length}</div>
						<div className="home-stat-label">Novedades</div>
					</div>
				</div>
			</section>

			{/* Featured Resources */}
			<section className="home-featured-section">
				<div className="home-featured-inner">
					<div className="home-featured-header">
						<div>
							<h2 className="home-section-title">Recursos Destacados</h2>
							<p className="home-section-subtitle">Seleccion editorial de los contenidos mas valorados y de mayor calidad.</p>
						</div>
						<a href={url("explorar")} className="home-section-link">
							Ver todos <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
						</a>
					</div>
					<FeaturedSection resources={featured} badgeConfig={badgeConfig} />
				</div>
			</section>

			{/* Collections */}
			{collections.length > 0 && (
				<section className="home-collections-section">
					<div className="home-collections-inner">
						<CollectionsSection collections={collections} />
					</div>
				</section>
			)}

			{/* CTA */}
			<section className="home-cta-section">
				<div className="home-cta-container">
					<div className="home-cta-gradient" aria-hidden="true" />
					<div className="home-cta-left">
						<h2 className="home-cta-title">La educacion se construye en comunidad</h2>
						<p className="home-cta-desc">
							Unete a miles de docentes que comparten su pasion. Crea tu propio perfil,
							guarda tus recursos favoritos y participa en comunidades especializadas.
						</p>
						<div className="home-cta-buttons">
							<a href={url("registro")} className="home-cta-btn-primary">Empezar ahora</a>
							<a href={url("sobre")} className="home-cta-btn-ghost">Saber mas</a>
						</div>
					</div>
					<div className="home-cta-right">
						<div className="home-cta-feature">
							<span className="material-symbols-outlined home-cta-icon" aria-hidden="true">group</span>
							<h4>Comunidades</h4>
							<p>Espacios de debate y colaboracion por materias y niveles.</p>
						</div>
						<div className="home-cta-feature">
							<span className="material-symbols-outlined home-cta-icon" aria-hidden="true">upload_file</span>
							<h4>Publicar</h4>
							<p>Herramienta sencilla para subir y catalogar tus recursos.</p>
						</div>
						<div className="home-cta-feature">
							<span className="material-symbols-outlined home-cta-icon" aria-hidden="true">auto_awesome</span>
							<h4>Itinerarios</h4>
							<p>Crea secuencias didacticas completas y compartelas.</p>
						</div>
						<div className="home-cta-feature">
							<span className="material-symbols-outlined home-cta-icon" aria-hidden="true">shield_with_heart</span>
							<h4>Calidad</h4>
							<p>Sistema de revision por pares y metricas de uso real.</p>
						</div>
					</div>
				</div>
			</section>

			{/* Latest News */}
			{latest.length > 0 && (
				<section className="home-news-section">
					<div className="home-news-inner">
						<div className="home-news-header">
							<h2 className="home-section-title home-section-title-sm">Ultimas Novedades</h2>
							<a href={url("explorar")} className="home-news-feed-link">Ver feed completo</a>
						</div>
						<NewsSection resources={latest} />
					</div>
				</section>
			)}
		</>
	);
}
