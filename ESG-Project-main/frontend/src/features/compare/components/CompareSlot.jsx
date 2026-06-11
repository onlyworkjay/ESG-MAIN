import styles from "./CompareSlot.module.css";

// 아직 메뉴가 들어가지 않은 비교 칸입니다.
// 누르면 메뉴 선택 모달을 열 수 있도록 부모에게 onClick을 받습니다.
const CompareSlot = ({ onClick }) => {
  return (
    <button type="button" className={styles.emptySlot} onClick={onClick}>
      <div className={styles.plusIcon}>
        <span className="material-symbols-outlined">add</span>
      </div>
      <strong>비교 메뉴 추가</strong>
      <p>가격과 영양정보를 나란히 확인해보세요</p>
    </button>
  );
};

export default CompareSlot;
