import type {
	ApiClient,
	Resource,
	ResourceListResult,
	SessionData,
	AppConfig,
	SignInResult,
	CreateResourceInput,
	UpdateResourceInput,
	SessionUser,
	UserRecord,
	MediaItemRecord,
	UploadSessionRecord,
	UploadConfig,
} from "./api-client.ts";

interface SeedData {
	users: { id: string; email: string; name: string; role: string }[];
	resources: {
		id: string;
		slug: string;
		title: string;
		description: string;
		language: string;
		license: string;
		resourceType: string;
		keywords: string | null;
		author: string | null;
		publisher: string | null;
		editorialStatus: string;
	}[];
	resourceSubjects: { resourceId: string; subject: string }[];
	resourceLevels: { resourceId: string; level: string }[];
	elpxProjects?: { id: string; resourceId: string; hash: string; originalFilename: string; hasPreview: number }[];
}

const ROLE_KEY = "procomeka-preview-role";
const LOGGED_IN_KEY = "procomeka-preview-logged-in";

/**
 * Cliente de preview: PGlite en el navegador + usuarios demo en memoria.
 */
export class PreviewApiClient implements ApiClient {
	private static _instance: PreviewApiClient | null = null;
	private static _initPromise: Promise<PreviewApiClient> | null = null;

	// biome-ignore lint: dynamic pglite types
	private pglite: any;
	// biome-ignore lint: dynamic drizzle types
	private db: any;
	private currentUser: SessionUser;
	private loggedIn: boolean;
	private seedData: SeedData | null = null;

	private hasMinRole(minRole: "author" | "curator" | "admin"): boolean {
		const levels = { reader: 0, author: 1, curator: 2, admin: 3 };
		return (levels[this.currentUser.role as keyof typeof levels] ?? 0) >= levels[minRole];
	}

	private constructor() {
		const savedRole = typeof localStorage !== "undefined" ? localStorage.getItem(ROLE_KEY) : null;
		const role = savedRole ?? "admin";
		this.currentUser = this.userForRole(role);
		this.loggedIn = typeof localStorage !== "undefined"
			? localStorage.getItem(LOGGED_IN_KEY) !== "false"
			: true;
	}

	static async getInstance(): Promise<PreviewApiClient> {
		if (PreviewApiClient._instance) return PreviewApiClient._instance;
		if (PreviewApiClient._initPromise) return PreviewApiClient._initPromise;

		PreviewApiClient._initPromise = (async () => {
			const client = new PreviewApiClient();
			await client.init();
			PreviewApiClient._instance = client;
			return client;
		})();

		return PreviewApiClient._initPromise;
	}

	private userForRole(role: string): SessionUser {
		return PreviewApiClient.DEMO_USERS.find(u => u.role === role) ?? PreviewApiClient.DEMO_USERS[0]!;
	}

	private static readonly DEMO_USERS: SessionUser[] = [
		{ id: "demo-admin", email: "admin@example.com", name: "Admin", role: "admin" },
		{ id: "demo-curator", email: "curator@example.com", name: "Curator", role: "curator" },
		{ id: "demo-author", email: "author@example.com", name: "Author", role: "author" },
		{ id: "demo-reader", email: "reader@example.com", name: "Reader", role: "reader" },
	];

	private async init() {
		const { PGlite } = await import("@electric-sql/pglite");
		this.pglite = new PGlite("idb://procomeka-preview");

		const { drizzle } = await import("drizzle-orm/pglite");
		const schema = await import("@procomeka/db/schema");
		this.db = drizzle(this.pglite, { schema });

		const { createTables } = await import("@procomeka/db/setup");
		await createTables(this.pglite);

		// Ensure demo users exist (needed for FK constraints on social tables)
		const now = new Date().toISOString();
		for (const u of PreviewApiClient.DEMO_USERS) {
			await this.pglite.query(
				`INSERT INTO "user" (id, email, email_verified, name, role, is_active, created_at, updated_at) VALUES ($1, $2, true, $3, $4, true, $5, $6) ON CONFLICT (id) DO NOTHING`,
				[u.id, u.email, u.name, u.role, now, now],
			);
		}

		// Verificar si ya tiene datos
		const check = await this.pglite.query(`SELECT count(*) as c FROM "resources"`);
		if (Number(check.rows[0]?.c) === 0) {
			await this.loadSeedData();
		}
	}

