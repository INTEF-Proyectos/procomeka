import { useState, type FormEvent } from "react";
import "../../lib/paraglide-client.ts";
import * as m from "../../paraglide/messages.js";
import { getApiClient } from "../../lib/get-api-client.ts";
import { url } from "../../lib/paths.ts";
import "./RegisterIsland.css";

export function RegisterIsland() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    setLoading(true);
    setError("");

    try {
      const api = await getApiClient();
      const result = await api.signIn(email, password);
      if (result.ok) {
        window.location.href = result.redirectUrl || url("perfil");
      } else {
        setError(result.error || m.auth_register_error());
      }
    } catch {
      setError(m.auth_connection_error());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <span className="material-symbols-outlined register-icon" aria-hidden="true">school</span>
          <h1 className="register-title">{m.auth_register_title()}</h1>
          <p className="register-subtitle">{m.auth_register_subtitle()}</p>
        </div>

        {error && (
          <div className="register-error" role="alert">
            <span className="material-symbols-outlined" aria-hidden="true">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-field">
            <label htmlFor="reg-name">{m.auth_name_label()}</label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={m.auth_name_placeholder()}
              required
              autoComplete="name"
              disabled={loading}
            />
          </div>

          <div className="register-field">
            <label htmlFor="reg-email">{m.auth_email_label()}</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={m.auth_email_placeholder()}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="register-field">
            <label htmlFor="reg-password">{m.auth_password_label()}</label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={m.auth_password_hint()}
              required
              minLength={8}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="register-submit"
            disabled={loading || !name.trim() || !email.trim() || !password.trim()}
          >
            {loading ? m.auth_register_submitting() : m.auth_register_submit()}
          </button>
        </form>

        <p className="register-footer">
          {m.auth_has_account()} <a href={url("login")}>{m.auth_sign_in()}</a>
        </p>
      </div>
    </div>
  );
}
