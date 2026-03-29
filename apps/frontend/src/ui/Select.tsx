import { useId, type SelectHTMLAttributes } from "react";
import "./Select.css";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label: string;
  options: SelectOption[];
  error?: string;
  size?: "sm" | "md";
}

export function Select({
  label,
  options,
  error,
  size = "md",
  id: providedId,
  className = "",
  ...rest
}: SelectProps) {
  const autoId = useId();
  const selectId = providedId || autoId;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className={`select-field select-field-${size}${error ? " select-field-error" : ""} ${className}`.trim()}>
      <label htmlFor={selectId} className="select-label">{label}</label>
      <div className="select-wrapper">
        <select
          id={selectId}
          className="select-control"
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="material-symbols-outlined select-chevron" aria-hidden="true">expand_more</span>
      </div>
      {error && <p id={errorId} className="select-error" role="alert">{error}</p>}
    </div>
  );
}
