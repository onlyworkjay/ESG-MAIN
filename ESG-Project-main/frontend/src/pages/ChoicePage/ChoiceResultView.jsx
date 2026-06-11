import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../authstore/useAuthStore";
import useCompareStore from "../../features/compare/store/useCompareStore";
import defaultImg from "../../assets/burger/default.png";
import { resolveMenuImageUrl } from "../../utils/menuImage";
import { toast } from "react-hot-toast";

const hasDisplayValue = (value) => value !== null && value !== undefined && value !== "";

const formatWon = (value) => {
  if (!hasDisplayValue(value)) return "-";

  return `${Number(value).toLocaleString()}원`;
};

const formatMetric = (value, unit = "") => {
  if (!hasDisplayValue(value)) return "-";

  return `${value}${unit}`;
};

const ChoiceResultView = ({ choiceData, loading = false, error = "" }) => {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const clearCompareList = useCompareStore((state) => state.clearCompareList);

  // 페이지 진입 시 전역 비교함 초기화
  useEffect(() => {
    clearCompareList();
  }, [clearCompareList]);

  // 1. 감성 문구 리스트
  const cuppaList = useMemo(
    () => [
      "행복이란 내가 좋아하는 음식과, 그걸 고르느라 즐겁게 낭비한 시간들입니다.",
      "오늘의 고민은 끝났고, 이제 맛있게 먹을 시간만 남았어요.",
      "좋은 선택은 때로 한 입 먹는 순간 증명됩니다.",
      "수많은 메뉴 속에서 오늘의 나를 가장 잘 아는 하나를 골랐어요.",
      "고민의 끝에 도착한 곳이 맛있는 한 끼라면, 그 시간은 낭비가 아니에요.",
      "오늘의 선택이 오늘의 기분을 조금 더 맛있게 만들어줄 거예요.",
      "배고픔은 지나가도, 맛있는 선택은 기억에 남아요.",
      "가끔은 거창한 행복보다, 딱 먹고 싶던 메뉴 하나가 더 위로가 됩니다.",
      "오늘의 메뉴를 고른 순간, 오늘의 작은 행복도 함께 정해졌어요.",
      "한 끼를 고르는 일도 나를 챙기는 방법 중 하나입니다.",
      "고민은 길었지만, 맛있다면 전부 괜찮아요.",
      "오늘의 선택이 내일의 후기가 됩니다.",
      "맛있는 선택 앞에서는 망설임도 추억이 됩니다.",
      "지금 고른 이 메뉴가 오늘 하루의 가장 든든한 결정일지도 몰라요.",
      "고민한 만큼 더 맛있게 느껴지는 메뉴가 있습니다.",
      "오늘의 나에게 필요한 건 완벽한 정답보다 맛있는 한 입입니다.",
      "메뉴를 고르는 시간도 결국 나를 위한 시간이었어요.",
      "좋아하는 음식을 고르는 일에는 늘 작은 설렘이 따라옵니다.",
      "이 선택이 오늘의 기분 좋은 기록으로 남기를 바라요.",
      "행복은 멀리 있지 않고, 지금 고른 메뉴 한 입 안에 있을지도 몰라요.",
    ],
    [],
  );

  // 2. 랜덤 문구 추출
  const randomQuote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * cuppaList.length);
    return cuppaList[randomIndex];
  }, [cuppaList]);

  const {
    choiceId = null,
    selectedProductId = null,
    isMember = false,
  } = choiceData ?? {};
  const choiceItems = Array.isArray(choiceData?.items) ? choiceData.items : [];

  // 회원 API는 productName/brand/productId 형태로 내려오고,
  // 비회원은 비교하기 화면의 name/brand/id 형태로 넘어옵니다.
  // 결과 화면에서는 두 데이터를 같은 이름으로 맞춘 뒤 렌더링합니다.
  const normalizedItems = useMemo(() => {
    return choiceItems.map((item, index) => {
      const productId = item.productId ?? item.id;
      const name = item.name ?? item.productName ?? item.product_name ?? "메뉴";
      const brandName =
        item.brandName ?? item.brand ?? item.brand_name ?? "브랜드";

      return {
        ...item,
        id: item.id ?? productId ?? `choice-item-${index}`,
        productId,
        name,
        brandName,
        brand: item.brand ?? brandName,
        imageUrl: resolveMenuImageUrl(item.imageUrl ?? item.image_url),
        kcal: item.kcal ?? item.calories,
        calories: item.calories ?? item.kcal,
        carbs: item.carbs ?? item.sugar,
        fat: item.fat ?? item.saturatedFat ?? item.saturated_fat,
        description: item.description ?? "",
        protein: item.protein,
        sodium: item.sodium,
        price: item.price,
      };
    });
  }, [choiceItems]);

  const isSameProduct = (leftProductId, rightProductId) => {
    if (leftProductId == null || rightProductId == null) return false;

    return String(leftProductId) === String(rightProductId);
  };

  const selectedItem =
    normalizedItems.find((item) =>
      isSameProduct(item.productId, selectedProductId),
    ) || normalizedItems[0];

  // 로딩 및 에러 예외 처리
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "#FF5C35",
          fontWeight: "bold",
        }}
      >
        데이터를 불러오는 중입니다...
      </div>
    );
  if (error)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "red",
          fontWeight: "bold",
        }}
      >
        {error}
      </div>
    );
  if (!choiceData || !choiceData.items)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "#888",
        }}
      >
        선택된 데이터가 없습니다.
      </div>
    );

  console.log(choiceData);

  // 후기 보러가기 클릭 시
  const handleViewReview = (productId) => {
    navigate(`/esg/gram/${productId}`);
  };

  // 후기 작성하기 클릭 시
  const handleWriteReview = () => {
    if (!isMember || !userId) {
      toast.dismiss();
      toast("🍔로그인 후 작성 가능합니다.🍔", {
        duration: 2000, // 2초 동안 노출
        position: "bottom-center", // 하단 중앙 배치
        style: {
          border: "1px solid var(--bun)",
          padding: "12px 16px",
          background: "var(--patty)",
          color: "var(--ivory)",
          borderRadius: "8px",
        },
      });
      return;
    }
    navigate(`/esg/gram/write/${choiceId}`);
  };

  // [분기 핸들러 3] 다시 비교하기 클릭 시
  const handleReCompare = () => {
    navigate("/esg/stat");
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* 상단 헤더 영역 */}
        <header style={styles.header}>
          <div style={styles.characterIcon}>
            <span style={{ fontSize: "50px" }}>🍔</span>
            <span style={styles.flag}>🚩</span>
          </div>
          <h1 style={styles.title}>
            이걸로 <span style={{ color: "#FF5C35" }}>정했어!</span>
          </h1>
          <p style={styles.subtitle}>
            🔸 이제 고민은 끝, 먹을 일만 남았습니다.
          </p>
          <div style={styles.infoBanner}>
            <span>🔖</span>
            <span>
              고민의 흔적
              <span
                style={{
                  color: "#FF5C35",
                  fontWeight: "bold",
                  margin: "0 4px",
                }}
              >
                {isMember ? "마이페이지에서" : "내마음속에"}
              </span>
              저장되었어요.
            </span>
          </div>
        </header>

        {/* 아이템 존 (3열 그리드) */}
        <div style={styles.grid}>
          {normalizedItems.map((item, index) => {
            const isSelected = isSameProduct(item.productId, selectedProductId);
            const rank = index + 1;

            return (
              <div
                key={item.productId || item.id || index}
                style={{
                  ...styles.card,
                  borderColor: isSelected ? "#FF5C35" : "#EFEFEF",
                  backgroundColor: isSelected ? "#FFFBF9" : "#FFFFFF",
                  transform: isSelected ? "scale(1.03)" : "scale(1)",
                  boxShadow: isSelected
                    ? "0 10px 20px rgba(255, 92, 53, 0.08)"
                    : "0 4px 6px rgba(0,0,0,0.02)",
                }}
              >
                {/* 카드 상단 배지 바 */}
                <div style={styles.cardHeader}>
                  <span style={styles.rankBadge}>{rank}</span>
                  {isSelected && (
                    <span style={styles.selectedBadge}>👑 나의 선택</span>
                  )}
                </div>

                {/* 상품 이미지 및 정보 */}
                <div style={{ textAlign: "center", margin: "16px 0" }}>
                  <div style={styles.imageContainer}>
                    <img
                      src={item.imageUrl || defaultImg}
                      alt={item.name}
                      style={styles.image}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultImg;
                      }}
                    />
                  </div>
                  <div style={styles.brandBadge}>
                    {item.brandName || "브랜드"}
                  </div>
                  <h3 style={styles.burgerName}>{item.name}</h3>
                  {item.description && (
                    <p style={styles.menuDescription}>{item.description}</p>
                  )}
                </div>

                {/* 데이터 테이블 */}
                <div style={styles.table}>
                  <div style={styles.tableRow}>
                    <span style={styles.tableLabel}>가격</span>
                    <span
                      style={{
                        ...styles.tableValue,
                        color: isSelected ? "#FF5C35" : "#333333",
                        fontWeight: "bold",
                      }}
                    >
                      {formatWon(item.price)}
                    </span>
                  </div>
                  <div style={styles.tableRow}>
                    <span style={styles.tableLabel}>열량</span>
                    <span
                      style={{
                        ...styles.tableValue,
                        color: isSelected ? "#FF5C35" : "#555555",
                      }}
                    >
                      {formatMetric(item.kcal, " kcal")}
                    </span>
                  </div>
                  <div style={styles.tableRow}>
                    <span style={styles.tableLabel}>단백질</span>
                    <span
                      style={{
                        ...styles.tableValue,
                        color: isSelected ? "#FF5C35" : "#555555",
                      }}
                    >
                      {formatMetric(item.protein, " g")}
                    </span>
                  </div>
                  <div style={styles.tableRow}>
                    <span style={styles.tableLabel}>당</span>
                    <span
                      style={{
                        ...styles.tableValue,
                        color: isSelected ? "#FF5C35" : "#555555",
                      }}
                    >
                      {formatMetric(item.carbs, " g")}
                    </span>
                  </div>
                  <div style={styles.tableRow}>
                    <span style={styles.tableLabel}>포화지방</span>
                    <span
                      style={{
                        ...styles.tableValue,
                        color: isSelected ? "#FF5C35" : "#555555",
                      }}
                    >
                      {formatMetric(item.fat, " g")}
                    </span>
                  </div>
                  <div style={styles.tableRow}>
                    <span style={styles.tableLabel}>나트륨</span>
                    <span
                      style={{
                        ...styles.tableValue,
                        color: isSelected ? "#FF5C35" : "#555555",
                      }}
                    >
                      {formatMetric(item.sodium, " mg")}
                    </span>
                  </div>
                  <div style={{ ...styles.tableRow, borderBottom: "none" }}>
                    <span style={styles.tableLabel}>후기</span>
                    <button
                      onClick={() => handleViewReview(item.productId)}
                      style={styles.linkButton}
                    >
                      보러가기 ▶
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 하단 기능성 링크/버튼 섹션 */}
        <div style={styles.footerFlex}>
          {/* 좌측: 후기 작성 유도 카드 */}
          <div style={styles.actionCardLeft}>
            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}
            >
              <div style={{ ...styles.iconBox, backgroundColor: "#FFEED9" }}>
                ✏️
              </div>
              <div>
                <h4 style={styles.actionTitle}>
                  <span style={{ color: "#FF5C35" }}>{selectedItem?.name}</span>
                  에 대한 후기를 작성할 수 있어요.
                </h4>
                <p style={styles.actionDesc}>
                  당신의 후기가 다른 사람의 선택에도 도움이 됩니다.
                </p>
                <p style={styles.actionSubDesc}>
                  {isMember
                    ? "지금 작성하지 않아도 마이페이지에서 나중에 작성할 수 있어요."
                    : "회원가입 하시면 마이페이지에서 언제든 후기 관리가 가능합니다."}
                </p>
              </div>
            </div>
            <button onClick={handleWriteReview} style={styles.submitButton}>
              후기 작성하기 ❯
            </button>
          </div>

          {/* 우측: 다시 비교하기 카드 */}
          <div onClick={handleReCompare} style={styles.actionCardRight}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ ...styles.iconBox, backgroundColor: "#DBF0E0" }}>
                🔄
              </div>
              <div>
                <h4 style={{ ...styles.actionTitle, color: "#2D6A4F" }}>
                  아직 고민돼요,
                </h4>
                <p
                  style={{
                    color: "#52B788",
                    fontSize: "14px",
                    fontWeight: "600",
                    margin: "4px 0 0 0",
                  }}
                >
                  다시 비교할래요
                </p>
              </div>
            </div>
            <div
              style={{ color: "#52B788", fontSize: "18px", fontWeight: "bold" }}
            >
              ❯
            </div>
          </div>
        </div>

        {/* 하단 감성 문구 존 */}
        <footer style={styles.quoteFooter}>
          <span style={styles.quoteMarkLeft}>“</span>
          <div style={styles.quoteContent}>
            <span style={{ fontSize: "20px" }}>🍔</span>
            <p style={styles.quoteText}>{randomQuote}</p>
            <span style={{ fontSize: "20px" }}>🥤</span>
          </div>
          <span style={styles.quoteMarkRight}>”</span>
        </footer>
      </div>
    </div>
  );
};

