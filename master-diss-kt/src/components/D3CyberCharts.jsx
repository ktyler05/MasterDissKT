// src/components/ArticleD3Charts.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

const useResizeObserver = (ref) => {
  const [bounds, setBounds] = React.useState();
  React.useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setBounds({ width: cr.width, height: cr.height });
      }
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return bounds;
};

const ChartFrame = ({ title, subtitle, height = 360, children }) => (
  <section
    className="chart-card"
    style={{
      position: "relative",
      background: "var(--card, #fff)",
      borderRadius: 16,
      padding: 16,
      boxShadow: "0 10px 30px rgba(24,33,95,.10)",
      border: "1px solid rgba(111,124,232,.15)",
      margin: "24px 0",
    }}
  >
    <header style={{ marginBottom: 8 }}>
      <h3 style={{ margin: 0, fontSize: 20 }}>{title}</h3>
      {subtitle && (
        <p style={{ margin: "6px 0 0", color: "#5a5f7a", fontSize: 13 }}>
          {subtitle}
        </p>
      )}
    </header>
    <div style={{ position: "relative", height }}>{children}</div>
  </section>
);

export function BreachImpactBars({
  data = [
    { label: "All orgs (baseline)", value: 100 },
    { label: "Breached", value: 87 },
    { label: ">£1M loss", value: 53 },
    { label: "Leaders penalised", value: 51 },
  ],
  width = 720,
  height = 300, // auto-sizes a bit via band padding; tweak as needed
  margin = { top: 48, right: 28, bottom: 40, left: 180 },
  title = "Breach impact snapshot",
  subtitle = "Share of organisations (%)",
}) {
  const svgRef = React.useRef(null);
  const [tooltip, setTooltip] = React.useState({ show: false, x: 0, y: 0, html: "" });

  // Light theme tokens (memoized to keep ESLint happy)
  const C = React.useMemo(
    () => ({
      bg: "#ffffff",
      ink: "#1f2544",
      muted: "#4b4f6b",
      grid: "#e9ebf5",
      purple: "#6f7ce8",
      pink: "#ff6ad5",
    }),
    []
  );

  // Sanitise values
  const rows = React.useMemo(
    () =>
      data.map((d, i) => ({
        label: d.label,
        value: Math.max(0, Math.min(100, +d.value || 0)),
        i,
      })),
    [data]
  );

  // Layout + scales
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const y = React.useMemo(
    () => d3.scaleBand().domain(rows.map((d) => d.label)).range([0, innerH]).padding(0.35),
    [rows, innerH]
  );
  const x = React.useMemo(() => d3.scaleLinear().domain([0, 100]).range([0, innerW]).nice(), [innerW]);

  React.useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.attr("role", "img").attr("aria-label", title).attr("viewBox", `0 0 ${width} ${height}`);
    svg.select("rect.bg").attr("width", width).attr("height", height).attr("fill", C.bg);

    // Title
    svg
      .select("text.chart-title")
      .attr("x", width / 2)
      .attr("y", 26)
      .attr("text-anchor", "middle")
      .style("fill", C.ink)
      .style("font-weight", 700)
      .style("font-size", 18)
      .text(title);

    // Subtitle (extra space below for breathing room)
    svg
      .select("text.chart-subtitle")
      .attr("x", width / 2)
      .attr("y", 46)
      .attr("text-anchor", "middle")
      .style("fill", C.muted)
      .style("font-weight", 600)
      .style("font-size", 12)
      .text(subtitle);

    const g = svg.select("g.inner").attr("transform", `translate(${margin.left},${margin.top})`);

    // Grid (vertical) at 0–100 ticks
    const gridTicks = x.ticks(5);
    const grid = g.select("g.grid").selectAll("line.grid-x").data(gridTicks, (d) => d);
    grid
      .join(
        (enter) =>
          enter
            .append("line")
            .attr("class", "grid-x")
            .attr("x1", (d) => x(d))
            .attr("x2", (d) => x(d))
            .attr("y1", 0)
            .attr("y2", innerH)
            .attr("stroke", C.grid),
        (update) => update.attr("x1", (d) => x(d)).attr("x2", (d) => x(d)).attr("y2", innerH),
        (exit) => exit.remove()
      );

    // Axes
    const xAxis = d3.axisBottom(x).ticks(5).tickFormat((t) => `${t}%`);
    const xAxisG = g.select("g.x-axis").attr("transform", `translate(0,${innerH})`).call(xAxis);
    xAxisG.selectAll("path, line").attr("stroke", C.grid);
    xAxisG.selectAll("text").attr("fill", C.muted).style("font-weight", 600);

    const yAxis = d3.axisLeft(y);
    const yAxisG = g.select("g.y-axis").call(yAxis);
    yAxisG.selectAll("path, line").attr("stroke", "transparent");
    yAxisG.selectAll("text").attr("fill", C.ink).style("font-weight", 600);

    // Gradient for bars (purple → pink)
    const defs = svg.select("defs.gradients");
    defs
      .selectAll("linearGradient.hbar")
      .data([0])
      .join((enter) =>
        enter
          .append("linearGradient")
          .attr("class", "hbar")
          .attr("id", "barGrad")
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "100%")
          .attr("y2", "0%")
          .call((lg) => {
            lg.append("stop").attr("offset", "0%").attr("stop-color", "#cfd6ff");
            lg.append("stop").attr("offset", "100%").attr("stop-color", C.pink);
          })
      );

    // Bars
    const bars = g.select("g.bars").selectAll("rect.bar").data(rows, (d) => d.label);
    bars
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", (d) => y(d.label))
            .attr("height", y.bandwidth())
            .attr("width", (d) => x(d.value))
            .attr("rx", 8)
            .attr("fill", "url(#barGrad)")
            .on("mousemove", function (event, d) {
              const [mx, my] = d3.pointer(event, svg.node());
              const tipW = 220,
                tipH = 54,
                pad = 10;
              const tx = Math.max(pad, Math.min(mx + 12, width - tipW - pad));
              const ty = Math.max(pad, Math.min(my + 12, height - tipH - pad));
              setTooltip({
                show: true,
                x: tx,
                y: ty,
                html: `<strong>${d.label}</strong><br/>${d.value}%`,
              });
            })
            .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false }))),
        (update) =>
          update
            .attr("y", (d) => y(d.label))
            .attr("height", y.bandwidth())
            .attr("width", (d) => x(d.value)),
        (exit) => exit.remove()
      );

    // Value labels at bar ends
    const labels = g.select("g.values").selectAll("text.val").data(rows, (d) => d.label);
    labels
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("class", "val")
            .attr("x", (d) => x(d.value) + 8)
            .attr("y", (d) => (y(d.label) ?? 0) + y.bandwidth() / 2)
            .attr("dominant-baseline", "middle")
            .style("fill", C.muted)
            .style("font-weight", 700)
            .text((d) => `${d.value}%`),
        (update) =>
          update
            .attr("x", (d) => x(d.value) + 8)
            .attr("y", (d) => (y(d.label) ?? 0) + y.bandwidth() / 2)
            .text((d) => `${d.value}%`),
        (exit) => exit.remove()
      );
  }, [rows, width, height, margin, innerW, innerH, x, y, C, title, subtitle]);

  return (
    <div
      style={{
        position: "relative",
        maxWidth: width,
        margin: "2rem auto",
        padding: 16,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 12px 28px rgba(24,33,95,0.12)",
        border: "1px solid #e9ebf5",
      }}
    >
      <svg ref={svgRef} width={width} height={height} style={{ display: "block" }}>
        <rect className="bg" />
        <defs className="gradients" />
        <text className="chart-title" />
        <text className="chart-subtitle" />
        <g className="inner" transform={`translate(${margin.left},${margin.top})`}>
          <g className="grid" />
          <g className="bars" />
          <g className="values" />
          <g className="x-axis" />
          <g className="y-axis" />
        </g>
      </svg>

      {/* Light tooltip, clamped inside card */}
      {tooltip.show && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            background: "#fff",
            color: "#1f2544",
            border: "1px solid #e9ebf5",
            borderRadius: 10,
            padding: "8px 10px",
            pointerEvents: "none",
            boxShadow: "0 10px 22px rgba(24,33,95,0.14)",
            fontSize: 12.5,
            whiteSpace: "nowrap",
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.html }}
        />
      )}

      <style>{`
        text { font-family: ui-sans-serif, system-ui, Inter, Segoe UI, Roboto; }
      `}</style>
    </div>
  );
}

