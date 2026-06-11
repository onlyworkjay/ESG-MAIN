import { useState } from "react";
import styles from "./FindIdPage.module.css";
import { useRef, useEffect } from "react";
import EmailAuth from "../emailauth/EmailAuth";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import burgerFavicon from "../assets/esg_burger_favicon1.svg";

const FindIdPage = () => {
  const navigate = useNavigate();
  //1. 이메일 인증 여부
  const [emailVerified, setEmailVerified] = useState(false);
  //2.이메일 컴포넌트에서 값을 가져오기 위한 상태
  const [user, setUser] = useState({ email: "", nickname: "" });
  //5. 아이디 찾기 요청이 한번만 수행되도록 제어하는 ref, 중복 요청 방지용
  const isRequestedRef = useRef(false);

  //6. 자동으로 아이디 찾기 요청을 수행하는 함수
  const fetchFindId = () => {
    return axios.post(`${import.meta.env.VITE_BACKSERVER}/users/find-id`, {
      email: user.email,
      nickname: user.nickname,
    });

    //14. 앞뒤 공백 제거하는 로직
  };

  //7. 이메일 인증이 완료되면 아이디 찾기 로직을 수행하는 useEffect
  useEffect(() => {
    if (!emailVerified) {
      isRequestedRef.current = false;
      return;
    }
  }, [emailVerified]);

  //9. 이메일 인증이 완료된 상태에서 아이디 찾기 로직을 수행
  const handleFindId = () => {
    //공백처리하며 닉네임이 없을시 닉네임을 입력할 것을 요구하는 설정
    if (!user.nickname.trim()) {
      Swal.fire({
        title: "닉네임을 입력해주세요",
        icon: "warning",
      });
      return;
    }

    //이메일을 적지 않았을 때 공백처리하며 이메일을 입력하라는 설정
    if (!user.email.trim()) {
      Swal.fire({
        title: "이메일을 입력해주세요",
        icon: "warning",
      });
      return;
    }

    //인증을 완료하지 않았을 때 인증할 것을 요구하는 로직
    if (!emailVerified) {
      Swal.fire({
        title: "이메일 인증이 필요합니다.",
        text: "이메일 인증을 완료해주세요",
        icon: "warning",
      });
      return;
    }
    // fetchFindId에서 설정한 아이디 찾기가 원활히 이루어지면 이메일로 전송되는 로직
    fetchFindId()
      .then((res) => {
        console.log("아이디 찾기 성공", res.data);
        Swal.fire({
          title: "아이디 찾기 성공",
          text: "아이디가 이메일로 전송되었습니다.",
          icon: "success",
          confirmButtonText: "로그인 페이지로 이동",
        }).then(() => {
          console.log("로그인 페이지로 이동");
          navigate("/");
        });
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          title: "아이디 찾기 실패",
          text: "아이디를 찾을 수 없습니다.",
          icon: "error",
        });
      });
  };

  return (
    <div className={styles.find_id_page_wrap}>
      <div className={styles.find_id_container}>
        <div className={styles.find_id_header}>
          <div className={styles.logo_box}>
            <img src={burgerFavicon} alt="ESG 로고" />
          </div>

          <h1 className={styles.page_title}>아이디를 잊으셨나요?</h1>
          <p className={styles.page_subtitle}>
            가입하신 닉네임과 이메일 인증 후 아이디를 확인할 수 있어요
          </p>
        </div>

        <div className={styles.find_id_card}>
          <div className={styles.notice_box}>
            <strong>이메일 인증이 필요합니다</strong>
            <p>
              회원가입 시 등록한 이메일로 인증을 완료하면, 아이디 찾기를 진행할
              수 있습니다.
            </p>
          </div>

          <div className={styles.nickname_wrap}>
            <label htmlFor="nickname">닉네임</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={user.nickname}
              // --> 이게 원래 로직  onChange={(e) => setUser({ ...user, nickname: e.target.value })}

              //-> 이번에 바뀐 로직의 특징
              //-> replace이다 -> 이건 앞뒤 공백뿐 아니라 중간 공백까지 모두 제거하는 로직
              //-> 예를 들어 에스파의 귀염둥이라고 적으면 자동으로 에스파의귀염둥이로 붙어서 조회가 된다.
              //-> ...user = 현재 내가 들고 있는 user 복사
              //->...prev = React가 보장해주는 최신 user 복사
              //-> 그래서 replace를 쓰게 되면 입력할 떄 아예 중간 공백 자체가 발생하지 않음
              onChange={(e) =>
                setUser((prev) => ({
                  ...prev,
                  nickname: e.target.value.replace(/\s/g, ""),
                }))
              }
              placeholder="가입한 닉네임을 입력해주세요."
            />
          </div>

          <div className={styles.email_wrap}>
            <EmailAuth
              email={user.email}
              setEmail={(email) => setUser({ ...user, email: email })}
              onVerified={setEmailVerified}
            />
          </div>

          <button
            type="button"
            className={`${styles.find_id_btn} ${
              !emailVerified ? styles.disabled_btn : ""
            }`}
            onClick={handleFindId}
            disabled={!emailVerified}
          >
            아이디 찾기
          </button>

          <div className={styles.bottom_link_area}>
            <button
              type="button"
              className={styles.back_login_btn}
              onClick={() => navigate("/")}
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FindIdPage;
