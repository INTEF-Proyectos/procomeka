import { url } from "../../lib/paths.ts";
import "./FeaturedResourcesIsland.css";

const HERO_RESOURCE = {
  image: "https://picsum.photos/seed/sistemas-ia-etica-aplicaciones-aula/800/500",
  imageAlt: "Recurso sobre inteligencia artificial y ética en el aula",
  level: "Bachillerato",
  subject: "Informática",
  title: "Sistemas de Inteligencia Artificial: Ética y Aplicaciones en el Aula",
  description: "Secuencia didáctica que explora los fundamentos éticos de la inteligencia artificial y sus aplicaciones prácticas en contextos educativos de bachillerato.",
  rating: 4.7,
  ratingCount: 5,
};

const SECONDARY_RESOURCE = {
  image: "https://picsum.photos/seed/matematicas-divertidas-algoritmos-visuales/800/500",
  imageAlt: "Matemáticas divertidas con algoritmos visuales para primaria",
  level: "Primaria",
  subject: "Matemáticas",
  title: "Matemáticas Divertidas con Algoritmos Visuales",
  description: "Colección de actividades interactivas que utilizan representaciones visuales de algoritmos para enseñar conceptos matemáticos fundamentales.",
  rating: 4.5,
};

export function FeaturedResourcesIsland() {
  return (
    <div className="featured-bento-grid">
      {/* Hero card — spans 2 columns */}
      <a href={url("explorar")} className="featured-hero-card">
        <div className="featured-hero-image">
          <img
            src={HERO_RESOURCE.image}
            alt={HERO_RESOURCE.imageAlt}
            loading="lazy"
          />
        </div>
        <div className="featured-hero-content">
          <div>
            <div className="featured-badges">
              <span className="featured-badge featured-badge-level">{HERO_RESOURCE.level}</span>
              <span className="featured-badge featured-badge-subject">{HERO_RESOURCE.subject}</span>
            </div>
            <h3 className="featured-hero-title">{HERO_RESOURCE.title}</h3>
            <p className="featured-hero-desc">{HERO_RESOURCE.description}</p>
          </div>
          <div className="featured-hero-footer">
            <div className="featured-rating">
              <span className="material-symbols-outlined featured-star" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="featured-rating-value">{HERO_RESOURCE.rating}</span>
              <span className="featured-rating-count">({HERO_RESOURCE.ratingCount} valoraciones)</span>
            </div>
            <span className="featured-download-btn" aria-label="Descargar recurso">
              <span className="material-symbols-outlined" aria-hidden="true">download</span>
            </span>
          </div>
        </div>
      </a>

      {/* Secondary card */}
      <a href={url("explorar")} className="featured-secondary-card">
        <div className="featured-secondary-image">
          <img
            src={SECONDARY_RESOURCE.image}
            alt={SECONDARY_RESOURCE.imageAlt}
            loading="lazy"
          />
        </div>
        <div className="featured-badges">
          <span className="featured-badge featured-badge-level">{SECONDARY_RESOURCE.level}</span>
          <span className="featured-badge featured-badge-subject">{SECONDARY_RESOURCE.subject}</span>
        </div>
        <h3 className="featured-secondary-title">{SECONDARY_RESOURCE.title}</h3>
        <p className="featured-secondary-desc">{SECONDARY_RESOURCE.description}</p>
        <div className="featured-secondary-footer">
          <div className="featured-rating featured-rating-sm">
            <span className="material-symbols-outlined featured-star" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="featured-rating-value">{SECONDARY_RESOURCE.rating}</span>
          </div>
          <span className="featured-link">Ver recurso</span>
        </div>
      </a>
    </div>
  );
}
