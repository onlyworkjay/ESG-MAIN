import { useState } from "react";

// CSS Module import
// styles.login_page_wrap 같은 방식으로 CSS 클래스를 사용할 수 있게 해준다.
import styles from "./AdminLoginPage.module.css";

// 서버 통신을 위한 axios
import axios from "axios";

// 로그인 성공/실패 알림창을 띄우기 위한 SweetAlert2
import Swal from "sweetalert2";

// 페이지 이동을 위한 react-router-dom의 useNavigate
import { useNavigate } from "react-router-dom";

// 로그인 정보를 전역으로 관리하는 Zustand 저장소
import useAuthStore from "../authstore/useAuthStore";

//링크 설정
import { Link } from "react-router-dom";
import burgerFavicon from "../assets/esg_burger_favicon1.svg";

const IntroPage = () => {
  // 페이지 이동 함수
  // navigate("/경로")를 실행하면 해당 경로로 이동한다.
  const navigate = useNavigate();

  // Zustand 전역 저장소에서 필요한 로그인 관련 값들을 꺼내온다.
  // token: 로그인 여부 판단에 사용
  // loginId, nickname: 로그인 성공 후 사용자 환영 문구에 사용
  // setReady: 로그인 후 사용자 정보를 다시 조회해야 할 때 준비 상태를 false로 바꾸기 위해 사용
  // logout: 로그아웃 처리 함수
  const { token, loginId, nickname, setReady } = useAuthStore();

  // token이 있으면 로그인 상태로 판단한다.
  // !!token은 token 값이 있으면 true, 없으면 false로 변환해준다.
  const isLogin = !!token;

  // 로그인 폼에서 입력하는 아이디와 비밀번호를 관리하는 state
  const [user, setUser] = useState({
    loginId: "",
    password: "",
    role: "",
  });

  // input 값이 변경될 때마다 실행되는 함수
  // name 속성에 따라 loginId 또는 password 값을 업데이트한다.
  const inputLogin = (e) => {
    const { name, value } = e.target;

    setUser({
      ...user,
      [name]: value,
    });
  };

  // 로그인 버튼을 눌렀을 때 실행되는 함수
  const loginUser = (e) => {
    // form 태그의 기본 동작인 새로고침을 막는다.
    e.preventDefault();

    //아이디를 입력하지 않으면 에러 메세지 뜨게 하기
    if (!user.loginId) {
      Swal.fire({
        title: "아이디를 입력해주세요.",
        icon: "warning",
      });
      return;
    }

    //비밀번호를 입력하지 않으면 에러 메세지 뜨게 하기
    if (!user.password) {
      Swal.fire({
        title: "비밀번호를 입력해주세요.",
        icon: "warning",
      });
      return; //리턴 누락(수정:한진호)
    }

    const loginId = user.loginId.trim();
    const adminTestAccountIds = ["master", "admin1", "admin2", "admin3"];

    if (adminTestAccountIds.includes(loginId)) {
      Swal.fire({
        title: "관리자 전용 로그인으로 이동합니다.",
        text: "관리자와 마스터 계정은 관리자 로그인 페이지에서 접속해주세요.",
        icon: "info",
      }).then(() => {
        navigate("/showmethemoney");
      });
      return;
    }

    // 백엔드 로그인 API로 현재 입력한 loginId, password를 전송한다.
    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/users/login`, user)

      // 로그인 성공 시 실행되는 영역
      .then((res) => {
        console.log(res.data);

        // 서버에서 받은 로그인 정보를 Zustand 전역 저장소에 저장한다.
        // 이 정보가 저장되면 token이 생기고, isLogin이 true가 된다.
        useAuthStore.getState().login({
          userId: res.data.userId,
          loginId: res.data.loginId,
          nickname: res.data.nickname,
          email: res.data.email,
          role: res.data.role,

          // 서버에서 endTime 또는 endtime으로 올 수 있으므로 둘 다 대응한다.
          endTime: res.data.endTime || res.data.endtime,

          // 서버에서 profileImg 또는 profile_img로 올 수 있으므로 둘 다 대응한다.
          profileImg: res.data.profileImg || res.data.profile_img,

          token: res.data.token,
          createdAt: res.data.createdAt,
        });
        console.log(useAuthStore.getState());

        // 로그인 이후 App.jsx나 Layout 쪽에서 /auth/me를 다시 호출하는 구조라면,
        // 사용자 정보 재확인을 위해 ready 상태를 false로 바꿔준다.
        setReady(false);

        // Zustand에 값이 정상적으로 저장됐는지 확인하기 위한 콘솔
        console.log("저장 직후 zustand=", useAuthStore.getState());

        // 로그인 성공 알림창
        Swal.fire({
          title: "로그인에 성공하였습니다",
          text: "메인화면으로 이동할 수 있습니다.",
          icon: "success",
        });

        //로그인 성공시 메인페이지로 입장(수정 : 한진호)
        navigate("/esg");
      })

      // 로그인 실패 시 실행되는 영역
      .catch((err) => {
        console.log(err);

        //마스터나 관리자 아이디를 입력했을 경우 일반 회원 로그인이 안되게 하기
        /*
        userController에서 설정한 로직을 가져오기 
        if (u == null) {
            return ResponseEntity.status(404).body("아이디 또는 비밀번호가 일치하지 않거나 일반 회원 로그인이 불가능한 계정입니다.");
        }
        title: err.response.data,-> 위의 로직을 가져온 거임

        */
        if (err && err.response) {
          // 에러 응답이 존재할 때만 실행되도록 안전장치 추가
          const status = err.response.status;
          const errorMsg = err.response.data;

          if (status === 401) {
            Swal.fire({
              title: "로그인 실패",
              text: errorMsg, // "아이디 또는 비밀번호가 일치하지 않거나..." 메시지 출력
              icon: "error",
            });
          } else if (status === 403) {
            Swal.fire({
              title: "접근 제한",
              text: errorMsg, // "정지된 계정은 로그인 서비스를 이용할 수 없습니다." 메시지 출력
              icon: "error",
            });
          } else {
            Swal.fire({
              title: "로그인 중 오류가 발생하였습니다.",
              text: "다시 시도해 주세요.",
              icon: "error",
            });
          }
        } else {
          // 서버 자체가 죽었거나 네트워크 연결이 끊겼을 때 처리
          Swal.fire({
            title: "서버 연결 실패",
            text: "네트워크 상태를 확인해주세요.",
            icon: "error",
          });
        }

        // 로그인 실패시 입력창을 비운다(수정 : 한진호)
        setUser({
          loginId: "",
          password: "",
        });
      });
  };

  // 로그인 성공 후 "메인화면으로 건너가기" 버튼을 눌렀을 때 실행
  const goMainPage = () => {
    navigate("/esg");
  };

  return (
    <div className={styles.login_page_wrap}>
      {/* 로그인 전체 영역을 감싸는 컨테이너 */}
      <div className={styles.login_container}>
        {/* 로그인 페이지 상단 헤더 영역 */}
        <div className={styles.login_header}>
          {/* ESG 로고 박스 */}
          <div className={styles.logo_box}>
            <img src={burgerFavicon} alt="ESG 로고" />
          </div>

          {/* 페이지 제목 */}
          <h1 className={styles.page_title}>다시 만나서 반가워요!</h1>

          {/* 페이지 부제목 */}
          <p className={styles.page_subtitle}>ESG 계정으로 로그인하세요</p>
        </div>
        {/* 조건부 렌더링 영역 */}
        {isLogin ? (
          // 로그인 성공 후 보여줄 화면
          <div className={styles.login_card}>
            <div className={styles.success_box}>
              {/* 로그인 성공 제목 */}
              <h2 className={styles.success_title}>로그인이 완료되었습니다</h2>

              {/* nickname이 있으면 nickname 표시, 없으면 loginId 표시 */}
              <p className={styles.success_text}>
                {nickname || loginId}님, 환영합니다.
              </p>

              {/* 메인 화면으로 이동하는 버튼 */}
              <button
                type="button"
                className={styles.login_btn}
                onClick={goMainPage}
              >
                메인화면으로 건너가기
              </button>
            </div>
          </div>
        ) : (
          // 로그인 전 보여줄 화면
          <div className={styles.login_card}>
            {/* 로그인 폼 */}
            <form onSubmit={loginUser} className={styles.login_form}>
              {/* 아이디 입력 영역 */}
              <div className={styles.input_wrap}>
                <label htmlFor="loginId" className={styles.input_label}>
                  아이디
                </label>

                <input
                  type="text"
                  id="loginId"
                  name="loginId"
                  value={user.loginId}
                  onChange={inputLogin}
                  className={styles.form_input}
                  placeholder="아이디를 입력하세요"
                  autoComplete="username"
                />
              </div>

              {/* 비밀번호 입력 영역 */}
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
                  className={styles.form_input}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                />
              </div>

              {/* 로그인 버튼 */}
              <button type="submit" className={styles.login_btn}>
                로그인
              </button>
            </form>

            {/* 아이디 / 비밀번호 찾기 */}
            <div className={styles.find_account_area}>
              <Link to="/users/find-id" className={styles.find_account_link}>
                아이디 찾기
              </Link>

              <span className={styles.find_account_divider}>|</span>

              <Link to="/users/find-pw" className={styles.find_account_link}>
                비밀번호 찾기
              </Link>
            </div>

            {/* 회원가입 이동 영역 */}
            <div className={styles.join_area}>
              <span>계정이 없으신가요?</span>

              {/* 회원가입 페이지로 이동하는 버튼 */}
              <button
                type="button"
                className={styles.join_btn}
                onClick={() => navigate("/users/join")}
              >
                회원가입
              </button>
            </div>
          </div>
        )}

        <div className={styles.login_actions}>
          {!isLogin && (
            <div className={styles.test_account_select_wrap}>
              <select
                onChange={(e) => {
                  // value에 저장된 JSON 문자열을 객체로 변환하여 변수 선언 없이 즉시 setUser에 전달합니다.
                  if (e.target.value) setUser(JSON.parse(e.target.value));
                }}
                className={styles.test_account_select}
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

                {/* 테스트 유저 */}
                <option value='{"loginId":"user05", "password":"4444"}'>
                  테스트유저1
                </option>
                <option value='{"loginId":"user06", "password":"4444"}'>
                  테스트유저2
                </option>
                <option value='{"loginId":"user07", "password":"4444"}'>
                  테스트유저3
                </option>
                <option value='{"loginId":"user08", "password":"4444"}'>
                  테스트유저4
                </option>
                <option value='{"loginId":"user09", "password":"4444"}'>
                  테스트유저5
                </option>
                <option value='{"loginId":"user11", "password":"4444"}'>
                  테스트유저6
                </option>
                <option value='{"loginId":"user12", "password":"4444"}'>
                  테스트유저7
                </option>
                <option value='{"loginId":"user13", "password":"4444"}'>
                  테스트유저8
                </option>
                <option value='{"loginId":"user14", "password":"4444"}'>
                  테스트유저9
                </option>
                <option value='{"loginId":"user10", "password":"4444"}'>
                  정지회원
                </option>
              </select>
            </div>
          )}
          <button
            type="button"
            className={styles.guest_entry_btn}
            onClick={() => {
              navigate("/esg");
            }}
          >
            입장
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroPage;
