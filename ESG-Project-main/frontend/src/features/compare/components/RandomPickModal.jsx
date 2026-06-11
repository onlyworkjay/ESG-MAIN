import styles from "./RandomPickModal.module.css";

// 비교하기 페이지에서 랜덤 추첨으로 고른 최종 메뉴를 보여주는 결과 모달입니다.
const RandomPickModal = ({ randomMenu, onClose }) => {
  // 결과 메뉴가 없으면 모달을 렌더링하지 않습니다.
  if (!randomMenu) return null;

  return (
    <div className={styles.modalBackground} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <p className={styles.icon}>🎰</p>

        <h2>랜덤 추첨 결과</h2>

        <p className={styles.resultText}>
          추천 메뉴는 <strong>{randomMenu.name}</strong> 입니다.
        </p>

        {/* 사용자가 바로 판단할 수 있게 브랜드, 가격, 칼로리를 함께 표시합니다. */}
        <p className={styles.infoText}>
          {randomMenu.brand} · {randomMenu.price.toLocaleString()}원 ·{" "}
          {randomMenu.calories} kcal
        </p>

        <button type="button" className={styles.doneButton} onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
};

export default RandomPickModal;
