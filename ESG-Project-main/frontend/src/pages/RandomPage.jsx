import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

import ShuffleCard from "../features/random/components/ShuffleCard";
import styles from "./RandomPage.module.css";
import { resolveMenuImageUrl } from "../utils/menuImage";

const DRAW_STEPS = [
  "메뉴 카드 섞는 중",
  "한 번 더 섞는 중",
  "마지막 카드 고르는 중",
];

const RandomPage = () => {
  const [menus, setMenus] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("전체");
  const [isShuffling, setIsShuffling] = useState(false);
  const [resultMenu, setResultMenu] = useState(null);
  const [drawStep, setDrawStep] = useState(0);

  const drawTimerRef = useRef([]);

  const clearDrawTimers = () => {
    drawTimerRef.current.forEach((timerId) => clearTimeout(timerId));
    drawTimerRef.current = [];
  };

  const addDrawTimer = (callback, delay) => {
    const timerId = setTimeout(callback, delay);
    drawTimerRef.current.push(timerId);
  };

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const BACK_SERVER = import.meta.env.VITE_BACKSERVER;

        const response = await axios.get(`${BACK_SERVER}/api/product-items`);

        const convertedMenus = response.data.map((item) => ({
          id: item.productId,
          brand: item.brandName ?? item.brand ?? item.brandId,
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

  useEffect(() => {
    return () => {
      drawTimerRef.current.forEach((timerId) => clearTimeout(timerId));
      drawTimerRef.current = [];
    };
  }, []);

  const brands = useMemo(() => {
    const brandCounts = menus.reduce(
      (acc, menu) => {
        acc[menu.brand] = (acc[menu.brand] || 0) + 1;
        acc["전체"] += 1;
        return acc;
      },
      { 전체: 0 },
    );

    return Object.entries(brandCounts).map(([name, count]) => ({
      name,
      count,
    }));
  }, [menus]);

  const filteredMenus =
    selectedBrand === "전체"
      ? menus
      : menus.filter((menu) => menu.brand === selectedBrand);

  const handlePick = () => {
    if (filteredMenus.length === 0 || isShuffling) return;

    clearDrawTimers();
    setIsShuffling(true);
    setResultMenu(null);
    setDrawStep(0);

    addDrawTimer(() => {
      setDrawStep(1);
    }, 700);

    addDrawTimer(() => {
      setDrawStep(2);
    }, 1500);

    addDrawTimer(() => {
      const randomIndex = Math.floor(Math.random() * filteredMenus.length);

      setResultMenu(filteredMenus[randomIndex]);
      setIsShuffling(false);
      setDrawStep(0);
    }, 2400);
  };

  const handleReset = () => {
    clearDrawTimers();
    setResultMenu(null);
    setIsShuffling(false);
    setDrawStep(0);
  };

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <span className={styles.eyebrow}>오늘 메뉴 추천</span>

        <h1>랜덤 메뉴 뽑기</h1>

        <p>
          브랜드를 선택하거나 전체 메뉴 중 하나를 랜덤으로 뽑을 수 있습니다.
        </p>
      </section>

      <section className={styles.filterBox}>
        <div className={styles.filterHeader}>
          <div>
            <p className={styles.filterTitle}>브랜드 필터</p>
            <span>선택한 브랜드 안에서만 추첨합니다.</span>
          </div>

          <p className={styles.countText}>
            대상 <strong>{filteredMenus.length}</strong>개
          </p>
        </div>

        <div className={styles.brandButtons}>
          {brands.map((brand) => (
            <button
              key={brand.name}
              type="button"
              className={
                selectedBrand === brand.name
                  ? styles.activeBrandButton
                  : styles.brandButton
              }
              onClick={() => {
                setSelectedBrand(brand.name);
                setResultMenu(null);
              }}
            >
              <span>{brand.name}</span>
              <strong>{brand.count}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.stagePanel}>
        <div className={styles.stageHeader}>
          <div>
            <span>진행 상태</span>
            <h2>
              {isShuffling ? DRAW_STEPS[drawStep] : "메뉴 카드 준비 완료"}
            </h2>
          </div>

          <strong>{selectedBrand}</strong>
        </div>

        <div
          className={`${styles.drawProgress} ${
            isShuffling ? styles.progressRunning : ""
          }`}
        >
          <span />
        </div>
      </section>

      <section className={styles.cardArea}>
        {resultMenu ? (
          <ShuffleCard menu={resultMenu} isRevealed />
        ) : (
          <>
            {filteredMenus.slice(0, 8).map((menu, index) => (
              <ShuffleCard
                key={menu.id}
                menu={menu}
                isShuffling={isShuffling}
                isRevealed={false}
                slotLabel={`후보 ${index + 1}`}
                shuffleIndex={index}
              />
            ))}

            {filteredMenus.length > 8 && (
              <div className={styles.moreCard}>
                <span>+{filteredMenus.length - 8}</span>
                <span>더</span>
              </div>
            )}
          </>
        )}
      </section>

      <section className={styles.buttonArea}>
        {!resultMenu ? (
          <button
            type="button"
            className={styles.pickButton}
            onClick={handlePick}
            disabled={isShuffling}
          >
            {isShuffling ? "뽑는 중..." : "지금 뽑기"}
          </button>
        ) : (
          <div className={styles.resultButtons}>
            <button
              type="button"
              className={styles.pickButton}
              onClick={handlePick}
            >
              다시 뽑기
            </button>

            <button
              type="button"
              className={styles.resetButton}
              onClick={handleReset}
            >
              초기화
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default RandomPage;
