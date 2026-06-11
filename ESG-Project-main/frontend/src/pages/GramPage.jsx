/* 구현 담당자 : 장지혁 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import styles from "./GramPage.module.css";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import axios from "axios";
import Swal from "sweetalert2";
import useAuthStore from "../authstore/useAuthStore";

import Profile from "../components/profile/Profile";

import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ChatBubbleOutlineIcon from "@mui/icons-material/CommentOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import questionImage from "../assets/question.png";
import infoImage from "../assets/info.png";
import defaultImg from "../assets/burger/default.png";
import warningImage from "../assets/warning.png";

/* 정렬 */
const SORT_OPTIONS = [
  { value: "title", label: "제목" },
  { value: "content", label: "내용" },
  { value: "user_id", label: "작성자" },
];

/* 스크롤 바닥 시 추가 로드 단위 */
const ITEMS_PER_PAGE = 15;

/* 타이머 총 시간 = 10초 */
const TOTAL = 10;

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr + "Z");
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const datePart = kst.toISOString().split("T")[0];
  const timePart = kst.toISOString().split("T")[1].split(".")[0];
  return `${datePart} ${timePart}`;
};

/* 남은 시간에 따라 초록 → 빨강으로 색상 전환 */
const getTimerColor = (remaining) => {
  const ratio = remaining / TOTAL;
  const hue = Math.round(ratio * 120);
  return `hsl(${hue}, 90%, 50%)`;
};

/* 초침이 부드럽게 움직이는 SVG 시계 */
const ClockSVG = ({ remaining, color }) => {
  const elapsed = TOTAL - remaining;
  const deg = elapsed * 36 - 90;
  const rad = (deg * Math.PI) / 180;
  const cx = 12,
    cy = 12,
    r = 8;
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);
  const circumference = 2 * Math.PI * 8;
  const dashOffset = circumference * (remaining / TOTAL);

  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      style={{
        filter: `drop-shadow(0 0 5px ${color})`,
        transition: "filter 1s ease",
        flexShrink: 0,
      }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        style={{ transition: "stroke 1s ease" }}
      />
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform="rotate(-90 12 12)"
        style={{ transition: "stroke-dashoffset 1s linear, stroke 1s ease" }}
      />
      <line
        x1="12"
        y1="2.5"
        x2="12"
        y2="4"
        stroke={color}
        strokeWidth="1.2"
        style={{ transition: "stroke 1s ease" }}
      />
      <line
        x1="12"
        y1="20"
        x2="12"
        y2="21.5"
        stroke={color}
        strokeWidth="1.2"
        style={{ transition: "stroke 1s ease" }}
      />
      <line
        x1="2.5"
        y1="12"
        x2="4"
        y2="12"
        stroke={color}
        strokeWidth="1.2"
        style={{ transition: "stroke 1s ease" }}
      />
      <line
        x1="20"
        y1="12"
        x2="21.5"
        y2="12"
        stroke={color}
        strokeWidth="1.2"
        style={{ transition: "stroke 1s ease" }}
      />
      <circle
        cx="12"
        cy="12"
        r="1.2"
        fill={color}
        style={{ transition: "fill 1s ease" }}
      />
      <line
        x1="12"
        y1="12"
        x2={x}
        y2={y}
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        style={{ transition: "x2 1s linear, y2 1s linear, stroke 1s ease" }}
      />
    </svg>
  );
};

