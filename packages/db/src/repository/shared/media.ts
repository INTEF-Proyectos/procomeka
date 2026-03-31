export function normalizeMediaUrl(url: string, uploadId?: string | null) {
	if (uploadId) return `/api/v1/uploads/${uploadId}/content`;
	return url.replace(/^\/api\/admin\/uploads\/([^/]+)\/content$/, "/api/v1/uploads/$1/content");
}
