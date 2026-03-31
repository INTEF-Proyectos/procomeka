import type { Context } from "hono";
import type { AuthEnv } from "../auth/middleware.ts";
import { auth } from "../auth/config.ts";

type ResourceVisibilityContext = {
	createdBy?: string | null;
	editorialStatus?: string | null;
};

type SessionUser = { id: string; role?: string } | null;

const HIGH_ROLES = new Set(["curator", "admin"]);

export async function getSessionUser(c: Context<AuthEnv>): Promise<SessionUser> {
	try {
		const session = await auth.api.getSession({ headers: c.req.raw.headers });
		return session ? (session.user as { id: string; role?: string }) : null;
	} catch {
		return null;
	}
}

export function canViewResource(user: SessionUser, resource: ResourceVisibilityContext) {
	if (resource.editorialStatus === "published") return true;
	if (!user) return false;
	if (resource.createdBy === user.id) return true;
	return HIGH_ROLES.has(user.role ?? "");
}