export const SchoolReadinessGapsBars = () => {
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const bounds = useResizeObserver(wrapperRef);

  const data = useMemo(
    () => [
      { item: "No offline backups", gap: 80 },
      { item: "No staff cyber training", gap: 62 },
      { item: "No IT security policy", gap: 31 },
    ],
    []
  );

  useEffect(() => {
    if (!bounds) return;
    const { width, height } = bounds;
    const margin = { top: 24, right: 22, bottom: 34, left: 240 };
    const innerW = Math.max(260, width - margin.left - margin.right);
    const innerH = Math.max(160, height - margin.top - margin.bottom);

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "School cyber readiness gaps (percent lacking)");

    svg.selectAll("*").remove();
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.item))
      .range([0, innerH])
      .padding(0.2);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.gap) || 100])
      .nice()
      .range([0, innerW]);

    const color = d3
      .scaleLinear()
      .domain([0, 100])
      .range(["#6f7ce8", "#b18cf0"]);

    // axes
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickFormat((t) => `${t}%`)
          .tickPadding(8)
      );
    g.append("g").call(d3.axisLeft(y).tickSize(0).tickPadding(10));

    // bars
    g.selectAll("rect.bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", (d) => y(d.item))
      .attr("height", y.bandwidth())
      .attr("rx", 6)
      .attr("width", (d) => x(d.gap))
      .attr("fill", (d) => color(d.gap))
      .on("mousemove", (event, d) => {
        d3
          .select(tooltipRef.current)
          .style("left", `${event.offsetX + margin.left + 10}px`)
          .style("top", `${event.offsetY + margin.top - 10}px`)
          .style("opacity", 1).html(`
            <div class="tt-title">${d.item}</div>
            <div class="tt-sub">Gap</div>
            <div class="tt-value">${d.gap}% of schools</div>
          `);
      })
      .on("mouseleave", () =>
        d3.select(tooltipRef.current).style("opacity", 0)
      );
  }, [bounds, data]);

  return (
    <ChartFrame
      title="School cyber readiness: where the gaps are"
      subtitle="Percentage of schools lacking each basic control (lower is better)"
      height={320}
    >
      <div
        ref={wrapperRef}
        style={{ position: "relative", width: "100%", height: "100%" }}
      >
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
        <div ref={tooltipRef} className="d3-tooltip" />
      </div>
    </ChartFrame>
  );
};

