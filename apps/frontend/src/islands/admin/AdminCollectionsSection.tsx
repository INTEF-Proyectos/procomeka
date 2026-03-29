import { startTransition, useEffect, useState } from "react";
import type { CollectionRecord } from "../../lib/api-client.ts";
import { getApiClient } from "../../lib/get-api-client.ts";
import { ConfirmDialog } from "../shared/ConfirmDialog.tsx";
import { ModalFrame } from "../shared/ModalFrame.tsx";
import { AdminTable, type Column } from "./AdminTable.tsx";

const PAGE_SIZE = 10;

const STATUS_MAP: Record<string, { label: string; className: string }> = {
	published: { label: "Publicado", className: "status-published" },
	review: { label: "En Revision", className: "status-review" },
	draft: { label: "Borrador", className: "status-draft" },
	archived: { label: "Archivado", className: "status-archived" },
};

function formatDate(d: CollectionRecord["updatedAt"]): string {
	if (!d) return "-";
	return new Date(d as string | number).toLocaleDateString("es-ES", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

interface EditFormState {
	title: string;
	description: string;
	editorialStatus: string;
	isOrdered: boolean;
}

export function AdminCollectionsSection() {
	const [rows, setRows] = useState<CollectionRecord[]>([]);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);

	// Create form
	const [showCreate, setShowCreate] = useState(false);
	const [createTitle, setCreateTitle] = useState("");
	const [createDesc, setCreateDesc] = useState("");
	const [createBusy, setCreateBusy] = useState(false);
	const [createError, setCreateError] = useState("");

	// Edit dialog
	const [editTarget, setEditTarget] = useState<CollectionRecord | null>(null);
	const [editForm, setEditForm] = useState<EditFormState>({
		title: "",
		description: "",
		editorialStatus: "draft",
		isOrdered: false,
	});
	const [editBusy, setEditBusy] = useState(false);
	const [editError, setEditError] = useState("");

	// Delete
	const [deleteTarget, setDeleteTarget] = useState<CollectionRecord | null>(null);
	const [busyDelete, setBusyDelete] = useState(false);

	async function loadCollections(
		nextPage = page,
		nextSearch = search,
	) {
		setLoading(true);
		try {
			const api = await getApiClient();
			const result = await api.listCollections({
				q: nextSearch || undefined,
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
		void loadCollections(1, "");
	}, []);

	function applySearch() {
		void loadCollections(1, search.trim());
	}

	async function handleCreate(e: React.FormEvent) {
		e.preventDefault();
		if (!createTitle.trim()) return;
		setCreateBusy(true);
		setCreateError("");
		try {
			const api = await getApiClient();
			await api.createCollection({
				title: createTitle.trim(),
				description: createDesc.trim(),
			});
			setCreateTitle("");
			setCreateDesc("");
			setShowCreate(false);
			void loadCollections(1, search.trim());
		} catch {
			setCreateError("No se pudo crear la coleccion.");
		} finally {
			setCreateBusy(false);
		}
	}

	function openEdit(c: CollectionRecord) {
		setEditTarget(c);
		setEditForm({
			title: c.title,
			description: c.description,
			editorialStatus: c.editorialStatus,
			isOrdered: (c.isOrdered ?? 0) === 1,
		});
		setEditError("");
	}

	async function handleEdit(e: React.FormEvent) {
		e.preventDefault();
		if (!editTarget) return;
		setEditBusy(true);
		setEditError("");
		try {
			const api = await getApiClient();
			const result = await api.updateCollection(editTarget.id, {
				title: editForm.title.trim(),
				description: editForm.description.trim(),
				editorialStatus: editForm.editorialStatus,
				isOrdered: editForm.isOrdered,
			});
			if (!result.ok) {
				setEditError(result.error || "Error al actualizar.");
				return;
			}
			setEditTarget(null);
			void loadCollections(page, search.trim());
		} catch {
			setEditError("No se pudo actualizar la coleccion.");
		} finally {
			setEditBusy(false);
		}
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		setBusyDelete(true);
		try {
			const api = await getApiClient();
			await api.deleteCollection(deleteTarget.id);
			setDeleteTarget(null);
			const nextPage =
				rows.length === 1 && page > 1 ? page - 1 : page;
			void loadCollections(nextPage, search.trim());
		} catch {
			/* ignore */
		} finally {
			setBusyDelete(false);
		}
	}

	const columns: Column<CollectionRecord>[] = [
		{
			key: "title",
			label: "Titulo",
			render: (c) => (
				<span
					style={{
						fontWeight: 700,
						color: "var(--color-on-surface)",
						fontSize: "0.875rem",
					}}
				>
					{c.title}
				</span>
			),
		},
		{
			key: "status",
			label: "Estado",
			render: (c) => {
				const s = STATUS_MAP[c.editorialStatus] ?? {
					label: c.editorialStatus,
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
			key: "description",
			label: "Descripcion",
			render: (c) => (
				<span className="admin-text-truncate" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-on-surface-variant)" }}>
					{c.description || "-"}
				</span>
			),
		},
		{
			key: "isOrdered",
			label: "Ordenada",
			render: (c) => (
				<span className="admin-ordered-badge">
					<span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
						{(c.isOrdered ?? 0) === 1 ? "check_circle" : "cancel"}
					</span>
					{(c.isOrdered ?? 0) === 1 ? "Si" : "No"}
				</span>
			),
		},
		{
			key: "updatedAt",
			label: "Actualizado",
			render: (c) => (
				<span className="admin-date-cell">
					{formatDate(c.updatedAt)}
				</span>
			),
		},
		{
			key: "actions",
			label: "Acciones",
			headerClassName: "admin-table-th-right",
			render: (c) => (
				<div className="admin-actions-cell">
					<button
						type="button"
						className="admin-action-btn admin-action-btn--edit"
						onClick={() => openEdit(c)}
						aria-label={`Editar ${c.title}`}
					>
						<span className="material-symbols-outlined">
							edit
						</span>
					</button>
					<button
						type="button"
						className="admin-action-btn admin-action-btn--delete"
						disabled={busyDelete}
						onClick={() => setDeleteTarget(c)}
						aria-label={`Eliminar ${c.title}`}
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
				<h1>Gestion de Colecciones</h1>
				<p>
					Organizar contenidos educativos en colecciones tematicas
				</p>
			</div>

			{/* Filter bar */}
			<div className="admin-filter-bar">
				<div className="admin-filter-bar-inner">
					<div className="admin-filter-search">
						<span className="admin-filter-label">
							Buscar coleccion
						</span>
						<div className="admin-search-wrap">
							<input
								type="search"
								className="admin-search-input"
								placeholder="Buscar por titulo..."
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
					<div style={{ display: "flex", alignItems: "flex-end" }}>
						<button
							type="button"
							className="admin-form-btn admin-form-btn--primary"
							style={{ height: "3.5rem", whiteSpace: "nowrap" }}
							onClick={() => setShowCreate(!showCreate)}
						>
							<span className="material-symbols-outlined">
								add
							</span>
							Nueva Coleccion
						</button>
					</div>
				</div>
			</div>

			{/* Inline create form */}
			{showCreate && (
				<form className="admin-inline-form" onSubmit={handleCreate}>
					<h3>Crear nueva coleccion</h3>
					<div className="admin-form-row">
						<div className="admin-form-field">
							<label htmlFor="col-create-title">Titulo</label>
							<input
								id="col-create-title"
								type="text"
								value={createTitle}
								onChange={(e) =>
									setCreateTitle(e.target.value)
								}
								required
							/>
						</div>
						<div className="admin-form-field">
							<label htmlFor="col-create-desc">
								Descripcion
							</label>
							<input
								id="col-create-desc"
								type="text"
								value={createDesc}
								onChange={(e) =>
									setCreateDesc(e.target.value)
								}
							/>
						</div>
					</div>
					{createError && (
						<div className="admin-form-error">{createError}</div>
					)}
					<div className="admin-form-actions">
						<button
							type="submit"
							className="admin-form-btn admin-form-btn--primary"
							disabled={createBusy}
						>
							{createBusy ? "Creando..." : "Crear"}
						</button>
						<button
							type="button"
							className="admin-form-btn"
							onClick={() => setShowCreate(false)}
						>
							Cancelar
						</button>
					</div>
				</form>
			)}

			<AdminTable<CollectionRecord>
				columns={columns}
				data={rows}
				getKey={(c) => c.id}
				loading={loading}
				total={total}
				page={page}
				pageSize={PAGE_SIZE}
				onPageChange={(p) =>
					void loadCollections(p, search.trim())
				}
				emptyMessage="No hay colecciones para los filtros actuales."
			/>

			{/* Edit dialog */}
			{editTarget && (
				<ModalFrame
					open={true}
					className="admin-edit-dialog"
					titleId="edit-collection-title"
					onClose={() => setEditTarget(null)}
				>
					<form onSubmit={handleEdit}>
						<h2 id="edit-collection-title">
							Editar coleccion
						</h2>
						<div className="admin-form-row">
							<div className="admin-form-field">
								<label htmlFor="col-edit-title">
									Titulo
								</label>
								<input
									id="col-edit-title"
									type="text"
									value={editForm.title}
									onChange={(e) =>
										setEditForm((f) => ({
											...f,
											title: e.target.value,
										}))
									}
									required
								/>
							</div>
							<div className="admin-form-field">
								<label htmlFor="col-edit-status">
									Estado
								</label>
								<select
									id="col-edit-status"
									value={editForm.editorialStatus}
									onChange={(e) =>
										setEditForm((f) => ({
											...f,
											editorialStatus: e.target.value,
										}))
									}
								>
									<option value="draft">Borrador</option>
									<option value="review">
										En Revision
									</option>
									<option value="published">
										Publicado
									</option>
									<option value="archived">
										Archivado
									</option>
								</select>
							</div>
						</div>
						<div className="admin-form-row admin-form-row--full">
							<div className="admin-form-field">
								<label htmlFor="col-edit-desc">
									Descripcion
								</label>
								<textarea
									id="col-edit-desc"
									value={editForm.description}
									onChange={(e) =>
										setEditForm((f) => ({
											...f,
											description: e.target.value,
										}))
									}
								/>
							</div>
						</div>
						<div style={{ marginTop: "0.5rem" }}>
							<label className="admin-form-check">
								<input
									type="checkbox"
									checked={editForm.isOrdered}
									onChange={(e) =>
										setEditForm((f) => ({
											...f,
											isOrdered: e.target.checked,
										}))
									}
								/>
								Coleccion ordenada
							</label>
						</div>
						{editError && (
							<div className="admin-form-error">
								{editError}
							</div>
						)}
						<div className="admin-dialog-actions">
							<button
								type="button"
								className="admin-form-btn"
								onClick={() => setEditTarget(null)}
								disabled={editBusy}
							>
								Cancelar
							</button>
							<button
								type="submit"
								className="admin-form-btn admin-form-btn--primary"
								disabled={editBusy}
							>
								{editBusy ? "Guardando..." : "Guardar"}
							</button>
						</div>
					</form>
				</ModalFrame>
			)}

			<ConfirmDialog
				open={deleteTarget !== null}
				title="Eliminar coleccion"
				message={`Seguro que deseas eliminar "${deleteTarget?.title ?? "esta coleccion"}"?`}
				confirmLabel="Eliminar"
				busy={busyDelete}
				onCancel={() => setDeleteTarget(null)}
				onConfirm={() => void handleDelete()}
			/>
		</>
	);
}
