import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// 비교하기 페이지의 선택 메뉴 목록을 전역 상태로 관리합니다.
// persist를 사용해서 페이지를 이동하거나 새로고침해도 비교 목록이 sessionStorage에 남습니다.
const useCompareStore = create(
  persist(
    (set) => ({
      compareList: [],

      // 메뉴를 추가합니다. 같은 id의 메뉴가 이미 있으면 아무 변화도 주지 않습니다.
      addCompareMenu: (menu) => {
        set((state) => {
          const alreadyAdded = state.compareList.some(
            (compareMenu) => compareMenu.id === menu.id,
          );

          if (alreadyAdded) {
            return state;
          }

          return {
            compareList: [...state.compareList, menu],
          };
        });
      },

      // 특정 메뉴 id만 비교 목록에서 제거합니다.
      removeCompareMenu: (menuId) => {
        set((state) => ({
          compareList: state.compareList.filter((menu) => menu.id !== menuId),
        }));
      },

      // 로그아웃 또는 초기화 버튼에서 비교 목록을 완전히 비웁니다.
      clearCompareList: () => {
        set({
          compareList: [],
        });
      },
    }),
    {
      // localStorage에 저장될 key 이름입니다.
      name: "compare-key",
      storage: createJSONStorage(() => sessionStorage), // 👈 localStorage → sessionStorage
      partialize: (state) => ({
        compareList: state.compareList,
      }),
    },
  ),
);

export default useCompareStore;
