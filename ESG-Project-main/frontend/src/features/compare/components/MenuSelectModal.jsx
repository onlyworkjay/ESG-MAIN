import styles from "./MenuSelectModal.module.css";
import {
  handleMenuImageError,
  resolveMenuImageUrl,
} from "../../../utils/menuImage";

// 비교할 메뉴를 추가하는 모달입니다.
// 검색어, 브랜드 필터, 선택된 메뉴 목록은 부모인 StatPage에서 관리합니다.
const MenuSelectModal = ({
  keyword,
  setKeyword,
  selectedBrand,
  setSelectedBrand,
  brandOptions = ["전체"],
  filteredMenus,
  compareList,
  maxCompare,
  isAlreadyAdded,
  onAddMenu,
  onRemoveMenu,
  onClose,
}) => {
  return (
    <div className={styles.modalBackground} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        {/* 모달 제목과 닫기 버튼 */}
        <div className={styles.modalHeader}>
          <div>
            <h2>메뉴 추가</h2>
            <p>최대 {maxCompare}개까지 추가 가능해요</p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="닫기"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* 메뉴명 또는 브랜드명으로 필터링하기 위한 검색 입력창 */}
        <div className={styles.searchBox}>
          <span className={`material-symbols-outlined ${styles.searchIcon}`}>
            search
          </span>

          <input
            className={styles.searchInput}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="메뉴명 또는 브랜드 검색"
          />
        </div>

        {/* 백엔드에서 받은 전체 브랜드 목록을 버튼으로 보여줍니다. */}
        <div className={styles.brandFilter}>
          {brandOptions.map((brand) => (
            <button
              key={brand}
              type="button"
              className={`${styles.brandButton} ${
                selectedBrand === brand ? styles.activeFilterButton : ""
              }`}
              onClick={() => setSelectedBrand(brand)}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* 현재 비교 목록에 담긴 메뉴를 칩 형태로 보여주고, 클릭하면 제거합니다. */}
        <div className={styles.selectedArea}>
          {compareList.length === 0 ? (
            <span className={styles.emptySelectedText}>메뉴를 선택하세요</span>
          ) : (
            compareList.map((menu) => (
              <button
                key={menu.id}
                type="button"
                className={styles.selectedChip}
                onClick={() => onRemoveMenu(menu.id)}
              >
                <span>{menu.name}</span>
                <span className="material-symbols-outlined">close</span>
              </button>
            ))
          )}
        </div>

        {/* 검색/브랜드 필터가 적용된 메뉴 목록입니다. */}
        <div className={styles.menuList}>
          {filteredMenus.map((menu) => {
            // 이미 추가했거나 최대 개수에 도달하면 더 이상 추가하지 못하게 비활성화합니다.
            const added = isAlreadyAdded(menu.id);
            const limitReached = compareList.length >= maxCompare;
            const disabled = added || limitReached;
            const menuImageUrl = resolveMenuImageUrl(menu.imageUrl);

            return (
              <button
                key={menu.id}
                type="button"
                disabled={disabled}
                className={`${styles.menuItem} ${
                  disabled ? styles.disabledMenuItem : ""
                }`}
                onClick={() => onAddMenu(menu)}
              >
                <div className={styles.thumbnail}>
                  <img
                    src={menuImageUrl}
                    alt={menu.name}
                    onError={handleMenuImageError}
                  />
                </div>

                <div className={styles.menuInfo}>
                  <strong>{menu.name}</strong>
                  <p>{menu.brand}</p>
                  <span>
                    {menu.price?.toLocaleString()}원 · {menu.calories} kcal
                  </span>
                </div>

                <div
                  className={`${styles.iconButton} ${
                    added ? styles.checkedIconButton : ""
                  }`}
                >
                  <span className="material-symbols-outlined">
                    {added ? "check" : "add"}
                  </span>
                </div>
              </button>
            );
          })}

          {/* 필터 결과가 없을 때 사용자에게 빈 결과를 알려줍니다. */}
          {filteredMenus.length === 0 && (
            <p className={styles.noResult}>검색 결과가 없습니다.</p>
          )}
        </div>

        {/* 선택 완료 버튼은 메뉴가 하나 이상 있을 때만 활성화됩니다. */}
        <div className={styles.bottomArea}>
          <button
            type="button"
            className={styles.doneButton}
            onClick={onClose}
            disabled={compareList.length === 0}
          >
            {compareList.length === 0
              ? "메뉴를 선택하세요"
              : `선택 완료 (${compareList.length}/${maxCompare})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuSelectModal;
