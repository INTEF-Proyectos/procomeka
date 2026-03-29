// Chip.tsx
import "./Chip.css";

export interface ChipProps {
  label: string;
  selected?: boolean;
  removable?: boolean;
  icon?: string;
  variant?: "default" | "hero";
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function Chip({
  label,
  selected = false,
  removable = false,
  icon,
  variant = "default",
  onClick,
  onRemove,
  className = "",
}: ChipProps) {
  const isInteractive = !!onClick;
  const variantClass = variant === "hero" ? " chip-hero" : "";

  return (
    <span
      className={`chip${variantClass}${selected ? " chip-selected" : ""}${isInteractive ? " chip-interactive" : ""} ${className}`.trim()}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? selected : undefined}
      onClick={onClick}
      onKeyDown={isInteractive ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(); } } : undefined}
    >
      {icon && <span className="material-symbols-outlined chip-icon" aria-hidden="true">{icon}</span>}
      <span className="chip-label">{label}</span>
      {removable && onRemove && (
        <button
          className="chip-remove"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label={`Eliminar ${label}`}
          type="button"
        >
          <span className="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      )}
    </span>
  );
}
