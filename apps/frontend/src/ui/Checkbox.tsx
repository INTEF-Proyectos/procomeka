import { useId, type InputHTMLAttributes } from "react";
import "./Checkbox.css";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
}

export function Checkbox({
  label,
  description,
  id: providedId,
  className = "",
  ...rest
}: CheckboxProps) {
  const autoId = useId();
  const checkboxId = providedId || autoId;

  return (
    <div className={`checkbox-field ${className}`.trim()}>
      <input
        type="checkbox"
        id={checkboxId}
        className="checkbox-control"
        {...rest}
      />
      <label htmlFor={checkboxId} className="checkbox-label">
        <span className="checkbox-box" aria-hidden="true">
          <span className="material-symbols-outlined checkbox-check">check</span>
        </span>
        <span className="checkbox-text">
          {label}
          {description && <span className="checkbox-description">{description}</span>}
        </span>
      </label>
    </div>
  );
}
