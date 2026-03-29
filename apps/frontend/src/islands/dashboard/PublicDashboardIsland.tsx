import { useEffect, useState } from "react";
import type { ActivityItem, DashboardSummary } from "../../lib/types/user-extended.ts";
import type { Resource } from "../../lib/api-client.ts";
import { Tabs } from "../../ui/Tabs.tsx";
import { ResourceCard } from "../../ui/ResourceCard.tsx";
import { ResourceGrid } from "../../ui/ResourceGrid.tsx";
import { Badge } from "../../ui/Badge.tsx";
import { EmptyState } from "../../ui/EmptyState.tsx";
import { Skeleton } from "../../ui/Skeleton.tsx";
import { getApiClient } from "../../lib/get-api-client.ts";
import { url } from "../../lib/paths.ts";
import { gravatarUrl } from "../../lib/shared-utils.ts";
import "./PublicDashboardIsland.css";
import "../../lib/paraglide-client.ts";
import * as m from "../../paraglide/messages.js";

function FavoritesTab({
  favorites,
  favoritesLoaded,
  favoriteCount,
  onLoad,
  onUnfavorite,
  badgeConfig,
}: {
  favorites: Resource[];
  favoritesLoaded: boolean;
  favoriteCount: number;
  onLoad: () => void;
  onUnfavorite: (slug: string) => void;
  badgeConfig: import("../../lib/api-client.ts").BadgeConfig;
}) {
  useEffect(() => {
    if (!favoritesLoaded) onLoad();
  }, [favoritesLoaded, onLoad]);

  if (!favoritesLoaded) {
    return (
      <div className="dashboard-tab-content">
        <Skeleton lines={3} />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="dashboard-tab-content">
        <EmptyState
          icon="bookmark_border"
          title={m.profile_no_favorites()}
          description={m.profile_no_favorites_desc()}
          action={<a href={url("explorar")} className="dashboard-create-btn">{m.profile_explore_resources()}</a>}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-tab-content">
      <p className="dashboard-tab-count">{m.profile_saved_count({ count: String(favoriteCount) })}</p>
      <ResourceGrid>
        {favorites.map((resource) => (
          <div key={resource.id} className="dashboard-fav-card">
            <ResourceCard
              resource={{
                id: resource.id,
                slug: resource.slug,
                title: resource.title,
                description: resource.description,
                resourceType: resource.resourceType,
                language: resource.language,
                license: resource.license,
                author: resource.author ?? null,
                thumbnailUrl: null,
                elpxPreview: (resource as Record<string, unknown>).elpxPreview as { hash: string; previewUrl: string } | null ?? null,
                rating: (resource as Record<string, unknown>).rating as { average: number; count: number } | undefined,
                favoriteCount: Number((resource as Record<string, unknown>).favoriteCount ?? 0),
                editorialStatus: resource.editorialStatus,
                createdAt: typeof resource.createdAt === "string" ? resource.createdAt : "",
              }}
              badges={computeBadges(resource as unknown as Record<string, unknown>, badgeConfig)}
              href={url(`recurso?slug=${resource.slug}`)}
              isFavorited={true}
              onToggleFavorite={() => { onUnfavorite(resource.slug); return Promise.resolve({ favorited: false }); }}
            />
          </div>
        ))}
      </ResourceGrid>
    </div>
  );
}

function RatingsTab() {
  const [rated, setRated] = useState<(Resource & { userScore?: number })[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const api = await getApiClient();
        const result = await api.getUserRatings({ limit: 50 });
        setRated(result.data);
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  if (!loaded) {
    return <div className="dashboard-tab-content"><Skeleton lines={3} /></div>;
  }

  if (rated.length === 0) {
    return (
      <div className="dashboard-tab-content">
        <EmptyState
          icon="star_border"
          title={m.profile_no_ratings()}
          description={m.profile_no_ratings_desc()}
          action={<a href={url("explorar")} className="dashboard-create-btn">{m.profile_explore_resources()}</a>}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-tab-content">
      <p className="dashboard-tab-count">{m.profile_rated_count({ count: String(rated.length) })}</p>
      <div className="dashboard-ratings-list">
        {rated.map((r) => (
          <a key={r.id} href={url(`recurso?slug=${r.slug}`)} className="dashboard-rating-item">
            <div className="dashboard-rating-info">
              <span className="dashboard-rating-title">{r.title}</span>
              <span className="dashboard-rating-type">{r.resourceType}</span>
            </div>
            <div className="dashboard-rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "18px",
                    color: star <= ((r as Record<string, unknown>).userScore as number ?? 0) ? "var(--color-tertiary)" : "var(--color-outline-variant)",
                    fontVariationSettings: star <= ((r as Record<string, unknown>).userScore as number ?? 0) ? "'FILL' 1" : "'FILL' 0",
                  }}
                >star</span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function getActivityDescription(activity: ActivityItem): string {
  const title = activity.resourceTitle || "?";
  const score = String((activity.metadata as Record<string, unknown>)?.score ?? "");
  switch (activity.type) {
    case "resource_created": return m.activity_resource_created({ title });
    case "resource_updated": return m.activity_resource_updated({ title });
    case "resource_published": return m.activity_resource_published({ title });
    case "resource_drafted": return m.activity_resource_drafted({ title });
    case "resource_status_changed": return m.activity_resource_status_changed({ title });
    case "rating_given": return m.activity_rating_given({ title, score });
    case "favorite_added": return m.activity_favorite_added({ title });
    case "favorite_removed": return m.activity_favorite_removed({ title });
    case "file_uploaded": return m.activity_file_uploaded({ title });
    case "resource_downloaded": return m.activity_resource_downloaded({ title });
    default: return activity.description;
  }
}

const ACTIVITY_ICONS: Record<string, string> = {
  resource_created: "add_circle",
  resource_updated: "edit",
  resource_published: "publish",
  resource_drafted: "draft",
  resource_status_changed: "swap_horiz",
  rating_given: "star",
  favorite_added: "bookmark",
  favorite_removed: "bookmark_border",
  file_uploaded: "upload_file",
  resource_downloaded: "download",
};

function ActivityTab() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const api = await getApiClient();
        const result = await api.getUserActivity({ limit: 30 });
        setItems(result.data);
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  if (!loaded) {
    return <div className="dashboard-tab-content"><Skeleton lines={3} /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="dashboard-tab-content">
        <EmptyState
          icon="history"
          title={m.profile_no_activity()}
          description={m.profile_no_activity_desc()}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-tab-content">
      <ul className="activity-list">
        {items.map((activity) => (
          <li key={activity.id} className="activity-item">
            <span className="material-symbols-outlined activity-icon" aria-hidden="true">
              {ACTIVITY_ICONS[activity.type] ?? "history"}
            </span>
            <div className="activity-body">
              <span className="activity-description">{getActivityDescription(activity)}</span>
              {activity.resourceTitle && activity.resourceSlug && (
                <a href={url(`recurso?slug=${activity.resourceSlug}`)} className="activity-resource">
                  {activity.resourceTitle}
                </a>
              )}
            </div>
            <time className="activity-time" dateTime={activity.createdAt}>
              {new Date(activity.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
            </time>
          </li>
        ))}
      </ul>
    </div>
  );
}

function computeBadges(resource: Record<string, unknown>, config: import("../../lib/api-client.ts").BadgeConfig): { text: string; variant: "primary" | "tertiary" }[] {
  const badges: { text: string; variant: "primary" | "tertiary" }[] = [];
  const createdAt = resource.createdAt ? new Date(resource.createdAt as string) : null;
  if (createdAt && Math.floor((Date.now() - createdAt.getTime()) / 86400000) <= config.novedadDays) {
    badges.push({ text: "Novedad", variant: "primary" });
  }
  const rating = resource.rating as { average: number; count: number } | undefined;
  const favCount = Number(resource.favoriteCount ?? 0);
  if (rating && rating.count >= config.destacadoMinRatings && rating.average >= config.destacadoMinAvg && favCount >= config.destacadoMinFavorites) {
    badges.push({ text: "Destacado", variant: "tertiary" });
  }
  return badges;
}

interface ProfileEditState {
  name: string;
  bio: string;
}

export function PublicDashboardIsland() {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Resource[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [ratingCount, setRatingCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProfileEditState>({ name: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [badgeConfig, setBadgeConfig] = useState<import("../../lib/api-client.ts").BadgeConfig>({ novedadDays: 30, destacadoMinRatings: 3, destacadoMinAvg: 4.0, destacadoMinFavorites: 3 });

  useEffect(() => {
    void (async () => {
      try {
        const api = await getApiClient();

        // Check session first
        const session = await api.getSession().catch(() => null);
        if (!session?.user) {
          window.location.href = url("login");
          return;
        }

        const { user } = session;

        // Fetch dashboard data + badge config
        const [dashData, config] = await Promise.all([
          api.getUserDashboard().catch(() => ({
            draftCount: 0,
            publishedCount: 0,
            favoriteCount: 0,
            recentResources: [],
          })),
          api.getBadgeConfig().catch(() => null),
        ]);
        if (config) setBadgeConfig(config);

        setDashboard({
          user: {
            id: user.id,
            name: user.name || user.email.split("@")[0],
            avatarUrl: null,
            bio: null,
            role: user.role,
            resourceCount: (dashData.draftCount ?? 0) + (dashData.publishedCount ?? 0),
            favoriteCount: dashData.favoriteCount ?? 0,
            joinedAt: "",
          },
          recentResources: (dashData.recentResources ?? []).map((r: Record<string, unknown>) => ({
            id: (r.id as string) || "",
            slug: (r.slug as string) || "",
            title: (r.title as string) || "",
            description: (r.description as string) || "",
            resourceType: (r.resourceType as string) || "",
            language: (r.language as string) || "",
            license: (r.license as string) || "",
            author: (r.createdByName as string) || (r.author as string) || null,
            thumbnailUrl: null,
            elpxPreview: (r.elpxPreview as { hash: string; previewUrl: string }) ?? null,
            rating: (r.rating as { average: number; count: number }) ?? undefined,
            favoriteCount: Number(r.favoriteCount ?? 0),
            editorialStatus: (r.editorialStatus as string) || "draft",
            createdAt: (r.createdAt as string) || "",
          })),
          draftCount: dashData.draftCount ?? 0,
          publishedCount: dashData.publishedCount ?? 0,
          favoriteCount: dashData.favoriteCount ?? 0,
          recentActivity: [], // loaded lazily by ActivityTab
        });
        setRatingCount((dashData as Record<string, unknown>).ratingCount as number ?? 0);
      } catch {
        // Unexpected error — redirect to login as fallback
        window.location.href = url("login");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function loadFavorites() {
    try {
      const api = await getApiClient();
      const result = await api.getUserFavorites({ limit: 50 });
      setFavorites(result.data);
    } catch {
      setFavorites([]);
    } finally {
      setFavoritesLoaded(true);
    }
  }

  async function handleUnfavorite(slug: string) {
    try {
      const api = await getApiClient();
      await api.toggleFavorite(slug);
      setFavorites((prev) => prev.filter((r) => r.slug !== slug));
      if (dashboard) {
        setDashboard({
          ...dashboard,
          favoriteCount: Math.max(0, dashboard.favoriteCount - 1),
        });
      }
    } catch {
      // ignore
    }
  }

  function startEditing() {
    if (!dashboard) return;
    setEditForm({
      name: dashboard.user.name || "",
      bio: dashboard.user.bio || "",
    });
    setEditing(true);
    setSaveMessage("");
  }

  function cancelEditing() {
    setEditing(false);
    setSaveMessage("");
  }

  async function handleSave() {
    if (!dashboard) return;
    setSaving(true);
    setSaveMessage("");

    try {
      const api = await getApiClient();
      await api.updateUser(dashboard.user.id, { name: editForm.name });

      setDashboard({
        ...dashboard,
        user: {
          ...dashboard.user,
          name: editForm.name,
          bio: editForm.bio,
        },
      });
      setEditing(false);
      setSaveMessage(m.profile_saved_ok());
      setTimeout(() => setSaveMessage(""), 3000);
    } catch {
      setSaveMessage(m.profile_save_error());
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Skeleton variant="rectangular" height="120px" />
        <Skeleton lines={4} />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <EmptyState
        icon="error"
        title={m.profile_load_error()}
        description={m.profile_load_error_desc()}
      />
    );
  }

  const { user } = dashboard;
  const avatarSrc = gravatarUrl(user.name ? `${user.id}@procomeka.es` : "default@procomeka.es");

  // Read ?tab= param from URL
  const tabParam = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("tab") : null;
  const validTabs = ["resources", "favorites", "ratings", "activity"];
  const defaultTab = tabParam && validTabs.includes(tabParam) ? tabParam : "resources";

  const tabs = [
    {
      id: "resources",
      label: m.profile_my_resources(),
      icon: "library_books",
      count: dashboard.publishedCount + dashboard.draftCount,
      content: (
        <div className="dashboard-tab-content">
          <div className="dashboard-tab-header">
            <span>{m.profile_resources_count({ count: String(dashboard.publishedCount + dashboard.draftCount) })}</span>
            <a href={url("nuevo")} className="dashboard-create-btn">
              <span className="material-symbols-outlined" aria-hidden="true">add</span>
              {m.profile_new_resource()}
            </a>
          </div>
          {dashboard.recentResources.length > 0 ? (
            <ResourceGrid>
              {dashboard.recentResources.map((resource) => (
                <div key={resource.id} className="dashboard-resource-wrap">
                  <ResourceCard
                    resource={resource}
                    href={url(`recurso?slug=${resource.slug}`)}
                    badges={computeBadges(resource as unknown as Record<string, unknown>, badgeConfig)}
                  />
                  <a href={url(`editar?id=${resource.id}`)} className="dashboard-edit-icon" aria-label={m.profile_edit_resource({ title: resource.title })}>
                    <span className="material-symbols-outlined">edit</span>
                  </a>
                </div>
              ))}
            </ResourceGrid>
          ) : (
            <EmptyState
              icon="note_add"
              title={m.profile_no_resources()}
              description={m.profile_no_resources_desc()}
              action={
                <a href={url("nuevo")} className="dashboard-create-btn">
                  {m.profile_create_resource()}
                </a>
              }
            />
          )}
        </div>
      ),
    },
    {
      id: "favorites",
      label: m.profile_favorites(),
      icon: "bookmark",
      count: dashboard.favoriteCount,
      content: <FavoritesTab
        favorites={favorites}
        favoritesLoaded={favoritesLoaded}
        favoriteCount={dashboard.favoriteCount}
        onLoad={loadFavorites}
        onUnfavorite={handleUnfavorite}
        badgeConfig={badgeConfig}
      />,
    },
    {
      id: "ratings",
      label: m.profile_ratings(),
      icon: "star",
      count: ratingCount,
      content: <RatingsTab />,
    },
    {
      id: "activity",
      label: m.profile_activity(),
      icon: "history",
      content: <ActivityTab />,
    },
  ];

  return (
    <div className="dashboard-public">
      {/* Profile header */}
      <div className="dashboard-profile">
        <div className="dashboard-profile-left">
          {/* Avatar */}
          <div className="dashboard-avatar">
            <img src={avatarSrc} alt="" className="dashboard-avatar-img" />
          </div>
          {editing && (
            <a
              href="https://gravatar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="dashboard-gravatar-link"
            >
              {m.profile_change_photo()}
            </a>
          )}
        </div>

        <div className="dashboard-profile-right">
          {!editing ? (
            /* --- View mode --- */
            <>
              <div className="dashboard-profile-header">
                <div>
                  <h1 className="dashboard-name">{user.name}</h1>
                  {user.bio ? (
                    <p className="dashboard-bio">{user.bio}</p>
                  ) : (
                    <p className="dashboard-bio dashboard-bio-empty">{m.profile_no_bio()}</p>
                  )}
                </div>
                <button className="dashboard-edit-btn" onClick={startEditing} type="button">
                  <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                  {m.profile_edit()}
                </button>
              </div>
              <div className="dashboard-badges">
                <Badge variant="primary">{user.role}</Badge>
                <span className="dashboard-stat">
                  <strong>{dashboard.publishedCount}</strong> {m.profile_published()}
                </span>
                <span className="dashboard-stat">
                  <strong>{dashboard.draftCount}</strong> {m.profile_drafts()}
                </span>
                <span className="dashboard-stat">
                  <strong>{dashboard.favoriteCount}</strong> {m.nav_favorites()}
                </span>
              </div>
              {saveMessage && (
                <div className="dashboard-save-message" role="status">
                  <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                  {saveMessage}
                </div>
              )}
            </>
          ) : (
            /* --- Edit mode --- */
            <div className="dashboard-edit-form">
              <div className="dashboard-edit-field">
                <label htmlFor="profile-name">{m.profile_name_label()}</label>
                <input
                  id="profile-name"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder={m.profile_name_placeholder()}
                  disabled={saving}
                />
              </div>
              <div className="dashboard-edit-field">
                <label htmlFor="profile-bio">{m.profile_bio_label()}</label>
                <textarea
                  id="profile-bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder={m.profile_bio_placeholder()}
                  rows={3}
                  disabled={saving}
                />
              </div>
              <div className="dashboard-edit-actions">
                <button
                  className="dashboard-edit-cancel"
                  onClick={cancelEditing}
                  type="button"
                  disabled={saving}
                >
                  {m.common_cancel()}
                </button>
                <button
                  className="dashboard-edit-save"
                  onClick={handleSave}
                  type="button"
                  disabled={saving || !editForm.name.trim()}
                >
                  {saving ? m.profile_saving() : m.profile_save_changes()}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Tabs tabs={tabs} defaultTab={defaultTab} />
    </div>
  );
}
