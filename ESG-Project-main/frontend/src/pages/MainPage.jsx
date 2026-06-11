import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import logoImage from "../assets/ESG LOGO1.png";
import defaultImage from "../assets/default_image.png";

import styles from "./MainPage.module.css";
import EatModal from "./EatModal";
import useCompareStore from "../features/compare/store/useCompareStore";

const S3_IMAGE_BASE =
  "https://esg-project-site.s3.ap-northeast-2.amazonaws.com/";
const BACK_SERVER = import.meta.env.VITE_BACKSERVER ?? "";
const S3_KEY_PREFIXES = [
  "admin/",
  "burger/",
  "file/",
  "grams/",
  "images/",
  "posts/",
  "profile_images/",
];

const DASHBOARD_CONFIG = [
  {
    label: "브랜드 수",
    key: "brandCount",
    unit: "곳",
    icon: "storefront",
  },
  {
    label: "메뉴 수",
    key: "menuCount",
    unit: "개",
    icon: "lunch_dining",
  },
  {
    label: "오늘 선택 수",
    key: "todayChoiceCount",
    unit: "회",
    icon: "ads_click",
  },
  {
    label: "오늘 후기 수",
    key: "todayGramCount",
    unit: "개",
    icon: "rate_review",
  },
];

const BANNER_ITEMS = [
  {
    id: 1,
    theme: "daily",
    badge: "EAT · SEARCH · GATHER",
    title: "오늘 먹을 버거,\n비교하고 고르세요",
    description:
      "가격, 영양 정보, 인기 흐름을 한 화면에서 보고 오늘의 선택을 더 쉽게 정해보세요.",
    brand: "ESG",
    primaryLabel: "메뉴 탐색",
    primaryPath: "/esg/eat",
    secondaryLabel: "비교하기",
    secondaryPath: "/esg/stat",
  },
  {
    id: 2,
    theme: "compare",
    badge: "TODAY COMPARE",
    title: "많이 비교한 조합부터\n빠르게 시작해요",
    description:
      "오늘 사용자들이 자주 비교한 조합을 담아두고, 내 기준에 맞는 메뉴를 골라보세요.",
    brand: "COMPARE",
    primaryLabel: "인기 조합 보기",
    primaryPath: "/esg/stat",
    secondaryLabel: "랜덤 추첨",
    secondaryPath: "/esg/random",
  },
  {
    id: 3,
    theme: "random",
    badge: "RANDOM PICK",
    title: "고민되는 날엔\n가볍게 맡겨보세요",
    description:
      "브랜드와 메뉴를 둘러보다가 결정이 어렵다면 랜덤 추첨으로 후보를 좁혀보세요.",
    brand: "PICK",
    primaryLabel: "랜덤 추첨",
    primaryPath: "/esg/random",
    secondaryLabel: "후기 보기",
    secondaryPath: "/esg/gram",
  },
];

const encodeS3Key = (key) =>
  key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

const getMenuImage = (imageUrl) => {
  const rawUrl = String(imageUrl ?? "").trim();

  if (
    !rawUrl ||
    rawUrl === "default.png" ||
    rawUrl.endsWith("/default.png") ||
    rawUrl.includes("default_image")
  ) {
    return defaultImage;
  }

  if (
    rawUrl.startsWith("http://") ||
    rawUrl.startsWith("https://") ||
    rawUrl.startsWith("data:") ||
    rawUrl.startsWith("blob:")
  ) {
    return rawUrl;
  }

  if (rawUrl.startsWith("//")) {
    return `https:${rawUrl}`;
  }

  const s3Key = rawUrl.replace(/^\/+/, "");

  if (S3_KEY_PREFIXES.some((prefix) => s3Key.startsWith(prefix))) {
    return `${S3_IMAGE_BASE}${encodeS3Key(s3Key)}`;
  }

  if (rawUrl.startsWith("/")) {
    return BACK_SERVER ? `${BACK_SERVER}${rawUrl}` : rawUrl;
  }

  return `${S3_IMAGE_BASE}${encodeS3Key(s3Key)}`;
};

const handleMenuImageError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = defaultImage;
};

