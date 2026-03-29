import { useState } from "react";
import "./FavoriteButton.css";

export interface FavoriteButtonProps {
  favorited?: boolean;
  count?: number;
  onToggle?: () => Promise<{ favorited: boolean; count: number }> | void;
  disabled?: boolean;
  className?: string;
}

export function FavoriteButton({
  favorited = false,
  count = 0,
  onToggle,
  disabled = false,
  className = "",
}: FavoriteButtonProps) {
  const [optimistic, setOptimistic] = useState({ favorited, count });
  const [loading, setLoading] = useState(false);

  const displayFavorited = loading ? optimistic.favorited : favorited;
  const displayCount = loading ? optimistic.count : count;

  async function handleClick() {
    if (!onToggle || disabled) return;

    const nextFavorited = !favorited;
    const nextCount = nextFavorited ? count + 1 : Math.max(0, count - 1);
    setOptimistic({ favorited: nextFavorited, count: nextCount });
    setLoading(true);

    try {
      await onToggle();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={`favorite-btn${displayFavorited ? " favorite-btn-active" : ""} ${className}`.trim()}
      aria-pressed={displayFavorited}
      aria-label={displayFavorited ? "Quitar de favoritos" : "Guardar en favoritos"}
      disabled={disabled}
      onClick={handleClick}
    >
      <span className="material-symbols-outlined favorite-btn-icon" aria-hidden="true">
        {displayFavorited ? "bookmark" : "bookmark_border"}
      </span>
      {displayCount > 0 && <span className="favorite-btn-count">{displayCount}</span>}
    </button>
  );
}
