import { useEffect, useState } from "react";
import { getApiClient } from "../../lib/get-api-client.ts";
import { url } from "../../lib/paths.ts";
import "./LoginIsland.css";

export function LoginIsland() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [oidcSubmitting, setOidcSubmitting] = useState(false);
  const [oidcEnabled, setOidcEnabled] = useState(true);

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

        if (config?.oidcEnabled === false) {
          setOidcEnabled(false);
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

      setError(result.error ?? "Credenciales incorrectas");
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOidc() {
    setError("");
    setOidcSubmitting(true);

    try {
      const api = await getApiClient();
      const result = await api.signInOidc();

      if (result.ok && result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }

      setError(result.error ?? "No se pudo iniciar el login institucional");
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setOidcSubmitting(false);
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
          <h1 className="login-title">Iniciar sesión</h1>
          <p className="login-subtitle">
            Accede a tu cuenta para gestionar recursos y participar en la comunidad.
          </p>
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
            <label htmlFor="login-email">Correo electrónico</label>
            <input
              type="email"
              id="login-email"
              required
              autoComplete="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              disabled={submitting || oidcSubmitting}
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Contraseña</label>
            <input
              type="password"
              id="login-password"
              required
              autoComplete="current-password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              disabled={submitting || oidcSubmitting}
            />
          </div>

          <button type="submit" className="login-submit" disabled={submitting || oidcSubmitting}>
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* OIDC */}
        {oidcEnabled && (
          <>
            <div className="login-separator">
              <span>o</span>
            </div>
            <button
              type="button"
              className="login-oidc-btn"
              disabled={oidcSubmitting || submitting}
              onClick={() => void handleOidc()}
            >
              <span className="material-symbols-outlined" aria-hidden="true">badge</span>
              {oidcSubmitting ? "Redirigiendo..." : "Acceder con cuenta institucional"}
            </button>
          </>
        )}

        {/* Footer link */}
        <p className="login-footer">
          ¿No tienes cuenta? <a href={url("registro")}>Crear cuenta</a>
        </p>

        {/* Dev / test credentials — clickable to auto-fill */}
        <div className="login-dev-info">
          <p className="login-dev-title">
            <span className="material-symbols-outlined" aria-hidden="true">science</span>
            Cuentas de prueba
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
