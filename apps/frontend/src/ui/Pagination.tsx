import "./Pagination.css";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function getVisiblePages(current: number, total: number): Array<number | "..."> {
  const pages: Array<number | "..."> = [];
  for (let page = 1; page <= total; page++) {
    if (page === 1 || page === total || (page >= current - 1 && page <= current + 1)) {
      pages.push(page);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }
  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav className={`pagination ${className}`.trim()} aria-label="Paginación">
      <button
        type="button"
        className="pagination-btn pagination-prev"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Página anterior"
      >
        <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
        <span className="pagination-btn-text">Anterior</span>
      </button>

      <div className="pagination-pages">
        {pages.map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
          ) : (
            <button
              key={page}
              type="button"
              className={`pagination-page${page === currentPage ? " pagination-page-active" : ""}`}
              onClick={() => onPageChange(page)}
              aria-label={`Página ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        className="pagination-btn pagination-next"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Página siguiente"
      >
        <span className="pagination-btn-text">Siguiente</span>
        <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
      </button>
    </nav>
  );
}
