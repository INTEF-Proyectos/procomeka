import { url } from "../../lib/paths.ts";
import "./FeaturedResourcesIsland.css";

const HERO_RESOURCE = {
  image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAqa9JkHhhdIsub96xo_Tk0j6GItYpA4HBi7J3F-fKAnW6R3ySc28XnxCsZ_t2z660b_ipx9zqd1x9_KHWOkMnkBY8pI1JuW9fnDwPWIE4NJoJ_HGhyuosL5j2Mex0TrKz5CPHmUZLQB2RD4GFTKWp6fH9oZ-MPNKkIcGwYiLXjSSP0mCnukqyDsZMP40t_bwoW4Y1KJrAe2qLKMktYu_RpG89igfbi-q9BaeJLTd4YRO43K7oFkl5HDwNptig1Mbop30r2zNIIg9Y",
  imageAlt: "Espacio de trabajo digital con tablet mostrando gráficos educativos",
  level: "Bachillerato",
  subject: "Matemáticas",
  title: "Visualización de Funciones en 3D para Geometría Analítica",
  description: "Un itinerario interactivo completo que utiliza Geogebra para explicar superficies regladas y volúmenes de revolución de forma intuitiva.",
  rating: 4.9,
  ratingCount: 128,
};

const SECONDARY_RESOURCE = {
  image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-kzR1lLTdeM2xf2F7rNMm-Jgcb3VnhX-oIyDmLr7l0CVjerRGviPG0f-D2OTfEDD3YHKf8gy_lP9TThE90G9JF8E-2Zm3ChyeLPCKe2wlJ3_sfjKcO7YIAUl1ngcA7wGszEnmF7TBUalxoCNAZ959WtCX0Emdn3hH0cBroy6l8jucmZDbKMS4wYHrcBX_yDdV-9UUtaNzgYnLwlHT9Wux6XjDfQeHW0n1nVcQUMFbWrGopUJoYpSLEWzOrQ2DWR-mwt-LEEZRIIk",
  imageAlt: "Aula infantil con luz natural y materiales de aprendizaje",
  level: "Primaria",
  subject: "Ciencias Naturales",
  title: "El Ciclo de la Vida en el Huerto Escolar",
  description: "Guía práctica con fichas descargables para crear un huerto sostenible en centros educativos.",
  rating: 4.7,
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
