import { atom } from "recoil";

export const searchState = atom({
  key: "search",
  default: false,
});

export const windowSizeAtom = atom({
  key: "windowSizeAtom",
  default: { width: window.innerWidth, height: window.innerHeight },
});

// Only a non-secret session identifier enters Recoil and React Query's cache.
export const apiSessionAtom = atom({
  key: "apiSessionAtom",
  default: { generation: 0, enabled: false },
});

export const apiKeyModalOpenAtom = atom<boolean>({
  key: "apiKeyModalOpenAtom",
  default: false,
});
