export function buildElpxPreview(
	elpx: { hash?: string; hasPreview?: boolean } | null | undefined,
): { hash: string; previewUrl: string } | null {
	if (!elpx || !elpx.hasPreview || !elpx.hash) return null;
	return { hash: elpx.hash, previewUrl: `/api/v1/elpx/${elpx.hash}/` };
}

export type ElpxRow = { resourceId: string; hash: string; hasPreview: boolean };

export function buildElpxMap(rows: ElpxRow[]): Map<string, ElpxRow> {
	return new Map(rows.map((row) => [row.resourceId, row]));
}
