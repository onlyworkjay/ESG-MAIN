import styles from "./MyPage.module.css";
import useAuthStore from "../authstore/useAuthStore";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import EmailAuth from "../emailauth/EmailAuth";
import defaultImg, {
  handleMenuImageError,
  resolveMenuImageUrl,
} from "../utils/menuImage";

//반드시 여기서 랜더링을 돌릴 수 있게 변수 설정
const MY_PAGE_TABS = new Set([
  "info",
  "recentChoice",
  "myPosts",
  "myReviews",
  "suggestions",
  "reports",
  "activity",
  "userFavorite",
]);

const getSafeMyPageTab = (tab) => (MY_PAGE_TABS.has(tab) ? tab : "info");

//현 마이페이지의 구조. 부모 컴포넌트를 위에서 만들고 아래는 자식 컴포넌트를 만들어
//-> 함수를 실행시키는 구조
const MyPage = () => {
  const {
    nickname,

    profileImg,

    loginId,
  } = useAuthStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  // 1. 현재 선택된 마이페이지 메뉴를 저장하는 상태값
  const [activeMenu, setActiveMenu] = useState(getSafeMyPageTab(tabParam));

  useEffect(() => {
    const nextTab = getSafeMyPageTab(tabParam);
    setActiveMenu((currentTab) =>
      currentTab === nextTab ? currentTab : nextTab,
    );
  }, [tabParam]);

  const changeActiveMenu = (tab) => {
    const nextTab = getSafeMyPageTab(tab);
    setActiveMenu(nextTab);
    setSearchParams(nextTab === "info" ? {} : { tab: nextTab });
  };

  // 2. activeMenu 값에 따라 오른쪽 메인 영역에 보여줄 화면을 결정하는 함수
  const renderContent = () => {
    console.log("현재 메뉴:", activeMenu);
    switch (activeMenu) {
      //회원정보
      case "info":
        return <MyInfo />;
      //최근 선택 메뉴
      case "recentChoice":
        return <RecentChoice />;
      /*

case "recentSearch":
  return <RecentSearch />;
*/
      //나의 게시글
      case "myPosts":
        return <MyPosts />;
      //내가 작성한 후기글
      case "myReviews":
        return <MyReviews />;
      //제보내역
      case "suggestions":
        return <MySuggestions />;
      //신고내역
      case "reports":
        return <MyReports />;
      //즐겨찾기 및 좋아요 마이페이지
      case "activity":
        return <MyActivity />;
      // 회원 즐겨찾기
      case "userFavorite":
        return <UserFavorite />;

      default:
        return <MyInfo />;
    }
  };

  return (
    // 전체 마이페이지 배경 영역
    <section className={styles.mypage_wrap}>
      {/*
        실제 콘텐츠 폭을 잡아주는 내부 박스

        이걸 추가하면 화면 전체를 다 쓰지 않고,
        메뉴 페이지처럼 가운데 정렬된 레이아웃을 만들기 쉽다.
      */}
      <div className={styles.mypage_inner}>
        {/* 왼쪽 사이드 영역 */}
        <aside className={styles.mypage_aside}>
          {/* 프로필 영역 */}
          <div className={styles.profile_box}>
            <div className={styles.profile_img_box}>
              {console.log("프로필 이미지:", profileImg)}
              <img src={profileImg} alt="profileImg" />
            </div>

            {/*프로필 밑에 소개해주는 글 닉네임, 아이디 등 */}
            <div className={styles.profile_text}>
              <p className={styles.nickname}>{nickname ? nickname : loginId}</p>
              <p className={styles.login_id}>{loginId}</p>
            </div>

            <button type="button" className={styles.home_btn}>
              <Link to="/esg">홈으로</Link>
            </button>
          </div>

          {/* 사이드 메뉴 영역 */}

          <nav className={styles.side_menu}>
            <button
              className={activeMenu === "info" ? styles.active_menu : ""}
              //소괄호를 반드시 넣어줘야 함. 그렇지 않으면 무한 랜더링이 됨
              //-> 즉 소괄호를 넣게 되면 그 의미는 버튼을 눌렀을 때에만 실행하고
              //-> 그 외에는 실행하지 않게하여 무한 랜더링을 막음
              onClick={() => changeActiveMenu("info")}
            >
              회원정보
            </button>

            <button
              //데이터가 받아오면 선택한 메뉴가 뜨게 하고 아니면 빈걸 보이게 하기
              className={
                activeMenu === "recentChoice" ? styles.active_menu : ""
              }
              onClick={() => changeActiveMenu("recentChoice")}
            >
              최근 선택 메뉴
            </button>

            <button
              className={activeMenu === "myPosts" ? styles.active_menu : ""}
              onClick={() => changeActiveMenu("myPosts")}
            >
              나의 게시글
            </button>
            {/*


            <button
              className={
                activeMenu === "recentSearch" ? styles.active_menu : ""
              }
              onClick={() => setActiveMenu("recentSearch")}
            >
              최근 검색어
            </button>
*/}

            <button
              className={activeMenu === "myReviews" ? styles.active_menu : ""}
              onClick={() => changeActiveMenu("myReviews")}
            >
              내가 작성한 후기
            </button>

            <button
              className={activeMenu === "suggestions" ? styles.active_menu : ""}
              onClick={() => changeActiveMenu("suggestions")}
            >
              제보 내역
            </button>

            <button
              className={activeMenu === "reports" ? styles.active_menu : ""}
              onClick={() => changeActiveMenu("reports")}
            >
              신고 내역
            </button>

            <button
              className={activeMenu === "activity" ? styles.active_menu : ""}
              onClick={() => changeActiveMenu("activity")}
            >
              메뉴 즐겨찾기
            </button>

            <button
              className={
                activeMenu === "userFavorite" ? styles.active_menu : ""
              }
              onClick={() => {
                changeActiveMenu("userFavorite");
                console.log("회원 즐겨찾기 클릭");
              }}
            >
              회원 즐겨찾기
            </button>
          </nav>
        </aside>

        {/* 오른쪽 메인 영역 */}
        <main className={styles.mypage_content}>
          {/*
            오른쪽 상단 마이페이지 제목 영역

            메뉴 페이지의 "메뉴 탐색" 제목처럼,
            마이페이지에도 상단 타이틀을 따로 둔다.
          */}
          <div className={styles.mypage_header}>
            <h1>MY PAGE</h1>
            <p>회원 정보와 나의 활동 내역을 확인할 수 있습니다.</p>
          </div>

          {/* activeMenu에 따라 바뀌는 실제 내용 */}
          {renderContent()}
        </main>
      </div>
    </section>
  );
};

