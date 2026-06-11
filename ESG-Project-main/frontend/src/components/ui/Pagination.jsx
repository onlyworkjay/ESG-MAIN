import styles from "./Pagination.module.css";
const Pagination = ({ page, setPage, totalPage, naviSize }) => {
  //현재 페이지, 페이지 변환, 총페이지, 페이지네이션 길이
  const current = page + 1; // 현재 보고있는 페이지 번호 (서버에 주는 숫자 + 1)
  const halfLength = Math.floor(naviSize / 2);
  let startPage = Math.max(1, current - halfLength);
  let endPage = Math.min(totalPage, startPage + naviSize - 1);

  const pages = new Array();
  for (let i = startPage; i < endPage + 1; i++) {
    pages.push(i);
  }

  const isFirst = current === 1;
  const isLast = current === totalPage;
  return (
    <div className={styles.pagination_wrap}>
      <button
        onClick={() => {
          setPage(0);
        }}
        disabled={isFirst}
      >
        {"<<"}
      </button>
      <button
        onClick={() => {
          setPage(page - 1);
        }}
        disabled={isFirst}
      >
        {"<"}
      </button>
      {pages.map((p, i) => {
        return (
          <button
            key={"pagination-" + i}
            className={p === current ? styles.active : ""}
            onClick={() => {
              setPage(p - 1);
            }}
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
      >
        {">"}
      </button>
      <button
        onClick={() => {
          setPage(totalPage - 1);
        }}
        disabled={isLast}
      >
        {">>"}
      </button>
    </div>
  );
};

export default Pagination;
