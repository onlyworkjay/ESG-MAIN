import axios from "axios";
import "./App.css";
import "./font/font.css";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import IntroPage from "./pages/IntroPage";
import AdminPage from "./pages/AdminPage";
import MasterPage from "./pages/MasterPage";
import JoinPage from "./pages/JoinPage";
import MainHub from "./pages/MainHub";
import AdminLoginPage from "./pages/AdminLoginPage";
import PostWritePage from "./pages/PostWritePage";
import PostModifyPage from "./pages/PostModifyPage";
import MyPage from "./pages/MyPage";
import useAuthStore from "./authstore/useAuthStore";
import Swal from "sweetalert2";
import FindIdPage from "./pages/FindIdPage";
import FindPwPage from "./pages/FindPwPage";
import NotFoundPage from "./pages/NotFoundPage";
import UserChoicePage from "./pages/ChoicePage/UserChoicePage";
import NotUserChoicePage from "./pages/ChoicePage/NotUserChoicePage";
import ScrollToTop from "./components/common/ScrollToTop";
import { Toaster } from "react-hot-toast";

function App() {
  //로그인한 유저의 정보를 담는 스토어에서 토큰을 가져오는 로직
  const token = useAuthStore((state) => state.token);
  const { isReady, setReady } = useAuthStore();

  // 서버에서 일부 유저 정보를 수정했을 때, 그 정보가 새로고침 될 때마다 반영이 되도록 하는 로직
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`; //민지원이 혼자의 이해를 위해 작성 -> 토큰 Authorization 받을때 Bearer 붙어서 나감
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // 토큰이 없으면 준비 완료로 간주(비로그인 유저)
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setReady(true);
        return;
      }

      try {
        // 최신 유저 정보 가져오기
        const res = await axios.get(
          `${import.meta.env.VITE_BACKSERVER}/auth/me`,
        );
        console.log("auth/me 응답 =", res.data);
        // 상태 업데이트 : 무한 루프 방지를 위해 토큰은 서버가 새로 준 경우에만 갱신하거나 제외
        useAuthStore.setState({
          userId: res.data.userId,
          loginId: res.data.loginId,
          nickname: res.data.nickname,
          email: res.data.email,
          role: res.data.role,
          endTime: res.data.endTime || res.data.endtime, // 대소문자 교차 방어
          profileImg: res.data.profileImg || res.data.profile_img, // 스네이크 케이스 방어
          createdAt: res.data.createdAt,
        });
      } catch (err) {
        console.error("유저 정보 로드 실패", err);
        // 토큰이 유효하지 않은 경우 실패한 것이므로, 스토어를 배우거나 헤더를 날려 리셋.
        useAuthStore.getState().logout();
        delete axios.defaults.headers.common["Authorization"];
      } finally {
        // 성공하든 실패하든 데이터 처리가 끝났으므로 ready를 true로
        setReady(true);
      }
    };

    fetchMe();
  }, [token, setReady]);

  useEffect(() => {
    // 모든 axios 응답이 여기 거치고 감 / 정상적인 응답은 보내고, 403에러와 문자 조합("관리자 권한 없음")등은 거름
    const interceptor = axios.interceptors.response.use(
      // 정상 응답이면 그냥 통과
      (response) => response,
      (error) => {
        if (
          // 옵셔널 체이닝 없으면 data가 null인 상태에서 .으로 추가접근 > null에 접근 터짐(.?)-> 그래서 .?을 걸어 response미존재시 undefined로 반환
          error.response?.status === 403 &&
          error.response?.data === "관리자 권한 없음"
        ) {
          Swal.fire({
            icon: "error",
            title: "관리자 권한 없음",
            text: "관리자 권한이 존재하지 않아 요청을 받을 수 없음",
          });
        } else if (
          error.response?.status === 403 &&
          error.response?.data === "최종 관리자 권한 없음"
        ) {
          Swal.fire({
            icon: "error",
            title: "마스터 권한 미비",
            text: "마스터 권한 없음",
          });
        } else if (
          error.response?.status === 403 &&
          error.response?.data === "정지된 회원입니다."
        ) {
          Swal.fire({
            icon: "error",
            title: "정지된 회원입니다.",
            text: "정지가 풀리거든 돌아오세요",
          });
        } else if (
          error.response?.status === 403 &&
          error.response?.data === "이미 탈퇴한 회원입니다."
        ) {
          Swal.fire({
            icon: "error",
            title: "탈퇴한 회원입니다.",
            text: "탈퇴한 회원입니다.",
          });
        } else if (
          //이부분 오작동 여부 존재
          error.response?.status === 401 &&
          error.response?.data === "유효하지 않은 토큰입니다."
        ) {
          Swal.fire({
            icon: "error",
            title: "토큰이 유효하지 않습니다.",
            text: "유효한 토큰이 필요합니다.",
          });
        }
        return Promise.reject(error); // locked를 제외한 다른 오류는 각자 axios catch에 돌려줌(에러를 다음 캐치들로 넘김)
      },
    );

    // 컴포넌트 언마운트 시 인터셉터 제거 (중복 방지)(재렌더나 재마운트시 alert여러개 뜰 수 있음)컴포넌트 종료 시 정리(cleanup)
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // 데이터가 준비되지 않을 때는 껍데기만 보여주거나 로딩 처리
  if (!isReady) {
    return <div className="loding">사용자 정보를 불러오는 중입니다....</div>;
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<IntroPage />} />
        {/* ⬆️ Intro : 제일 처음 만나는 홈페이지 로그인폼과 비회원입장을 제공 */}
        <Route path="/esg/*" element={<MainHub />} />
        {/* ⬆️ 메인페이지 입니다. 메인페이지부터 페이지가 분기됩니다. */}
        <Route path="/adminpage/*" element={<AdminPage />} />
        {/* ⬆️ Admin전용페이지입니다. */}
        <Route path="/masterpage/*" element={<MasterPage />} />
        {/* ⬆️ Master전용페이지입니다. */}
        <Route path="/showmethemoney" element={<AdminLoginPage />} />
        {/* ⬆️ 관리자 로그인페이지입니다. */}

        {/*
            이곳은 푸터와 헤더가 없는 페이지들만 라우팅 하는 곳입니다
            이외 페이지들은 MainHub 페이지에 라우팅 바랍니다.          
          */}

        <Route path="/users/join" element={<JoinPage />} />
        {/* ⬆️ 회원가입폼입니다. */}
        <Route path="/esg/mypage" element={<MyPage />} />
        {/* ⬆️ 마이페이지폼입니다. */}
        <Route path="/users/find-id" element={<FindIdPage />} />
        {/* ⬆️ 아이디 찾기 페이지폼입니다. */}
        <Route path="/users/find-pw" element={<FindPwPage></FindPwPage>} />
        {/* ⬆️ 비밀번호 찾기 페이지폼입니다. */}

        <Route path="/choice/:choiceId" element={<UserChoicePage />} />
        {/* ⬆️ 선택페이지(회원)*/}
        <Route path="/choice/notuser" element={<NotUserChoicePage />} />
        {/* ⬆️ 선택페이지(비회원)*/}

        <Route path="/404" element={<NotFoundPage />} />
        {/* ⬆️ 404 에러페이지*/}
        <Route path="*" element={<NotFoundPage />} />
        {/* 라우팅이 존재하지 않는 페이지는 404 에러페이지로 처리*/}
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
