import { Route, Routes, useNavigate } from "react-router-dom";
import styles from "./AdminPage.module.css";
// import AdminDashBoard from "../components/admin/AdminDashboard";
// import AdminDenounce from "../components/admin/AdminDenounce";
// import AdminInsertMenue from "../components/admin/AdminInsertMenue";
// import AdminUpdateMenue from "../components/admin/AdminUpdateMenue";
// import AdminMemberInfo from "../components/admin/AdminMemberInfo";
// import AdminReportCRUD from "../components/admin/AdminReportCRUD";
// import AdminReportStatus from "../components/admin/AdminReportStatus";
// import AdminBrand from "../components/admin/AdminBrand";
import AdminSharedLayout from "../components/layout/AdminSharedLayout";
import { AdminRouteConfig } from "../config/AdminRoute";
import { useEffect } from "react";
import useAuthStore from "../authstore/useAuthStore";
import Swal from "sweetalert2";

const AdminPage = () => {
  const { loginId } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  useEffect(() => {
    console.log(loginId);
  }, []);
  if (!loginId) {
    return (
      <div>
        <h1>권한 없음</h1>
      </div>
    );
  }
  return (
    loginId && (
      <div className={styles.admin_page_wrap}>
        {/* 담당자 : 민지원 */}
        {/* <p>AdminPage 페이지 입니다.</p>
      <p>대쉬보드 및 관리자전용 페이지입니다.</p> */}
        <button
          className={styles.admin_page_main_button}
          onClick={() => {
            navigate("/esg");
          }}
        >
          메인으로
        </button>
        <button
          className={styles.admin_page_button}
          onClick={() => {
            Swal.fire({
              icon: "question",
              text: "정말로 로그아웃하시겠습니까?",
              showCancelButton: true,
            }).then((result) => {
              if (result.isConfirmed) {
                logout();
                navigate("/");
              }
            });
          }}
        >
          logout
        </button>
        <AdminSharedLayout routeConfig={AdminRouteConfig} />
      </div>
    )
  );
};
export default AdminPage;
