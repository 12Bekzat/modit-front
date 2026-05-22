function buildPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

  if (currentPage <= 3) {
    items.add(2);
    items.add(3);
    items.add(4);
  }

  if (currentPage >= totalPages - 2) {
    items.add(totalPages - 1);
    items.add(totalPages - 2);
    items.add(totalPages - 3);
  }

  const sortedPages = Array.from(items)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);

  return sortedPages.reduce((accumulator, page, index) => {
    const previousPage = sortedPages[index - 1];
    if (previousPage && page - previousPage > 1) {
      accumulator.push(`ellipsis-${previousPage}-${page}`);
    }
    accumulator.push(page);
    return accumulator;
  }, []);
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  const items = buildPaginationItems(currentPage, totalPages);

  return (
    <nav className="pagination" aria-label="Пагинация каталога">
      <button
        className="pagination-button pagination-nav"
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Назад
      </button>

      {items.map((item) =>
        typeof item === 'string' ? (
          <span key={item} className="pagination-ellipsis" aria-hidden="true">
            ...
          </span>
        ) : (
          <button
            key={item}
            className={`pagination-button ${item === currentPage ? 'is-active' : ''}`}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === currentPage ? 'page' : undefined}
          >
            {item}
          </button>
        )
      )}

      <button
        className="pagination-button pagination-nav"
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Вперед
      </button>
    </nav>
  );
}

export default Pagination;