const toCompareMenu = (menu) => ({
  id: menu.productId,
  brand: menu.brandName,
  name: menu.productName,
  description: menu.description,
  price: menu.price,
  calories: menu.kcal,
  protein: menu.protein,
  fat: menu.saturatedFat,
  carbs: menu.sugar,
  sodium: menu.sodium,
  imageUrl: getMenuImage(menu.imageUrl),
});

const MainPage = () => {
  const navigate = useNavigate();
  const addCompareMenu = useCompareStore((state) => state.addCompareMenu);
  const clearCompareList = useCompareStore((state) => state.clearCompareList);

  const bannerViewportRef = useRef(null);
  const dragStartXRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const dragPointerIdRef = useRef(null);

  const [activeBanner, setActiveBanner] = useState(0);
  const [isBannerDragging, setIsBannerDragging] = useState(false);
  const [bannerDragOffset, setBannerDragOffset] = useState(0);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [rankingUsers, setRankingUsers] = useState([]);
  const [popularMenus, setPopularMenus] = useState([]);
  const [popularCombos, setPopularCombos] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    brandCount: null,
    menuCount: null,
    todayChoiceCount: null,
    todayGramCount: null,
  });
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    if (isBannerDragging) {
      return undefined;
    }

    const bannerTimer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % BANNER_ITEMS.length);
    }, 3800);
    return () => clearInterval(bannerTimer);
  }, [isBannerDragging]);

  // 오늘 많이 비교된 조합을 가져와 메인 핵심 콘텐츠로 보여줍니다.
  useEffect(() => {
    let isMounted = true;

    const fetchPopularCombos = () => {
      axios
        .get(
          `${import.meta.env.VITE_BACKSERVER}/dashboard/popular-comparison-combos`,
        )
        .then((res) => {
          if (isMounted) {
            setPopularCombos(res.data ?? []);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.error("인기 비교 조합 조회 실패:", err);
            setPopularCombos([]);
          }
        });
    };

    fetchPopularCombos();

    const comboTimer = setInterval(fetchPopularCombos, 10000);

    return () => {
      isMounted = false;
      clearInterval(comboTimer);
    };
  }, []);

  // 사용자 대시보드 숫자를 서버 집계 API에서 가져옵니다.
  // 10초마다 다시 조회해서 선택/후기 작성 직후에도 메인 화면 숫자가 자연스럽게 갱신됩니다.
  useEffect(() => {
    let isMounted = true;

    const fetchDashboardStats = () => {
      axios
        .get(`${import.meta.env.VITE_BACKSERVER}/dashboard/main`)
        .then((res) => {
          if (!isMounted) return;

          setDashboardStats({
            brandCount: res.data.brandCount ?? 0,
            menuCount: res.data.menuCount ?? 0,
            todayChoiceCount: res.data.todayChoiceCount ?? 0,
            todayGramCount: res.data.todayGramCount ?? 0,
          });
          setDashboardError("");
        })
        .catch((err) => {
          if (!isMounted) return;

          console.error("대시보드 데이터 조회 실패:", err);
          setDashboardError("업데이트 지연");
        })
        .finally(() => {
          if (isMounted) {
            setIsDashboardLoading(false);
          }
        });
    };

    fetchDashboardStats();

    const dashboardTimer = setInterval(fetchDashboardStats, 10000);

    return () => {
      isMounted = false;
      clearInterval(dashboardTimer);
    };
  }, []);

  // 사용자 랭킹 API 호출
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/users/ranking`)
      .then((res) => setRankingUsers(res.data));
  }, []);

  // 인기 메뉴 API 호출 (상세 정보 포함)
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/users/popular-menus`)
      .then((res) => {
        const menus = (res.data ?? []).map((menu) => ({
          ...menu,
          imageUrl: getMenuImage(menu.imageUrl),
        }));

        setPopularMenus(menus);
      });
  }, []);

  // 클릭 시 이미 데이터 있으니 바로 모달 오픈
  const handlePopularMenuClick = (menu) => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/eats/${menu.productId}`)
      .then((res) =>
        setSelectedMenu({
          ...res.data,
          imageUrl: getMenuImage(res.data?.imageUrl),
        }),
      );
  };

  const handleAddPopularCombo = (combo) => {
    clearCompareList();
    combo.menus.forEach((menu) => {
      addCompareMenu(toCompareMenu(menu));
    });
    navigate("/esg/stat");
  };

  const comboPreviewMenus =
    popularCombos[0]?.menus?.slice(0, 2).map((menu) => ({
      id: menu.productId,
      brand: menu.brandName,
      name: menu.productName,
      imageUrl: getMenuImage(menu.imageUrl),
    })) ?? [];

  const popularPreviewMenus = popularMenus.slice(0, 2).map((menu) => ({
    id: menu.productId,
    brand: menu.brandName,
    name: menu.name,
    imageUrl: getMenuImage(menu.imageUrl),
  }));

  const heroPreviewMenus =
    comboPreviewMenus.length > 0 ? comboPreviewMenus : popularPreviewMenus;

  const heroMetrics = [
    {
      label: "등록 메뉴",
      value: dashboardStats.menuCount,
      unit: "개",
    },
    {
      label: "오늘 선택",
      value: dashboardStats.todayChoiceCount,
      unit: "회",
    },
  ];

  const fallbackVisualMenus = [
    {
      id: "fallback-logo",
      brand: "ESG",
      name: "메뉴 비교 준비 중",
      imageUrl: logoImage,
    },
    {
      id: "fallback-default",
      brand: "ESG",
      name: "오늘의 선택 기다리는 중",
      imageUrl: defaultImage,
    },
  ];

  const visualMenus = [...heroPreviewMenus, ...fallbackVisualMenus].slice(0, 3);

  const handleBannerPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    if (event.target.closest?.("button, a")) {
      return;
    }

    dragStartXRef.current = event.clientX;
    dragOffsetRef.current = 0;
    dragPointerIdRef.current = event.pointerId;

    setIsBannerDragging(true);
    setBannerDragOffset(0);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleBannerPointerMove = (event) => {
    if (
      !isBannerDragging ||
      dragPointerIdRef.current === null ||
      dragPointerIdRef.current !== event.pointerId
    ) {
      return;
    }

    const nextOffset = event.clientX - dragStartXRef.current;
    const visibleOffset = Math.max(Math.min(nextOffset, 140), -140);

    dragOffsetRef.current = nextOffset;
    setBannerDragOffset(visibleOffset);
  };

  const finishBannerDrag = (event) => {
    if (
      dragPointerIdRef.current === null ||
      dragPointerIdRef.current !== event.pointerId
    ) {
      return;
    }

    const viewportWidth = bannerViewportRef.current?.offsetWidth ?? 0;
    const dragThreshold = Math.min(
      120,
      Math.max(56, Math.round(viewportWidth * 0.12)),
    );
    const finalOffset = dragOffsetRef.current;

    if (finalOffset <= -dragThreshold) {
      setActiveBanner((prev) => (prev + 1) % BANNER_ITEMS.length);
    }

    if (finalOffset >= dragThreshold) {
      setActiveBanner(
        (prev) => (prev - 1 + BANNER_ITEMS.length) % BANNER_ITEMS.length,
      );
    }

    dragStartXRef.current = 0;
    dragOffsetRef.current = 0;
    dragPointerIdRef.current = null;

    setBannerDragOffset(0);
    setIsBannerDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const handleBannerDotClick = (index) => {
    setActiveBanner(index);
    setBannerDragOffset(0);
  };

  return (
    <main className={styles.page}>
      <EatModal
        item={selectedMenu}
        onClose={() => setSelectedMenu(null)}
        liked={false}
        onToggleLike={() => {}}
        onAddFavorite={() => {}}
      />

      <section className={styles.bannerSection}>
        <div
          ref={bannerViewportRef}
          className={
            isBannerDragging
              ? `${styles.bannerViewport} ${styles.draggingBanner}`
              : styles.bannerViewport
          }
          onPointerDown={handleBannerPointerDown}
          onPointerMove={handleBannerPointerMove}
          onPointerUp={finishBannerDrag}
          onPointerCancel={finishBannerDrag}
        >
          <div
            className={styles.bannerTrack}
            style={{
              transform: `translateX(calc(-${
                activeBanner * 100
              }% + ${bannerDragOffset}px))`,
              transition: isBannerDragging ? "none" : undefined,
            }}
          >
            {BANNER_ITEMS.map((banner) => {
              const bannerClassName = [
                styles.banner,
                styles[`${banner.theme}Banner`],
              ]
                .filter(Boolean)
                .join(" ");
              const visualClassName = [
                styles.bannerVisual,
                styles[`${banner.theme}Visual`],
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <article key={banner.id} className={bannerClassName}>
                  <div className={styles.bannerCopy}>
                    <span>{banner.badge}</span>
                    <h1>
                      {banner.title.split("\n").map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </h1>
                    <p>{banner.description}</p>

                    <div className={styles.bannerActions}>
                      <button
                        type="button"
                        className={styles.heroPrimaryButton}
                        onClick={() => navigate(banner.primaryPath)}
                      >
                        {banner.primaryLabel}
                        <span className="material-symbols-outlined">
                          arrow_forward
                        </span>
                      </button>
                      <button
                        type="button"
                        className={styles.heroGhostButton}
                        onClick={() => navigate(banner.secondaryPath)}
                      >
                        {banner.secondaryLabel}
                      </button>
                    </div>
                  </div>

                  <div className={visualClassName}>
                    {banner.theme === "daily" && (
                      <>
                        <div className={styles.heroBrandStrip}>
                          <img src={logoImage} alt="EatStatGram 로고" />
                          <div>
                            <span>{banner.brand}</span>
                            <strong>Eat · Search · Gather</strong>
                          </div>
                        </div>

                        <div className={styles.heroBurgerStage}>
                          <img
                            src={visualMenus[0].imageUrl}
                            alt={visualMenus[0].name}
                            onError={handleMenuImageError}
                          />
                        </div>

                        <div className={styles.heroInfoPanel}>
                          <div className={styles.heroInfoHeader}>
                            <span>오늘의 흐름</span>
                            <strong>
                              {popularCombos[0]
                                ? `${popularCombos[0].compareCount}회 비교`
                                : "업데이트 중"}
                            </strong>
                          </div>

                          <div className={styles.heroMetricGrid}>
                            {heroMetrics.map((metric) => (
                              <div key={metric.label}>
                                <span>{metric.label}</span>
                                <strong>
                                  {isDashboardLoading
                                    ? "-"
                                    : Number(
                                        metric.value ?? 0,
                                      ).toLocaleString()}
                                  <small>{metric.unit}</small>
                                </strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {banner.theme === "compare" && (
                      <div className={styles.compareBoard}>
                        <div className={styles.compareBoardHeader}>
                          <span>인기 비교 조합</span>
                          <strong>
                            {popularCombos[0]
                              ? `${popularCombos[0].compareCount}회`
                              : "준비 중"}
                          </strong>
                        </div>

                        <div className={styles.comparePair}>
                          {visualMenus.slice(0, 2).map((menu, index) => (
                            <div key={menu.id} className={styles.compareMenu}>
                              <span>{index + 1}</span>
                              <img
                                src={menu.imageUrl}
                                alt={menu.name}
                                onError={handleMenuImageError}
                              />
                              <div>
                                <p>{menu.brand}</p>
                                <strong>{menu.name}</strong>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className={styles.compareMeasure}>
                          <span>가격</span>
                          <span>kcal</span>
                          <span>단백질</span>
                        </div>
                      </div>
                    )}

                    {banner.theme === "random" && (
                      <div className={styles.randomDeck}>
                        <div className={styles.randomCardStack}>
                          {visualMenus.map((menu, index) => (
                            <div
                              key={menu.id}
                              className={styles.randomMiniCard}
                            >
                              <img
                                src={menu.imageUrl}
                                alt={menu.name}
                                onError={handleMenuImageError}
                              />
                              <span>{index === 1 ? "PICK" : "?"}</span>
                            </div>
                          ))}
                        </div>

                        <div className={styles.randomResult}>
                          <span>오늘의 후보</span>
                          <strong>{visualMenus[0].name}</strong>
                          <p>브랜드 고민이 길어질 때 한 번에 좁혀보세요.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className={styles.bannerControls}>
          {BANNER_ITEMS.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              className={
                index === activeBanner ? styles.activeDot : styles.bannerDot
              }
              onClick={() => handleBannerDotClick(index)}
              aria-label={`${index + 1}번째 배너 보기`}
            />
          ))}
        </div>
      </section>

      <section className={styles.dashboardSection}>
        <div className={styles.sectionTitle}>
          <span>Dashboard</span>
          <h2>사용자 대시보드</h2>
        </div>
        <div className={styles.dashboardGrid}>
          {DASHBOARD_CONFIG.map((item) => (
            <article key={item.label} className={styles.dashboardCard}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <p>{item.label}</p>
              <strong>
                {isDashboardLoading
                  ? "-"
                  : Number(dashboardStats[item.key]).toLocaleString()}
                <small>{item.unit}</small>
              </strong>
              {dashboardError && <em>{dashboardError}</em>}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.contentGrid}>
        <article className={styles.mainPanel}>
          <div className={styles.panelHeader}>
            <div>
              <span>Today Compare</span>
              <h2>오늘의 인기 비교 조합</h2>
            </div>
            <button type="button" onClick={() => navigate("/esg/stat")}>
              비교하기
            </button>
          </div>
          <div className={styles.comboGrid}>
            {popularCombos.length === 0 ? (
              <div className={styles.emptyCombo}>
                <span className="material-symbols-outlined">query_stats</span>
                <strong>아직 오늘의 비교 조합이 없어요</strong>
                <p>메뉴를 비교하면 이 영역에 인기 조합이 쌓입니다.</p>
              </div>
            ) : (
              popularCombos.map((combo, index) => (
                <article key={combo.comboKey} className={styles.comboCard}>
                  <div className={styles.comboTop}>
                    <span>{index + 1}</span>
                    <p>
                      오늘 <strong>{combo.compareCount}</strong>회 비교
                    </p>
                  </div>

                  <div className={styles.comboMenus}>
                    {combo.menus.map((menu) => (
                      <div key={menu.productId} className={styles.comboMenu}>
                        <div className={styles.comboImage}>
                          <img
                            src={getMenuImage(menu.imageUrl)}
                            alt={menu.productName}
                            onError={handleMenuImageError}
                          />
                        </div>
                        <div>
                          <span>{menu.brandName}</span>
                          <strong>{menu.productName}</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className={styles.comboButton}
                    onClick={() => handleAddPopularCombo(combo)}
                  >
                    이 조합 비교하기
                    <span className="material-symbols-outlined">
                      chevron_right
                    </span>
                  </button>
                </article>
              ))
            )}
          </div>
        </article>

        <article className={styles.sidePanel}>
          <div className={styles.panelHeader}>
            <div>
              <span>Ranking</span>
              <h2>사용자 랭킹</h2>
            </div>
          </div>
          <ol className={styles.rankingList}>
            {rankingUsers.length === 0 ? (
              <p style={{ color: "rgba(255,248,236,0.4)", fontSize: "14px" }}>
                랭킹 데이터가 없습니다.
              </p>
            ) : (
              rankingUsers.map((user, index) => (
                <li key={user.userId}>
                  <span>{index + 1}</span>
                  <strong>{user.nickname}</strong>
                  <p>{user.score}회 선택</p>
                </li>
              ))
            )}
          </ol>
        </article>
      </section>

      <section className={styles.popularSection}>
        <div className={styles.panelHeader}>
          <div>
            <span>Popular Menu</span>
            <h2>인기메뉴</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              navigate("/esg/eat");
              window.scrollTo(0, 0);
            }}
          >
            메뉴 탐색
          </button>
        </div>
        <div className={styles.popularList}>
          {popularMenus.length === 0 ? (
            <p style={{ color: "rgba(255,248,236,0.4)", fontSize: "14px" }}>
              인기 메뉴 데이터가 없습니다.
            </p>
          ) : (
            popularMenus.map((menu, index) => (
              <button
                key={menu.productId}
                type="button"
                className={styles.popularItem}
                onClick={() => handlePopularMenuClick(menu)}
              >
                <span>{index + 1}</span>
                <div className={styles.popularImage}>
                  <img
                    src={getMenuImage(menu.imageUrl)}
                    alt={menu.name}
                    onError={handleMenuImageError}
                  />
                </div>
                <div>
                  <p>{menu.brandName}</p>
                  <strong>{menu.name}</strong>
                </div>
                <small>{menu.count}회</small>
              </button>
            ))
          )}
        </div>
      </section>
    </main>
  );
};

export default MainPage;
