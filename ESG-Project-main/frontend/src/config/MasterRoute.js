import CreateAdmin from "../components/master/CreateAdmin";
import CreateBrand from "../components/master/CreateBrand";
import ManageAdmins from "../components/master/ManageAdmins";

/**
 * Master 관리자 메뉴·라우트 설정
 * - path: App.jsx의 /masterpage/* 아래에서 쓰는 상대 경로
 * - label: 사이드바에 표시되는 이름 (항목마다 서로 달라야 함)
 * - Component: 해당 메뉴 클릭 시 오른쪽에 렌더할 컴포넌트
 */
export const MasterRouteConfig = [
  {
    absolutepath: "/masterpage/manageadmins",
    path: "manageadmins",
    label: "일반 관리자 정보",
    Component: ManageAdmins,
  },
  {
    absolutepath: "/masterpage/createadmin",
    path: "createadmin",
    label: "관리자 생성",
    Component: CreateAdmin,
  },
  {
    absolutepath: "/masterpage/createbrand",
    path: "createbrand",
    label: "브랜드 관리",
    Component: CreateBrand,
  },
];
