import { describe, expect, test } from "bun:test";
import * as repo from "@procomeka/db/repository";
import { getDb } from "../db.ts";
import { ensureCurrentUser } from "./user-sync.ts";

describe("ensureCurrentUser", () => {
	test("creates the user with sensible defaults", async () => {
		const id = `sync-user-${crypto.randomUUID()}`;
		await ensureCurrentUser({ id });

		const user = await repo.getUserById(getDb().db, id);
		expect(user?.id).toBe(id);
		expect(user?.email).toBe(`${id}@local.invalid`);
		expect(user?.role).toBe("reader");
	});
});
