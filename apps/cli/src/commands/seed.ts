import { drizzle } from "drizzle-orm/bun-sql";
import { user, account } from "@procomeka/db/schema";

const DEV_USERS = [
	{
		email: "admin@example.com",
		name: "Admin",
		role: "admin",
		password: "password",
	},
	{
		email: "curator@example.com",
		name: "Curator",
		role: "curator",
		password: "password",
	},
	{
		email: "author@example.com",
		name: "Author",
		role: "author",
		password: "password",
	},
	{
		email: "reader@example.com",
		name: "Reader",
		role: "reader",
		password: "password",
	},
];

export async function seed() {
	const dbUrl =
		process.env.DATABASE_URL ?? "postgres://localhost:5432/procomeka";
	const db = drizzle(dbUrl);

	console.log("Creando usuarios de desarrollo...\n");

	for (const u of DEV_USERS) {
		const userId = crypto.randomUUID();
		const accountId = crypto.randomUUID();
		const passwordHash = await Bun.password.hash(u.password, {
			algorithm: "argon2id",
		});

		try {
			await db.insert(user).values({
				id: userId,
				email: u.email,
				name: u.name,
				role: u.role,
				isActive: 1,
				emailVerified: 1,
			});

			await db.insert(account).values({
				id: accountId,
				userId,
				accountId: userId,
				providerId: "credential",
				password: passwordHash,
			});

			console.log(`  ✓ ${u.email} [${u.role}] — contraseña: ${u.password}`);
		} catch (err) {
			if (err instanceof Error && err.message.includes("unique")) {
				console.log(`  - ${u.email} ya existe, saltando`);
			} else {
				throw err;
			}
		}
	}

	console.log("\nSeed completado.");
}
