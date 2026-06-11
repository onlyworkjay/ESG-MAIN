import { useEffect, useState } from "react";
import styles from "./Admin.module.css"; // ← 파일명에 맞게 조정
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 스탯 카드 데이터 정의 (dashBoard 응답 필드명에 맞게 key 수정)
const STAT_CARDS = [
  { icon: "🍔", key: "totalMenu", label: "전체 메뉴" },
  { icon: "🏪", key: "totalBrand", label: "브랜드 수" },
  { icon: "👤", key: "totalMember", label: "회원 수" },
  { icon: "📝", key: "totalReport", label: "메뉴 제보 수" },
  { icon: "⭐", key: "totalGram", label: "전체 후기 수" },
  { icon: "🔔", key: "pendingReport", label: "대기 신고" },
];

const AdminDashBoard = () => {
  const navigate = useNavigate();
  const [dashBoard, setDashBoard] = useState(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/dashboard`)
      .then((res) => {
        console.log(res.data);
        setDashBoard(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  /* 상태 배지 레이블 */
  const statusLabel = (status) =>
    status === "pending" ? "대기" : status === "resolved" ? "해결" : "반려";

  /* 날짜 포맷 */
  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("sv-SE") : ""; // YYYY-MM-DD

  return (
    dashBoard && (
      <div className={styles.dashMain}>
        {/* ── 타이틀 ── */}
        <div className={styles.titleSection}>
          <h2 className={styles.titleText}>관리자 대시보드</h2>
          {/* <p className={styles.titleSub}>서비스 전체 현황을 확인하세요</p> */}
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🍔</span>
            <p className={styles.statNumber}>{dashBoard.allMenues}</p>
            <p className={styles.statLabel}>전체 메뉴</p>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statIcon}>🏪</span>
            <p className={styles.statNumber}>{dashBoard.allBrands}</p>
            <p className={styles.statLabel}>브랜드 수</p>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statIcon}>👤</span>
            <p className={styles.statNumber}>{dashBoard.allMembers}</p>
            <p className={styles.statLabel}>회원 수</p>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statIcon}>📝</span>
            <p className={styles.statNumber}>{dashBoard.allPosts}</p>
            <p className={styles.statLabel}>전체 게시물 수</p>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statIcon}>⭐</span>
            <p className={styles.statNumber}>{dashBoard.allGrams}</p>
            <p className={styles.statLabel}>전체 후기 수</p>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statIcon}>🔔</span>
            <p className={styles.statNumber}>{dashBoard.pendingReports}</p>
            <p className={styles.statLabel}>대기 신고</p>
          </div>
        </div>

        {/* ── 최근 신고 현황 ── */}
        <div className={styles.sectionBox}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>최근 신고 현황</h2>
            <span
              className={styles.sectionLink}
              onClick={() => navigate("/adminpage/reportstatus")} // 경로에 맞게 수정
            >
              전체 보기 →
            </span>
          </div>

          <div className={styles.reportList}>
            {!dashBoard || !dashBoard.getNewReports?.length ? (
              <p className={styles.emptyMsg}>최근 신고 내역이 없습니다.</p>
            ) : (
              dashBoard.getNewReports.map((report, idx) => (
                <div key={report.reportType + idx} className={styles.reportRow}>
                  <em className={styles.badge} data-status={report.reportType}>
                    {report.reportType === "user"
                      ? "회원"
                      : report.reportType === "gram"
                        ? "후기"
                        : report.reportType === "post"
                          ? "게시글"
                          : "제보"}
                  </em>
                  <span className={styles.reportTitle}>
                    {report.titleName ? report.titleName : "메뉴제보"}
                  </span>
                  <span className={styles.reportContent}>
                    {report.suspensionReason}
                  </span>
                  <span className={styles.reportDate}>
                    {formatDate(report.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default AdminDashBoard;
