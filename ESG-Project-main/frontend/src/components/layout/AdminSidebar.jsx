import { NavLink } from "react-router-dom";
import styles from "./AdminSidebar.module.css";

/**
 * admin / master 공통 사이드바
 * - routeConfig: MasterRoute.js 또는 AdminRoute.js 에서 넘긴 메뉴 배열
 */
const AdminSidebar = ({ routeConfig }) => {
  return (
    <nav className={styles.sidebar}>
      {routeConfig.map((item) => {
        if (item.label === "멤버상세") return null;

        return (
          <NavLink
            // key: React가 목록을 구분할 때 사용 (path마다 고유해야 함)
            key={item.absolutepath}
            // to: 상대 경로 사용 (App.jsx의 /masterpage/* 와 조합됨)
            // 예) "createAdmin" → 실제 URL은 /masterpage/createAdmin
            to={item.absolutepath}
            // isActive: 현재 URL과 일치하면 true → 선택된 메뉴 스타일 적용
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            {/* label: 사이드바에 보이는 한글 메뉴명 (각 항목마다 달라야 함) */}
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default AdminSidebar;
