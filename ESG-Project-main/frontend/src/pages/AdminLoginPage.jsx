import { useState } from "react";
import styles from "./AdminLoginPage.module.css";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../authstore/useAuthStore";

const AdminLoginPage = () => {
  const navigate = useNavigate();

  //(1) 사용자의 아이디와 비밀번호를 상태에 따라 값을 변화시키는 것을 표현하는 것
  const [user, setUser] = useState({
    loginId: "",
    password: "",
  });

  //(3) 값을 입력하면 새로운 값으로 등록되게 하고 그외에는 기존값을 유지하게 만드는 로직
  const inputLogin = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  //(5)입력받은 값을 통해 입력된 값을 백엔드로 보내 데이터베이스에 저장하고 요청한 내용을 다시 응답받게 하는 구조
  //-> 기존 로그인 방식은 비동기 방식. 지금 async-await로 바꾸어 동기 방식으로 전환. 관리자 페이지인만큼 절차를 모두 따랐을떄에만 통과되게 하기
  const loginUser = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKSERVER}/users/adminlogin`,
        user,
      );

      //로그인 할 때 로그인 아이디, 닉네임, 이메일, 회원등급 등을 받아오기
      useAuthStore.getState().login({
        userId: res.data.userId,
        loginId: res.data.loginId,
        nickname: res.data.nickname,
        email: res.data.email,
        role: res.data.role,
        endTime: res.data.endTime,
        profileImg: res.data.profileImg,
        token: res.data.token,
      });
      //로그인이 완료되고 나면 초기화시키기
      setUser({
        loginId: "",
        password: "",
      });

      await Swal.fire({
        title: "로그인에 성공하였습니다",
        text: "관리자 페이지로 넘어갑니다",
        icon: "success",
      });

      if (res.data.role === "master") {
        navigate("/masterpage");
      } else if (res.data.role === "admin") {
        navigate("/adminpage");
      } else {
        Swal.fire({
          title: "접근 권한이 없습니다.",
          text: "관리자 계정만 겁근할 수 있습니다.",
          icon: "warning",
        });
        navigate("/");
      }
    } catch (err) {
      const serverMessage =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || err.response?.data?.error;

      Swal.fire({
        title: "로그인에 실패하였습니다.",
        text: serverMessage || "아이디, 비밀번호 또는 권한을 확인해주세요",
        icon: "warning",
      });
    }
  };

  return (
    //(2) 로그인 폼 작성하기
    <div className={`${styles.login_page_wrap} ${styles.admin_page_wrap}`}>
      <div className={styles.login_container}>
        <div className={styles.login_header}>
          <div className={`${styles.logo_box} ${styles.admin_logo_box}`}>
            <span>A</span>
          </div>

          <h1 className={styles.page_title}>관리자 로그인</h1>
          <p
            className={`${styles.page_subtitle} ${styles.admin_page_subtitle}`}
          >
            관리자 또는 마스터 계정으로 로그인하세요
          </p>
        </div>

        <div className={`${styles.login_card} ${styles.admin_login_card}`}>
          <form onSubmit={loginUser} className={styles.login_form}>
            <div className={styles.input_wrap}>
              <label htmlFor="loginId" className={styles.input_label}>
                관리자 아이디
              </label>
              <input
                type="text"
                id="loginId"
                name="loginId"
                value={user.loginId}
                onChange={inputLogin}
                placeholder="아이디를 입력하세요"
                className={`${styles.form_input} ${styles.admin_form_input}`}
              ></input>
            </div>

            <div className={styles.input_wrap}>
              <label htmlFor="password" className={styles.input_label}>
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={user.password}
                onChange={inputLogin}
                placeholder="비밀번호를 입력하세요"
                className={`${styles.form_input} ${styles.admin_form_input}`}
              ></input>
            </div>

            <button
              type="submit"
              className={`${styles.login_btn} ${styles.admin_login_btn}`}
            >
              로그인
            </button>
            <div
              style={{
                width: "100%", // 계정 이름들이 잘리지 않도록 너비를 조금 넓혔습니다.
                height: "50px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: "0 10px",
              }}
            >
              <select
                onChange={(e) => {
                  // value에 저장된 JSON 문자열을 객체로 변환하여 변수 선언 없이 즉시 setUser에 전달합니다.
                  if (e.target.value) setUser(JSON.parse(e.target.value));
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  background: "transparent",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  outline: "none",
                  fontSize: "14px",
                }}
                defaultValue=""
              >
                <option value="" disabled hidden>
                  테스트계정 선택
                </option>

                {/* 마스터 및 관리자 */}
                <option value='{"loginId":"master", "password":"4444"}'>
                  마스터
                </option>
                <option value='{"loginId":"admin1", "password":"4444"}'>
                  관리자1
                </option>
                <option value='{"loginId":"admin2", "password":"4444"}'>
                  관리자2
                </option>
                <option value='{"loginId":"admin3", "password":"4444"}'>
                  관리자3
                </option>
              </select>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AdminLoginPage;
