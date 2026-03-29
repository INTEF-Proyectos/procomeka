import { useState, type KeyboardEvent } from "react";
import "./StarRating.css";

export interface StarRatingProps {
  value?: number;
  max?: number;
  readOnly?: boolean;
  onChange?: (score: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({
  value = 0,
  max = 5,
  readOnly = false,
  onChange,
  size = "md",
  className = "",
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const displayValue = hovered || value;

  const handleKeyDown = (e: KeyboardEvent, star: number) => {
    if (readOnly) return;
    if (e.key === "ArrowRight" && star < max) {
      e.preventDefault();
      onChange?.(star + 1);
    } else if (e.key === "ArrowLeft" && star > 1) {
      e.preventDefault();
      onChange?.(star - 1);
    }
  };

  return (
    <div
      className={`star-rating star-rating-${size}${readOnly ? " star-rating-readonly" : ""} ${className}`.trim()}
      role={readOnly ? "img" : "radiogroup"}
      aria-label={readOnly ? `Valoración: ${value} de ${max}` : "Selecciona una valoración"}
    >
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1;
        const filled = star <= displayValue;
        const halfFilled = !filled && star - 0.5 <= displayValue;

        return (
          <span
            key={star}
            className={`star-rating-star${filled ? " star-filled" : ""}${halfFilled ? " star-half" : ""}`}
            role={readOnly ? undefined : "radio"}
            aria-checked={readOnly ? undefined : star === value}
            aria-label={readOnly ? undefined : `${star} estrella${star !== 1 ? "s" : ""}`}
            tabIndex={readOnly ? undefined : star === value || (value === 0 && star === 1) ? 0 : -1}
            onClick={readOnly ? undefined : () => onChange?.(star)}
            onMouseEnter={readOnly ? undefined : () => setHovered(star)}
            onMouseLeave={readOnly ? undefined : () => setHovered(0)}
            onKeyDown={readOnly ? undefined : (e) => handleKeyDown(e, star)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {filled ? "star" : halfFilled ? "star_half" : "star"}
            </span>
          </span>
        );
      })}
    </div>
  );
}
