import { useEffect, useState } from "react";
import "../../lib/paraglide-client.ts";
import * as m from "../../paraglide/messages.js";
import { getApiClient } from "../../lib/get-api-client.ts";
import { url } from "../../lib/paths.ts";
import "./LoginIsland.css";

export function LoginIsland() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [oidcSubmitting, setOidcSubmitting] = useState<string | null>(null);
  const [oidcProviders, setOidcProviders] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const api = await getApiClient();
        const [session, config] = await Promise.all([
          api.getSession().catch(() => null),
          api.getConfig().catch(() => null),
        ]);

        if (session?.user) {
          window.location.href = url("perfil");
          return;
        }

        if (config?.oidcProviders) {
          setOidcProviders(config.oidcProviders);
        }
      } catch {
        // No session or config: keep form visible
      }
    })();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const api = await getApiClient();
      const result = await api.signIn(email, password);

      if (result.ok) {
        window.location.href = url("perfil");
        return;
      }

      setError(result.error ?? m.auth_bad_credentials());
    } catch {
      setError(m.auth_connection_error());
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOidc(providerId: string) {
    setError("");
    setOidcSubmitting(providerId);

    try {
      const api = await getApiClient();
      const result = await api.signInOidc(providerId);

      if (result.ok && result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }

      setError(result.error ?? m.auth_oidc_error());
    } catch {
      setError(m.auth_connection_error());
    } finally {
      setOidcSubmitting(null);
    }
  }

  const DEV_USERS = [
    { email: "admin@example.com", password: "password", role: "Admin" },
    { email: "author@example.com", password: "password", role: "Author" },
    { email: "curator@example.com", password: "password", role: "Curator" },
    { email: "reader@example.com", password: "password", role: "Reader" },
  ];

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-icon-circle">
            <span className="material-symbols-outlined" aria-hidden="true">lock</span>
          </div>
          <h1 className="login-title">{m.auth_login_title()}</h1>
          <p className="login-subtitle">{m.auth_login_subtitle()}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="login-error" role="alert">
            <span className="material-symbols-outlined" aria-hidden="true">error</span>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={(event) => void handleSubmit(event)} className="login-form">
          <div className="login-field">
            <label htmlFor="login-email">{m.auth_email_label()}</label>
            <input
              type="email"
              id="login-email"
              required
              autoComplete="email"
              placeholder={m.auth_email_placeholder()}
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              disabled={submitting || oidcSubmitting}
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">{m.auth_password_label()}</label>
            <input
              type="password"
              id="login-password"
              required
              autoComplete="current-password"
              placeholder={m.auth_password_placeholder()}
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              disabled={submitting || oidcSubmitting}
            />
          </div>

          <button type="submit" className="login-submit" disabled={submitting || !!oidcSubmitting}>
            {submitting ? m.auth_submitting() : m.auth_submit()}
          </button>
        </form>

        {/* OIDC */}
        {oidcProviders.length > 0 && (
          <>
            <div className="login-separator">
              <span>{m.auth_separator()}</span>
            </div>
            <div className="login-oidc-list">
              {oidcProviders.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="login-oidc-btn"
                  disabled={!!oidcSubmitting || submitting}
                  onClick={() => void handleOidc(p.id)}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">badge</span>
                  {oidcSubmitting === p.id ? m.auth_oidc_redirecting() : `${m.auth_oidc()} ${p.name}`}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Footer link */}
        <p className="login-footer">
          {m.auth_no_account()} <a href={url("registro")}>{m.auth_create_account()}</a>
        </p>

        {/* Dev / test credentials — clickable to auto-fill */}
        <div className="login-dev-info">
          <p className="login-dev-title">
            <span className="material-symbols-outlined" aria-hidden="true">science</span>
            {m.auth_test_accounts()}
          </p>
          <div className="login-dev-list">
            {DEV_USERS.map((u) => (
              <button
                key={u.email}
                type="button"
                className="login-dev-btn"
                onClick={() => { setEmail(u.email); setPassword(u.password); }}
              >
                <span className="login-dev-role">{u.role}</span>
                <span className="login-dev-email">{u.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
