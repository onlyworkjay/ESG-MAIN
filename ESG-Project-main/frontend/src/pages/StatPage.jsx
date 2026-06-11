import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import CompareCard from "../features/compare/components/CompareCard";
import CompareSlot from "../features/compare/components/CompareSlot";
import MenuSelectModal from "../features/compare/components/MenuSelectModal";
import RandomPickModal from "../features/compare/components/RandomPickModal";
import SelectedMenuModal from "../features/compare/components/SelectedMenuModal";
import useCompareStore from "../features/compare/store/useCompareStore";
import useAuthStore from "../authstore/useAuthStore";
import { resolveMenuImageUrl } from "../utils/menuImage";

import styles from "./StatPage.module.css";

// 비교 카드 랜덤 추첨 전에 카드 순서를 섞는 함수입니다.
// 원본 배열은 건드리지 않고 복사본만 섞어서 상태 관리가 꼬이지 않게 합니다.
const shuffleArray = (array) => {
  const shuffledArray = [...array];

  for (let i = shuffledArray.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[randomIndex]] = [
      shuffledArray[randomIndex],
      shuffledArray[i],
    ];
  }

  return shuffledArray;
};

// 메뉴가 하나도 없을 때 보여줄 비교 기준 미리보기 데이터입니다.
// 화면에 반복 렌더링하기 쉽도록 배열로 관리합니다.
const COMPARISON_PREVIEW = [
  {
    icon: "local_fire_department",
    label: "칼로리",
    description: "가볍게 먹고 싶은 날 바로 비교",
  },
  {
    icon: "fitness_center",
    label: "단백질",
    description: "든든함과 포만감 기준으로 비교",
  },
  {
    icon: "payments",
    label: "가격",
    description: "비슷한 메뉴의 가성비 비교",
  },
  {
    icon: "water_drop",
    label: "나트륨",
    description: "짠맛 부담까지 함께 비교",
  },
];

// 랜덤 추천을 만들 때 같은 메뉴가 두 번 들어가지 않도록 중복을 제거합니다.
const getUniqueMenus = (menus) => {
  const menuMap = new Map();

  menus.forEach((menu) => {
    if (menu?.id && !menuMap.has(menu.id)) {
      menuMap.set(menu.id, menu);
    }
  });

  return [...menuMap.values()];
};

// 랜덤 추천 카드에 붙일 문구입니다. 실제 메뉴 조합은 아래 함수에서 매번 섞어 만듭니다.
const RANDOM_RECOMMEND_MESSAGES = [
  {
    title: "오늘의 랜덤 매치",
    description: "고민을 줄이려고 무작위로 뽑은 비교입니다.",
  },
  {
    title: "뜻밖의 맞대결",
    description: "평소에 같이 보지 않던 메뉴를 나란히 비교해보세요.",
  },
];

// 로그인 여부에 따른 비교 가능 개수만큼 메뉴를 뽑아 랜덤 비교 조합을 반환합니다.
const createRandomRecommendCombos = (menus, comboSize) => {
  const uniqueMenus = getUniqueMenus(menus);
  const safeComboSize = Math.min(comboSize, uniqueMenus.length);

  if (safeComboSize < 2) return [];

  const comboIds = new Set();
  const combos = [];

  RANDOM_RECOMMEND_MESSAGES.forEach((message, index) => {
    let selectedMenus = null;
    let selectedId = "";

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const candidateMenus = shuffleArray(uniqueMenus).slice(0, safeComboSize);
      const candidateId = candidateMenus
        .map((menu) => menu.id)
        .sort((a, b) => a - b)
        .join("-");

      if (!comboIds.has(candidateId)) {
        selectedMenus = candidateMenus;
        selectedId = candidateId;
        break;
      }
    }

    if (!selectedMenus) {
      return;
    }

    comboIds.add(selectedId);
    combos.push({
      id: `random-${index}-${selectedId}`,
      title: message.title,
      description: message.description,
      menus: selectedMenus,
    });
  });

  return combos;
};

