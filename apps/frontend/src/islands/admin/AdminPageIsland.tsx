import { useEffect, useState } from "react";
import { getApiClient } from "../../lib/get-api-client.ts";
import { url } from "../../lib/paths.ts";
import { ROLE_LEVELS } from "../../lib/shared-utils.ts";
import { AdminSidebar } from "./AdminSidebar.tsx";
import { AdminDashboardSection } from "./AdminDashboardSection.tsx";
import { AdminResourcesSection } from "./AdminResourcesSection.tsx";
import { AdminUsersSection } from "./AdminUsersSection.tsx";
import { AdminCollectionsSection } from "./AdminCollectionsSection.tsx";
import { AdminCategoriesSection } from "./AdminCategoriesSection.tsx";
import "./AdminPageIsland.css";

export type AdminSection =
	| "dashboard"
	| "resources"
	| "collections"
	| "categories"
	| "users";

const VALID_SECTIONS: AdminSection[] = [
	"dashboard",
	"resources",
	"collections",
	"categories",
	"users",
];



export function AdminPageIsland() {
	const [section, setSection] = useState<AdminSection>("dashboard");
	const [userRole, setUserRole] = useState<string>("");
	const [userName, setUserName] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const s = params.get("section");
		if (s && VALID_SECTIONS.includes(s as AdminSection)) {
			setSection(s as AdminSection);
		}

		(async () => {
			try {
				const api = await getApiClient();
				const session = await api.getSession();
				if (
					!session?.user ||
					(ROLE_LEVELS[session.user.role] ?? 0) < ROLE_LEVELS.curator
				) {
					window.location.href = session?.user ? url("perfil") : url("login");
					return;
				}
				setUserRole(session.user.role);
				setUserName(session.user.name || session.user.email);
			} catch {
				window.location.href = url("login");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	function changeSection(s: AdminSection) {
		setSection(s);
		const newUrl = new URL(window.location.href);
		newUrl.searchParams.set("section", s);
		window.history.pushState({}, "", newUrl.toString());
	}

	if (loading) {
		return (
			<div className="admin-loading">
				Cargando panel de administracion...
			</div>
		);
	}

	const userLevel = ROLE_LEVELS[userRole] ?? 0;
	const canManageCollections = userLevel >= ROLE_LEVELS.curator;
	const canManageCategories = userLevel >= ROLE_LEVELS.curator;

	return (
		<div className="admin-shell">
			<AdminSidebar
				activeSection={section}
				onSectionChange={changeSection}
				userRole={userRole}
				userName={userName}
			/>
			<main className="admin-content">
				{section === "dashboard" && (
					<AdminDashboardSection
						onNavigate={changeSection}
						canManageCollections={canManageCollections}
						canManageCategories={canManageCategories}
					/>
				)}
				{section === "resources" && <AdminResourcesSection />}
				{section === "collections" && canManageCollections && <AdminCollectionsSection />}
				{section === "categories" && canManageCategories && (
					<AdminCategoriesSection />
				)}
				{section === "users" && userLevel >= ROLE_LEVELS.admin && (
					<AdminUsersSection />
				)}
			</main>
		</div>
	);
}
