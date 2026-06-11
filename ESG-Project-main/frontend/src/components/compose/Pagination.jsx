const Pagination = ({ page, setPage, totalPage, naviSize }) => {
  if (totalPage === null || totalPage < 1) {
    return;
  }
  const current = page + 1;
  const isFirst = current === 1;
  const isLast = current === totalPage;
  const halfLenth = Math.floor(naviSize / 2);
  let startPage = Math.max(1, current - halfLenth);
  let endPage = Math.min(totalPage, startPage + naviSize - 1);
  const pages = new Array();
  for (let i = startPage; i < endPage + 1; i++) {
    pages.push(i);
  }
  const styles = {
    wrap: {
      display: "flex",
      gap: "8px",
      justifyContent: "center",
      margin: "20px 0",
    },
    button: (isDisabled, isActive) => ({
      padding: "6px 10px",
      cursor: isDisabled ? "not-allowed" : "pointer",
      border: `1px solid var(--bun)`,
      backgroundColor: isActive
        ? "var(--bun)"
        : isDisabled
          ? "rgba(0, 0, 0, 0.1)"
          : "var(--patty)",
      color: isActive
        ? "var(--patty)"
        : isDisabled
          ? "rgba(255, 255, 255, 0.3)"
          : "var(--ivory)",
      borderRadius: "4px",
      minWidth: "34px",
      fontWeight: isActive ? "bold" : "500",
      opacity: isDisabled ? 0.6 : 1,
    }),
  };
  return (
    <div style={styles.wrap}>
      <button
        onClick={() => {
          setPage(0);
        }}
        disabled={isFirst}
        style={styles.button(isFirst, false)}
      >
        {"<<"}
      </button>
      <button
        onClick={() => {
          setPage(page - 1);
        }}
        disabled={isFirst}
        style={styles.button(isFirst, false)}
      >
        {"<"}
      </button>
      {pages.map((p, i) => {
        const isActive = p === current;
        return (
          <button
            key={"pagination-" + i}
            onClick={() => {
              setPage(p - 1);
            }}
            style={styles.button(false, isActive)}
          >
            {p}
          </button>
        );
      })}
      <button
        onClick={() => {
          setPage(page + 1);
        }}
        disabled={isLast}
        style={styles.button(isLast, false)}
      >
        {">"}
      </button>
      <button
        onClick={() => {
          setPage(totalPage - 1);
        }}
        disabled={isLast}
        style={styles.button(isLast, false)}
      >
        {">>"}
      </button>
    </div>
  );
};

export default Pagination;