	private async loadSeedData() {
		if (!this.seedData) {
			const { getBaseUrl } = await import("./paths.ts");
			const res = await fetch(`${getBaseUrl()}preview/seed.json`);
			this.seedData = await res.json();
		}

		const seed = this.seedData!;
		const now = new Date().toISOString();

		for (const u of seed.users) {
			await this.pglite.query(
				`INSERT INTO "user" (id, email, email_verified, name, role, is_active, created_at, updated_at) VALUES ($1, $2, true, $3, $4, true, $5, $6) ON CONFLICT (id) DO NOTHING`,
				[u.id, u.email, u.name, u.role, now, now],
			);
		}

		for (const r of seed.resources) {
			await this.pglite.query(
				`INSERT INTO "resources" (id, slug, title, description, language, license, resource_type, keywords, author, publisher, editorial_status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ON CONFLICT (id) DO NOTHING`,
				[r.id, r.slug, r.title, r.description, r.language, r.license, r.resourceType, r.keywords, r.author, r.publisher, r.editorialStatus, now, now],
			);
		}

		for (const s of seed.resourceSubjects) {
			await this.pglite.query(
				`INSERT INTO "resource_subjects" (resource_id, subject) VALUES ($1, $2)`,
				[s.resourceId, s.subject],
			);
		}

		for (const l of seed.resourceLevels) {
			await this.pglite.query(
				`INSERT INTO "resource_levels" (resource_id, level) VALUES ($1, $2)`,
				[l.resourceId, l.level],
			);
		}

		if (seed.elpxProjects) {
			for (const e of seed.elpxProjects) {
				await this.pglite.query(
					`INSERT INTO "elpx_projects" (id, resource_id, hash, extract_path, original_filename, version, has_preview, created_at, updated_at) VALUES ($1, $2, $3, '', $4, 3, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
					[e.id, e.resourceId, e.hash, e.originalFilename, e.hasPreview, now, now],
				);
			}
		}
	}

	// --- Public API ---

	private async enrichWithElpx(data: any[]) {
		if (!data.length) return data;
		const ids = data.map((r: any) => r.id);
		const { listElpxProjectsByResourceIds } = await import("@procomeka/db/repository");
		const { resolveElpxPreviewUrl } = await import("./elpx-preview-service.ts");
		const elpxList = await listElpxProjectsByResourceIds(this.db, ids);
		const elpxMap = new Map(elpxList.map((e: any) => [e.resourceId, e]));

		// Resolve preview URLs in parallel
		const previews = await Promise.all(data.map(async (r: any) => {
			const elpx = elpxMap.get(r.id);
			if (!elpx || elpx.hasPreview !== 1) return null;
			const previewUrl = await resolveElpxPreviewUrl(elpx.hash, elpx.originalFilename);
			return previewUrl ? { hash: elpx.hash, previewUrl } : null;
		}));

		return data.map((r: any, i: number) => ({ ...r, elpxPreview: previews[i] }));
	}

	async listResources(opts?: {
		q?: string;
		limit?: number;
		offset?: number;
		resourceType?: string;
		language?: string;
		license?: string;
	}): Promise<ResourceListResult> {
		const { listResources: list } = await import("@procomeka/db/repository");
		const result = await list(this.db, {
			limit: opts?.limit,
			offset: opts?.offset,
			search: opts?.q,
			status: "published",
			resourceType: opts?.resourceType,
			language: opts?.language,
			license: opts?.license,
		});
		return { ...result, data: await this.enrichWithElpx(result.data) };
	}

	async getResourceBySlug(slug: string): Promise<Resource | null> {
		const { getResourceBySlug: get } = await import("@procomeka/db/repository");
		const r = await get(this.db, slug);
		if (!r) return null;
		const [enriched] = await this.enrichWithElpx([r]);
		return enriched;
	}

	async listPublicCollections(opts?: { q?: string; limit?: number; offset?: number }) {
		const { listCollections } = await import("@procomeka/db/repository");
		return listCollections(this.db, {
			limit: opts?.limit,
			offset: opts?.offset,
			search: opts?.q,
			status: "published",
			resourceStatus: "published",
		});
	}

	async getPublicCollectionBySlug(slug: string) {
		const { getCollectionBySlug, listCollectionResources } = await import("@procomeka/db/repository");
		const collection = await getCollectionBySlug(this.db, slug, {
			status: "published",
			resourceStatus: "published",
		});
		if (!collection) return null;
		const resources = await listCollectionResources(this.db, collection.id, {
			limit: 100,
			status: "published",
		});
		return { ...collection, resources };
	}

	async getConfig(): Promise<AppConfig> {
		return { oidcEnabled: false, oidcProviders: [], oidcEndSessionUrl: null };
	}

	// --- Auth ---

	async getSession(): Promise<SessionData | null> {
		if (!this.loggedIn) return null;
		return { user: this.currentUser };
	}

	async signIn(email: string, _password: string): Promise<SignInResult> {
		const roles = ["admin", "curator", "author", "reader"];
		const match = roles.find((r) => this.userForRole(r).email === email);
		if (match) {
			this.switchRole(match);
			this.loggedIn = true;
			if (typeof localStorage !== "undefined") {
				localStorage.setItem(LOGGED_IN_KEY, "true");
			}
			return { ok: true };
		}
		return { ok: false, error: "Usuario de demostración no encontrado" };
	}

	async signInOidc(_providerId?: string, _callbackURL?: string): Promise<SignInResult> {
		return { ok: false, error: "OIDC no disponible en modo preview" };
	}

	async signOut(): Promise<void> {
		this.loggedIn = false;
		if (typeof localStorage !== "undefined") {
			localStorage.setItem(LOGGED_IN_KEY, "false");
		}
	}

	// --- Admin ---

	async listAdminResources(opts?: { q?: string; limit?: number; offset?: number; status?: string }): Promise<ResourceListResult> {
		const { listResources: list } = await import("@procomeka/db/repository");
		if (!this.hasMinRole("author")) {
			return { data: [], total: 0, limit: opts?.limit ?? 20, offset: opts?.offset ?? 0 };
		}
		return list(this.db, {
			limit: opts?.limit,
			offset: opts?.offset,
			search: opts?.q,
			status: opts?.status,
			createdBy: this.currentUser.role === "author" ? this.currentUser.id : undefined,
			visibleToUserId: this.currentUser.role === "curator" ? this.currentUser.id : undefined,
		});
	}

	async getResourceById(id: string): Promise<Resource | null> {
		const { getResourceById: get } = await import("@procomeka/db/repository");
		const resource = await get(this.db, id);
		if (!resource) return null;
		if (this.currentUser.role === "admin") return resource;
		if (this.currentUser.role === "curator") {
			return resource.createdBy === this.currentUser.id || resource.assignedCuratorId === this.currentUser.id ? resource : null;
		}
		if (this.currentUser.role === "author") {
			return resource.createdBy === this.currentUser.id ? resource : null;
		}
		return null;
	}

	async listResourceMediaItems(resourceId: string): Promise<MediaItemRecord[]> {
		const { listMediaItemsForResource } = await import("@procomeka/db/repository");
		return listMediaItemsForResource(this.db, resourceId);
	}

	async listResourceUploads(resourceId: string): Promise<UploadSessionRecord[]> {
		const { listUploadSessionsForResource } = await import("@procomeka/db/repository");
		return listUploadSessionsForResource(this.db, resourceId);
	}

	getDb() { return this.db; }

	async createResource(data: CreateResourceInput): Promise<{ id: string; slug: string }> {
		const { validateCreateResource } = await import("@procomeka/db/validation");
		const validation = validateCreateResource(data);
		if (!validation.valid) {
			throw { error: "Validación fallida", details: validation.errors };
		}
		const { createResource: create } = await import("@procomeka/db/repository");
		return create(this.db, { ...data, createdBy: this.currentUser.id });
	}

	async updateResource(id: string, data: UpdateResourceInput) {
		const { validateUpdateResource } = await import("@procomeka/db/validation");
		const validation = validateUpdateResource(data);
		if (!validation.valid) {
			return { ok: false, error: "Validación fallida", details: validation.errors };
		}
		const { updateResource: update } = await import("@procomeka/db/repository");
		await update(this.db, id, data);
		return { ok: true };
	}

	async updateResourceStatus(id: string, status: string): Promise<{ id: string; status: string }> {
		const { getResourceById: get, updateEditorialStatus } = await import("@procomeka/db/repository");
		const existing = await get(this.db, id);
		if (!existing) throw { error: "Recurso no encontrado" };
		if (this.currentUser.role === "author" && existing.createdBy !== this.currentUser.id) {
			throw { error: "Permisos insuficientes" };
		}
		if (this.currentUser.role === "curator" && existing.createdBy !== this.currentUser.id && existing.assignedCuratorId !== this.currentUser.id) {
			throw { error: "Permisos insuficientes" };
		}

		const { validateTransition } = await import("@procomeka/db/validation");
		const check = validateTransition(existing.editorialStatus, status, this.currentUser.role);
		if (!check.valid) throw { error: "Transición no permitida", details: check.errors };

		await updateEditorialStatus(this.db, id, status, this.currentUser.id);
		return { id, status };
	}

	async deleteResource(id: string): Promise<void> {
		const resource = await this.getResourceById(id);
		if (!resource) throw new Error("Recurso no encontrado");
		const { deleteResource: del } = await import("@procomeka/db/repository");
		await del(this.db, id);
	}

	async getUploadConfig(): Promise<UploadConfig> {
		return {
			maxFileSizeBytes: 50 * 1024 * 1024,
			maxFilesPerBatch: 10,
			maxConcurrentPerUser: 3,
			chunkSizeBytes: 5 * 1024 * 1024,
			sessionTtlMs: 86400000,
			allowedMimeTypes: [
				"application/octet-stream",
				"application/pdf", "application/msword",
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				"application/vnd.ms-powerpoint",
				"application/vnd.openxmlformats-officedocument.presentationml.presentation",
				"application/zip", "application/x-zip-compressed",
				"application/json", "text/csv",
				"video/mp4", "audio/mpeg", "audio/wav",
				"image/png", "image/jpeg", "image/gif", "image/webp",
			],
			allowedExtensions: [
				".pdf", ".doc", ".docx", ".ppt", ".pptx",
				".zip", ".scorm", ".elp", ".elpx",
				".mp4", ".mp3", ".wav",
				".png", ".jpg", ".jpeg", ".gif", ".webp",
				".csv", ".json",
			],
			storageDir: "preview-memory",
		};
	}

	async cancelUpload(id: string): Promise<{ id: string; cancelled: boolean }> {
		return { id, cancelled: true };
	}

	async getElpxProject(resourceId: string): Promise<import("./api-client.ts").ElpxProjectInfo | null> {
		const { getElpxProjectByResourceId } = await import("@procomeka/db/repository");
		const elpx = await getElpxProjectByResourceId(this.db, resourceId);
		if (!elpx) return null;

		const { getBaseUrl } = await import("./paths.ts");
		const { resolveElpxPreviewUrl, loadElpxBlob } = await import("./elpx-preview-service.ts");
		const base = getBaseUrl();

		const storedBlob = await loadElpxBlob(elpx.hash, `${base}api/v1/elpx-raw/${elpx.hash}.elpx`);
		const elpxFileUrl = storedBlob ? URL.createObjectURL(storedBlob) : `${base}api/v1/elpx-raw/${elpx.hash}.elpx`;
		const previewUrl = await resolveElpxPreviewUrl(elpx.hash, elpx.originalFilename);

		return {
			id: elpx.id,
			hash: elpx.hash,
			hasPreview: elpx.hasPreview === 1 || previewUrl !== null,
			previewUrl,
			elpxFileUrl,
			metadata: elpx.elpxMetadata ? JSON.parse(elpx.elpxMetadata) : null,
			originalFilename: elpx.originalFilename,
			version: elpx.version ?? 3,
			createdAt: elpx.createdAt,
		};
	}

	async listUsers(opts?: { q?: string; role?: string; limit?: number; offset?: number }) {
		const { listUsers } = await import("@procomeka/db/repository");
		const scope = this.currentUser.role === "admin" ? {} : { id: this.currentUser.id };
		return listUsers(this.db, { ...opts, ...scope, search: opts?.q });
	}

	async getUserById(id: string): Promise<UserRecord | null> {
		const { getUserById } = await import("@procomeka/db/repository");
		if (this.currentUser.role !== "admin" && this.currentUser.id !== id) return null;
		return getUserById(this.db, id);
	}

	async updateUser(id: string, data: Partial<Pick<UserRecord, "name" | "role" | "isActive">>) {
		if (this.currentUser.role !== "admin" && this.currentUser.id !== id) {
			return { ok: false, error: "Permisos insuficientes" };
		}
		const { updateUser } = await import("@procomeka/db/repository");
		const payload = this.currentUser.role === "admin" ? data : { name: data.name };
		await updateUser(this.db, id, payload);
		if (id === this.currentUser.id && typeof data.name === "string") {
			this.currentUser = { ...this.currentUser, name: data.name };
		}
		return { ok: true };
	}

	async listCollections(opts?: { q?: string; limit?: number; offset?: number }) {
		if (!this.hasMinRole("curator")) {
			return { data: [], total: 0, limit: opts?.limit ?? 20, offset: opts?.offset ?? 0 };
		}
		const { listCollections } = await import("@procomeka/db/repository");
		return listCollections(this.db, {
			limit: opts?.limit,
			offset: opts?.offset,
			search: opts?.q,
			curatorId: this.currentUser.role === "admin" ? undefined : this.currentUser.id,
		});
	}

	async getCollectionById(id: string) {
		if (!this.hasMinRole("curator")) return null;
		const { getCollectionById } = await import("@procomeka/db/repository");
		const found = await getCollectionById(this.db, id);
		if (!found) return null;
		if (this.currentUser.role !== "admin" && found.curatorId !== this.currentUser.id) return null;
		return found;
	}

	async listCollectionResources(collectionId: string) {
		const collection = await this.getCollectionById(collectionId);
		if (!collection) return [];
		const { listCollectionResources } = await import("@procomeka/db/repository");
		return listCollectionResources(this.db, collectionId, { limit: 100 });
	}

	async createCollection(data: { title: string; description: string; coverImageUrl?: string | null; editorialStatus?: string; isOrdered?: boolean }) {
		if (!this.hasMinRole("curator")) throw new Error("Permisos insuficientes");
		const { createCollection } = await import("@procomeka/db/repository");
		return createCollection(this.db, {
			title: data.title,
			description: data.description,
			coverImageUrl: data.coverImageUrl ?? null,
			curatorId: this.currentUser.id,
			editorialStatus: data.editorialStatus,
			isOrdered: data.isOrdered ? 1 : 0,
		});
	}

	async updateCollection(id: string, data: Partial<{ title: string; description: string; coverImageUrl: string | null; editorialStatus: string; isOrdered: boolean }>) {
		const existing = await this.getCollectionById(id);
		if (!existing) return { ok: false, error: "Colección no encontrada" };
		const { updateCollection } = await import("@procomeka/db/repository");
		await updateCollection(this.db, id, {
			title: data.title,
			description: data.description,
			coverImageUrl: data.coverImageUrl,
			editorialStatus: data.editorialStatus,
			isOrdered: typeof data.isOrdered === "boolean" ? (data.isOrdered ? 1 : 0) : undefined,
		});
		return { ok: true };
	}

	async deleteCollection(id: string): Promise<void> {
		const existing = await this.getCollectionById(id);
		if (!existing) throw new Error("Colección no encontrada");
		const { deleteCollection } = await import("@procomeka/db/repository");
		await deleteCollection(this.db, id);
	}

	async addResourceToCollection(collectionId: string, resourceId: string): Promise<{ ok: boolean }> {
		const collection = await this.getCollectionById(collectionId);
		if (!collection) throw new Error("Colección no encontrada");
		const resource = await this.getResourceById(resourceId);
		if (!resource) throw new Error("Recurso no encontrado");
		const { addResourceToCollection } = await import("@procomeka/db/repository");
		await addResourceToCollection(this.db, collectionId, resourceId);
		return { ok: true };
	}

	async removeResourceFromCollection(collectionId: string, resourceId: string): Promise<{ ok: boolean }> {
		const collection = await this.getCollectionById(collectionId);
		if (!collection) throw new Error("Colección no encontrada");
		const { removeResourceFromCollection } = await import("@procomeka/db/repository");
		await removeResourceFromCollection(this.db, collectionId, resourceId);
		return { ok: true };
	}

	async reorderCollectionResource(collectionId: string, resourceId: string, direction: "up" | "down"): Promise<{ ok: boolean; error?: string }> {
		const collection = await this.getCollectionById(collectionId);
		if (!collection) return { ok: false, error: "Colección no encontrada" };
		const { reorderCollectionResource } = await import("@procomeka/db/repository");
		const reordered = await reorderCollectionResource(this.db, collectionId, resourceId, direction);
		return reordered ? { ok: true } : { ok: false, error: "No se pudo reordenar el recurso" };
	}

	async listTaxonomies(opts?: { q?: string; type?: string; limit?: number; offset?: number }) {
		if (!this.hasMinRole("curator")) {
			return { data: [], total: 0, limit: opts?.limit ?? 20, offset: opts?.offset ?? 0 };
		}
		const { listTaxonomies } = await import("@procomeka/db/repository");
		return listTaxonomies(this.db, {
			limit: opts?.limit,
			offset: opts?.offset,
			search: opts?.q,
			type: opts?.type,
		});
	}

	async getTaxonomyById(id: string) {
		const { getTaxonomyById } = await import("@procomeka/db/repository");
		return getTaxonomyById(this.db, id);
	}

	async createTaxonomy(data: { name: string; slug?: string; type?: string; parentId?: string | null }) {
		if (!this.hasMinRole("admin")) throw new Error("Permisos insuficientes");
		const { createTaxonomy } = await import("@procomeka/db/repository");
		return createTaxonomy(this.db, data);
	}

	async updateTaxonomy(id: string, data: Partial<{ name: string; slug: string; type: string; parentId: string | null }>) {
		if (!this.hasMinRole("admin")) return { ok: false, error: "Permisos insuficientes" };
		const { updateTaxonomy } = await import("@procomeka/db/repository");
		await updateTaxonomy(this.db, id, data);
		return { ok: true };
	}

	async deleteTaxonomy(id: string): Promise<void> {
		if (!this.hasMinRole("admin")) throw new Error("Permisos insuficientes");
		const { deleteTaxonomy } = await import("@procomeka/db/repository");
		await deleteTaxonomy(this.db, id);
	}

	// --- Social (real PGlite queries) ---

	private async resolveResourceBySlug(slug: string): Promise<{ id: string; title: string; slug: string } | null> {
		const result = await this.pglite.query(
			`SELECT id, title, slug FROM resources WHERE slug = $1 AND deleted_at IS NULL LIMIT 1`,
			[slug],
		);
		return result.rows[0] ?? null;
	}

	private async logPreviewActivity(type: string, resourceId?: string | null, resourceTitle?: string | null, resourceSlug?: string | null, description?: string, metadata?: Record<string, unknown>) {
		try {
			await this.pglite.query(
				`INSERT INTO activity_events (id, user_id, type, resource_id, resource_title, resource_slug, description, metadata, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
				[crypto.randomUUID(), this.currentUser.id, type, resourceId ?? null, resourceTitle ?? null, resourceSlug ?? null, description ?? "", metadata ? JSON.stringify(metadata) : null],
			);
		} catch { /* fire-and-forget */ }
	}

	async getResourceRatings(slug: string) {
		const resource = await this.resolveResourceBySlug(slug);
		if (!resource) return { resourceId: "", averageScore: 0, totalRatings: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>, userScore: null as number | null };

		const rows = await this.pglite.query(
			`SELECT score, count(*)::int as count FROM ratings WHERE resource_id = $1 GROUP BY score`,
			[resource.id],
		);

		let totalRatings = 0;
		let totalScore = 0;
		const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
		for (const row of rows.rows as { score: number; count: number }[]) {
			distribution[row.score] = row.count;
			totalRatings += row.count;
			totalScore += row.score * row.count;
		}

		let userScore: number | null = null;
		if (this.loggedIn) {
			const userRow = await this.pglite.query(
				`SELECT score FROM ratings WHERE resource_id = $1 AND user_id = $2 LIMIT 1`,
				[resource.id, this.currentUser.id],
			);
			if (userRow.rows[0]) userScore = (userRow.rows[0] as { score: number }).score;
		}

		return {
			resourceId: resource.id,
			averageScore: totalRatings > 0 ? Math.round((totalScore / totalRatings) * 100) / 100 : 0,
			totalRatings,
			distribution,
			userScore,
		};
	}

	async submitRating(slug: string, score: number) {
		const resource = await this.resolveResourceBySlug(slug);
		if (!resource) throw { error: "Recurso no encontrado" };

		const existing = await this.pglite.query(
			`SELECT id FROM ratings WHERE resource_id = $1 AND user_id = $2 LIMIT 1`,
			[resource.id, this.currentUser.id],
		);

		const now = new Date().toISOString();
		if (existing.rows[0]) {
			await this.pglite.query(
				`UPDATE ratings SET score = $1, updated_at = $2 WHERE id = $3`,
				[score, now, (existing.rows[0] as { id: string }).id],
			);
		} else {
			await this.pglite.query(
				`INSERT INTO ratings (id, resource_id, user_id, score, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)`,
				[crypto.randomUUID(), resource.id, this.currentUser.id, score, now, now],
			);
		}

		await this.logPreviewActivity("rating_given", resource.id, resource.title, resource.slug, `Valoraste «${resource.title}» con ${score} estrellas`, { score });

		return { resourceId: resource.id, userId: this.currentUser.id, score, createdAt: now };
	}

	async toggleFavorite(slug: string) {
		const resource = await this.resolveResourceBySlug(slug);
		if (!resource) throw { error: "Recurso no encontrado" };

		const existing = await this.pglite.query(
			`SELECT id FROM favorites WHERE resource_id = $1 AND user_id = $2 LIMIT 1`,
			[resource.id, this.currentUser.id],
		);

		let favorited: boolean;
		if (existing.rows[0]) {
			await this.pglite.query(`DELETE FROM favorites WHERE id = $1`, [(existing.rows[0] as { id: string }).id]);
			favorited = false;
		} else {
			await this.pglite.query(
				`INSERT INTO favorites (id, resource_id, user_id, created_at) VALUES ($1, $2, $3, NOW())`,
				[crypto.randomUUID(), resource.id, this.currentUser.id],
			);
			favorited = true;
		}

		await this.logPreviewActivity(
			favorited ? "favorite_added" : "favorite_removed",
			resource.id, resource.title, resource.slug,
			favorited ? `Marcaste como favorito «${resource.title}»` : `Quitaste de favoritos «${resource.title}»`,
		);

		const countResult = await this.pglite.query(
			`SELECT count(*)::int as c FROM favorites WHERE resource_id = $1`,
			[resource.id],
		);

		return { favorited, count: Number((countResult.rows[0] as { c: number })?.c ?? 0) };
	}

	async getUserFavorites(opts?: { limit?: number; offset?: number }) {
		const limit = opts?.limit ?? 50;
		const offset = opts?.offset ?? 0;

		const rows = await this.pglite.query(
			`SELECT r.id, r.slug, r.title, r.description, r.language, r.license, r.resource_type as "resourceType",
				r.keywords, r.author, r.publisher, r.editorial_status as "editorialStatus",
				r.created_by as "createdBy", r.created_at as "createdAt", r.updated_at as "updatedAt"
			FROM favorites f
			INNER JOIN resources r ON f.resource_id = r.id
			WHERE f.user_id = $1 AND r.deleted_at IS NULL
			ORDER BY f.created_at DESC
			LIMIT $2 OFFSET $3`,
			[this.currentUser.id, limit, offset],
		);

		const countResult = await this.pglite.query(
			`SELECT count(*)::int as c FROM favorites f INNER JOIN resources r ON f.resource_id = r.id WHERE f.user_id = $1 AND r.deleted_at IS NULL`,
			[this.currentUser.id],
		);

		return { data: rows.rows as Resource[], total: Number((countResult.rows[0] as { c: number })?.c ?? 0), limit, offset };
	}

	async getUserRatings(opts?: { limit?: number; offset?: number }) {
		const limit = opts?.limit ?? 50;
		const offset = opts?.offset ?? 0;

		const rows = await this.pglite.query(
			`SELECT r.id, r.slug, r.title, r.description, r.language, r.license, r.resource_type as "resourceType",
				r.author, r.editorial_status as "editorialStatus", r.created_at as "createdAt",
				rat.score as "userScore", rat.created_at as "ratedAt"
			FROM ratings rat
			INNER JOIN resources r ON rat.resource_id = r.id
			WHERE rat.user_id = $1 AND r.deleted_at IS NULL
			ORDER BY rat.created_at DESC
			LIMIT $2 OFFSET $3`,
			[this.currentUser.id, limit, offset],
		);

		const countResult = await this.pglite.query(
			`SELECT count(*)::int as c FROM ratings rat INNER JOIN resources r ON rat.resource_id = r.id WHERE rat.user_id = $1 AND r.deleted_at IS NULL`,
			[this.currentUser.id],
		);

		return { data: rows.rows as Resource[], total: Number((countResult.rows[0] as { c: number })?.c ?? 0), limit, offset };
	}

	async getUserDashboard() {
		const resources = await this.listAdminResources({ limit: 5 });
		const drafts = await this.listAdminResources({ limit: 1, status: "draft" });
		const published = await this.listAdminResources({ limit: 1, status: "published" });

		const favResult = await this.pglite.query(
			`SELECT count(*)::int as c FROM favorites WHERE user_id = $1`,
			[this.currentUser.id],
		);
		const ratingResult = await this.pglite.query(
			`SELECT count(*)::int as c FROM ratings WHERE user_id = $1`,
			[this.currentUser.id],
		);

		return {
			draftCount: drafts.total,
			publishedCount: published.total,
			favoriteCount: Number((favResult.rows[0] as { c: number })?.c ?? 0),
			ratingCount: Number((ratingResult.rows[0] as { c: number })?.c ?? 0),
			recentResources: resources.data,
		};
	}

	async getUserActivity(opts?: { limit?: number; offset?: number }) {
		const limit = opts?.limit ?? 30;
		const offset = opts?.offset ?? 0;

		const rows = await this.pglite.query(
			`SELECT id, type, resource_id as "resourceId", resource_title as "resourceTitle",
				resource_slug as "resourceSlug", description, metadata, created_at as "createdAt"
			FROM activity_events
			WHERE user_id = $1
			ORDER BY created_at DESC
			LIMIT $2 OFFSET $3`,
			[this.currentUser.id, limit, offset],
		);

		const countResult = await this.pglite.query(
			`SELECT count(*)::int as c FROM activity_events WHERE user_id = $1`,
			[this.currentUser.id],
		);

		const data = (rows.rows as { id: string; type: string; resourceId: string | null; resourceTitle: string | null; resourceSlug: string | null; description: string; metadata: string | null; createdAt: string }[]).map(r => ({
			...r,
			metadata: r.metadata ? JSON.parse(r.metadata) : null,
		}));

		return { data, total: Number((countResult.rows[0] as { c: number })?.c ?? 0), limit, offset };
	}

	async trackDownload(slug: string) {
		const resource = await this.resolveResourceBySlug(slug);
		if (!resource) return { count: 0 };

		await this.pglite.query(
			`INSERT INTO downloads (id, resource_id, user_id, created_at) VALUES ($1, $2, $3, NOW())`,
			[crypto.randomUUID(), resource.id, this.loggedIn ? this.currentUser.id : null],
		);

		if (this.loggedIn) {
			await this.logPreviewActivity("resource_downloaded", resource.id, resource.title, resource.slug, `Descargaste «${resource.title}»`);
		}

		const countResult = await this.pglite.query(
			`SELECT count(*)::int as c FROM downloads WHERE resource_id = $1`,
			[resource.id],
		);
		return { count: Number((countResult.rows[0] as { c: number })?.c ?? 0) };
	}

	async getResourceStats(slug: string) {
		const resource = await this.resolveResourceBySlug(slug);
		if (!resource) return { downloadCount: 0, favoriteCount: 0, ratingAvg: 0, ratingCount: 0 };

		const [dlResult, favResult, ratingResult] = await Promise.all([
			this.pglite.query(`SELECT count(*)::int as c FROM downloads WHERE resource_id = $1`, [resource.id]),
			this.pglite.query(`SELECT count(*)::int as c FROM favorites WHERE resource_id = $1`, [resource.id]),
			this.pglite.query(`SELECT coalesce(avg(score), 0) as avg, count(*)::int as c FROM ratings WHERE resource_id = $1`, [resource.id]),
		]);

		return {
			downloadCount: Number((dlResult.rows[0] as { c: number })?.c ?? 0),
			favoriteCount: Number((favResult.rows[0] as { c: number })?.c ?? 0),
			ratingAvg: Math.round(Number((ratingResult.rows[0] as { avg: number })?.avg ?? 0) * 100) / 100,
			ratingCount: Number((ratingResult.rows[0] as { c: number })?.c ?? 0),
		};
	}

	async seedResources(count: number, clean?: boolean): Promise<{ count: number; durationMs: number }> {
		const { seedRandomResources } = await import("@procomeka/db/seed-random");
		return seedRandomResources(this.db, count, { clean });
	}

	// --- Preview-specific ---

	switchRole(role: string) {
		this.currentUser = this.userForRole(role);
		this.loggedIn = true;
		if (typeof localStorage !== "undefined") {
			localStorage.setItem(ROLE_KEY, role);
			localStorage.setItem(LOGGED_IN_KEY, "true");
		}
	}

	getCurrentRole(): string {
		return this.currentUser.role;
	}

	// biome-ignore lint: dynamic drizzle pglite types
	static getPreviewDb(): any {
		return PreviewApiClient._instance?.db ?? null;
	}

	async resetDatabase() {
		// Borrar todas las tablas y recargar seed
		await this.pglite.exec(`
			DELETE FROM "activity_events";
			DELETE FROM "downloads";
			DELETE FROM "favorites";
			DELETE FROM "ratings";
			DELETE FROM "resource_levels";
			DELETE FROM "resource_subjects";
			DELETE FROM "media_items";
			DELETE FROM "collection_resources";
			DELETE FROM "collections";
			DELETE FROM "taxonomies";
			DELETE FROM "resources";
			DELETE FROM "verification";
			DELETE FROM "session";
			DELETE FROM "account";
			DELETE FROM "user";
		`);
		this.seedData = null;
		await this.loadSeedData();
	}
}
