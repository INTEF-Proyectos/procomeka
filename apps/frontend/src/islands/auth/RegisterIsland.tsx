import { useState, type FormEvent } from "react";
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
        setError(result.error || "Error al crear la cuenta. Inténtalo de nuevo.");
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <span className="material-symbols-outlined register-icon" aria-hidden="true">school</span>
          <h1 className="register-title">Crear cuenta</h1>
          <p className="register-subtitle">
            Únete a la comunidad de recursos educativos abiertos
          </p>
        </div>

        {error && (
          <div className="register-error" role="alert">
            <span className="material-symbols-outlined" aria-hidden="true">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-field">
            <label htmlFor="reg-name">Nombre completo</label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
              autoComplete="name"
              disabled={loading}
            />
          </div>

          <div className="register-field">
            <label htmlFor="reg-email">Correo electrónico</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="register-field">
            <label htmlFor="reg-password">Contraseña</label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
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
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="register-footer">
          ¿Ya tienes cuenta? <a href={url("login")}>Inicia sesión</a>
        </p>
      </div>
    </div>
  );
}
