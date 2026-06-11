/* 담당자: 장지혁 */
/* EatPage와 MainPage에서 공통으로 사용하는 모달 컴포넌트 */

import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAuthStore from "../authstore/useAuthStore";
import useCompareStore from "../features/compare/store/useCompareStore";
import axios from "axios";

import checkImage from "../assets/check.png";
import defaultImg from "../assets/burger/default.png";
import questionImage from "../assets/question.png";
import warningImage from "../assets/warning.png";
import infoImage from "../assets/info.png";
import successImage from "../assets/success.png";

import styles from "./EatPage.module.css";

/* 북마크 다이얼로그 */
export const showBookmarkDialog = (item, onConfirm) => {
  const imgSrc = item.imageUrl || "";
  const MAX_LEN = 100;

  Swal.fire({
    title: "즐겨찾기 추가",
    html: `
      <div style="display:flex; gap:20px; align-items:flex-start; text-align:left; margin-top:8px;">
        <img
          src="${imgSrc}"
          alt="${item.name} 이미지"
          onerror="this.style.background='#fff8f0'"
          style="width:90px; height:90px; object-fit:contain; border-radius:12px; background:#fff8f0; flex-shrink:0; border:1px solid #6a4a38;"
        />
        <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
          <p style="font-size:12px; color:#c8a882; margin:0;">브랜드</p>
          <p style="font-size:13px; font-weight:600; color:#e7b56a; margin:0 0 2px;">${item.brandName}</p>
          <p style="font-size:12px; color:#c8a882; margin:0;">메뉴 이름</p>
          <p style="font-size:15px; font-weight:700; color:#fff8ec; margin:0 0 6px;">${item.name}</p>
          <p style="font-size:12px; color:#c8a882; margin:0;">설명</p>
          <textarea
            id="swal-desc"
            placeholder="메모를 입력하세요 (선택, 최대 100자)"
            style="width:100%; height:80px; border-radius:8px; border:1px solid #6a4a38;
                   background:#3a2a20; color:#fff8ec; padding:8px; font-size:13px;
                   resize:none; box-sizing:border-box; outline:none; font-family:inherit;"
          ></textarea>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
            <span id="swal-warn-msg" style="font-size:12px; color:#ff5a4f; display:none;">⚠ 최대 100자까지 입력 가능합니다.</span>
            <span style="flex:1;"></span>
            <span id="swal-char-count" style="font-size:12px; color:#c8a882;">0 / 100</span>
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "완료",
    cancelButtonText: "취소",
    confirmButtonColor: " #8bc34a",
    cancelButtonColor: "#ff5a4f",
    background: "#4a2e24",
    color: "#fff8ec",
    width: "480px",
    didOpen: () => {
      const textarea = document.getElementById("swal-desc");
      const counter = document.getElementById("swal-char-count");
      const warnMsg = document.getElementById("swal-warn-msg");
      textarea.addEventListener("input", () => {
        const len = textarea.value.length;
        if (len > MAX_LEN) {
          textarea.value = textarea.value.slice(0, MAX_LEN);
          counter.style.color = "#ff5a4f";
          counter.textContent = `100 / 100`;
          warnMsg.style.display = "inline";
        } else {
          warnMsg.style.display = "none";
          counter.style.color = len === MAX_LEN ? "#ff5a4f" : "#c8a882";
          counter.textContent = `${len} / 100`;
        }
      });
    },
    preConfirm: () => {
      return document.getElementById("swal-desc")?.value ?? "";
    },
  }).then((result) => {
    if (result.isConfirmed) onConfirm(result.value);
  });
};

/* 제보하기 다이얼로그 */
const showReportDialog = (item, onConfirm) => {
  const imgSrc = item.imageUrl || "";
  const MAX_LEN = 500;

  Swal.fire({
    title: "제보하기",
    html: `
      <div style="display:flex; gap:20px; align-items:flex-start; text-align:left; margin-top:8px;">
        <img
          src="${imgSrc}"
          alt="${item.name} 이미지"
          onerror="this.style.background='#fff8f0'"
          style="width:90px; height:90px; object-fit:contain; border-radius:12px; background:#fff8f0; flex-shrink:0; border:1px solid #6a4a38;"
        />
        <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
          <p style="font-size:12px; color:#c8a882; margin:0;">브랜드</p>
          <p style="font-size:13px; font-weight:600; color:#e7b56a; margin:0 0 2px;">${item.brandName}</p>
          <p style="font-size:12px; color:#c8a882; margin:0;">메뉴 이름</p>
          <p style="font-size:15px; font-weight:700; color:#fff8ec; margin:0 0 6px;">${item.name}</p>
          <p style="font-size:12px; color:#c8a882; margin:0;">제보 내용</p>
          <textarea
            id="swal-report"
            placeholder="제보 내용을 입력하세요 (필수, 최대 500자)"
            style="width:100%; height:80px; border-radius:8px; border:1px solid #6a4a38;
                   background:#3a2a20; color:#fff8ec; padding:8px; font-size:13px;
                   resize:none; box-sizing:border-box; outline:none; font-family:inherit;"
          ></textarea>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
            <span id="swal-report-warn" style="font-size:12px; color:#ff5a4f; display:none;">⚠ 최대 500자까지 입력 가능합니다.</span>
            <span style="flex:1;"></span>
            <span id="swal-report-count" style="font-size:12px; color:#c8a882;">0 / 500</span>
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "제보",
    cancelButtonText: "취소",
    confirmButtonColor: "var(--green)",
    cancelButtonColor: "#ff5a4f",
    background: "#4a2e24",
    color: "#fff8ec",
    width: "480px",
    didOpen: () => {
      const textarea = document.getElementById("swal-report");
      const counter = document.getElementById("swal-report-count");
      const warnMsg = document.getElementById("swal-report-warn");

      textarea.addEventListener("input", () => {
        const len = textarea.value.length;
        if (len > MAX_LEN) {
          textarea.value = textarea.value.slice(0, MAX_LEN);
          counter.style.color = "#ff5a4f";
          counter.textContent = `500 / 500`;
          warnMsg.style.display = "inline";
        } else {
          warnMsg.style.display = "none";
          counter.style.color = len === MAX_LEN ? "#ff5a4f" : "#c8a882";
          counter.textContent = `${len} / 500`;
        }
      });

      // ✅ 취소 버튼 클릭 시 내용 있으면 경고
      const cancelBtn = Swal.getCancelButton();
      cancelBtn.addEventListener("click", (e) => {
        const val = textarea.value ?? "";
        if (val.trim() !== "") {
          e.stopImmediatePropagation();
          Swal.fire({
            title: "작성 중인 내용이 있습니다.",
            text: "'네'를 누르면 작성 중인 제보 내용이 사라집니다.",
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
            if (result.isConfirmed) Swal.close();
          });
        }
      });
    },
    // ✅ 내용 없으면 제보 막기
    preConfirm: () => {
      const val = document.getElementById("swal-report")?.value ?? "";
      if (val.trim() === "") {
        Swal.showValidationMessage("제보 내용을 한 글자 이상 입력해주세요.");
        return false;
      }
      return val;
    },
  }).then((result) => {
    if (result.isConfirmed) onConfirm(result.value);
  });
};

