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

function FavoritesTab({
  favorites,
  favoritesLoaded,
  favoriteCount,
  onLoad,
  onUnfavorite,
}: {
  favorites: Resource[];
  favoritesLoaded: boolean;
  favoriteCount: number;
  onLoad: () => void;
  onUnfavorite: (slug: string) => void;
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
          title="Sin favoritos aún"
          description="Guarda recursos para acceder a ellos más tarde."
          action={<a href={url("explorar")} className="dashboard-create-btn">Explorar recursos</a>}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-tab-content">
      <p className="dashboard-tab-count">{favoriteCount} recursos guardados</p>
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
                editorialStatus: resource.editorialStatus,
                createdAt: typeof resource.createdAt === "string" ? resource.createdAt : "",
              }}
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
          title="Sin valoraciones aún"
          description="Valora recursos para ayudar a otros docentes a descubrir los mejores contenidos."
          action={<a href={url("explorar")} className="dashboard-create-btn">Explorar recursos</a>}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-tab-content">
      <p className="dashboard-tab-count">{rated.length} recursos valorados</p>
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
          title="Sin actividad reciente"
          description="Tu actividad en la plataforma aparecera aqui."
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
              <span className="activity-description">{activity.description}</span>
              {activity.resourceTitle && activity.resourceSlug && (
                <a href={url(`recurso?slug=${activity.resourceSlug}`)} className="activity-resource">
                  {activity.resourceTitle}
                </a>
              )}
            </div>
            <time className="activity-time" dateTime={activity.createdAt}>
              {new Date(activity.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
            </time>
          </li>
        ))}
      </ul>
    </div>
  );
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

        // Fetch dashboard data — may fail if endpoint not ready, that's ok
        const dashData = await api.getUserDashboard().catch(() => ({
          draftCount: 0,
          publishedCount: 0,
          favoriteCount: 0,
          recentResources: [],
        }));

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
      setSaveMessage("Perfil actualizado correctamente");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch {
      setSaveMessage("Error al guardar los cambios");
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
        title="Error al cargar el panel"
        description="No se pudo cargar la información del panel. Inténtalo de nuevo."
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
      label: "Mis recursos",
      icon: "library_books",
      count: dashboard.publishedCount + dashboard.draftCount,
      content: (
        <div className="dashboard-tab-content">
          <div className="dashboard-tab-header">
            <span>{dashboard.publishedCount + dashboard.draftCount} recursos</span>
            <a href={url("nuevo")} className="dashboard-create-btn">
              <span className="material-symbols-outlined" aria-hidden="true">add</span>
              Nuevo recurso
            </a>
          </div>
          {dashboard.recentResources.length > 0 ? (
            <ResourceGrid>
              {dashboard.recentResources.map((resource) => (
                <div key={resource.id} className="dashboard-resource-wrap">
                  <ResourceCard
                    resource={resource}
                    href={url(`recurso?slug=${resource.slug}`)}
                  />
                  <a href={url(`editar?id=${resource.id}`)} className="dashboard-edit-icon" aria-label={`Editar ${resource.title}`}>
                    <span className="material-symbols-outlined">edit</span>
                  </a>
                </div>
              ))}
            </ResourceGrid>
          ) : (
            <EmptyState
              icon="note_add"
              title="Aún no tienes recursos"
              description="Empieza publicando tu primer recurso educativo."
              action={
                <a href={url("nuevo")} className="dashboard-create-btn">
                  Crear recurso
                </a>
              }
            />
          )}
        </div>
      ),
    },
    {
      id: "favorites",
      label: "Favoritos",
      icon: "bookmark",
      count: dashboard.favoriteCount,
      content: <FavoritesTab
        favorites={favorites}
        favoritesLoaded={favoritesLoaded}
        favoriteCount={dashboard.favoriteCount}
        onLoad={loadFavorites}
        onUnfavorite={handleUnfavorite}
      />,
    },
    {
      id: "ratings",
      label: "Mis valoraciones",
      icon: "star",
      count: ratingCount,
      content: <RatingsTab />,
    },
    {
      id: "activity",
      label: "Actividad",
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
              Cambiar foto en Gravatar
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
                    <p className="dashboard-bio dashboard-bio-empty">Sin descripción. Pulsa editar para añadir una.</p>
                  )}
                </div>
                <button className="dashboard-edit-btn" onClick={startEditing} type="button">
                  <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                  Editar perfil
                </button>
              </div>
              <div className="dashboard-badges">
                <Badge variant="primary">{user.role}</Badge>
                <span className="dashboard-stat">
                  <strong>{dashboard.publishedCount}</strong> publicados
                </span>
                <span className="dashboard-stat">
                  <strong>{dashboard.draftCount}</strong> borradores
                </span>
                <span className="dashboard-stat">
                  <strong>{dashboard.favoriteCount}</strong> favoritos
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
                <label htmlFor="profile-name">Nombre</label>
                <input
                  id="profile-name"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Tu nombre"
                  disabled={saving}
                />
              </div>
              <div className="dashboard-edit-field">
                <label htmlFor="profile-bio">Sobre mí</label>
                <textarea
                  id="profile-bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Cuéntanos algo sobre ti: tu especialidad, intereses educativos..."
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
                  Cancelar
                </button>
                <button
                  className="dashboard-edit-save"
                  onClick={handleSave}
                  type="button"
                  disabled={saving || !editForm.name.trim()}
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
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
