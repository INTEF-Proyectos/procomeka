import { useEffect, useRef } from "react";
import "./HeroIsland.css";

const QUICK_FILTERS = [
  { label: "Infantil", value: "Infantil" },
  { label: "Primaria", value: "Primaria" },
  { label: "Secundaria", value: "Secundaria" },
  { label: "Bachillerato", value: "Bachillerato" },
  { label: "FP", value: "FP" },
];

export function HeroIsland() {
  const searchRef = useRef<HTMLFormElement>(null);

  // When the hero search bar scrolls out of view, show the compact nav search
  useEffect(() => {
    const el = searchRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        document.body.classList.toggle("nav-search-visible", !entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-64px 0px 0px 0px" }, // 64px = nav height
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      document.body.classList.remove("nav-search-visible");
    };
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector("input") as HTMLInputElement;
    const query = input?.value?.trim() || "";
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    window.location.href = `${window.__BASE_URL__ || "/"}explorar${params.toString() ? `?${params}` : ""}`;
  }

  function handleFilterClick(value: string) {
    window.location.href = `${window.__BASE_URL__ || "/"}explorar?level=${encodeURIComponent(value)}`;
  }

  return (
    <section className="hero" aria-label="Buscar recursos educativos">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-content">
        <h1 className="hero-title">
          Encuentra y comparte el mejor{" "}
          <span className="hero-title-accent">conocimiento educativo.</span>
        </h1>
        <p className="hero-subtitle">
          Accede a más de 100.000 objetos de aprendizaje, recursos y colecciones creadas por y para docentes.
        </p>

        <div className="hero-search-container">
          <form ref={searchRef} className="hero-search-bar" onSubmit={handleSubmit} role="search">
            <div className="hero-search-icon">
              <span className="material-symbols-outlined" aria-hidden="true">search</span>
            </div>
            <input
              className="hero-search-input"
              type="text"
              placeholder="¿Qué quieres enseñar hoy? Ej: Cambio climático, Ecuaciones..."
              aria-label="Buscar recursos educativos"
            />
            <button className="hero-search-btn" type="submit">Buscar</button>
          </form>

          <div className="hero-filters" role="group" aria-label="Filtros rápidos por nivel educativo">
            <span className="hero-filters-label">Filtros rápidos:</span>
            {QUICK_FILTERS.map((filter) => (
              <button
                key={filter.value}
                className="hero-filter-btn"
                type="button"
                onClick={() => handleFilterClick(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
