import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import useAuthStore from "../../authstore/useAuthStore";
import Swal from "sweetalert2";

const AdminMemberDetail = () => {
  const [userInfo, setUserInfo] = useState();
  const { loginId, userId } = useAuthStore();
  const [changeStatus, setChangedStatus] = useState(false);
  //정지

  //정지 해제
  // const freeUser = (loginId) => {
  //   Swal.fire({
  //     icon: "question",
  //     text: "정말로 정지를 해제하시겠습니까?",
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       axios
  //         .patch(
  //           `${import.meta.env.VITE_BACKSERVER}/admin/restoreStatus?TuserId=${TuserId}`,
  //         )
  //         .then((res) => {
  //           if (res.data === 1) {
  //             setChangedStatus(!changeStatus);
  //             Swal.fire({
  //               text: "회원의 정지를 해제하였습니다.",
  //               icon: "success",
  //             });
  //           }
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //         });
  //     }
  //   });
  // };
  //회원 조회
  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/admin/getMemberDetail?userId=${TuserId}`,
      )
      .then((res) => {
        console.log(res.data);
        setUserInfo(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  const { TuserId } = useParams();
  // const [searchParams] = useSearchParams(); //배열 반환이라 []
  // const reportId = searchParams.get("reportId");
  return (
    loginId &&
    userInfo && (
      <div>
        <h1>멤버상세</h1>
        <div>
          <ul>
            <li>{userInfo.loginId}</li>
            <li>{userInfo.nickname}</li>
            <li>{userInfo.createdAt}</li>
            <li>
              {userInfo.status === "active"
                ? "활동중"
                : userInfo.status === "deleted"
                  ? "삭제처리"
                  : "정지"}
            </li>
          </ul>
          {/* {reportId && (
            <div>
              <button
                disabled={userInfo.status === "active" ? false : true}
                onClick={detention}
              >
                멤버 정지
              </button>
              <button
                disabled={userInfo.status === "suspended" ? false : true}
                onClick={freeUser}
              >
                정지 해제
              </button>
            </div>
          )} */}
        </div>
      </div>
    )
  );
};
export default AdminMemberDetail;
