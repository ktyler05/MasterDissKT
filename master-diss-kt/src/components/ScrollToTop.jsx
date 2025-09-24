import React from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType(); 

  React.useLayoutEffect(() => {
    if (hash) {
      
      requestAnimationFrame(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      });
      return;
    }

   
    if (navType !== "POP") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname, hash, navType]);

  return null;
}
