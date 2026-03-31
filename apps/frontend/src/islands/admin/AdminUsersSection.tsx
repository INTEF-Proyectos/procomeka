import { startTransition, useEffect, useState } from "react";
import type { UserRecord } from "../../lib/api-client.ts";
import { getApiClient } from "../../lib/get-api-client.ts";
import { AdminTable, type Column } from "./AdminTable.tsx";

const PAGE_SIZE = 10;

const ROLE_OPTIONS = [
	{ value: "reader", label: "Lector" },
	{ value: "author", label: "Autor" },
	{ value: "editor", label: "Editor" },
	{ value: "curator", label: "Curador" },
	{ value: "admin", label: "Administrador" },
];

const ROLE_FILTER_OPTIONS = [
	{ value: "", label: "Todos" },
	...ROLE_OPTIONS,
];

function formatDate(d: UserRecord["createdAt"]): string {
	if (!d) return "-";
	return new Date(d as string | number).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

interface UserDialogProps {
	user?: UserRecord | null;
	onClose: () => void;
	onSaved: () => void;
}

function UserDialog({ user, onClose, onSaved }: UserDialogProps) {
	const isEdit = !!user;
	const [name, setName] = useState(user?.name ?? "");
	const [email, setEmail] = useState(user?.email ?? "");
	const [role, setRole] = useState(user?.role ?? "author");
	const [password, setPassword] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (saving) return;
		setSaving(true);
		setError("");

		try {
			const api = await getApiClient();
			if (isEdit) {
				await api.updateUser(user!.id, { name: name.trim(), role });
			} else {
				// Create user via Better Auth sign-up endpoint
				const res = await fetch("/api/auth/sign-up/email", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
				});
				if (!res.ok) {
					const err = await res.json().catch(() => ({}));
					throw new Error((err as Record<string, string>).message || "Error al crear usuario");
				}
				// Set role if not the default (author)
				if (role !== "author") {
					const created = await res.json().catch(() => null);
					if (created?.user?.id) {
						await api.updateUser(created.user.id, { role });
					}
				}
			}
			onSaved();
			onClose();
		} catch (err) {
			setError((err as Error).message || "Error al guardar");
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="admin-dialog-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
			<div className="admin-dialog" role="dialog" aria-modal="true" aria-label={isEdit ? "Editar usuario" : "Crear usuario"}>
				<div className="admin-dialog-header">
					<h2>{isEdit ? "Editar usuario" : "Crear usuario"}</h2>
					<button type="button" className="admin-dialog-close" onClick={onClose} aria-label="Cerrar">
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>

				{error && <div className="admin-dialog-error">{error}</div>}

				<form onSubmit={handleSubmit} className="admin-dialog-form">
					<div className="admin-dialog-field">
						<label htmlFor="user-name">Nombre</label>
						<input id="user-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" required />
					</div>

					{!isEdit && (
						<>
							<div className="admin-dialog-field">
								<label htmlFor="user-email">Correo electrónico</label>
								<input id="user-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@ejemplo.com" required />
							</div>
							<div className="admin-dialog-field">
								<label htmlFor="user-password">Contraseña</label>
								<input id="user-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required minLength={8} />
							</div>
						</>
					)}

					<div className="admin-dialog-field">
						<label htmlFor="user-role">Rol</label>
						<select id="user-role" value={role} onChange={(e) => setRole(e.target.value)}>
							{ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
						</select>
					</div>

					<div className="admin-dialog-actions">
						<button type="button" className="admin-dialog-cancel" onClick={onClose}>Cancelar</button>
						<button type="submit" className="admin-dialog-submit" disabled={saving}>
							{saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear usuario"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export function AdminUsersSection() {
	const [rows, setRows] = useState<UserRecord[]>([]);
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("");
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [busyId, setBusyId] = useState<string | null>(null);
	const [dialogUser, setDialogUser] = useState<UserRecord | null | "create">(null);

	async function loadUsers(nextPage = page, nextSearch = search, nextRole = roleFilter) {
		setLoading(true);
		try {
			const api = await getApiClient();
			const result = await api.listUsers({
				q: nextSearch || undefined,
				role: nextRole || undefined,
				limit: PAGE_SIZE,
				offset: (nextPage - 1) * PAGE_SIZE,
			});
			startTransition(() => { setRows(result.data); setTotal(result.total); setPage(nextPage); });
		} catch {
			setRows([]); setTotal(0);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => { void loadUsers(1, "", ""); }, []);

	function applySearch() { void loadUsers(1, search.trim(), roleFilter); }
	function applyRoleFilter(role: string) { setRoleFilter(role); void loadUsers(1, search.trim(), role); }

	async function toggleActive(user: UserRecord) {
		setBusyId(user.id);
		try {
			const api = await getApiClient();
			await api.updateUser(user.id, { isActive: !user.isActive });
			setRows((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
		} finally {
			setBusyId(null);
		}
	}

	async function deleteUser(user: UserRecord) {
		if (!confirm(`¿Eliminar el usuario "${user.name || user.email}"? Esta acción no se puede deshacer.`)) return;
		setBusyId(user.id);
		try {
			// Delete via Better Auth admin API
			const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE", credentials: "include" });
			if (res.ok) {
				setRows((prev) => prev.filter((u) => u.id !== user.id));
				setTotal((prev) => prev - 1);
			}
		} finally {
			setBusyId(null);
		}
	}

	const columns: Column<UserRecord>[] = [
		{
			key: "name", label: "Nombre",
			render: (u) => (
				<div className="admin-author-cell">
					<div className="admin-author-avatar">
						{(u.name || u.email).split(/\s+/).map((w) => w[0] ?? "").slice(0, 2).join("").toUpperCase()}
					</div>
					<div>
						<span className="admin-author-name">{u.name || u.email}</span>
						<div style={{ fontSize: "0.75rem", color: "var(--color-on-surface-variant)" }}>{u.email}</div>
					</div>
				</div>
			),
		},
		{
			key: "role", label: "Rol",
			render: (u) => {
				const label = ROLE_OPTIONS.find((o) => o.value === u.role)?.label ?? u.role;
				const color = u.role === "admin" ? "status-published" : u.role === "curator" ? "status-review" : (u.role === "editor" || u.role === "author") ? "status-draft" : "";
				return <span className={`status-badge ${color}`}><span className="status-badge-dot" />{label}</span>;
			},
		},
		{
			key: "status", label: "Estado",
			render: (u) => (
				<span className={`admin-active-badge ${u.isActive ? "admin-active-badge--active" : "admin-active-badge--inactive"}`}>
					{u.isActive ? "Activo" : "Inactivo"}
				</span>
			),
		},
		{
			key: "createdAt", label: "Registro",
			render: (u) => <span className="admin-date-cell">{formatDate(u.createdAt)}</span>,
		},
		{
			key: "actions", label: "Acciones",
			headerClassName: "admin-table-th-right",
			render: (u) => (
				<div className="admin-actions-cell">
					<button type="button" className="admin-action-btn admin-action-btn--primary" onClick={() => setDialogUser(u)} disabled={busyId === u.id} aria-label="Editar">
						<span className="material-symbols-outlined">edit</span>
					</button>
					{u.role !== "admin" && (
						<>
							<button type="button" className="admin-toggle-btn" disabled={busyId === u.id} onClick={() => void toggleActive(u)}>
								{u.isActive ? "Desactivar" : "Activar"}
							</button>
							<button type="button" className="admin-action-btn admin-action-btn--danger" onClick={() => void deleteUser(u)} disabled={busyId === u.id} aria-label="Eliminar">
								<span className="material-symbols-outlined">delete</span>
							</button>
						</>
					)}
				</div>
			),
		},
	];

	return (
		<>
			<div className="admin-section-header">
				<h1>Gestión de Usuarios</h1>
				<p>Administración de roles y estado de usuarios de la plataforma</p>
			</div>

			<div className="admin-filter-bar">
				<div className="admin-filter-bar-inner">
					<div className="admin-filter-search">
						<span className="admin-filter-label">Buscar usuario</span>
						<div className="admin-search-wrap">
							<input type="search" className="admin-search-input" placeholder="Nombre o email..." value={search}
								onChange={(e) => setSearch(e.target.value)}
								onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applySearch(); } }}
							/>
							<span className="material-symbols-outlined admin-search-icon" aria-hidden="true">search</span>
						</div>
					</div>
					<div className="admin-status-pills">
						<span className="admin-filter-label">Filtrar por rol</span>
						<div className="admin-status-pills-inner">
							{ROLE_FILTER_OPTIONS.map((f) => (
								<button key={f.value} type="button"
									className={`admin-status-pill${roleFilter === f.value ? " admin-status-pill-active" : ""}`}
									onClick={() => applyRoleFilter(f.value)}
								>{f.label}</button>
							))}
						</div>
					</div>
					<div style={{ alignSelf: "flex-end" }}>
						<button type="button" className="admin-create-submit" onClick={() => setDialogUser("create")}>
							<span className="material-symbols-outlined" style={{ fontSize: "18px" }}>person_add</span>
							Crear usuario
						</button>
					</div>
				</div>
			</div>

			<AdminTable<UserRecord>
				columns={columns}
				data={rows}
				getKey={(u) => u.id}
				loading={loading}
				total={total}
				page={page}
				pageSize={PAGE_SIZE}
				onPageChange={(p) => void loadUsers(p, search.trim(), roleFilter)}
				emptyMessage="No hay usuarios para los filtros actuales."
			/>

			{dialogUser && (
				<UserDialog
					user={dialogUser === "create" ? null : dialogUser}
					onClose={() => setDialogUser(null)}
					onSaved={() => void loadUsers(page, search, roleFilter)}
				/>
			)}
		</>
	);
}
