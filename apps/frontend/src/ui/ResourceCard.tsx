import { useEffect, useState } from "react";
import type { ResourceSummary } from "../lib/types/resource-extended.ts";
import { useIframeScale } from "../hooks/use-iframe-scale.ts";
import "./ResourceCard.css";

export interface ResourceCardProps {
  resource: ResourceSummary;
  href: string;
  overlayBadge?: string;
  overlayBadgeVariant?: "primary" | "tertiary" | "draft" | "review";
  badges?: { text: string; variant: "primary" | "tertiary" | "draft" | "review" }[];
  onToggleFavorite?: (resourceId: string) => Promise<{ favorited: boolean }> | void;
  isFavorited?: boolean;
  className?: string;
}

export function ResourceCard({
  resource,
  href,
  overlayBadge,
  overlayBadgeVariant = "primary",
  badges,
  onToggleFavorite,
  isFavorited = false,
  className = "",
}: ResourceCardProps) {
  const description = resource.description || "";
  const clipped = description.length > 140 ? `${description.slice(0, 140)}...` : description;
  const hasPreview = !!resource.elpxPreview?.previewUrl;
  const previewRef = useIframeScale<HTMLDivElement>({ iframeWidth: 1200, iframeHeight: 675 });
  const [favorited, setFavorited] = useState(isFavorited);
  const [favCount, setFavCount] = useState(resource.favoriteCount ?? 0);
  const [copied, setCopied] = useState(false);

  useEffect(() => { setFavorited(isFavorited); }, [isFavorited]);

  async function handleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !favorited;
    setFavorited(next); // optimistic
    setFavCount((prev) => prev + (next ? 1 : -1)); // optimistic
    try {
      if (onToggleFavorite) {
        const result = await onToggleFavorite(resource.id);
        if (result && typeof result.favorited === "boolean") {
          setFavorited(result.favorited);
        }
      } else {
        const { getApiClient } = await import("../lib/get-api-client.ts");
        const api = await getApiClient();
        const result = await api.toggleFavorite(resource.slug);
        setFavorited(result.favorited);
        setFavCount(result.count);
      }
    } catch {
      setFavorited(!next); // rollback
      setFavCount((prev) => prev + (next ? -1 : 1)); // rollback
    }
  }

  function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = new URL(href, window.location.origin).href;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <a href={href} className={`rc-card ${className}`.trim()}>
      <div className="rc-image">
        {hasPreview ? (
          <div className="rc-preview-wrapper" ref={previewRef}>
            <iframe
              src={resource.elpxPreview!.previewUrl}
              loading="lazy"
              tabIndex={-1}
              sandbox="allow-scripts allow-same-origin"
              title="Vista previa"
            />
          </div>
        ) : resource.thumbnailUrl ? (
          <img src={resource.thumbnailUrl} alt="" className="rc-image-img" loading="lazy" />
        ) : (
          <div className="rc-image-placeholder">
            <span className="material-symbols-outlined">description</span>
          </div>
        )}
        {(overlayBadge || (badges && badges.length > 0)) && (
          <div className="rc-image-badges">
            {overlayBadge && <span className={`rc-overlay-badge rc-overlay-badge-${overlayBadgeVariant}`}>{overlayBadge}</span>}
            {badges?.map((b) => <span key={b.text} className={`rc-overlay-badge rc-overlay-badge-${b.variant}`}>{b.text}</span>)}
          </div>
        )}
      </div>
      <div className="rc-body">
        <div className="rc-meta">
          <span className="rc-level-badge">{resource.resourceType}</span>
          {resource.language && <span className="rc-type-label">{"\u2022"} {resource.language.toUpperCase()}</span>}
        </div>
        <h3 className="rc-title">{resource.title}</h3>
        <p className="rc-desc">{clipped}</p>

        {/* Social stats row */}
        {(resource.rating || favCount > 0) ? (
          <div className="rc-stats">
            {resource.rating && resource.rating.count > 0 && (
              <span className="rc-stat">
                <span className="material-symbols-outlined rc-stat-star" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                {resource.rating.average.toFixed(1)}
                <span className="rc-stat-count">({resource.rating.count})</span>
              </span>
            )}
            {favCount > 0 && (
              <span className="rc-stat">
                <span className="material-symbols-outlined" aria-hidden="true">bookmark</span>
                {favCount}
              </span>
            )}
          </div>
        ) : null}

        <div className="rc-footer">
          <div className="rc-author">
            <div className="rc-author-avatar">
              <span className="material-symbols-outlined">person</span>
            </div>
            <span className="rc-author-name">{resource.author || "Anónimo"}</span>
          </div>
          <div className="rc-actions">
            <button
              className={`rc-action-btn${favorited ? " rc-action-btn-active" : ""}`}
              aria-label={favorited ? "Quitar de favoritos" : "Guardar en favoritos"}
              aria-pressed={favorited}
              onClick={handleFavorite}
              type="button"
            >
              <span className="material-symbols-outlined" style={favorited ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                bookmark
              </span>
            </button>
            <button
              className={`rc-action-btn${copied ? " rc-action-btn-copied" : ""}`}
              aria-label={copied ? "Enlace copiado" : "Copiar enlace"}
              onClick={handleShare}
              type="button"
            >
              <span className="material-symbols-outlined">
                {copied ? "check" : "share"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </a>
  );
}
