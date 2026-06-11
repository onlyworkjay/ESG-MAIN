import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Pagination from "../ui/Pagination";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../authstore/useAuthStore";
import styles from "./Admin.module.css";
import Profile from "../profile/Profile";

const AdminReportStatus = () => {
  const { userId } = useAuthStore();
  const [status, setStatus] = useState("pending");
  const [reportList, setReportList] = useState();
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState();
  const [totalCount, setTotalCount] = useState(0);
  const [reloadPage, setReloadPage] = useState(false);
  const navigate = useNavigate();
  const [targetId, setTargetId] = useState(null);

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/admin/getReportList?status=${status}&page=${page}`,
      )
      .then((res) => {
        console.log(res.data);
        setReportList(res.data.reportList);
        setTotalPage(res.data.totalPage);
        // API가 totalCount를 내려주면 그걸 사용, 없으면 reportList 길이로 대체
        setTotalCount(res.data.totalCount ?? res.data.reportList.length);
      })
      .catch((err) => console.log(err));
  }, [status, page, reloadPage]);

  /* ── 회원 정지 ── */
  const detention = async (targetId, reportId) => {
    const { value, isConfirmed } = await Swal.fire({
      title: "회원 정지",
      showCancelButton: true,
      confirmButtonText: "정지",
      cancelButtonText: "취소",
      html: `
        <input id="reason" class="swal2-input" placeholder="정지 사유">
        <input type="date" id="endDate" class="swal2-input">
      `,
      preConfirm: () => ({
        reason: Swal.getPopup().querySelector("#reason").value,
        endDate: Swal.getPopup().querySelector("#endDate").value,
      }),
    });
    if (isConfirmed) {
      if (!value.reason || !value.endDate) {
        Swal.fire({
          text: "정지사유 혹은 정지 날짜가 필요합니다.",
          icon: "error",
        });
        return;
      }
      axios
        .patch(`${import.meta.env.VITE_BACKSERVER}/admin/groundUser`, {
          targetUserId: targetId,
          userId,
          endDate: value.endDate,
          suspensionReason: value.reason,
          reportId,
        })
        .then((res) => {
          if (res.data === 1) {
            setReloadPage((p) => !p);
            Swal.fire({ icon: "success", text: "회원을 정지했습니다." });
          }
        })
        .catch((err) => console.log(err));
    }
  };

  /* ── 후기 숨김 ── */
  const hideGram = async (targetId, reportId) => {
    const { value: hideReason } = await Swal.fire({
      title: "후기글 숨김 사유",
      input: "text",
      inputLabel: "숨김 사유",
      showCancelButton: true,
      inputValidator: (v) => (!v ? "빈문자열은 불가합니다" : undefined),
    });
    if (hideReason) {
      axios
        .patch(`${import.meta.env.VITE_BACKSERVER}/admin/hideGram`, {
          gramId: targetId,
          reportId,
          processedBy: userId,
          adminNote: hideReason,
        })
        .then((res) => {
          if (res.data === 1) {
            setReloadPage((p) => !p);
            Swal.fire({ text: "후기가 숨김처리 되었습니다.", icon: "success" });
          }
        })
        .catch((err) => console.log(err));
    }
  };

  /* ── 게시물 숨김 ── */
  const hidePost = async (targetId, reportId) => {
    const { value: hideReason } = await Swal.fire({
      title: "게시물 숨김 사유",
      input: "text",
      inputLabel: "숨김 사유",
      showCancelButton: true,
      inputValidator: (v) => (!v ? "빈문자열은 불가합니다" : undefined),
    });
    if (hideReason) {
      axios
        .patch(`${import.meta.env.VITE_BACKSERVER}/admin/hidePost`, {
          reportId,
          processedBy: userId,
          adminNote: hideReason,
          postId: targetId,
        })
        .then((res) => {
          if (res.data === 1) {
            setReloadPage((p) => !p);
            Swal.fire({ icon: "success", text: "게시물 숨김" });
          }
        })
        .catch((err) => console.log(err));
    }
  };

  /* ── 반려 ── */
  const rejectReport = async (report) => {
    const { value: denyReason } = await Swal.fire({
      title: "반려 사유",
      input: "text",
      inputLabel: "반려 사유",
      showCancelButton: true,
      cancelButtonText: "취소",
      confirmButtonText: "확인",
      inputValidator: (v) => (!v ? "빈문자열은 불가합니다" : undefined),
    });
    if (denyReason) {
      axios
        .patch(`${import.meta.env.VITE_BACKSERVER}/admin/denyReport`, {
          reportType: report.reportType,
          reportId: report.reportId,
          processedBy: userId,
          adminNote: denyReason,
          resultType: report.resultType,
          [report.reportType === "post"
            ? "postId"
            : report.reportType === "gram"
              ? "gramId"
              : "targetUserId"]: report.targetId,
        })
        .then((res) => {
          if (res.data > 0) {
            setReloadPage((p) => !p);
            Swal.fire({ text: "요청들을 반려하였습니다.", icon: "success" });
          }
        })
        .catch((err) => console.log(err));
    }
  };

  /* ── 해결 버튼 클릭 → 타입별 분기 ── */
  const handleResolve = (report) => {
    Swal.fire({
      icon: "question",
      text:
        report.reportType === "user"
          ? "해당 회원을 정지시키겠습니까?"
          : report.reportType === "gram"
            ? "해당 후기를 숨김처리하시겠습니까?"
            : "해당 게시물을 숨김처리하시겠습니까?",
      confirmButtonText: "확인",
      showCancelButton: true,
      cancelButtonText: "취소",
    }).then((res) => {
      if (!res.isConfirmed) return;
      if (report.reportType === "user")
        detention(report.targetId, report.reportId);
      else if (report.reportType === "gram")
        hideGram(report.targetId, report.reportId);
      else if (report.reportType === "post")
        hidePost(report.targetId, report.reportId);
    });
  };

  /* ── 헬퍼 ── */
  const statusLabel = (s) =>
    s === "pending" ? "처리 대기" : s === "resolved" ? "해결 완료" : "반려";

  const typeLabel = (t) =>
    t === "user" ? "회원 신고" : t === "gram" ? "후기 신고" : "게시글 신고";

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("sv-SE") : "");

  const pendingCount =
    reportList?.filter((r) => r.status === "pending").length ?? 0;

  const filters = [
    { label: "전체", value: "" },
    { label: "처리 대기", value: "pending" },
    { label: "해결 완료", value: "resolved" },
    { label: "반려", value: "rejected" },
  ];

  return (
    reportList && (
      <div className={styles.pageMain}>
        {/* ── 타이틀 ── */}
        <div className={styles.titleSection}>
          <h2 className={styles.titleText}>신고 관리</h2>
          <p className={styles.titleSub}>
            총 {totalCount}건 · 대기 {pendingCount}건
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
              onClick={() => {
                setStatus(f.value);
                setPage(0);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── 카드 리스트 ── */}
        <div className={styles.cardList}>
          {reportList.length === 0 ? (
            <p className={styles.emptyMsg}>신고 내역이 없습니다.</p>
          ) : (
            reportList.map((report) => (
              <div
                key={report.reportId + report.reason}
                className={styles.reportCard}
              >
                {/* 카드 상단: 배지 + 액션버튼 */}
                <div className={styles.cardHeader}>
                  <div className={styles.badgeGroup}>
                    <em className={styles.statusBadge_report}>
                      {statusLabel(report.status)}
                    </em>
                    <em
                      className={styles.typeBadge_report}
                      data-result-type={report.reportType}
                    >
                      {typeLabel(report.reportType)}
                    </em>
                  </div>
                  {/* pending일 때만 버튼 노출 */}
                  {/* {report.status === "pending" && (
                    <div className={styles.actionGroup}>
                      <button
                        className={styles.resolveBtn}
                        onClick={() => handleResolve(report)}
                      >
                        해결
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => rejectReport(report)}
                      >
                        반려
                      </button>
                    </div>
                  )} */}
                  <div
                    className={styles.actionGroup}
                    style={{
                      visibility:
                        report.status === "pending" ? "visible" : "hidden",
                    }}
                  >
                    <button
                      className={styles.resolveBtn}
                      onClick={() => handleResolve(report)}
                    >
                      신고
                    </button>
                    <button
                      className={styles.rejectBtn}
                      onClick={() => rejectReport(report)}
                    >
                      반려
                    </button>
                  </div>
                </div>

                {/* 카드 제목 */}
                <p
                  onClick={() => {
                    if (report.reportType === "user") {
                      setTargetId(report.targetId); // 모달 오픈
                    } else {
                      navigate(
                        report.reportType === "post"
                          ? `/esg/post/view/${report.targetId}`
                          : `/esg/gram/view/${report.targetId}`,
                      );
                    }
                  }}
                  className={styles.cardTitle}
                >
                  {report.reportType === "user"
                    ? report.loginId
                    : report.titleName}
                </p>

                {/* 메타 정보 */}
                <p className={styles.cardMeta}>
                  <span>
                    신고자 ID:{" "}
                    {report.reportType === "user"
                      ? report.titleName
                      : report.loginId}
                  </span>
                  <span className={styles.metaDot}>·</span>
                  <span>신고이유: {report.reason}</span>
                  {report.createdAt && (
                    <>
                      <span className={styles.metaDot}>·</span>
                      <span>{formatDate(report.createdAt)}</span>
                    </>
                  )}
                </p>
              </div>
            ))
          )}
        </div>

        {/* ── 페이지네이션 ── */}
        {totalPage >= 1 && (
          <div className={styles.paginationWrapper}>
            <Pagination
              page={page}
              setPage={setPage}
              totalPage={totalPage}
              naviSize={5}
            />
          </div>
        )}
        {/* ── 프로필 모달 ── 👇 여기에 추가 */}
        {targetId && (
          <div
            className={styles.modalOverlay}
            onClick={() => setTargetId(null)}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.closeBtn}
                onClick={() => setTargetId(null)}
              >
                ✕
              </button>
              <Profile targetId={targetId} onClose={() => setTargetId(null)} />
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default AdminReportStatus;
