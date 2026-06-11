import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Pagination from "../ui/Pagination";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../authstore/useAuthStore";
import styles from "./Admin.module.css"; // ← CSS 모듈 임포트
import Profile from "../profile/Profile";

const AdminMemberInfo = () => {
  const [targetId, setTargetId] = useState(null);
  const [userList, setUserList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState();
  const [searchMember, setSearchMember] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [formBool, setFormBool] = useState(false);
  const [userFilter, setUserFilter] = useState(4);
  const [orderBy, setOrderBy] = useState(2);
  const [searchFilter, setSearchFilter] = useState(1);
  const navigate = useNavigate();
  const { loginId } = useAuthStore();

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/admin/selectUsers?page=${page}&searchMember=${searchInput}&userFilter=${userFilter}&orderBy=${orderBy}&searchFilter=${searchFilter}`,
      )
      .then((res) => {
        setUserList([...res.data.Users]);
        setTotalPage(res.data.totalPage);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [page, formBool, userFilter, orderBy]);

  return (
    loginId &&
    userList && (
      <div className={styles.AdminWrapperInfo}>
        {/* 제목 */}
        <h1 className={styles.title}>멤버 정보</h1>

        {/* 검색 · 필터 툴바 */}
        <div className={styles.toolbar}>
          <form
            className={styles.searchForm}
            onSubmit={(e) => {
              e.preventDefault();
              setFormBool(!formBool);
              setSearchInput(searchMember);
            }}
          >
            <input
              className={styles.searchInput}
              placeholder="검색어 입력"
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
            />
            <button className={styles.searchBtn} type="submit">
              검색
            </button>

            <select
              className={styles.selectBox}
              onChange={(e) => setSearchFilter(e.target.value)}
            >
              <option value={1}>아이디</option>
              <option value={2}>닉네임</option>
            </select>
            {/* <button
              type="button"
              onClick={() => {
                setSearchMember("");
                setSearchInput("");
                setSearchFilter(1);
                setUserFilter("");
                setOrderBy("");
                setPage(1);
              }}
            >
              초기화
            </button> */}
          </form>
          <div>
            <select
              className={styles.selectBox}
              onChange={(e) => setUserFilter(e.target.value)}
            >
              <option value={4}>모두</option>
              <option value={1}>활동가능</option>
              <option value={2}>정지</option>
              <option value={3}>탈퇴</option>
            </select>

            <select
              className={styles.selectBox}
              onChange={(e) => setOrderBy(e.target.value)}
            >
              <option value={1}>가입순</option>
              <option value={2}>최신순</option>
            </select>
          </div>
        </div>

        {/* 리스트 */}
        <div className={styles.listWrapper}>
          {/* 헤더 행 */}
          <div className={styles.headerRow}>
            <span>로그인 아이디</span>
            <span>닉네임</span>
            <span>이메일</span>
            <span>상태</span>
            <span>정지이유</span>
            <span>가입일</span>
            <span>수정일</span>
            <span>삭제일</span>
          </div>

          {/* 데이터 행 */}
          {userList.length === 0 ? (
            <p className={styles.emptyMsg}>검색 결과가 없습니다.</p>
          ) : (
            userList.map((user) => (
              <div
                key={user.loginId}
                className={styles.dataRow}
                onClick={() => setTargetId(user.userId)}
              >
                <span>{user.loginId}</span>
                <span>{user.nickname}</span>
                <span>{user.email}</span>
                <span>
                  <em
                    className={styles.statusBadge}
                    data-user-status={user.status}
                  >
                    {user.status === "active"
                      ? "활동중"
                      : user.status === "suspended"
                        ? "정지"
                        : "탈퇴"}
                  </em>
                </span>
                <span>
                  {user.suspensionReason ? (
                    <button
                      className={styles.reasonBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        Swal.fire({
                          text: `${user.suspensionReason}`,
                          showConfirmButton: false,
                        });
                      }}
                    >
                      정지이유
                    </button>
                  ) : (
                    <p className={styles.noReason}>사유없음</p>
                  )}
                </span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                <span>
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString()
                    : "업데이트 없음"}
                </span>
                <span>
                  {user.deletedAt
                    ? new Date(user.deletedAt).toLocaleDateString()
                    : "활동중"}
                </span>
              </div>
            ))
          )}
        </div>
        {targetId && (
          <div
            className={styles.modalOverlay}
            onClick={() => setTargetId(null)}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              {/* <h1 style={{ color: "red" }}>모달 테스트</h1> */}

              <button
                className={styles.closeBtn}
                onClick={() => setTargetId(null)}
              >
                ✕
              </button>

              <Profile targetId={targetId} onClose={() => setTargetId(null)} />
            </div>
          </div>
        )}
        {/* 페이지네이션 - CSS 건드리지 않고 간격만 */}
        {totalPage !== 1 && totalPage !== 0 && (
          <div className={styles.paginationWrapper}>
            <Pagination
              page={page}
              setPage={setPage}
              totalPage={totalPage}
              naviSize={5}
            />
          </div>
        )}
      </div>
    )
  );
};

export default AdminMemberInfo;
