import { useState } from "react";

import styles from "./SelectedMenuModal.module.css";
import { resolveMenuImageUrl } from "../../../utils/menuImage";

// 비교 카드의 "이걸로 선택!" 버튼을 눌렀을 때 보여주는 확인 모달입니다.
const SelectedMenuModal = ({ menu, onClose, onConfirm, isSubmitting = false }) => {
  const [failedImageUrl, setFailedImageUrl] = useState(null);

  // 선택된 메뉴가 없으면 모달을 띄우지 않습니다.
  if (!menu) return null;

  // 이미지 로딩에 실패하면 같은 URL을 계속 재시도하지 않고 기본 아이콘을 보여줍니다.
  const menuImageUrl = resolveMenuImageUrl(menu.imageUrl);
  const hasMenuImage = menuImageUrl && failedImageUrl !== menuImageUrl;

  return (
    <div
      className={styles.modalBackground}
      onClick={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
    >
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <p className={styles.icon}>👑</p>

        <h2>이걸로 선택하시겠어요?</h2>

        <p className={styles.description}>오늘의 메뉴예요</p>

        {/* 선택한 메뉴의 핵심 정보만 요약해서 보여줍니다. */}
        <div className={styles.menuSummary}>
          <div className={styles.imageBox}>
            {hasMenuImage ? (
              <img
                src={menuImageUrl}
                alt={menu.name}
                draggable="false"
                onError={() => setFailedImageUrl(menuImageUrl)}
              />
            ) : (
              <span>🍔</span>
            )}
          </div>

          <div className={styles.menuInfo}>
            <span>{menu.brand}</span>
            <strong>{menu.name}</strong>
            <p>{menu.price?.toLocaleString()}원</p>
          </div>
        </div>

        {/* 취소는 모달만 닫고, 확인은 부모 컴포넌트의 확정 로직을 실행합니다. */}
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isSubmitting}
          >
            다시 볼게요
          </button>

          <button
            type="button"
            className={styles.confirmButton}
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "네, 이걸로요! 🎉"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectedMenuModal;
