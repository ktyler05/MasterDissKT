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
    { label: "Breached", value: 87 },
    { label: ">£1M loss", value: 53 },
    { label: "Leaders penalised", value: 51 },
  ],
  width = 640,
  height = 320,
  margin = { top: 56, right: 28, bottom: 48, left: 180 },
  title = "Breach impact",
  subtitle = "Share of organisations affected",
}) {
  const svgRef = React.useRef(null);
  const [tooltip, setTooltip] = React.useState({ show: false, x: 0, y: 0, html: "" });

  const rows = React.useMemo(
    () =>
      data.map((d, i) => ({
        label: d.label,
        value: Math.max(0, Math.min(100, +d.value || 0)),
        i,
      })),
    [data]
  );

  const innerW = React.useMemo(() => Math.max(50, width - margin.left - margin.right), [width, margin]);
  const innerH = React.useMemo(() => Math.max(50, height - margin.top - margin.bottom), [height, margin]);

  const x = React.useMemo(() => d3.scaleLinear().domain([0, 100]).range([0, innerW]).nice(), [innerW]);
  const y = React.useMemo(
    () => d3.scaleBand().domain(rows.map((d) => d.label)).range([0, innerH]).padding(0.2),
    [rows, innerH]
  );

  const colors = React.useMemo(
    () => ({
      cardBg: "#ffffff",
      ink: "#1f2544",
      muted: "#4b4f6b",
      grid: "#e9ebf5",
      bar: "#6f7ce8",      // main bar color
      barAlt: "#9a7be0",   // end-cap/gradient hint (optional)
    }),
    []
  );

  React.useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg
      .attr("role", "img")
      .attr("aria-label", title)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // background behind the plot area
    svg.select("rect.bg").attr("width", width).attr("height", height).attr("fill", colors.cardBg);

    // title/subtitle
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

    const g = svg.select("g.inner").attr("transform", `translate(${margin.left},${margin.top})`);

    // X axis
    const xAxisG = g.select("g.x-axis").attr("transform", `translate(0, ${innerH})`);
    const axis = d3.axisBottom(x).ticks(5).tickFormat((t) => `${t}%`);
    xAxisG.call(axis);
    xAxisG.selectAll("path, line").attr("stroke", colors.grid);
    xAxisG.selectAll("text").attr("fill", colors.muted).style("font-weight", 600);

    // Y axis (category labels)
    const yAxisG = g.select("g.y-axis");
    const yAxis = d3.axisLeft(y).tickSize(0);
    yAxisG.call(yAxis);
    yAxisG.selectAll("path").attr("stroke", "none");
    yAxisG.selectAll("text").attr("fill", colors.ink).style("font-weight", 600);

    // Gridlines (vertical)
    const gridG = g.select("g.grid");
    gridG
      .selectAll("line.grid-x")
      .data(x.ticks(5), (d) => d)
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
        (update) => update.attr("x1", (d) => x(d)).attr("x2", (d) => x(d)).attr("y2", innerH),
        (exit) => exit.remove()
      );

    // Bars
    const bars = g.select("g.bars").selectAll("rect.bar").data(rows, (d) => d.label);
    bars
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("class", "bar")
            .attr("x", x(0))
            .attr("y", (d) => y(d.label) ?? 0)
            .attr("height", y.bandwidth())
            .attr("width", (d) => x(d.value) - x(0))
            .attr("rx", 8)
            .attr("fill", colors.bar)
            .on("mousemove", function (event, d) {
              const [mx, my] = d3.pointer(event, svg.node());
              setTooltip({
                show: true,
                x: mx + 12,
                y: my + 12,
                html: `<strong>${d.label}</strong><br/>${d.value}%`,
              });
            })
            .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false }))),
        (update) =>
          update
            .attr("y", (d) => y(d.label) ?? 0)
            .attr("height", y.bandwidth())
            .attr("width", (d) => x(d.value) - x(0)),
        (exit) => exit.remove()
      );

    // Value labels at bar end
    const vals = g.select("g.vals").selectAll("text.val").data(rows, (d) => d.label);
    vals
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("class", "val")
            .attr("x", (d) => x(d.value) + 8)
            .attr("y", (d) => (y(d.label) ?? 0) + y.bandwidth() / 2 + 4)
            .attr("text-anchor", "start")
            .style("fill", colors.ink)
            .style("font-weight", 700)
            .text((d) => `${d.value}%`),
        (update) =>
          update
            .attr("x", (d) => x(d.value) + 8)
            .attr("y", (d) => (y(d.label) ?? 0) + y.bandwidth() / 2 + 4)
            .text((d) => `${d.value}%`),
        (exit) => exit.remove()
      );
  }, [rows, width, height, margin, innerW, innerH, x, y, colors, title, subtitle]);

  return (
    <div
      style={{
        position: "relative",
        maxWidth: width,
        margin: "2rem auto",
        padding: 16,                // card padding so nothing touches the edges
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 12px 28px rgba(24,33,95,0.12)",
        border: "1px solid #e9ebf5",
        overflow: "hidden",         // clip to rounded corners
      }}
    >
      <svg ref={svgRef} style={{ width: "100%", height: "auto", display: "block" }}>
        <rect className="bg" />
        <text className="chart-title" />
        <text className="chart-subtitle" />
        <g className="inner" transform={`translate(${margin.left},${margin.top})`}>
          <g className="grid" />
          <g className="bars" />
          <g className="vals" />
          <g className="x-axis" />
          <g className="y-axis" />
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
            padding: "10px 12px",
            pointerEvents: "none",
            boxShadow: "0 10px 22px rgba(24,33,95,0.14)",
            fontSize: 13,
            lineHeight: 1.4,
            whiteSpace: "normal",
            wordBreak: "break-word",
            maxWidth: 260,
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.html }}
        />
      )}
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

    const small = width <= 420;
    const tiny = width <= 340;

    const tickFS = tiny ? 10 : small ? 11 : 12;
    const labFS  = tiny ? 11 : small ? 12 : 13;
    const legFS  = tiny ? 11 : 12;

    // dynamic left margin based on label length (keeps bars inside on phones)
    const approxCharW = 6.5 * (labFS / 12);
    const longestLabelPx =
      d3.max(raw, (d) => d.item.length) * approxCharW + 8;

    const leftBase = Math.max(80, Math.min(180, Math.round(longestLabelPx)));
    const margin = {
      top: small ? 58 : 62,
      right: small ? 10 : 18,
      bottom: small ? 42 : 48,
      left: leftBase,
    };

    const innerW = Math.max(220, width - margin.left - margin.right);
    const innerH = Math.max(160, height - margin.top - margin.bottom);

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("role", "img")
      .attr("aria-label", "School cyber readiness vs gap (100% stacked bars)");

    svg.selectAll("*").remove();

    // background (kept white to match card)
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent");

    const g = svg
      .append("g")
      .attr("class", "inner")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const keys = ["Ready", "Gap"];
    const color = d3.scaleOrdinal().domain(keys).range(["#6f7ce8", "#b18cf0"]);

    const y = d3
      .scaleBand()
      .domain(raw.map((d) => d.item))
      .range([0, innerH])
      .padding(0.24);

    const x = d3.scaleLinear().domain([0, 100]).range([0, innerW]);

    const stack = d3.stack().keys(keys);
    const series = stack(raw);

    // axes
    const xAxis = d3
      .axisBottom(x)
      .ticks(small ? 4 : 5)
      .tickFormat((t) => `${t}%`)
      .tickPadding(6);

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerH})`)
      .call(xAxis)
      .call((sel) => {
        sel.selectAll("path, line").attr("stroke", "#e9ebf5");
        sel.selectAll("text").style("font-size", `${tickFS}px`).attr("fill", "#4b4f6b");
      });

    const yAxis = d3.axisLeft(y).tickSize(0).tickPadding(8);

    g.append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .call((sel) => {
        sel.selectAll("text")
          .style("font-size", `${labFS}px`)
          .attr("fill", "#1f2544");
        sel.select(".domain").remove();
      });

    // gridlines (optional but helps readability)
    g.append("g")
      .attr("class", "grid-x")
      .selectAll("line")
      .data(x.ticks(small ? 4 : 5))
      .join("line")
      .attr("x1", (d) => x(d))
      .attr("x2", (d) => x(d))
      .attr("y1", 0)
      .attr("y2", innerH)
      .attr("stroke", "#f1f3fb");

    // bars
    const groups = g
      .selectAll("g.layer")
      .data(series)
      .enter()
      .append("g")
      .attr("class", "layer")
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
        const key = d3.select(event.target.parentNode).datum().key;
        const value = seg.data[key];

        const wrap = wrapperRef.current.getBoundingClientRect();
        const pad = 10;
        const tipW = 220;
        const tipH = 80;

        const mouseX = event.clientX - wrap.left;
        const mouseY = event.clientY - wrap.top;

        const tx = Math.max(pad, Math.min(mouseX + 12, wrap.width - tipW - pad));
        const ty = Math.max(pad, Math.min(mouseY + 12, wrap.height - tipH - pad));

        d3
          .select(tooltipRef.current)
          .style("left", `${tx}px`)
          .style("top", `${ty}px`)
          .style("opacity", 1)
          .html(`
            <div class="tt-title">${seg.data.item}</div>
            <div class="tt-sub">${key}</div>
            <div class="tt-value">${value}%</div>
          `);
      })
      .on("mouseleave", () => d3.select(tooltipRef.current).style("opacity", 0));

    // legend (top-left inside plot, compact on phones)
    const legend = g.append("g").attr("class", "legend");
    const legItems = legend
      .selectAll("g.leg")
      .data(keys)
      .enter()
      .append("g")
      .attr("class", "leg")
      .attr("transform", (_d, i) => `translate(${i * (small ? 110 : 140)}, ${- (small ? 18 : 20)})`);

    legItems
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("rx", 3)
      .attr("fill", (d) => color(d));

    legItems
      .append("text")
      .attr("x", 16)
      .attr("y", 10)
      .style("font-size", `${legFS}px`)
      .style("font-weight", 600)
      .attr("fill", "#1f2544")
      .text((d) => d);
  }, [bounds, raw]);

  return (
    <ChartFrame
      title="School cyber readiness vs gap"
      subtitle="100% per control: share of schools that have these cyber security precautions Ready vs the Gap that don't"
      height={320}
    >
      <div
        ref={wrapperRef}
        style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}
      >
        <svg ref={svgRef} style={{ width: "100%", height: "100%", display: "block" }} />
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
  margin = { top: 36, right: 32, bottom: 52, left: 160 },
  title = "Representation gaps to parity (50%)",
  subtitle = "UK cyber workforce",
}) {
  const svgRef = React.useRef(null);
  const [tooltip, setTooltip] = React.useState({ show: false, x: 0, y: 0, html: "" });

  // Scales & constants (memoized to keep eslint happy)
  const rows = React.useMemo(
    () =>
      data.map((d, i) => ({
        label: d.label,
        value: Math.max(0, Math.min(100, +d.value || 0)),
        i,
      })),
    [data]
  );

  const innerW = React.useMemo(() => width - margin.left - margin.right, [width, margin]);
  const innerH = React.useMemo(() => height - margin.top - margin.bottom, [height, margin]);

  const x = React.useMemo(() => d3.scaleLinear().domain([0, 50]).range([0, innerW]).nice(), [innerW]);
  const y = React.useMemo(
    () => d3.scalePoint().domain(rows.map((d) => d.label)).range([0, innerH]).padding(0.9),
    [rows, innerH]
  );

  const colors = React.useMemo(
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

  React.useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Responsive frame
    svg.attr("role", "img").attr("aria-label", title).attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");

    // background (for a crisp white behind the chart area)
    svg.select("rect.bg").attr("width", width).attr("height", height).attr("fill", colors.bg);

    // Title / subtitle
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

    // Inner group — small global scale so labels don’t clip small cards
    const g = svg
      .select("g.inner")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X axis
    const xAxisG = g.select("g.x-axis").attr("transform", `translate(0, ${innerH})`);
    const axis = d3.axisBottom(x).ticks(5).tickFormat((t) => `${t}%`);
    xAxisG.call(axis);
    xAxisG.selectAll("path, line").attr("stroke", colors.grid);
    xAxisG.selectAll("text").attr("fill", colors.muted).style("font-weight", 600);

    // Vertical grid lines
    const gridG = g.select("g.grid");
    gridG
      .selectAll("line.grid-x")
      .data(x.ticks(5), (d) => d)
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
          update
            .attr("x1", (d) => x(d))
            .attr("x2", (d) => x(d))
            .attr("y2", innerH),
        (exit) => exit.remove()
      );

    // Gradients per row (fade toward target)
    const defs = svg.select("defs.gradients");
    defs
      .selectAll("linearGradient.rowGrad")
      .data(rows, (d) => d.label)
      .join(
        (enter) => {
          const lg = enter
            .append("linearGradient")
            .attr("class", "rowGrad")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("id", (d) => `rowGrad-${d.i}`);
          lg.append("stop").attr("offset", 0).attr("stop-color", colors.purple).attr("stop-opacity", 1);
          lg.append("stop").attr("offset", 1).attr("stop-color", colors.pink).attr("stop-opacity", 0.35);
          return lg;
        },
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
            .attr("x2", (d) => x(50))
            .attr("stroke", (d) => `url(#rowGrad-${d.i})`),
        (exit) => exit.remove()
      );

    // Dots
    rowG
      .selectAll("circle.dot")
      .data(rows, (d) => d.label)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("class", "dot")
            .attr("r", 7)
            .attr("cx", (d) => x(Math.min(d.value, 50)))
            .attr("cy", (d) => y(d.label))
            .attr("fill", colors.purple)
            .style("filter", "drop-shadow(0 2px 6px rgba(0,0,0,.20))")
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
            .attr("cx", (d) => x(Math.min(d.value, 50)))
            .attr("cy", (d) => y(d.label))
            .on("mousemove", function (event, d) {
              const [mx, my] = d3.pointer(event, svg.node());
              const gap = 50 - Math.min(d.value, 50);
              setTooltip({
                show: true,
                x: mx + 12,
                y: my + 12,
                html: `<strong>${d.label}</strong><br/>Current: ${d.value}%<br/>Gap to parity: ${d3.format(".0f")(gap)}pp`,
              });
            }),
        (exit) => exit.remove()
      );

    // Target diamonds
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
            .attr("transform", (d) => `translate(${x(50)}, ${y(d.label)}) rotate(45)`)
            .on("mousemove", function (event, d) {
              const [mx, my] = d3.pointer(event, svg.node());
              const gap = 50 - Math.min(d.value, 50);
              setTooltip({
                show: true,
                x: mx + 12,
                y: my + 12,
                html: `<strong>${d.label}</strong><br/>Target: 50%<br/>Gap: ${d3.format(".0f")(gap)}pp`,
              });
            }),
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
  }, [rows, width, height, margin, innerW, innerH, x, y, colors, title, subtitle]);

  return (
    <div
      style={{
        position: "relative",
        maxWidth: width,
        margin: "2rem auto",
        padding: 16,                 // extra card padding
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 12px 28px rgba(24,33,95,0.12)",
        border: "1px solid #e9ebf5",
        overflow: "hidden",          // clip anything that might overflow rounded corners
      }}
    >
      <svg
        ref={svgRef}
        style={{ width: "100%", height: "auto", display: "block" }} // responsive
      >
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
            padding: "10px 12px",
            pointerEvents: "none",
            boxShadow: "0 10px 22px rgba(24,33,95,0.14)",
            fontSize: 13,
            lineHeight: 1.4,
            whiteSpace: "normal",
            wordBreak: "break-word",
            maxWidth: 280,
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
    { label: "Stolen credentials", value: 97, detail: "97% of stolen-credential incidents traced to pupils" },
    { label: "Illegal activity", value: 20, detail: "~1 in 5 aged 10–16 engage in illegal online activity" },
  ],
  width = 840,
  height = 360,
  // extra top margin to keep titles away from the chart
  margin = { top: 64, right: 24, bottom: 40, left: 24 },
  title = "Student-driven risk snapshot",
  subtitle = "Schools & youth cyber context",
}) {
  const svgRef = React.useRef(null);
  const [tooltip, setTooltip] = React.useState({ show: false, x: 0, y: 0, html: "" });

  const C = React.useMemo(
    () => ({
      bg: "#ffffff",
      ink: "#1f2544",
      muted: "#4b4f6b",
      track: "#e9ebf5",
      blue: "#5AA9FF",
      purple: "#6f7ce8",
      pink: "#FF6AD5",
    }),
    []
  );

  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const cols = items.length;
  const cellW = innerW / cols;

  const data = React.useMemo(
    () => items.map((d, i) => ({ ...d, value: Math.max(0, Math.min(100, +d.value || 0)), i })),
    [items]
  );

  const r = Math.min(cellW, innerH) / 2 - 12;
  const thickness = Math.max(10, Math.min(28, r * 0.28));

  const startAngle = React.useMemo(() => -Math.PI / 2, []);
  const scale = React.useMemo(() => d3.scaleLinear().domain([0, 100]).range([0, 2 * Math.PI]), []);
  const arc = React.useMemo(() => d3.arc().cornerRadius(10), []);

  React.useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.attr("role", "img").attr("aria-label", title).attr("viewBox", `0 0 ${width} ${height}`);
    svg.select("rect.bg").attr("width", width).attr("height", height).attr("fill", C.bg);

    // Title & subtitle with more padding from the chart
    svg
      .select("text.chart-title")
      .attr("x", width / 2)
      .attr("y", 28)
      .attr("text-anchor", "middle")
      .style("fill", C.ink)
      .style("font-weight", 700)
      .style("font-size", 18)
      .text(title);

    svg
      .select("text.chart-subtitle")
      .attr("x", width / 2)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .style("fill", C.muted)
      .style("font-weight", 600)
      .style("font-size", 12)
      .text(subtitle);

    const g = svg.select("g.inner").attr("transform", `translate(${margin.left},${margin.top})`);

    // Gradients per badge (blue→purple→pink)
    const defs = svg.select("defs.gradients");
    const grads = defs.selectAll("linearGradient.badgeGrad").data(data, (d) => d.i);
    const gradEnter = grads
      .enter()
      .append("linearGradient")
      .attr("class", "badgeGrad")
      .attr("gradientUnits", "userSpaceOnUse");

    grads
      .merge(gradEnter)
      .attr("id", (d) => `badgeGrad-${d.i}`)
      .attr("x1", (d) => margin.left + cellW * d.i + cellW / 2 - r)
      .attr("y1", (d) => margin.top + innerH / 2)
      .attr("x2", (d) => margin.left + cellW * d.i + cellW / 2 + r)
      .attr("y2", (d) => margin.top + innerH / 2)
      .each(function () {
        const gsel = d3.select(this);
        const stops = [
          { o: 0, c: C.blue },
          { o: 0.5, c: C.purple },
          { o: 1, c: C.pink },
        ];
        let s = gsel.selectAll("stop").data(stops);
        s.enter().append("stop");
        gsel
          .selectAll("stop")
          .data(stops)
          .attr("offset", (s) => s.o)
          .attr("stop-color", (s) => s.c)
          .attr("stop-opacity", 1);
      });
    grads.exit().remove();

    // Groups per badge
    const badges = g.select("g.badges").selectAll("g.badge").data(data, (d) => d.i);
    const enter = badges.enter().append("g").attr("class", "badge");

    badges.merge(enter).attr("transform", (d) => `translate(${cellW * d.i + cellW / 2}, ${innerH / 2})`);

    // Track
    const track = badges.merge(enter).selectAll("path.track").data((d) => [d]);
    track
      .enter()
      .append("path")
      .attr("class", "track")
      .merge(track)
      .attr("fill", "none")
      .attr("stroke", C.track)
      .attr("stroke-width", thickness)
      .attr("d", arc({ innerRadius: r - thickness, outerRadius: r, startAngle, endAngle: startAngle + scale(100) }));

    // Active arc (no growth animation)
    const arcSel = badges.merge(enter).selectAll("path.arc").data((d) => [d]);
    arcSel
      .enter()
      .append("path")
      .attr("class", "arc")
      .merge(arcSel)
      .attr("fill", "none")
      .attr("stroke", (d) => `url(#badgeGrad-${d.i})`)
      .attr("stroke-width", thickness)
      .attr("stroke-linecap", "round")
      .attr("d", (d) => arc({ innerRadius: r - thickness, outerRadius: r, startAngle, endAngle: startAngle + scale(d.value) }))
      .on("mousemove", function (event, d) {
        const [mx, my] = d3.pointer(event, svg.node());
        const pad = 10;
        const tipW = 300;
        const tipH = 100;
        const tx = Math.max(pad, Math.min(mx + 12, width - tipW - pad));
        const ty = Math.max(pad, Math.min(my + 12, height - tipH - pad));
        setTooltip({
          show: true,
          x: tx,
          y: ty,
          html: `<strong>${d.label}</strong><br/>${d.value}%<br/><span style="opacity:.8">${d.detail ?? ""}</span>`,
        });
      })
      .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })));

    // Center value
    const valText = badges.merge(enter).selectAll("text.value").data((d) => [d]);
    valText
      .enter()
      .append("text")
      .attr("class", "value")
      .merge(valText)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("fill", C.ink)
      .style("font-size", 24)
      .style("font-weight", 800)
      .text((d) => `${d3.format(".0f")(d.value)}%`);

    // Label below badge
    const labText = badges.merge(enter).selectAll("text.label").data((d) => [d]);
    labText
      .enter()
      .append("text")
      .attr("class", "label")
      .merge(labText)
      .attr("text-anchor", "middle")
      .attr("y", r + 30)
      .style("fill", C.muted)
      .style("font-size", 13)
      .style("font-weight", 600)
      .text((d) => d.label);

    badges.exit().remove();
  }, [
    items,
    data,
    width,
    height,
    margin,
    innerW,
    innerH,
    cellW,
    r,
    thickness,
    startAngle,
    scale,
    arc,
    C,
    title,
    subtitle,
  ]);

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
            padding: "10px 12px",
            pointerEvents: "none",
            boxShadow: "0 10px 22px rgba(24,33,95,0.14)",
            fontSize: 13,
            lineHeight: 1.4,
            whiteSpace: "normal",
            wordBreak: "break-word",
            maxWidth: 300,
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
  margin = { top: 28, right: 28, bottom: 28, left: 28 },
  title = "Pipeline impact: reach & outcome",
  subtitle = "Bubbles show reach; ring shows bursary placement",
}) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, html: "" });

  const C = useMemo(
    () => ({
      bg: "#ffffff",
      ink: "#1f2544",
      muted: "#4b4f6b",
      grid: "#e9ebf5",
      purple: "#6f7ce8",
      blue: "#5aa9ff",
      pink: "#ff6ad5",
    }),
    []
  );


  const safeW = Math.max(320, width);
  const safeH = Math.max(300, height);

  const innerW = safeW - margin.left - margin.right;
  const innerH = safeH - margin.top - margin.bottom;


  const titleH = 22;
  const subtitleH = 18;
  const legendH = 26;
  const headerPad = 12;
  const contentTopOffset = titleH + subtitleH + legendH + headerPad;

 
  const gaugeColW = Math.max(260, Math.floor(innerW * 0.36));
  const bubblesW = Math.max(160, innerW - gaugeColW - 18);
  const bubblesH = Math.max(140, innerH - contentTopOffset);

  
  const packLeaves = useMemo(() => {
    if (bubblesW < 80 || bubblesH < 80) return [];

    const children = metrics.map((m, i) => ({
      id: m.id ?? `${m.label}-${i}`,
      label: m.label,
      value: Math.max(0, +m.value || 0),
      program: m.program ?? "",
    }));

    const root = d3.hierarchy({ children }).sum((d) => d.value);
    const pack = d3.pack().size([bubblesW, bubblesH]).padding(24);
    const leaves = pack(root).leaves();

    return leaves.map((leaf) => ({
      id: leaf.data.id,
      label: leaf.data.label,
      value: leaf.data.value,
      program: leaf.data.program,
      x: leaf.x,
      y: leaf.y + contentTopOffset,
      r: Math.max(6, leaf.r), 
    }));
  }, [metrics, bubblesW, bubblesH, contentTopOffset]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.attr("role", "img").attr("aria-label", title).attr("viewBox", `0 0 ${safeW} ${safeH}`);
    svg.select("rect.bg").attr("width", safeW).attr("height", safeH).attr("fill", C.bg);

    
    svg.select("text.chart-title")
      .attr("x", safeW / 2)
      .attr("y", 24)
      .attr("text-anchor", "middle")
      .style("fill", C.ink)
      .style("font-weight", 700)
      .style("font-size", 18)
      .text(title);

    svg.select("text.chart-subtitle")
      .attr("x", safeW / 2)
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

   
    const legendItems = [
      { label: "CyberFirst", color: C.purple },
      { label: "Cyber Innovation Hub", color: C.blue },
    ];
    const rowW = 320;
    const startX = Math.max(0, (innerW - rowW) / 2);
    const legendY = 62;

    gl.attr("transform", `translate(0,${legendY})`)
      .selectAll("g.item")
      .data(legendItems)
      .join((e) => {
        const it = e.append("g").attr("class", "item");
        it.append("circle");
        it.append("text");
        return it;
      })
      .attr("transform", (_d, i) => `translate(${startX + i * 160}, 0)`)
      .each(function (d) {
        const node = d3.select(this);
        node.select("circle").attr("r", 6).attr("cx", 0).attr("cy", 0).attr("fill", d.color);
        node.select("text")
          .attr("x", 12)
          .attr("y", 4)
          .style("fill", C.ink)
          .style("font-weight", 600)
          .style("font-size", 12.5)
          .text(d.label);
      });

   
    const color = d3
      .scaleOrdinal()
      .domain(["CyberFirst", "Cyber Innovation Hub", "Other"])
      .range([C.purple, C.blue, "#7C3AED"]);

    
    gb.selectAll("rect.frame")
      .data([0])
      .join("rect")
      .attr("class", "frame")
      .attr("x", 0)
      .attr("y", contentTopOffset - 6)
      .attr("width", bubblesW)
      .attr("height", bubblesH + 6)
      .attr("fill", "none")
      .attr("stroke", C.grid)
      .attr("rx", 10);

   
    const cells = gb.selectAll("g.node").data(packLeaves, (d) => d.id);
    const enter = cells.enter().append("g").attr("class", "node");
    enter.append("circle").attr("class", "bubble");
    enter.append("text").attr("class", "value");
    enter.append("text").attr("class", "label");

    cells.merge(enter).attr("transform", (d) => `translate(${d.x},${d.y})`);

    cells.merge(enter).select("circle.bubble")
      .attr("r", (d) => d.r)
      .attr("fill", (d) => color(d.program))
      .attr("opacity", 0.9)
      .on("mousemove", function (event, d) {
        const [mx, my] = d3.pointer(event, svg.node());
        const html = `<strong>${d.label}</strong><br/>${d3.format(",")(d.value)}<br/><span style='opacity:.8'>${d.program}</span>`;
        const pad = 12;
        const tipW = 220;
        const tipH = 64;
        const tx = Math.max(pad, Math.min(mx + 12, safeW - tipW - pad));
        const ty = Math.max(pad, Math.min(my + 12, safeH - tipH - pad));
        setTooltip({ show: true, x: tx, y: ty, html });
      })
      .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })));

    cells.merge(enter).select("text.value")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("fill", C.ink)
      .style("font-weight", 800)
      .style("font-size", 14)
      .text((d) => (d.r < 18 ? "" : d3.formatPrefix(".1", 1e3)(d.value).toUpperCase()));

    cells.merge(enter).select("text.label")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.r + 16)
      .style("fill", C.muted)
      .style("font-weight", 600)
      .style("font-size", 12)
      .text((d) => d.label);

    cells.exit().remove();

    // Gauge
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

    gWrap.selectAll("rect.gframe")
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

    gWrap.selectAll("path.track")
      .data([0])
      .join("path")
      .attr("class", "track")
      .attr("transform", `translate(${centerXg},${centerYg})`)
      .attr("fill", "none")
      .attr("stroke", C.grid)
      .attr("stroke-width", thickness)
      .attr("d", arc({ startAngle: start, endAngle: start + toAngle(100) }));

    gWrap.selectAll("path.active")
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
        const tx = Math.max(pad, Math.min(mx + 12, safeW - tipW - pad));
        const ty = Math.max(pad, Math.min(my + 12, safeH - tipH - pad));
        setTooltip({ show: true, x: tx, y: ty, html });
      })
      .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })));

    gWrap.selectAll("text.center")
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

    gWrap.selectAll("text.sub")
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
    safeW,
    safeH,
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
        maxWidth: safeW,
        margin: "2rem auto",
        padding: 16,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 12px 28px rgba(24,33,95,0.12)",
        border: "1px solid #e9ebf5",
        overflow: "hidden",
      }}
    >
      <svg ref={svgRef} width={safeW} height={safeH} style={{ display: "block" }}>
        <rect className="bg" />
        <defs>
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
