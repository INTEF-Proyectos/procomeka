import { useEffect, useRef, useState } from "react";
import "../../lib/paraglide-client.ts";
import * as m from "../../paraglide/messages.js";
import { getLocale, locales, baseLocale } from "../../paraglide/runtime.js";
import { getApiClient } from "../../lib/get-api-client.ts";
import { buildHelpHref } from "../../lib/help-content.ts";
import { url } from "../../lib/paths.ts";
import { gravatarUrl, ROLE_LEVELS } from "../../lib/shared-utils.ts";
import { LOCALE_LABELS } from "../../lib/i18n.ts";
import "./PublicNavIsland.css";

interface NavUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

const HIGH_ROLES = new Set(["curator", "admin"]);

function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentLocale = getLocale();

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function switchLocale(locale: string) {
    setOpen(false);
    const path = window.location.pathname;
    const base = (window as unknown as { __BASE_URL__?: string }).__BASE_URL__ || "/";

    // Strip current locale prefix to get bare path
    let barePath = path;
    if (base !== "/" && barePath.startsWith(base)) {
      barePath = "/" + barePath.slice(base.length);
    }
    for (const loc of locales) {
      if (loc === baseLocale) continue;
      if (barePath.startsWith(`/${loc}/`)) {
        barePath = barePath.slice(loc.length + 1);
        break;
      }
      if (barePath === `/${loc}`) {
        barePath = "/";
        break;
      }
    }

    // Build new URL with target locale
    const cleanPath = barePath.replace(/^\//, "");
    const newPath = locale === baseLocale
      ? base + cleanPath
      : `${base}${locale}/${cleanPath}`;

    window.location.href = newPath + window.location.search;
  }

  return (
    <div className="pnav-lang-switcher" ref={ref}>
      <button
        className="pnav-lang-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={m.lang_switcher_label()}
      >
        <span className="material-symbols-outlined pnav-lang-icon" aria-hidden="true">language</span>
        <span className="pnav-lang-code">{currentLocale.toUpperCase()}</span>
      </button>
      {open && (
        <div className="pnav-lang-dropdown" role="menu" aria-label={m.lang_switcher_label()}>
          {locales.map((loc) => (
            <button
              key={loc}
              role="menuitem"
              className={`pnav-lang-option${loc === currentLocale ? " pnav-lang-active" : ""}`}
              lang={loc}
              onClick={() => switchLocale(loc)}
            >
              {LOCALE_LABELS[loc] ?? loc}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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

  const helpHref = url(buildHelpHref());

  // While loading, show language switcher and reserve space for auth actions
  if (loading) {
    return (
      <div className="pnav-actions">
        <LanguageSwitcher />
        <div className="pnav-placeholder" aria-hidden="true" />
      </div>
    );
  }

  // Not logged in → show Acceder + Publicar
  if (!user) {
    return (
      <div className="pnav-actions">
        <LanguageSwitcher />
        <a href={url("login")} className="pnav-btn-acceder">{m.nav_login()}</a>
        <a href={url("login")} className="pnav-btn-publicar">{m.nav_publish()}</a>
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
      <a href={url("perfil?tab=resources")} className="pnav-nav-link">{m.nav_my_resources()}</a>
      {isHighRole && (
        <a href={url("admin")} className="pnav-nav-link">{m.nav_admin()}</a>
      )}

      {canPublish && (
        <a href={url("nuevo")} className="pnav-btn-publicar">
          <span className="material-symbols-outlined pnav-btn-icon" aria-hidden="true">add_circle</span>
          {m.nav_publish()}
        </a>
      )}

      <LanguageSwitcher />

      <div className="pnav-user" ref={menuRef}>
        <button
          className="pnav-avatar-btn"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-haspopup="true"
          aria-label={m.nav_user_menu({ name: displayName })}
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
          <div className="pnav-dropdown" role="menu" aria-label={m.nav_user_menu_label()}>
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
              {m.nav_profile()}
            </a>

            <a href={url("perfil?tab=resources")} className="pnav-dropdown-item" role="menuitem">
              <span className="material-symbols-outlined" aria-hidden="true">library_books</span>
              {m.nav_my_resources()}
            </a>

            <a href={url("perfil?tab=favorites")} className="pnav-dropdown-item" role="menuitem">
              <span className="material-symbols-outlined" aria-hidden="true">bookmark</span>
              {m.nav_favorites()}
            </a>

            {isHighRole && (
              <>
                <div className="pnav-dropdown-divider" />
                <a href={url("admin")} className="pnav-dropdown-item" role="menuitem">
                  <span className="material-symbols-outlined" aria-hidden="true">admin_panel_settings</span>
                  {m.nav_admin()}
                </a>
              </>
            )}

            <div className="pnav-dropdown-divider" />

            <button className="pnav-dropdown-item pnav-dropdown-signout" role="menuitem" onClick={handleSignOut}>
              <span className="material-symbols-outlined" aria-hidden="true">logout</span>
              {m.nav_sign_out()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
