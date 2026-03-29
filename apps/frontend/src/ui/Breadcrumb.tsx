import "./Breadcrumb.css";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav aria-label="Migas de pan" className={`breadcrumb ${className}`.trim()}>
      <ol className="breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="breadcrumb-item">
              {index > 0 && (
                <span className="material-symbols-outlined breadcrumb-sep" aria-hidden="true">chevron_right</span>
              )}
              {isLast || !item.href ? (
                <span aria-current={isLast ? "page" : undefined} className="breadcrumb-current">
                  {item.label}
                </span>
              ) : (
                <a href={item.href} className="breadcrumb-link">{item.label}</a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
