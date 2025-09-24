import React from "react";

export default function ResponsiveChart({
  aspect = 1.8,         
  minHeight = 220,
  maxHeight = 560,
  className = "chart-card",
  children,
}) {
  const containerRef = React.useRef(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  const recompute = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const width = el.clientWidth || 0;
    const height = Math.max(
      minHeight,
      Math.min(maxHeight, Math.round(width / aspect || minHeight))
    );
    setSize({ width, height });
  }, [aspect, minHeight, maxHeight]);

  React.useLayoutEffect(() => {
    recompute();
  }, [recompute]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [recompute]);

  return (
    <div ref={containerRef} className={className} style={{ width: "100%" }}>
      {size.width > 0 && children(size)}
    </div>
  );
}