/* ───────────────────────────────────────────────
   카드 컴포넌트
─────────────────────────────────────────────── */
const GramCard = ({ gram }) => {
  const [contentExpanded, setContentExpanded] = useState(false);
  const [imagesExpanded, setImagesExpanded] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentList, setCommentList] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editCommentNo, setEditCommentNo] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [replyTargetNo, setReplyTargetNo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [openReplies, setOpenReplies] = useState({});
  const [orderType, setOrderType] = useState("oldest");

  const [liked, setLiked] = useState(gram.liked ?? false);
  const [likeCount, setLikeCount] = useState(gram.likeCount ?? 0);
  const [reported, setReported] = useState(gram.reported ?? false);

  // ── 프로필 모달 state ──
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // ── writerId 없으면 userId로 fallback ──
  const profileTargetId = gram.writerId ?? gram.userId ?? null;

  const { userId: memberId, profileImg: memberThumb } = useAuthStore();

  // ── 프로필 모달 열기 함수 (이미지, 닉네임 공통 사용) ──
  const openProfile = () => {
    if (profileTargetId) setIsProfileModalOpen(true);
  };

  /* ───────────── 좋아요 ───────────── */
  const handleLike = () => {
    if (!memberId) return;

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : prev - 1));

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/grams/${gram.gramId}/like`, {
        userId: memberId,
      })
      .catch(() => {
        setLiked(!nextLiked);
        setLikeCount((prev) => (nextLiked ? prev - 1 : prev + 1));
      });
  };

  /* ───────────── 신고하기 ───────────── */
  const handleReport = () => {
    if (reported) {
      Swal.fire({
        title: "이미 신고한 후기입니다.",
        text: "동일한 후기는 한 번만 신고할 수 있습니다.",
        imageUrl: warningImage,
        imageWidth: 100,
        imageHeight: 100,
        imageAlt: "경고 아이콘",
        confirmButtonText: "확인",
        confirmButtonColor: "var(--bun)",
        background: "var(--patty)",
        color: "var(--ivory)",
      });
      return;
    }

    let reportContent = "";

    Swal.fire({
      title: "신고하기",
      html: `
        <textarea
          id="report-textarea"
          maxlength="500"
          placeholder="신고 사유를 입력해주세요."
          style="
            width: 100%;
            min-height: 120px;
            padding: 10px 14px;
            border: 1px solid rgba(231,181,106,0.24);
            border-radius: 8px;
            background: rgba(0,0,0,0.18);
            color: var(--ivory);
            font-size: 14px;
            line-height: 1.5;
            resize: none;
            outline: none;
            box-sizing: border-box;
            font-family: inherit;
          "
        ></textarea>
        <div id="report-counter" style="
          text-align: right;
          font-size: 12px;
          font-weight: bold;
          color: rgba(255,248,236,0.54);
          margin-top: 6px;
          transition: color 0.2s;
        ">0 / 500</div>
      `,
      didOpen: () => {
        const textarea = document.getElementById("report-textarea");
        const counter = document.getElementById("report-counter");

        textarea.addEventListener("input", () => {
          reportContent = textarea.value;
          const len = textarea.value.length;
          counter.textContent = `${len} / 500`;
          counter.style.color =
            len >= 500 ? "var(--tomato)" : "rgba(255,248,236,0.54)";
        });
      },
      preConfirm: () => {
        const val = document.getElementById("report-textarea").value.trim();
        if (!val) {
          Swal.showValidationMessage("신고 사유를 입력해주세요.");
          return false;
        }
        reportContent = val;
        return val;
      },
      showCancelButton: true,
      confirmButtonText: "신고하기",
      cancelButtonText: "취소",
      confirmButtonColor: "rgba(100,100,100,0.6)",
      cancelButtonColor: "var(--tomato)",
      background: "var(--patty)",
      color: "var(--ivory)",
      imageUrl: warningImage,
      imageWidth: 80,
      imageHeight: 80,
      imageAlt: "신고 아이콘",
    }).then((result) => {
      if (
        result.isDismissed &&
        result.dismiss === Swal.DismissReason.cancel &&
        reportContent.trim().length > 0
      ) {
        Swal.fire({
          title: "신고를 취소하시겠습니까?",
          text: "작성한 신고 내용이 사라집니다.",
          imageUrl: questionImage,
          imageWidth: 100,
          imageHeight: 100,
          imageAlt: "물음 아이콘",
          showCancelButton: true,
          confirmButtonText: "네, 취소합니다",
          cancelButtonText: "돌아가기",
          confirmButtonColor: "var(--green)",
          cancelButtonColor: "var(--tomato)",
          background: "var(--patty)",
          color: "var(--ivory)",
        });
        return;
      }

      if (result.isConfirmed && result.value) {
        const confirmedReason = result.value;

        Swal.fire({
          title: "정말 신고하시겠습니까?",
          text: "신고 후에는 취소할 수 없습니다.",
          imageUrl: questionImage,
          imageWidth: 100,
          imageHeight: 100,
          imageAlt: "물음 아이콘",
          showCancelButton: true,
          confirmButtonText: "네, 신고합니다",
          cancelButtonText: "취소",
          confirmButtonColor: "var(--tomato)",
          cancelButtonColor: "rgba(100,100,100,0.6)",
          background: "var(--patty)",
          color: "var(--ivory)",
        }).then((confirmResult) => {
          if (!confirmResult.isConfirmed) return;

          axios
            .post(
              `${import.meta.env.VITE_BACKSERVER}/grams/${gram.gramId}/report`,
              { userId: memberId, reason: confirmedReason },
            )
            .then(() => {
              setReported(true);
              Swal.fire({
                title: "신고가 접수되었습니다.",
                imageUrl: infoImage,
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: "안내 아이콘",
                confirmButtonText: "확인",
                confirmButtonColor: "var(--bun)",
                background: "var(--patty)",
                color: "var(--ivory)",
              });
            })
            .catch(() => {
              Swal.fire({
                title: "신고 접수에 실패했습니다.",
                text: "잠시 후 다시 시도해주세요.",
                imageUrl: warningImage,
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: "경고 아이콘",
                confirmButtonText: "확인",
                confirmButtonColor: "var(--bun)",
                background: "var(--patty)",
                color: "var(--ivory)",
              });
            });
        });
      }
    });
  };

  /* ───────────── 카드 확장 ───────────── */
  const images = gram.images ?? [];
  const content = gram.content ?? "";
  const hasExpandableContent =
    content.split("\n").length > 2 || content.length > 80;
  const hasMultipleImages = images.length > 1;
  const isCardExpanded = contentExpanded || imagesExpanded;

  const toggleCardExpanded = () => {
    const shouldExpand = !isCardExpanded;
    setContentExpanded(shouldExpand);
    setImagesExpanded(shouldExpand && hasMultipleImages);
  };

  const toggleImagesExpanded = () => {
    if (!hasMultipleImages) return;
    setImagesExpanded((prev) => !prev);
  };

  /* ───────────── 댓글 ───────────── */
  const fetchComments = () => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/grams/${gram.gramId}/comments`)
      .then((res) => setCommentList(res.data ?? []))
      .catch(() => {});
  };

  const openCommentModal = () => {
    fetchComments();
    setIsCommentModalOpen(true);
  };

  const submitComment = () => {
    if (!memberId || newComment.trim() === "") return;
    axios
      .post(
        `${import.meta.env.VITE_BACKSERVER}/grams/${gram.gramId}/comments`,
        { content: newComment, writerId: memberId, parentNo: null },
      )
      .then(() => {
        setNewComment("");
        fetchComments();
      })
      .catch(() => {});
  };

  const handleEditSubmit = (commentNo) => {
    const mentionMatch = editCommentContent.match(/^(@\S+ )/);
    const bodyOnly = mentionMatch
      ? editCommentContent.slice(mentionMatch[0].length)
      : editCommentContent;
    if (bodyOnly.trim() === "") return;
    axios
      .put(
        `${import.meta.env.VITE_BACKSERVER}/grams/${gram.gramId}/comments/${commentNo}`,
        { content: editCommentContent },
      )
      .then(() => {
        setEditCommentNo(null);
        setEditCommentContent("");
        fetchComments();
      })
      .catch(() => {});
  };

  const handleDeleteComment = (commentNo, isReply = false) => {
    Swal.fire({
      title: isReply
        ? "대댓글을 삭제하시겠습니까?"
        : "댓글을 삭제하시겠습니까?",
      imageUrl: questionImage,
      imageWidth: 120,
      imageHeight: 120,
      imageAlt: "물음 아이콘",
      showCancelButton: true,
      confirmButtonText: "네",
      cancelButtonText: "아니오",
      confirmButtonColor: "var(--tomato)",
      cancelButtonColor: "var(--green)",
      background: "var(--patty)",
      color: "var(--ivory)",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(
            `${import.meta.env.VITE_BACKSERVER}/grams/${gram.gramId}/comments/${commentNo}`,
          )
          .then(() => fetchComments())
          .catch(() => {});
      }
    });
  };

  const handleReplySubmit = (parentNo) => {
    if (replyContent.trim() === "") return;
    const parentComment = commentList.find((c) => c.commentNo === parentNo);
    const mentionPrefix = parentComment ? `@${parentComment.writer} ` : "";
    axios
      .post(
        `${import.meta.env.VITE_BACKSERVER}/grams/${gram.gramId}/comments`,
        {
          content: `${mentionPrefix}${replyContent}`,
          writerId: memberId,
          parentNo: parentNo,
        },
      )
      .then(() => {
        setReplyContent("");
        setReplyTargetNo(null);
        setOpenReplies((prev) => ({ ...prev, [parentNo]: true }));
        fetchComments();
      })
      .catch(() => {});
  };

  const toggleReplies = (commentNo) => {
    setOpenReplies((prev) => ({ ...prev, [commentNo]: !prev[commentNo] }));
  };

  const renderModalComments = (parentNo, isReply = false) => {
    const filtered = commentList
      .filter((c) => (c.parentNo ?? null) === parentNo)
      .sort((a, b) =>
        orderType === "latest"
          ? b.commentNo - a.commentNo
          : a.commentNo - b.commentNo,
      );

    return filtered.map((c) => {
      const childComments = commentList.filter(
        (child) => child.parentNo === c.commentNo,
      );
      const getMentionAndBody = (content) => {
        const match = content.match(/^(@\S+ )/);
        return match
          ? { mention: match[0], body: content.slice(match[0].length) }
          : { mention: null, body: content };
      };

      return (
        <div
          key={c.commentNo}
          className={
            isReply ? styles.modal_reply_item : styles.comment_modal_item
          }
        >
          <img
            src={c.profileImg || defaultImg}
            alt="프로필"
            className={styles.comment_modal_profile}
          />
          <div className={styles.comment_modal_body}>
            <span className={styles.comment_modal_writer}>{c.writer}</span>

            {editCommentNo === c.commentNo ? (
              <div className={styles.modal_edit_wrap}>
                {(() => {
                  const { mention } = getMentionAndBody(editCommentContent);
                  return (
                    <>
                      <div className={styles.modal_edit_input_box}>
                        {mention && (
                          <span className={styles.modal_edit_mention}>
                            {mention}
                          </span>
                        )}
                        <textarea
                          className={styles.modal_edit_textarea}
                          value={
                            mention
                              ? editCommentContent.slice(mention.length)
                              : editCommentContent
                          }
                          onChange={(e) => {
                            if (e.target.value.length > 1000) return;
                            setEditCommentContent(
                              mention
                                ? `${mention}${e.target.value}`
                                : e.target.value,
                            );
                          }}
                          placeholder="내용을 입력하세요."
                        />
                      </div>
                      <div className={styles.modal_edit_btns}>
                        <button
                          className={styles.modal_btn_submit}
                          onClick={() => handleEditSubmit(c.commentNo)}
                        >
                          수정하기
                        </button>
                        <button
                          className={styles.modal_btn_cancel}
                          onClick={() => {
                            setEditCommentNo(null);
                            setEditCommentContent("");
                          }}
                        >
                          취소
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <p className={styles.comment_modal_content}>
                {c.content.split(/(@\S+)/).map((part, idx) =>
                  part.startsWith("@") ? (
                    <span
                      key={idx}
                      style={{ color: "var(--green)", fontWeight: "bold" }}
                    >
                      {part}
                    </span>
                  ) : (
                    part
                  ),
                )}
              </p>
            )}

            <span className={styles.comment_modal_date}>
              {formatDate(c.createdAt)}
            </span>

            {editCommentNo !== c.commentNo && (
              <div className={styles.modal_comment_actions}>
                {memberId && replyTargetNo !== c.commentNo && (
                  <button
                    className={styles.modal_reply_btn}
                    onClick={() => setReplyTargetNo(c.commentNo)}
                  >
                    답글달기
                  </button>
                )}
                {memberId === c.writerId && (
                  <>
                    <button
                      className={styles.modal_edit_btn}
                      onClick={() => {
                        setEditCommentNo(c.commentNo);
                        setEditCommentContent(c.content);
                      }}
                    >
                      수정
                    </button>
                    <button
                      className={styles.modal_delete_btn}
                      onClick={() => handleDeleteComment(c.commentNo, isReply)}
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>
            )}

            {replyTargetNo === c.commentNo && (
              <div className={styles.modal_reply_input_wrap}>
                <input
                  className={styles.modal_reply_input}
                  placeholder={`@${c.writer}에게 답글 달기`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleReplySubmit(c.commentNo);
                  }}
                  maxLength={1000}
                />
                <button
                  className={styles.modal_btn_submit}
                  onClick={() => handleReplySubmit(c.commentNo)}
                >
                  등록
                </button>
                <button
                  className={styles.modal_btn_cancel}
                  onClick={() => {
                    setReplyTargetNo(null);
                    setReplyContent("");
                  }}
                >
                  취소
                </button>
              </div>
            )}

            {childComments.length > 0 && (
              <button
                className={styles.modal_toggle_replies}
                onClick={() => toggleReplies(c.commentNo)}
              >
                {openReplies[c.commentNo]
                  ? "▲ 답글 숨기기"
                  : `▼ 답글 ${childComments.length}개 보기`}
              </button>
            )}

            {openReplies[c.commentNo] && (
              <div className={styles.modal_reply_list}>
                {renderModalComments(c.commentNo, true)}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  /* ───────────── render ───────────── */
  return (
    <>
      <div
        className={`${styles.gram_card} ${isCardExpanded ? styles.gram_card_expanded : ""}`}
      >
        {/* 작성자 영역 */}
        <div className={styles.card_writer_wrap}>
          {/* ── 프로필 이미지 클릭 → 모달 ── */}
          <img
            src={gram.profileImg || defaultImg}
            alt="프로필"
            className={styles.card_profile_img}
            onClick={openProfile}
            style={{ cursor: profileTargetId ? "pointer" : "default" }}
            title={profileTargetId ? "프로필 보기" : ""}
          />
          {/* ── 닉네임 클릭 → 모달 ── */}
          <p
            className={styles.card_writer}
            onClick={openProfile}
            style={{
              cursor: profileTargetId ? "pointer" : "default",
              textDecoration: profileTargetId ? "underline" : "none",
            }}
            title={profileTargetId ? "프로필 보기" : ""}
          >
            {gram.nickname ?? gram.userId}
          </p>
          {gram.brandName && gram.productName && (
            <span className={styles.card_menu_tag}>
              {gram.brandName} - {gram.productName}
            </span>
          )}
        </div>

        <button
          type="button"
          className={`${styles.card_title} ${styles.card_title_link}`}
          onClick={toggleCardExpanded}
          aria-expanded={isCardExpanded}
        >
          {gram.title}
        </button>

        {images.length > 0 && (
          <div
            className={
              imagesExpanded
                ? `${styles.img_list_expanded} ${styles.expandable_img}`
                : `${styles.card_img_wrap} ${images.length === 1 ? styles.single : ""} ${
                    hasMultipleImages ? styles.expandable_img : ""
                  }`
            }
            onClick={toggleImagesExpanded}
            onKeyDown={(e) => {
              if (!hasMultipleImages) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleImagesExpanded();
              }
            }}
            role={hasMultipleImages ? "button" : undefined}
            tabIndex={hasMultipleImages ? 0 : undefined}
          >
            {imagesExpanded ? (
              images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`후기 이미지 ${idx + 1}`}
                  className={styles.card_img_expanded}
                />
              ))
            ) : (
              <img
                src={images[0]}
                alt="후기 이미지 1"
                className={styles.card_img}
              />
            )}
          </div>
        )}

        <p
          className={`${styles.card_content} ${
            contentExpanded || !hasExpandableContent
              ? styles.card_content_open
              : styles.card_content_clamped
          }`}
          onClick={() => {
            if (hasExpandableContent) setContentExpanded((prev) => !prev);
          }}
          onKeyDown={(e) => {
            if (!hasExpandableContent) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setContentExpanded((prev) => !prev);
            }
          }}
          aria-expanded={contentExpanded}
          role={hasExpandableContent ? "button" : undefined}
          tabIndex={hasExpandableContent ? 0 : undefined}
        >
          {content}
        </p>

        {hasExpandableContent && (
          <button
            className={styles.more_btn}
            onClick={toggleCardExpanded}
            aria-expanded={isCardExpanded}
          >
            {isCardExpanded ? "접기" : "더보기"}
          </button>
        )}

        <div className={styles.card_bottom}>
          <div className={styles.card_date}>
            <CalendarMonthIcon className={styles.card_date_icon} />
            <span>{formatDate(gram.createdAt)}</span>
          </div>
          <div className={styles.card_stats}>
            {/* 신고하기 */}
            <div
              className={styles.stat_item}
              onClick={handleReport}
              style={{ cursor: "pointer", justifyContent: "center" }}
              title={reported ? "이미 신고한 후기" : "신고하기"}
            >
              <NotificationsActiveIcon
                className={
                  reported ? styles.stat_icon_reported : styles.stat_icon_report
                }
              />
            </div>

            {/* 좋아요 */}
            <div
              className={styles.stat_item}
              onClick={handleLike}
              style={{ cursor: memberId ? "pointer" : "default" }}
            >
              {liked ? (
                <ThumbUpAltIcon className={styles.stat_icon_liked} />
              ) : (
                <ThumbUpOffAltIcon className={styles.stat_icon} />
              )}
              <span>{likeCount}</span>
            </div>

            {/* 댓글 */}
            <div
              className={styles.stat_item}
              onClick={openCommentModal}
              style={{ cursor: "pointer" }}
            >
              <ChatBubbleOutlineIcon className={styles.stat_icon} />
              <span>{gram.commentCount ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────── 댓글 모달 ───────────── */}
      {isCommentModalOpen &&
        createPortal(
          <>
            <div className={styles.comment_modal_overlay} />
            <div className={styles.comment_modal}>
              <div className={styles.comment_modal_handle} />
              <div className={styles.comment_modal_header}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <span>댓글 {commentList.length}개</span>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className={styles.modal_order_select}
                  >
                    <option value="oldest">등록순</option>
                    <option value="latest">최신순</option>
                  </select>
                </div>
                <button
                  className={styles.comment_modal_close}
                  onClick={() => setIsCommentModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className={styles.comment_modal_list}>
                {commentList.length === 0 ? (
                  <p className={styles.comment_modal_empty}>
                    첫 댓글을 남겨보세요!
                  </p>
                ) : (
                  renderModalComments(null)
                )}
              </div>

              <div className={styles.comment_modal_input_wrap}>
                <div className={styles.comment_modal_input_row}>
                  <img
                    src={memberThumb || defaultImg}
                    alt="회원 프로필"
                    className={styles.comment_modal_profile}
                  />
                  <textarea
                    className={styles.comment_modal_input}
                    placeholder={
                      memberId
                        ? "댓글을 남겨보세요"
                        : "로그인 후 댓글을 작성할 수 있습니다."
                    }
                    value={newComment}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length > 1000) {
                        Swal.fire({
                          title: "댓글은 최대 1,000자까지 작성 가능합니다.",
                          imageUrl: warningImage,
                          imageWidth: 120,
                          imageHeight: 120,
                          imageAlt: "경고 아이콘",
                          confirmButtonText: "확인",
                          confirmButtonColor: "var(--bun)",
                          background: "var(--patty)",
                          color: "var(--ivory)",
                        });
                        return;
                      }
                      setNewComment(value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitComment();
                    }}
                    disabled={!memberId}
                  />
                  <button
                    className={styles.comment_modal_submit}
                    onClick={submitComment}
                    disabled={!memberId || newComment.trim() === ""}
                  >
                    게시
                  </button>
                </div>
                {memberId && (
                  <span
                    className={`${styles.comment_modal_char_counter} ${
                      newComment.length >= 1000 ? styles.limit : ""
                    }`}
                  >
                    {newComment.length} / 1,000
                  </span>
                )}
              </div>
            </div>
          </>,
          document.body,
        )}

      {/* ───────────── 프로필 모달 (PostViewPage 방식과 동일) ───────────── */}
      {isProfileModalOpen &&
        profileTargetId &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
            onClick={() => setIsProfileModalOpen(false)}
          >
            <div
              style={{
                position: "relative",
                backgroundColor: "rgba(23, 13, 6, 0.95)",
                border: "1px solid rgba(231, 181, 106, 0.3)",
                padding: "50px 24px 24px 24px",
                borderRadius: "16px",
                boxShadow: "0px 10px 40px rgba(0,0,0,0.6)",
                maxWidth: "850px",
                width: "90%",
                maxHeight: "85vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
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
                  color: "var(--bun, #E7B56A)",
                  fontWeight: "bold",
                }}
              >
                ✕
              </button>
              <Profile
                targetId={profileTargetId}
                onClose={() => setIsProfileModalOpen(false)}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

/* ───────────────────────────────────────────────
   GramPage
─────────────────────────────────────────────── */
const GramPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useAuthStore();

  const { productId: paramProductId } = useParams();

  const [filterProductId, setFilterProductId] = useState(
    location.state?.productId ??
      (paramProductId ? Number(paramProductId) : null),
  );
  const [filterBrandName, setFilterBrandName] = useState(
    location.state?.brandName ?? "",
  );
  const [filterMenuName, setFilterMenuName] = useState(
    location.state?.menuName ?? "",
  );
  const [filterMenuLabel, setFilterMenuLabel] = useState("");

  useEffect(() => {
    if (paramProductId) {
      axios
        .get(`${import.meta.env.VITE_BACKSERVER}/eats/${paramProductId}`)
        .then((res) => {
          setFilterMenuLabel(`${res.data.brandName} - ${res.data.name}`);
        })
        .catch(() => {
          setFilterMenuLabel("선택한 메뉴");
        });
    }
  }, [paramProductId]);

  const [gramList, setGramList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortType, setSortType] = useState("latest");

  const [clearCountdown, setClearCountdown] = useState(null);
  const countdownRef = useRef(null);

  const observerRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (location.state?.productId) {
      navigate(location.pathname, { replace: true, state: {} });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    setGramList([]);
    setCurrentPage(1);
    setHasMore(true);
  }, [searchKeyword, sortType, filterProductId, userId]);

  const loadingRef = useRef(false);

  const fetchGrams = useCallback(
    (page) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);

      const isSearch = !!searchKeyword;

      axios
        .get(`${import.meta.env.VITE_BACKSERVER}/grams`, {
          params: {
            page,
            size: ITEMS_PER_PAGE,
            searchKeyword: isSearch ? searchKeyword : null,
            sort: isSearch ? sortType : "latest",
            productId: filterProductId ?? undefined,
            userId: userId ?? null,
          },
        })
        .then((res) => {
          const newItems = res.data.items ?? [];
          const totalPage = res.data.totalPage ?? 1;

          setGramList((prev) => {
            const existingIds = new Set(prev.map((g) => g.gramId));
            const filtered = newItems.filter((g) => !existingIds.has(g.gramId));
            return [...prev, ...filtered];
          });

          if (page >= totalPage) setHasMore(false);
        })
        .finally(() => {
          loadingRef.current = false;
          setLoading(false);
        });
    },
    [searchKeyword, sortType, filterProductId, userId],
  );

  useEffect(() => {
    fetchGrams(currentPage);
  }, [currentPage, searchKeyword, sortType, filterProductId, userId]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );

    if (bottomRef.current) observerRef.current.observe(bottomRef.current);

    return () => observerRef.current?.disconnect();
  }, [hasMore]);

  const handleSearch = () => {
    if (!inputValue) return;
    setSearchKeyword(inputValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleWrite = async () => {
    if (!userId) {
      Swal.fire({
        title: "로그인을 해야 \n 사용할 수 있는 기능입니다.",
        imageUrl: warningImage,
        imageWidth: 120,
        imageHeight: 120,
        imageAlt: "경고 아이콘",
        confirmButtonText: "확인",
        confirmButtonColor: "var(--bun)",
        background: "var(--patty)",
        color: "var(--ivory)",
      });
      return;
    }

    const { value: selected } = await Swal.fire({
      title: "후기 작성 전에 \n 이동할 페이지를 선택하세요",
      html: `
        <div style="display:flex; gap:16px; justify-content:center; margin-top:8px;">
          <label style="
            display:flex; flex-direction:column; align-items:center; gap:8px;
            padding:16px 24px; border-radius:12px; cursor:pointer;
            border:2px solid transparent; background:rgba(255,255,255,0.05);
            transition:all 0.2s;
          " id="label-stat">
            <input type="radio" name="redirect" value="stat" style="display:none"/>
            <span style="font-size:32px;">📊</span>
            <span style="font-weight:bold; color:var(--ivory);">비교하기</span>
          </label>
          <label style="
            display:flex; flex-direction:column; align-items:center; gap:8px;
            padding:16px 24px; border-radius:12px; cursor:pointer;
            border:2px solid transparent; background:rgba(255,255,255,0.05);
            transition:all 0.2s;
          " id="label-mypage">
            <input type="radio" name="redirect" value="mypage" style="display:none"/>
            <span style="font-size:32px;">👤</span>
            <span style="font-weight:bold; color:var(--ivory);">마이페이지</span>
          </label>
        </div>
      `,
      didOpen: () => {
        document.querySelectorAll('input[name="redirect"]').forEach((input) => {
          input.closest("label").addEventListener("click", () => {
            document
              .querySelectorAll('input[name="redirect"]')
              .forEach((el) => {
                el.closest("label").style.border = "2px solid transparent";
                el.closest("label").style.background = "rgba(255,255,255,0.05)";
              });
            input.closest("label").style.border = "2px solid var(--bun)";
            input.closest("label").style.background = "rgba(255,255,255,0.12)";
          });
        });
      },
      preConfirm: () => {
        const checked = document.querySelector(
          'input[name="redirect"]:checked',
        );
        if (!checked) {
          Swal.showValidationMessage("하나를 선택해주세요!");
          return false;
        }
        return checked.value;
      },
      imageUrl: infoImage,
      imageWidth: 120,
      imageHeight: 120,
      imageAlt: "안내 아이콘",
      confirmButtonText: "이동하기",
      confirmButtonColor: "var(--green)",
      background: "var(--patty)",
      color: "var(--ivory)",
      showCancelButton: true,
      cancelButtonText: "취소",
    });

    if (!selected) return;

    if (selected === "stat") {
      navigate("/esg/stat");
    } else {
      navigate("/esg/mypage");
    }
  };

  useEffect(() => {
    if (clearCountdown === null) return;

    if (clearCountdown === 0) {
      setFilterProductId(null);
      setFilterBrandName("");
      setFilterMenuName("");
      setClearCountdown(null);
      return;
    }

    countdownRef.current = setTimeout(() => {
      setClearCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(countdownRef.current);
  }, [clearCountdown]);

  const handleClearFilter = () => {
    setClearCountdown(TOTAL);
  };

  const handleCancelClear = () => {
    clearTimeout(countdownRef.current);
    setClearCountdown(null);
  };

  const timerColor =
    clearCountdown !== null ? getTimerColor(clearCountdown) : null;

  return (
    <section className={styles.gram_wrap}>
      <section className={styles.pageHero}>
        <span>Gram Review</span>
        <h1>후기 보기</h1>
        <p>
          실제 선택한 메뉴의 후기와 댓글을 확인하고, 메뉴별 경험을 함께
          나눠보세요.
        </p>
      </section>

      {filterProductId && (
        <div className={styles.filter_banner}>
          {clearCountdown !== null ? (
            <>
              <span>
                📌{" "}
                {filterBrandName && filterMenuName
                  ? `${filterBrandName}의 ${filterMenuName} 후기 다시 보기`
                  : `선택한 메뉴의 후기 다시 보기`}
              </span>
              ...
            </>
          ) : (
            <>
              <span>
                📌{" "}
                {filterBrandName && filterMenuName
                  ? `${filterBrandName}의 ${filterMenuName} 후기만 보는 중`
                  : `${filterMenuLabel}의 후기만 보는 중`}
              </span>
              <button onClick={handleClearFilter}>후기 전체 보기</button>
            </>
          )}
        </div>
      )}

      {clearCountdown !== null &&
        createPortal(
          <div
            style={{
              position: "fixed",
              bottom: "32px",
              right: "32px",
              zIndex: 9999,
              background: "var(--patty)",
              color: "var(--ivory)",
              borderRadius: "16px",
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: `0 4px 24px ${timerColor}55`,
              border: `1.5px solid ${timerColor}66`,
              transition: "box-shadow 1s ease, border-color 1s ease",
            }}
          >
            <ClockSVG remaining={clearCountdown} color={timerColor} />
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              <span
                style={{
                  color: timerColor,
                  fontSize: "20px",
                  fontWeight: "bold",
                  lineHeight: 1,
                  transition: "color 1s ease",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {clearCountdown}초
              </span>
              <span style={{ fontSize: "11px", color: "#bbb" }}>
                후 전체 보기로 전환됩니다
              </span>
            </div>
            <button
              onClick={handleCancelClear}
              style={{
                marginLeft: "4px",
                padding: "6px 12px",
                border: "none",
                borderRadius: "8px",
                background: "var(--green)",
                color: "var(--ivory)",
                fontSize: "12px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              다시 보기
            </button>
          </div>,
          document.body,
        )}

      <div className={styles.gram_input_wrap}>
        <div className={styles.search_box}>
          <div className={styles.input_box}>
            <SearchIcon
              className={styles.search_icon}
              onClick={handleSearch}
              style={{ cursor: "pointer" }}
            />
            <input
              placeholder=" 제목, 내용, 작성자 중 검색"
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (!e.target.value) {
                  setSearchKeyword("");
                  setSortType("latest");
                }
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button
            type="button"
            className={styles.reset_btn}
            onClick={() => {
              setInputValue("");
              setSearchKeyword("");
              setSortType("latest");
              setFilterProductId(null);
              setFilterBrandName("");
              setFilterMenuName("");
              setClearCountdown(null);
              clearTimeout(countdownRef.current);
            }}
          >
            <RefreshIcon fontSize="small" />
          </button>
          <select
            name="sort"
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className={styles.sort_select}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button className={styles.write_btn} onClick={handleWrite}>
          작성
        </button>
      </div>

      <div className={styles.card_grid}>
        {gramList.length === 0 && !loading ? (
          <p className={styles.empty_msg}>등록된 후기가 없습니다.</p>
        ) : (
          gramList.map((gram) => <GramCard key={gram.gramId} gram={gram} />)
        )}
      </div>

      <div ref={bottomRef} style={{ height: "10px" }} />

      {loading && (
        <p
          style={{
            textAlign: "center",
            color: "var(--bun)",
            padding: "20px",
            fontWeight: "bold",
          }}
        >
          불러오는 중...
        </p>
      )}

      {!hasMore && gramList.length > 0 && (
        <p
          style={{
            textAlign: "center",
            color: "#aaa",
            padding: "20px",
            fontSize: "14px",
          }}
        >
          모든 후기를 불러왔습니다.
        </p>
      )}

      <div className={styles.scroll_top_wrap}>
        <button
          className={styles.scroll_top_btn}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ▲ 맨 위로
        </button>
      </div>
    </section>
  );
};

export default GramPage;
