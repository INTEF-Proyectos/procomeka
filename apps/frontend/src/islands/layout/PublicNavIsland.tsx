import { useEffect, useRef, useState } from "react";
import { getApiClient } from "../../lib/get-api-client.ts";
import { url } from "../../lib/paths.ts";
import { gravatarUrl, ROLE_LEVELS } from "../../lib/shared-utils.ts";
import "./PublicNavIsland.css";

interface NavUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

const HIGH_ROLES = new Set(["curator", "admin"]);

export function PublicNavIsland() {
  const [user, setUser] = useState<NavUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void (async () => {
      try {
        const api = await getApiClient();
        const session = await api.getSession();
        setUser(session?.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  async function handleSignOut() {
    setMenuOpen(false);
    try {
      const api = await getApiClient();
      await api.signOut();
      window.location.href = url("");
    } catch {
      window.location.href = url("");
    }
  }

  // While loading, show nothing to avoid flash
  if (loading) {
    return <div className="pnav-placeholder" />;
  }

  // Not logged in → show Acceder + Publicar
  if (!user) {
    return (
      <div className="pnav-actions">
        <a href={url("login")} className="pnav-btn-acceder">Acceder</a>
        <a href={url("login")} className="pnav-btn-publicar">Publicar</a>
      </div>
    );
  }

  // Logged in → show extra nav links + Publicar (if author+) + avatar dropdown
  const isHighRole = HIGH_ROLES.has(user.role);
  const canPublish = user.role !== "reader";
  const avatarSrc = gravatarUrl(user.email);
  const displayName = user.name || user.email.split("@")[0];

  return (
    <div className="pnav-actions">
      {/* Extra nav links visible only when authenticated */}
      <a href={url("perfil?tab=resources")} className="pnav-nav-link">Mis recursos</a>
      {isHighRole && (
        <a href={url("admin")} className="pnav-nav-link">Administrar</a>
      )}

      {canPublish && (
        <a href={url("nuevo")} className="pnav-btn-publicar">
          <span className="material-symbols-outlined pnav-btn-icon" aria-hidden="true">add_circle</span>
          Publicar
        </a>
      )}

      <div className="pnav-user" ref={menuRef}>
        <button
          className="pnav-avatar-btn"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-haspopup="true"
          aria-label={`Menú de ${displayName}`}
        >
          <img
            src={avatarSrc}
            alt=""
            className="pnav-avatar-img"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("pnav-hidden");
            }}
          />
          <span className="pnav-avatar-fallback pnav-hidden" aria-hidden="true">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </button>

        {menuOpen && (
          <div className="pnav-dropdown" role="menu" aria-label="Menú de usuario">
            <div className="pnav-dropdown-header">
              <img src={avatarSrc} alt="" className="pnav-dropdown-avatar" />
              <div className="pnav-dropdown-info">
                <span className="pnav-dropdown-name">{displayName}</span>
                <span className="pnav-dropdown-email">{user.email}</span>
              </div>
            </div>

            <div className="pnav-dropdown-divider" />

            <a href={url("perfil")} className="pnav-dropdown-item" role="menuitem">
              <span className="material-symbols-outlined" aria-hidden="true">person</span>
              Mi perfil
            </a>

            <a href={url("perfil?tab=resources")} className="pnav-dropdown-item" role="menuitem">
              <span className="material-symbols-outlined" aria-hidden="true">library_books</span>
              Mis recursos
            </a>

            <a href={url("perfil?tab=favorites")} className="pnav-dropdown-item" role="menuitem">
              <span className="material-symbols-outlined" aria-hidden="true">bookmark</span>
              Mis favoritos
            </a>

            {isHighRole && (
              <>
                <div className="pnav-dropdown-divider" />
                <a href={url("admin")} className="pnav-dropdown-item" role="menuitem">
                  <span className="material-symbols-outlined" aria-hidden="true">admin_panel_settings</span>
                  Administrar
                </a>
              </>
            )}

            <div className="pnav-dropdown-divider" />

            <button className="pnav-dropdown-item pnav-dropdown-signout" role="menuitem" onClick={handleSignOut}>
              <span className="material-symbols-outlined" aria-hidden="true">logout</span>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
