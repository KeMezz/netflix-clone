import { atom } from "recoil";

export const searchState = atom({
  key: "search",
  default: false,
});

export const windowSizeAtom = atom({
  key: "windowSizeAtom",
  default: { width: window.innerWidth, height: window.innerHeight },
});

export const apiKeyAtom = atom<string>({
  key: "apiKeyAtom",
  default: "",
});

export const apiKeyModalOpenAtom = atom<boolean>({
  key: "apiKeyModalOpenAtom",
  default: false,
});
