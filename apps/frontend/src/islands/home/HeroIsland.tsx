import { useEffect, useRef } from "react";
import "../../lib/paraglide-client.ts";
import * as m from "../../paraglide/messages.js";
import { url } from "../../lib/paths.ts";
import "./HeroIsland.css";

const QUICK_FILTERS = [
  { key: "infantil" as const, value: "Infantil" },
  { key: "primaria" as const, value: "Primaria" },
  { key: "secundaria" as const, value: "Secundaria" },
  { key: "bachillerato" as const, value: "Bachillerato" },
  { key: "fp" as const, value: "FP" },
];

const FILTER_LABELS: Record<string, () => string> = {
  infantil: m.hero_filter_infantil,
  primaria: m.hero_filter_primaria,
  secundaria: m.hero_filter_secundaria,
  bachillerato: m.hero_filter_bachillerato,
  fp: m.hero_filter_fp,
};

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
    window.location.href = url("explorar") + (params.toString() ? `?${params}` : "");
  }

  function handleFilterClick(value: string) {
    window.location.href = url("explorar") + `?level=${encodeURIComponent(value)}`;
  }

  return (
    <section className="hero" aria-label={m.hero_search_label()}>
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-content">
        <h1 className="hero-title">
          {m.hero_title()}{" "}
          <span className="hero-title-accent">{m.hero_title_accent()}</span>
        </h1>
        <p className="hero-subtitle">{m.hero_subtitle()}</p>

        <div className="hero-search-container">
          <form ref={searchRef} className="hero-search-bar" onSubmit={handleSubmit} role="search">
            <div className="hero-search-icon">
              <span className="material-symbols-outlined" aria-hidden="true">search</span>
            </div>
            <input
              className="hero-search-input"
              type="text"
              placeholder={m.hero_search_placeholder()}
              aria-label={m.hero_search_label()}
            />
            <button className="hero-search-btn" type="submit">{m.hero_search_btn()}</button>
          </form>

          <div className="hero-filters" role="group" aria-label={m.hero_quick_filters_label()}>
            <span className="hero-filters-label">{m.hero_quick_filters()}</span>
            {QUICK_FILTERS.map((filter) => (
              <button
                key={filter.value}
                className="hero-filter-btn"
                type="button"
                onClick={() => handleFilterClick(filter.value)}
              >
                {FILTER_LABELS[filter.key]()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
