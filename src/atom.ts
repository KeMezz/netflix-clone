import { atom } from "recoil";

export const searchState = atom({
  key: "search",
  default: false,
});

export const windowSizeAtom = atom({
  key: "windowSizeAtom",
  default: { width: window.innerWidth, height: window.innerHeight },
});
