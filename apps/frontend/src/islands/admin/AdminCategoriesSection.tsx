import { startTransition, useEffect, useState } from "react";
import type { TaxonomyRecord } from "../../lib/api-client.ts";
import { getApiClient } from "../../lib/get-api-client.ts";
import { ConfirmDialog } from "../shared/ConfirmDialog.tsx";
import { ModalFrame } from "../shared/ModalFrame.tsx";
import { AdminTable, type Column } from "./AdminTable.tsx";

const PAGE_SIZE = 10;

const TYPE_OPTIONS = [
	{ value: "", label: "Todos los tipos" },
	{ value: "subject", label: "Materia" },
	{ value: "level", label: "Nivel" },
	{ value: "tag", label: "Etiqueta" },
];

function typeBadgeClass(type: string): string {
	if (type === "subject") return "taxonomy-type-badge--subject";
	if (type === "level") return "taxonomy-type-badge--level";
	return "taxonomy-type-badge--default";
}

function typeLabel(type: string): string {
	const labels: Record<string, string> = {
		subject: "Materia",
		level: "Nivel",
		tag: "Etiqueta",
	};
	return labels[type] ?? type;
}

function formatDate(d: TaxonomyRecord["updatedAt"]): string {
	if (!d) return "-";
	return new Date(d as string | number).toLocaleDateString("es-ES", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

interface FormState {
	name: string;
	type: string;
	parentId: string;
}

const EMPTY_FORM: FormState = { name: "", type: "subject", parentId: "" };

export function AdminCategoriesSection() {
	const [rows, setRows] = useState<TaxonomyRecord[]>([]);
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState("");
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);

	// Create dialog
	const [showCreate, setShowCreate] = useState(false);
	const [createForm, setCreateForm] = useState<FormState>({ ...EMPTY_FORM });
	const [createBusy, setCreateBusy] = useState(false);
	const [createError, setCreateError] = useState("");

	// Edit dialog
	const [editTarget, setEditTarget] = useState<TaxonomyRecord | null>(null);
	const [editForm, setEditForm] = useState<FormState>({ ...EMPTY_FORM });
	const [editBusy, setEditBusy] = useState(false);
	const [editError, setEditError] = useState("");

	// Delete
	const [deleteTarget, setDeleteTarget] = useState<TaxonomyRecord | null>(null);
	const [busyDelete, setBusyDelete] = useState(false);

	async function loadTaxonomies(
		nextPage = page,
		nextSearch = search,
		nextType = typeFilter,
	) {
		setLoading(true);
		try {
			const api = await getApiClient();
			const result = await api.listTaxonomies({
				q: nextSearch || undefined,
				type: nextType || undefined,
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
		void loadTaxonomies(1, "", "");
	}, []);

	function applySearch() {
		void loadTaxonomies(1, search.trim(), typeFilter);
	}

	function applyTypeFilter(type: string) {
		setTypeFilter(type);
		void loadTaxonomies(1, search.trim(), type);
	}

	async function handleCreate(e: React.FormEvent) {
		e.preventDefault();
		if (!createForm.name.trim()) return;
		setCreateBusy(true);
		setCreateError("");
		try {
			const api = await getApiClient();
			await api.createTaxonomy({
				name: createForm.name.trim(),
				type: createForm.type || undefined,
				parentId: createForm.parentId.trim() || undefined,
			});
			setCreateForm({ ...EMPTY_FORM });
			setShowCreate(false);
			void loadTaxonomies(1, search.trim(), typeFilter);
		} catch {
			setCreateError("No se pudo crear la taxonomia.");
		} finally {
			setCreateBusy(false);
		}
	}

	function openEdit(t: TaxonomyRecord) {
		setEditTarget(t);
		setEditForm({
			name: t.name,
			type: t.type,
			parentId: t.parentId ?? "",
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
			const result = await api.updateTaxonomy(editTarget.id, {
				name: editForm.name.trim(),
				type: editForm.type,
				parentId: editForm.parentId.trim() || null,
			});
			if (!result.ok) {
				setEditError(result.error || "Error al actualizar.");
				return;
			}
			setEditTarget(null);
			void loadTaxonomies(page, search.trim(), typeFilter);
		} catch {
			setEditError("No se pudo actualizar la taxonomia.");
		} finally {
			setEditBusy(false);
		}
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		setBusyDelete(true);
		try {
			const api = await getApiClient();
			await api.deleteTaxonomy(deleteTarget.id);
			setDeleteTarget(null);
			const nextPage =
				rows.length === 1 && page > 1 ? page - 1 : page;
			void loadTaxonomies(nextPage, search.trim(), typeFilter);
		} catch {
			/* ignore */
		} finally {
			setBusyDelete(false);
		}
	}

	const columns: Column<TaxonomyRecord>[] = [
		{
			key: "name",
			label: "Nombre",
			render: (t) => (
				<span
					style={{
						fontWeight: 700,
						color: "var(--color-on-surface)",
						fontSize: "0.875rem",
					}}
				>
					{t.name}
				</span>
			),
		},
		{
			key: "type",
			label: "Tipo",
			render: (t) => (
				<span
					className={`taxonomy-type-badge ${typeBadgeClass(t.type)}`}
				>
					{typeLabel(t.type)}
				</span>
			),
		},
		{
			key: "slug",
			label: "Slug",
			render: (t) => (
				<span
					style={{
						fontSize: "0.8125rem",
						color: "var(--color-on-surface-variant)",
						fontFamily: "monospace",
					}}
				>
					{t.slug}
				</span>
			),
		},
		{
			key: "parentId",
			label: "Padre",
			render: (t) => (
				<span
					style={{
						fontSize: "0.8125rem",
						color: "var(--color-on-surface-variant)",
					}}
				>
					{t.parentId
						? t.parentId.slice(0, 12) + "..."
						: "-"}
				</span>
			),
		},
		{
			key: "updatedAt",
			label: "Actualizado",
			render: (t) => (
				<span className="admin-date-cell">
					{formatDate(t.updatedAt)}
				</span>
			),
		},
		{
			key: "actions",
			label: "Acciones",
			headerClassName: "admin-table-th-right",
			render: (t) => (
				<div className="admin-actions-cell">
					<button
						type="button"
						className="admin-action-btn admin-action-btn--edit"
						onClick={() => openEdit(t)}
						aria-label={`Editar ${t.name}`}
					>
						<span className="material-symbols-outlined">
							edit
						</span>
					</button>
					<button
						type="button"
						className="admin-action-btn admin-action-btn--delete"
						disabled={busyDelete}
						onClick={() => setDeleteTarget(t)}
						aria-label={`Eliminar ${t.name}`}
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
				<h1>Categorias y Taxonomias</h1>
				<p>
					Gestion de materias, niveles educativos y etiquetas
				</p>
			</div>

			{/* Filter bar */}
			<div className="admin-filter-bar">
				<div className="admin-filter-bar-inner">
					<div className="admin-filter-search">
						<span className="admin-filter-label">
							Buscar taxonomia
						</span>
						<div className="admin-search-wrap">
							<input
								type="search"
								className="admin-search-input"
								placeholder="Buscar por nombre..."
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
							Tipo
						</span>
						<div className="admin-status-pills-inner">
							{TYPE_OPTIONS.map((f) => (
								<button
									key={f.value}
									type="button"
									className={`admin-status-pill${typeFilter === f.value ? " admin-status-pill-active" : ""}`}
									onClick={() =>
										applyTypeFilter(f.value)
									}
								>
									{f.label}
								</button>
							))}
						</div>
					</div>
					<div style={{ display: "flex", alignItems: "flex-end" }}>
						<button
							type="button"
							className="admin-form-btn admin-form-btn--primary"
							style={{ height: "3.5rem", whiteSpace: "nowrap" }}
							onClick={() => setShowCreate(true)}
						>
							<span className="material-symbols-outlined">
								add
							</span>
							Nueva Taxonomia
						</button>
					</div>
				</div>
			</div>

			<AdminTable<TaxonomyRecord>
				columns={columns}
				data={rows}
				getKey={(t) => t.id}
				loading={loading}
				total={total}
				page={page}
				pageSize={PAGE_SIZE}
				onPageChange={(p) =>
					void loadTaxonomies(p, search.trim(), typeFilter)
				}
				emptyMessage="No hay taxonomias para los filtros actuales."
			/>

			{/* Create dialog */}
			{showCreate && (
				<ModalFrame
					open={true}
					className="admin-edit-dialog"
					titleId="create-taxonomy-title"
					onClose={() => setShowCreate(false)}
				>
					<form onSubmit={handleCreate}>
						<h2 id="create-taxonomy-title">
							Crear nueva taxonomia
						</h2>
						<div className="admin-form-row">
							<div className="admin-form-field">
								<label htmlFor="tax-create-name">
									Nombre
								</label>
								<input
									id="tax-create-name"
									type="text"
									value={createForm.name}
									onChange={(e) =>
										setCreateForm((f) => ({
											...f,
											name: e.target.value,
										}))
									}
									required
								/>
							</div>
							<div className="admin-form-field">
								<label htmlFor="tax-create-type">
									Tipo
								</label>
								<select
									id="tax-create-type"
									value={createForm.type}
									onChange={(e) =>
										setCreateForm((f) => ({
											...f,
											type: e.target.value,
										}))
									}
								>
									<option value="subject">Materia</option>
									<option value="level">Nivel</option>
									<option value="tag">Etiqueta</option>
								</select>
							</div>
						</div>
						<div className="admin-form-row admin-form-row--full">
							<div className="admin-form-field">
								<label htmlFor="tax-create-parent">
									ID del padre (opcional)
								</label>
								<input
									id="tax-create-parent"
									type="text"
									value={createForm.parentId}
									onChange={(e) =>
										setCreateForm((f) => ({
											...f,
											parentId: e.target.value,
										}))
									}
									placeholder="Dejar vacio si es raiz"
								/>
							</div>
						</div>
						{createError && (
							<div className="admin-form-error">
								{createError}
							</div>
						)}
						<div className="admin-dialog-actions">
							<button
								type="button"
								className="admin-form-btn"
								onClick={() => setShowCreate(false)}
								disabled={createBusy}
							>
								Cancelar
							</button>
							<button
								type="submit"
								className="admin-form-btn admin-form-btn--primary"
								disabled={createBusy}
							>
								{createBusy ? "Creando..." : "Crear"}
							</button>
						</div>
					</form>
				</ModalFrame>
			)}

			{/* Edit dialog */}
			{editTarget && (
				<ModalFrame
					open={true}
					className="admin-edit-dialog"
					titleId="edit-taxonomy-title"
					onClose={() => setEditTarget(null)}
				>
					<form onSubmit={handleEdit}>
						<h2 id="edit-taxonomy-title">
							Editar taxonomia
						</h2>
						<div className="admin-form-row">
							<div className="admin-form-field">
								<label htmlFor="tax-edit-name">
									Nombre
								</label>
								<input
									id="tax-edit-name"
									type="text"
									value={editForm.name}
									onChange={(e) =>
										setEditForm((f) => ({
											...f,
											name: e.target.value,
										}))
									}
									required
								/>
							</div>
							<div className="admin-form-field">
								<label htmlFor="tax-edit-type">
									Tipo
								</label>
								<select
									id="tax-edit-type"
									value={editForm.type}
									onChange={(e) =>
										setEditForm((f) => ({
											...f,
											type: e.target.value,
										}))
									}
								>
									<option value="subject">Materia</option>
									<option value="level">Nivel</option>
									<option value="tag">Etiqueta</option>
								</select>
							</div>
						</div>
						<div className="admin-form-row admin-form-row--full">
							<div className="admin-form-field">
								<label htmlFor="tax-edit-parent">
									ID del padre (opcional)
								</label>
								<input
									id="tax-edit-parent"
									type="text"
									value={editForm.parentId}
									onChange={(e) =>
										setEditForm((f) => ({
											...f,
											parentId: e.target.value,
										}))
									}
									placeholder="Dejar vacio si es raiz"
								/>
							</div>
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
				title="Eliminar taxonomia"
				message={`Seguro que deseas eliminar "${deleteTarget?.name ?? "esta taxonomia"}"?`}
				confirmLabel="Eliminar"
				busy={busyDelete}
				onCancel={() => setDeleteTarget(null)}
				onConfirm={() => void handleDelete()}
			/>
		</>
	);
}
