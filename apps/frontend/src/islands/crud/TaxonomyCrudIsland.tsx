import { startTransition, useEffect, useState, type FormEvent } from "react";
import type { TaxonomyRecord } from "../../lib/api-client.ts";
import { getApiClient } from "../../lib/get-api-client.ts";
import { AccessibleFeedback } from "../shared/AccessibleFeedback.tsx";
import { ConfirmDialog } from "../shared/ConfirmDialog.tsx";
import { CrudTable, type CrudColumn } from "./CrudTable.tsx";
import { TaxonomyFormDialog } from "./TaxonomyFormDialog.tsx";
import { TAXONOMY_TYPE_OPTIONS, type TaxonomyType } from "./taxonomy-options.ts";

const TAXONOMY_LABELS: Record<TaxonomyType, string> = {
	category: "Categoria",
	tag: "Etiqueta",
	subject: "Materia",
	level: "Nivel educativo",
	"resource-type": "Tipo de recurso",
	language: "Idioma",
	license: "Licencia",
};

const PAGE_SIZE = 20;

interface TaxonomyFormState {
	name: string;
	slug: string;
	type: TaxonomyType;
}

const EMPTY_FORM: TaxonomyFormState = {
	name: "",
	slug: "",
	type: "category",
};

function formatDate(dateValue: TaxonomyRecord["updatedAt"]) {
	if (!dateValue) return "-";
	return new Date(dateValue).toLocaleDateString("es-ES");
}

function taxonomyTypeLabel(type: string) {
	return TAXONOMY_LABELS[type as TaxonomyType] ?? type;
}

