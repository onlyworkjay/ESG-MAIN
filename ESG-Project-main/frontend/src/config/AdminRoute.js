// import { Component } from "react";
// import AdminBrand from "../components/admin/AdminBrand";
import AdminDashBoard from "../components/admin/AdminDashboard";
//import AdminDenounce from "../components/admin/AdminDenounce";
import AdminInsertMenue from "../components/admin/AdminInsertMenue";
import AdminUpdateMenue from "../components/admin/AdminMenue";
import AdminReportStatus from "../components/admin/AdminReportStatus";
import AdminMemberInfo from "../components/admin/AdminMemberInfo";
import AdminReportMenue from "../components/admin/AdminReportMenue";
import AdminMenueList from "../components/admin/AdminMenueList";
import AdminMenueDetail from "../components/admin/AdminMenueDetail";
import AdminMemberDetail from "../components/admin/AdminMemberDetail";

export const AdminRouteConfig = [
  {
    absolutepath: "/adminpage/dashboard",
    path: "dashboard",
    label: "대시보드",
    Component: AdminDashBoard,
  },
  // {
  //   absolutepath: "/adminpage/brand",
  //   path: "brand",
  //   label: "브랜드 수정",
  //   Component: AdminBrand,
  // },
  // {
  //   absolutepath: "/adminpage/denounce",
  //   path: "denounce",
  //   label: "제보",
  //   Component: AdminDenounce,
  // },
  // {
  //   absolutepath: "/adminpage/insertmenue",
  //   path: "insertmenue",
  //   label: "메뉴 등록",
  //   Component: AdminInsertMenue,
  // },
  {
    absolutepath: "/adminpage/menue",
    path: "menue/*",
    label: "메뉴 관리",
    Component: AdminUpdateMenue,
    children: [
      { path: "list", Component: AdminMenueList },
      { path: "list/:productId", Component: AdminMenueDetail },
      { path: "report", Component: AdminReportMenue },
      { path: "insert", Component: AdminInsertMenue },
    ],
  },
  // {
  //   absolutepath: "/adminpage/reportmenue",
  //   path: "reportmenue",
  //   label: "메뉴 신고 처리",
  //   Component: AdminReportMenue,
  // },
  {
    absolutepath: "/adminpage/reportstatus",
    path: "reportstatus",
    label: "신고 현황",
    Component: AdminReportStatus,
  },
  {
    absolutepath: "/adminpage/memberinfo",
    path: "memberinfo",
    label: "멤버 정보",
    Component: AdminMemberInfo,
  },
  {
    absolutepath: "/adminpage/memberdetail/:TuserId",
    path: "memberdetail/:TuserId",
    label: "멤버상세",
    Component: AdminMemberDetail,
  },
];
