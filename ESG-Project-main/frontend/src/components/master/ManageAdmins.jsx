import { useEffect, useState } from "react";
import useAuthStore from "../../authstore/useAuthStore";
import axios from "axios";
import Swal from "sweetalert2";
import styles from "./ManageAdmins.module.css";

const ManageAdmins = () => {
  const { loginId } = useAuthStore();
  const [reload, setReload] = useState(false);
  const [adminInfo, setAdminInfo] = useState([]);
  const [masterPw, setMasterPw] = useState("");
  const [masterPwSuccess, setMasterPwSuccess] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/master/selectAdmins`)
      .then((res) => {
        console.log(res.data);
        setAdminInfo([...res.data]);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [reload]);

  const detention = async (loginId) => {
    if (!masterPwSuccess) {
      Swal.fire({
        icon: "error",
        text: "비밀번호 검증을 해주세요",
      });
      return;
    }
    const { value: suspensionReason } = await Swal.fire({
      title: "정지 사유",
      input: "text",
      inputLabel: "정지 사유",
      showCancelButton: true,
      inputValidator: (value) => {
        if (value === "") {
          return "빈문자열은 불가합니다";
        }
      },
    });
    if (suspensionReason) {
      Swal.fire({
        icon: "question",
        text: "정말로 정지시키겠습니까?",
        showCancelButton: "true",
      }).then((result) => {
        if (result.isConfirmed) {
          console.log(loginId);
          axios
            .patch(
              `${import.meta.env.VITE_BACKSERVER}/master/suspend?suspensionReason=${suspensionReason}&loginId=${loginId}`,
            )
            .then((res) => {
              console.log(res.data);

              if (res.data === 1) {
                Swal.fire({
                  icon: "success",
                  text: "회원이 정지되었습니다.",
                });
              } else {
                Swal.fire({
                  icon: "error",
                  text: "문제가 발생했습니다.",
                });
              }
              setReload(!reload);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      });
    }
  };
  const freeAdmin = (loginId) => {
    if (!masterPwSuccess) {
      Swal.fire({
        icon: "error",
        text: "비밀번호 검증을 해주세요",
      });
      return;
    }
    Swal.fire({
      icon: "question",
      text: "정말로 정지를 해제하시겠습니까?",
      showCancelButton: true,
      cancelButtonText: "취소",
      confirmButtonText: "계속",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .patch(
            `${import.meta.env.VITE_BACKSERVER}/master/restoreStatus?loginId=${loginId}`,
          )
          .then((res) => {
            if (res.data === 1) {
              Swal.fire({
                icon: "success",
                text: "admin의 권리가 복권되었습니다.",
              });
            } else {
              Swal.fire({
                icon: "error",
                text: "문제가 발생했습니다",
              });
            }
            setReload(!reload);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  };
  const checkPw = () => {
    axios
      .post(
        `${import.meta.env.VITE_BACKSERVER}/master/youHadMeAtHello/${loginId}`,
        masterPw,
        {
          headers: {
            "Content-Type": "text/plain",
          },
        },
      )

      .then((res) => {
        console.log(res.data);
        setMasterPwSuccess(res.data);
        if (res.data) {
          Swal.fire({
            icon: "success",
            text: "비밀번호 확인 성공",
          });
        } else {
          Swal.fire({
            icon: "error",
            text: "비밀번호 검증 실패",
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    loginId && (
      <div className={styles.manageAdmins_wrap}>
        <h2 className={styles.manageAdmins_title}>일반 관리자 정보</h2>

        <div className={styles.manageAdmins_list}>
          <div className={styles.manageAdmins_head}>
            <span>로그인아이디</span>
            <span>별명</span>
            <span>이메일</span>
            <span>상태</span>
            <span>등록일</span>
            <span>관리</span>
          </div>

          {adminInfo.map((admin, index) => {
            return (
              <div
                className={styles.manageAdmins_row}
                key={admin.loginId + index}
              >
                <span>{admin.loginId}</span>
                <span>{admin.nickname}</span>
                <span>{admin.email ? admin.email : "미등록"}</span>
                <span>
                  {admin.status === "active"
                    ? "활성화"
                    : admin.status === "suspended"
                      ? "정지"
                      : "탈퇴"}
                </span>
                <span>{new Date(admin.createdAt).toLocaleDateString()}</span>

                <div className={styles.manageAdmins_actions}>
                  <button
                    className={styles.stop_button}
                    disabled={admin.status === "active" ? false : true}
                    onClick={() => {
                      detention(admin.loginId);
                    }}
                  >
                    정지
                  </button>
                  <button
                    className={styles.free_button}
                    disabled={admin.status === "active" ? true : false}
                    onClick={() => {
                      freeAdmin(admin.loginId);
                    }}
                  >
                    해제
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <form
          className={styles.masterPw_form}
          onSubmit={(e) => {
            e.preventDefault();
            checkPw();
          }}
        >
          <label htmlFor="masterPw">현재 비밀번호 입력</label>
          <input
            type="password"
            id="masterPw"
            value={masterPw}
            onChange={(e) => {
              setMasterPw(e.target.value);
              setMasterPwSuccess(false);
            }}
          />
          <button type="submit">암호 확인</button>
          <p className={masterPwSuccess ? styles.correct_pw : styles.wrong_pw}>
            {masterPwSuccess ? "비밀번호 검증 성공" : "비밀번호 확인 미적용"}
          </p>
        </form>
      </div>
    )
  );
};
export default ManageAdmins;
