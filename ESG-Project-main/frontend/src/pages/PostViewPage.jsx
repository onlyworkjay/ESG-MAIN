import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../authstore/useAuthStore";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import checkImage from "../assets/check.png";
import infoImage from "../assets/info.png";
import questionImage from "../assets/question.png";
import warningImage from "../assets/warning.png";
import successImage from "../assets/success.png";
import axios from "axios";
import styles from "./PostViewPage.module.css";
import EditIcon from "@mui/icons-material/Edit";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Profile from "../components/profile/Profile";

//게시글 상세보기 페이지 담당자:한진호
const PostViewPage = () => {
  const navigate = useNavigate();
  const { userId, isReady, token } = useAuthStore();
  const params = useParams();
  const postId = params.postId;
  const [post, setPost] = useState({});
  const [like, setLike] = useState(false);
  const [report, setReport] = useState(false);

  // 💡 [수정] 프로필 모달의 On/Off 상태를 관리하는 State를 추가합니다.
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/posts/${postId}`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.result === true) {
          setPost(res.data.data);
          setLike(res.data.like);
          setReport(res.data.report);
        } else {
          navigate("/404", { replace: true });
        }
      })
      .catch((err) => {
        console.error(err.message);
      });
  }, [postId, isReady, token]);

  if (!post || !post.postId) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingBox}>포스트를 불러오는 중입니다...</div>
      </main>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const modifyBtn = () => {
    Swal.fire({
      title: "글수정",
      text: "글수정 페이지로 이동하시겠어요?",
      imageUrl: questionImage,
      imageWidth: 120,
      imageHeight: 120,
      imageAlt: "물음표 아이콘",
      confirmButtonText: "이동",
      confirmButtonColor: "var(--bun)",
      showCancelButton: true,
      cancelButtonText: "취소",
      cancelButtonColor: "var(--tomato)",
      background: "var(--patty)",
      color: "var(--ivory)",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/esg/post/modify/${postId}`);
      }
    });
  };

  const deleteBtn = () => {
    Swal.fire({
      title: "글삭제",
      text: "작성한 글을 삭제하시겠어요?",
      imageUrl: warningImage,
      imageWidth: 120,
      imageHeight: 120,
      imageAlt: "물음표 아이콘",
      confirmButtonText: "삭제",
      confirmButtonColor: "var(--bun)",
      showCancelButton: true,
      cancelButtonText: "취소",
      cancelButtonColor: "var(--tomato)",
      background: "var(--patty)",
      color: "var(--ivory)",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${import.meta.env.VITE_BACKSERVER}/posts/${postId}`)
          .then((res) => {
            if (res.data.result === true) {
              Swal.fire({
                title: "삭제결과",
                text: "게시물이 삭제되었어요.",
                imageUrl: successImage,
                imageWidth: 120,
                imageHeight: 120,
                imageAlt: "글삭제 완료 아이콘",
                confirmButtonText: "확인",
                confirmButtonColor: "var(--bun)",
                background: "var(--patty)",
                color: "var(--ivory)",
              });
              navigate("/esg/post");
            }
          })
          .catch((err) => {
            console.error(err.message);
          });
      }
    });
  };

  const likeOnBtn = () => {
    const previousLike = like;
    const previousLikeCount = post.likeCount ?? 0;
    setLike(true);
    setPost((prev) => ({
      ...prev,
      likeCount: (prev.likeCount ?? 0) + 1,
    }));
    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/posts/${postId}/likes`)
      .then((res) => {
        if (res.data.result !== true) {
          setLike(previousLike);
          setPost((prev) => ({ ...prev, likeCount: previousLikeCount }));
        }
      })
      .catch((err) => {
        console.error(err.message);
        setLike(previousLike);
        setPost((prev) => ({ ...prev, likeCount: previousLikeCount }));
      });
  };

  const likeOffBtn = () => {
    const previousLike = like;
    const previousLikeCount = post.likeCount ?? 0;
    setLike(false);
    setPost((prev) => ({
      ...prev,
      likeCount: Math.max((prev.likeCount ?? 0) - 1, 0),
    }));
    axios
      .delete(`${import.meta.env.VITE_BACKSERVER}/posts/${postId}/likes`)
      .then((res) => {
        if (res.data.result !== true) {
          setLike(previousLike);
          setPost((prev) => ({ ...prev, likeCount: previousLikeCount }));
        }
      })
      .catch((err) => {
        console.error(err.message);
        setLike(previousLike);
        setPost((prev) => ({ ...prev, likeCount: previousLikeCount }));
      });
  };

  const reportOnBtn = () => {
    Swal.fire({
      title: "게시글 신고",
      text: "신고 사유를 상세히 적어주세요.",
      input: "textarea",
      inputPlaceholder: "여기에 신고 사유를 입력하세요 (최대 200자)",
      inputAttributes: {
        maxlength: "200",
        autocapitalize: "off",
        autorrect: "off",
      },
      confirmButtonText: "신고 제출",
      confirmButtonColor: "var(--bun)",
      showCancelButton: true,
      cancelButtonText: "취소",
      cancelButtonColor: "var(--tomato)",
      background: "var(--patty)",
      color: "var(--ivory)",
      preConfirm: (inputValue) => {
        if (!inputValue || inputValue.trim() === "") {
          Swal.showValidationMessage("신고 사유를 반드시 입력하셔야 합니다!");
        }
        return inputValue;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const param = { reason: result.value };
        axios
          .post(
            `${import.meta.env.VITE_BACKSERVER}/posts/${postId}/reports`,
            param,
          )
          .then((res) => {
            if (res.data.result === true) {
              setReport(true);
              Swal.fire({
                title: "신고 접수 완료",
                text: "정상적으로 신고가 접수되었습니다.",
                imageUrl: successImage,
                imageWidth: 120,
                imageHeight: 120,
                imageAlt: "완료 아이콘",
                confirmButtonText: "닫기",
                confirmButtonColor: "var(--bun)",
                background: "var(--patty)",
                color: "var(--ivory)",
              });
            }
          })
          .catch((err) => {
            console.error(err.message);
          });
      }
    });
  };

  const reportOffBtn = () => {
    axios
      .delete(`${import.meta.env.VITE_BACKSERVER}/posts/${postId}/reports`)
      .then((res) => {
        if (res.data.result === true) {
          setReport(false);
          Swal.fire({
            title: "신고 취소 완료",
            text: "정상적으로 신고가 취소되었습니다.",
            imageUrl: successImage,
            imageWidth: 120,
            imageHeight: 120,
            imageAlt: "신고취소 아이콘",
            confirmButtonText: "닫기",
            confirmButtonColor: "var(--bun)",
            background: "var(--patty)",
            color: "var(--ivory)",
          });
        }
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  const reportGetBtn = () => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/posts/${postId}/reports`)
      .then((res) => {
        if (res.data.result === true) {
          if (res.data.data === null) {
            setReport(false);
            Swal.fire({
              title: "안내",
              text: "이 게시글에 접수된 신고 내역이 없습니다.",
              imageUrl: infoImage,
              imageWidth: 120,
              imageHeight: 120,
              imageAlt: "안내 아이콘",
              confirmButtonColor: "var(--bun)",
              background: "var(--patty)",
              color: "var(--ivory)",
            });
          } else {
            const reportData = res.data.data;
            const formattedCreatedAt = formatDate(reportData.createdAt);
            const formattedCompletedAt = formatDate(reportData.completedAt);
            const statusMap = {
              pending: "⏳ 접수 대기 중",
              rejected: "❌ 반려됨",
              resolved: "✅ 처리 완료",
            };
            const currentStatus =
              statusMap[reportData.status] || reportData.status;

            Swal.fire({
              title: "🚨 내가 제출한 신고 내역",
              html: `
              <div style="text-align: left; line-height: 1.8; font-size: 15px;">
                <p><strong>• 처리 상태 :</strong> <span style="color: #ffc107; font-weight: bold;">${currentStatus}</span></p>
                <p><strong>• 신고 일시 :</strong> ${formattedCreatedAt}</p>
                ${reportData.completedAt ? `<p><strong>• 처리 일시 :</strong> ${formattedCompletedAt}</p>` : ""}
                ${
                  reportData.adminNote
                    ? `
                  <p><strong>• 관리자 답변 :</strong></p>
                  <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 6px; margin-bottom: 10px; font-style: italic;">
                    ${reportData.adminNote}
                  </div>
                `
                    : ""
                }
                <hr style="border: 0; border-top: 1px solid #555; margin: 15px 0;">
                <p><strong>• 신고 사유 :</strong></p>
                <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px; white-space: pre-wrap; word-break: break-all;">${reportData.reason}</div>
              </div>
            `,
              imageUrl: infoImage,
              imageWidth: 120,
              imageHeight: 120,
              imageAlt: "신고 내역 아이콘",
              showCancelButton: reportData.status === "pending",
              confirmButtonText: "닫기",
              confirmButtonColor: "var(--bun)",
              cancelButtonText: "신고 취소하기",
              cancelButtonColor: "var(--tomato)",
              background: "var(--patty)",
              color: "var(--ivory)",
            }).then((result) => {
              if (result.dismiss === Swal.DismissReason.cancel) {
                reportOffBtn();
              }
            });
          }
        }
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  const statusConfig = {
    hidden: { text: "숨김", className: styles.hiddenBadge },
    deleted: { text: "삭제", className: styles.deletedBadge },
  };
  const currentStatus = post.status ? statusConfig[post.status] : null;
  const isOwner = userId && post.userId && userId === post.userId;
  const canReact = userId && post.userId && userId !== post.userId;

  return (
    <main className={styles.page}>
      <article className={styles.postShell}>
        <header className={styles.postHeader}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/esg/post")}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            목록으로
          </button>

          <div className={styles.badgeRow}>
            {post.isNotice === 1 && (
              <span className={styles.noticeBadge}>
                <span className="material-symbols-outlined">campaign</span>
                공지
              </span>
            )}

            {currentStatus && post.status !== "active" && (
              <span className={currentStatus.className}>
                {currentStatus.text}
              </span>
            )}
          </div>

          <h1>{post.title}</h1>

          <div className={styles.metaGrid}>
            {/* 💡 [수정] 작성자 영역 클릭 시 프로필 모달 오픈 추가 (pointer 커서 인라인 부여) */}
            <span
              onClick={() => setIsProfileModalOpen(true)}
              style={{ cursor: "pointer" }}
              title="작성자 프로필 보기"
            >
              <span className="material-symbols-outlined">person</span>
              작성자{" "}
              <strong style={{ textDecoration: "underline" }}>
                {post.writer}
              </strong>
            </span>
            <span>
              <span className="material-symbols-outlined">visibility</span>
              조회수 <strong>{post.viewCount}</strong>
            </span>
            <span>
              <FavoriteIcon className={styles.metaIcon} />
              좋아요 <strong>{post.likeCount ?? 0}</strong>
            </span>
          </div>

          <div className={styles.dateRow}>
            <span>작성일 {formatDate(post.createdAt)}</span>
            {post.updatedAt && <span>수정일 {formatDate(post.updatedAt)}</span>}
            {post.deletedAt && (
              <span className={styles.deletedDate}>
                삭제일 {formatDate(post.deletedAt)}
              </span>
            )}
          </div>
        </header>

        <section className={styles.contentSection}>{post.content}</section>

        {post.s3keys && post.s3keys.length > 0 && (
          <section className={styles.imageSection}>
            <div className={styles.sectionTitle}>
              <span className="material-symbols-outlined">image</span>
              첨부 이미지 ({post.s3keys.length})
            </div>

            <div className={styles.imageList}>
              {post.s3keys.map((url, index) => (
                <img
                  key={url}
                  src={url}
                  alt={`첨부 이미지 ${index + 1}`}
                  className={styles.postImage}
                />
              ))}
            </div>
          </section>
        )}

        <footer className={styles.actionFooter}>
          {canReact && (
            <div className={styles.userActions}>
              <button
                type="button"
                className={
                  like
                    ? `${styles.heartButton} ${styles.heartButtonActive}`
                    : styles.heartButton
                }
                onClick={like ? likeOffBtn : likeOnBtn}
                aria-label={like ? "좋아요 취소" : "좋아요"}
                title={like ? "좋아요 취소" : "좋아요"}
              >
                {like ? (
                  <FavoriteIcon className={styles.heartIcon} />
                ) : (
                  <FavoriteBorderIcon className={styles.heartIcon} />
                )}
              </button>

              <button
                type="button"
                className={report ? styles.mutedButton : styles.reportButton}
                onClick={report ? reportGetBtn : reportOnBtn}
              >
                <span className="material-symbols-outlined">
                  {report ? "manage_search" : "flag"}
                </span>
                {report ? "신고확인" : "신고하기"}
              </button>
            </div>
          )}

          {isOwner && (
            <div className={styles.ownerActions}>
              <button
                type="button"
                className={styles.modifyButton}
                onClick={modifyBtn}
              >
                <EditIcon className={styles.buttonIcon} />
                수정
              </button>
              <button
                type="button"
                className={styles.deleteButton}
                onClick={deleteBtn}
              >
                <span className="material-symbols-outlined">delete</span>
                삭제
              </button>
            </div>
          )}
        </footer>
      </article>

      {/* 💡 [수정] 컴포넌트 하단 오버레이 형태의 프로필 라이브 모달 실장 */}
      {isProfileModalOpen && post.userId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)", // 오버레이 뒷배경 어둡게
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999, // 네비게이션바 등 타 요소 다 덮음
          }}
          onClick={() => setIsProfileModalOpen(false)} // 여백 클릭시 자동 닫기 기능
        >
          <div
            style={{
              position: "relative",
              backgroundColor: "rgba(23, 13, 6, 0.95)", // 기존 Profile 카드 색감 계열 매칭
              border: "1px solid rgba(231, 181, 106, 0.3)",
              padding: "50px 24px 24px 24px",
              borderRadius: "16px",
              boxShadow: "0px 10px 40px rgba(0,0,0,0.6)",
              maxWidth: "850px", // 테이블 목록들이 한 줄에 다 보일 수 있도록 확장
              width: "90%",
              maxHeight: "85vh", // 화면 위아래 오버플로우 방지
              overflowY: "auto", // 모달 내부 스크롤 허용
            }}
            onClick={(e) => e.stopPropagation()} // 모달 본체 클릭 시 오버레이 전파 방지
          >
            {/* 상단 우측 닫기(X) 버튼 */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "var(--bun, #e7b56a)",
                fontWeight: "bold",
              }}
            >
              ✕
            </button>

            {/* 패치된 Profile 컴포넌트에 userId 전달 주입 */}
            <Profile
              targetId={post.userId}
              onClose={() => setIsProfileModalOpen(false)}
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default PostViewPage;
