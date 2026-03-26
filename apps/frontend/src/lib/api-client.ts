/**
 * Interfaz estable para todas las operaciones de datos del frontend.
 * Dos implementaciones: HttpApiClient (servidor) y PreviewApiClient (PGlite en navegador).
 */

export interface Resource {
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
	createdBy: string | null;
	createdByName: string | null;
	createdAt: string | number | Date | null;
	updatedAt: string | number | Date | null;
	deletedAt: unknown;
	subjects?: string[];
	levels?: string[];
}

export interface ResourceListResult {
	data: Resource[];
	total: number;
	limit: number;
	offset: number;
}

export interface SessionUser {
	id: string;
	email: string;
	name: string;
	role: string;
}

export interface SessionData {
	user: SessionUser;
}

export interface Collection {
	id: string;
	slug: string;
	title: string;
	description: string;
	coverImageUrl: string | null;
	isOrdered: boolean;
	curatorId: string;
	editorialStatus: string;
	createdAt: string | number | Date | null;
	resources?: { resourceId: string; position: number; title: string; slug: string }[];
}

export interface CollectionListResult {
	data: Collection[];
	total: number;
	limit: number;
	offset: number;
}

export interface Taxonomy {
	id: string;
	slug: string;
	name: string;
	description: string | null;
	type: string;
	parentId: string | null;
}

export interface UserListResult {
	data: SessionUser[];
	total: number;
	limit: number;
	offset: number;
}

export interface AppConfig {
	oidcEnabled: boolean;
	oidcEndSessionUrl: string | null;
}

export interface SignInResult {
	ok: boolean;
	error?: string;
	redirectUrl?: string;
}

export interface CreateResourceInput {
	title: string;
	description: string;
	language: string;
	license: string;
	resourceType: string;
	author?: string;
	keywords?: string;
	publisher?: string;
	subjects?: string[];
	levels?: string[];
}

export type UpdateResourceInput = Partial<CreateResourceInput>;

export interface ApiClient {
	// Public
	listResources(opts?: {
		q?: string;
		limit?: number;
		offset?: number;
		resourceType?: string;
		language?: string;
		license?: string;
	}): Promise<ResourceListResult>;
	getResourceBySlug(slug: string): Promise<Resource | null>;
	getConfig(): Promise<AppConfig>;

	// Auth
	getSession(): Promise<SessionData | null>;
	signIn(email: string, password: string): Promise<SignInResult>;
	signInOidc(): Promise<SignInResult>;
	signOut(): Promise<void>;

	// Admin
	listAdminResources(opts?: { limit?: number; offset?: number; status?: string }): Promise<ResourceListResult>;
	getResourceById(id: string): Promise<Resource | null>;
	createResource(data: CreateResourceInput): Promise<{ id: string; slug: string }>;
	updateResource(id: string, data: UpdateResourceInput): Promise<{ ok: boolean; error?: string; details?: { field: string; message: string }[] }>;
	updateResourceStatus(id: string, status: string): Promise<{ id: string; status: string }>;
	deleteResource(id: string): Promise<void>;

	// Users
	listUsers(opts?: { limit?: number; offset?: number; q?: string }): Promise<UserListResult>;
	updateUserRole(id: string, role: string): Promise<void>;

	// Collections
	listCollections(opts?: { limit?: number; offset?: number }): Promise<CollectionListResult>;
	getCollectionById(id: string): Promise<Collection | null>;
	createCollection(data: Partial<Collection>): Promise<{ id: string; slug: string }>;
	updateCollection(id: string, data: Partial<Collection>): Promise<void>;
	deleteCollection(id: string): Promise<void>;

	// Taxonomies
	listTaxonomies(type?: string): Promise<Taxonomy[]>;
	createTaxonomy(data: Partial<Taxonomy>): Promise<{ id: string; slug: string }>;
	updateTaxonomy(id: string, data: Partial<Taxonomy>): Promise<void>;
	deleteTaxonomy(id: string): Promise<void>;
}
