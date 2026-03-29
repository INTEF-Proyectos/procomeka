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
	assignedCuratorId?: string | null;
	createdAt: string | number | Date | null;
	updatedAt: string | number | Date | null;
	deletedAt: unknown;
	subjects?: string[];
	levels?: string[];
	mediaItems?: MediaItemRecord[];
	elpxPreview?: { hash: string; previewUrl: string } | null;
}

export interface ResourceListResult {
	data: Resource[];
	total: number;
	limit: number;
	offset: number;
}

export interface UserRecord {
	id: string;
	email: string;
	name: string | null;
	role: string;
	isActive: boolean;
	createdAt?: string | number | Date | null;
	updatedAt?: string | number | Date | null;
}

export interface CollectionRecord {
	id: string;
	slug: string;
	title: string;
	description: string;
	coverImageUrl?: string | null;
	editorialStatus: string;
	curatorId: string;
	curatorName?: string | null;
	resourceCount?: number;
	isOrdered?: number;
	createdAt?: string | number | Date | null;
	updatedAt?: string | number | Date | null;
}

export interface CollectionResourceRecord {
	resourceId: string;
	position: number;
	title: string;
	slug: string;
	description: string;
	resourceType: string;
	language: string;
	license: string;
	author: string | null;
	createdByName?: string | null;
	editorialStatus: string;
}

export interface CollectionDetailRecord extends CollectionRecord {
	resources: CollectionResourceRecord[];
}

export interface TaxonomyRecord {
	id: string;
	slug: string;
	name: string;
	type: string;
	parentId?: string | null;
	createdAt?: string | number | Date | null;
	updatedAt?: string | number | Date | null;
}

export interface PaginatedResult<T> {
	data: T[];
	total: number;
	limit: number;
	offset: number;
}

export interface MediaItemRecord {
	id: string;
	resourceId: string;
	type: string;
	mimeType?: string | null;
	url: string;
	fileSize?: number | null;
	filename?: string | null;
	isPrimary: number;
}

export interface UploadSessionRecord {
	id: string;
	resourceId: string;
	ownerId: string;
	mediaItemId?: string | null;
	status: string;
	originalFilename: string;
	mimeType?: string | null;
	storageKey: string;
	publicUrl?: string | null;
	checksumAlgorithm?: string | null;
	finalChecksum?: string | null;
	errorCode?: string | null;
	errorMessage?: string | null;
	declaredSize?: number | null;
	receivedBytes: number;
	expiresAt?: string | number | Date | null;
	completedAt?: string | number | Date | null;
	cancelledAt?: string | number | Date | null;
	createdAt?: string | number | Date | null;
	updatedAt?: string | number | Date | null;
}

export interface ElpxProjectInfo {
	id: string;
	hash: string;
	hasPreview: boolean;
	previewUrl: string | null;
	elpxFileUrl: string | null;
	metadata: {
		title: string;
		description: string;
		author: string;
		license: string;
		language: string;
		learningResourceType: string;
	} | null;
	originalFilename: string;
	version: number;
	createdAt: string | number | Date | null;
}

export interface UploadConfig {
	maxFileSizeBytes: number;
	maxFilesPerBatch: number;
	maxConcurrentPerUser: number;
	chunkSizeBytes: number;
	sessionTtlMs: number;
	allowedMimeTypes: string[];
	allowedExtensions: string[];
	storageDir: string;
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
	listPublicCollections(opts?: { q?: string; limit?: number; offset?: number }): Promise<PaginatedResult<CollectionRecord>>;
	getPublicCollectionBySlug(slug: string): Promise<CollectionDetailRecord | null>;
	getConfig(): Promise<AppConfig>;

	// Auth
	getSession(): Promise<SessionData | null>;
	signIn(email: string, password: string): Promise<SignInResult>;
	signInOidc(): Promise<SignInResult>;
	signOut(): Promise<void>;

