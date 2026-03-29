import { startTransition, useEffect, useState, type FormEvent } from "react";
import type { CollectionDetailRecord, CollectionRecord } from "../../lib/api-client.ts";
import { getApiClient } from "../../lib/get-api-client.ts";
import { url } from "../../lib/paths.ts";
import { formatDateLong } from "../../lib/shared-utils.ts";
import "./PublicCollectionsIsland.css";

const PAGE_SIZE = 9;

interface CollectionLocationState {
	query: string;
	page: number;
	slug: string | null;
}

function truncate(text: string, maxLength: number) {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength)}...`;
}

function coverStyle(coverImageUrl?: string | null) {
	if (!coverImageUrl) {
		return { backgroundImage: "linear-gradient(135deg, #0f4ccf, #60a5fa)" };
	}
	return { backgroundImage: `linear-gradient(rgba(15, 76, 207, 0.12), rgba(15, 76, 207, 0.42)), url("${coverImageUrl}")` };
}

function readCollectionLocation(search: string): CollectionLocationState {
	const params = new URLSearchParams(search);
	return {
		query: params.get("q") ?? "",
		page: Math.max(1, Number(params.get("page") ?? "1") || 1),
		slug: params.get("slug"),
	};
}

export function PublicCollectionsIsland() {
	const [query, setQuery] = useState("");
	const [appliedQuery, setAppliedQuery] = useState("");
	const [page, setPage] = useState(1);
	const [slug, setSlug] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [collections, setCollections] = useState<CollectionRecord[]>([]);
	const [total, setTotal] = useState(0);
	const [detail, setDetail] = useState<CollectionDetailRecord | null>(null);
	const [error, setError] = useState("");

	function syncUrl(next: { q?: string; page?: number; slug?: string | null }) {
		const params = new URLSearchParams(window.location.search);
		if (next.q !== undefined) {
			if (next.q) params.set("q", next.q);
			else params.delete("q");
		}
		if (next.page !== undefined) {
			if (next.page > 1) params.set("page", String(next.page));
			else params.delete("page");
		}
		if (next.slug !== undefined) {
			if (next.slug) params.set("slug", next.slug);
			else params.delete("slug");
		}
		const suffix = params.toString();
		window.history.pushState({}, "", `${url("colecciones")}${suffix ? `?${suffix}` : ""}`);
	}

	async function loadList(nextPage: number, nextQuery: string) {
		setLoading(true);
		setError("");
		try {
			const api = await getApiClient();
			const result = await api.listPublicCollections({
				q: nextQuery || undefined,
				limit: PAGE_SIZE,
				offset: (nextPage - 1) * PAGE_SIZE,
			});
			startTransition(() => {
				setCollections(result.data);
				setTotal(result.total);
				setDetail(null);
				setSlug(null);
				setPage(nextPage);
				setAppliedQuery(nextQuery);
				setLoading(false);
			});
		} catch {
			setCollections([]);
			setTotal(0);
			setError("No se pudieron cargar las colecciones.");
			setLoading(false);
		}
	}

	async function loadDetail(nextSlug: string) {
		setLoading(true);
		setError("");
		try {
			const api = await getApiClient();
			const result = await api.getPublicCollectionBySlug(nextSlug);
			if (!result) {
				setDetail(null);
				setError("La colección solicitada no existe o no está publicada.");
				setLoading(false);
				return;
			}
			startTransition(() => {
				setSlug(nextSlug);
				setDetail(result);
				setLoading(false);
			});
		} catch {
			setDetail(null);
			setError("No se pudo cargar el detalle de la colección.");
			setLoading(false);
		}
	}

	useEffect(() => {
		function syncFromLocation(search: string) {
			const nextState = readCollectionLocation(search);
			setQuery(nextState.query);
			if (nextState.slug) {
				void loadDetail(nextState.slug);
				return;
			}
			void loadList(nextState.page, nextState.query);
		}

		syncFromLocation(window.location.search);

		function handlePopState() {
			syncFromLocation(window.location.search);
		}

		window.addEventListener("popstate", handlePopState);
		return () => {
			window.removeEventListener("popstate", handlePopState);
		};
	}, []);

	async function handleSearch(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		syncUrl({ q: query.trim(), page: 1, slug: null });
		await loadList(1, query.trim());
	}

	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	if (detail) {
		return (
			<section className="collections-shell">
				<button
					type="button"
					className="collections-back-link"
					onClick={() => {
						syncUrl({ slug: null });
						void loadList(page, appliedQuery);
					}}
				>
					Volver al listado
				</button>

				<header className="collection-detail-hero" style={coverStyle(detail.coverImageUrl)}>
					<div className="collection-detail-overlay">
						<p className="collections-eyebrow">Colección pública</p>
						<h1>{detail.title}</h1>
						<p>{detail.description}</p>
						<ul className="collection-detail-meta" aria-label="Metadatos de la colección">
							<li>{detail.resourceCount ?? detail.resources.length} recursos</li>
							<li>Curator: {detail.curatorName ?? "Equipo editorial"}</li>
							<li>Actualizada {formatDateLong(detail.updatedAt ?? detail.createdAt)}</li>
						</ul>
					</div>
				</header>

				<section className="collection-detail-section" aria-labelledby="collection-resources-title">
					<div className="collections-section-head">
						<div>
							<p className="collections-eyebrow">Recursos asociados</p>
							<h2 id="collection-resources-title">Listado de recursos</h2>
						</div>
					</div>
					<div className="collection-resource-grid">
						{detail.resources.map((resource) => (
							<a key={resource.resourceId} href={url(`recurso?slug=${resource.slug}`)} className="collection-resource-card">
								<p className="collection-resource-type">{resource.resourceType}</p>
								<h3>{resource.title}</h3>
								<p>{truncate(resource.description ?? "", 180)}</p>
								<div className="collection-resource-meta">
									<span>{resource.language.toUpperCase()}</span>
									<span>{resource.license}</span>
									<span>{resource.author ?? resource.createdByName ?? "Sin autor"}</span>
								</div>
							</a>
						))}
					</div>
				</section>
			</section>
		);
	}

	return (
		<section className="collections-shell">
			<header className="collections-hero">
				<p className="collections-eyebrow">Colecciones editoriales</p>
				<h1>Colecciones publicadas</h1>
				<p>
					Explora agrupaciones temáticas curadas por el equipo editorial para encontrar secuencias y selecciones de recursos ya organizadas.
				</p>
				<form className="collections-search" onSubmit={handleSearch} role="search">
					<input
						type="search"
						placeholder="Buscar por título o descripción"
						aria-label="Buscar colecciones"
						value={query}
						onChange={(event) => setQuery(event.currentTarget.value)}
					/>
					<button type="submit">Buscar</button>
				</form>
			</header>

			<section className="collection-list-section" aria-labelledby="collections-results-title">
				<div className="collections-section-head">
					<div>
						<p className="collections-eyebrow">Resultados</p>
						<h2 id="collections-results-title">{loading ? "Cargando colecciones..." : `${total} colecciones publicadas`}</h2>
					</div>
				</div>

				{error ? <p className="collections-feedback collections-feedback-error">{error}</p> : null}

				<div className="collection-card-grid">
					{collections.map((collection) => (
						<a
							key={collection.id}
							href={url(`colecciones?slug=${collection.slug}`)}
							className="collection-public-card"
							onClick={(event) => {
								event.preventDefault();
								syncUrl({ slug: collection.slug });
								void loadDetail(collection.slug);
							}}
						>
							<div className="collection-public-card-cover" style={coverStyle(collection.coverImageUrl)} />
							<div className="collection-public-card-body">
								<p className="collection-public-card-eyebrow">Colección</p>
								<h3>{collection.title}</h3>
								<p>{truncate(collection.description ?? "", 180)}</p>
								<div className="collection-public-card-meta">
									<span>{collection.resourceCount ?? 0} recursos</span>
									<span>{collection.curatorName ?? "Equipo editorial"}</span>
								</div>
							</div>
						</a>
					))}
				</div>

				{!loading && !collections.length && !error ? (
					<p className="collections-feedback">No hay colecciones publicadas para los filtros actuales.</p>
				) : null}

				<nav className="collections-pagination" aria-label="Paginación de colecciones" hidden={total <= PAGE_SIZE}>
					<button
						type="button"
						disabled={page <= 1}
						onClick={() => {
							const nextPage = page - 1;
							syncUrl({ page: nextPage });
							void loadList(nextPage, appliedQuery);
						}}
					>
						Anterior
					</button>
					<span>{`Página ${page} de ${totalPages}`}</span>
					<button
						type="button"
						disabled={page >= totalPages}
						onClick={() => {
							const nextPage = page + 1;
							syncUrl({ page: nextPage });
							void loadList(nextPage, appliedQuery);
						}}
					>
						Siguiente
					</button>
				</nav>
			</section>
		</section>
	);
}

export { readCollectionLocation };