// 회원 정보 화면
const MyInfo = () => {
  //useAuthStore에서 회원 정보를 가져오기
  const {
    nickname,

    email,
    setEmail,
    setNickname,
    profileImg,
    loginId,
    token,
    setProfileImg,
    createdAt,
  } = useAuthStore();
  //useRef설정하기 (1-1)
  //-> useRef가 필요한 이유 --> 기본적으로 시스템에서는 file input을 설정하면
  //-> 파일 선택하기 버튼과 그와 관련된 텍스트가 제공된다. 그런데 중요한 점은
  //-> 디자인이 예쁘지 않다는 점.
  //-> 따라서 이를 타파하기 위해서 쓰이는 것이 useRef. -->이 녀석의 역할은
  //-> 시스템이 기본적으로 제공하는 기능적인 측면은 그대로 수용하고, 디자인은
  //-> 개발자가 따로 만들어 제공하게 하는데 그 의의가 있다.
  const fileInputRef = useRef();

  //1-14 기본 이미지 주소로 바꾸기 위한 상수 설정
  const DEFAULT_PROFILE_IMG_URL =
    "https://esg-project-site.s3.ap-northeast-2.amazonaws.com/profile_images/user_default.png";

  //4-0이메일 수정을 위한 팝업창 설정 -> 초기값은 false로 설정
  //-> 즉 평소엔 닫혀 있다가 클릭하면 팝업창이 열리는 구조
  const [emailModel, setEmailModel] = useState(false);

  //4-01 기존 회원가입과 아이디/비밀번호 찾기창에서 이미 설정해놓은 이메일 인증 및 입력안과의 공유를
  //-> 피하기 위해 새로운 상태값과 함수를 만들어서 관리하기
  const [newEmail, setNewEmail] = useState("");
  //4-02 이메일 인증이 완료되었는지를 관리하는 상태값과 함수도 새로 만들어서 관리하기
  const [newIsEmailVerified, setNewIsEmailVerified] = useState(false);

  //5-0 닉네임 변경을 위한 팝업창 설정 -> 초기값은 false로 설정
  const [nicknameModel, setNicknameModel] = useState(false);

  //5-1 닉네임 변경을 위한 상태값과 함수 설정
  const [newNickname, setNewNickname] = useState("");

  //프로필 변경하기 함수를 만들기(1-2)
  const profileChange = () => {
    //프로필 이미지 바꾸기 함수가 실행될 때 useRef기능도 실현
    //.current: 이 핀셋이 지금 가리키고 있는 진짜 대상(즉, 숨겨진 <input type="file" /> 태그)을 의미.

    fileInputRef.current.click();
  };

  //변경된 프로필 이미지를 백엔드로 보내는 로직 짜기(1-3)
  const profileUpdate = (file) => {
    const formData = new FormData();

    //파일은 일반 JSON이 아니기 떄문에 FormData로 바꾸기
    //-> 즉, "파일을 백엔드로 보낼 수 있는 택배상자(FormData)에 넣는다"는 개념
    formData.append("profileImg", file);
    console.log(file);

    axios
      .post(
        `${import.meta.env.VITE_BACKSERVER}/users/profile-image`,
        formData,
        //기본적으로 zustand에 기본 이미지가 저장된 상태로 있기 떄문에 새로고침을
        //-> 해야만 새로운 파일로 전환이 된다. 바로 자동으로 변환시켜 줄려면
        //-> 새로 토큰을 받아와 적용시키고 setProfileImg를 사용해서 업데이트 시킨다.
        {
          headers: {
            Authorization: token,
          },
        },
      )

      .then((resp) => {
        setProfileImg(resp.data);

        Swal.fire({
          title: "프로필 이미지 변경이 완료되었습니다",
          icon: "success",
        });
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          title: "이미지 변경에 실패하셨습니다.",
          icon: "error",
        });
      });
  };

  // 기본 이미지로 초기화하는 함수 설정
  const resetProfileImg = () => {
    //이미 기본이미지인 경우 호출 막기
    if (profileImg === null) {
      Swal.fire({
        title: "이미 기본 이미지입니다",
        icon: "info",
      });
      return;
    }

    //혹시라도 실수로 누를 수 있기 떄문에 바로 백엔드로 넘어가지 않고 한번 더 물어보는 로직
    Swal.fire({
      title: "프로필 이미지를 기본 이미지로 초기화하시겠습니까?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "네",
      cancelButtonText: "아니요",
    }).then((result) => {
      //만약에 confirmButtonText: "네",를 선택했을 경우 바로 백엔드로 넘아가기
      if (result.isConfirmed) {
        axios
          .patch(
            `${import.meta.env.VITE_BACKSERVER}/users/profile-image/default`,
            {}, // 빈 데이터 객체를 배치해서 순서를 맞춤
            //기본적으로 zustand에 기본 이미지가 저장된 상태로 있기 떄문에 새로고침을 지정
            {
              headers: {
                Authorization: token,
              },
            },
          )
          .then(() => {
            setProfileImg(
              "https://esg-project-site.s3.ap-northeast-2.amazonaws.com/profile_images/user_default.png",
            );
            Swal.fire({
              title: "프로필 이미지가 기본 이미지로 초기화되었습니다",
              icon: "success",
            });
          })
          .catch((err) => {
            console.log(err);
            Swal.fire({
              title: "프로필 이미지 초기화에 실패하셨습니다.",
              icon: "error",
            });
          });
      }
    });
  };

  //4-2 이메일 수정을 위한 팝업창을 열리게 하기 위한 함수 설정
  const changeEmail = () => {
    if (!email) {
      Swal.fire({
        title: "이메일 변경 불가",
        text: "회원가입 시 이메일을 등록하지 않은 계정입니다.",
        icon: "warning",
      });
      return;
    }
    //4-03 현재 이메일 미리 넣어주기 + 이메일 인증 여부 초기화 + 팝업창 열기
    setNewEmail("");
    setNewIsEmailVerified(false);
    setEmailModel(true);
  };

  //4-05 이메일 변경 완료 버튼을 눌렀을 때 실행되는 함수 설정
  const updateEmail = () => {
    axios
      .patch(`${import.meta.env.VITE_BACKSERVER}/users/email`, {
        //백엔드에서 이메일 변경 API를 만들 때 필요한 정보는 로그인한 사용자의 loginId와 새로 변경할 이메일 주소이므로,
        // 이를 payload로 보내준다. --> loginId까지 필요한 이유는
        //-> 서버에서는 이메일만 받고 이게 누구 아이디인지는 몰라서 문제가 생길 수 있기 떄문
        //-> 이미 로그인한 상태라고 해도 서버는 정확히 이게 누구의 이메일인지 알수가 없다.
        //-> 기본적으로 리엑트와 서버는 연결되어 있지 않기 떄문에
        loginId,
        email: newEmail,
      })
      .then((res) => {
        console.log(res.data);
        // 이메일이 변경되면 인증도 다시 해야하므로 이메일 인증 여부 초기화 + 새 이메일로 업데이트
        //--> 이 과정이 이루어지지 않으면 새로고침을 해야만 새로운 값으로 바뀜
        setEmail(newEmail);
        Swal.fire({
          title: "이메일 전송이 완료되었습니다",
          text: "새로운 이메일로 인증을 완료해 주세요",
          icon: "success",
        });
        //4-06 이메일 변경에 성공하면 자동으로 팝업창 닫기
        setEmailModel(false);
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          title: "이메일 변경에 실패하셨습니다.",
          text: "잠시 후 다시 시도해 주세요",
          icon: "error",
        });
      });
  };

  //4-07 이메일 수정 팝업창 닫기 함수 설정
  const closeEmailModel = () => {
    //닫기 버튼을 누르면 아래 입력창을 닫고
    //-> 입력한 값을 초기화시키고
    //-> 이메일 인증 여부도 초기화시키는 함수
    setEmailModel(false);
    setNewEmail("");
    setNewIsEmailVerified(false);
  };

  //5-4 닉네임 변경을 위한 팝업창을 열리게 하기 위한 함수 설정
  const changeNickname = () => {
    if (!nickname) {
      Swal.fire({
        title: "닉네임 변경 불가",
        text: "회원가입 시 닉네임을 등록하지 않은 계정입니다.",
        icon: "warning",
      });
      return;
    }
    setNewNickname("");
    setNicknameModel(true);
  };

  //5-5 닉네임 변경 완료 버튼을 눌렀을 때 실행되는 함수 설정
  const updateNickname = () => {
    //닉네임 공백으로 입력하는 것을 방지하기 위한 로직
    if (newNickname.trim() === "") {
      Swal.fire({
        title: "닉네임을 입력해주세요",
        icon: "warning",
      });
    }

    //데이터베이스에 같은 닉네임이 있을 경우 변경이 안되도록 하는 로직
    if (nickname === newNickname) {
      Swal.fire({
        title: "이미 사용 중인 닉네임입니다",
        text: "다른 닉네임을 입력해주세요",
        icon: "warning",
      });
      return;
    }

    axios
      .patch(
        `${import.meta.env.VITE_BACKSERVER}/users/nickname`,
        {
          loginId,
          nickname: newNickname,
        },
        {
          headers: {
            // 백엔드에서 토큰값을 근거로 같은 아이디에서 중복된 닉네임을 적을경우
            //-> 방지하기 위한 로직을 짜고 있기 떄문에 여기에서도 토큰값을 보내주는 로직을 짜야함
            Authorization: token,
          },
        },
      ) // <--- axios.patch의 괄호가 여기서 정확히 닫혀야 합니다.
      .then((res) => {
        console.log(res.data);
        setNickname(newNickname);
        Swal.fire({
          title: "닉네임 변경이 완료되었습니다",
          icon: "success",
        });

        //5-7 닉네임 변경에 성공하면 자동으로 팝업창 닫기
        setNicknameModel(false);
      })
      .catch((err) => {
        console.log(err);

        //5-9 같은 아이디에서 닉네임을 공백으로 입력하거나, 기존 닉네임과 똑같은 닉네임을 입력하는 경우에 대한 예외처리
        // (참고: 백엔드에서 에러 응답 바디로 -1을 보낸다면 err.response.data를 비교하는 것이 정확합니다)
        if (err.response.data === -1) {
          Swal.fire({
            title: "현재 사용중인 닉네임입니다.",
            icon: "error",
          });
        }
      });
  };

  //5-6 닉네임 수정 팝업창 닫기 함수 설정
  const closeNicknameModel = () => {
    setNicknameModel(false);
    setNewNickname("");
  };

  //컴포넌트 밖에서 설정
  const navigate = useNavigate();
  // authStore에서 로그아웃 기능 가져오기
  //authStore에서 로그인 기능 가져오기
  const loginIdFromStore = useAuthStore((state) => state.loginId);
  const logout = useAuthStore((state) => state.logout);
  //회원탈퇴를 위한 함수 설정
  const deleteUser = () => {
    //로컬스토리지에서 로그인 아이디 가져오기

    Swal.fire({
      title: "정말 탈퇴하시겠습니까?",
      text: "탈퇴 시 기존의 모든 회원 정보와 데이터가 삭제되며 복구할 수 없습니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // 탈퇴에 어울리는 강조색
      cancelButtonColor: "#5b7252",
      confirmButtonText: "탈퇴하기",
      cancelButtonText: "취소",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // 백엔드 API 호출 (실제 DB 데이터 삭제 요청)
        axios
          .delete(
            `${import.meta.env.VITE_BACKSERVER}/users/delete?loginId=${loginIdFromStore}`,
          )
          .then(async (response) => {
            console.log("회원 탈퇴 결과:", response.data);

            // 1. 탈퇴 완료 후 스토어에 정의된 로그아웃 프로세스를 가동하여 클라이언트 데이터를 완벽히 지우기.
            // (안에 백엔드 로그아웃 API 연동도 들어있으므로 클린업이 한번에 이루어짐)
            //-> 따라서 delete 토큰이나 다른 로직을 짤 필요가 없음
            await logout();

            // 2. 탈퇴 완료 성공 alert 노출
            Swal.fire({
              title: "탈퇴 완료",
              text: "회원 탈퇴가 정상적으로 처리되었습니다. 그동안 이용해 주셔서 감사합니다.",
              icon: "success",
            }).then(() => {
              // 3. 알림창 확인 버튼을 누르면 메인 페이지나 로그인 페이지로 안전하게 이동시킵니다.
              navigate("/");
            });
          })
          .catch((error) => {
            console.error("회원 탈퇴 오류:", error);
            Swal.fire({
              title: "오류 발생",
              text: "회원 탈퇴 처리 중 문제가 발생했습니다. 다시 시도해 주세요.",
              icon: "error",
            });
          });
      }
    });
  };

  return (
    //ref설정하기 위한 로직
    //1단계 -> 이미지 수정하기 버튼을 클릭하면 이벤트 함수를 실이행-> 파일창이 열림까지 구현
    <>
      {/*1-4 */}
      <input
        type="file"
        // accept="image/*"==> 파일 선택창에서
        //이미지 파일만 선택 가능하게 해줘
        //*==> jpg/png/gif 파일 모두 가능하다는 의미
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        //2단계 ==> 선택한 파일 확인하는 작업
        //-> 즉 파일을 선택하면 onChange 이벤트 함수를 실행

        onChange={(e) => {
          const file = e.target.files[0];
          //만약 파일을 안받아오면 return처리
          if (!file) return;
          console.log(file);
          //파일이 들어오게 되면 이벤트 함수를 실행
          profileUpdate(file);
        }}
      ></input>

      <div className={styles.content_box}>
        {/* 콘텐츠 박스 상단 제목 */}
        <div className={styles.content_header}>
          <div>
            <h2>회원 정보</h2>
            <p>현재 로그인된 회원의 기본 정보입니다.</p>
          </div>
        </div>

        {/*
        회원 정보는 카드 여러 개보다
        넓은 정보 패널 + 리스트 형태가 더 관리 화면답다.
      */}
        <div className={styles.info_panel}>
          <div className={styles.info_list}>
            <div className={`${styles.info_row} ${styles.profile_info_row}`}>
              <span>회원 이미지</span>

              <div className={styles.info_profile_img_box}>
                {/*1-15 기본 이미지로 되돌리기 위해 주소를 작성 */}
                <img
                  src={profileImg ? profileImg : DEFAULT_PROFILE_IMG_URL}
                  alt="profileImg"
                />
              </div>
              <div className={styles.profile_btn_group}>
                {/* 이미지 수정하기 버튼 */}
                <button
                  type="button"
                  className={styles.profile_img_btn}
                  onClick={profileChange}
                >
                  이미지 바꾸기
                </button>

                {/* 기본 이미지로 초기화 버튼 */}
                <button
                  type="button"
                  className={styles.reset_profile_btn}
                  onClick={resetProfileImg}
                >
                  이미지 초기화
                </button>
              </div>
            </div>

            <div className={styles.info_row}>
              <span>아이디</span>
              <p>{loginId}</p>
            </div>

            {/*5-2 닉네임을 변경하기 위해서 모달창 열기 위한 로직  */}
            <div className={styles.info_row}>
              <span>닉네임</span>
              <p>{nickname}</p>
              <button
                className={styles.nickname_btn}
                onClick={changeNickname}
                disabled={!nickname}
              >
                닉네임 수정하기
              </button>
            </div>

            {/*5-3 닉네임을 변경하기 위한 로직  */}
            {nicknameModel && (
              <div className={styles.model}>
                <label htmlFor="nickname">새로운 닉네임</label>
                <input
                  type="text"
                  id="nickname"
                  value={newNickname}
                  className={styles.nickname_input}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder="새로운 닉네임을 적어주세요."
                ></input>
                <button
                  className={styles.commen_btn}
                  onClick={updateNickname}
                  disabled={!newNickname}
                >
                  닉네임 변경 완료
                </button>
                {/*5-8 닫기 버튼 설정  */}
                <button
                  className={styles.cancel_btn}
                  onClick={closeNicknameModel}
                >
                  닫기
                </button>
              </div>
            )}
            {/*
 
 <div className={styles.info_row}>
   <span>권한</span>
   <p>{role}</p>
 </div>

 
 */}

            <div className={styles.info_row}>
              <span>이메일</span>
              <p>{email ? email : "등록된 이메일 없음"}</p>
              <button
                className={styles.email_btn}
                onClick={changeEmail}
                disabled={!email}
              >
                이메일 수정하기
              </button>
            </div>
            {/*4-04 수정하기 버튼을 누르면 바로 아래에  이메일 입력란이 뜨게 만드는 로직
             */}
            {emailModel && (
              <div className={styles.model}>
                <EmailAuth
                  email={newEmail}
                  setEmail={setNewEmail}
                  onVerified={setNewIsEmailVerified}
                  placeholder="새로운 이메일을 입력하세요"
                ></EmailAuth>
                <button
                  className={styles.commen_btn}
                  disabled={!newIsEmailVerified}
                  onClick={updateEmail}
                >
                  이메일 변경 완료
                </button>
                {/*4-06 이메일을 수정하고 싶지않을 떄 칸 닫기 버튼 
                <button onClick={() => setEmailModel(false)}>취소</button>
                --> 위의 방식이 제일 구현시키기 쉬운 방식이지만 , 인증까지 다끝나고도 초기화가
                안될 수 있음 따라서 함수 하나를 더 만들어서 구현시키는 게 좋음.
                */}
                <button className={styles.cancel_btn} onClick={closeEmailModel}>
                  닫기
                </button>
              </div>
            )}

            <div className={styles.info_row}>
              <span>회원가입날짜</span>
              {/*회원가입날짜 예쁘게 꾸미기 */}
              <p>{createdAt?.split("T")[0]}</p>
            </div>

            <div className={styles.delete_join_btn}>
              <button className={styles.delete_btn} onClick={deleteUser}>
                회원탈퇴
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// 6-1 최근선택메뉴 컴포넌트 만들기

const RecentChoice = () => {
  // 페이지 이동을 위한 React Router 훅
  const navigate = useNavigate();

  // 로그인한 회원 id로 DB에 저장된 최신 선택 기록을 다시 조회합니다.
  // choiceId는 로그아웃 시 초기화되므로 마이페이지에서는 userId 기준 조회가 더 안정적입니다.
  const userId = useAuthStore((state) => state.userId);
  const isReady = useAuthStore((state) => state.isReady);

  // 백엔드에서 받아온 최근 선택 메뉴 데이터 저장
  const [choiceData, setChoiceData] = useState(null);
  const [canWriteReview, setCanWriteReview] = useState(false);

  // API 통신 중인지 여부
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트가 처음 렌더링되거나 userId가 변경될 때 최신 선택 이력을 조회합니다.
  useEffect(() => {
    // 최근 선택 메뉴 조회 함수
    const fetchRecentChoice = async () => {
      if (!isReady) {
        return;
      }

      // 로그인하지 않은 상태에서는 개인 선택 이력을 보여주지 않습니다.
      if (!userId) {
        setChoiceData(null);
        setCanWriteReview(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setCanWriteReview(false);

      try {
        const BACK_SERVER = import.meta.env.VITE_BACKSERVER;

        // DB에 저장된 최신 선택 메뉴 상세 조회
        const response = await axios.get(
          `${BACK_SERVER}/choices/users/${userId}/latest`,
        );

        if (response.status === 204 || !response.data) {
          setChoiceData(null);
          setCanWriteReview(false);
          return;
        }

        // 조회 결과 저장
        setChoiceData(response.data);

        try {
          const reviewStatusResponse = await axios.get(
            `${BACK_SERVER}/grams/choices/${response.data.choiceId}/written`,
            {
              params: {
                userId,
              },
            },
          );
          setCanWriteReview(!Boolean(reviewStatusResponse.data?.written));
        } catch (reviewStatusError) {
          console.error("후기 작성 여부 확인 실패:", reviewStatusError);
          setCanWriteReview(true);
        }
      } catch (error) {
        console.error("최근 선택 메뉴 로드 실패:", error);
        setChoiceData(null);
        setCanWriteReview(false);
      } finally {
        // 성공/실패 여부와 상관없이 로딩 종료
        setIsLoading(false);
      }
    };

    fetchRecentChoice();
  }, [isReady, userId]);

  // ===========================
  // 예외 처리 구간
  // ===========================

  // 아직 API 통신 중
  if (!isReady || isLoading)
    return (
      <div className={styles.loading}>선택 이력을 불러오는 중입니다...</div>
    );

  // 비로그인 사용자
  if (!userId)
    return (
      <div className={styles.empty}>로그인 후 이용 가능한 서비스입니다.</div>
    );

  // 로그인은 했지만 최근 선택 데이터가 없음
  if (!choiceData) {
    return (
      <div className={styles.empty}>
        <span className="material-symbols-outlined">history_toggle_off</span>
        <p>아직 대결에서 최종 선택한 메뉴가 없습니다.</p>
      </div>
    );
  }

  // ===========================
  // 데이터 가공 구간
  // ===========================

  // 최종 선택된 메뉴 찾기
  // isSelected === 1 인 메뉴가 사용자의 최종 선택
  const mainBurger = choiceData.items?.find((item) => item.isSelected === 1);

  // 비교했던 메뉴 목록 정렬
  // 사용자가 담았던 순서(displayOrder) 유지
  const sortedItems = choiceData.items
    ? [...choiceData.items].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];

  // ===========================
  // 이벤트 함수
  // ===========================

  // 실제 작성한 후기가 없다고 확인된 선택 기록만 후기 작성 페이지로 이동합니다.
  const handleWriteReview = () => {
    if (!canWriteReview) return;

    navigate(`/esg/gram/write/${choiceData.choiceId}`);
  };

  return (
    <div className={styles.container}>
      {/* 섹션 제목 */}
      <h3 className={styles.sectionTitle}>
        <span className="material-symbols-outlined">history</span>
        최근 선택한 메뉴 이력
      </h3>

      <div className={styles.historyCard}>
        {/* =======================
            상단 헤더 영역
        ======================== */}
        <div className={styles.cardHeader}>
          {/* 선택 날짜 표시 */}
          <span className={styles.date}>
            {choiceData.createdAt
              ? choiceData.createdAt.split("T")[0]
              : "최근 선택"}
          </span>

          {/* 후기를 아직 쓰지 않았고 작성 가능 시간이 남아 있을 때만 버튼을 보여줍니다. */}
          {canWriteReview && (
            <button
              className={`${styles.reviewBtn} ${styles.writeBtn}`}
              onClick={handleWriteReview}
            >
              후기 쓰러가기
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          )}
        </div>

        {/* =======================
            최종 선택 메뉴 영역
        ======================== */}
        {mainBurger && (
          <div className={styles.pickedSection}>
            {/* 최종 선택 강조 배지 */}
            <div className={styles.pickedLabel}>FINAL PICK</div>

            <div className={styles.pickedMain}>
              {/* 대표 이미지 */}
              <img
                src={resolveMenuImageUrl(mainBurger.imageUrl)}
                alt={`${mainBurger.productName} 이미지`}
                className={styles.burgerImg}
                onError={handleMenuImageError}
              />

              {/* 메뉴 정보 */}
              <div className={styles.burgerInfo}>
                <span className={styles.brand}>
                  {mainBurger.brand || "브랜드"}
                </span>

                <strong className={styles.name}>
                  {mainBurger.productName}
                </strong>

                <small className={styles.calories}>
                  {mainBurger.kcal} kcal
                </small>
              </div>
            </div>
          </div>
        )}

        {/* =======================
            비교 메뉴 목록 영역
        ======================== */}
        <div className={styles.comparedSection}>
          <p className={styles.comparedTitle}>함께 비교했던 후보군</p>

          {/* 메뉴 개수(1~3개)에 따라 CSS 자동 변경 */}
          <div
            className={`
              ${styles.comparedGrid}
              ${styles[`items-${sortedItems.length}`]}
            `}
          >
            {sortedItems.map((item) => (
              <div
                key={item.productId}
                className={`
                  ${styles.comparedItem}
                  ${item.isSelected === 1 ? styles.selectedItemHighlight : ""}
                `}
              >
                {/* 상단 상태 표시 */}
                <div className={styles.itemHeader}>
                  <span className="material-symbols-outlined">
                    {item.isSelected === 1 ? "check_circle" : "lunch_dining"}
                  </span>

                  {/* 최종 선택 메뉴에만 PICK 표시 */}
                  {item.isSelected === 1 && (
                    <span className={styles.pickBadge}>PICK</span>
                  )}
                </div>

                {/* 메뉴 정보 */}
                <img
                  src={resolveMenuImageUrl(item.imageUrl)}
                  alt={`${item.productName} 이미지`}
                  className={styles.comparedImg}
                  onError={handleMenuImageError}
                />

                <div className={styles.comparedInfo}>
                  <span className={styles.compBrand}>{item.brand}</span>

                  <span className={styles.compName}>{item.productName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
/*


const RecentSearch = () => {
  return (
    <div className={styles.content_box}>
      <div className={styles.content_header}>
        <div>
          <h2>최근 검색어</h2>
          <p>최근에 검색한 키워드를 확인합니다.</p>
        </div>
      </div>

      <p className={styles.empty_text}>
        아직 최근 검색어 조회 로직이 연결되지 않았습니다.
      </p>
    </div>
  );
};
*/

//나의 게시글
const MyPosts = () => {
  const navigate = useNavigate();
  //토큰, 유저아이디등을 받아서 이를 매개로 하여 데이터 로드
  const { token, isReady, userId } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Zustand의 Auth 상태가 준비되지 않았거나 로그인이 안 되어 있으면 대기
    if (!isReady) return;

    if (!userId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/users/my-posts`, {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        if (res.data.result === true) {
          setPosts(res.data.data);
        } else {
          console.error("데이터 로드 실패:", res.data.message);
        }
      })
      .catch((err) => {
        console.error("서버 통신 에러:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isReady, token, userId]);

  // 날짜 포맷 함수 (PostViewPage의 형식 참고)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 상세 페이지 이동 핸들러
  const handlePostClick = (postId) => {
    navigate(`/esg/post/view/${postId}`);
  };

  return (
    <div className={styles.content_box}>
      <div className={styles.content_header}>
        <div>
          <h2>내가 작성한 게시글</h2>
          <p>내가 작성한 게시글 목록을 관리합니다.</p>
        </div>
      </div>

      {loading ? (
        <p className={styles.empty_text}>게시글을 불러오는 중입니다...</p>
      ) : posts.length === 0 ? (
        <p className={styles.empty_text}>아직 내가 작성한 게시글이 없습니다.</p>
      ) : (
        <div className={styles.activity_list}>
          {posts.map((post, index) => (
            <button
              type="button"
              key={post.postId}
              onClick={() => handlePostClick(post.postId)}
              className={styles.activity_item}
            >
              <span className={styles.activity_index}>
                {posts.length - index}
              </span>

              <div className={styles.activity_body}>
                <span className={styles.activity_type}>게시글</span>
                <strong className={styles.activity_title}>{post.title}</strong>
                <span className={styles.activity_date}>
                  {formatDate(post.createdAt)}
                </span>
              </div>

              <div className={styles.activity_meta}>
                <span>조회 {post.viewCount ?? 0}</span>
                <span className="material-symbols-outlined">chevron_right</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// 내가 작성한 후기
const MyReviews = () => {
  const navigate = useNavigate();
  const { isReady, userId } = useAuthStore();

  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 내부 유틸 함수 ---
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [datePart, timePart] = dateStr.split("T");
    const time = timePart ? timePart.split(".")[0] : "";
    return `${datePart} ${time}`;
  };

  // --- 데이터 패칭 ---
  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!userId) {
      setReviews([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/grams/my-grams`, {
        params: {
          userId: userId,
          page: 1,
          size: 50,
          // <-- 나 마이페이지야! 라고 백엔드에 확실히 말해줌
          //-> 이렇게 하는 이유는 이렇게 해야만 마이페이지에서만 내가 작성한 후기
          //-> 게시글이 보이고 메인 후기 게시글에서는 전체 게시글이 보일 수 있음.
          //-> 즉  isMyPage가 있는 곳에만 나의 후기 게시글이 보이게 하는 거임
        },
      })
      .then((res) => {
        setReviews(res.data.items ?? []);
      })
      .catch((err) => {
        console.error("내가 작성한 후기 목록 조회 실패:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isReady, userId]);

  const handleReviewClick = (gramId) => {
    navigate(`/esg/gram/view/${gramId}`);
  };

  if (isLoading) {
    return (
      <div className={styles.content_box}>
        <p className={styles.empty_text}>데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className={styles.content_box}>
      <div className={styles.content_header}>
        <div>
          <h2>내가 작성한 후기</h2>
          <p>내가 작성한 후기 목록을 관리합니다.</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className={styles.empty_text}>
          아직 작성하신 후기가 존재하지 않습니다.
        </p>
      ) : (
        <div className={styles.activity_list}>
          {reviews.map((item, index) => {
            const statusLabel =
              item.status?.toUpperCase() === "ACTIVE" || item.status === "1"
                ? "게시됨"
                : item.status || "상태 확인";
            const statusClass = item.status
              ? styles[item.status.toLowerCase()]
              : "";

            return (
              <button
                type="button"
                key={item.gramId}
                onClick={() => handleReviewClick(item.gramId)}
                className={styles.activity_item}
              >
                <span className={styles.activity_index}>
                  {reviews.length - index}
                </span>

                <div className={styles.activity_body}>
                  <span className={styles.activity_type}>후기</span>
                  <strong className={styles.activity_title}>
                    {item.title}
                  </strong>
                  <span className={styles.activity_date}>
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                <div className={styles.activity_meta}>
                  <span>좋아요 {item.likeCount ?? 0}</span>
                  <span className={`${styles.status_badge} ${statusClass}`}>
                    {statusLabel}
                  </span>
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

//제보하기 로직
const MySuggestions = () => {
  const navigate = useNavigate();
  // 1. 제보 내역 데이터를 저장할 상태(State)
  const [suggestions, setSuggestions] = useState([]);

  const { userId } = useAuthStore();
  // 2. 데이터를 불러오는 중인지 체크하는 상태
  const [loading, setLoading] = useState(true);

  // 3. 백엔드에서 제보 내역을 받아오는 함수
  useEffect(() => {
    if (!userId) {
      console.log("경고: userId가 없어서 백엔드로 출발조차 안 했습니다!");
      return;
    }

    axios
      //주소 전달체계가 꼬일 경우 아래처럼 전체주소로 보내주기
      .get(
        `${import.meta.env.VITE_BACKSERVER}/eats/suggestions?userId=${userId}`,
      )
      .then((response) => {
        setSuggestions(response.data); // 받아온 데이터를 상태에 저장

        setLoading(false);
      })
      .catch((error) => {
        console.error("제보 내역을 불러오는데 실패했습니다.", error);
        setLoading(false);
      });
  }, [userId]);

  return (
    <div className={styles.content_box}>
      <div className={styles.content_header}>
        <div>
          <h2>제보 내역</h2>
          <p>내가 등록한 제보 처리 상태를 확인합니다.</p>
        </div>
      </div>

      {/* 조건부 렌더링 (로딩 중 -> 내역 없음 -> 내역 있음) */}
      {loading ? (
        <p className={styles.empty_text}>로딩 중입니다...</p>
      ) : suggestions.length === 0 ? (
        <p className={styles.empty_text}>아직 제보한 내역이 없습니다.</p>
      ) : (
        /* 테이블 대신 후기와 동일한 카드 리스트 구조로 변경 */
        <div className={styles.suggestion_list}>
          {suggestions.map((item, index) => (
            <div
              key={item.suggestion_id}
              className={styles.suggestion_card}
              onClick={() => {
                console.log("클릭된 상품 ID:", item.product_id);
                navigate(`/esg/eat?id=${item.product_id}`);
              }}
            >
              {/* 좌측 순번 (후기의 노란색 동그라미 스타일) */}
              <div className={styles.card_index}>{index + 1}</div>

              {/* 중앙 본문 정보 */}
              <div className={styles.card_content}>
                <div className={styles.card_badge}>제보</div>
                <strong className={styles.product_name}>
                  {item.product_name}
                </strong>
                <p className={styles.user_note}>{item.user_note}</p>
                <span className={styles.created_at}>{item.created_at}</span>
              </div>

              {/* 우측 처리 상태 및 화살표 */}
              <div className={styles.card_right}>
                <span
                  className={`${styles.status_badge} ${styles[item.status.toLowerCase()]}`}
                >
                  {item.status === "PENDING"
                    ? "대기 중"
                    : item.status === "APPROVED"
                      ? "승인됨"
                      : "반려됨"}
                </span>
                {/* 오른쪽 아이콘 아이콘(>) */}
                <span className={styles.arrow_icon}>&gt;</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

//신고내역 저장해 두는 곳
const MyReports = () => {
  const navigate = useNavigate();
  const { userId } = useAuthStore(); // 로그인한 현재 유저 ID 가져오기
  const [reportList, setReportList] = useState([]); // 신고 내역 데이터를 담을 상태
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 제어

  //  마이페이지 진입 시 로그인된 유저의 신고 내역 로드
  useEffect(() => {
    //아이디가 없을 경우 로딩중이라고 뜨게 하기
    if (!userId) {
      return;
    }

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/grams/reports/user/${userId}`)
      .then((res) => {
        // 서버에서 받아온 데이터 배열을 상태에 저장 (데이터가 없으면 빈 배열)
        setReportList(res.data ?? []);
        console.log("신고 내역 로드 센코:", res.data);
      })
      .catch((err) => {
        console.error("신고 내역 로드 실패:", err);
        Swal.fire({
          icon: "error",
          title: "신고 내역을 가져오는데 실패했습니다.",
          confirmButtonColor: "var(--bun)",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId]);

  // ISO 날짜 가독성 좋게 포맷팅하는 함수
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.split("T")[0];
  };

  return (
    <div className={styles.content_box}>
      <div className={styles.content_header}>
        <div>
          <h2>신고 내역</h2>
          <p>내가 접수한 신고 처리 상태를 확인합니다.</p>
        </div>
      </div>

      {isLoading ? (
        <p className={styles.loading_text}>로딩 중...</p>
      ) : reportList.length > 0 ? (
        /* ✅ 테이블 대신 동일한 카드 리스트 구조로 통일 */
        <div className={styles.report_list}>
          {reportList.map((report, index) => (
            <div
              key={report.reportId || index}
              className={styles.report_card}
              onClick={() => navigate(`/esg/gram/view/${report.gramId}`)}
            >
              {/* 좌측 순번 (동일한 노란색/황토색 동그라미 스타일) */}
              <div className={styles.card_index}>{index + 1}</div>

              {/* 중앙 본문 정보 */}
              <div className={styles.card_content}>
                <div className={styles.card_badge}>신고</div>
                <strong className={styles.gram_title}>
                  {report.gramTitle || "삭제되거나 존재하지 않는 후기"}
                </strong>
                <p className={styles.report_reason}>{report.reason}</p>
                <span className={styles.created_at}>
                  {formatDate(report.createdAt)}
                </span>
              </div>

              {/* 우측 처리 상태 및 화살표 */}
              <div className={styles.card_right}>
                <span
                  className={`${styles.status_badge} ${
                    report.status === "PROCESSED" ? styles.done : styles.pending
                  }`}
                >
                  {report.status === "PROCESSED" ? "처리 완료" : "접수 완료"}
                </span>
                {/* 오른쪽 아이콘(>) */}
                <span className={styles.arrow_icon}>&gt;</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 신고 내역이 없을 때 */
        <p className={styles.empty_text}>
          접수한 신고 내역이 존재하지 않습니다.
        </p>
      )}
    </div>
  );
};

// 이 로직이 움직이는 과정
//벡엔드에서 상세 조회를 하지는 않았지만,
// 전체조회를 해서 데이터는 온전히 다 넘기고 있으니까,
//  그 중 필요한 정보만을 리엑트에서 받는 걸로 로직을 수정
//-> 예를 들어 userId와 favoriteList를 받기 전에, 즐겨찾기를 눌렀을 경우
//-> 그 배열에 들어갈 빈값 설정을 해놓고
//-> 그 배열을 리엑트에서 사용. 그 다음 전체 배열을 가져와서 즐겨찾기한 그 상품값을 호출
const MyActivity = () => {
  // 1. 로그인한 유저의 ID 가져오기 (팀원 코드와 동일)
  const { userId } = useAuthStore();
  // 2. 서버에서 받아온 즐겨찾기 목록을 저장할 상태(State)
  const [favoriteList, setFavoriteList] = useState([]);
  // 로딩 상태 관리 (데이터를 가져오는 중인지 확인용)
  const [loading, setLoading] = useState(true);

  // 3. 컴포넌트가 처음 열릴 때(마운트될 때) 서버에 즐겨찾기 목록 요청하기
  useEffect(() => {
    if (!userId) return;

    // 1. [내 로직] 내가 즐겨찾기한 상품 번호 리스트를 가져오기 (DB에 있던 4번, 5번)
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/favorites`, {
        params: { userId },
      })
      .then((res) => {
        const myFavIds = res.data ?? []; // 예: [{ productId: 4 }, { productId: 5 }]

        if (myFavIds.length === 0) {
          setFavoriteList([]);
          //값을 잘 받아오면 로딩 상태 끝내기
          setLoading(false);
          return;
        }

        // 2. [지혁씨 API 활용] 지혁씨가 만든 전체 메뉴판 데이터를 요청합니다.
        // (페이징 처리가 되어있으므로 일단 즐겨찾기 상품을 다 커버할 수 있게 size를 넉넉히 줍니다)
        axios
          .get(`${import.meta.env.VITE_BACKSERVER}/eats`, {
            params: { page: 1, size: 100, order: "like" },
          })
          .then((eatRes) => {
            const allProducts = eatRes.data.items ?? []; // 지혁씨 DB에 있는 진짜 상품 상세 정보들

            // 3. [매칭 작업] 내 즐겨찾기 번호와 일치하는 지혁씨 상품 정보만 필터링해서 합칩니다.
            const matchedFavorites = myFavIds
              .map((fav) => {
                // 전체 상품 중 내 즐겨찾기 product_id와 똑같은 상품 찾기
                const detail = allProducts.find(
                  (item) => item.productId === fav.productId,
                );

                // 찾았다면 지혁씨가 만든 이름, 가격, 이미지를 그대로 쓰고, 못 찾으면 기본값 처리
                return detail ? detail : null;
              })
              .filter((item) => item !== null); // 데이터가 없는 에러 상품은 제외

            // 완성된 데이터를 상태에 저장 (이제 이름과 가격이 존재함!)
            setFavoriteList(matchedFavorites);
            setLoading(false);
          })
          .catch((err) => {
            console.error("지혁씨 API 호출 실패:", err);
            setLoading(false);
          });
      })
      .catch((err) => {
        console.error("즐겨찾기 목록 호출 실패:", err);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div>즐겨찾기 목록 로딩 중...</div>;

  return (
    <div className={styles.card_grid}>
      {favoriteList.length === 0 ? (
        <p>즐겨찾기한 메뉴가 없습니다.</p>
      ) : (
        favoriteList.map((item) => (
          <div key={item.productId} className={styles.eat_card}>
            <div className={styles.card_img_wrap}>
              <img
                src={item.imageUrl || defaultImg}
                alt={item.name}
                onError={(e) => {
                  e.target.src = defaultImg;
                }}
              />
              <p className={styles.card_brand}>{item.brandName}</p>
            </div>
            <div className={styles.card_info}>
              <p className={styles.card_name}>{item.name}</p>
              {/* 지혁씨 VO의 price 데이터가 드디어 꽂힘! */}
              <p className={styles.card_price}>
                {item.price ? `${item.price.toLocaleString()}원` : "0원"}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

//즐겨찾기 회원 로직
const UserFavorite = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  // 프로필 페이지 이동용
  const navigate = useNavigate();

  const token = useAuthStore((state) => state.token);
  console.log("토큰:", token);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/users/profile/favorite`, {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        console.log("즐겨찾기 응답:", res.data);

        if (res.data) {
          setFavorites(res.data);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("즐겨찾기 목록 로드 실패:", err.message);
        setLoading(false);
      });
  }, [token]);

  if (loading) return <div className={styles.empty_text}>로딩 중...</div>;

  return (
    <div className={styles.content_box}>
      <div className={styles.content_header}>
        <h2>즐겨찾기 회원</h2>
        <p>최근에 즐겨찾기 추가한 회원을 확인합니다.</p>
      </div>

      {favorites.length === 0 ? (
        <p className={styles.empty_text}>
          아직 즐겨찾기 회원 정보가 없거나 로직이 연결되지 않았습니다.
        </p>
      ) : (
        <div className={styles.favorite_grid}>
          {favorites.map((fav) => (
            <div
              key={fav.targetUserId}
              className={styles.favorite_card}
              onClick={() => handleUserClick(fav.targetUserId)}
            >
              {/* 1. 카드 상단 (프로필 영역) */}
              <div className={styles.card_header}>
                {/* 프로필 이미지 클릭 시 해당 회원 프로필로 이동 */}
                <img
                  className={styles.profile_thumb}
                  src={fav.profileImg || "https://via.placeholder.com/44"}
                  alt="프로필"
                  style={{ cursor: "pointer" }}
                />

                <span className={styles.user_nickname}>
                  {fav.nickname || "애니고"}
                </span>
              </div>

              {/* 2. 카드 중단 (본문 영역) */}
              <div className={styles.card_body}>
                <p
                  className={styles.description_text}
                  onClick={(e) => {
                    // 카드 클릭 이벤트 전파 방지
                    e.stopPropagation();
                  }}
                >
                  {fav.description || "좋아요"}
                </p>
              </div>

              {/* 3. 카드 하단 (날짜 영역) */}
              <div className={styles.card_footer}>
                <span className={styles.date_text}>
                  {fav.createdAt || "2026-06-10 13:31:43"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPage;
/*


const RecentSearch = () => {
  return (
    <div className={styles.content_box}>
      <div className={styles.content_header}>
        <div>
          <h2>최근 검색어</h2>
          <p>최근에 검색한 키워드를 확인합니다.</p>
        </div>
      </div>

      <p className={styles.empty_text}>
        아직 최근 검색어 조회 로직이 연결되지 않았습니다.
      </p>
    </div>
  );
};
*/