	// Admin
	listAdminResources(opts?: { q?: string; limit?: number; offset?: number; status?: string }): Promise<ResourceListResult>;
	getResourceById(id: string): Promise<Resource | null>;
	listResourceMediaItems(id: string): Promise<MediaItemRecord[]>;
	listResourceUploads(id: string): Promise<UploadSessionRecord[]>;
	createResource(data: CreateResourceInput): Promise<{ id: string; slug: string }>;
	updateResource(id: string, data: UpdateResourceInput): Promise<{ ok: boolean; error?: string; details?: { field: string; message: string }[] }>;
	updateResourceStatus(id: string, status: string): Promise<{ id: string; status: string }>;
	deleteResource(id: string): Promise<void>;
	getUploadConfig(): Promise<UploadConfig>;
	cancelUpload(id: string): Promise<{ id: string; cancelled: boolean }>;
	getElpxProject(resourceId: string): Promise<ElpxProjectInfo | null>;

	listUsers(opts?: { q?: string; role?: string; limit?: number; offset?: number }): Promise<PaginatedResult<UserRecord>>;
	getUserById(id: string): Promise<UserRecord | null>;
	updateUser(id: string, data: Partial<Pick<UserRecord, "name" | "role" | "isActive">>): Promise<{ ok: boolean; error?: string }>;

	listCollections(opts?: { q?: string; limit?: number; offset?: number }): Promise<PaginatedResult<CollectionRecord>>;
	getCollectionById(id: string): Promise<CollectionRecord | null>;
	listCollectionResources(collectionId: string): Promise<CollectionResourceRecord[]>;
	createCollection(data: { title: string; description: string; coverImageUrl?: string | null; editorialStatus?: string; isOrdered?: boolean }): Promise<{ id: string; slug: string }>;
	updateCollection(id: string, data: Partial<{ title: string; description: string; coverImageUrl: string | null; editorialStatus: string; isOrdered: boolean }>): Promise<{ ok: boolean; error?: string; details?: { field: string; message: string }[] }>;
	deleteCollection(id: string): Promise<void>;
	addResourceToCollection(collectionId: string, resourceId: string): Promise<{ ok: boolean }>;
	removeResourceFromCollection(collectionId: string, resourceId: string): Promise<{ ok: boolean }>;
	reorderCollectionResource(collectionId: string, resourceId: string, direction: "up" | "down"): Promise<{ ok: boolean; error?: string }>;

	listTaxonomies(opts?: { q?: string; type?: string; limit?: number; offset?: number }): Promise<PaginatedResult<TaxonomyRecord>>;
	getTaxonomyById(id: string): Promise<TaxonomyRecord | null>;
	createTaxonomy(data: { name: string; slug?: string; type?: string; parentId?: string | null }): Promise<{ id: string; slug: string }>;
	updateTaxonomy(id: string, data: Partial<{ name: string; slug: string; type: string; parentId: string | null }>): Promise<{ ok: boolean; error?: string; details?: { field: string; message: string }[] }>;
	deleteTaxonomy(id: string): Promise<void>;

	// Social
	getResourceRatings(slug: string): Promise<{ resourceId: string; averageScore: number; totalRatings: number; distribution: Record<number, number> }>;
	submitRating(slug: string, score: number): Promise<{ resourceId: string; userId: string; score: number; createdAt: string }>;
	toggleFavorite(slug: string): Promise<{ favorited: boolean; count: number }>;
	getUserFavorites(opts?: { limit?: number; offset?: number }): Promise<PaginatedResult<Resource>>;
	getUserRatings(opts?: { limit?: number; offset?: number }): Promise<PaginatedResult<Resource>>;
	getUserDashboard(): Promise<{ draftCount: number; publishedCount: number; favoriteCount: number; recentResources: Resource[] }>;
	getUserActivity(opts?: { limit?: number; offset?: number }): Promise<PaginatedResult<import("./types/user-extended.ts").ActivityItem>>;
	trackDownload(slug: string): Promise<{ count: number }>;
	getResourceStats(slug: string): Promise<{ downloadCount: number; favoriteCount: number; ratingAvg: number; ratingCount: number }>;

	// Dev
	seedResources(count: number, clean?: boolean): Promise<{ count: number; durationMs: number }>;
}
