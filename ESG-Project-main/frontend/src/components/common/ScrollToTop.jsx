import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

// 페이지 이동 시 이전 페이지의 스크롤 위치가 남지 않도록 항상 맨 위에서 시작하게 합니다.
// useLayoutEffect를 쓰면 새 화면이 그려지기 전에 위치를 먼저 맞춰 깜빡임이 적습니다.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
