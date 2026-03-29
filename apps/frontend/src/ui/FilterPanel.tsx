import type { ReactNode } from "react";
import "./FilterPanel.css";

export interface FilterSection {
  id: string;
  label: string;
  content: ReactNode;
}

export interface FilterPanelProps {
  sections: FilterSection[];
  onClear?: () => void;
  activeCount?: number;
  className?: string;
}

export function FilterPanel({
  sections,
  onClear,
  activeCount = 0,
  className = "",
}: FilterPanelProps) {
  return (
    <aside className={`filter-panel ${className}`.trim()} aria-label="Filtros">
      <div className="filter-panel-header">
        <h2 className="filter-panel-title">
          <span className="material-symbols-outlined" aria-hidden="true">filter_list</span>
          Filtros
          {activeCount > 0 && (
            <span className="filter-panel-count" aria-label={`${activeCount} filtros activos`}>
              {activeCount}
            </span>
          )}
        </h2>
        {onClear && activeCount > 0 && (
          <button
            type="button"
            className="filter-panel-clear"
            onClick={onClear}
          >
            Limpiar
          </button>
        )}
      </div>
      <div className="filter-panel-sections">
        {sections.map((section) => (
          <fieldset key={section.id} className="filter-panel-section">
            <legend className="filter-panel-section-label">{section.label}</legend>
            {section.content}
          </fieldset>
        ))}
      </div>
    </aside>
  );
}
