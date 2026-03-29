import { useState } from "react";
import { FavoriteButton } from "../../ui/FavoriteButton.tsx";
import { getApiClient } from "../../lib/get-api-client.ts";
import { url } from "../../lib/paths.ts";

export interface FavoriteIslandProps {
  resourceSlug: string;
  initialFavorited?: boolean;
  initialCount?: number;
  currentUserId?: string | null;
}

export function FavoriteIsland({
  resourceSlug,
  initialFavorited = false,
  initialCount = 0,
  currentUserId,
}: FavoriteIslandProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [count, setCount] = useState(initialCount);

  async function handleToggle() {
    if (!currentUserId) {
      window.location.href = url("login");
      return;
    }
    const api = await getApiClient();
    const result = await api.toggleFavorite(resourceSlug);
    setFavorited(result.favorited);
    setCount(result.count);
    return result;
  }

  return (
    <FavoriteButton
      favorited={favorited}
      count={count}
      onToggle={handleToggle}
    />
  );
}
