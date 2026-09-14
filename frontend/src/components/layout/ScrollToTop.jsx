import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** إعادة التمرير لأعلى الصفحة عند كل انتقال بين المسارات */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
