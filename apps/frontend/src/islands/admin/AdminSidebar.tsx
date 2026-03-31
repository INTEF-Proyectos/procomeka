import { buildHelpHref } from "../../lib/help-content.ts";
import { url } from "../../lib/paths.ts";
import { ROLE_LEVELS } from "../../lib/shared-utils.ts";
import type { AdminSection } from "./AdminPageIsland.tsx";

interface NavItem {
	id: AdminSection;
	label: string;
	icon: string;
	minRole: number;
}

const NAV_ITEMS: NavItem[] = [
	{ id: "dashboard", label: "Panel de gestion", icon: "dashboard", minRole: ROLE_LEVELS.curator },
	{ id: "resources", label: "Recursos", icon: "library_books", minRole: ROLE_LEVELS.curator },
	{ id: "collections", label: "Colecciones", icon: "collections_bookmark", minRole: ROLE_LEVELS.curator },
	{ id: "categories", label: "Categorias", icon: "category", minRole: ROLE_LEVELS.curator },
	{ id: "users", label: "Usuarios", icon: "group", minRole: ROLE_LEVELS.admin },
];

interface AdminSidebarProps {
	activeSection: AdminSection;
	onSectionChange: (section: AdminSection) => void;
	userRole: string;
	userName: string;
}

export function AdminSidebar({
	activeSection,
	onSectionChange,
	userRole,
	userName,
}: AdminSidebarProps) {
	const userLevel = ROLE_LEVELS[userRole] ?? 0;

	return (
		<aside className="admin-sidebar" aria-label="Menu de administracion">
			<div className="admin-sidebar-header">
				<div className="admin-sidebar-title">Gestion Procomun</div>
				<div className="admin-sidebar-subtitle">
					Backoffice Administrativo
				</div>
			</div>

			<nav className="admin-sidebar-nav">
				{NAV_ITEMS.filter((item) => userLevel >= item.minRole).map(
					(item) => {
						const isActive = activeSection === item.id;
						return (
							<button
								key={item.id}
								type="button"
								className={`admin-nav-item${isActive ? " admin-nav-item-active" : ""}`}
								onClick={() => onSectionChange(item.id)}
								aria-current={isActive ? "page" : undefined}
							>
								<span className="material-symbols-outlined">
									{item.icon}
								</span>
								<span>{item.label}</span>
							</button>
						);
					},
				)}
				<a className="admin-nav-item" href={url(buildHelpHref("publicar-recurso"))}>
					<span className="material-symbols-outlined" aria-hidden="true">
						help
					</span>
					<span>Ayuda</span>
				</a>
			</nav>

			<div className="admin-sidebar-footer" />
		</aside>
	);
}
