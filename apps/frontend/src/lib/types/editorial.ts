/** Editorial workflow statuses for resources and collections */
export type EditorialStatus = "draft" | "in_review" | "published" | "archived";

/** Status display metadata for UI rendering */
export interface EditorialStatusInfo {
  status: EditorialStatus;
  label: string;
  color: string;
  icon: string;
}

/** Map of editorial statuses to their display info */
export const EDITORIAL_STATUS_MAP: Record<EditorialStatus, EditorialStatusInfo> = {
  draft: { status: "draft", label: "Borrador", color: "amber", icon: "edit_note" },
  in_review: { status: "in_review", label: "En revisión", color: "blue", icon: "rate_review" },
  published: { status: "published", label: "Publicado", color: "green", icon: "check_circle" },
  archived: { status: "archived", label: "Archivado", color: "gray", icon: "archive" },
};