export function TaxonomyCrudIsland() {
	const [rows, setRows] = useState<TaxonomyRecord[]>([]);
	const [search, setSearch] = useState("");
	const [appliedSearch, setAppliedSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState<TaxonomyType | "">("");
	const [offset, setOffset] = useState(0);
	const [total, setTotal] = useState(0);
	const [statusMessage, setStatusMessage] = useState("Cargando categorias...");
	const [createForm, setCreateForm] = useState<TaxonomyFormState>(EMPTY_FORM);
	const [createFeedback, setCreateFeedback] = useState({ message: "", variant: "neutral" as const });
	const [editing, setEditing] = useState<TaxonomyRecord | null>(null);
	const [editForm, setEditForm] = useState<TaxonomyFormState>(EMPTY_FORM);
	const [editError, setEditError] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<TaxonomyRecord | null>(null);
	const [busyAction, setBusyAction] = useState<"create" | "edit" | "delete" | null>(null);

	async function loadTaxonomies(nextOffset = offset, nextSearch = appliedSearch, nextType = typeFilter) {
		setStatusMessage("Cargando categorias...");

		try {
			const api = await getApiClient();
			const result = await api.listTaxonomies({
				q: nextSearch || undefined,
				type: nextType || undefined,
				limit: PAGE_SIZE,
				offset: nextOffset,
			});

			startTransition(() => {
				setRows(result.data);
				setOffset(result.offset);
				setTotal(result.total);
				setStatusMessage(`${result.total} categorias encontradas`);
			});
		} catch {
			setRows([]);
			setTotal(0);
			setStatusMessage("No se pudieron cargar las categorias.");
		}
	}

	useEffect(() => {
		void loadTaxonomies(0, "", "");
	}, []);

	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

	const columns: CrudColumn<TaxonomyRecord>[] = [
		{
			id: "name",
			header: "Nombre",
			cell: (row) => row.name,
		},
		{
			id: "type",
			header: "Tipo",
			cell: (row) => <span className="admin-badge">{taxonomyTypeLabel(row.type)}</span>,
		},
		{
			id: "slug",
			header: "Slug",
			cell: (row) => <code>{row.slug}</code>,
		},
		{
			id: "parentId",
			header: "Parent",
			cell: (row) => row.parentId ?? "-",
		},
		{
			id: "updatedAt",
			header: "Actualizado",
			cell: (row) => formatDate(row.updatedAt),
		},
		{
			id: "actions",
			header: "Acciones",
			className: "actions-cell",
			cell: (row) => (
				<>
					<button
						type="button"
						className="admin-btn admin-btn--sm"
						onClick={() => {
							setEditing(row);
							setEditForm({
								name: row.name,
								slug: row.slug,
								type: (row.type as TaxonomyType) ?? "category",
							});
							setEditError("");
						}}
					>
						Editar
					</button>
					<button
						type="button"
						className="admin-btn admin-btn--sm admin-btn--danger"
						onClick={() => setDeleteTarget(row)}
					>
						Eliminar
					</button>
				</>
			),
		},
	];

	async function applyFilters() {
		setAppliedSearch(search.trim());
		setOffset(0);
		await loadTaxonomies(0, search.trim(), typeFilter);
	}

	async function handleCreate(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setBusyAction("create");
		setCreateFeedback({ message: "", variant: "neutral" });

		try {
			const api = await getApiClient();
			await api.createTaxonomy({
				name: createForm.name,
				slug: createForm.slug || undefined,
				type: createForm.type,
			});
			setCreateForm(EMPTY_FORM);
			setCreateFeedback({ message: "Categoria creada.", variant: "success" });
			await loadTaxonomies(0, appliedSearch, typeFilter);
		} catch {
			setCreateFeedback({ message: "Error al crear la categoria.", variant: "error" });
		} finally {
			setBusyAction(null);
		}
	}

	async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!editing) return;

		setBusyAction("edit");
		setEditError("");

		try {
			const api = await getApiClient();
			const result = await api.updateTaxonomy(editing.id, {
				name: editForm.name,
				slug: editForm.slug,
				type: editForm.type,
			});
			if (!result.ok) {
				setEditError(result.error ?? "Error al guardar.");
				return;
			}
			setEditing(null);
			await loadTaxonomies(offset, appliedSearch, typeFilter);
		} catch {
			setEditError("Error de conexion.");
		} finally {
			setBusyAction(null);
		}
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		setBusyAction("delete");

		try {
			const api = await getApiClient();
			await api.deleteTaxonomy(deleteTarget.id);
			setDeleteTarget(null);
			await loadTaxonomies(offset, appliedSearch, typeFilter);
		} catch {
			setStatusMessage("No se pudo eliminar la categoria.");
		} finally {
			setBusyAction(null);
		}
	}

	return (
		<>
			<section className="admin-form-card">
				<h2>Nueva categoria</h2>
				<form onSubmit={handleCreate}>
					<div className="admin-form-grid">
						<label>
							Nombre
							<input
								value={createForm.name}
								onChange={(event) => {
									const value = event.currentTarget.value;
									setCreateForm((current) => ({ ...current, name: value }));
								}}
								required
							/>
						</label>
						<label>
							Slug (opcional)
							<input
								value={createForm.slug}
								onChange={(event) => {
									const value = event.currentTarget.value;
									setCreateForm((current) => ({ ...current, slug: value }));
								}}
								placeholder="se-genera-automaticamente"
							/>
						</label>
						<label>
							Tipo
							<select
								value={createForm.type}
								onChange={(event) => {
									const value = event.currentTarget.value as TaxonomyType;
									setCreateForm((current) => ({ ...current, type: value }));
								}}
							>
								{TAXONOMY_TYPE_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</label>
					</div>
					<div className="admin-form-actions">
						<button type="submit" className="admin-btn admin-btn--primary" disabled={busyAction === "create"}>
							{busyAction === "create" ? "Creando..." : "Crear categoria"}
						</button>
					</div>
				</form>
				<AccessibleFeedback
					id="create-feedback"
					message={createFeedback.message}
					variant={createFeedback.variant}
				/>
			</section>

			<section className="admin-toolbar">
				<label>
					Busqueda
					<input
						type="search"
						placeholder="Nombre o slug"
						value={search}
						onChange={(event) => {
							const value = event.currentTarget.value;
							setSearch(value);
						}}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								void applyFilters();
							}
						}}
					/>
				</label>
				<label>
					Tipo
					<select
						value={typeFilter}
						onChange={(event) => {
							const value = event.currentTarget.value as TaxonomyType | "";
							setTypeFilter(value);
						}}
					>
						<option value="">Todos los tipos</option>
						{TAXONOMY_TYPE_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</label>
				<button type="button" className="admin-btn" onClick={() => void applyFilters()}>
					Aplicar
				</button>
			</section>

			<div className="admin-list-status" aria-live="polite">
				{statusMessage}
			</div>

			<CrudTable
				columns={columns}
				rows={rows}
				getRowKey={(row) => row.id}
				emptyMessage="No hay categorias para los filtros actuales."
			/>

			{total > PAGE_SIZE && (
				<div className="admin-pager">
					<button
						type="button"
						disabled={offset === 0}
						onClick={() => void loadTaxonomies(Math.max(0, offset - PAGE_SIZE), appliedSearch, typeFilter)}
					>
						Anterior
					</button>
					<span className="admin-pager-label">{`Pagina ${currentPage} de ${totalPages}`}</span>
					<button
						type="button"
						disabled={offset + PAGE_SIZE >= total}
						onClick={() => void loadTaxonomies(offset + PAGE_SIZE, appliedSearch, typeFilter)}
					>
						Siguiente
					</button>
				</div>
			)}

			<TaxonomyFormDialog
				open={editing !== null}
				values={editForm}
				error={editError}
				busy={busyAction === "edit"}
				onChange={(field, value) => setEditForm((current) => ({ ...current, [field]: value }))}
				onCancel={() => {
					setEditing(null);
					setEditError("");
				}}
				onSubmit={handleEditSubmit}
			/>

			<ConfirmDialog
				open={deleteTarget !== null}
				title="Eliminar categoria"
				message={deleteTarget ? `Seguro que deseas eliminar "${deleteTarget.name}"?` : ""}
				confirmLabel="Eliminar"
				busy={busyAction === "delete"}
				onCancel={() => setDeleteTarget(null)}
				onConfirm={() => void handleDelete()}
			/>
		</>
	);
}
