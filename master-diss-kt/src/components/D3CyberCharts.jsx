// src/components/ArticleD3Charts.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";


const useResizeObserver = (ref) => {
  const [width, setWidth] = useState(null);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return width;
};


export function BreachImpactFunnel({
  data = [
    { label: "All orgs", value: 100 },
    { label: "Breached", value: 87 },
    { label: ">£1M loss", value: 53 },
    { label: "Leaders penalised", value: 51 },
  ],
  height = 480,
  margin = { top: 40, right: 24, bottom: 40, left: 24 },
  title = "Breach Impact Funnel",
  desc = "100% baseline → 87% breached → 53% with >£1M losses → 51% leaders penalised.",
}) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, html: "" });

  // responsive width from parent
  const outerW = useResizeObserver(wrapRef) || 720;
  const width = outerW; // svg width matches container
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  // Ensure data is sanitized and clamped to [0,100] and non-increasing
  const stages = useMemo(() => {
    const clean = data.map((d, i) => ({
      ...d,
      value: Math.max(0, Math.min(100, +d.value || 0)),
      idx: i,
    }));
    for (let i = 1; i < clean.length; i++) {
      clean[i].value = Math.min(clean[i].value, clean[i - 1].value);
    }
    return clean;
  }, [data]);

  // Scales
  const xScale = useMemo(
    () => d3.scaleLinear().domain([0, 100]).range([0, innerW]),
    [innerW]
  );
  const yScale = useMemo(
    () =>
      d3
        .scalePoint()
        .domain(d3.range(stages.length))
        .range([0, innerH])
        .padding(0.8),
    [stages.length, innerH]
  );

  // Build trapezoid segments between consecutive stages
  const segments = useMemo(() => {
    const segs = [];
    for (let i = 0; i < stages.length - 1; i++) {
      const top = stages[i];
      const bot = stages[i + 1];
      const y1 = yScale(i);
      const y2 = yScale(i + 1);
      const cx = innerW / 2;
      const w1 = xScale(top.value);
      const w2 = xScale(bot.value);
      const x1L = cx - w1 / 2;
      const x1R = cx + w1 / 2;
      const x2L = cx - w2 / 2;
      const x2R = cx + w2 / 2;
      const r = Math.min(12, Math.abs(w1 - w2) / 4); // rounded corners
      const path = `M ${x1L} ${y1}
        L ${x1R} ${y1}
        C ${x1R} ${y1 + r} ${x2R} ${y2 - r} ${x2R} ${y2}
        L ${x2L} ${y2}
        C ${x2L} ${y2 - r} ${x1L} ${y1 + r} ${x1L} ${y1}
        Z`;
      segs.push({ i, y1, y2, path, top, bot, w1, w2, cx, x1L, x1R, x2L, x2R });
    }
    return segs;
  }, [stages, xScale, yScale, innerW]);

  // Color scale
  const color = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, Math.max(1, segments.length - 1)])
        .range(["#5AA9FF", "#FF6AD5"])
        .interpolate(d3.interpolateHcl),
    [segments.length]
  );

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    svg.attr("role", "img").attr("aria-label", title);
    svg.select("rect.bg").attr("width", width).attr("height", height).attr("fill", "#0b0b12");

    const g = svg.select("g.inner").attr("transform", `translate(${margin.left},${margin.top})`);

    // Grid (horizontal reference lines)
    const grid = g.select("g.grid");
    const yTicks = stages.map((_, i) => yScale(i));
    const glines = grid.selectAll("line").data(yTicks, (d) => d);
    glines
      .join(
        (enter) =>
          enter
            .append("line")
            .attr("x1", 0)
            .attr("x2", innerW)
            .attr("y1", (d) => d)
            .attr("y2", (d) => d)
            .attr("stroke", "#2a2e3a"),
        (update) => update.attr("x2", innerW).attr("y1", (d) => d).attr("y2", (d) => d)
      );

    // Segments
    const segG = g.select("g.segments");
    const segs = segG.selectAll("path.segment").data(segments, (d) => d.i);

    segs
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("class", "segment")
            .attr("fill", (d) => color(d.i))
            .attr("opacity", 0.9)
            .attr("d", (d) => d.path)
            .attr("filter", "url(#soft)")
            .on("mousemove", function (event, d) {
              const [mx, my] = d3.pointer(event, this.ownerSVGElement);
              setTooltip({
                show: true,
                x: mx + 12,
                y: my + 12,
                html: `<strong>${d.top.label} → ${d.bot.label}</strong><br/>${d.bot.value}% remain`,
              });
            })
            .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })))
            .call((enter) =>
              enter
                .transition()
                .duration(900)
                .ease(d3.easeCubicOut)
                .attrTween("d", function (d) {
                  const w2Start = d.w1;
                  const interp = d3.interpolateNumber(w2Start, d.w2);
                  return function (t) {
                    const w2t = interp(t);
                    const cx = d.cx;
                    const x1L = d.x1L;
                    const x1R = d.x1R;
                    const x2L = cx - w2t / 2;
                    const x2R = cx + w2t / 2;
                    const r = Math.min(12, Math.abs(d.w1 - w2t) / 4);
                    return `M ${x1L} ${d.y1}
                      L ${x1R} ${d.y1}
                      C ${x1R} ${d.y1 + r} ${x2R} ${d.y2 - r} ${x2R} ${d.y2}
                      L ${x2L} ${d.y2}
                      C ${x2L} ${d.y2 - r} ${x1L} ${d.y1 + r} ${x1L} ${d.y1}
                      Z`;
                  };
                })
            ),
        (update) =>
          update
            .transition()
            .duration(700)
            .ease(d3.easeCubicInOut)
            .attr("d", (d) => d.path)
            .attr("fill", (d) => color(d.i)),
        (exit) => exit.remove()
      );

    // Stage labels + values
    const labelG = g.select("g.labels");
    const stageNodes = labelG.selectAll("g.stage").data(stages, (d) => d.idx);
    const stageEnter = stageNodes.enter().append("g").attr("class", "stage");
    stageEnter.append("text").attr("class", "label");
    stageEnter.append("text").attr("class", "value");

    stageNodes
      .merge(stageEnter)
      .attr("transform", (_d, i) => `translate(${innerW / 2}, ${yScale(i)})`)
      .each(function (d, i) {
        const node = d3.select(this);
        node
          .select("text.label")
          .attr("text-anchor", "middle")
          .attr("dy", -14)
          .style("font-weight", i === 0 ? 700 : 600)
          .style("fill", "#eae7ff")
          .text(d.label);
        node
          .select("text.value")
          .attr("text-anchor", "middle")
          .attr("dy", 18)
          .style("fill", "#b7d7ff")
          .text(d3.format(".0f")(d.value) + "%");
      });

    stageNodes.exit().remove();

    // Title + desc
    svg
      .select("text.chart-title")
      .attr("x", width / 2)
      .attr("y", 24)
      .attr("text-anchor", "middle")
      .style("font-weight", 700)
      .style("font-size", 18)
      .style("fill", "#eae7ff")
      .text(title);

    svg.select("desc.desc").text(desc);
  }, [segments, stages, xScale, yScale, color, width, height, innerW, innerH, margin, title, desc]);

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <svg ref={svgRef} width={width} height={height}>
        <desc className="desc">{desc}</desc>
        <rect className="bg" />
        <defs>
          {/* soft shadow */}
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
            <feOffset in="blur" dx="0" dy="2" result="off" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.35" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="off" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <text className="chart-title" />
        <g className="inner" transform={`translate(${margin.left},${margin.top})`}>
          <g className="grid" />
          <g className="segments" />
          <g className="labels" />
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip.show && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            background: "#11131a",
            color: "#eae7ff",
            border: "1px solid #2a2e3a",
            borderRadius: 8,
            padding: "8px 10px",
            pointerEvents: "none",
            boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.html }}
        />
      )}

      <style>{`
        .grid line { stroke: #2a2e3a; }
        text { font-family: ui-sans-serif, system-ui, Inter, Segoe UI, Roboto; }
      `}</style>
    </div>
  );
}
