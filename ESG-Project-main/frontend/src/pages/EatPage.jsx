/* 담당자: 장지혁 */

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./EatPage.module.css";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import Swal from "sweetalert2";
import axios from "axios";
import useAuthStore from "../authstore/useAuthStore";
import EatModal from "./EatModal";
import defaultImg from "../assets/burger/default.png";
import checkImage from "../assets/check.png";
import infoImage from "../assets/info.png";
import questionImage from "../assets/question.png";
import warningImage from "../assets/warning.png";
import successImage from "../assets/success.png";

import useCompareStore from "../features/compare/store/useCompareStore";

const SORT_OPTIONS = [
  { value: "like", label: "인기순" },
  { value: "name", label: "메뉴명" },
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
  { value: "kcal_asc", label: "칼로리 낮은순" },
  { value: "kcal_desc", label: "칼로리 높은순" },
  { value: "protein_asc", label: "단백질 낮은순" },
  { value: "protein_desc", label: "단백질 높은순" },
];

const ITEMS_PER_PAGE = 15;
const PAGE_GROUP = 5;

/* 북마크 수정 다이얼로그 공통 함수 */
const showBookmarkDialog = (item, onConfirm) => {
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
          if (len === MAX_LEN) {
            counter.style.color = "#ff5a4f";
            counter.textContent = `${len} / 100`;
          } else {
            counter.style.color = "#c8a882";
            counter.textContent = `${len} / 100`;
          }
        }
      });
    },
    preConfirm: () => {
      const val = document.getElementById("swal-desc")?.value ?? "";
      return val;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm(result.value);
    }
  });
};