/* ======= SCHOOL CYBER READINESS – 100% Stacked (Ready vs Gap) ======= */
export const SchoolReadinessStacked100 = () => {
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const bounds = useResizeObserver(wrapperRef);

  const raw = useMemo(
    () => [
      { item: "Offline backups", Ready: 20, Gap: 80 },
      { item: "Staff cyber training", Ready: 38, Gap: 62 },
      { item: "IT security policy", Ready: 69, Gap: 31 },
    ],
    []
  );

  useEffect(() => {
    if (!bounds) return;
    const { width, height } = bounds;
    const margin = { top: 26, right: 22, bottom: 56, left: 180 };
    const innerW = Math.max(280, width - margin.left - margin.right);
    const innerH = Math.max(160, height - margin.top - margin.bottom);

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "School cyber readiness vs gap (100% stacked bars)");

    svg.selectAll("*").remove();
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const keys = ["Ready", "Gap"];

    const y = d3
      .scaleBand()
      .domain(raw.map((d) => d.item))
      .range([0, innerH])
      .padding(0.24);

    const x = d3.scaleLinear().domain([0, 100]).range([0, innerW]);

    const color = d3.scaleOrdinal().domain(keys).range(["#6f7ce8", "#b18cf0"]);

    // stack (already in percentages)
    const stack = d3.stack().keys(keys);
    const series = stack(raw);

    // axes
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickFormat((t) => `${t}%`)
          .tickPadding(8)
      );
    g.append("g").call(d3.axisLeft(y).tickSize(0).tickPadding(10));

    // bars
    const groups = g
      .selectAll("g.layer")
      .data(series)
      .enter()
      .append("g")
      .attr("fill", (s) => color(s.key));

    groups
      .selectAll("rect")
      .data((s) => s)
      .enter()
      .append("rect")
      .attr("y", (seg) => y(seg.data.item))
      .attr("x", (seg) => x(seg[0]))
      .attr("height", y.bandwidth())
      .attr("width", (seg) => x(seg[1]) - x(seg[0]))
      .attr("rx", 6)
      .on("mousemove", (event, seg) => {
        const key = d3.select(event.target.parentNode).datum().key; // Ready or Gap
        const value = seg.data[key];
        d3
          .select(tooltipRef.current)
          .style("left", `${event.offsetX + margin.left + 10}px`)
          .style("top", `${event.offsetY + margin.top - 10}px`)
          .style("opacity", 1).html(`
            <div class="tt-title">${seg.data.item}</div>
            <div class="tt-sub">${key}</div>
            <div class="tt-value">${value}%</div>
          `);
      })
      .on("mouseleave", () =>
        d3.select(tooltipRef.current).style("opacity", 0)
      );

    // legend (above, spaced)
    const legend = g.append("g").attr("transform", `translate(0, -16)`);
    const leg = legend
      .selectAll("g.leg")
      .data(keys)
      .enter()
      .append("g")
      .attr("class", "leg")
      .attr("transform", (_d, i) => `translate(${i * 140}, -4)`);

    leg
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("rx", 3)
      .attr("fill", (d) => color(d));
    leg
      .append("text")
      .attr("x", 16)
      .attr("y", 10)
      .style("fontSize", 12)
      .text((d) => d);
  }, [bounds, raw]);

  return (
    <ChartFrame
      title="School cyber readiness vs gap"
      subtitle="100% per control: share of schools Ready vs Gap"
      height={320}
    >
      <div
        ref={wrapperRef}
        style={{ position: "relative", width: "100%", height: "100%" }}
      >
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
        <div ref={tooltipRef} className="d3-tooltip" />
      </div>
    </ChartFrame>
  );
};
export function ConcentricRadialGauges({
  basic = 44,
  advanced = 27,
  width = 520,
  height = 420,
  margin = { top: 40, right: 24, bottom: 28, left: 24 },
  title = "Skills shortfall (2024)",
}) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, html: "" });

  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const colors = useMemo(
    () => ({
      bg: "#ffffff",
      ink: "#1f2544",
      muted: "#4b4f6b",
      grid: "#e9ebf5",
      purple: "#6f7ce8",
      pink: "#ff6ad5",
      track: "#e9ebf5",
    }),
    []
  );

  const cx = innerW / 2;
  const cy = innerH / 2 + 10;

  const rings = useMemo(() => {
    const R = Math.min(innerW, innerH) / 2;
    return {
      outer: { r0: R - 36, r1: R - 12 },
      inner: { r0: R - 72, r1: R - 48 },
    };
  }, [innerW, innerH]);

  const basicVal = Math.max(0, Math.min(100, +basic || 0));
  const advVal = Math.max(0, Math.min(100, +advanced || 0));

  const startAngle = useMemo(() => -Math.PI / 2, []);
  const toAngle = useMemo(
    () => d3.scaleLinear().domain([0, 100]).range([0, 2 * Math.PI]),
    []
  );
  const arcOuter = useMemo(
    () => d3.arc().innerRadius(rings.outer.r0).outerRadius(rings.outer.r1).cornerRadius(12),
    [rings]
  );
  const arcInner = useMemo(
    () => d3.arc().innerRadius(rings.inner.r0).outerRadius(rings.inner.r1).cornerRadius(12),
    [rings]
  );

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.attr("role", "img").attr("aria-label", title).attr("viewBox", `0 0 ${width} ${height}`);
    svg.select("rect.bg").attr("width", width).attr("height", height).attr("fill", colors.bg);

    svg
      .select("text.chart-title")
      .attr("x", width / 2)
      .attr("y", 28)
      .attr("text-anchor", "middle")
      .style("fill", colors.ink)
      .style("font-weight", 700)
      .style("font-size", 18)
      .text(title);

    const g = svg.select("g.inner").attr("transform", `translate(${margin.left},${margin.top})`);

    const tracks = [
      { key: "outer", arc: arcOuter, thickness: rings.outer.r1 - rings.outer.r0 },
      { key: "inner", arc: arcInner, thickness: rings.inner.r1 - rings.inner.r0 },
    ];
    const trackG = g.select("g.tracks");
    trackG
      .selectAll("path.track")
      .data(tracks, (d) => d.key)
      .join("path")
      .attr("class", "track")
      .attr("transform", `translate(${cx},${cy})`)
      .attr("fill", "none")
      .attr("stroke", colors.track)
      .attr("stroke-width", (d) => d.thickness)
      .attr("d", (d) => d.arc({ startAngle, endAngle: startAngle + toAngle(100) }));

    const arcsData = [
      { key: "basic", value: basicVal, arc: arcOuter, fill: "url(#gradOuter)", stroke: colors.purple },
      { key: "advanced", value: advVal, arc: arcInner, fill: "url(#gradInner)", stroke: colors.pink },
    ];
    const arcsG = g.select("g.arcs");
    arcsG
      .selectAll("path.arc")
      .data(arcsData, (d) => d.key)
      .join("path")
      .attr("class", "arc")
      .attr("transform", `translate(${cx},${cy})`)
      .attr("fill", (d) => d.fill)
      .attr("stroke", (d) => d.stroke)
      .attr("stroke-width", 1)
      .attr("d", (d) => d.arc({ startAngle, endAngle: startAngle + toAngle(d.value) }))
      .on("mousemove", (event, d) => {
        const [mx, my] = d3.pointer(event, svg.node());
        const label = d.key === "basic" ? "Basic shortfall" : "Advanced shortfall";
        const pad = 12,
          tipW = 200,
          tipH = 48;
        const tx = Math.max(pad, Math.min(mx + 12, width - tipW - pad));
        const ty = Math.max(pad, Math.min(my + 12, height - tipH - pad));
        setTooltip({ show: true, x: tx, y: ty, html: `<strong>${label}</strong><br/>${d.value}%` });
      })
      .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })));

    const center = g.select("g.center").attr("transform", `translate(${cx},${cy})`);
    center
      .selectAll("text.center-title")
      .data([0])
      .join("text")
      .attr("class", "center-title")
      .attr("text-anchor", "middle")
      .attr("y", -8)
      .style("fill", colors.muted)
      .style("font-weight", 600)
      .text("Shortfall");

    center
      .selectAll("text.center-num")
      .data([`${basicVal}% / ${advVal}%`])
      .join("text")
      .attr("class", "center-num")
      .attr("text-anchor", "middle")
      .attr("y", 18)
      .style("fill", colors.ink)
      .style("font-weight", 800)
      .style("font-size", 22)
      .text((d) => d);

    const legend = g.select("g.legend");
    const items = [
      { label: `Basic: ${basicVal}%`, color: colors.purple },
      { label: `Advanced: ${advVal}%`, color: colors.pink },
    ];
    const legendY = innerH - 6;
    const legendX = cx - 120;
    const li = legend.selectAll("g.item").data(items);
    const liEnter = li.enter().append("g").attr("class", "item");
    liEnter.append("rect");
    liEnter.append("text");
    li
      .merge(liEnter)
      .attr("transform", (_d, i) => `translate(${legendX + i * 160}, ${legendY})`)
      .each(function (d) {
        const node = d3.select(this);
        node.select("rect").attr("width", 14).attr("height", 14).attr("rx", 3).attr("fill", d.color);
        node
          .select("text")
          .attr("x", 20)
          .attr("y", 11)
          .style("fill", colors.ink)
          .style("font-weight", 600)
          .text(d.label);
      });
    li.exit().remove();
  }, [
    width,
    height,
    margin,
    innerW,
    innerH,
    cx,
    cy,
    rings,
    basicVal,
    advVal,
    colors,
    title,
    startAngle,
    toAngle,
    arcOuter,
    arcInner,
  ]);

  return (
    <div
      style={{
        position: "relative",
        maxWidth: width,
        margin: "2rem auto",
        padding: "16px",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 12px 28px rgba(24,33,95,0.12)",
        border: "1px solid #e9ebf5",
      }}
    >
      <svg ref={svgRef} width={width} height={height} style={{ display: "block" }}>
        <rect className="bg" />
        <defs>
          <linearGradient id="gradOuter" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cfd6ff" />
            <stop offset="100%" stopColor="#6f7ce8" />
          </linearGradient>
          <linearGradient id="gradInner" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffb3e7" />
            <stop offset="100%" stopColor="#ff6ad5" />
          </linearGradient>
        </defs>
        <text className="chart-title" />
        <g className="inner" transform={`translate(${margin.left},${margin.top})`}>
          <g className="tracks" />
          <g className="arcs" />
          <g className="center" />
          <g className="legend" />
        </g>
      </svg>

      {tooltip.show && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            background: "#fff",
            color: "#1f2544",
            border: "1px solid #e9ebf5",
            borderRadius: 10,
            padding: "8px 10px",
            pointerEvents: "none",
            boxShadow: "0 10px 22px rgba(24,33,95,0.14)",
            fontSize: 12.5,
            whiteSpace: "nowrap",
            maxWidth: 220,
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.html }}
        />
      )}

      <style>{`
        text { font-family: ui-sans-serif, system-ui, Inter, Segoe UI, Roboto; }
      `}</style>
    </div>
  );
}
export function DumbbellParity({
  data = [
    { label: "Women", value: 17 },
    { label: "Ethnic minority", value: 15 },
  ],
  width = 720,
  height = 260,
  margin = { top: 36, right: 32, bottom: 48, left: 160 },
  title = "Representation gaps to parity (50%)",
  subtitle = "UK cyber workforce",
}) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, html: "" });

  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const rows = useMemo(
    () => data.map((d, i) => ({ label: d.label, value: Math.max(0, Math.min(100, +d.value || 0)), i })),
    [data]
  );

  const x = useMemo(() => d3.scaleLinear().domain([0, 50]).range([0, innerW]).nice(), [innerW]);
  const y = useMemo(
    () => d3.scalePoint().domain(rows.map((d) => d.label)).range([0, innerH]).padding(0.8),
    [rows, innerH]
  );

  // Light theme
  const colors = useMemo(
    () => ({
      bg: "#ffffff",
      ink: "#1f2544",
      muted: "#4b4f6b",
      grid: "#e9ebf5",
      purple: "#6f7ce8",
      pink: "#ff6ad5",
    }),
    []
  );

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.attr("role", "img").attr("aria-label", title).attr("viewBox", `0 0 ${width} ${height}`);

    // background
    svg.select("rect.bg").attr("width", width).attr("height", height).attr("fill", colors.bg);

    const g = svg.select("g.inner").attr("transform", `translate(${margin.left},${margin.top})`);

    // X Axis
    const xAxisG = g.select("g.x-axis").attr("transform", `translate(0, ${innerH})`);
    const axis = d3.axisBottom(x).ticks(5).tickFormat((t) => `${t}%`);
    xAxisG.call(axis);
    xAxisG.selectAll("path, line").attr("stroke", colors.grid);
    xAxisG.selectAll("text").attr("fill", colors.muted).style("font-weight", 600);

    // Gridlines
    const gridG = g.select("g.grid");
    const xticks = x.ticks(5);
    gridG
      .selectAll("line.grid-x")
      .data(xticks, (d) => d)
      .join(
        (enter) =>
          enter
            .append("line")
            .attr("class", "grid-x")
            .attr("x1", (d) => x(d))
            .attr("x2", (d) => x(d))
            .attr("y1", 0)
            .attr("y2", innerH)
            .attr("stroke", colors.grid),
        (update) =>
          update.attr("x1", (d) => x(d)).attr("x2", (d) => x(d)).attr("y2", innerH).attr("stroke", colors.grid),
        (exit) => exit.remove()
      );

    // Gradients per row (fade purple → pink toward target)
    const defs = svg.select("defs.gradients");
    defs
      .selectAll("linearGradient.rowGrad")
      .data(rows, (d) => d.label)
      .join(
        (enter) =>
          enter
            .append("linearGradient")
            .attr("class", "rowGrad")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("id", (d) => `rowGrad-${d.i}`)
            .call((lg) => {
              lg.append("stop").attr("offset", 0).attr("stop-color", colors.purple).attr("stop-opacity", 1);
              lg.append("stop").attr("offset", 1).attr("stop-color", colors.pink).attr("stop-opacity", 0.35);
            }),
        (update) => update,
        (exit) => exit.remove()
      )
      .attr("x1", (d) => margin.left + x(Math.min(d.value, 50)))
      .attr("x2", (d) => margin.left + x(50))
      .attr("y1", (d) => margin.top + y(d.label))
      .attr("y2", (d) => margin.top + y(d.label));

    const rowG = g.select("g.rows");

    // Connectors
    rowG
      .selectAll("line.connector")
      .data(rows, (d) => d.label)
      .join(
        (enter) =>
          enter
            .append("line")
            .attr("class", "connector")
            .attr("y1", (d) => y(d.label))
            .attr("y2", (d) => y(d.label))
            .attr("x1", (d) => x(Math.min(d.value, 50)))
            .attr("x2", (d) => x(50))
            .attr("stroke", (d) => `url(#rowGrad-${d.i})`)
            .attr("stroke-width", 8)
            .attr("stroke-linecap", "round"),
        (update) =>
          update
            .attr("y1", (d) => y(d.label))
            .attr("y2", (d) => y(d.label))
            .attr("x1", (d) => x(Math.min(d.value, 50)))
            .attr("x2", x(50))
            .attr("stroke", (d) => `url(#rowGrad-${d.i})`),
        (exit) => exit.remove()
      );

    // Current dots (left)
    const dots = rowG.selectAll("circle.dot").data(rows, (d) => d.label);
    dots
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("class", "dot")
            .attr("r", 7)
            .attr("cx", (d) => x(Math.min(d.value, 50)))
            .attr("cy", (d) => y(d.label))
            .attr("fill", colors.purple)
            .style("filter", "drop-shadow(0 2px 6px rgba(0,0,0,.15))")
            .on("mousemove", function (event, d) {
              const [mx, my] = d3.pointer(event, svg.node());
              const gap = 50 - Math.min(d.value, 50);
              setTooltip({
                show: true,
                x: mx + 12,
                y: my + 12,
                html: `<strong>${d.label}</strong><br/>Current: ${d.value}%<br/>Gap to parity: ${d3.format(".0f")(gap)}pp`,
              });
            })
            .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false }))),
        (update) =>
          update
            .on("mousemove", function (event, d) {
              const [mx, my] = d3.pointer(event, svg.node());
              const gap = 50 - Math.min(d.value, 50);
              setTooltip({
                show: true,
                x: mx + 12,
                y: my + 12,
                html: `<strong>${d.label}</strong><br/>Current: ${d.value}%<br/>Gap to parity: ${d3.format(".0f")(gap)}pp`,
              });
            })
            .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })))
            .attr("cx", (d) => x(Math.min(d.value, 50)))
            .attr("cy", (d) => y(d.label)),
        (exit) => exit.remove()
      );

    // Target ticks (at 50%)
    const tickShape = d3.symbol().type(d3.symbolSquare).size(60);
    rowG
      .selectAll("path.target")
      .data(rows, (d) => d.label)
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("class", "target")
            .attr("d", tickShape)
            .attr("transform", (d) => `translate(${x(50)}, ${y(d.label)}) rotate(45)`)
            .attr("fill", colors.pink)
            .attr("opacity", 0.85)
            .on("mousemove", function (event, d) {
              const [mx, my] = d3.pointer(event, svg.node());
              const gap = 50 - Math.min(d.value, 50);
              setTooltip({
                show: true,
                x: mx + 12,
                y: my + 12,
                html: `<strong>${d.label}</strong><br/>Target: 50%<br/>Gap: ${d3.format(".0f")(gap)}pp`,
              });
            })
            .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false }))),
        (update) =>
          update
            .on("mousemove", function (event, d) {
              const [mx, my] = d3.pointer(event, svg.node());
              const gap = 50 - Math.min(d.value, 50);
              setTooltip({
                show: true,
                x: mx + 12,
                y: my + 12,
                html: `<strong>${d.label}</strong><br/>Target: 50%<br/>Gap: ${d3.format(".0f")(gap)}pp`,
              });
            })
            .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })))
            .attr("transform", (d) => `translate(${x(50)}, ${y(d.label)}) rotate(45)`),
        (exit) => exit.remove()
      );

    // Category labels (left)
    const cats = g.select("g.cats");
    cats
      .selectAll("text.cat")
      .data(rows, (d) => d.label)
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("class", "cat")
            .attr("x", -12)
            .attr("y", (d) => y(d.label))
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .style("fill", colors.ink)
            .style("font-weight", 600)
            .text((d) => d.label),
        (update) => update.attr("y", (d) => y(d.label)),
        (exit) => exit.remove()
      );

    // Title & subtitle
    svg
      .select("text.chart-title")
      .attr("x", width / 2)
      .attr("y", 24)
      .attr("text-anchor", "middle")
      .style("fill", colors.ink)
      .style("font-weight", 700)
      .style("font-size", 18)
      .text(title);

    svg
      .select("text.chart-subtitle")
      .attr("x", width / 2)
      .attr("y", 44)
      .attr("text-anchor", "middle")
      .style("fill", colors.muted)
      .style("font-weight", 600)
      .style("font-size", 12)
      .text(subtitle);
  }, [rows, width, height, margin, innerW, innerH, x, y, colors, title, subtitle]);

  return (
    <div
      style={{
        position: "relative",
        maxWidth: width,
        margin: "2rem auto",
        padding: "16px",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 12px 28px rgba(24,33,95,0.12)",
        border: "1px solid #e9ebf5",
      }}
    >
      <svg ref={svgRef} width={width} height={height} style={{ display: "block" }}>
        <rect className="bg" />
        <defs className="gradients" />
        <text className="chart-title" />
        <text className="chart-subtitle" />
        <g className="inner" transform={`translate(${margin.left},${margin.top})`}>
          <g className="grid" />
          <g className="rows" />
          <g className="cats" />
          <g className="x-axis" />
        </g>
      </svg>

      {/* Tooltip (light theme) */}
      {tooltip.show && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            background: "#fff",
            color: "#1f2544",
            border: "1px solid #e9ebf5",
            borderRadius: 10,
            padding: "8px 10px",
            pointerEvents: "none",
            boxShadow: "0 10px 22px rgba(24,33,95,0.14)",
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.html }}
        />
      )}
    </div>
  );
}
export function TriptychRadialBadges({
  items = [
    { label: "Insider incidents", value: 57, detail: "57% of insider incidents caused by students (schools)" },
    { label: "Stolen creds", value: 97, detail: "97% of stolen-credential incidents traced to pupils" },
    { label: "Illegal activity", value: 20, detail: "~1 in 5 aged 10–16 engage in illegal online activity" },
  ],
  width = 840,
  height = 360,
  margin = { top: 36, right: 24, bottom: 36, left: 24 },
  title = "Student-driven risk snapshot",
  subtitle = "Schools & youth cyber context",
}) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, html: "" });

  // Light theme
  const C = {
    bg: "#ffffff",
    ink: "#1f2544",
    muted: "#4b4f6b",
    blue: "#5aa9ff",
    purple: "#6f7ce8",
    pink: "#ff6ad5",
    track: "#e9ebf5",
  };

  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const cols = items.length;
  const cellW = innerW / cols;
  const r = Math.min(cellW, innerH) / 2 - 20; // smaller radius to create more space
  const thickness = Math.max(10, Math.min(28, r * 0.28));

  const data = useMemo(
    () => items.map((d, i) => ({ ...d, value: Math.max(0, Math.min(100, +d.value || 0)), i })),
    [items]
  );

  const arc = d3.arc().cornerRadius(10);
  const startAngle = -Math.PI / 2;
  const scale = d3.scaleLinear().domain([0, 100]).range([0, 2 * Math.PI]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.attr("role", "img").attr("aria-label", title).attr("viewBox", `0 0 ${width} ${height}`);
    svg.select("rect.bg").attr("width", width).attr("height", height).attr("fill", C.bg);

    const g = svg.select("g.inner").attr("transform", `translate(${margin.left},${margin.top + 40})`);
    

    // Title
    svg
      .select("text.chart-title")
      .attr("x", width / 2)
      .attr("y", 26)
      .attr("text-anchor", "middle")
      .style("fill", C.ink)
      .style("font-weight", 700)
      .style("font-size", 18)
      .text(title);

    // Subtitle
    svg
      .select("text.chart-subtitle")
      .attr("x", width / 2)
      .attr("y", 46)
      .attr("text-anchor", "middle")
      .style("fill", C.muted)
      .style("font-weight", 600)
      .style("font-size", 12)
      .text(subtitle);

    // Gradients per badge 
    const defs = svg.select("defs.gradients");
    const grads = defs.selectAll("linearGradient.badgeGrad").data(data, (d) => d.i);
    grads
      .join((enter) =>
        enter
          .append("linearGradient")
          .attr("class", "badgeGrad")
          .attr("gradientUnits", "userSpaceOnUse")
          .each(function () {
            const gsel = d3.select(this);
            gsel
              .selectAll("stop")
              .data([
                { o: 0, c: C.blue },
                { o: 0.5, c: C.purple },
                { o: 1, c: C.pink },
              ])
              .join("stop")
              .attr("offset", (s) => s.o)
              .attr("stop-color", (s) => s.c)
              .attr("stop-opacity", 1);
          })
      )
      .attr("id", (d) => `badgeGrad-${d.i}`)
      .attr("x1", (d) => margin.left + cellW * d.i + cellW / 2 - r)
      .attr("y1", margin.top + innerH / 2)
      .attr("x2", (d) => margin.left + cellW * d.i + cellW / 2 + r)
      .attr("y2", margin.top + innerH / 2);

    // Groups
    const badges = g.select("g.badges").selectAll("g.badge").data(data, (d) => d.i);
    const enter = badges.enter().append("g").attr("class", "badge");

    badges.merge(enter).attr("transform", (d) => `translate(${cellW * d.i + cellW / 2}, ${innerH / 2})`);

    // Track
    badges
      .merge(enter)
      .selectAll("path.track")
      .data((d) => [d])
      .join("path")
      .attr("class", "track")
      .attr("fill", "none")
      .attr("stroke", C.track)
      .attr("stroke-width", thickness)
      .attr("d", arc({ innerRadius: r - thickness, outerRadius: r, startAngle, endAngle: startAngle + scale(100) }));

    // Arc
    badges
      .merge(enter)
      .selectAll("path.arc")
      .data((d) => [d])
      .join("path")
      .attr("class", "arc")
      .attr("fill", "none")
      .attr("stroke", (d) => `url(#badgeGrad-${d.i})`)
      .attr("stroke-width", thickness)
      .attr("stroke-linecap", "round")
      .attr("d", (d) => arc({ innerRadius: r - thickness, outerRadius: r, startAngle, endAngle: startAngle + scale(d.value) }))
      .on("mousemove", function (event, d) {
        const [mx, my] = d3.pointer(event, svg.node());
        setTooltip({ show: true, x: mx + 12, y: my + 12, html: `<strong>${d.label}</strong><br/>${d.value}%<br/><span style='opacity:.8'>${d.detail}</span>` });
      })
      .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })));

    // Value text
    badges
      .merge(enter)
      .selectAll("text.value")
      .data((d) => [d])
      .join("text")
      .attr("class", "value")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("fill", C.ink)
      .style("font-size", 22)
      .style("font-weight", 800)
      .text((d) => `${d.value}%`);

    // Label text
    badges
      .merge(enter)
      .selectAll("text.label")
      .data((d) => [d])
      .join("text")
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .attr("y", r + 28)
      .style("fill", C.muted)
      .style("font-size", 13)
      .style("font-weight", 600)
      .text((d) => d.label);

    badges.exit().remove();
  }, [items, data, width, height, margin, innerW, innerH, cellW, r, thickness, C, title, subtitle]);

  return (
    <div
      style={{
        position: "relative",
        maxWidth: width,
        margin: "2rem auto",
        padding: "16px",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 12px 28px rgba(24,33,95,0.12)",
        border: "1px solid #e9ebf5",
      }}
    >
      <svg ref={svgRef} width={width} height={height}>
        <rect className="bg" />
        <defs className="gradients" />
        <text className="chart-title" />
        <text className="chart-subtitle" />
        <g className="inner" transform={`translate(${margin.left},${margin.top})`}>
          <g className="badges" />
        </g>
      </svg>

      {tooltip.show && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            background: "#fff",
            color: "#1f2544",
            border: "1px solid #e9ebf5",
            borderRadius: 10,
            padding: "8px 10px",
            pointerEvents: "none",
            boxShadow: "0 10px 22px rgba(24,33,95,0.14)",
            fontSize: 12,
            whiteSpace: "nowrap",
            maxWidth: 220,
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.html }}
        />
      )}

      <style>{`
        text { font-family: ui-sans-serif, system-ui, Inter, Segoe UI, Roboto; }
      `}</style>
    </div>
  );
}
// ===== PIPELINE / REACH – PackedCirclesOutcomeGauge =====
export function PackedCirclesOutcomeGauge({
  metrics = [
    { id: "cf_students",  label: "Students 30k+", value: 30000, program: "CyberFirst" },
    { id: "cih_learners", label: "Learners 10k+", value: 10000, program: "Cyber Innovation Hub" },
    { id: "cf_events",    label: "Events 1.5k",    value: 1500,  program: "CyberFirst" },
    { id: "cf_schools",   label: "Schools 270",    value: 270,   program: "CyberFirst" },
  ],
  placementPct = 87,
  width = 920,
  height = 460,
  // Bigger top margin to reserve space for title + subtitle + legend
  margin = { top: 28, right: 28, bottom: 28, left: 28 },
  title = "Pipeline impact: reach & outcome",
  subtitle = "Bubbles show reach; ring shows bursary placement",
}) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, html: "" });

  // White/card theme (dark text)
  const C = useMemo(
    () => ({
      bg: "#ffffff",
      ink: "#1f2544",
      muted: "#4b4f6b",
      grid: "#e9ebf5",
      purple: "#6f7ce8", // CyberFirst
      blue: "#5aa9ff",   // Cyber Innovation Hub
      pink: "#ff6ad5",
    }),
    []
  );

  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  // Reserve vertical space at the top for header + legend
  const titleH = 22;     // y=24
  const subtitleH = 18;  // y=44
  const legendH = 26;    // spacing below subtitle
  const headerPad = 12;
  const headerBlock = titleH + subtitleH + legendH + headerPad; 
  const contentTopOffset = headerBlock;

  // Layout split: left (bubbles) / right (gauge)
  const gaugeColW = Math.max(280, innerW * 0.36);
  const bubblesW = innerW - gaugeColW - 18; 
  const bubblesH = innerH - contentTopOffset;

 
  const packLeaves = useMemo(() => {
    const children = metrics.map((m, i) => ({
      id: m.id ?? `${m.label}-${i}`,
      
      label: m.label,
      value: Math.max(0, +m.value || 0),
      program: m.program ?? "",
    }));
    const root = d3.hierarchy({ children }).sum((d) => d.value);
    const pack = d3.pack().size([bubblesW, bubblesH]).padding(12);
    return pack(root).leaves().map((leaf) => ({
      id: leaf.data.id,
      label: leaf.data.label,
      value: leaf.data.value,
      program: leaf.data.program,
      x: leaf.x,
      y: leaf.y + contentTopOffset, 
      r: leaf.r,
    }));
  }, [metrics, bubblesW, bubblesH, contentTopOffset]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.attr("role", "img").attr("aria-label", title).attr("viewBox", `0 0 ${width} ${height}`);
    svg.select("rect.bg").attr("width", width).attr("height", height).attr("fill", C.bg);

    // Titles
    svg
      .select("text.chart-title")
      .attr("x", width / 2)
      .attr("y", 24)
      .attr("text-anchor", "middle")
      .style("fill", C.ink)
      .style("font-weight", 700)
      .style("font-size", 18)
      .text(title);

    svg
      .select("text.chart-subtitle")
      .attr("x", width / 2)
      .attr("y", 44)
      .attr("text-anchor", "middle")
      .style("fill", C.muted)
      .style("font-weight", 600)
      .style("font-size", 12)
      .text(subtitle);

    const g = svg.select("g.inner").attr("transform", `translate(${margin.left},${margin.top})`);
    const gb = g.select("g.bubbles");
    const gg = g.select("g.gauge");
    const gl = g.select("g.legend");

    // ---------- LEGEND (centered, under subtitle, above content) ----------
    const legendItems = [
      { label: "CyberFirst", color: C.purple },
      { label: "Cyber Innovation Hub", color: C.blue },
    ];
    const legendY = 62; 
    gl
      .attr("transform", `translate(0,${legendY})`)
      .selectAll("g.item")
      .data(legendItems)
      .join((e) => {
        const it = e.append("g").attr("class", "item");
        it.append("circle");
        it.append("text");
        return it;
      })
      .attr("transform", (_d, i) => {
       
        const rowW = 320; 
        const startX = (innerW - rowW) / 2;
        return `translate(${startX + i * 160}, 0)`;
      })
      .each(function (d) {
        const node = d3.select(this);
        node.select("circle").attr("r", 6).attr("cx", 0).attr("cy", 0).attr("fill", d.color);
        node
          .select("text")
          .attr("x", 12)
          .attr("y", 4)
          .style("fill", C.ink)
          .style("font-weight", 600)
          .style("font-size", 12.5)
          .text(d.label);
      });

    // ---------- BUBBLES ----------
    const color = d3
      .scaleOrdinal()
      .domain(["CyberFirst", "Cyber Innovation Hub", "Other"])
      .range([C.purple, C.blue, "#7C3AED"]);

    gb
      .selectAll("rect.frame")
      .data([0])
      .join("rect")
      .attr("class", "frame")
      .attr("x", 0)
      .attr("y", contentTopOffset - 6)
      .attr("width", bubblesW)
      .attr("height", bubblesH + 6)
      .attr("fill", "none")
      .attr("stroke", C.grid)
      .attr("rx", 10)
      .attr("opacity", 1);

    const cells = gb.selectAll("g.node").data(packLeaves, (d) => d.id);
    const enter = cells.enter().append("g").attr("class", "node");
    enter.append("circle").attr("class", "bubble");
    enter.append("text").attr("class", "value");
    enter.append("text").attr("class", "label");

    cells.merge(enter).attr("transform", (d) => `translate(${d.x},${d.y})`);

    cells
      .merge(enter)
      .select("circle.bubble")
      .attr("r", (d) => d.r)
      .attr("fill", (d) => color(d.program))
      .attr("opacity", 0.9)
      .on("mousemove", function (event, d) {
        const [mx, my] = d3.pointer(event, svg.node());
        const html = `<strong>${d.label}</strong><br/>${d3.format(",")(d.value)}<br/><span style='opacity:.8'>${d.program}</span>`;
        const pad = 12;
        const tipW = 220;
        const tipH = 64;
        const tx = Math.max(pad, Math.min(mx + 12, width - tipW - pad));
        const ty = Math.max(pad, Math.min(my + 12, height - tipH - pad));
        setTooltip({ show: true, x: tx, y: ty, html });
      })
      .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })));

    
    cells
      .merge(enter)
      .select("text.value")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("fill", C.ink)
      .style("font-weight", 800)
      .style("font-size", 14)
      .text((d) => {
        const txt = d3.formatPrefix(".1", 1e3)(d.value).toUpperCase();
        return d.r < 18 ? "" : txt;
      });

    // labels (below)
    cells
      .merge(enter)
      .select("text.label")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.r + 16)
      .style("fill", C.muted)
      .style("font-weight", 600)
      .style("font-size", 12)
      .text((d) => d.label);

    cells.exit().remove();

   
    const gw = gaugeColW;
    const gh = bubblesH;
    const gx = bubblesW + 18;
    const gy = contentTopOffset - 6;

    const gWrap = gg.attr("transform", `translate(${gx},${gy})`);
    const centerXg = gw / 2;
    const centerYg = gh / 2 + 6;
    const radius = Math.min(gw, gh) * 0.34;
    const thickness = Math.max(16, radius * 0.22);

    const arc = d3.arc().innerRadius(radius - thickness).outerRadius(radius).cornerRadius(thickness / 2);
    const start = -Math.PI / 2;
    const toAngle = d3.scaleLinear().domain([0, 100]).range([0, 2 * Math.PI]);
    const pct = Math.max(0, Math.min(100, +placementPct || 0));

    
    gWrap
      .selectAll("rect.gframe")
      .data([0])
      .join("rect")
      .attr("class", "gframe")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", gw)
      .attr("height", gh + 6)
      .attr("fill", "none")
      .attr("stroke", C.grid)
      .attr("rx", 10);

    
    gWrap
      .selectAll("path.track")
      .data([0])
      .join("path")
      .attr("class", "track")
      .attr("transform", `translate(${centerXg},${centerYg})`)
      .attr("fill", "none")
      .attr("stroke", C.grid)
      .attr("stroke-width", thickness)
      .attr("d", arc({ startAngle: start, endAngle: start + toAngle(100) }));

    gWrap
      .selectAll("path.active")
      .data([pct])
      .join("path")
      .attr("class", "active")
      .attr("transform", `translate(${centerXg},${centerYg})`)
      .attr("fill", "url(#gaugeGrad)")
      .attr("stroke", C.pink)
      .attr("stroke-width", 1)
      .attr("d", arc({ startAngle: start, endAngle: start + toAngle(pct) }))
      .on("mousemove", (event) => {
        const [mx, my] = d3.pointer(event, svg.node());
        const html = `<strong>Bursary placement</strong><br/>${pct}%`;
        const pad = 12;
        const tipW = 200;
        const tipH = 48;
        const tx = Math.max(pad, Math.min(mx + 12, width - tipW - pad));
        const ty = Math.max(pad, Math.min(my + 12, height - tipH - pad));
        setTooltip({ show: true, x: tx, y: ty, html });
      })
      .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })));

    // center text
    gWrap
      .selectAll("text.center")
      .data([`${pct}%`])
      .join("text")
      .attr("class", "center")
      .attr("x", centerXg)
      .attr("y", centerYg + 6)
      .attr("text-anchor", "middle")
      .style("fill", C.ink)
      .style("font-weight", 800)
      .style("font-size", 22)
      .text((d) => d);

    gWrap
      .selectAll("text.sub")
      .data(["Bursary placement"])
      .join("text")
      .attr("class", "sub")
      .attr("x", centerXg)
      .attr("y", centerYg + radius + 22)
      .attr("text-anchor", "middle")
      .style("fill", C.muted)
      .style("font-weight", 600)
      .text((d) => d);
  }, [
    metrics,
    packLeaves,
    width,
    height,
    margin,
    innerW,
    innerH,
    bubblesW,
    bubblesH,
    gaugeColW,
    placementPct,
    C,
    title,
    subtitle,
    contentTopOffset,
  ]);

  return (
    <div
      style={{
        position: "relative",
        maxWidth: width,
        margin: "2rem auto",
        padding: "16px",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 12px 28px rgba(24,33,95,0.12)",
        border: "1px solid #e9ebf5",
        overflow: "hidden", 
      }}
    >
      <svg ref={svgRef} width={width} height={height} style={{ display: "block" }}>
        <rect className="bg" />
        <defs>
          {/* Gauge gradient */}
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffb3e7" />
            <stop offset="100%" stopColor="#ff6ad5" />
          </linearGradient>
        </defs>
        <text className="chart-title" />
        <text className="chart-subtitle" />
        <g className="inner" transform={`translate(${margin.left},${margin.top})`}>
          <g className="legend" />
          <g className="bubbles" />
          <g className="gauge" />
        </g>
      </svg>

      {tooltip.show && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            background: "#fff",
            color: "#1f2544",
            border: "1px solid #e9ebf5",
            borderRadius: 10,
            padding: "8px 10px",
            pointerEvents: "none",
            boxShadow: "0 10px 22px rgba(24,33,95,0.14)",
            fontSize: 12.5,
            whiteSpace: "nowrap",
            maxWidth: 220,
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.html }}
        />
      )}
    </div>
  );
}