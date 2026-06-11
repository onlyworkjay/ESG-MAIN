// 포스트 페이지네이션 작성자:한진호

import styles from "./Pagination.module.css";

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

  const getButtonClassName = (isActive) => {
    return isActive
      ? `${styles.pageButton} ${styles.active}`
      : styles.pageButton;
  };

  return (
    <nav className={styles.pagination} aria-label="게시글 페이지 이동">
      <button
        onClick={() => {
          setPage(0);
        }}
        disabled={isFirst}
        className={styles.pageButton}
        aria-label="첫 페이지로 이동"
      >
        {"<<"}
      </button>
      <button
        onClick={() => {
          setPage(page - 1);
        }}
        disabled={isFirst}
        className={styles.pageButton}
        aria-label="이전 페이지로 이동"
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
            className={getButtonClassName(isActive)}
            aria-current={isActive ? "page" : undefined}
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
        className={styles.pageButton}
        aria-label="다음 페이지로 이동"
      >
        {">"}
      </button>
      <button
        onClick={() => {
          setPage(totalPage - 1);
        }}
        disabled={isLast}
        className={styles.pageButton}
        aria-label="마지막 페이지로 이동"
      >
        {">>"}
      </button>
    </nav>
  );
};

export default Pagination;
