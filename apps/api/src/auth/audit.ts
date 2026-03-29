import type { Context, Next } from "hono";
import { getDb } from "../db.ts";
import { apiAccessLogs } from "@procomeka/db/schema";
import type { AuthEnv } from "./middleware.ts";

/**
 * Middleware de auditoría para el cumplimiento del ENS.
 * Registra todos los accesos a la API en la tabla api_access_logs.
 */
export async function auditMiddleware(c: Context<AuthEnv>, next: Next) {
	const start = Date.now();

	await next();

	const latencyMs = Date.now() - start;
	const user = c.get("user");
	const method = c.req.method;
	const path = c.req.path;
	const status = c.res.status;
	const ipAddress = c.req.header("x-forwarded-for")?.split(",")[0].trim() ||
	                  c.req.header("cf-connecting-ip") ||
	                  c.req.header("x-real-ip") ||
	                  null;
	const userAgent = c.req.header("user-agent");

	// Fire-and-forget logging to not block the response
	const db = getDb().db;
	db.insert(apiAccessLogs).values({
		id: crypto.randomUUID(),
		userId: user?.id ?? null,
		method,
		path,
		status,
		ipAddress,
		userAgent,
		latencyMs,
		createdAt: new Date(),
	}).catch(() => {
		// Never let audit logging failure break the API response
	});
}
