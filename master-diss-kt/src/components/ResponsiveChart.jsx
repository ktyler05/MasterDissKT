import React from "react";

function useResize(elRef) {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useLayoutEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      const isMobile = w < 560;
      const aspect = isMobile ? 4 / 3 : 16 / 9; 
      const h = Math.max(240, Math.round(w / aspect));
      setSize({ width: Math.round(w), height: h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return size;
}

export default function ResponsiveChart({ children, className = "chart-card" }) {
  const ref = React.useRef(null);
  const { width, height } = useResize(ref);

  return (
    <div ref={ref} className={className} style={{ width: "100%" }}>
      {width > 0 && height > 0 ? children({ width, height }) : null}
    </div>
  );
}
