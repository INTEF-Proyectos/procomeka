import { useCallback, useEffect, useState } from "react";
import type { Resource, SessionData } from "../../lib/api-client.ts";
import { getApiClient } from "../../lib/get-api-client.ts";
import { url } from "../../lib/paths.ts";
import { FILE_ICONS, formatBytes, STATUS_MAP, TYPE_ICONS } from "../../lib/resource-display.ts";
import { RatingIsland } from "../social/RatingIsland.tsx";
import { FavoriteIsland } from "../social/FavoriteIsland.tsx";
import "../../lib/paraglide-client.ts";
import * as m from "../../paraglide/messages.js";
import { getLocale } from "../../paraglide/runtime.js";
import { hasMinRole } from "../../lib/shared-utils.ts";

function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, []);

  return (
    <button
      className={`meta-action-btn${copied ? " meta-action-btn-success" : ""}`}
      type="button"
      onClick={handleShare}
      aria-label={copied ? m.detail_shared_label() : m.detail_share_label()}
    >
      <span className="material-symbols-outlined" aria-hidden="true">
        {copied ? "check" : "share"}
      </span>
      {copied ? m.detail_shared() : m.detail_share()}
    </button>
  );
}

function EmbedSection({ title, previewUrl, slug }: { title: string; previewUrl: string; slug: string }) {
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const fullUrl = typeof window !== "undefined"
    ? new URL(previewUrl, window.location.origin).href
    : previewUrl;
  const iframeCode = `<iframe title="${title.replace(/"/g, "&quot;")}" src="${fullUrl}" width="1100" height="540" frameborder="0" allowfullscreen></iframe>`;

  function handleCopy() {
    navigator.clipboard.writeText(iframeCode).then(() => {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2500);
    });
  }

  return (
    <section className="embed-section">
      <h2>{m.detail_embed_title()}</h2>
      <p className="embed-description">
        {m.detail_embed_desc()}
      </p>
      <div className="embed-code-wrapper">
        <textarea
          className="embed-textarea"
          readOnly
          value={iframeCode}
          rows={3}
          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          aria-label={m.detail_embed_label()}
        />
        <button
          className={`embed-copy-btn${copiedEmbed ? " embed-copy-success" : ""}`}
          type="button"
          onClick={handleCopy}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {copiedEmbed ? "check" : "content_copy"}
          </span>
          {copiedEmbed ? m.detail_embed_copied() : m.detail_embed_copy()}
        </button>
      </div>
    </section>
  );
}

