/* 구현 담당자: 장지혁 */

import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";

import styles from "./GramViewPage.module.css";
import { useEffect, useState } from "react";
import useAuthStore from "../authstore/useAuthStore";
import axios from "axios";
import Swal from "sweetalert2";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

import defaultImage from "../assets/default_image.png";
import questionImage from "../assets/question.png";
import warningImage from "../assets/warning.png";
import successImage from "../assets/success.png";

const GramViewPage = () => {
  const navigate = useNavigate();
  const { gramId } = useParams();
  const gramNo = Number(gramId);
  const [searchParams] = useSearchParams();
  const isCommentOnly = searchParams.get("view") === "comment";

  const location = useLocation();
  const menuName = location.state?.menuName ?? null;
  const brandName = location.state?.brandName ?? null;

  // --- 상태 관리 (State) ---
  const [gram, setGram] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReported, setIsReported] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [orderType, setOrderType] = useState("oldest");

  const [orderList] = useState([
    { value: "oldest", label: "등록순" },
    { value: "latest", label: "최신순" },
  ]);
  const [commentList, setCommentList] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editCommentNo, setEditCommentNo] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [replyTargetNo, setReplyTargetNo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [openReplies, setOpenReplies] = useState({});

  // --- 로그인 유저 정보 ---
  const { userId, nickname, profileImg } = useAuthStore();
  const memberId = userId;
  const memberThumb = profileImg;
  const memberName = nickname;

  // 데이터 로드 및 초기화

  useEffect(() => {
    const skipView = isCommentOnly;
    const cookieKey = `viewed_gram_${gramNo}`;
    const alreadyViewed = document.cookie
      .split("; ")
      .some((c) => c.startsWith(cookieKey));

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/grams/${gramNo}`, {
        params: { skipView: skipView || alreadyViewed },
      })
      .then((res) => {
        setGram(res.data);

        if (!skipView && !alreadyViewed) {
          const expires = new Date(Date.now() + 60 * 60 * 1000).toUTCString();
          document.cookie = `${cookieKey}=true; expires=${expires}; path=/`;
        }
      })
      .catch(() => {
        Swal.fire({ icon: "error", title: "존재하지 않는 후기입니다." }).then(
          () => navigate("/esg/gram"),
        );
      });
  }, [gramNo]);

  const fetchComments = () => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/grams/${gramNo}/comments`)
      .then((res) => setCommentList(res.data ?? []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchComments();
  }, [gramNo]);

  useEffect(() => {
    if (!gramNo) return;
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/grams/${gramNo}/like`, {
        params: { userId: memberId ?? null },
      })
      .then((res) => {
        setLiked(res.data.liked);
        setLikeCount(res.data.likeCount);
      })
      .catch(() => {});
  }, [gramNo, memberId]);

  // 댓글/대댓글 및 좋아요 CRUD

  const submitComment = () => {
    if (!memberId) return;
    if (newComment.trim() === "") return;
    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/grams/${gramNo}/comments`, {
        content: newComment,
        writerId: memberId,
        parentNo: null,
      })
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

    if (bodyOnly.trim() === "") {
      Swal.fire({
        title: "댓글 내용을 입력해주세요.",
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
    axios
      .put(
        `${import.meta.env.VITE_BACKSERVER}/grams/${gramNo}/comments/${commentNo}`,
        { content: editCommentContent },
      )
      .then(() => {
        setEditCommentNo(null);
        setEditCommentContent("");
        fetchComments();
      })
      .catch(() => {});
  };

  const handleDeleteComment = (commentNo) => {
    Swal.fire({
      title: "댓글을 삭제하시겠습니까?",
      imageUrl: questionImage,
      imageWidth: 120,
      imageHeight: 120,
      imageAlt: "물음표 아이콘",
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
            `${import.meta.env.VITE_BACKSERVER}/grams/${gramNo}/comments/${commentNo}`,
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
      .post(`${import.meta.env.VITE_BACKSERVER}/grams/${gramNo}/comments`, {
        content: `${mentionPrefix}${replyContent}`,
        writerId: memberId,
        parentNo: parentNo,
      })
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

  const handleLikeToggle = () => {
    if (!memberId) return;
    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/grams/${gramNo}/like`, {
        userId: memberId,
      })
      .then((res) => {
        setLiked(res.data.liked);
        setLikeCount(res.data.likeCount);
      })
      .catch(() => {});
  };

  // 게시글 삭제 및 신고 모달

  const deleteGram = () => {
    Swal.fire({
      title: "후기를 삭제하시겠습니까?",
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
          .delete(`${import.meta.env.VITE_BACKSERVER}/grams/${gram.gramId}`)
          .then(() => {
            Swal.fire({
              title: "삭제가 완료되었습니다.",
              imageUrl: successImage,
              imageWidth: 120,
              imageHeight: 120,
              imageAlt: "완료 아이콘",
              confirmButtonText: "확인",
              confirmButtonColor: "var(--bun)",
              background: "var(--patty)",
              color: "var(--ivory)",
            }).then(() => navigate("/esg/gram"));
          })
          .catch(() => {
            Swal.fire({
              title: "삭제에 실패했습니다.",
              icon: "error",
              confirmButtonText: "확인",
            });
          });
      }
    });
  };

  const handleCloseModal = () => {
    if (reportReason.trim() !== "") {
      Swal.fire({
        title: "작성 중인 내용이 있습니다.",
        text: "'네'를 누르면 작성 중인 신고 내용이 사라집니다.",
        imageUrl: questionImage,
        imageWidth: 120,
        imageHeight: 120,
        imageAlt: "물음표 아이콘",
        showCancelButton: true,
        confirmButtonText: "네",
        cancelButtonText: "아니오",
        confirmButtonColor: "var(--tomato)",
        cancelButtonColor: "var(--green)",
        background: "var(--patty)",
        color: "var(--ivory)",
      }).then((result) => {
        if (result.isConfirmed) {
          setReportReason("");
          setIsReportModalOpen(false);
        }
      });
    } else {
      setIsReportModalOpen(false);
    }
  };

  const submitReport = () => {
    if (reportReason.trim() === "") {
      Swal.fire({
        title: "신고 사유를 입력해주세요.",
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
    Swal.fire({
      title: "해당 후기를 \n 정말로 신고하시겠습니까?",
      text: "신고 후에는 취소할 수 없습니다.",
      imageUrl: questionImage,
      imageWidth: 120,
      imageHeight: 120,
      imageAlt: "물음표 아이콘",
      showCancelButton: true,
      confirmButtonText: "네",
      cancelButtonText: "아니오",
      confirmButtonColor: "var(--tomato)",
      cancelButtonColor: "var(--green)",
      background: "var(--patty)",
      color: "var(--ivory)",
    }).then((result) => {
      if (!result.isConfirmed) return;
      axios
        .post(
          `${import.meta.env.VITE_BACKSERVER}/grams/${gram.gramId}/report`,
          { userId: memberId, reason: reportReason },
        )
        .then(() => {
          setIsReported(true);
          Swal.fire({
            title: "신고가 완료되었습니다.",
            imageUrl: successImage,
            imageWidth: 120,
            imageHeight: 120,
            imageAlt: "완료 아이콘",
            confirmButtonText: "확인",
            confirmButtonColor: "var(--bun)",
            background: "var(--patty)",
            color: "var(--ivory)",
          });
          setIsReportModalOpen(false);
          setReportReason("");
        })
        .catch((err) => {
          if (err.response?.status === 409) {
            Swal.fire({
              title: "이미 신고한 후기입니다.",
              imageUrl: warningImage,
              imageWidth: 120,
              imageHeight: 120,
              imageAlt: "경고 아이콘",
              confirmButtonText: "확인",
              confirmButtonColor: "var(--bun)",
              background: "var(--patty)",
              color: "var(--ivory)",
            });
          } else {
            Swal.fire({
              title: "신고에 실패했습니다.",
              icon: "error",
              confirmButtonText: "확인",
            });
          }
        });
    });
  };

  // 화면 렌더링용 유틸리티 및 렌더링 함수

  // 유틸: ISO 날짜 포맷 변환 (KST 기준)

  // :white_check_mark: 유틸: ISO 날짜 포맷 변환 (KST 기준)

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "Z");
    const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const datePart = kst.toISOString().split("T")[0];
    const timePart = kst.toISOString().split("T")[1].split(".")[0];
    return `${datePart} ${timePart}`;
  };

  // 함수: 댓글 계층형 구조 재귀적 화면 배치
  const renderComments = (parentNo, isReply = false) => {
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
        <li
          key={c.commentNo}
          className={isReply ? styles.reply_item : styles.comment_item}
        >
          <div className={styles.comment_meta}>
            <img
              src={c.profileImg || defaultImage}
              alt="프로필"
              className={styles.comment_profile_img}
            />
            <span className={styles.comment_writer}>{c.writer}</span>
            <span className={styles.comment_date}>
              {formatDate(c.createdAt)}
            </span>
          </div>

          {editCommentNo === c.commentNo ? (
            <div className={styles.comment_edit_wrap}>
              <div className={styles.comment_edit_header}>
                <img
                  src={c.profileImg || defaultImage}
                  alt="프로필"
                  className={styles.comment_edit_profile_img}
                />
                <span>{c.writer}</span>
              </div>
              {(() => {
                const { mention, body } = getMentionAndBody(editCommentContent);
                return (
                  <>
                    <div className={styles.edit_inline_wrap}>
                      {mention && (
                        <span className={styles.edit_mention_inline}>
                          {mention}
                        </span>
                      )}
                      <textarea
                        className={styles.comment_edit_textarea}
                        value={body}
                        onChange={(e) => {
                          if (e.target.value.length > 1000) return;
                          setEditCommentContent(
                            mention
                              ? `${mention}${e.target.value}`
                              : e.target.value,
                          );
                        }}
                        placeholder="댓글을 남겨보세요."
                      />
                    </div>
                    <div className={styles.comment_edit_footer}>
                      <span
                        className={styles.comment_edit_counter}
                        style={{
                          color:
                            body.length >= 1000
                              ? "var(--tomato)"
                              : "var(--background)",
                        }}
                      >
                        {body.length}/1000
                      </span>
                      <div className={styles.comment_edit_btns}>
                        <button
                          className={styles.comment_edit_submit_btn}
                          onClick={() => handleEditSubmit(c.commentNo)}
                        >
                          수정
                        </button>
                        <button
                          className={styles.comment_edit_cancel_btn}
                          onClick={() => {
                            setEditCommentNo(null);
                            setEditCommentContent("");
                          }}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <p className={styles.comment_content}>
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

          {editCommentNo !== c.commentNo && (
            <div className={styles.comment_bottom_btns}>
              <div className={styles.comment_action_btns}>
                {memberId && replyTargetNo !== c.commentNo && (
                  <button
                    className={styles.reply_btn}
                    onClick={() => setReplyTargetNo(c.commentNo)}
                  >
                    답글달기
                  </button>
                )}
                {memberId === c.writerId && (
                  <>
                    <button
                      className={styles.comment_edit_btn}
                      onClick={() => {
                        setEditCommentNo(c.commentNo);
                        setEditCommentContent(c.content);
                      }}
                    >
                      수정
                    </button>
                    <button
                      className={styles.comment_delete_btn}
                      onClick={() => handleDeleteComment(c.commentNo)}
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {replyTargetNo === c.commentNo && (
            <div className={styles.reply_write_wrap}>
              <div className={styles.comment_write_wrap}>
                <div className={styles.write_header}>
                  <img src={memberThumb || defaultImage} alt="프로필" />
                  <span>{memberName ?? memberId}</span>
                </div>
                <textarea
                  className={styles.comment_textarea}
                  placeholder={`@${c.writer}에게 답글 달기`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  maxLength={1000}
                />
                <div className={styles.write_footer}>
                  <div className={styles.write_fotter_bottom}>
                    <span
                      className={styles.char_counter}
                      style={{
                        color:
                          replyContent.length >= 1000
                            ? "var(--tomato)"
                            : "var(--background)",
                      }}
                    >
                      {replyContent.length}/1000
                    </span>
                    <button
                      className={styles.reply_submit_btn}
                      onClick={() => handleReplySubmit(c.commentNo)}
                    >
                      답글 등록
                    </button>
                    <button
                      className={styles.reply_cancel_btn}
                      onClick={() => {
                        setReplyTargetNo(null);
                        setReplyContent("");
                      }}
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {childComments.length > 0 && (
            <button
              className={styles.toggle_replies_btn}
              onClick={() => toggleReplies(c.commentNo)}
            >
              {openReplies[c.commentNo]
                ? "▲ 답글 숨기기"
                : `▼ 답글 ${childComments.length}개 보기`}
            </button>
          )}

          {openReplies[c.commentNo] && (
            <ul className={styles.reply_list}>
              {renderComments(c.commentNo, true)}
            </ul>
          )}
        </li>
      );
    });
  };

  // 메인 JSX
  return (
    <section className={styles.gram_wrap}>
      <section className={styles.pageHero}>
        <span>Gram Detail</span>
        <h1>후기 상세보기</h1>
        <p>
          선택한 메뉴의 실제 후기, 댓글, 좋아요 반응을 한 화면에서 확인해보세요.
        </p>
      </section>
      {gram ? (
        <>
          {!isCommentOnly && (
            <>
              <div className={styles.gram_view_wrap}>
                <div className={styles.gram_view_header}>
                  <h2 className={styles.gram_title}>{gram.title}</h2>
                  <div className={styles.gram_sub_info}>
                    <div className={styles.gram_writer}>
                      <div
                        className={
                          gram.profileImg
                            ? styles.profileImg_exists
                            : styles.profileImg
                        }
                      >
                        {gram.profileImg ? (
                          <img src={gram.profileImg} alt="프로필" />
                        ) : (
                          <span className="material-icons">account_circle</span>
                        )}
                      </div>
                      <span>{gram.nickname ?? gram.userId}</span>
                    </div>
                    <div className={styles.gram_date}>
                      <CalendarMonthIcon className={styles.icon} />
                      <span>{formatDate(gram.createdAt)}</span>
                    </div>
                    <div className={styles.gram_view_count}>
                      <VisibilityIcon className={styles.icon} />
                      <span>{gram.viewCount ?? 0}</span>
                    </div>
                  </div>
                </div>

                {gram.images && gram.images.length > 0 && (
                  <div className={styles.gram_view_images}>
                    {gram.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`후기 이미지 ${idx + 1}`}
                        className={styles.gram_view_img}
                      />
                    ))}
                  </div>
                )}

                <div className={styles.gram_view_content}>
                  <p>{gram.content}</p>
                </div>
              </div>

              <div className={styles.gram_action_btn_wrap}>
                {memberId && gram.userId === memberId && (
                  <div className={styles.left_btns}>
                    <button
                      className={styles.edit_btn}
                      onClick={() =>
                        navigate(`/esg/gram/modify/${gram.gramId}`)
                      }
                    >
                      수정
                    </button>
                    <button className={styles.delete_btn} onClick={deleteGram}>
                      삭제
                    </button>
                  </div>
                )}
                <button
                  className={styles.list_btn}
                  onClick={() => navigate("/esg/gram")}
                >
                  목록으로
                </button>
                <div className={styles.right_btns}>
                  {memberId !== gram.userId && (
                    <button
                      className={styles.report_btn}
                      onClick={() => {
                        if (!memberId) {
                          Swal.fire({
                            imageUrl: warningImage,
                            title: "로그인 필요",
                            text: "로그인을 해야 사용할 수 있는 기능입니다.",
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
                        setIsReportModalOpen(true);
                      }}
                    >
                      신고하기
                    </button>
                  )}
                  <div className={styles.like_wrap}>
                    {liked ? (
                      <ThumbUpAltIcon
                        className={`${styles.like_icon} ${styles.like_active} ${!memberId ? styles.like_icon_disabled : ""}`}
                        onClick={handleLikeToggle}
                      />
                    ) : (
                      <ThumbUpOffAltIcon
                        className={`${styles.like_icon} ${!memberId ? styles.like_icon_disabled : ""}`}
                        onClick={handleLikeToggle}
                      />
                    )}
                    <span className={styles.like_count}>{likeCount}</span>
                  </div>
                </div>
              </div>

              {isReportModalOpen && (
                <div className={styles.overlay}>
                  <div
                    className={styles.report_modal}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3>후기 신고하기</h3>
                    <textarea
                      className={styles.report_textarea}
                      placeholder="신고 사유를 입력해주세요 (최대 500자 입력 가능)"
                      value={reportReason}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length > 500) {
                          Swal.fire({
                            title:
                              "신고 사유는 최대 500자까지 \n 작성 가능합니다.",
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
                        setReportReason(value);
                      }}
                    />
                    <div
                      className={`${styles.text_count} ${reportReason.length >= 500 ? styles.limit : ""}`}
                    >
                      {reportReason.length} / 500
                    </div>
                    <div className={styles.modal_btn_wrap}>
                      <button
                        className={styles.report_btn}
                        onClick={submitReport}
                      >
                        신고
                      </button>
                      <button
                        className={styles.modal_cancel_btn}
                        onClick={handleCloseModal}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <p>로딩 중...</p>
      )}

      <div className={styles.comment_wrap} id="comment">
        <div className={styles.comment_header_wrap}>
          <h4 className={styles.comment_title}>
            댓글 목록 ({commentList.length})
          </h4>
          {isCommentOnly && (
            <button
              className={styles.list_btn}
              onClick={() => navigate("/esg/gram")}
            >
              목록으로
            </button>
          )}
          <div className={styles.filter_wrap}>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className={styles.order_select}
            >
              {orderList.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.comment_write_wrap}>
          <div className={styles.write_header}>
            {memberId && memberThumb ? (
              <img src={memberThumb} alt="회원 프로필 사진" />
            ) : (
              <img src={defaultImage} alt="ESG 사이트 기본 프로필" />
            )}
            <span>{memberId ? memberName : "현재 비회원 상태입니다."}</span>
          </div>
          <textarea
            className={styles.comment_textarea}
            placeholder={
              memberId
                ? "댓글을 남겨보세요."
                : "로그인 후 댓글을 작성할 수 있습니다."
            }
            value={newComment}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length > 1000) {
                Swal.fire({
                  title: "댓글은 1,000자까지 \n 작성 가능합니다.",
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
            disabled={!memberId}
            maxLength={1000}
          />
          <div className={styles.write_footer}>
            <div className={styles.write_fotter_bottom}>
              {memberId && (
                <span
                  className={styles.char_counter}
                  style={{
                    color:
                      newComment.length >= 1000
                        ? "var(--tomato)"
                        : "var(--background)",
                  }}
                >
                  {newComment.length}/1000
                </span>
              )}
              <button
                className={styles.comment_submit_btn}
                onClick={submitComment}
                disabled={!memberId}
              >
                댓글 등록
              </button>
            </div>
          </div>
        </div>

        <ul className={styles.comment_list}>{renderComments(null)}</ul>
        <button
          className={styles.scroll_top_btn}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          title="맨 위로 이동"
        >
          <ArrowUpwardIcon />
        </button>
      </div>
    </section>
  );
};

export default GramViewPage;
