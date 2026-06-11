import { useEffect, useState } from "react";
import styles from "./Admin.module.css";
import axios from "axios";
import Pagination from "../ui/Pagination";
import useAuthStore from "../../authstore/useAuthStore";
import Swal from "sweetalert2";

const AdminReportMenue = () => {
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState();
  const [menueReportList, setMenueReportList] = useState();
  const [reloadPage, setReloadPage] = useState(true);
  const statusLabel = (s) =>
    s === "pending" ? "제보 대기" : s === "resolved" ? "처리 완료" : "반려";

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("sv-SE") : "");

  const filters = [
    { label: "제보 대기", value: "pending" },
    { label: "처리 완료", value: "resolved" },
    { label: "반려", value: "rejected" },
  ];
  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/admin/getMenueReports?page=${page}&status=${status}`,
      )
      .then((res) => {
        console.log(res.data);
        setMenueReportList(res.data.mReportList);
        setTotalPage(res.data.totalPage);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [status, reloadPage]);
  const { loginId, userId } = useAuthStore();
  const resolveReport = async (list) => {
    // console.log(list);
    const { value: resolved } = await Swal.fire({
      title: "완료 문구",
      input: "text", //input의 타입(text,email,url등등,input이 두개 이상 필요는 이거로 불가능(사이트 참조))
      inputLabel: "완료문구를 입력하시오",
      // inputValue,
      showCancelButton: true,
      inputValidator: (value) => {
        //조건 걸기
        if (value === "" || value === null) {
          return "빈문자열은 불가합니다";
        }
        // if (!value) return "You need to write something!";
      },
    });
    if (resolved) {
      const resolve = {
        suggestionId: list.suggestionId,
        processedBy: userId,
        adminNote: resolved,
      };
      axios
        .patch(
          `${import.meta.env.VITE_BACKSERVER}/admin/menueReportResolved`,
          resolve,
        )
        .then((res) => {
          console.log(res.data);
          if (res.data === 1) {
            setReloadPage(!reloadPage);
            Swal.fire({
              icon: "success",
              text: "완료 처리했습니다.",
            });
          } else {
            Swal.fire({
              icon: "error",
              text: "뭔가 잘못되었습니다.",
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const rejectReport = async (list) => {
    // console.log(list);
    const { value: rejected } = await Swal.fire({
      title: "반려 문구",
      input: "text", //input의 타입(text,email,url등등,input이 두개 이상 필요는 이거로 불가능(사이트 참조))
      inputLabel: "반려문구를 입력하시오",
      // inputValue,
      showCancelButton: true,
      inputValidator: (value) => {
        //조건 걸기
        if (value === "" || value === null) {
          return "빈문자열은 불가합니다";
        }
        // if (!value) return "You need to write something!";
      },
    });
    if (rejected) {
      const resolve = {
        suggestionId: list.suggestionId,
        processedBy: userId,
        adminNote: rejected,
      };
      axios
        .patch(
          `${import.meta.env.VITE_BACKSERVER}/admin/menueReportRejected`,
          resolve,
        )
        .then((res) => {
          console.log(res.data);
          if (res.data === 1) {
            setReloadPage(!reloadPage);
            Swal.fire({
              icon: "success",
              text: "반려 처리했습니다.",
            });
          } else {
            Swal.fire({
              icon: "error",
              text: "뭔가 잘못되었습니다.",
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  return (
    loginId &&
    menueReportList && (
      <div className={styles.pageMain}>
        {/* ── 타이틀 ── */}
        <div className={styles.titleSection}>
          {/* <h2 className={styles.titleText}>메뉴 제보 처리</h2> */}
          <p className={styles.titleSub}>
            총 {menueReportList.length}건 &nbsp;·&nbsp; 대기{" "}
            {menueReportList.filter((l) => l.status === "pending").length}건
          </p>
        </div>

        {/* ── 필터 버튼 ── */}
        <div className={styles.filterGroup}>
          {filters.map((f) => (
            <button
              key={f.value}
              className={
                status === f.value ? styles.filterBtnActive : styles.filterBtn
              }
              onClick={() => setStatus(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── 카드 리스트 ── */}
        <div className={styles.cardList}>
          {menueReportList.length === 0 ? (
            <p className={styles.emptyMsg}>제보 내역이 없습니다.</p>
          ) : (
            menueReportList.map((list, index) => (
              <div key={list.userNote + index} className={styles.reportCard}>
                {/* 카드 상단: 상태 배지 + 처리 버튼 */}
                <div className={styles.cardHeader}>
                  <em className={styles.statusBadge}>
                    {list.status === "pending"
                      ? "처리대기"
                      : list.status === "resolved"
                        ? "처리완료"
                        : "반려"}
                  </em>
                  <button
                    className={styles.actionBtn}
                    disabled={list.status !== "pending"}
                    onClick={() => {
                      Swal.fire({
                        icon: "question",
                        text: "제보를 완료처리 하시겠습니까?",
                        showDenyButton: true,
                        denyButtonText: "반려",
                        confirmButtonText: "완료",
                        showCancelButton: true,
                        cancelButtonText: "취소",
                      }).then((result) => {
                        if (result.isConfirmed) resolveReport(list);
                        else if (result.isDenied) rejectReport(list);
                      });
                    }}
                  >
                    처리하기
                  </button>
                </div>

                {/* 메뉴명 */}
                <p className={styles.cardTitle}>{list.name}</p>

                {/* 제보 내용 */}
                {list.userNote && (
                  <p className={styles.cardNote}>{list.userNote}</p>
                )}

                {/* 메타 정보 */}
                <p className={styles.cardMeta}>
                  <span>제보자 ID: {list.loginId}</span>
                  {list.createdAt && (
                    <>
                      <span className={styles.metaDot}>·</span>
                      <span>{formatDate(list.createdAt)}</span>
                    </>
                  )}
                </p>
              </div>
            ))
          )}
        </div>

        {/* ── 페이지네이션 ── */}
        <div className={styles.paginationWrapper}>
          <Pagination
            page={page}
            setPage={setPage}
            totalPage={totalPage}
            naviSize={5}
          />
        </div>
      </div>
    )
  );
};
export default AdminReportMenue;