function resourceDate(dateValue: Resource["createdAt"]) {
  if (!dateValue) return "";
  return new Date(dateValue).toLocaleDateString(getLocale(), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getStatusBadgeClass(editorialStatus: string): string {
  switch (editorialStatus) {
    case "draft": return "detail-status-badge draft";
    case "review": return "detail-status-badge review";
    case "archived": return "detail-status-badge archived";
    default: return "detail-status-badge";
  }
}

function ResourceDetailContent({ resource, session, stats, isFavorited }: { resource: Resource; session: SessionData | null; stats: ResourceStats | null; isFavorited: boolean }) {
  const status = STATUS_MAP[resource.editorialStatus] ?? STATUS_MAP.draft;
  const keywords = resource.keywords
    ? resource.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean)
    : [];
  const publicationDate = resourceDate(resource.createdAt);
  const updatedDate = resourceDate(resource.updatedAt);
  const currentUserId = session?.user?.id ?? null;
  const userRole = session?.user?.role ?? "reader";
  const isOwner = currentUserId !== null && resource.createdBy === currentUserId;
  const canEdit = hasMinRole(userRole, "author") && (isOwner || hasMinRole(userRole, "curator"));
  const authorName = resource.createdByName || resource.author || m.detail_unknown_author();
  const authorInitial = authorName.charAt(0).toUpperCase();
  const hasPreview = !!resource.elpxPreview?.previewUrl;
  const hasFiles = !!resource.mediaItems?.length;
  const totalFileSize = resource.mediaItems?.reduce((sum, item) => sum + (item.fileSize ?? 0), 0) ?? 0;

  return (
    <>
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <a href={url("")}>{m.detail_home()}</a>
        <span className="sep">/</span>
        <a href={url("explorar")}>{m.detail_explore()}</a>
        <span className="sep">/</span>
        <span>{resource.title}</span>
      </nav>

      {/* Header */}
      <header className="detail-header">
        {/* Meta row: status badge + date */}
        <div className="detail-header-meta">
          <span className={getStatusBadgeClass(resource.editorialStatus)}>
            {status.label}
          </span>
          {updatedDate || publicationDate ? (
            <span className="detail-date">
              <span className="material-symbols-outlined">calendar_today</span>
              {updatedDate ? m.detail_updated({ date: updatedDate }) : m.detail_published_on({ date: publicationDate })}
            </span>
          ) : null}
        </div>

        {/* Title */}
        <h1 className="detail-title">{resource.title}</h1>

        {/* Author + license row */}
        <div className="detail-author-row">
          <div className="detail-author">
            <div className="detail-author-avatar">{authorInitial}</div>
            <div>
              <p className="detail-author-name">{authorName}</p>
              {resource.publisher ? (
                <p className="detail-author-role">{resource.publisher}</p>
              ) : null}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {resource.license ? (
              <div className="detail-license">
                <span className="material-symbols-outlined">copyright</span>
                <span className="detail-license-text">{resource.license}</span>
              </div>
            ) : null}
            {canEdit ? (
              <a href={url(`editar?id=${resource.id}`)} className="edit-btn">
                {m.detail_edit()}
              </a>
            ) : null}
          </div>
        </div>
      </header>

      {/* Grid: left content + right sidebar */}
      <div className="detail-content">
        {/* Left column */}
        <div className="detail-main">
          {/* Action buttons */}
          <div className="detail-actions-bar">
            {hasPreview ? (
              <a
                href={resource.elpxPreview!.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="detail-action-primary"
              >
                <span className="material-symbols-outlined">visibility</span>
                {m.detail_view_online()}
              </a>
            ) : null}
            {hasFiles && resource.mediaItems?.[0]?.url ? (
              <a
                href={resource.mediaItems[0].url}
                download
                className="detail-action-outline"
                onClick={() => {
                  getApiClient().then((api) => api.trackDownload(resource.slug)).catch(() => {});
                }}
              >
                <span className="material-symbols-outlined">download</span>
                {m.detail_download()}{totalFileSize > 0 ? ` (${formatBytes(totalFileSize)})` : ""}
                {stats?.downloadCount ? <span className="detail-action-count">{stats.downloadCount}</span> : null}
              </a>
            ) : null}
            {!hasPreview && !hasFiles ? (
              <span style={{ color: "var(--color-on-surface-variant)", fontSize: "var(--text-body-md)" }}>
                {m.detail_no_files()}
              </span>
            ) : null}
          </div>

          {/* Preview */}
          {hasPreview ? (
            <section className="elpx-preview-section">
              <h2>{m.detail_preview_title()}</h2>
              <div className="elpx-preview-wrapper">
                <iframe
                  src={resource.elpxPreview!.previewUrl}
                  className="elpx-preview-iframe"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  title={m.detail_preview_iframe()}
                />
              </div>
            </section>
          ) : null}

          {/* Embed / Ponlo en tu web */}
          {hasPreview ? (
            <EmbedSection
              title={resource.title}
              previewUrl={resource.elpxPreview!.previewUrl}
              slug={resource.slug}
            />
          ) : null}

          {/* Description */}
          {resource.description ? (
            <section className="description-section">
              <h2>{m.detail_description()}</h2>
              <p>{resource.description}</p>
            </section>
          ) : null}

          {/* Files */}
          {hasFiles ? (
            <section className="files-section">
              <h2>{m.detail_files()}</h2>
              <div className="files-grid">
                {resource.mediaItems!.map((mediaItem) => {
                  const fileIcon = FILE_ICONS[mediaItem.mimeType || ""] ?? "&#128193;";
                  const size = mediaItem.fileSize ? formatBytes(mediaItem.fileSize) : "";
                  return (
                    <a key={mediaItem.id} href={mediaItem.url} className="file-card" download>
                      <span
                        className="file-icon"
                        aria-hidden="true"
                        dangerouslySetInnerHTML={{ __html: fileIcon }}
                      />
                      <div className="file-info">
                        <span className="file-name">{mediaItem.filename || m.detail_file_default()}</span>
                        {size ? <span className="file-size">{size}</span> : null}
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* Ratings */}
          <section className="detail-ratings-section">
            <RatingIsland resourceSlug={resource.slug} currentUserId={currentUserId} />
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="detail-sidebar-col">
          <div className="detail-meta-card">
            {/* Technical details */}
            <div className="meta-section">
              <h3 className="meta-section-title">{m.detail_technical()}</h3>
              <div>
                {resource.resourceType ? (
                  <div className="meta-row">
                    <div className="meta-row-icon">
                      <span className="material-symbols-outlined">category</span>
                    </div>
                    <div>
                      <p className="meta-row-label">{m.detail_type()}</p>
                      <p className="meta-row-value">{resource.resourceType}</p>
                    </div>
                  </div>
                ) : null}

                {resource.language ? (
                  <div className="meta-row">
                    <div className="meta-row-icon">
                      <span className="material-symbols-outlined">translate</span>
                    </div>
                    <div>
                      <p className="meta-row-label">{m.detail_language()}</p>
                      <p className="meta-row-value">{resource.language}</p>
                    </div>
                  </div>
                ) : null}

                {resource.subjects?.length ? (
                  <div className="meta-row">
                    <div className="meta-row-icon">
                      <span className="material-symbols-outlined">architecture</span>
                    </div>
                    <div>
                      <p className="meta-row-label">{m.detail_subjects()}</p>
                      <p className="meta-row-value">{resource.subjects.join(", ")}</p>
                    </div>
                  </div>
                ) : null}

                {resource.levels?.length ? (
                  <div className="meta-row">
                    <div className="meta-row-icon">
                      <span className="material-symbols-outlined">school</span>
                    </div>
                    <div>
                      <p className="meta-row-label">{m.detail_levels()}</p>
                      <p className="meta-row-value">{resource.levels.join(", ")}</p>
                    </div>
                  </div>
                ) : null}

                {publicationDate ? (
                  <div className="meta-row">
                    <div className="meta-row-icon">
                      <span className="material-symbols-outlined">event</span>
                    </div>
                    <div>
                      <p className="meta-row-label">{m.detail_pub_date()}</p>
                      <p className="meta-row-value">{publicationDate}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Keywords / Tags */}
            {keywords.length > 0 ? (
              <div className="meta-section">
                <h3 className="meta-section-title">{m.detail_tags()}</h3>
                <div className="meta-tags">
                  {keywords.map((keyword) => (
                    <span key={keyword} className="meta-tag">{keyword}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Actions: Favorite + Share */}
            <div className="meta-section">
              <div className="meta-actions">
                <FavoriteIsland
                  resourceSlug={resource.slug}
                  initialFavorited={isFavorited}
                  initialCount={stats?.favoriteCount ?? 0}
                  currentUserId={currentUserId}
                />
                <ShareButton />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

interface ResourceStats {
  downloadCount: number;
  favoriteCount: number;
  ratingAvg: number;
  ratingCount: number;
}

export function ResourceDetailIsland() {
  const [resource, setResource] = useState<Resource | null | undefined>(undefined);
  const [session, setSession] = useState<SessionData | null>(null);
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("slug");
    if (!slug) {
      setResource(null);
      return;
    }

    void (async () => {
      try {
        const api = await getApiClient();
        const [nextResource, nextSession] = await Promise.all([
          api.getResourceBySlug(slug),
          api.getSession().catch(() => null),
        ]);

        setResource(nextResource);
        setSession(nextSession);

        // Fetch social stats (includes userFavorited)
        if (nextResource) {
          api.getResourceStats(slug).then((s) => {
            setStats(s);
            if ((s as Record<string, unknown>).userFavorited) {
              setIsFavorited(true);
            }
          }).catch(() => {});
        }
      } catch {
        setError(m.detail_error());
        setResource(null);
      }
    })();
  }, []);

  if (resource === undefined && !error) {
    return (
      <div className="detail-page">
        <p className="loading">{m.detail_loading()}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-page">
        <p className="empty-state">
          {error} <a href={url("")}>{m.resource_back_home()}</a>
        </p>
      </div>
    );
  }

  if (resource === null) {
    return (
      <div className="detail-page">
        <p className="empty-state">
          {m.detail_not_found()} <a href={url("")}>{m.resource_back_home()}</a>
        </p>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <ResourceDetailContent resource={resource as Resource} session={session} stats={stats} isFavorited={isFavorited} />
    </div>
  );
}