const StatPage = () => {
  const navigate = useNavigate();

  // 로그인 여부에 따라 비교 가능한 메뉴 개수가 달라집니다.
  const token = useAuthStore((state) => state.token);
  const userId = useAuthStore((state) => state.userId);
  const setChoiceId = useAuthStore((state) => state.setChoiceId);
  const isLogin = !!token;

  const MAX_COMPARE = isLogin ? 3 : 2;

  // 비교 목록은 다른 페이지로 이동해도 유지되어야 하므로 Zustand persist store에서 관리합니다.
  const compareList = useCompareStore((state) => state.compareList);
  const addCompareMenu = useCompareStore((state) => state.addCompareMenu);
  const removeCompareMenu = useCompareStore((state) => state.removeCompareMenu);
  const clearCompareList = useCompareStore((state) => state.clearCompareList);

  // 메뉴 목록, 검색어, 선택된 브랜드, 열린 모달 같은 화면 상태입니다.
  const [menus, setMenus] = useState([]);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("전체");
  const [randomMenu, setRandomMenu] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [recommendRound, setRecommendRound] = useState(0);
  const [isSavingChoice, setIsSavingChoice] = useState(false);
  const [isCheckingChoiceLimit, setIsCheckingChoiceLimit] = useState(false);

  // 랜덤 추첨은 idle -> hidden -> shuffling -> choosing -> revealed 순서로 흘러갑니다.
  const [shufflePhase, setShufflePhase] = useState("idle");
  const [selectedRandomMenu, setSelectedRandomMenu] = useState(null);
  const [shuffleMenus, setShuffleMenus] = useState([]);
  const [shuffleRound, setShuffleRound] = useState(0);

  // 추첨 타이머 id를 모아두었다가 초기화/언마운트 때 한 번에 제거합니다.
  const shuffleTimerRef = useRef([]);

  const isShuffleMode = shufflePhase !== "idle";

  // SweetAlert 경고창을 같은 디자인으로 띄우기 위한 공통 함수입니다.
  const showWarning = (text) => {
    return Swal.fire({
      icon: "warning",
      title: "알림",
      text,
      confirmButtonText: "확인",
      confirmButtonColor: "#f5b95f",
      background: "#2b1d10",
      color: "#fff8ec",
      didOpen: () => {
        const container = Swal.getContainer();
        if (container) {
          container.style.zIndex = "2000";
        }
      },
    });
  };

  // 진행 중인 추첨 타이머가 남아 있으면 이전 추첨 상태가 뒤늦게 실행될 수 있어서 모두 정리합니다.
  const clearShuffleTimers = () => {
    shuffleTimerRef.current.forEach((timerId) => clearTimeout(timerId));
    shuffleTimerRef.current = [];
  };

  // setTimeout을 바로 쓰지 않고 저장해 두면 취소가 쉬워집니다.
  const addShuffleTimer = (callback, delay) => {
    const timerId = setTimeout(callback, delay);
    shuffleTimerRef.current.push(timerId);
  };

  useEffect(() => {
    // 백엔드 메뉴 데이터를 프론트에서 쓰기 좋은 이름으로 변환합니다.
    const fetchMenus = async () => {
      try {
        const BACK_SERVER = import.meta.env.VITE_BACKSERVER;
        const response = await axios.get(`${BACK_SERVER}/api/product-items`);

        const convertedMenus = response.data.map((item) => ({
          id: item.productId,
          brand: item.brandName ?? item.brand ?? String(item.brandId),
          name: item.productName,
          description: item.description,
          price: item.price,
          calories: item.kcal,
          protein: item.protein,
          fat: item.saturatedFat,
          carbs: item.sugar,
          sodium: item.sodium,
          imageUrl: resolveMenuImageUrl(item.imageUrl),
        }));

        setMenus(convertedMenus);
      } catch (error) {
        console.error("메뉴 데이터 조회 실패:", error);
      }
    };

    fetchMenus();
  }, []);

  // 메뉴 데이터에서 실제 브랜드 목록을 만들기 때문에, 마스터가 브랜드를 추가해도 자동으로 표시됩니다.
  const brandOptions = useMemo(() => {
    const uniqueBrands = new Set();

    menus.forEach((menu) => {
      if (menu.brand) {
        uniqueBrands.add(menu.brand);
      }
    });

    return ["전체", ...uniqueBrands];
  }, [menus]);

  useEffect(() => {
    // 페이지를 벗어날 때 남은 타이머를 제거해 메모리 누수와 늦은 상태 변경을 막습니다.
    return () => {
      shuffleTimerRef.current.forEach((timerId) => clearTimeout(timerId));
      shuffleTimerRef.current = [];
    };
  }, []);

  // 메뉴 추가 모달에서 검색어와 브랜드 필터를 동시에 적용한 결과입니다.
  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      const searchText = `${menu.brand} ${menu.name}`.toLowerCase();
      const matchesKeyword = searchText.includes(keyword.toLowerCase());
      const matchesBrand =
        selectedBrand === "전체" || menu.brand === selectedBrand;

      return matchesKeyword && matchesBrand;
    });
  }, [menus, keyword, selectedBrand]);

  // 빈 화면에서 바로 담아볼 수 있는 랜덤 메뉴입니다. 다시 섞기를 누르면 목록이 바뀝니다.
  const quickPickMenus = useMemo(() => {
    return shuffleArray(getUniqueMenus(menus)).slice(0, 4);
  }, [menus, recommendRound]);

  // 메뉴 데이터에서 비교 가능 개수만큼 뽑은 랜덤 비교 조합입니다. 다시 섞기를 누르면 새 조합이 나옵니다.
  const randomRecommendCombos = useMemo(() => {
    return createRandomRecommendCombos(menus, MAX_COMPARE);
  }, [menus, recommendRound, MAX_COMPARE]);

  // 같은 메뉴가 이미 비교 목록에 있는지 확인합니다.
  const isAlreadyAdded = (menuId) => {
    return compareList.some((menu) => menu.id === menuId);
  };

  // 메뉴 하나를 비교 목록에 추가합니다. 중복과 최대 개수를 먼저 검사합니다.
  const handleAddMenu = (menu) => {
    if (isShuffleMode) return;

    if (isAlreadyAdded(menu.id)) {
      showWarning("이미 추가된 메뉴입니다.");
      return;
    }

    if (compareList.length >= MAX_COMPARE) {
      showWarning(
        isLogin
          ? "최대 3개까지 비교할 수 있습니다."
          : "비로그인은 최대 2개까지 비교할 수 있습니다.",
      );
      return;
    }

    addCompareMenu(menu);
  };

  // 랜덤 추천을 한 번에 담되, 이미 담긴 메뉴와 남은 슬롯 수를 고려합니다.
  const handleAddCombo = (comboMenus) => {
    if (isShuffleMode) return;

    const remainCount = MAX_COMPARE - compareList.length;

    if (remainCount <= 0) {
      showWarning(
        isLogin
          ? "최대 3개까지 비교할 수 있습니다."
          : "비로그인은 최대 2개까지 비교할 수 있습니다.",
      );
      return;
    }

    const availableMenus = comboMenus
      .filter((menu) => !isAlreadyAdded(menu.id))
      .slice(0, remainCount);

    if (availableMenus.length === 0) {
      showWarning("이미 추가된 메뉴입니다.");
      return;
    }

    availableMenus.forEach((menu) => addCompareMenu(menu));
  };

  // 랜덤 추천 카드와 quick pick 메뉴를 새로 섞습니다.
  const handleRefreshRecommendation = () => {
    if (isShuffleMode) return;

    setRecommendRound((prev) => prev + 1);
  };

  // 비교 목록에서 메뉴를 제거하고, 해당 메뉴로 열려 있던 모달 상태도 같이 정리합니다.
  const handleRemoveMenu = (menuId) => {
    if (isShuffleMode) return;

    removeCompareMenu(menuId);

    if (randomMenu?.id === menuId) {
      setRandomMenu(null);
    }

    if (selectedMenu?.id === menuId) {
      setSelectedMenu(null);
    }
  };

  // 비교 목록, 필터, 추첨 상태를 모두 처음 상태로 되돌립니다.
  const handleClear = () => {
    clearShuffleTimers();
    clearCompareList();
    setRandomMenu(null);
    setSelectedMenu(null);
    setKeyword("");
    setSelectedBrand("전체");
    setShufflePhase("idle");
    setSelectedRandomMenu(null);
    setShuffleMenus([]);
  };

  // 랜덤 추첨 시작 버튼 로직입니다. 확인창을 거친 뒤 카드 뒤집기와 셔플 타이밍을 실행합니다.
  const handleRandomPick = async () => {
    if (isShuffleMode) return;

    if (compareList.length < 2) {
      showWarning("메뉴를 2개 이상 추가해야 랜덤 추첨을 할 수 있습니다.");
      return;
    }

    const result = await Swal.fire({
      icon: "question",
      title: "랜덤 추첨을 하시겠습니까?",
      text: "선택된 메뉴 카드가 섞인 뒤, 직접 하나를 고를 수 있습니다.",
      showCancelButton: true,
      confirmButtonText: "추첨 시작",
      cancelButtonText: "취소",
      confirmButtonColor: "#f5b95f",
      cancelButtonColor: "#6b5a48",
      background: "#2b1d10",
      color: "#fff8ec",
    });

    if (!result.isConfirmed) return;

    clearShuffleTimers();
    setRandomMenu(null);
    setSelectedRandomMenu(null);
    // 실제 화면에 보여줄 카드 배열을 한 번 섞고, key도 새로 만들어 애니메이션이 다시 실행되게 합니다.
    setShuffleMenus(shuffleArray(compareList));
    setShuffleRound((prev) => prev + 1);
    setShufflePhase("hidden");

    // 잠깐 카드를 뒤집어 숨긴 뒤 셔플 애니메이션을 시작합니다.
    addShuffleTimer(() => {
      setShufflePhase("shuffling");
    }, 520);

    // 셔플이 끝나면 사용자가 직접 카드를 고를 수 있는 상태로 바꿉니다.
    addShuffleTimer(() => {
      setShufflePhase("choosing");
    }, 3600);
  };

  // 사용자가 셔플된 카드 중 하나를 고르면 결과 모달로 넘길 메뉴를 저장합니다.
  const handleSelectShuffleCard = (menu) => {
    if (shufflePhase !== "choosing") return;

    setSelectedRandomMenu(menu);
    setShufflePhase("revealed");

    clearShuffleTimers();
    addShuffleTimer(() => {
      setRandomMenu(menu);
      setShufflePhase("idle");
      setSelectedRandomMenu(null);
      setShuffleMenus([]);
    }, 1200);
  };

  // 셔플 중에는 메뉴 추가/상세 모달이 열리지 않도록 막습니다.
  const handleOpenMenuModal = () => {
    if (isShuffleMode) return;
    setIsMenuModalOpen(true);
  };

  const handleOpenSelectedMenuModal = async (menu) => {
    if (isShuffleMode || isCheckingChoiceLimit) return;

    // 회원은 모달을 열기 전에 오늘 선택 횟수를 먼저 확인합니다.
    // 3회를 이미 채웠다면 선택 모달 뒤에 알림이 깔리지 않고 바로 안내가 보입니다.
    if (isLogin && userId) {
      try {
        setIsCheckingChoiceLimit(true);

        const response = await axios.get(
          `${import.meta.env.VITE_BACKSERVER}/choices/users/${userId}/daily-status`,
        );

        if (response.data.limitReached) {
          await showWarning("하루 선택은 최대 3번까지 가능합니다.");
          return;
        }
      } catch (error) {
        console.error("선택 가능 횟수 확인 실패:", error);
        await showWarning(
          error.response?.data ||
            "선택 가능 횟수를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.",
        );
        return;
      } finally {
        setIsCheckingChoiceLimit(false);
      }
    }

    setSelectedMenu(menu);
  };

  // 선택 확인 모달에서 최종 확정하면 회원은 choices POST 후 회원 선택 페이지로,
  // 비회원은 저장 없이 비회원 선택 페이지로 이동합니다.
  const handleConfirmSelectedMenu = async () => {
    if (!selectedMenu || isSavingChoice) return;

    const choiceMenus = compareList;
    const selectedProductId = selectedMenu.id;

    if (!isLogin || !userId) {
      setSelectedMenu(null);
      navigate("/choice/notuser", {
        state: {
          choiceId: null,
          choiceGroupId: null,
          isMember: false,
          menus: choiceMenus,
          selectedProductId,
        },
      });
      return;
    }

    try {
      setIsSavingChoice(true);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKSERVER}/choices`,
        {
          userId,
          selectedProductId,
          items: choiceMenus.map((menu, index) => ({
            productId: menu.id,
            displayOrder: index + 1,
          })),
        },
      );

      const savedChoiceId = response.data.choiceId;
      const savedChoiceGroupId = response.data.choiceGroupId;
      setChoiceId(savedChoiceId);
      setSelectedMenu(null);

      navigate(`/choice/${savedChoiceId}`, {
        state: {
          choiceId: savedChoiceId,
          choiceGroupId: savedChoiceGroupId,
          isMember: true,
          menus: choiceMenus,
          selectedProductId,
        },
      });
    } catch (error) {
      console.error("선택 저장 실패:", error);
      setSelectedMenu(null);
      await showWarning(
        error.response?.data ||
          "선택 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsSavingChoice(false);
    }
  };

  const handleCloseMenuModal = () => {
    setIsMenuModalOpen(false);
    setKeyword("");
    setSelectedBrand("전체");
  };

  // 셔플 중에는 원래 compareList 대신 섞인 shuffleMenus를 화면에 보여줍니다.
  const visibleCompareMenus = isShuffleMode ? shuffleMenus : compareList;
  const isEmptyCompare = compareList.length === 0 && !isShuffleMode;

  return (
    <div className={styles.page}>
      {/* 페이지 상단 설명 영역 */}
      <section className={styles.header}>
        <span className={styles.eyebrow}>Compare Stat</span>

        <h1 className={styles.title}>메뉴 비교하기</h1>

        <p className={styles.description}>
          고른 메뉴의 가격과 영양 정보를 나란히 비교하고, 랜덤 추첨으로
          오늘의 선택까지 이어가보세요.
        </p>

        {!isLogin && (
          <p className={styles.loginNotice}>
            비로그인 상태에서는 최대 2개까지 비교할 수 있습니다. 로그인 하시면
            최대 3개까지 비교할 수 있습니다.
          </p>
        )}
      </section>

      {/* 선택된 개수와 주요 행동 버튼을 보여주는 컨트롤 영역 */}
      <section className={styles.controlArea}>
        <div className={styles.selectionSummary}>
          <span className="material-symbols-outlined">monitoring</span>

          <div>
            <p>선택된 메뉴</p>
            <strong>
              {compareList.length} / {MAX_COMPARE}
            </strong>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.addButton}
            onClick={handleOpenMenuModal}
            disabled={isShuffleMode}
          >
            <span className="material-symbols-outlined">add</span>
            메뉴 추가
          </button>

          <button
            type="button"
            className={styles.randomButton}
            onClick={handleRandomPick}
            disabled={isShuffleMode}
          >
            <span className="material-symbols-outlined">casino</span>
            {shufflePhase === "shuffling"
              ? "섞는 중"
              : shufflePhase === "choosing"
                ? "카드 선택"
                : "랜덤 추첨"}
          </button>

          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            disabled={compareList.length === 0 && !isShuffleMode}
          >
            <span className="material-symbols-outlined">restart_alt</span>
            초기화
          </button>
        </div>
      </section>

      {isEmptyCompare ? (
        // 비교 메뉴가 없을 때는 빈 슬롯, 랜덤 추천, 비교 기준 안내를 먼저 보여줍니다.
        <section className={styles.emptyComparePanel}>
          <div className={styles.emptySlotBoard}>
            <div className={styles.emptySlotHeader}>
              <div>
                <span>비교 칸</span>
                <h2>비교할 메뉴를 먼저 담아보세요</h2>
              </div>

              <p>
                빈 칸을 누르면 메뉴를 추가할 수 있습니다. 비회원은 2개,
                로그인하면 3개까지 비교할 수 있어요.
              </p>
            </div>

            <div
              className={styles.emptySlotGrid}
              style={{
                gridTemplateColumns: `repeat(${MAX_COMPARE}, 1fr)`,
              }}
            >
              {Array.from({ length: MAX_COMPARE }).map((_, index) => (
                <CompareSlot key={index} onClick={handleOpenMenuModal} />
              ))}
            </div>
          </div>

          <div className={styles.emptyHero}>
            <div className={styles.emptyIllustration}>
              <span className="material-symbols-outlined">lunch_dining</span>
              <strong>VS</strong>
              <div className={styles.emptyMetricOne}>칼로리</div>
              <div className={styles.emptyMetricTwo}>단백질</div>
            </div>

            <div className={styles.emptyCopy}>
              <span>비교 시작</span>
              <h2>오늘 메뉴, 감 말고 수치로 고르기</h2>
              <p>
                비슷해 보이는 햄버거도 가격, 칼로리, 단백질, 나트륨을 나란히
                보면 선택이 훨씬 쉬워집니다.
              </p>

              <div className={styles.emptyActions}>
                <button
                  type="button"
                  className={styles.primaryEmptyButton}
                  onClick={handleOpenMenuModal}
                >
                  <span className="material-symbols-outlined">add</span>
                  메뉴 고르기
                </button>

                {randomRecommendCombos[0] && (
                  <button
                    type="button"
                    className={styles.secondaryEmptyButton}
                    onClick={() =>
                      handleAddCombo(randomRecommendCombos[0].menus)
                    }
                  >
                    <span className="material-symbols-outlined">casino</span>
                    랜덤 추천 담기
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={styles.previewGrid}>
            {COMPARISON_PREVIEW.map((item) => (
              <article key={item.label} className={styles.previewCard}>
                <span className="material-symbols-outlined">{item.icon}</span>
                <strong>{item.label}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>

          {(randomRecommendCombos.length > 0 || quickPickMenus.length > 0) && (
            <div className={styles.recommendPanel}>
              <div className={styles.recommendHeader}>
                <div>
                  <span className={styles.recommendTitleLabel}>
                    랜덤 추천
                  </span>
                  <h3>오늘은 이렇게 비교해볼까요?</h3>
                </div>

                <div className={styles.recommendHeaderActions}>
                  <p>새로 섞을 때마다 다른 메뉴가 나와요.</p>

                  {randomRecommendCombos.length > 0 && (
                    <button
                      type="button"
                      className={styles.refreshRecommendButton}
                      onClick={handleRefreshRecommendation}
                    >
                      <span className="material-symbols-outlined">sync</span>
                      다시 섞기
                    </button>
                  )}
                </div>
              </div>

              {randomRecommendCombos.length > 0 && (
                <div className={styles.comboGrid}>
                  {randomRecommendCombos.map((combo) => (
                    <article key={combo.id} className={styles.comboCard}>
                      <div>
                        <span>{combo.title}</span>
                        <strong>
                          {combo.menus.map((menu) => menu.name).join(" · ")}
                        </strong>
                        <p>{combo.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddCombo(combo.menus)}
                      >
                        담기
                      </button>
                    </article>
                  ))}
                </div>
              )}

              <div className={styles.quickPickList}>
                {quickPickMenus.map((menu) => (
                  <button
                    key={menu.id}
                    type="button"
                    className={styles.quickPickItem}
                    onClick={() => handleAddMenu(menu)}
                  >
                    <span className="material-symbols-outlined">
                      lunch_dining
                    </span>
                    <div>
                      <p>{menu.brand}</p>
                      <strong>{menu.name}</strong>
                    </div>
                    <small>{menu.calories} kcal</small>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        // 비교 메뉴가 있으면 실제 비교 카드와 남은 빈 슬롯을 렌더링합니다.
        <section
          className={`${styles.compareGrid} ${
            isShuffleMode ? styles.shuffleStage : ""
          } ${shufflePhase === "shuffling" ? styles.shuffleStageActive : ""} ${
            shufflePhase === "choosing" ? styles.chooseStage : ""
          }`}
          style={{
            gridTemplateColumns: `repeat(${MAX_COMPARE}, 1fr)`,
          }}
        >
          {visibleCompareMenus.map((menu, index) => (
            <CompareCard
              key={isShuffleMode ? `${shuffleRound}-${menu.id}` : menu.id}
              menu={menu}
              onRemove={handleRemoveMenu}
              shufflePhase={shufflePhase}
              shuffleIndex={index}
              isSelected={selectedRandomMenu?.id === menu.id}
              onShuffleSelect={() => handleSelectShuffleCard(menu)}
              onSelect={handleOpenSelectedMenuModal}
            />
          ))}

          {!isShuffleMode &&
            Array.from({ length: MAX_COMPARE - compareList.length }).map(
              (_, index) => (
                <CompareSlot key={index} onClick={handleOpenMenuModal} />
              ),
            )}
        </section>
      )}

      {isMenuModalOpen && (
        <MenuSelectModal
          keyword={keyword}
          setKeyword={setKeyword}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          brandOptions={brandOptions}
          filteredMenus={filteredMenus}
          compareList={compareList}
          maxCompare={MAX_COMPARE}
          isAlreadyAdded={isAlreadyAdded}
          onAddMenu={handleAddMenu}
          onRemoveMenu={handleRemoveMenu}
          onClose={handleCloseMenuModal}
        />
      )}

      {randomMenu && (
        <RandomPickModal
          randomMenu={randomMenu}
          onClose={() => setRandomMenu(null)}
        />
      )}

      {selectedMenu && (
        <SelectedMenuModal
          menu={selectedMenu}
          onClose={() => setSelectedMenu(null)}
          onConfirm={handleConfirmSelectedMenu}
          isSubmitting={isSavingChoice}
        />
      )}
    </div>
  );
};

export default StatPage;
