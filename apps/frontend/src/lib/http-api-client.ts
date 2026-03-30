import type {
	ApiClient,
	Resource,
	ResourceListResult,
	SessionData,
	AppConfig,
	SignInResult,
	CreateResourceInput,
	UpdateResourceInput,
	PaginatedResult,
	UserRecord,
	CollectionRecord,
	CollectionDetailRecord,
	CollectionResourceRecord,
	TaxonomyRecord,
	MediaItemRecord,
	UploadSessionRecord,
	UploadConfig,
} from "./api-client.ts";

/**
 * Cliente HTTP que llama al servidor API real.
 * Usado en modo normal (desarrollo y producción).
 */
export class HttpApiClient implements ApiClient {
	async listResources(opts?: {
		q?: string;
		limit?: number;
		offset?: number;
		resourceType?: string;
		language?: string;
		license?: string;
	}): Promise<ResourceListResult> {
		const params = new URLSearchParams();
		if (opts?.q) params.set("q", opts.q);
		if (opts?.limit) params.set("limit", String(opts.limit));
		if (opts?.offset) params.set("offset", String(opts.offset));
		if (opts?.resourceType) params.set("resourceType", opts.resourceType);
		if (opts?.language) params.set("language", opts.language);
		if (opts?.license) params.set("license", opts.license);
		const qs = params.toString();
		const res = await fetch(`/api/v1/resources${qs ? `?${qs}` : ""}`);
		return res.json();
	}

	async getResourceBySlug(slug: string): Promise<Resource | null> {
		const res = await fetch(`/api/v1/resources/${slug}`);
		if (!res.ok) return null;
		return res.json();
	}

	async listPublicCollections(opts?: { q?: string; limit?: number; offset?: number }): Promise<PaginatedResult<CollectionRecord>> {
		const params = new URLSearchParams();
		if (opts?.q) params.set("q", opts.q);
		if (opts?.limit) params.set("limit", String(opts.limit));
		if (opts?.offset) params.set("offset", String(opts.offset));
		const qs = params.toString();
		const res = await fetch(`/api/v1/collections${qs ? `?${qs}` : ""}`);
		return res.json();
	}

	async getPublicCollectionBySlug(slug: string): Promise<CollectionDetailRecord | null> {
		const res = await fetch(`/api/v1/collections/${slug}`);
		if (!res.ok) return null;
		return res.json();
	}

	async getConfig(): Promise<AppConfig> {
		const res = await fetch("/api/v1/config");
		return res.json();
	}

	async getPlatformStats(): Promise<{ users: number }> {
		const res = await fetch("/api/v1/stats");
		return res.json();
	}

	async getSession(): Promise<SessionData | null> {
		try {
			const res = await fetch("/api/auth/get-session", { credentials: "include" });
			if (!res.ok) return null;
			const data = await res.json();
			if (!data?.user) return null;
			return data;
		} catch {
			return null;
		}
	}

