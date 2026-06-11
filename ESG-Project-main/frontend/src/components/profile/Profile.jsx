import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../../authstore/useAuthStore";
import Swal from "sweetalert2";
import questionImage from "../../assets/question.png";
import infoImage from "../../assets/info.png";
import successImage from "../../assets/success.png";

// 💡 [수정] 모달로 호출될 때 부모 컴포넌트(PostViewPage)의 닫기 함수(onClose)를 받아옵니다.
const Profile = ({ targetId: propsTargetId, onClose }) => {
  const navigate = useNavigate();
  const { userId, isReady } = useAuthStore();
  const params = useParams();

  const targetId = propsTargetId || params.targetId;

  const [profile, setProfile] = useState(null);

  // 💡 [버그 1 수정] 존재하지 않는 유저일 때 무한 로딩에 빠지지 않도록 처리할 에러 플래그 추가
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!targetId) return;

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/profile/${targetId}`)
      .then((res) => {
        if (res.data) {
          setProfile(res.data);
        } else {
          // 데이터가 비어서 오는 예외 케이스 방어
          setIsError(true);
          if (!propsTargetId) navigate("/404", { replace: true });
        }
      })
      .catch((err) => {
        console.error("프로필 로드 실패:", err);
        setIsError(true); // 에러 플래그 가동하여 무한 로딩 탈출

        // 주소창 접근일때만 404 페이지로 이동시키고, 모달 접근일 때는 모달 닫기 처리를 할 수 있도록 차단
        if (!propsTargetId) {
          navigate("/404", { replace: true });
        } else {
          // 모달인데 데이터를 불러오지 못했다면 경고 후 모달 자동 닫기
          Swal.fire({
            title: "에러",
            text: "프로필 데이터를 찾을 수 없거나 접근할 수 없습니다.",
            icon: "error",
            confirmButtonColor: "var(--bun)",
          }).then(() => {
            if (onClose) onClose();
          });
        }
      });
  }, [targetId, isReady, navigate, propsTargetId]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  const formatDate2 = (dateString) => {
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

  // 💡 [버그 2 헬퍼] 모달 내부에서 터지는 모든 Swal이 모달 레이어(zIndex 9999) 위로 오도록 전역 강제 믹스인
  const mixinSwalOptions = (options) => {
    return {
      ...options,
      // SweetAlert2 창이 강제로 모달 오버레이 최상단에 주입되도록 스타일 주입
      didOpen: () => {
        const container = Swal.getContainer();
        if (container) {
          container.style.zIndex = "100005"; // 모달창의 zIndex인 9999보다 무조건 높게 바인딩
        }
      },
    };
  };

  // 💡 [버그 1 수정] 에러가 발생한 경우 무한 스피너를 지우고 대체 렌더링
  if (isError) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
          color: "var(--tomato)",
          fontWeight: "bold",
        }}
      >
        데이터 로드에 실패했습니다.
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: propsTargetId ? "200px" : "100vh",
          background: propsTargetId
            ? "transparent"
            : "radial-gradient(circle at top right, rgba(231, 181, 106, 0.1), transparent 360px), var(--background)",
          color: "var(--bun)",
          fontWeight: "bold",
        }}
      >
        프로필 데이터를 불러오는 중입니다...
      </div>
    );
  }

  const nickname = profile.nickname;
  const role = profile.role;
  const profileImg = profile.profileImg;
  const createdAt = profile.createdAt;
  const login = profile.login;
  const me = profile.me;
  const favorite = profile.favorite;
  const reported = profile.reported;
  const choice = profile.choice ?? [];
  const post = profile.post ?? [];
  const gram = profile.gram ?? [];

  const showActionButtons = login && !me && role === "user";

  const handleFavoriteToggle = () => {
    if (favorite) {
      favoriteOff();
    } else {
      favoriteOn();
    }
  };

  const favoriteOn = () => {
    Swal.fire(
      mixinSwalOptions({
        title: "즐겨찾기 추가",
        text: "설명을 적어주세요.",
        input: "textarea",
        inputPlaceholder: "여기에 즐겨찾기 설명을 적어주세요",
        inputAttributes: {
          maxlength: "200",
          autocapitalize: "off",
          autorrect: "off",
        },
        confirmButtonText: "등록",
        confirmButtonColor: "var(--bun)",
        showCancelButton: true,
        cancelButtonText: "취소",
        cancelButtonColor: "var(--tomato)",
        background: "var(--patty)",
        color: "var(--ivory)",
        preConfirm: (inputValue) => {
          if (!inputValue || inputValue.trim() === "") {
            Swal.showValidationMessage("내용 반드시 입력하셔야 합니다!");
          }
          return inputValue;
        },
      }),
    ).then((result) => {
      if (result.isConfirmed && result.value) {
        const favoriteParam = { description: result.value };
        axios
          .post(
            `${import.meta.env.VITE_BACKSERVER}/profile/favorite/${targetId}`,
            favoriteParam,
          )
          .then((res) => {
            if (res.data.result === true) {
              setProfile({ ...profile, favorite: true });
              Swal.fire(
                mixinSwalOptions({
                  title: "즐겨찾기 완료!",
                  text: `${profile.nickname}님이 즐겨찾기에 추가되었습니다. ⭐`,
                  icon: "success",
                  confirmButtonColor: "var(--bun)",
                  background: "var(--patty)",
                  color: "var(--ivory)",
                }),
              );
            }
          })
          .catch((err) => {
            console.error(err.message);
          });
      }
    });
  };

  const favoriteOff = () => {
    Swal.fire(
      mixinSwalOptions({
        title: "즐겨찾기 취소",
        text: `${profile.nickname} 님을 즐겨찾기 취소 하시겠어요?`,
        imageUrl: questionImage,
        imageWidth: 120,
        imageHeight: 120,
        imageAlt: "물음표 아이콘",
        confirmButtonText: "즐겨찾기 취소",
        confirmButtonColor: "var(--bun)",
        showCancelButton: true,
        cancelButtonText: "닫기",
        cancelButtonColor: "var(--tomato)",
        background: "var(--patty)",
        color: "var(--ivory)",
      }),
    ).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(
            `${import.meta.env.VITE_BACKSERVER}/profile/favorite/${targetId}`,
          )
          .then((res) => {
            if (res.data.result === true) {
              setProfile({ ...profile, favorite: false });
              Swal.fire(
                mixinSwalOptions({
                  title: "즐겨찾기 취소!",
                  text: `${profile.nickname}님이 즐겨찾기에 취소되었습니다.`,
                  icon: "success",
                  confirmButtonColor: "var(--bun)",
                  background: "var(--patty)",
                  color: "var(--ivory)",
                }),
              );
            }
          })
          .catch((err) => {
            console.error(err.message);
          });
      }
    });
  };

  const handleReportAction = () => {
    if (reported) {
      axios
        .get(`${import.meta.env.VITE_BACKSERVER}/profile/report/${targetId}`)
        .then((res) => {
          const reportData = res.data.data || res.data;
          if (reportData) {
            const { reportId, reason, status, createdAt } = reportData;
            const formattedCreatedAt = formatDate(createdAt);
            const statusMap = {
              pending: "⏳ 접수 대기 중",
            };
            const currentStatus = statusMap[status] || status;

            Swal.fire(
              mixinSwalOptions({
                title: "🚨 내가 제출한 신고 내역",
                html: `
              <div style="text-align: left; line-height: 1.8; font-size: 15px;">
                <p><strong>• 처리 상태 :</strong> <span style="color: #ffc107; font-weight: bold;">${currentStatus}</span></p>
                <p><strong>• 신고 일시 :</strong> ${formattedCreatedAt}</p>
                <hr style="border: 0; border-top: 1px solid #555; margin: 15px 0;">
                <p><strong>• 신고 사유 :</strong></p>
                <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px; white-space: pre-wrap; word-break: break-all;">${reason}</div>
              </div>
            `,
                imageUrl: infoImage,
                imageWidth: 120,
                imageHeight: 120,
                imageAlt: "신고 내역 아이콘",
                showCancelButton: status === "pending",
                confirmButtonText: "닫기",
                confirmButtonColor: "var(--bun)",
                cancelButtonText: "신고 취소하기",
                cancelButtonColor: "var(--tomato)",
                background: "var(--patty)",
                color: "var(--ivory)",
                allowOutsideClick: false,
              }),
            ).then((result) => {
              if (result.dismiss === Swal.DismissReason.cancel) {
                reportOff(reportId);
              }
            });
          }
        })
        .catch((err) => {
          console.error(err.message);
        });
    } else {
      Swal.fire(
        mixinSwalOptions({
          title: "유저 신고",
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
              Swal.showValidationMessage(
                "신고 사유를 반드시 입력하셔야 합니다!",
              );
            }
            return inputValue;
          },
        }),
      ).then((result) => {
        if (result.isConfirmed && result.value) {
          const param = { reason: result.value };
          axios
            .post(
              `${import.meta.env.VITE_BACKSERVER}/profile/report/${targetId}`,
              param,
            )
            .then((res) => {
              if (res.status === 200 && res.data) {
                setProfile({ ...profile, reported: true });
                Swal.fire(
                  mixinSwalOptions({
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
                  }),
                );
              }
            })
            .catch((err) => {
              console.error(err.message);
            });
        }
      });
    }
  };

  const reportOff = (reportId) => {
    axios
      .delete(
        `${import.meta.env.VITE_BACKSERVER}/profile/report/${targetId}/${reportId}`,
      )
      .then((res) => {
        if (res.data.result === true) {
          setProfile({ ...profile, reported: false });
          Swal.fire(
            mixinSwalOptions({
              title: "신고 취소 완료",
              text: "정상적으로 신고가 취소되었습니다.",
              imageUrl: successImage,
              imageWidth: 120,
              imageHeight: 120,
              imageAlt: "완료 아이콘",
              confirmButtonText: "닫기",
              confirmButtonColor: "var(--bun)",
              background: "var(--patty)",
              color: "var(--ivory)",
            }),
          );
        }
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  return (
    <div
      style={
        propsTargetId
          ? {
              width: "100%",
              fontFamily: "'Pretendard', sans-serif",
              color: "var(--ivory)",
              boxSizing: "border-box",
            }
          : styles.container
      }
      // style={
      //   propsTargetId
      //     ? {
      //         ...styles.container,

      //         minHeight: "auto",
      //         background: "transparent",
      //         padding: 0,
      //       }
      //     : styles.container
      // }
      // style={
      //   propsTargetId
      //     ? {
      //         ...styles.container,
      //         fontFamily: "'Pretendard', sans-serif",
      //         color: "var(--ivory)",
      //         boxSizing: "border-box",
      //       }
      //     : styles.container
      // }
    >
      <div
        // style={
        //   propsTargetId
        //     ? {
        //         maxWidth: "850px",
        //         margin: "0 auto",
        //       }
        //     : styles.wrapper
        // }
        style={
          propsTargetId
            ? {
                width: "100%",
                maxWidth: "850px",
                margin: "0 auto",
              }
            : styles.wrapper
        }
      >
        {!propsTargetId && (
          <section style={styles.pageHero}>
            <span style={styles.heroEyebrow}>Member Profile</span>
            <h1 style={styles.heroTitle}>프로필</h1>
            <p style={styles.heroDescription}>
              회원의 선택 기록, 작성한 게시글과 후기를 한곳에서 확인해보세요.
            </p>
          </section>
        )}

        {/* 1. 상단 유저 프로필 카드 */}
        <div style={styles.profileCard}>
          <div style={styles.profileHeader}>
            <div style={styles.avatarContainer}>
              <img
                src={
                  profileImg ||
                  "https://esg-project-site.s3.ap-northeast-2.amazonaws.com/profile_images/default_image.png"
                }
                alt={nickname}
                style={styles.avatar}
              />
            </div>
            <div style={styles.userInfo}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <h2 style={styles.nickname}>{nickname}</h2>
                <span
                  style={{
                    ...styles.roleBadge,
                    backgroundColor:
                      role === "admin"
                        ? "rgba(255, 90, 79, 0.2)"
                        : "rgba(231, 181, 106, 0.16)",
                    color: role === "admin" ? "#ffb0aa" : "var(--bun)",
                    borderColor:
                      role === "admin"
                        ? "rgba(255, 90, 79, 0.34)"
                        : "rgba(231, 181, 106, 0.32)",
                  }}
                >
                  {role === "admin" ? "관리자" : "일반회원"}
                </span>
              </div>
              <p style={styles.joinDate}>가입일: {formatDate(createdAt)}</p>
            </div>

            {showActionButtons && (
              <div style={styles.btnGroup}>
                <button
                  onClick={handleFavoriteToggle}
                  style={{
                    ...styles.actionBtn,
                    backgroundColor: favorite
                      ? "rgba(231, 181, 106, 0.12)"
                      : "var(--bun)",
                    color: favorite ? "var(--bun)" : "var(--patty)",
                    borderColor: "rgba(231, 181, 106, 0.46)",
                  }}
                >
                  {favorite ? "즐겨찾기 취소" : "즐겨찾기 등록"}
                </button>
                <button
                  onClick={handleReportAction}
                  style={{
                    ...styles.actionBtn,
                    backgroundColor: reported
                      ? "rgba(255, 90, 79, 0.12)"
                      : "var(--tomato)",
                    color: reported ? "#ffb0aa" : "#fff8ec",
                    borderColor: "rgba(255, 90, 79, 0.42)",
                  }}
                >
                  {reported ? "신고내역 보기" : "신고하기"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. 하단 3개 리스트 섹션 영역 */}
        <div
          style={
            propsTargetId
              ? { ...styles.listGrid, gridTemplateColumns: "1fr" }
              : styles.listGrid
          }
        >
          {/* 최근 선택 (Choice) 리스트 */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>최근 선택 메뉴</h3>
            <div style={styles.listContainer}>
              {choice?.length === 0 ? (
                <p style={styles.emptyText}>최근 선택한 메뉴가 없습니다.</p>
              ) : (
                choice?.slice(0, 3).map((item, idx) => (
                  <div key={item.choiceId || idx} style={styles.listItem}>
                    <span style={styles.itemTitle}>{item.productName}</span>
                    <span style={styles.itemDate}>
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 최근 게시물 (Post) 리스트 */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>최근 작성 게시글</h3>
            <div style={styles.listContainer}>
              {post?.length === 0 ? (
                <p style={styles.emptyText}>작성한 게시물이 없습니다.</p>
              ) : (
                post?.slice(0, 3).map((item, idx) => (
                  <div
                    key={item.postId || idx}
                    style={styles.clickableListItem}
                    // 💡 [버그 3 수정] 게시글 이동할 때 부모가 준 onClose 모달 종료 함수를 우선 발동시켜 창을 닫아줍니다.
                    onClick={() => {
                      if (propsTargetId && onClose) onClose();
                      navigate(`/esg/post/view/${item.postId}`);
                    }}
                  >
                    <span style={styles.itemTitle}>{item.title}</span>
                    <span style={styles.itemDate}>
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 최근 후기 (Gram) 리스트 */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>최근 작성 후기</h3>
            <div style={styles.listContainer}>
              {gram?.length === 0 ? (
                <p style={styles.emptyText}>작성한 후기가 없습니다.</p>
              ) : (
                gram?.slice(0, 3).map((item, idx) => (
                  <div
                    key={item.gramId || idx}
                    style={styles.clickableListItem}
                    // 💡 [버그 3 수정] 후기 이동할 때도 마찬가지로 onClose를 작동시켜 오버레이 모달을 증발시킵니다.
                    onClick={() => {
                      if (propsTargetId && onClose) onClose();
                      navigate(`/esg/gram/view/${item.GramId}`);
                    }}
                  >
                    <span style={styles.itemTitle}>{item.title}</span>
                    <span style={styles.itemDate}>
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top right, rgba(231, 181, 106, 0.1), transparent 360px), linear-gradient(to bottom, rgba(126, 214, 165, 0.03), rgba(74, 46, 36, 0.18)), var(--background)",
    padding: "46px 20px 72px",
    fontFamily: "'Pretendard', sans-serif",
    color: "var(--ivory)",
    boxSizing: "border-box",
  },
  wrapper: { maxWidth: "1140px", margin: "0 auto" },
  pageHero: {
    minHeight: "176px",
    margin: "0 0 24px",
    padding: "34px 38px",
    border: "1px solid rgba(231, 181, 106, 0.2)",
    borderRadius: "var(--radius-lg)",
    background:
      "linear-gradient(135deg, rgba(74, 46, 36, 0.92), rgba(31, 25, 22, 0.94)), linear-gradient(115deg, transparent 0 72%, rgba(139, 195, 74, 0.12) 72% 100%)",
    boxShadow: "0 24px 70px rgba(0, 0, 0, 0.24)",
  },
  heroEyebrow: {
    color: "var(--bun)",
    fontFamily: "medium",
    fontSize: "15px",
  },
  heroTitle: {
    margin: "10px 0 12px",
    color: "#fff8ec",
    fontFamily: "bold",
    fontSize: "42px",
    lineHeight: 1.1,
  },
  heroDescription: {
    maxWidth: "640px",
    color: "rgba(255, 248, 236, 0.68)",
    fontSize: "16px",
    lineHeight: 1.6,
  },
  profileCard: {
    background:
      "linear-gradient(180deg, rgba(255, 248, 236, 0.045), rgba(0, 0, 0, 0.1)), rgba(23, 13, 6, 0.64)",
    border: "1px solid rgba(231, 181, 106, 0.16)",
    borderRadius: "var(--radius-lg)",
    padding: "24px",
    boxShadow: "0 18px 46px rgba(0, 0, 0, 0.18)",
    marginBottom: "24px",
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    position: "relative",
    flexWrap: "wrap",
    gap: "24px",
  },
  avatarContainer: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "3px solid rgba(231, 181, 106, 0.34)",
    backgroundColor: "rgba(255, 248, 236, 0.08)",
  },
  avatar: { width: "100%", height: "100%", objectFit: "cover" },
  userInfo: { flex: 1, minWidth: "180px" },
  nickname: {
    fontSize: "22px",
    fontWeight: "900",
    color: "#fff8ec",
    margin: 0,
  },
  roleBadge: {
    fontSize: "11px",
    fontWeight: "bold",
    padding: "4px 8px",
    border: "1px solid",
    borderRadius: "999px",
  },
  joinDate: {
    color: "rgba(255, 248, 236, 0.58)",
    fontSize: "13px",
    margin: "6px 0 0 0",
  },
  btnGroup: { display: "flex", gap: "12px" },
  actionBtn: {
    border: "1px solid",
    minHeight: "40px",
    padding: "0 14px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  listGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  sectionCard: {
    background:
      "linear-gradient(180deg, rgba(255, 248, 236, 0.045), rgba(0, 0, 0, 0.1)), rgba(23, 13, 6, 0.64)",
    border: "1px solid rgba(231, 181, 106, 0.16)",
    borderRadius: "var(--radius-lg)",
    padding: "20px",
    boxShadow: "0 18px 46px rgba(0, 0, 0, 0.16)",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#fff8ec",
    margin: "0 0 12px 0",
    borderBottom: "1px solid rgba(231, 181, 106, 0.18)",
    paddingBottom: "8px",
  },
  listContainer: { display: "flex", flexDirection: "column", gap: "10px" },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    backgroundColor: "rgba(0, 0, 0, 0.16)",
    borderRadius: "12px",
    fontSize: "13px",
  },
  clickableListItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    backgroundColor: "rgba(0, 0, 0, 0.16)",
    borderRadius: "12px",
    fontSize: "13px",
    cursor: "pointer",
    border: "1px solid rgba(231, 181, 106, 0.08)",
  },
  itemTitle: {
    fontWeight: "600",
    color: "#fff8ec",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "65%",
  },
  itemDate: { fontSize: "11px", color: "rgba(255, 248, 236, 0.46)" },
  emptyText: {
    textAlign: "center",
    color: "rgba(255, 248, 236, 0.48)",
    fontSize: "13px",
    padding: "16px 0",
    margin: 0,
  },
};

export default Profile;
