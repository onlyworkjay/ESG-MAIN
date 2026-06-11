import { create } from "zustand";

const initialPostState = {
  savedPage: 0,
  savedStatus: "",
  savedOrder: "",
  savedSearchType: "",
  savedSearchKeyword: "",
};

const usePostStore = create((set) => ({
  ...initialPostState,

  setPostState: (newState) => set((state) => ({ ...state, ...newState })),

  resetPostState: () => set(initialPostState),
}));

export default usePostStore;
