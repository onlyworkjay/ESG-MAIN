import { useState } from "react";

import styles from "./CompareCard.module.css";
import { resolveMenuImageUrl } from "../../../utils/menuImage";

// 비교하기 페이지에서 실제 메뉴 정보를 보여주는 카드입니다.
// 평상시에는 앞면 정보를 보여주고, 랜덤 추첨 중에는 뒷면 카드로 바뀝니다.
const CompareCard = ({
  menu,
  onRemove,
  shufflePhase = "idle",
  shuffleIndex = 0,
  isSelected = false,
  onShuffleSelect,
  onSelect,
}) => {
  const [failedImageUrl, setFailedImageUrl] = useState(null);

  // shufflePhase가 idle이 아니면 카드가 랜덤 추첨 모드로 동작합니다.
  const isShuffleMode = shufflePhase !== "idle";
  const isBackVisible =
    shufflePhase === "hidden" ||
    shufflePhase === "shuffling" ||
    shufflePhase === "choosing";
  const menuImageUrl = resolveMenuImageUrl(menu.imageUrl);
  const hasMenuImage = menuImageUrl && failedImageUrl !== menuImageUrl;

  // 카드마다 이동 방향/거리/회전을 다르게 줘서 섞이는 느낌을 만듭니다.
  const shuffleDirection = shuffleIndex % 2 === 0 ? -1 : 1;
  const shuffleDistance = 52 + shuffleIndex * 18;
  const shuffleLift = 18 + shuffleIndex * 5;
  const shuffleDrop = 10 + shuffleIndex * 4;
  const shuffleRotate = 4.2 + shuffleIndex * 1.1;
  const shuffleStyle = {
    "--compare-card-layer": isShuffleMode ? 10 + shuffleIndex : 2,
    "--shuffle-index": shuffleIndex,
    "--shuffle-delay": `${shuffleIndex * 0.13}s`,
    "--shuffle-x-a": `${shuffleDirection * shuffleDistance * 0.45}px`,
    "--shuffle-y-a": `${-shuffleLift}px`,
    "--shuffle-r-a": `${shuffleDirection * shuffleRotate * 0.7}deg`,
    "--shuffle-x-b": `${shuffleDirection * shuffleDistance * -0.85}px`,
    "--shuffle-y-b": `${shuffleDrop}px`,
    "--shuffle-r-b": `${shuffleDirection * shuffleRotate * -1.1}deg`,
    "--shuffle-x-c": `${shuffleDirection * shuffleDistance * 0.74}px`,
    "--shuffle-y-c": `${-shuffleLift * 0.46}px`,
    "--shuffle-r-c": `${shuffleDirection * shuffleRotate * 0.9}deg`,
    "--shuffle-x-d": `${shuffleDirection * shuffleDistance * -0.32}px`,
    "--shuffle-y-d": `${shuffleDrop * 0.38}px`,
    "--shuffle-r-d": `${shuffleDirection * shuffleRotate * -0.42}deg`,
    "--choose-lift": `${-(9 + shuffleIndex * 2)}px`,
    "--choose-rotate": `${shuffleDirection * 0.75}deg`,
  };

  // 랜덤 추첨의 choosing 단계에서만 카드 클릭을 결과 선택으로 처리합니다.
  const handleCardClick = () => {
    if (!isShuffleMode) return;
    if (shufflePhase !== "choosing") return;
    onShuffleSelect?.();
  };

  return (
    <div
      className={`
        ${styles.card}
        ${isShuffleMode ? styles.shuffleMode : ""}
        ${isBackVisible ? styles.backVisible : ""}
        ${shufflePhase === "shuffling" ? styles.shuffling : ""}
        ${shufflePhase === "choosing" ? styles.choosing : ""}
        ${isSelected ? styles.selectedCard : ""}
      `}
      style={shuffleStyle}
      onClick={handleCardClick}
    >
      <div className={styles.cardInner}>
        <div className={styles.cardFront}>
          {/* 추첨 중에는 삭제하면 카드 목록이 꼬일 수 있으므로 삭제 버튼을 숨깁니다. */}
          {!isShuffleMode && (
            <button
              type="button"
              className={styles.removeButton}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(menu.id);
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}

          {/* 이미지 로딩 실패 시 기본 햄버거 아이콘으로 대체합니다. */}
          <div className={styles.imageArea}>
            {hasMenuImage ? (
              <img
                className={styles.menuImage}
                src={menuImageUrl}
                alt={menu.name}
                draggable="false"
                onError={() => setFailedImageUrl(menuImageUrl)}
              />
            ) : (
              <div className={styles.burgerImage}>🍔</div>
            )}
          </div>

          <div className={styles.content}>
            <div className={styles.brandRow}>
              <p className={styles.brand}>{menu.brand}</p>
            </div>

            <h2 className={styles.menuName}>{menu.name}</h2>

            <p className={styles.description}>{menu.description}</p>

            <div className={styles.infoTable}>
              {/* 같은 모양의 영양 정보 줄은 CompareRow 컴포넌트로 반복 렌더링합니다. */}
              <CompareRow
                label="가격"
                value={`${menu.price?.toLocaleString()}원`}
              />

              <CompareRow label="칼로리" value={`${menu.calories} kcal`} />

              <CompareRow label="단백질" value={`${menu.protein} g`} />

              <CompareRow label="지방" value={`${menu.fat} g`} />

              <CompareRow label="탄수화물" value={`${menu.carbs} g`} />

              <CompareRow label="나트륨" value={`${menu.sodium} mg`} />
            </div>

            {/* 카드 자체 선택은 상세 확인 모달을 여는 동작입니다. */}
            <button
              type="button"
              className={styles.selectButton}
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(menu);
              }}
            >
              <span className="material-symbols-outlined">ads_click</span>
              이걸로 선택!
            </button>
          </div>
        </div>

        {/* 랜덤 추첨 중 사용자에게 보이는 카드 뒷면입니다. */}
        <div className={styles.cardBack}>
          <span className="material-symbols-outlined">casino</span>
          <strong>?</strong>
          <p>
            {shufflePhase === "choosing" ? "카드를 선택하세요" : "섞는 중..."}
          </p>
        </div>
      </div>
    </div>
  );
};

// 라벨과 값을 한 줄로 보여주는 작은 비교 정보 컴포넌트입니다.
const CompareRow = ({ label, value }) => {
  return (
    <div className={styles.row}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
};

export default CompareCard;
