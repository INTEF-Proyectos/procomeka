import { startTransition, useEffect, useState } from "react";
import type { Resource } from "../../lib/api-client.ts";
import { getApiClient } from "../../lib/get-api-client.ts";
import { url } from "../../lib/paths.ts";
import { ConfirmDialog } from "../shared/ConfirmDialog.tsx";
import { AdminTable, type Column } from "./AdminTable.tsx";

const PAGE_SIZE = 10;

const STATUS_MAP: Record<string, { label: string; className: string }> = {
	published: { label: "Publicado", className: "status-published" },
	review: { label: "En Revision", className: "status-review" },
	draft: { label: "Borrador", className: "status-draft" },
	archived: { label: "Archivado", className: "status-archived" },
};

const STATUS_FILTERS = [
	{ value: "", label: "Todos" },
	{ value: "published", label: "Publicado" },
	{ value: "review", label: "En Revision" },
	{ value: "draft", label: "Borrador" },
];

function formatDate(d: Resource["updatedAt"]): string {
	if (!d) return "-";
	return new Date(d).toLocaleDateString("es-ES", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

function getResourceIcon(type: string): {
	icon: string;
	className: string;
} {
	const t = type?.toLowerCase() ?? "";
	if (t.includes("ode") || t.includes("scorm") || t.includes("learning"))
		return { icon: "menu_book", className: "admin-resource-icon--book" };
	if (
		t.includes("video") ||
		t.includes("multimedia") ||
		t.includes("audio")
	)
		return { icon: "smart_display", className: "admin-resource-icon--video" };
	if (
		t.includes("document") ||
		t.includes("pdf") ||
		t.includes("text")
	)
		return { icon: "description", className: "admin-resource-icon--doc" };
	return { icon: "article", className: "admin-resource-icon--default" };
}

function getTypeBadgeClass(type: string): string {
	const t = type?.toLowerCase() ?? "";
	if (t.includes("ode") || t.includes("scorm") || t.includes("learning"))
		return "type-badge--ode";
	if (
		t.includes("video") ||
		t.includes("multimedia") ||
		t.includes("audio")
	)
		return "type-badge--multimedia";
	if (
		t.includes("document") ||
		t.includes("pdf") ||
		t.includes("text")
	)
		return "type-badge--document";
	return "type-badge--default";
}

function getInitials(name: string): string {
	return name
		.split(/\s+/)
		.map((w) => w[0] ?? "")
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

export function AdminResourcesSection() {
	const [rows, setRows] = useState<Resource[]>([]);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null);
	const [busyDelete, setBusyDelete] = useState(false);

	// Stat counts
	const [statTotal, setStatTotal] = useState(0);
	const [statPublished, setStatPublished] = useState(0);
	const [statReview, setStatReview] = useState(0);
	const [statDraft, setStatDraft] = useState(0);

	async function loadStats() {
		try {
			const api = await getApiClient();
			const [all, pub, rev, dra] = await Promise.all([
				api.listAdminResources({ limit: 1, offset: 0 }),
				api.listAdminResources({ limit: 1, offset: 0, status: "published" }),
				api.listAdminResources({ limit: 1, offset: 0, status: "review" }),
				api.listAdminResources({ limit: 1, offset: 0, status: "draft" }),
			]);
			setStatTotal(all.total);
			setStatPublished(pub.total);
			setStatReview(rev.total);
			setStatDraft(dra.total);
		} catch {
			/* keep zeros */
		}
	}

	async function loadResources(
		nextPage = page,
		nextSearch = search,
		nextStatus = statusFilter,
	) {
		setLoading(true);
		try {
			const api = await getApiClient();
			const result = await api.listAdminResources({
				q: nextSearch || undefined,
				status: nextStatus || undefined,
				limit: PAGE_SIZE,
				offset: (nextPage - 1) * PAGE_SIZE,
			});
			startTransition(() => {
				setRows(result.data);
				setTotal(result.total);
				setPage(nextPage);
			});
		} catch {
			setRows([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void loadStats();
		void loadResources(1, "", "");
	}, []);

	function applySearch() {
		void loadResources(1, search.trim(), statusFilter);
	}

	function applyStatusFilter(status: string) {
		setStatusFilter(status);
		void loadResources(1, search.trim(), status);
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		setBusyDelete(true);
		try {
			const api = await getApiClient();
			await api.deleteResource(deleteTarget.id);
			setDeleteTarget(null);
			void loadStats();
			const nextPage =
				rows.length === 1 && page > 1 ? page - 1 : page;
			void loadResources(nextPage, search.trim(), statusFilter);
		} catch {
			/* error handled silently */
		} finally {
			setBusyDelete(false);
		}
	}

	const publishedPct =
		statTotal > 0 ? Math.round((statPublished / statTotal) * 100) : 0;

	const columns: Column<Resource>[] = [
		{
			key: "title",
			label: "Titulo del Recurso",
			render: (r) => {
				const iconInfo = getResourceIcon(r.resourceType);
				return (
					<div className="admin-resource-cell">
						<div
							className={`admin-resource-icon ${iconInfo.className}`}
						>
							<span className="material-symbols-outlined">
								{iconInfo.icon}
							</span>
						</div>
						<div>
							<div className="admin-resource-title">
								{r.title}
							</div>
							<div className="admin-resource-id">
								ID: {r.id.slice(0, 12)}
							</div>
						</div>
					</div>
				);
			},
		},
		{
			key: "type",
			label: "Tipo",
			render: (r) => (
				<span
					className={`type-badge ${getTypeBadgeClass(r.resourceType)}`}
				>
					{r.resourceType || "-"}
				</span>
			),
		},
		{
			key: "language",
			label: "Idioma",
			render: (r) => (
				<span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
					{r.language || "-"}
				</span>
			),
		},
		{
			key: "status",
			label: "Estado",
			render: (r) => {
				const s = STATUS_MAP[r.editorialStatus] ?? {
					label: r.editorialStatus,
					className: "status-draft",
				};
				return (
					<div className={`status-badge ${s.className}`}>
						<span className="status-badge-dot" />
						{s.label}
					</div>
				);
			},
		},
		{
			key: "author",
			label: "Autor",
			render: (r) => {
				const name =
					r.createdByName || r.author || "Sin autor";
				return (
					<div className="admin-author-cell">
						<div className="admin-author-avatar">
							{getInitials(name)}
						</div>
						<span className="admin-author-name">{name}</span>
					</div>
				);
			},
		},
		{
			key: "updatedAt",
			label: "Ultima Act.",
			render: (r) => (
				<span className="admin-date-cell">
					{formatDate(r.updatedAt)}
				</span>
			),
		},
		{
			key: "actions",
			label: "Acciones",
			headerClassName: "admin-table-th-right",
			className: "",
			render: (r) => (
				<div className="admin-actions-cell">
					<a
						href={url(`editar?id=${r.id}`)}
						className="admin-action-btn admin-action-btn--edit"
						aria-label={`Editar ${r.title}`}
					>
						<span className="material-symbols-outlined">
							edit
						</span>
					</a>
					<button
						type="button"
						className="admin-action-btn admin-action-btn--delete"
						disabled={busyDelete}
						onClick={() => setDeleteTarget(r)}
						aria-label={`Eliminar ${r.title}`}
					>
						<span className="material-symbols-outlined">
							delete
						</span>
					</button>
				</div>
			),
		},
	];

	return (
		<>
			<div className="admin-section-header">
				<h1>Listado de Recursos</h1>
				<p>
					Gestion centralizada de contenidos educativos
				</p>
			</div>

			{/* Stat cards */}
			<div className="admin-stats-grid">
				<div className="admin-stat-card">
					<div className="admin-stat-card-top">
						<div className="admin-stat-icon admin-stat-icon--total">
							<span className="material-symbols-outlined">
								library_books
							</span>
						</div>
						<span className="admin-stat-label">Total</span>
					</div>
					<div className="admin-stat-value">
						{statTotal.toLocaleString("es-ES")}
					</div>
					<div className="admin-stat-subtitle admin-stat-subtitle--secondary">
						Recursos en la plataforma
					</div>
				</div>

				<div className="admin-stat-card">
					<div className="admin-stat-card-top">
						<div className="admin-stat-icon admin-stat-icon--published">
							<span className="material-symbols-outlined">
								check_circle
							</span>
						</div>
						<span className="admin-stat-label">Publicados</span>
					</div>
					<div className="admin-stat-value">
						{statPublished.toLocaleString("es-ES")}
					</div>
					<div className="admin-stat-subtitle admin-stat-subtitle--muted">
						{publishedPct}% de efectividad
					</div>
				</div>

				<div className="admin-stat-card">
					<div className="admin-stat-card-top">
						<div className="admin-stat-icon admin-stat-icon--review">
							<span className="material-symbols-outlined">
								pending_actions
							</span>
						</div>
						<span className="admin-stat-label">En Revision</span>
					</div>
					<div className="admin-stat-value">
						{statReview.toLocaleString("es-ES")}
					</div>
					<div className="admin-stat-subtitle admin-stat-subtitle--tertiary">
						Requiere atencion
					</div>
				</div>

				<div className="admin-stat-card">
					<div className="admin-stat-card-top">
						<div className="admin-stat-icon admin-stat-icon--draft">
							<span className="material-symbols-outlined">
								draft
							</span>
						</div>
						<span className="admin-stat-label">Borradores</span>
					</div>
					<div className="admin-stat-value">
						{statDraft.toLocaleString("es-ES")}
					</div>
					<div className="admin-stat-subtitle admin-stat-subtitle--muted">
						Sin finalizar
					</div>
				</div>
			</div>

			{/* Filter bar */}
			<div className="admin-filter-bar">
				<div className="admin-filter-bar-inner">
					<div className="admin-filter-search">
						<span className="admin-filter-label">
							Busqueda avanzada
						</span>
						<div className="admin-search-wrap">
							<input
								type="search"
								className="admin-search-input"
								placeholder="Buscar por titulo, autor o palabra clave..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										applySearch();
									}
								}}
							/>
							<span
								className="material-symbols-outlined admin-search-icon"
								aria-hidden="true"
							>
								search
							</span>
						</div>
					</div>
					<div className="admin-status-pills">
						<span className="admin-filter-label">
							Estado del Recurso
						</span>
						<div className="admin-status-pills-inner">
							{STATUS_FILTERS.map((f) => (
								<button
									key={f.value}
									type="button"
									className={`admin-status-pill${statusFilter === f.value ? " admin-status-pill-active" : ""}`}
									onClick={() =>
										applyStatusFilter(f.value)
									}
								>
									{f.label}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Data table */}
			<AdminTable<Resource>
				columns={columns}
				data={rows}
				getKey={(r) => r.id}
				loading={loading}
				total={total}
				page={page}
				pageSize={PAGE_SIZE}
				onPageChange={(p) =>
					void loadResources(p, search.trim(), statusFilter)
				}
				emptyMessage="No hay recursos para los filtros actuales."
			/>

			<ConfirmDialog
				open={deleteTarget !== null}
				title="Eliminar recurso"
				message={`Seguro que deseas eliminar "${deleteTarget?.title ?? "este recurso"}"?`}
				confirmLabel="Eliminar"
				busy={busyDelete}
				onCancel={() => setDeleteTarget(null)}
				onConfirm={() => void handleDelete()}
			/>
		</>
	);
}