// 3. 내부 스타일 정의 (기존과 동일)
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#FFFDF9",
    padding: "48px 20px",
    fontFamily: "'Pretendard', -apple-system, sans-serif",
    color: "#333333",
    boxSizing: "border-box",
  },
  wrapper: {
    maxWidth: "1024px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  characterIcon: {
    display: "inline-block",
    position: "relative",
    marginBottom: "8px",
  },
  flag: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    fontSize: "20px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "900",
    color: "#222222",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#666666",
    fontSize: "16px",
    fontWeight: "500",
    margin: "0 0 20px 0",
  },
  infoBanner: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#FFF5E5",
    border: "1px solid #FFE3C2",
    color: "#555555",
    padding: "10px 20px",
    borderRadius: "16px",
    fontSize: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    alignItems: "stretch",
    marginBottom: "40px",
  },
  card: {
    position: "relative",
    borderRadius: "28px",
    padding: "24px",
    border: "1px solid",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rankBadge: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#D2C5B4",
    color: "#FFFFFF",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: "bold",
  },
  selectedBadge: {
    backgroundColor: "#FF5C35",
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: "800",
    padding: "4px 12px",
    borderRadius: "12px",
    marginLeft: "auto",
  },
  imageContainer: {
    width: "140px",
    height: "140px",
    margin: "0 auto 12px auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: "20px",
    padding: "8px",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
  brandBadge: {
    display: "inline-block",
    backgroundColor: "#F0F0F0",
    color: "#666666",
    fontSize: "11px",
    fontWeight: "bold",
    padding: "2px 8px",
    borderRadius: "6px",
    marginBottom: "4px",
  },
  burgerName: {
    fontSize: "20px",
    fontWeight: "900",
    color: "#222222",
    margin: "0",
  },
  menuDescription: {
    minHeight: "38px",
    margin: "8px auto 0",
    color: "#8A7A6B",
    fontSize: "13px",
    fontWeight: "600",
    lineHeight: "1.45",
    wordBreak: "keep-all",
  },
  table: {
    marginTop: "20px",
    borderTop: "1px solid #F3F3F3",
    paddingTop: "12px",
    fontSize: "14px",
  },
  tableRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #FAF9F9",
  },
  tableLabel: {
    color: "#888888",
  },
  tableValue: {
    fontWeight: "500",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#999999",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    padding: "0",
  },
  footerFlex: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },
  actionCardLeft: {
    backgroundColor: "#FFFBF5",
    border: "1px solid #F3E6D5",
    borderRadius: "24px",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionCardRight: {
    backgroundColor: "#F3F9F4",
    border: "1px solid #DCEFE0",
    borderRadius: "24px",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "22px",
    flexShrink: 0,
  },
  actionTitle: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#333333",
    margin: "0",
  },
  actionDesc: {
    fontSize: "12px",
    color: "#777777",
    margin: "2px 0 0 0",
  },
  actionSubDesc: {
    fontSize: "11px",
    color: "#A5998A",
    margin: "4px 0 0 0",
  },
  submitButton: {
    backgroundColor: "#FF5C35",
    color: "#FFFFFF",
    border: "none",
    fontSize: "12px",
    fontWeight: "bold",
    padding: "12px 16px",
    borderRadius: "16px",
    cursor: "pointer",
    flexShrink: 0,
    marginLeft: "16px",
  },
  quoteFooter: {
    backgroundColor: "#FAF8F5",
    border: "1px solid #EFECE6",
    borderRadius: "20px",
    padding: "20px 32px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },
  quoteMarkLeft: {
    position: "absolute",
    left: "16px",
    top: "4px",
    fontSize: "36px",
    color: "rgba(229, 222, 201, 0.5)",
    fontFamily: "serif",
  },
  quoteMarkRight: {
    position: "absolute",
    right: "16px",
    bottom: "-14px",
    fontSize: "36px",
    color: "rgba(229, 222, 201, 0.5)",
    fontFamily: "serif",
  },
  quoteContent: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
  },
  quoteText: {
    color: "#555555",
    fontWeight: "500",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0",
  },
};

export default ChoiceResultView;
