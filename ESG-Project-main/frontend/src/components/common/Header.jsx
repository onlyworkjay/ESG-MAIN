import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../../authstore/useAuthStore";
import burgerFavicon from "../../assets/esg_burger_favicon1.svg";
import styles from "./Header.module.css";
import { useNavigate } from "react-router-dom";
import usePostStore from "../../utils/usePostStore"; //추가작성자:한진호 (게시판 이동시 전역으로 관리하던 값을 초기화)

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const userId = useAuthStore((state) => state.userId);
  const nickname = useAuthStore((state) => state.nickname);

  const loginId = useAuthStore((state) => state.loginId);

  const isLoggedIn = Boolean(userId);

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };
  const { resetPostState } = usePostStore(); //초기화용 함수(추가 작성자 : 한진호)
  const handleBoardClick = (e) => {
    //게시판 전용 클릭 핸들 추가 (추가 작성자 : 한진호)
    e.preventDefault();
    resetPostState();
    handleCloseMenu();
    navigate("/esg/post"); // 초기화 끝내고 게시판 목록으로 이동
  };

  //이 로그아웃은 수동 로그아웃, 자동로그아웃과 구별되는 로그아웃로직을 authstore에서 가져옴
  const confirmLogout = useAuthStore((state) => state.confirmLogout);

  //프로필 이미지를 useAuthSore에서 땡겨와서 헤더에 있는 프로필이미지에 반영하기
  const profileImg = useAuthStore((state) => state.profileImg);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/esg" className={styles.logoArea} onClick={handleCloseMenu}>
          <img
            src={burgerFavicon}
            alt=""
            className={styles.logoIcon}
            aria-hidden="true"
          />
          <div>
            <div className={styles.logoText}>ESG</div>
            <div className={styles.logoSub}>Eat · Stat · Gram</div>
          </div>
        </Link>

        <button
          type="button"
          className={styles.mobileMenuButton}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isMenuOpen}
        >
          <span className="material-symbols-outlined">
            {isMenuOpen ? "close" : "menu"}
          </span>
        </button>

        <div
          className={`${styles.navPanel} ${
            isMenuOpen ? styles.navPanelOpen : ""
          }`}
        >
          <nav className={styles.nav}>
            <Link
              to="/esg/eat"
              className={isActive("/esg/eat") ? styles.active : styles.navLink}
              onClick={handleCloseMenu}
            >
              메뉴 탐색
            </Link>

            <Link
              to="/esg/stat"
              className={isActive("/esg/stat") ? styles.active : styles.navLink}
              onClick={handleCloseMenu}
            >
              비교하기
            </Link>

            <Link
              to="/esg/random"
              className={
                isActive("/esg/random") ? styles.active : styles.navLink
              }
              onClick={handleCloseMenu}
            >
              랜덤 추첨
            </Link>

            <Link
              to="/esg/gram"
              className={isActive("/esg/gram") ? styles.active : styles.navLink}
              onClick={handleCloseMenu}
            >
              후기 보기
            </Link>

            <Link
              to="/esg/post"
              className={isActive("/esg/post") ? styles.active : styles.navLink}
              onClick={handleBoardClick} //연결함수변경 (추가작성자 :한진호)
            >
              게시판
            </Link>
          </nav>

          {isLoggedIn ? (
            <div className={styles.userArea}>
              {/*프로필 이미지를 헤더 부분에 업데이트  */}
              <button
                type="button"
                className={styles.profileCircle}
                onClick={() => {
                  handleCloseMenu();
                  navigate("/esg/mypage");
                }}
                aria-label="마이페이지로 이동"
              >
                {profileImg ? (
                  <img
                    src={profileImg}
                    alt="프로필"
                    className={styles.profileImg}
                  />
                ) : (
                  <span className={styles.profileLetter}>
                    {(nickname || loginId || "U").charAt(0)}
                  </span>
                )}
              </button>

              <span className={styles.nickname}>{nickname || loginId}</span>

              <button
                type="button"
                className={styles.logoutButton}
                onClick={() => {
                  handleCloseMenu();
                  confirmLogout();
                }}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className={styles.auth}>
              <Link to="/" className={styles.login} onClick={handleCloseMenu}>
                로그인
              </Link>

              <Link
                to="/users/join"
                className={styles.join}
                onClick={handleCloseMenu}
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
