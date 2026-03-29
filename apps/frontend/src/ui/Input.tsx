// Input.tsx
import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import "./Input.css";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  error?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  leadingIcon?: string;
  trailingElement?: ReactNode;
}

export function Input({
  label,
  error,
  description,
  size = "md",
  leadingIcon,
  trailingElement,
  id: providedId,
  className = "",
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = providedId || autoId;
  const descriptionId = description ? `${inputId}-desc` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={`input-field input-field-${size}${error ? " input-field-error" : ""} ${className}`.trim()}>
      <label htmlFor={inputId} className="input-label">{label}</label>
      <div className="input-wrapper">
        {leadingIcon && (
          <span className="material-symbols-outlined input-leading-icon" aria-hidden="true">{leadingIcon}</span>
        )}
        <input
          id={inputId}
          className="input-control"
          aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
          aria-invalid={error ? true : undefined}
          {...rest}
        />
        {trailingElement && <div className="input-trailing">{trailingElement}</div>}
      </div>
      {description && !error && (
        <p id={descriptionId} className="input-description">{description}</p>
      )}
      {error && (
        <p id={errorId} className="input-error" role="alert">{error}</p>
      )}
    </div>
  );
}
