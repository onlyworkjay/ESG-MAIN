import {
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import AdminReportMenue from "./AdminReportMenue";
import AdminMenueList from "./AdminMenueList";
import styles from "./AdminMenue.module.css";

const AdminMenue = () => {
  const { pathname } = useLocation();

  return (
    <div>
      <h2>메뉴 관리</h2>
      <section className={styles.admin_menue_links}>
        <NavLink
          to="/adminpage/menue/list"
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          메뉴목록
        </NavLink>

        <NavLink
          to="/adminpage/menue/report"
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          메뉴제보
        </NavLink>

        <NavLink
          to="/adminpage/menue/insert"
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          메뉴등록
        </NavLink>
      </section>
      <section>
        {pathname === "/adminpage/menue" && (
          <Navigate to="/adminpage/menue/list" replace />
        )}
        <Outlet />
        {/**서브라우팅 걸린 이들이 들어가는 구멍(엔드포인트?)
         * 부모 컴포넌트 내부의 <Outlet />은 "자식 주소에 맞는 컴포넌트가 들어올 자리"를 미리 파놓는 것입니다.
         */}
      </section>
    </div>
  );
};

export default AdminMenue;
