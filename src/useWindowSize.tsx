import { useLayoutEffect } from "react";
import { useRecoilState } from "recoil";
import { windowSizeAtom } from "./atom";

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useRecoilState(windowSizeAtom);
  useLayoutEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, [setWindowSize]);
  return windowSize;
};
