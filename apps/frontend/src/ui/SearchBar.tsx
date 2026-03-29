import { useRef, useState, useEffect, useCallback, type FormEvent } from "react";
import "./SearchBar.css";

export interface SearchBarProps {
  value?: string;
  placeholder?: string;
  size?: "md" | "lg";
  onSearch: (query: string) => void;
  debounceMs?: number;
  autoFocus?: boolean;
  submitLabel?: string;
  className?: string;
}

export function SearchBar({
  value: controlledValue,
  placeholder = "Buscar recursos educativos...",
  size = "md",
  onSearch,
  debounceMs = 300,
  autoFocus = false,
  submitLabel = "Buscar",
  className = "",
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const handleChange = useCallback((nextValue: string) => {
    setInternalValue(nextValue);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch(nextValue), debounceMs);
  }, [onSearch, debounceMs]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearch(internalValue);
  };

  const handleClear = () => {
    setInternalValue("");
    onSearch("");
    inputRef.current?.focus();
  };

  return (
    <form
      className={`search-bar search-bar-${size} ${className}`.trim()}
      role="search"
      aria-label="Buscar recursos"
      onSubmit={handleSubmit}
    >
      <span className="material-symbols-outlined search-bar-icon" aria-hidden="true">search</span>
      <input
        ref={inputRef}
        type="search"
        className="search-bar-input"
        placeholder={placeholder}
        value={internalValue}
        onChange={(e) => handleChange(e.target.value)}
        autoFocus={autoFocus}
        aria-label="Buscar"
      />
      {internalValue && (
        <button
          type="button"
          className="search-bar-clear"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
        >
          <span className="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      )}
      {size === "lg" && (
        <button type="submit" className="search-bar-submit">
          {submitLabel}
        </button>
      )}
    </form>
  );
}