	async signIn(email: string, password: string): Promise<SignInResult> {
		const res = await fetch("/api/auth/sign-in/email", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ email, password }),
		});
		if (res.ok) return { ok: true };
		const data = await res.json().catch(() => null);
		return { ok: false, error: data?.message ?? "Credenciales incorrectas" };
	}

	async signInOidc(): Promise<SignInResult> {
		const res = await fetch("/api/auth/sign-in/oauth2", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ providerId: "oidc", callbackURL: "/dashboard" }),
			redirect: "manual",
		});
		const location = res.headers.get("location");
		if (location) return { ok: true, redirectUrl: location };
		if (res.ok) {
			const data = await res.json().catch(() => null);
			if (data?.url) return { ok: true, redirectUrl: data.url };
		}
		return { ok: false, error: "No se pudo iniciar el login institucional" };
	}

	async signOut(): Promise<void> {
		await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
	}

	async listAdminResources(opts?: { q?: string; limit?: number; offset?: number; status?: string }): Promise<ResourceListResult> {
		const params = new URLSearchParams();
		if (opts?.q) params.set("q", opts.q);
		if (opts?.limit) params.set("limit", String(opts.limit));
		if (opts?.offset) params.set("offset", String(opts.offset));
		if (opts?.status) params.set("status", opts.status);
		const qs = params.toString();
		const res = await fetch(`/api/admin/resources${qs ? `?${qs}` : ""}`, { credentials: "include" });
		return res.json();
	}

	async getResourceById(id: string): Promise<Resource | null> {
		const res = await fetch(`/api/admin/resources/${id}`, { credentials: "include" });
		if (!res.ok) return null;
		return res.json();
	}

	async listResourceMediaItems(id: string): Promise<MediaItemRecord[]> {
		const res = await fetch(`/api/admin/resources/${id}/media`, { credentials: "include" });
		if (!res.ok) return [];
		return res.json();
	}

	async listResourceUploads(id: string): Promise<UploadSessionRecord[]> {
		const res = await fetch(`/api/admin/resources/${id}/uploads`, { credentials: "include" });
		if (!res.ok) return [];
		return res.json();
	}

	async createResource(data: CreateResourceInput): Promise<{ id: string; slug: string }> {
		const res = await fetch("/api/admin/resources", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw err;
		}
		return res.json();
	}

	async updateResource(id: string, data: UpdateResourceInput) {
		const res = await fetch(`/api/admin/resources/${id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return { ok: false, error: err.error, details: err.details };
		}
		return { ok: true };
	}

	async updateResourceStatus(id: string, status: string): Promise<{ id: string; status: string }> {
		const res = await fetch(`/api/admin/resources/${id}/status`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ status }),
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw err;
		}
		return res.json();
	}

	async deleteResource(id: string): Promise<void> {
		await fetch(`/api/admin/resources/${id}`, {
			method: "DELETE",
			credentials: "include",
		});
	}

	async getUploadConfig(): Promise<UploadConfig> {
		const res = await fetch("/api/admin/uploads/config", { credentials: "include" });
		return res.json();
	}

	async cancelUpload(id: string): Promise<{ id: string; cancelled: boolean }> {
		const res = await fetch(`/api/admin/uploads/${id}`, {
			method: "DELETE",
			credentials: "include",
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw err;
		}
		return res.json();
	}

	async deleteMediaItem(resourceId: string, mediaItemId: string): Promise<{ id: string; deleted: boolean }> {
		const res = await fetch(`/api/admin/resources/${resourceId}/media/${mediaItemId}`, {
			method: "DELETE",
			credentials: "include",
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw new Error((err as Record<string, string>).error ?? "Error al eliminar el archivo");
		}
		return res.json();
	}

	async getElpxProject(resourceId: string): Promise<import("./api-client.ts").ElpxProjectInfo | null> {
		const res = await fetch(`/api/admin/resources/${resourceId}/elpx`, { credentials: "include" });
		if (!res.ok) return null;
		return res.json();
	}

	async generateElpx(resourceId: string) {
		const res = await fetch(`/api/admin/elpx/generate/${resourceId}`, {
			method: "POST",
			credentials: "include",
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw new Error((err as Record<string, string>).error ?? "Error al generar el .elpx");
		}
		return res.json();
	}

	async listUsers(opts?: { q?: string; role?: string; limit?: number; offset?: number }): Promise<PaginatedResult<UserRecord>> {
		const params = new URLSearchParams();
		if (opts?.q) params.set("q", opts.q);
		if (opts?.role) params.set("role", opts.role);
		if (opts?.limit) params.set("limit", String(opts.limit));
		if (opts?.offset) params.set("offset", String(opts.offset));
		const qs = params.toString();
		const res = await fetch(`/api/admin/users${qs ? `?${qs}` : ""}`, { credentials: "include" });
		return res.json();
	}

	async getUserById(id: string): Promise<UserRecord | null> {
		const res = await fetch(`/api/admin/users/${id}`, { credentials: "include" });
		if (!res.ok) return null;
		return res.json();
	}

	async updateUser(id: string, data: Partial<Pick<UserRecord, "name" | "role" | "isActive">>) {
		const res = await fetch(`/api/admin/users/${id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return { ok: false, error: err.error ?? "Error al actualizar usuario" };
		}
		return { ok: true };
	}

	async listCollections(opts?: { q?: string; limit?: number; offset?: number }): Promise<PaginatedResult<CollectionRecord>> {
		const params = new URLSearchParams();
		if (opts?.q) params.set("q", opts.q);
		if (opts?.limit) params.set("limit", String(opts.limit));
		if (opts?.offset) params.set("offset", String(opts.offset));
		const qs = params.toString();
		const res = await fetch(`/api/admin/collections${qs ? `?${qs}` : ""}`, { credentials: "include" });
		return res.json();
	}

	async getCollectionById(id: string): Promise<CollectionRecord | null> {
		const res = await fetch(`/api/admin/collections/${id}`, { credentials: "include" });
		if (!res.ok) return null;
		return res.json();
	}

	async listCollectionResources(collectionId: string): Promise<CollectionResourceRecord[]> {
		const res = await fetch(`/api/admin/collections/${collectionId}/resources`, { credentials: "include" });
		if (!res.ok) return [];
		return res.json();
	}

	async createCollection(data: { title: string; description: string; coverImageUrl?: string | null; editorialStatus?: string; isOrdered?: boolean }) {
		const res = await fetch("/api/admin/collections", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw err;
		}
		return res.json();
	}

	async updateCollection(id: string, data: Partial<{ title: string; description: string; coverImageUrl: string | null; editorialStatus: string; isOrdered: boolean }>) {
		const res = await fetch(`/api/admin/collections/${id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return { ok: false, error: err.error, details: err.details };
		}
		return { ok: true };
	}

	async deleteCollection(id: string): Promise<void> {
		await fetch(`/api/admin/collections/${id}`, {
			method: "DELETE",
			credentials: "include",
		});
	}

	async addResourceToCollection(collectionId: string, resourceId: string): Promise<{ ok: boolean }> {
		const res = await fetch(`/api/admin/collections/${collectionId}/resources`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ resourceId }),
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw err;
		}
		return res.json();
	}

	async removeResourceFromCollection(collectionId: string, resourceId: string): Promise<{ ok: boolean }> {
		const res = await fetch(`/api/admin/collections/${collectionId}/resources/${resourceId}`, {
			method: "DELETE",
			credentials: "include",
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw err;
		}
		return res.json();
	}

	async reorderCollectionResource(collectionId: string, resourceId: string, direction: "up" | "down"): Promise<{ ok: boolean; error?: string }> {
		const res = await fetch(`/api/admin/collections/${collectionId}/resources/reorder`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ resourceId, direction }),
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return { ok: false, error: err.error ?? "No se pudo reordenar el recurso" };
		}
		return res.json();
	}

	async listTaxonomies(opts?: { q?: string; type?: string; limit?: number; offset?: number }): Promise<PaginatedResult<TaxonomyRecord>> {
		const params = new URLSearchParams();
		if (opts?.q) params.set("q", opts.q);
		if (opts?.type) params.set("type", opts.type);
		if (opts?.limit) params.set("limit", String(opts.limit));
		if (opts?.offset) params.set("offset", String(opts.offset));
		const qs = params.toString();
		const res = await fetch(`/api/admin/taxonomies${qs ? `?${qs}` : ""}`, { credentials: "include" });
		return res.json();
	}

	async getTaxonomyById(id: string): Promise<TaxonomyRecord | null> {
		const res = await fetch(`/api/admin/taxonomies/${id}`, { credentials: "include" });
		if (!res.ok) return null;
		return res.json();
	}

	async createTaxonomy(data: { name: string; slug?: string; type?: string; parentId?: string | null }) {
		const res = await fetch("/api/admin/taxonomies", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw err;
		}
		return res.json();
	}

	async updateTaxonomy(id: string, data: Partial<{ name: string; slug: string; type: string; parentId: string | null }>) {
		const res = await fetch(`/api/admin/taxonomies/${id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return { ok: false, error: err.error, details: err.details };
		}
		return { ok: true };
	}

	async deleteTaxonomy(id: string): Promise<void> {
		await fetch(`/api/admin/taxonomies/${id}`, {
			method: "DELETE",
			credentials: "include",
		});
	}

	// --- Social ---

	async getResourceRatings(slug: string) {
		const res = await fetch(`/api/v1/resources/${slug}/ratings`);
		return res.json();
	}

	async submitRating(slug: string, score: number) {
		const res = await fetch(`/api/v1/resources/${slug}/ratings`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ score }),
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw err;
		}
		return res.json();
	}

	async toggleFavorite(slug: string) {
		const res = await fetch(`/api/v1/resources/${slug}/favorite`, {
			method: "POST",
			credentials: "include",
		});
		return res.json();
	}

	async getUserFavorites(opts?: { limit?: number; offset?: number }): Promise<import("./api-client.ts").PaginatedResult<import("./api-client.ts").Resource>> {
		const params = new URLSearchParams();
		if (opts?.limit) params.set("limit", String(opts.limit));
		if (opts?.offset) params.set("offset", String(opts.offset));
		const qs = params.toString();
		const res = await fetch(`/api/v1/users/me/favorites${qs ? `?${qs}` : ""}`, { credentials: "include" });
		return res.json();
	}

	async getUserRatings(opts?: { limit?: number; offset?: number }): Promise<import("./api-client.ts").PaginatedResult<import("./api-client.ts").Resource>> {
		const params = new URLSearchParams();
		if (opts?.limit) params.set("limit", String(opts.limit));
		if (opts?.offset) params.set("offset", String(opts.offset));
		const qs = params.toString();
		const res = await fetch(`/api/v1/users/me/ratings${qs ? `?${qs}` : ""}`, { credentials: "include" });
		return res.json();
	}

	async getUserDashboard() {
		const res = await fetch("/api/v1/users/me/dashboard", { credentials: "include" });
		return res.json();
	}

	async getUserActivity(opts?: { limit?: number; offset?: number }): Promise<import("./api-client.ts").PaginatedResult<import("./types/user-extended.ts").ActivityItem>> {
		const params = new URLSearchParams();
		if (opts?.limit) params.set("limit", String(opts.limit));
		if (opts?.offset) params.set("offset", String(opts.offset));
		const qs = params.toString();
		const res = await fetch(`/api/v1/users/me/activity${qs ? `?${qs}` : ""}`, { credentials: "include" });
		return res.json();
	}

	async trackDownload(slug: string): Promise<{ count: number }> {
		const res = await fetch(`/api/v1/resources/${slug}/download`, {
			method: "POST",
			credentials: "include",
		});
		return res.json();
	}

	async getResourceStats(slug: string): Promise<{ downloadCount: number; favoriteCount: number; ratingAvg: number; ratingCount: number }> {
		const res = await fetch(`/api/v1/resources/${slug}/stats`);
		return res.json();
	}

	async getBadgeConfig(): Promise<import("./api-client.ts").BadgeConfig> {
		const res = await fetch("/api/v1/config/badges");
		return res.json();
	}

	async getSettings(): Promise<Record<string, string>> {
		const res = await fetch("/api/admin/settings", { credentials: "include" });
		return res.json();
	}

	async updateSettings(settings: Record<string, string>): Promise<Record<string, string>> {
		const res = await fetch("/api/admin/settings", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(settings),
		});
		return res.json();
	}

	async seedResources(count: number, clean?: boolean): Promise<{ count: number; durationMs: number }> {
		const res = await fetch("/api/dev/seed-resources", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ count, clean }),
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw new Error(err.error || "Error al generar recursos");
		}
		return res.json();
	}
}
