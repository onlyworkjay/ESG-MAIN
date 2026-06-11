import { useState } from "react";
import styles from "./JoinPage.module.css";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import burgerFavicon from "../assets/esg_burger_favicon1.svg";

const JoinPage = () => {
  const navigate = useNavigate();

  // 1. 회원가입에서 작성할 입력란 상태 구현
  const [user, setUser] = useState({
    loginId: "",
    password: "",
    nickname: "",
    email: "",
  });

  // 13. 아이디 중복체크 (0: 체크 전/실패, 1: 사용 가능)
  const [checkId, setCheckId] = useState(0);

  // 14. 아이디 중복체크 메시지
  const [checkMsg, setCheckMsg] = useState("");

  //23. 비밀번호 유효성 여부 확인하는 상태 구현
  const [checkPwMsg, setCheckPwMsg] = useState("");

  // 19. 아이디 정규식 로직 짜기
  const validateId = (id) => {
    if (id.length === 0) return "";
    if (id.length < 4) return "4자 이상 입력해야 합니다.";
    if (id.length > 8) return "아이디의 길이는 8자 이하만 가능합니다.";
    if (!/^[a-zA-Z0-9]*$/.test(id)) {
      return "아이디는 영문 and 숫자만 사용가능해요.";
    }

    const englishCount = (id.match(/[a-zA-Z]/g) || []).length;
    const numberCount = (id.match(/[0-9]/g) || []).length;

    if (englishCount < 2 || numberCount < 2) {
      return "아이디는 영문 2개 이상, 숫자 2개 이상 포함해야 합니다.";
    }

    return "";
  };

  //24. 비밀번호 정규식 짜기
  const validatePw = (pw) => {
    //영문, 숫자만 포함시켜 무조건 6자리 채우게 하기

    //복합 조건 검사 로직을 위한 변수 선언
    const englishCount = (pw.match(/[a-zA-Z]/g) || []).length;
    const numberCount = (pw.match(/[0-9]/g) || []).length;

    if (pw.length === 0) return "";

    if (pw.length < 6) {
      return "비밀번호는 6자 이상 입력해야 합니다.";
    }

    if (!/^[a-zA-Z0-9]*$/.test(pw)) {
      return "비밀번호는 영문과 숫자만 사용가능합니다.";
    }

    if (englishCount < 1 || numberCount < 1) {
      return "비밀번호는 영문과 숫자를 모두 포함해야 합니다.";
    }

    return "안전한 비밀번호입니다.";
  };

  // 3. 회원가입 input 값 변경 처리 함수 (실시간 정규식 및 메시지 처리)
  const inputUser = (e) => {
    const { name, value } = e.target;

    // 아이디 실시간 입력 제한 및 검증
    if (name === "loginId") {
      // 한글 입력 방지
      const cleanedValue = value.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, "");

      // 아이디가 바뀌면 무조건 기존 중복 체크 결과는 초기화
      setCheckId(0);

      if (cleanedValue.length === 0) {
        setCheckMsg("");
        setUser({ ...user, [name]: "" });
        return;
      }

      // 특수문자 입력 방지 로직
      if (!/^[a-zA-Z0-9]*$/.test(cleanedValue)) {
        setCheckMsg("아이디는 영문과 숫자만 사용가능합니다.");
        return;
      }

      // 아이디 길이 글자수 제한
      if (cleanedValue.length > 8) {
        setCheckMsg("아이디의 길이는 8자 이하만 가능합니다.");
        return;
      }

      // 실시간 정규식 검사 실행
      const errorMessage = validateId(cleanedValue);
      setCheckMsg(errorMessage);

      //모든 조건 통과시 메세지 초기화
      setUser({ ...user, [name]: cleanedValue });
      return;
    }

    //비밀번호 정규식 로직 짜기
    if (name === "password") {
      //한글 불가
      const cleanedValue = value.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, "");

      // 특수문자 입력 방지 로직
      if (!/^[a-zA-Z0-9]*$/.test(cleanedValue)) {
        setCheckPwMsg("비밀번호는 영문과 숫자만 사용가능합니다.");
        return;
      }

      //에러 메세지 함수 설정
      const errorMessage = validatePw(cleanedValue);
      setCheckPwMsg(errorMessage);

      setUser({
        ...user,
        [name]: cleanedValue,
      });

      return;
    }

    // 일반 입력란 처리 (nickname, email)
    setUser({
      ...user,
      [name]: value,
    });
  };

  // 16. 아이디 중복 체크 함수 설정 (onBlur 시 실행)
  const ipDupCheck = () => {
    const loginId = user.loginId.trim();

    if (loginId === "") {
      setCheckId(0);
      setCheckMsg("아이디를 입력하세요");
      return;
    }

    // 형식이 안 맞으면 서버에 요청 보내지 않고 컷
    const errorMessage = validateId(loginId);
    if (errorMessage !== "") {
      setCheckId(0);
      setCheckMsg(errorMessage);
      return;
    }

    // 18. 아이디 중복체크를 백엔드로 보내기 위한 로직
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/users/check-id`, {
        params: { loginId: loginId },
      })
      .then((res) => {
        // res.data === true  -> 이미 존재하는 아이디
        // res.data === false -> 사용 가능한 아이디
        if (res.data === false) {
          setCheckId(1);
          setCheckMsg("사용가능한 아이디입니다");
        } else {
          setCheckId(0);
          setCheckMsg("사용중인 아이디입니다");
        }
      })
      .catch((err) => {
        console.log(err);
        setCheckId(0);
        setCheckMsg("아이디 중복 체크에 실패했습니다.");
      });
  };

  // 4. 회원가입에서 입력된 값을 최종 제출(submit)하는 함수
  const joinUser = async (e) => {
    e.preventDefault();

    // 10. 아이디 공백
    if (user.loginId.trim() === "") {
      Swal.fire({ title: "아이디를 입력해주세요", icon: "warning" });
      return;
    }

    // 형식 에러 메시지가 떠 있는 상태라면 진행 막기
    if (checkMsg !== "사용가능한 아이디입니다") {
      Swal.fire({ title: "아이디 양식을 다시 확인해주세요", icon: "warning" });
      return;
    }
    // 중복 체크 통과 여부 확인
    if (checkId !== 1) {
      Swal.fire({ title: "아이디 중복 체크를 완료해주세요", icon: "warning" });
      return;
    }

    // 11. 비밀번호 공백 검사
    if (user.password.trim() === "") {
      Swal.fire({ title: "비밀번호를 입력해주세요", icon: "warning" });
      return;
    }

    // 비밀번호 형식 검사
    const pwErrorMessage = validatePw(user.password);
    if (pwErrorMessage !== "안전한 비밀번호입니다.") {
      Swal.fire({
        title: "비밀번호 양식을 다시 확인해주세요",
        text: pwErrorMessage,
        icon: "warning",
      });
      return;
    }

    // 12. 닉네임 공백 검사
    if (user.nickname.trim() === "") {
      Swal.fire({ title: "닉네임을 입력해주세요", icon: "warning" });
      return;
    }

    // 9. 이메일 정규식 검사
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (user.email.trim() !== "" && !emailRegex.test(user.email)) {
      Swal.fire({
        title: "올바르지 않은 이메일 형식입니다",
        text: "이메일 주소를 다시 확인해 주시기 바랍니다",
        icon: "error",
      });
      return;
    }

    // 7. 서버로 보낼 이메일 데이터 정제 (빈 값은 null 처리)
    const payload = {
      ...user,
      email: user.email.trim() === "" ? null : user.email.trim(),
    };

    // 이메일을 입력하지 않은 경우 경고 후 선택 유도
    if (user.email.trim() === "") {
      const result = await Swal.fire({
        title: "이메일을 입력하시지 않았습니다",
        text: "나중에 아이디와 비밀번호를 찾으실 수 없습니다. 그래도 진행하시겠습니까?",
        icon: "warning",
        confirmButtonText: "회원가입 중단",
        confirmButtonColor: "green",
        showDenyButton: true,
        denyButtonText: "아니오, 그냥 가입할게요",
        denyButtonColor: "gray",
      });

      if (result.isConfirmed || !result.isDenied) {
        return;
      }
    }

    // 서버 전송 요청
    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/users/join`, payload)
      .then((res) => {
        console.log(res.data);
        Swal.fire({
          title: "회원가입 완료",
          text: "로그인 페이지로 이동합니다.",
          icon: "success",
          confirmButtonText: "로그인 페이지로 이동",
          confirmButtonColor: "green",
        });

        setUser({ loginId: "", password: "", nickname: "", email: "" });
        setCheckId(0);
        setCheckMsg("");
        setCheckPwMsg("");
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
        const errorMessage =
          err.response?.data || "회원가입 중 오류가 발생했습니다.";
        Swal.fire({
          title: "회원가입에 실패하셨습니다",
          text: errorMessage,
          icon: "warning",
        });
      });
  };

  return (
    <div className={styles.join_page_wrap}>
      <div className={styles.join_container}>
        <div className={styles.join_header}>
          <div className={styles.logo_box}>
            <img src={burgerFavicon} alt="ESG 로고" />
          </div>
          <h1 className={styles.page_title}>ESG에 오신 걸 환영해요</h1>
          <p className={styles.page_subtitle}>
            계정을 만들고 모든 기능을 사용하세요
          </p>
        </div>

        <div className={styles.join_card}>
          <form onSubmit={joinUser} className={styles.join_form}>
            {/* 아이디 입력 영역 */}
            <div className={styles.input_wrap}>
              <label htmlFor="loginId" className={styles.input_label}>
                아이디
              </label>
              <input
                type="text"
                name="loginId"
                id="loginId"
                value={user.loginId}
                onChange={inputUser}
                onBlur={ipDupCheck}
                className={styles.form_input}
                placeholder="영문, 숫자 조합 8자 이내의 아이디를 입력해주세요"
                autoComplete="username"
              />

              {/* 실시간 중복체크 및 정규식 경고 메시지 출력 레이어 */}
              {checkMsg !== "" && (
                <p className={checkId === 1 ? styles.success : styles.fail}>
                  {checkMsg}
                </p>
              )}
            </div>

            {/* 비밀번호 입력 영역 */}
            <div className={styles.input_wrap}>
              <label htmlFor="password" className={styles.input_label}>
                비밀번호
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={user.password}
                onChange={inputUser}
                className={styles.form_input}
                placeholder="비밀번호를 입력해주세요"
                autoComplete="new-password"
              />
              {/*25. 비밀번호 정규식 검사 */}
              {checkPwMsg && (
                <p
                  className={
                    checkPwMsg.includes("안전")
                      ? styles.check_msg
                      : `${styles.check_msg} ${styles.invalid}`
                  }
                >
                  {checkPwMsg}
                </p>
              )}
            </div>

            {/* 닉네임 입력 영역 */}
            <div className={styles.input_wrap}>
              <label htmlFor="nickname" className={styles.input_label}>
                닉네임
              </label>
              <input
                type="text"
                name="nickname"
                id="nickname"
                value={user.nickname}
                onChange={inputUser}
                className={styles.form_input}
                placeholder="닉네임을 입력해주세요"
                autoComplete="nickname"
              />
            </div>

            {/* 이메일 입력 영역 */}
            <div className={styles.input_wrap}>
              <label htmlFor="email" className={styles.input_label}>
                이메일
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={user.email}
                onChange={inputUser}
                className={styles.form_input}
                placeholder="이메일을 입력해주세요"
                autoComplete="email"
              />
              <p className={styles.email_info}>
                이메일은 필수가 아닌 선택사항입니다.
              </p>
            </div>

            <button className={styles.join_submit_btn} type="submit">
              회원가입
            </button>
          </form>

          <div className={styles.login_area}>
            <span>이미 계정이 있으신가요?</span>
            <button
              type="button"
              className={styles.login_link_btn}
              onClick={() => navigate("/")}
            >
              로그인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinPage;
