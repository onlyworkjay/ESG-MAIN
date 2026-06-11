import { Navigate, Route, Routes } from "react-router-dom";
import styles from "./AdminSharedLayout.module.css";
import AdminSidebar from "./AdminSidebar";

/**
 * AdminPage / MasterPage 가 공통으로 쓰는 레이아웃
 * - 왼쪽: 사이드바
 * - 오른쪽: 선택한 메뉴에 해당하는 컴포넌트 (Routes + Outlet 역할)
 */
const AdminSharedLayout = ({ routeConfig }) => {
  const renderRoutes = (routes) =>
    routes.map((item) => {
      // if (item.children && item.children.length > 0) {
      // ← length 체크 추가
      // const DefaultComponent = item.children[0].Component; // ← 대문자 변수로 추출
      if (item.children) {
        return (
          <Route key={item.path} path={item.path} element={<item.Component />}>
            {/* <Route index element={<DefaultComponent />} /> ← 기본 화면 */}
            {item.children.map((child) => (
              <Route
                key={child.path}
                path={child.path}
                element={<child.Component />}
              />
            ))}
          </Route>
        );
        // }
      }
      return (
        <Route key={item.path} path={item.path} element={<item.Component />} />
      );
    });
  return (
    <div className={styles.admin_wrapper}>
      {/* 사이드바 영역 */}
      <div className={styles.admin_sidebar}>
        <AdminSidebar routeConfig={routeConfig} />
      </div>

      {/* 메인 콘텐츠 영역: URL에 따라 아래 Route 중 하나가 렌더됨 */}
      <div className={styles.admin_content}>
        <Routes>
          {/* /masterpage 또는 /adminpage 만 입력했을 때 첫 메뉴로 자동 이동 */}
          <Route
            index
            element={<Navigate to={routeConfig[0].path} replace />}
          />
          {/* routeConfig 배열을 map으로 Route 생성 */}
          {/* {routeConfig.map((item) => (
            <Route
              key={item.path}
              path={item.path}
              // element: config의 Component를 <Component /> 형태로 화면에 표시
              element={<item.Component />}
            />
          ))} */}
          {renderRoutes(routeConfig)}
        </Routes>
      </div>
    </div>
  );
};

export default AdminSharedLayout;
