import { useEffect, useState } from "react";
import { getApiClient } from "../../lib/get-api-client.ts";
import { url } from "../../lib/paths.ts";
import type { AdminSection } from "./AdminPageIsland.tsx";

interface DashboardStats {
	total: number;
	published: number;
	review: number;
	draft: number;
}

interface AdminDashboardSectionProps {
	onNavigate: (section: AdminSection) => void;
}

export function AdminDashboardSection({
	onNavigate,
}: AdminDashboardSectionProps) {
	const [stats, setStats] = useState<DashboardStats>({
		total: 0,
		published: 0,
		review: 0,
		draft: 0,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				const api = await getApiClient();
				const [all, published, review, draft] = await Promise.all([
					api.listAdminResources({ limit: 1, offset: 0 }),
					api.listAdminResources({
						limit: 1,
						offset: 0,
						status: "published",
					}),
					api.listAdminResources({
						limit: 1,
						offset: 0,
						status: "review",
					}),
					api.listAdminResources({
						limit: 1,
						offset: 0,
						status: "draft",
					}),
				]);
				setStats({
					total: all.total,
					published: published.total,
					review: review.total,
					draft: draft.total,
				});
			} catch {
				/* keep zeros */
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const publishedPct =
		stats.total > 0
			? Math.round((stats.published / stats.total) * 100)
			: 0;

	return (
		<>
			<div className="admin-section-header">
				<h1>Panel de Gestion</h1>
				<p>
					Vista general de recursos educativos y accesos rapidos
				</p>
			</div>

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
						{loading
							? "..."
							: stats.total.toLocaleString("es-ES")}
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
						{loading
							? "..."
							: stats.published.toLocaleString("es-ES")}
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
						{loading
							? "..."
							: stats.review.toLocaleString("es-ES")}
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
						{loading
							? "..."
							: stats.draft.toLocaleString("es-ES")}
					</div>
					<div className="admin-stat-subtitle admin-stat-subtitle--muted">
						Sin finalizar
					</div>
				</div>
			</div>

			<div className="admin-section-header">
				<h2
					style={{
						fontFamily: "var(--font-display)",
						fontSize: "1.25rem",
						fontWeight: 700,
					}}
				>
					Acciones rapidas
				</h2>
			</div>

			<div className="admin-quick-actions">
				<button
					type="button"
					className="admin-quick-action"
					onClick={() => onNavigate("resources")}
				>
					<div className="admin-quick-action-icon">
						<span className="material-symbols-outlined">
							library_books
						</span>
					</div>
					<div className="admin-quick-action-text">
						<strong>Gestionar Recursos</strong>
						<span>Ver, buscar y editar recursos</span>
					</div>
				</button>

				<button
					type="button"
					className="admin-quick-action"
					onClick={() => onNavigate("collections")}
				>
					<div className="admin-quick-action-icon">
						<span className="material-symbols-outlined">
							collections_bookmark
						</span>
					</div>
					<div className="admin-quick-action-text">
						<strong>Gestionar Colecciones</strong>
						<span>Organizar contenidos en colecciones</span>
					</div>
				</button>

				<button
					type="button"
					className="admin-quick-action"
					onClick={() => onNavigate("categories")}
				>
					<div className="admin-quick-action-icon">
						<span className="material-symbols-outlined">
							category
						</span>
					</div>
					<div className="admin-quick-action-text">
						<strong>Gestionar Categorias</strong>
						<span>Taxonomias y clasificacion</span>
					</div>
				</button>
				<a
					href={url("nuevo")}
					className="admin-quick-action"
					style={{ textDecoration: "none", color: "inherit" }}
				>
					<div className="admin-quick-action-icon" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
						<span className="material-symbols-outlined">add_circle</span>
					</div>
					<div className="admin-quick-action-text">
						<strong>Crear Recurso</strong>
						<span>Subir un nuevo recurso educativo</span>
					</div>
				</a>
			</div>

			{/* Dev tools — only on localhost/preview */}
			<DevToolsSection />
		</>
	);
}

function DevToolsSection() {
	const [visible, setVisible] = useState(false);
	const [seedCount, setSeedCount] = useState("10");
	const [seedStatus, setSeedStatus] = useState("");
	const [seedBusy, setSeedBusy] = useState(false);

	useEffect(() => {
		const isDev = window.location.hostname === "localhost" ||
			(window as Record<string, unknown>).__PREVIEW_MODE__ === true;
		setVisible(isDev);
	}, []);

	if (!visible) return null;

	async function runSeed(clean: boolean) {
		const msg = clean ? "¿Borrar recursos generados y crear nuevos?" : "¿Generar recursos aleatorios?";
		if (!confirm(msg)) return;
		setSeedBusy(true);
		setSeedStatus("Generando...");
		try {
			const api = await getApiClient();
			const result = await api.seedResources(Number(seedCount), clean);
			setSeedStatus(`Creados ${result.count} recursos en ${result.durationMs}ms.`);
		} catch {
			setSeedStatus("Error al generar recursos");
		} finally {
			setSeedBusy(false);
		}
	}

	return (
		<div style={{ marginTop: "2rem" }}>
			<div className="admin-section-header">
				<h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 700 }}>
					<span className="material-symbols-outlined" style={{ fontSize: "20px", marginRight: "0.5rem", verticalAlign: "middle" }}>science</span>
					Herramientas de desarrollo
				</h2>
			</div>
			<div className="admin-dev-tools">
				<div className="admin-dev-tools-row">
					<span className="admin-dev-tools-label">Generar recursos de prueba:</span>
					<select
						className="admin-dev-tools-select"
						value={seedCount}
						onChange={(e) => setSeedCount(e.target.value)}
						disabled={seedBusy}
					>
						<option value="10">10</option>
						<option value="100">100</option>
						<option value="1000">1.000</option>
						<option value="10000">10.000</option>
					</select>
					<button type="button" className="admin-dev-btn admin-dev-btn--primary" onClick={() => runSeed(false)} disabled={seedBusy}>
						<span className="material-symbols-outlined">play_arrow</span>
						{seedBusy ? "Generando..." : "Ejecutar"}
					</button>
					<button type="button" className="admin-dev-btn admin-dev-btn--danger" onClick={() => runSeed(true)} disabled={seedBusy}>
						<span className="material-symbols-outlined">delete_sweep</span>
						Limpiar y ejecutar
					</button>
				</div>
				{seedStatus && (
					<div className="admin-dev-status">{seedStatus}</div>
				)}
			</div>
		</div>
	);
}