/* 카드 컴포넌트 */
const EatCard = ({ item, onCardClick, liked, onToggleLike }) => {
  const [recentGramCount, setRecentGramCount] = useState(null);
  const { userId } = useAuthStore();
  const isLogin = !!userId;

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/grams`, {
        params: {
          page: 1,
          size: 9999,
          productId: item.productId,
        },
      })
      .then((res) => {
        const allGrams = res.data.items ?? [];
        const now = new Date();
        const recentCount = allGrams.filter((gram) => {
          const createdAt = new Date(gram.createdAt + "Z");
          const diffMs = now - createdAt;
          return diffMs <= 168 * 60 * 60 * 1000;
        }).length;
        setRecentGramCount(recentCount);
      })
      .catch(() => setRecentGramCount(0));
  }, [item.productId]);

  const handleLike = (e) => {
    e.stopPropagation();
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
    onToggleLike(item.productId);
  };

  return (
    <div
      className={styles.eat_card}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onCardClick(item);
      }}
      style={{ cursor: "pointer" }}
    >
      <div className={styles.card_img_wrap}>
        <img
          src={item.imageUrl}
          alt={item.name}
          className={styles.card_img}
          onError={(e) => {
            e.target.src = defaultImg;
          }}
        />
        <button
          type="button"
          className={`${styles.like_btn} ${liked ? styles.liked : ""}`}
          onClick={handleLike}
          aria-label={
            liked ? `${item.name} 즐겨찾기 취소` : `${item.name} 즐겨찾기 추가`
          }
        >
          <FavoriteIcon fontSize="small" />
        </button>
        <p className={styles.card_brand}>{item.brandName}</p>
      </div>

      <div className={styles.card_info}>
        <p className={styles.card_name}>{item.name}</p>
        <p className={styles.card_price}>{item.price.toLocaleString()}원</p>
        {recentGramCount === null ? null : recentGramCount === 0 ? (
          <p className={styles.card_recent_none}>
            최근 7일 동안 등록된 후기 없음
          </p>
        ) : (
          <p className={styles.card_recent_count}>{recentGramCount}건의 후기</p>
        )}
      </div>
    </div>
  );
};

const EatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { userId } = useAuthStore();
  const isLogin = !!userId;

  const clearCompareList = useCompareStore((state) => state.clearCompareList);
  const compareList = useCompareStore((state) => state.compareList);

  const [likedMap, setLikedMap] = useState({});

  const [inputValue, setInputValue] = useState(""); // 입력값 (실시간)
  const [searchKeyword, setSearchKeyword] = useState(""); // 실제 검색어 (엔터/버튼 시 반영)

  const [categories, setCategories] = useState([
    { value: "전체", label: "전체" },
  ]);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/eats/brands`)
      .then((res) => {
        const brandCategories = res.data.map((b) => ({
          value: b,
          label: b,
        }));
        setCategories([{ value: "전체", label: "전체" }, ...brandCategories]);
      })
      .catch(() => {});
  }, []);

  const [eat, setEat] = useState({ sort: "like" });
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eatList, setEatList] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState("like");
  const size = ITEMS_PER_PAGE;

  // 새로고침 시 경고
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (compareList.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [compareList]);

  // 진입 시 초기화
  useEffect(() => {
    clearCompareList();
  }, []);

  // 로그인 상태면 즐겨찾기 목록 불러와서 likedMap 세팅
  useEffect(() => {
    if (!isLogin) return;
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/favorites`, {
        params: { userId },
      })
      .then((res) => {
        const map = {};
        (res.data ?? []).forEach((fav) => {
          map[fav.productId] = true;
        });
        setLikedMap(map);
      })
      .catch(() => {});
  }, [isLogin, userId]);

  // 즐겨찾기 등록
  const handleAddFavorite = (productId, description) => {
    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/favorites`, {
        userId,
        productId,
        description,
      })
      .then(() => {
        setLikedMap((prev) => ({ ...prev, [productId]: true }));
        Swal.fire({
          title: "즐겨찾기 완료",
          imageUrl: successImage,
          imageWidth: 120,
          imageHeight: 120,
          imageAlt: "성공 아이콘",
          confirmButtonText: "확인",
          confirmButtonColor: "var(--green)",
          background: "var(--patty)",
          color: "var(--ivory)",
        });
      })
      .catch(() => {});
  };

  // 즐겨찾기 토글
  const handleToggleLike = (productId) => {
    const isLiked = !!likedMap[productId];
    const item = eatList.find((i) => i.productId === productId);

    if (isLiked) {
      axios
        .delete(`${import.meta.env.VITE_BACKSERVER}/favorites/${productId}`, {
          params: { userId },
        })
        .then(() => {
          setLikedMap((prev) => ({ ...prev, [productId]: false }));
          Swal.fire({
            title: "즐겨찾기가 취소되었습니다.",
            imageUrl: infoImage,
            imageWidth: 120,
            imageHeight: 120,
            imageAlt: "정보 아이콘",
            confirmButtonText: "확인",
            confirmButtonColor: "var(--green)",
            background: "var(--patty)",
            color: "var(--ivory)",
          });
        })
        .catch(() => {});
    } else {
      showBookmarkDialog(item, (description) => {
        axios
          .post(`${import.meta.env.VITE_BACKSERVER}/favorites`, {
            userId,
            productId,
            description,
          })
          .then(() => {
            setLikedMap((prev) => ({ ...prev, [productId]: true }));
            Swal.fire({
              title: "즐겨찾기 완료",
              imageUrl: successImage,
              imageWidth: 120,
              imageHeight: 120,
              imageAlt: "성공 아이콘",
              confirmButtonText: "확인",
              confirmButtonColor: "var(--green)",
              background: "var(--patty)",
              color: "var(--ivory)",
            });
          })
          .catch(() => {});
      });
    }
  };

  const movePage = (e, nextPage) => {
    e.preventDefault();
    e.stopPropagation();
    if (nextPage === page) return;
    setSelectedItem(null);
    setIsModalOpen(false);
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setPage(1);
    setIsModalOpen(false);
    setSelectedItem(null);
  }, [order, selectedCategory, searchKeyword]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/eats`, {
        params: {
          page,
          size,
          order,
          brand: selectedCategory === "전체" ? null : selectedCategory,
          searchKeyword: searchKeyword || null, // searchKeyword 사용
        },
      })
      .then((res) => {
        setEatList(res.data.items ?? []);
        setTotalPages(res.data.totalPage ?? 1);
      })
      .catch((err) => console.error(err));
  }, [page, order, selectedCategory, searchKeyword]);

  useEffect(() => {
    if (location.state?.selectedMenu) {
      setSelectedItem(location.state.selectedMenu);
      setIsModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  // 검색 실행 함수 (엔터 + 돋보기 공통)
  const handleSearch = () => {
    setSearchKeyword(inputValue);
    setPage(1);
  };

  // Enter 키 처리
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleCategory = (cat) => setSelectedCategory(cat);

  const handleRefresh = () => {
    if (compareList.length > 0) {
      Swal.fire({
        title: "새로고침을 하면 고른 메뉴가 초기화됩니다. 그래도 하시겠습니까?",
        imageUrl: warningImage,
        imageWidth: 120,
        imageHeight: 120,
        imageAlt: "경고 아이콘",
        showCancelButton: true,
        confirmButtonText: "새로고침",
        cancelButtonText: "취소",
        confirmButtonColor: "var(--tomato)",
        cancelButtonColor: "var(--green)",
        background: "var(--patty)",
        color: "var(--ivory)",
      }).then((result) => {
        if (result.isConfirmed) window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  const currentGroup = Math.ceil(page / PAGE_GROUP);
  const groupStart = (currentGroup - 1) * PAGE_GROUP + 1;
  const groupEnd = Math.min(groupStart + PAGE_GROUP - 1, totalPages);

  return (
    <div className={styles.page_wrap}>
      <section className={styles.pageHero}>
        <span>Eat Search</span>
        <h1>메뉴 탐색</h1>
        <p>
          브랜드별 햄버거 메뉴를 검색하고, 가격과 영양 정보를 확인해 비교함에
          담아보세요.
        </p>
      </section>

      <EatModal
        item={isModalOpen ? selectedItem : null}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        liked={selectedItem ? !!likedMap[selectedItem.productId] : false}
        onToggleLike={handleToggleLike}
        onAddFavorite={handleAddFavorite}
      />

      <section className={styles.eat_wrap}>
        <div className={styles.sidebar}>
          <p className={styles.sidebar_title}>카테고리</p>
          <ul className={styles.category_list}>
            {categories.map((cat) => (
              <li
                key={cat.value}
                className={`${styles.category_item} ${
                  selectedCategory === cat.value ? styles.active_category : ""
                }`}
                onClick={() => handleCategory(cat.value)}
              >
                {cat.label}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.main_content}>
          <div className={styles.search_box}>
            <div className={styles.input_box}>
              {/* 돋보기 아이콘 클릭 시 검색 가능 */}
              <SearchIcon
                className={styles.search_icon}
                onClick={handleSearch}
                style={{ cursor: "pointer" }}
              />
              <input
                placeholder=" 메뉴, 브랜드 검색"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown} // Enter 시 검색
              />
            </div>
            <button
              type="button"
              className={styles.reset_btn}
              aria-label="검색 조건 초기화"
              onClick={() => {
                setInputValue("");
                setSearchKeyword("");
                setEat({ sort: "like" });
                setSelectedCategory("전체");
                setOrder("like");
                setPage(1);
                setIsModalOpen(false);
                setSelectedItem(null);
              }}
            >
              <RefreshIcon fontSize="small" />
            </button>
            <select
              name="sort"
              value={eat.sort}
              onChange={(e) => {
                setEat({ sort: e.target.value });
                setOrder(e.target.value);
              }}
              className={styles.sort_select}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.card_grid}>
            {eatList.map((item) => (
              <EatCard
                key={`${page}-${item.productId}`}
                item={item}
                liked={!!likedMap[item.productId]}
                onToggleLike={handleToggleLike}
                onCardClick={(clickedItem) => {
                  console.log(clickedItem); // ✅ 추가
                  setSelectedItem(clickedItem);
                  setIsModalOpen(true);
                }}
              />
            ))}
          </div>

          <div className={styles.pagination_wrap}>
            <div className={styles.pagination}>
              <button
                type="button"
                onClick={(e) => movePage(e, 1)}
                disabled={page === 1}
              >
                {"<<"}
              </button>
              <button
                type="button"
                onClick={(e) => movePage(e, Math.max(page - 1, 1))}
                disabled={page === 1}
              >
                {"<"}
              </button>
              {Array.from(
                { length: groupEnd - groupStart + 1 },
                (_, i) => groupStart + i,
              ).map((pageNum) => (
                <button
                  type="button"
                  key={pageNum}
                  onClick={(e) => movePage(e, pageNum)}
                  className={page === pageNum ? styles.active_page : ""}
                >
                  {pageNum}
                </button>
              ))}
              <button
                type="button"
                onClick={(e) => movePage(e, Math.min(page + 1, totalPages))}
                disabled={page === totalPages}
              >
                {">"}
              </button>
              <button
                type="button"
                onClick={(e) => movePage(e, totalPages)}
                disabled={page === totalPages}
              >
                {">>"}
              </button>
            </div>
            <button
              className={styles.scroll_top_btn}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              title="맨 위로 이동"
              aria-label="맨 위로 이동"
            >
              <ArrowUpwardIcon />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EatPage;
