import * as repo from "@procomeka/db/repository";
import { getDb } from "../db.ts";

export async function ensureCurrentUser(user: {
	id: string;
	role?: string;
	name?: string;
	email?: string;
}) {
	await repo.ensureUser(getDb().db, {
		id: user.id,
		email: user.email ?? `${user.id}@local.invalid`,
		name: user.name ?? null,
		role: user.role ?? "reader",
	});
}
