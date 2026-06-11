import { useState } from "react";

import styles from "./ShuffleCard.module.css";

// 랜덤추첨 페이지의 카드 컴포넌트입니다.
// 추첨 전에는 뒷면 카드처럼 보이고, 결과가 나오면 메뉴 정보를 공개합니다.
const ShuffleCard = ({
  menu,
  slotLabel,
  isRevealed = false,
  isShuffling = false,
  shuffleIndex = 0,
}) => {
  const [failedImageUrl, setFailedImageUrl] = useState(null);
  const hasMenuImage = menu.imageUrl && failedImageUrl !== menu.imageUrl;

  // 후보 카드마다 조금씩 다른 움직임을 주기 위한 CSS 변수입니다.
  const shuffleDirection = shuffleIndex % 2 === 0 ? -1 : 1;
  const shuffleStyle = {
    "--shuffle-delay": `${shuffleIndex * 0.08}s`,
    "--shuffle-x": `${shuffleDirection * (10 + shuffleIndex * 2)}px`,
    "--shuffle-y": `${-8 - shuffleIndex}px`,
    "--shuffle-rotate": `${shuffleDirection * (1.8 + shuffleIndex * 0.35)}deg`,
  };

  // isRevealed가 false면 메뉴명을 숨긴 후보 카드 상태로 보여줍니다.
  if (!isRevealed) {
    return (
      <div
        className={`${styles.card} ${isShuffling ? styles.shuffling : ""}`}
        style={shuffleStyle}
      >
        <div className={styles.cardTop}>
          {slotLabel && <p className={styles.slotLabel}>{slotLabel}</p>}
          <span>{menu.brand}</span>
        </div>

        <div className={styles.questionWrap}>
          <span className="material-symbols-outlined">lunch_dining</span>
          <div className={styles.question}>?</div>
        </div>

        {/* 추첨 전에도 가격/칼로리 정도는 힌트로 보여줍니다. */}
        <div className={styles.hiddenInfo}>
          <strong>가려진 메뉴</strong>
          <p>
            {menu.price?.toLocaleString()}원 · {menu.calories}kcal
          </p>
        </div>
      </div>
    );
  }

  // isRevealed가 true면 최종으로 뽑힌 메뉴 정보를 자세히 보여줍니다.
  return (
    <div className={styles.resultCard}>
      <div className={styles.resultImageBox}>
        {/* 이미지가 없거나 로딩 실패하면 기본 햄버거 아이콘으로 대체합니다. */}
        {hasMenuImage ? (
          <img
            src={menu.imageUrl}
            alt={menu.name}
            draggable="false"
            onError={() => setFailedImageUrl(menu.imageUrl)}
          />
        ) : (
          <span>🍔</span>
        )}
      </div>

      <p className={styles.resultBadge}>오늘의 선택</p>
      <p className={styles.brand}>{menu.brand}</p>
      <h3 className={styles.name}>{menu.name}</h3>
      <p className={styles.description}>{menu.description}</p>

      <div className={styles.meta}>
        <span>
          <small>가격</small>
          {menu.price?.toLocaleString()}원
        </span>
        <span>
          <small>칼로리</small>
          {menu.calories}kcal
        </span>
        <span>
          <small>단백질</small>
          {menu.protein}g
        </span>
      </div>
    </div>
  );
};

export default ShuffleCard;