/* EatModal 컴포넌트 */
const EatModal = ({ item, onClose, liked, onToggleLike, onAddFavorite }) => {
  const { userId } = useAuthStore();
  const isLogin = !!userId;
  const navigate = useNavigate();

  const compareList = useCompareStore((state) => state.compareList);
  const addCompareMenu = useCompareStore((state) => state.addCompareMenu);
  const MAX_COMPARE = isLogin ? 3 : 2;

  if (!item) return null;

  const handleFavorite = () => {
    if (!isLogin) {
      Swal.fire({
        title: "로그인 필요",
        text: "로그인을 해야 사용할 수 있는 기능입니다.",
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
    if (liked) {
      onToggleLike(item.productId);
    } else {
      showBookmarkDialog(item, (description) => {
        onAddFavorite(item.productId, description);
      });
    }
  };

  const handleReport = () => {
    if (!isLogin) {
      Swal.fire({
        title: "로그인 필요",
        text: "로그인을 해야 사용할 수 있는 기능입니다.",
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

    // ✅ 하루 1회 제한 쿠키 체크
    const cookieKey = `reported_${item.productId}_${userId}`;
    const alreadyReported = document.cookie
      .split("; ")
      .some((c) => c.startsWith(cookieKey));

    if (alreadyReported) {
      Swal.fire({
        title: "이미 제보하셨습니다.",
        text: "같은 메뉴는 하루에 한 번만 제보할 수 있습니다.",
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

    showReportDialog(item, (description) => {
      // ✅ 제보 전 확인 Swal
      Swal.fire({
        title: "제보하시겠습니까?",
        text: "제보 후에는 취소할 수 없습니다.",
        imageUrl: questionImage,
        imageWidth: 120,
        imageHeight: 120,
        imageAlt: "물음표 아이콘",
        showCancelButton: true,
        confirmButtonText: "제보",
        cancelButtonText: "취소",
        confirmButtonColor: "var(--green)",
        cancelButtonColor: "var(--tomato)",
        background: "var(--patty)",
        color: "var(--ivory)",
      }).then((result) => {
        if (!result.isConfirmed) return;

        axios
          .post(`${import.meta.env.VITE_BACKSERVER}/eats/suggestions`, null, {
            params: {
              userId: userId,
              productId: item.productId,
              userNote: description,
            },
          })
          .then(() => {
            const now = new Date();
            const midnight = new Date(now);
            midnight.setHours(24, 0, 0, 0);
            const expires = midnight.toUTCString();
            document.cookie = `${cookieKey}=true; expires=${expires}; path=/`;

            Swal.fire({
              title: "제보가 완료되었습니다.",
              imageUrl: successImage,
              imageWidth: 120,
              imageHeight: 120,
              imageAlt: "완료 아이콘",
              confirmButtonText: "확인",
              confirmButtonColor: "var(--green)",
              background: "var(--patty)",
              color: "var(--ivory)",
            });
          })
          .catch((err) => {
            Swal.fire({
              title: "제보 실패",
              text: err.response?.data || "제보 중 오류가 발생했습니다.",
              imageUrl: warningImage,
              imageWidth: 120,
              imageHeight: 120,
              imageAlt: "경고 아이콘",
              confirmButtonText: "확인",
              confirmButtonColor: "var(--bun)",
              background: "var(--patty)",
              color: "var(--ivory)",
            });
          });
      });
    });
  };

  const handleCompare = () => {
    if (!item) return;
    const isAlready = compareList.some((m) => m.id === item.productId);

    if (isAlready) {
      if (compareList.length >= MAX_COMPARE) {
        Swal.fire({
          title: "메뉴가 모두 담아진 상태라서 \n 비교하기 페이지로 이동합니다.",
          imageUrl: successImage,
          imageWidth: 120,
          imageHeight: 120,
          imageAlt: "완료 아이콘",
          showCancelButton: true,
          confirmButtonText: "이동",
          cancelButtonText: "닫기",
          confirmButtonColor: "var(--bun)",
          cancelButtonColor: "var(--green)",
          background: "var(--patty)",
          color: "var(--ivory)",
        }).then((result) => {
          if (result.isConfirmed) navigate("/esg/stat");
        });
      } else {
        Swal.fire({
          imageUrl: infoImage,
          title: "이미 담긴 메뉴입니다. \n 다른 메뉴를 골라주시기 바랍니다.",
          imageWidth: 120,
          imageHeight: 120,
          imageAlt: "정보 아이콘",
          confirmButtonText: "확인",
          confirmButtonColor: "var(--bun)",
          background: "var(--patty)",
          color: "var(--ivory)",
        });
      }
      return;
    }

    if (compareList.length >= MAX_COMPARE) {
      Swal.fire({
        title: "메뉴가 모두 담아진 상태라서 비교하기 페이지로 이동합니다.",
        imageUrl: successImage,
        imageWidth: 120,
        imageHeight: 120,
        imageAlt: "완료 아이콘",
        showCancelButton: true,
        confirmButtonText: "이동",
        confirmButtonColor: "var(--bun)",
        cancelButtonText: "닫기",
        cancelButtonColor: "var(--green)",
        background: "var(--patty)",
        color: "var(--ivory)",
      }).then((result) => {
        if (result.isConfirmed) navigate("/esg/stat");
      });
      return;
    }

    addCompareMenu({
      id: item.productId,
      brand: item.brandName,
      name: item.name,
      price: item.price,
      calories: item.kcal,
      protein: item.protein,
      fat: item.saturatedFat,
      carbs: item.sugar,
      sodium: item.sodium,
      imageUrl: item.imageUrl,
    });

    const newCount = compareList.length + 1;
    const remaining = MAX_COMPARE - newCount;

    if (newCount === MAX_COMPARE) {
      Swal.fire({
        title: `${MAX_COMPARE}개의 메뉴를 담았습니다.`,
        text: "비교하기 페이지로 이동합니다.",
        imageUrl: successImage,
        imageWidth: 120,
        imageHeight: 120,
        imageAlt: "완료 아이콘",
        showCancelButton: true,
        confirmButtonText: "이동",
        cancelButtonText: "닫기",
        confirmButtonColor: "var(--bun)",
        cancelButtonColor: "var(--green)",
        background: "var(--patty)",
        color: "var(--ivory)",
      }).then((result) => {
        if (result.isConfirmed) navigate("/esg/stat");
      });
      return;
    }

    Swal.fire({
      title: "비교함에 담았습니다.",
      text: `남은 개수는 ${remaining}개입니다. (${newCount}/${MAX_COMPARE})`,
      imageUrl: successImage,
      imageWidth: 120,
      imageHeight: 120,
      imageAlt: "성공 아이콘",
      confirmButtonText: "확인",
      confirmButtonColor: "var(--bun)",
      background: "var(--patty)",
      color: "var(--ivory)",
    });
  };

  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal_box} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.modal_close}
          onClick={onClose}
          aria-label="메뉴 상세 모달 닫기"
        >
          ✕
        </button>
        <div className={styles.modal_left}>
          <img
            src={item.imageUrl}
            alt={item.name}
            className={styles.modal_img}
            onError={(e) => {
              e.target.src = defaultImg;
            }}
          />
        </div>
        <div className={styles.modal_right}>
          <p className={styles.modal_brand}>{item.brandName}</p>
          <h2 className={styles.modal_name}>{item.name}</h2>
          <p className={styles.modal_price}>{item.price?.toLocaleString()}원</p>
          <p className={styles.modal_desc}>{item.description}</p>
          <div className={styles.modal_nutrition}>
            <p className={styles.modal_section_title}>영양 정보</p>
            <div className={styles.nutrition_grid}>
              <div>
                <span>중량</span>
                <span>{item.weight?.toLocaleString()}g</span>
              </div>
              <div>
                <span>칼로리</span>
                <span>{item.kcal?.toLocaleString()} kcal</span>
              </div>
              <div>
                <span>단백질</span>
                <span>{item.protein?.toLocaleString()}g</span>
              </div>
              <div>
                <span>나트륨</span>
                <span>{item.sodium?.toLocaleString()}mg</span>
              </div>
              <div>
                <span>당류</span>
                <span>{item.sugar?.toLocaleString()}g</span>
              </div>
              <div>
                <span>포화지방</span>
                <span>{item.saturatedFat?.toLocaleString()}g</span>
              </div>
              {item.caffeine > 0 && (
                <div>
                  <span>카페인</span>
                  <span>{item.caffeine?.toLocaleString()}mg</span>
                </div>
              )}
            </div>
          </div>

          {item.allergies && item.allergies.length > 0 && (
            <div className={styles.modal_allergy}>
              <p className={styles.modal_section_title}>알러지 정보</p>
              <div className={styles.allergy_tags}>
                {item.allergies.map((allergy, idx) => (
                  <span key={idx} className={styles.allergy_tag}>
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 최근 업데이트 */}
          {item.updatedAt && (
            <p className={styles.modal_update_info}>
              최근 업데이트 {item.updatedAt.slice(0, 10)}
              {item.informerNickname && ` (제공자 : ${item.informerNickname})`}
            </p>
          )}

          <div className={styles.modal_btns}>
            {/* 제보하기 버튼 - 즐겨찾기 왼쪽 */}
            <button className={styles.btn_report} onClick={handleReport}>
              제보하기
            </button>
            <button
              className={styles.btn_like}
              onClick={handleFavorite}
              style={{ background: liked ? "var(--tomato)" : undefined }}
            >
              {liked ? "즐겨찾기 취소" : "즐겨찾기"}
            </button>
            <button className={styles.btn_compare} onClick={handleCompare}>
              비교함 담기
            </button>
            <button
              className={styles.btn_go_review}
              onClick={() =>
                navigate("/esg/gram", {
                  state: {
                    productId: item.productId,
                    menuName: item.name,
                    brandName: item.brandName,
                  },
                })
              }
            >
              후기 보러가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EatModal;
