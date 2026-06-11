import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../authstore/useAuthStore";
import { useEffect, useState } from "react";
import Pagination from "../components/post/Pagination";
import { toast } from "react-hot-toast";
import PostCard from "../components/post/PostCard";
import usePostStore from "../utils/usePostStore";
import axios from "axios";
import styles from "./PostPage.module.css";
import EditIcon from "@mui/icons-material/Edit";

//게시글 목록보기 페이지 담당자:한진호

const PostPage = () => {
  const navigate = useNavigate();
  const { userId, role } = useAuthStore();

  //목록페이지에 필요한 값들을 ZUSTAND를 이용해 전역에서 저장하고 관리
  const {
    savedPage,
    savedStatus,
    savedOrder,
    savedSearchType,
    savedSearchKeyword,
    setPostState,
  } = usePostStore();

  //게시글 리스트용 스테이트
  const [postList, setPostList] = useState([]);
  const [noticeList, setNoticeList] = useState([]);

  //페이지네이션용
  const [totalPage, setTotalPage] = useState(null);
  const [naviSize, setNaviSize] = useState(10);

  //화면표현용 스테이트
  const [type, setType] = useState(savedSearchType ?? ""); //1.제목 2.내용 3.제목+내용 4.작성자
  const [keyword, setKeyword] = useState(savedSearchKeyword || "");
  const canManagePostStatus =
    userId && role && (role === "admin" || role === "master");

  //검색 SQL injection 방어
  const inputChange = (e) => {
    const inputValue = e.target.value;
    const sanitizedValue = inputValue.replace(/[`'"<>\\;]/g, "");

    if (inputValue !== sanitizedValue) {
      toast.dismiss();
      toast("해당 특수문자는 입력할 수 없습니다.", {
        duration: 2000, // 2초 동안 노출
        position: "bottom-center", // 하단 중앙 배치
        style: {
          border: "1px solid var(--bun)",
          padding: "12px 16px",
          background: "var(--patty)",
          color: "var(--ivory)",
          borderRadius: "8px",
        },
      });
    }

    setKeyword(sanitizedValue);
  };

  useEffect(() => {
    const requestStatus =
      savedStatus === "" || !savedStatus ? "active" : savedStatus;
    const requestType =
      savedSearchType === "" || !savedSearchType ? 1 : savedSearchType;
    const requestOrder = savedOrder === "" || !savedOrder ? 1 : savedOrder;
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/posts?page=${savedPage}&naviSize=${naviSize}&status=${requestStatus}&order=${requestOrder}&searchType=${requestType}&searchKeyword=${savedSearchKeyword}`,
      )
      .then((res) => {
        setPostList(res.data.data.posts);
        setNoticeList(res.data.data.notices);
        setTotalPage(res.data.data.totalPage);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }, [savedPage, savedStatus, savedOrder, savedSearchType, savedSearchKeyword]);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span>Community Board</span>
          <h1>게시판</h1>
          <p>메뉴 추천, 서비스 이용 팁, 팀 공지까지 한곳에서 확인해보세요.</p>
        </div>
      </section>

      <section className={styles.boardPanel}>
        <form
          className={styles.searchForm}
          onSubmit={(e) => {
            e.preventDefault();
            setPostState({
              savedSearchType: type,
              savedSearchKeyword: keyword,
              savedPage: 0,
            });
          }}
        >
          <div
            className={
              canManagePostStatus
                ? `${styles.filterBar} ${styles.adminFilterBar}`
                : styles.filterBar
            }
          >
            <select
              className={styles.select}
              value={type} //
              onChange={(e) => {
                setType(Number(e.target.value));
              }}
            >
              <option value="" disabled hidden>
                검색방법
              </option>
              <option value="1">제목</option>
              <option value="2">내용</option>
              <option value="3">제목+내용</option>
              <option value="4">작성자</option>
            </select>

            {/* 관리자 전용 셀렉트 필드 */}

            {canManagePostStatus && (
              <select
                className={styles.select}
                value={savedStatus}
                onChange={(e) => {
                  setPostState({
                    savedStatus: e.target.value,
                    savedPage: 0,
                  });
                }}
              >
                <option value="" disabled hidden>
                  글상태
                </option>
                <option value={"active"}>정상</option>
                <option value={"hidden"}>숨김</option>
                <option value={"deleted"}>삭제</option>
              </select>
            )}

            <input
              className={styles.searchInput}
              type="text"
              placeholder="검색어를 입력하세요"
              value={keyword}
              onChange={inputChange}
            ></input>
            <button type="submit" className={styles.searchButton}>
              <span className="material-symbols-outlined">search</span>
              검색
            </button>
            <select
              className={styles.select}
              value={savedOrder}
              onChange={(e) => {
                setPostState({
                  savedOrder: Number(e.target.value),
                  savedPage: 0,
                });
              }}
            >
              <option value="" disabled hidden>
                정렬
              </option>
              <option value={1}>최신순</option>
              <option value={2}>작성순</option>
              <option value={3}>조회수</option>
              <option value={4}>좋아요</option>
            </select>
          </div>
        </form>

        <div className={styles.listHeader}>
          <div>
            <span>Board List</span>
            <h2>게시글 목록</h2>
          </div>

          {userId && (
            <Link to="/esg/post/write" className={styles.writeButton}>
              <EditIcon className={styles.buttonIcon} />
              글작성
            </Link>
          )}
        </div>

        <div className={styles.postList}>
          {/* 공지사항 필드*/}
          {noticeList &&
            noticeList.length > 0 &&
            noticeList.map((notice) => (
              <PostCard
                key={"notice-" + notice.postId}
                post={notice}
                isNotice={true}
              />
            ))}

          {/* 일반게시글 필드*/}
          {postList && postList.length > 0
            ? postList.map((post) => (
                <PostCard
                  key={post.postId}
                  post={post}
                  isNotice={false} // 일반 글은 false
                />
              ))
            : (!postList || postList.length === 0) && (
                <div className={styles.emptyState}>
                  <span className="material-symbols-outlined">forum</span>
                  <strong>등록된 게시글이 없습니다</strong>
                  <p>첫 게시글을 작성해서 이야기를 시작해보세요.</p>
                </div>
              )}
        </div>
      </section>

      {/* 페이지네이션 필드 */}
      <div className={styles.paginationArea}>
        <Pagination
          page={savedPage}
          setPage={(nextPage) => {
            setPostState({ savedPage: nextPage });
          }}
          totalPage={totalPage}
          naviSize={naviSize}
        />
      </div>
    </main>
  );
};

export default PostPage;
