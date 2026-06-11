import { useNavigate } from "react-router-dom";
import useAuthStore from "../authstore/useAuthStore.js";
import AdminSharedLayout from "../components/layout/AdminSharedLayout";
import { MasterRouteConfig } from "../config/MasterRoute.js";
import styles from "./MasterPage.module.css";
import Swal from "sweetalert2";
/**
 * Master 전용 페이지 (App.jsx에서 /masterpage/* 로 연결됨)
 * - 레이아웃·사이드바·라우트 목록은 AdminPage와 AdminSharedLayout 을 공유
 * - Master 만의 메뉴/화면은 MasterRoute.js 에서 관리
 */
const MasterPage = () => {
  const { loginId } = useAuthStore(); //zustand
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  if (!loginId) {
    return (
      <div>
        <h1>권한 없음</h1>
      </div>
    );
  }
  return (
    <div className={styles.master_page}>
      <button
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

      <div className={styles.master_page_body}>
        <AdminSharedLayout routeConfig={MasterRouteConfig} />
      </div>
    </div>
  );
};
export default MasterPage;
