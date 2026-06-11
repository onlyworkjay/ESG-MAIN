import { Link } from "react-router-dom";
import styles from "./Footer.module.css";
import useAuthStore from "../../authstore/useAuthStore";
import burgerFavicon from "../../assets/esg_burger_favicon1.svg";

const Footer = () => {
  const token = useAuthStore((state) => state.token);
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={`${styles.top} ${token ? styles.topWithMyPage : ""}`}>
          <div>
            <div className={styles.logoArea}>
              <img
                src={burgerFavicon}
                alt=""
                className={styles.logoIcon}
                aria-hidden="true"
              />
              <div className={styles.logoText}>ESG</div>
            </div>

            <p className={styles.desc}>
              다양한 브랜드의 버거 메뉴를 한눈에 비교하고,
              <br />
              오늘 뭐 먹을지 고민을 해결해드립니다.
            </p>
          </div>

          <div>
            <h3 className={styles.title}>서비스</h3>
            <ul className={styles.list}>
              <li>
                <Link to="/esg/eat">메뉴 탐색</Link>
              </li>
              <li>
                <Link to="/esg/stat">비교하기</Link>
              </li>
              <li>
                <Link to="/esg/random">랜덤 추첨</Link>
              </li>
              <li>
                <Link to="/esg/gram">후기 보기</Link>
              </li>
              <li>
                <Link to="/esg/post">게시판</Link>
              </li>
            </ul>
          </div>

          {!token && (
            <div>
              <h3 className={styles.title}>계정</h3>

              <ul className={styles.list}>
                <li>
                  <Link to="/">로그인</Link>
                </li>

                <li>
                  <Link to="/users/join">회원가입</Link>
                </li>
              </ul>
            </div>
          )}

          {token && (
            <div>
              <h3 className={styles.title}>마이페이지</h3>

              <ul className={styles.list}>
                <li>
                  <Link to="/esg/mypage?tab=info">회원정보</Link>
                </li>
                <li>
                  <Link to="/esg/mypage?tab=recentChoice">최근 선택 메뉴</Link>
                </li>
                <li>
                  <Link to="/esg/mypage?tab=myPosts">나의 게시글</Link>
                </li>
                <li>
                  <Link to="/esg/mypage?tab=myReviews">내가 작성한 후기</Link>
                </li>
                <li>
                  <Link to="/esg/mypage?tab=suggestions">제보 내역</Link>
                </li>
                <li>
                  <Link to="/esg/mypage?tab=reports">신고 내역</Link>
                </li>
                <li>
                  <Link to="/esg/mypage?tab=activity">메뉴 즐겨찾기</Link>
                </li>

                <li>
                  <Link to="/esg/mypage?tab=userFavorite">회원 즐겨찾기</Link>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className={styles.bottom}>
          <p>© 2026 ESG — Eat · Search · Gather. All rights reserved.</p>
          <p>Mock 데이터 기반 프로토타입</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
