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

export function BreachImpactFunnel({
  data = [
    { label: "All orgs", value: 100 },
    { label: "Breached", value: 87 },
    { label: ">£1M loss", value: 53 },
    { label: "Leaders penalised", value: 51 },
  ],
  width = 480,
  height = 300,
  margin = { top: 36, right: 20, bottom: 28, left: 20 },
  title = "Breach Impact Funnel",
  desc = "100% baseline → 87% breached → 53% with >£1M losses → 51% leaders penalised.",
}) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, html: "" });

  // prepare data (clamped & non-increasing)
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

  useEffect(() => {
    const innerW = Math.max(10, width - margin.left - margin.right);
    const innerH = Math.max(10, height - margin.top - margin.bottom);

    const svg = d3.select(svgRef.current);
    // clean slate on every render (prevents “stacked text”)
    svg.selectAll("*").remove();

    // structure
    svg
      .attr("width", width)
      .attr("height", height)
      .attr("role", "img")
      .attr("aria-label", title);

    svg.append("desc").text(desc);
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0b0b12");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // scales
    const x = d3.scaleLinear().domain([0, 100]).range([0, innerW]);
    const y = d3
      .scalePoint()
      .domain(d3.range(stages.length))
      .range([0, innerH])
      .padding(0.8);

    // segments
    const segments = [];
    const cx = innerW / 2;
    for (let i = 0; i < stages.length - 1; i++) {
      const top = stages[i];
      const bot = stages[i + 1];
      const y1 = y(i);
      const y2 = y(i + 1);
      const w1 = x(top.value);
      const w2 = x(bot.value);
      const x1L = cx - w1 / 2;
      const x1R = cx + w1 / 2;
      const x2L = cx - w2 / 2;
      const x2R = cx + w2 / 2;
      const r = Math.min(12, Math.abs(w1 - w2) / 4);
      const path = `M ${x1L} ${y1}
        L ${x1R} ${y1}
        C ${x1R} ${y1 + r} ${x2R} ${y2 - r} ${x2R} ${y2}
        L ${x2L} ${y2}
        C ${x2L} ${y2 - r} ${x1L} ${y1 + r} ${x1L} ${y1}
        Z`;
      segments.push({ i, path, top, bot });
    }

    const color = d3
      .scaleLinear()
      .domain([0, Math.max(1, segments.length - 1)])
      .range(["#5AA9FF", "#FF6AD5"])
      .interpolate(d3.interpolateHcl);

    // grid lines
    g.append("g")
      .selectAll("line")
      .data(stages.map((_, i) => y(i)))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerW)
      .attr("y1", (d) => d)
      .attr("y2", (d) => d)
      .attr("stroke", "#2a2e3a");

    // segments
    g.append("g")
      .selectAll("path.segment")
      .data(segments)
      .enter()
      .append("path")
      .attr("class", "segment")
      .attr("d", (d) => d.path)
      .attr("fill", (d) => color(d.i))
      .attr("opacity", 0.9)
      .on("mousemove", function (event, d) {
        const [mx, my] = d3.pointer(event, this.ownerSVGElement);
        setTooltip({
          show: true,
          x: mx + 12,
          y: my + 12,
          html: `<strong>${d.top.label} → ${d.bot.label}</strong><br/>${d.bot.value}% remain`,
        });
      })
      .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })));

    // labels
    const labelG = g.append("g");
    const cxLabel = innerW / 2;
    stages.forEach((s, i) => {
      const yPos = y(i);
      labelG
        .append("text")
        .attr("x", cxLabel)
        .attr("y", yPos - 14)
        .attr("text-anchor", "middle")
        .style("font-weight", i === 0 ? 700 : 600)
        .style("fill", "#eae7ff")
        .text(s.label);

      labelG
        .append("text")
        .attr("x", cxLabel)
        .attr("y", yPos + 18)
        .attr("text-anchor", "middle")
        .style("fill", "#b7d7ff")
        .text(d3.format(".0f")(s.value) + "%");
    });

    // title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 24)
      .attr("text-anchor", "middle")
      .style("font-weight", 700)
      .style("font-size", 18)
      .style("fill", "#eae7ff")
      .text(title);
  }, [data, stages, width, height, margin, title, desc]);

  return (
    <div style={{ position: "relative", width }}>
      <svg ref={svgRef} />
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
  basic = 44, // basic shortfall %
  advanced = 27, // advanced shortfall %
  width = 520,
  height = 420,
  margin = { top: 24, right: 24, bottom: 24, left: 24 },
  title = "Skills shortfall (2024)",
}) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, html: "" });

  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const cx = innerW / 2;
  const cy = innerH / 2 + 10; // nudge slightly down to balance title

  // Theme tokens (kept inside component; include in deps since object identity changes)
  const colors = useMemo(
    () => ({
      bg: "#0b0b12",
      ink: "#eae7ff",
      muted: "#9aa0b3",
      grid: "#2a2e3a",
      purple: "#A78BFA",
      pink: "#FF6AD5",
      track: "#2a2e3a",
      accent: "#ffd166",
    }),
    []
  );

  // radii for rings (recompute on size change)
  const rings = useMemo(() => {
    const R = Math.min(innerW, innerH) / 2;
    return {
      outer: { r0: R - 36, r1: R - 12 }, // thickness 24
      inner: { r0: R - 72, r1: R - 48 },
    };
  }, [innerW, innerH]);

  // clamp values
  const basicVal = Math.max(0, Math.min(100, +basic || 0));
  const advVal = Math.max(0, Math.min(100, +advanced || 0));

  // arc generators (safe to recreate each render)
  const arcOuter = d3
    .arc()
    .innerRadius(rings.outer.r0)
    .outerRadius(rings.outer.r1)
    .cornerRadius(12);
  const arcInner = d3
    .arc()
    .innerRadius(rings.inner.r0)
    .outerRadius(rings.inner.r1)
    .cornerRadius(12);

  const startAngle = -Math.PI / 2; // 12 o'clock
  const scale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([0, 2 * Math.PI]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    svg
      .attr("role", "img")
      .attr("aria-label", title)
      .attr("viewBox", `0 0 ${width} ${height}`);

    svg
      .select("rect.bg")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", colors.bg);

    const g = svg
      .select("g.inner")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // BACK TRACKS
    const tracks = [
      { key: "outer", arc: arcOuter, color: colors.track },
      { key: "inner", arc: arcInner, color: colors.track },
    ];
    const trackG = g.select("g.tracks");
    const tpaths = trackG.selectAll("path.track").data(tracks, (d) => d.key);
    tpaths.join(
      (enter) =>
        enter
          .append("path")
          .attr("class", "track")
          .attr("transform", `translate(${cx},${cy})`)
          .attr("fill", "none")
          .attr("stroke", (d) => d.color)
          .attr("stroke-width", (d) =>
            d.key === "outer"
              ? rings.outer.r1 - rings.outer.r0
              : rings.inner.r1 - rings.inner.r0
          )
          .attr("d", (d) =>
            d.arc({ startAngle, endAngle: startAngle + scale(100) })
          ),
      (update) =>
        update
          .attr("transform", `translate(${cx},${cy})`)
          .attr("stroke-width", (d) =>
            d.key === "outer"
              ? rings.outer.r1 - rings.outer.r0
              : rings.inner.r1 - rings.inner.r0
          )
          .attr("d", (d) =>
            d.arc({ startAngle, endAngle: startAngle + scale(100) })
          ),
      (exit) => exit.remove()
    );

    // ACTIVE ARCS
    const arcsData = [
      {
        key: "basic",
        value: basicVal,
        arc: arcOuter,
        stroke: colors.purple,
        fill: "url(#gradOuter)",
      },
      {
        key: "advanced",
        value: advVal,
        arc: arcInner,
        stroke: colors.pink,
        fill: "url(#gradInner)",
      },
    ];

    const arcsG = g.select("g.arcs");
    const arcs = arcsG.selectAll("path.arc").data(arcsData, (d) => d.key);

    const handleTooltip = (event, d) => {
      const [mx, my] = d3.pointer(event, svg.node());
      setTooltip({
        show: true,
        x: mx + 12,
        y: my + 12,
        html: `<strong>${
          d.key === "basic" ? "Basic shortfall" : "Advanced shortfall"
        }</strong><br/>${d.value}%`,
      });
    };

    arcs.join(
      (enter) =>
        enter
          .append("path")
          .attr("class", "arc")
          .attr("transform", `translate(${cx},${cy})`)
          .attr("fill", (d) => d.fill)
          .attr("stroke", (d) => d.stroke)
          .attr("stroke-width", 1.5)
          .attr("d", (d) => d.arc({ startAngle, endAngle: startAngle })) // start at 0 length
          .on("mousemove", handleTooltip)
          .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })))
          .call((enter) =>
            enter
              .transition()
              .duration(1100)
              .ease(d3.easeCubicOut)
              .attrTween("d", function (d) {
                const i = d3.interpolate(0, d.value);
                return (t) =>
                  d.arc({ startAngle, endAngle: startAngle + scale(i(t)) });
              })
          ),
      (update) =>
        update
          .attr("transform", `translate(${cx},${cy})`)
          .on("mousemove", handleTooltip)
          .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })))
          .transition()
          .duration(700)
          .ease(d3.easeCubicInOut)
          .attr("d", (d) =>
            d.arc({ startAngle, endAngle: startAngle + scale(d.value) })
          ),
      (exit) => exit.remove()
    );

    // TITLE
    svg
      .select("text.chart-title")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("fill", colors.ink)
      .style("font-weight", 700)
      .style("font-size", 18)
      .text(title);

    // CENTER LABELS
    const center = g
      .select("g.center")
      .attr("transform", `translate(${cx},${cy})`);
    const centerTop = center.selectAll("text.center-title").data([0]);
    centerTop
      .join("text")
      .attr("class", "center-title")
      .attr("text-anchor", "middle")
      .attr("y", -8)
      .style("fill", colors.muted)
      .style("font-weight", 600)
      .text("Shortfall");

    const centerNum = center
      .selectAll("text.center-num")
      .data([`${basicVal}% / ${advVal}%`]);
    centerNum
      .join("text")
      .attr("class", "center-num")
      .attr("text-anchor", "middle")
      .attr("y", 18)
      .style("fill", colors.ink)
      .style("font-weight", 800)
      .style("font-size", 22)
      .text((d) => d);

    // LEGEND
    const legend = g.select("g.legend");
    const items = [
      { label: `Basic: ${basicVal}%`, color: colors.purple },
      { label: `Advanced: ${advVal}%`, color: colors.pink },
    ];
    const li = legend.selectAll("g.item").data(items);
    li.join(
      (enter) => {
        const e = enter.append("g").attr("class", "item");
        e.append("rect");
        e.append("text");
        return e;
      },
      (update) => update,
      (exit) => exit.remove()
    )
      .attr(
        "transform",
        (_d, i) => `translate(${cx - 120 + i * 140}, ${innerH - 10})`
      )
      .each(function (d) {
        const node = d3.select(this);
        node
          .select("rect")
          .attr("width", 14)
          .attr("height", 14)
          .attr("rx", 3)
          .attr("fill", d.color);
        node
          .select("text")
          .attr("x", 20)
          .attr("y", 11)
          .style("fill", colors.ink)
          .style("font-weight", 600)
          .text(d.label);
      });
  }, [
    basicVal,
    advVal,
    width,
    height,
    margin,
    cx,
    cy,
    innerW,
    innerH,
    rings,
    title,
    colors,
    arcOuter,
    arcInner,
    startAngle,
    scale,
  ]);

  return (
    <div style={{ position: "relative", maxWidth: width }}>
      <svg ref={svgRef} width={width} height={height}>
        <rect className="bg" />
        <defs>
          {/* Outer ring gradient (purple) */}
          <linearGradient id="gradOuter" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d5c9ff" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
          {/* Inner ring gradient (pink) */}
          <linearGradient id="gradInner" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffb3e7" />
            <stop offset="100%" stopColor="#FF6AD5" />
          </linearGradient>
        </defs>
        <text className="chart-title" />
        <g
          className="inner"
          transform={`translate(${margin.left},${margin.top})`}
        >
          <g className="tracks" />
          <g className="arcs" />
          <g className="center" />
          <g className="legend" />
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

  // Clean + clamp values to [0, 100]; we render within 0–50 domain.
  const rows = useMemo(
    () => data.map((d, i) => ({ label: d.label, value: Math.max(0, Math.min(100, +d.value || 0)), i })),
    [data]
  );

  const x = useMemo(() => d3.scaleLinear().domain([0, 50]).range([0, innerW]).nice(), [innerW]);
  const y = useMemo(
    () => d3.scalePoint().domain(rows.map((d) => d.label)).range([0, innerH]).padding(0.8),
    [rows, innerH]
  );

  const colors = useMemo(
    () => ({
      bg: "#0b0b12",
      ink: "#eae7ff",
      muted: "#9aa0b3",
      grid: "#2a2e3a",
      purple: "#A78BFA",
      pink: "#FF6AD5",
    }),
    []
  );

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg
      .attr("role", "img")
      .attr("aria-label", title)
      .attr("viewBox", `0 0 ${width} ${height}`);

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
          update
            .attr("x1", (d) => x(d))
            .attr("x2", (d) => x(d))
            .attr("y2", innerH)
            .attr("stroke", colors.grid),
        (exit) => exit.remove()
      );

    // Gradients per row (fade purple to pink toward target)
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
            .attr("x2", (d) => x(Math.min(d.value, 50)))
            .attr("stroke", (d) => `url(#rowGrad-${d.i})`)
            .attr("stroke-width", 8)
            .attr("stroke-linecap", "round")
            .transition()
            .duration(900)
            .ease(d3.easeCubicOut)
            .attr("x2", x(50)),
        (update) =>
          update
            .transition()
            .duration(650)
            .ease(d3.easeCubicInOut)
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
            .style("filter", "drop-shadow(0 2px 6px rgba(0,0,0,.35))")
            .on("mousemove", function (event, d) {
              const [mx, my] = d3.pointer(event, svg.node());
              const gap = 50 - Math.min(d.value, 50);
              setTooltip({
                show: true,
                x: mx + 12,
                y: my + 12,
                html: `<strong>${d.label}</strong><br/>Current: ${d.value}%<br/>Gap to parity: ${d3.format(".0f")(
                  gap
                )}pp`,
              });
            })
            .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })))
            .attr("opacity", 0)
            .transition()
            .delay(200)
            .duration(600)
            .attr("opacity", 1),
        (update) =>
          update
            .on("mousemove", function (event, d) {
              const [mx, my] = d3.pointer(event, svg.node());
              const gap = 50 - Math.min(d.value, 50);
              setTooltip({
                show: true,
                x: mx + 12,
                y: my + 12,
                html: `<strong>${d.label}</strong><br/>Current: ${d.value}%<br/>Gap to parity: ${d3.format(".0f")(
                  gap
                )}pp`,
              });
            })
            .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })))
            .transition()
            .duration(600)
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
        (update) =>
          update
            .transition()
            .duration(400)
            .attr("y", (d) => y(d.label)),
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
    <div style={{ position: "relative", maxWidth: width }}>
      <svg ref={svgRef} width={width} height={height}>
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
  height = 320,
  margin = { top: 32, right: 24, bottom: 36, left: 24 },
  title = "Student-driven risk snapshot",
  subtitle = "Schools & youth cyber context",
}) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, html: "" });

  
  const colors = useMemo(
    () => ({
      bg: "#0b0b12",
      ink: "#eae7ff",
      muted: "#9aa0b3",
      grid: "#2a2e3a",
      blue: "#5AA9FF",
      purple: "#A78BFA",
      pink: "#FF6AD5",
      track: "#2a2e3a",
    }),
    []
  );

  // Layout
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const cols = items.length;
  const cellW = innerW / Math.max(1, cols);
  const r = Math.min(cellW, innerH) / 2 - 12; // radius minus padding
  const thickness = Math.max(10, Math.min(28, r * 0.28));

  // Data clamp
  const data = useMemo(
    () => items.map((d, i) => ({ ...d, value: Math.max(0, Math.min(100, +d.value || 0)), i })),
    [items]
  );

  // D3 helpers (memoized)
  const arc = useMemo(() => d3.arc().cornerRadius(10), []);
  const startAngle = -Math.PI / 2;
  const scale = useMemo(() => d3.scaleLinear().domain([0, 100]).range([0, 2 * Math.PI]), []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.attr("role", "img").attr("aria-label", title).attr("viewBox", `0 0 ${width} ${height}`);
    svg.select("rect.bg").attr("width", width).attr("height", height).attr("fill", colors.bg);

    const g = svg.select("g.inner").attr("transform", `translate(${margin.left},${margin.top})`);

    // Title & subtitle
    svg
      .select("text.chart-title")
      .attr("x", width / 2)
      .attr("y", 22)
      .attr("text-anchor", "middle")
      .style("fill", colors.ink)
      .style("font-weight", 700)
      .style("font-size", 18)
      .text(title);

    svg
      .select("text.chart-subtitle")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .style("fill", colors.muted)
      .style("font-weight", 600)
      .style("font-size", 12)
      .text(subtitle);

    // Gradients (blue → purple → pink) per badge
    const defs = svg.select("defs.gradients");
    defs
      .selectAll("linearGradient.badgeGrad")
      .data(data, (d) => d.i)
      .join(
        (enter) => {
          const lg = enter
            .append("linearGradient")
            .attr("class", "badgeGrad")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("id", (d) => `badgeGrad-${d.i}`);
          lg.append("stop").attr("offset", 0).attr("stop-color", colors.blue).attr("stop-opacity", 1);
          lg.append("stop").attr("offset", 0.5).attr("stop-color", colors.purple).attr("stop-opacity", 1);
          lg.append("stop").attr("offset", 1).attr("stop-color", colors.pink).attr("stop-opacity", 1);
          return lg;
        },
        (update) => update,
        (exit) => exit.remove()
      )
      .attr("x1", (d) => margin.left + cellW * d.i + cellW / 2 - r)
      .attr("y1", (d) => margin.top + innerH / 2)
      .attr("x2", (d) => margin.left + cellW * d.i + cellW / 2 + r)
      .attr("y2", (d) => margin.top + innerH / 2);

    // Groups per badge
    const badges = g.select("g.badges").selectAll("g.badge").data(data, (d) => d.i);
    const enter = badges.enter().append("g").attr("class", "badge");
    badges.merge(enter).attr("transform", (d) => `translate(${cellW * d.i + cellW / 2}, ${innerH / 2})`);

    // Track (full circle)
    const track = badges.merge(enter).selectAll("path.track").data((d) => [d]);
    track
      .join("path")
      .attr("class", "track")
      .attr("fill", "none")
      .attr("stroke", colors.track)
      .attr("stroke-width", thickness)
      .attr("d", arc({ innerRadius: r - thickness, outerRadius: r, startAngle, endAngle: startAngle + scale(100) }));

    // Active arc
    const arcSel = badges.merge(enter).selectAll("path.arc").data((d) => [d]);
    arcSel
      .join(
        (e) =>
          e
            .append("path")
            .attr("class", "arc")
            .attr("fill", "none")
            .attr("stroke", (d) => `url(#badgeGrad-${d.i})`)
            .attr("stroke-width", thickness)
            .attr("stroke-linecap", "round")
            .attr("d", arc({ innerRadius: r - thickness, outerRadius: r, startAngle, endAngle: startAngle }))
            .on("mousemove", function (event, d) {
              const [mx, my] = d3.pointer(event, svg.node());
              setTooltip({
                show: true,
                x: mx + 12,
                y: my + 12,
                html: `<strong>${d.label}</strong><br/>${d.value}%<br/><span style='opacity:.8'>${d.detail}</span>`,
              });
            })
            .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })))
            .call((enter) =>
              enter
                .transition()
                .duration(1100)
                .ease(d3.easeCubicOut)
                .attrTween("d", function (d) {
                  const i = d3.interpolate(0, d.value);
                  return (t) =>
                    arc({
                      innerRadius: r - thickness,
                      outerRadius: r,
                      startAngle,
                      endAngle: startAngle + scale(i(t)),
                    });
                })
            ),
        (u) =>
          u
            .on("mousemove", function (event, d) {
              const [mx, my] = d3.pointer(event, svg.node());
              setTooltip({
                show: true,
                x: mx + 12,
                y: my + 12,
                html: `<strong>${d.label}</strong><br/>${d.value}%<br/><span style='opacity:.8'>${d.detail}</span>`,
              });
            })
            .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })))
            .transition()
            .duration(700)
            .ease(d3.easeCubicInOut)
            .attr("d", (d) =>
              arc({ innerRadius: r - thickness, outerRadius: r, startAngle, endAngle: startAngle + scale(d.value) })
            ),
        (exit) => exit.remove()
      );

    // Center labels
    const valText = badges.merge(enter).selectAll("text.value").data((d) => [d]);
    valText
      .join("text")
      .attr("class", "value")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("fill", colors.ink)
      .style("font-size", 24)
      .style("font-weight", 800)
      .text((d) => `${d3.format(".0f")(d.value)}%`);

    const labText = badges.merge(enter).selectAll("text.label").data((d) => [d]);
    labText
      .join("text")
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .attr("y", r + 28)
      .style("fill", colors.ink)
      .style("font-size", 13)
      .style("font-weight", 600)
      .text((d) => d.label);

    badges.exit().remove();
  }, [
    data,
    width,
    height,
    margin,
    innerW,
    innerH,
    cellW,
    r,
    thickness,
    colors,
    title,
    subtitle,
    arc,
    startAngle,
    scale,
  ]);

  return (
    <div style={{ position: "relative", maxWidth: width }}>
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
    </div>
  );
}
// ===== PIPELINE / REACH – PackedCirclesOutcomeGauge =====
export function PackedCirclesOutcomeGauge({
  metrics = [
    { id: "cf_students", label: "Students 30k+", value: 30000, program: "CyberFirst" },
    { id: "cih_learners", label: "Learners 10k+", value: 10000, program: "Cyber Innovation Hub" },
    { id: "cf_events", label: "Events 1.5k", value: 1500, program: "CyberFirst" },
    { id: "cf_schools", label: "Schools 270", value: 270, program: "CyberFirst" },
  ],
  placementPct = 87,
  width = 920,
  height = 420,
  margin = { top: 28, right: 28, bottom: 28, left: 28 },
  title = "Pipeline impact: reach & outcome",
  subtitle = "Bubbles show reach; ring shows bursary placement",
}) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, html: "" });

  const C = useMemo(
    () => ({
      bg: "#0b0b12",
      ink: "#eae7ff",
      muted: "#9aa0b3",
      grid: "#2a2e3a",
      blue: "#5AA9FF",
      purple: "#A78BFA",
      pink: "#FF6AD5",
    }),
    []
  );

  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  // Layout split: left (bubbles) / right (gauge)
  const gaugeColW = Math.max(240, innerW * 0.32);
  const bubblesW = innerW - gaugeColW - 16; // 16px gutter
  const bubblesH = innerH;

  // Deterministic packed bubbles (no force => no jitter)
  const packLeaves = useMemo(() => {
    const children = metrics.map((m, i) => ({
      id: m.id ?? `${m.label}-${i}`,
      label: m.label,
      value: Math.max(0, +m.value || 0),
      program: m.program ?? "",
    }));
    const root = d3.hierarchy({ children }).sum((d) => d.value);
    const pack = d3.pack().size([bubblesW, bubblesH]).padding(10);
    return pack(root)
      .leaves()
      .map((leaf) => ({
        id: leaf.data.id,
        label: leaf.data.label,
        value: leaf.data.value,
        program: leaf.data.program,
        x: leaf.x,
        y: leaf.y,
        r: leaf.r,
      }));
  }, [metrics, bubblesW, bubblesH]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.attr("role", "img").attr("aria-label", title).attr("viewBox", `0 0 ${width} ${height}`);
    svg.select("rect.bg").attr("width", width).attr("height", height).attr("fill", C.bg);

    svg
      .select("text.chart-title")
      .attr("x", width / 2)
      .attr("y", 22)
      .attr("text-anchor", "middle")
      .style("fill", C.ink)
      .style("font-weight", 700)
      .style("font-size", 18)
      .text(title);

    svg
      .select("text.chart-subtitle")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .style("fill", C.muted)
      .style("font-weight", 600)
      .style("font-size", 12)
      .text(subtitle);

    const g = svg.select("g.inner").attr("transform", `translate(${margin.left},${margin.top})`);
    const gb = g.select("g.bubbles");
    const gg = g.select("g.gauge");

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
      .attr("y", 0)
      .attr("width", bubblesW)
      .attr("height", bubblesH)
      .attr("fill", "none")
      .attr("stroke", C.grid)
      .attr("stroke-dasharray", "3 6")
      .attr("opacity", 0.3);

    const cells = gb.selectAll("g.node").data(packLeaves, (d) => d.id);
    const enter = cells.enter().append("g").attr("class", "node");
    enter.append("circle").attr("class", "bubble");
    enter.append("text").attr("class", "value");
    enter.append("text").attr("class", "label");

    cells.merge(enter).attr("transform", (d) => `translate(${d.x},${d.y})`);

    // bubbles
    cells
      .merge(enter)
      .select("circle.bubble")
      .attr("r", 0)
      .attr("fill", (d) => color(d.program))
      .attr("opacity", 0.9)
      .on("mousemove", function (event, d) {
        const [mx, my] = d3.pointer(event, svg.node());
        setTooltip({
          show: true,
          x: mx + 12,
          y: my + 12,
          html: `<strong>${d.label}</strong><br/>${d3.format(",")(d.value)}<br/><span style='opacity:.85'>Program: ${d.program || ""}</span>`,
        });
      })
      .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })))
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr("r", (d) => d.r);

    // value text (inside)
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
      .attr("dy", (d) => d.r + 14)
      .style("fill", "#b7d7ff")
      .style("font-weight", 600)
      .style("font-size", 12)
      .text((d) => d.label);

    cells.exit().remove();

    // ---------- GAUGE ----------
    const gw = gaugeColW;
    const gh = bubblesH;
    const gx = bubblesW + 16;
    const gy = 0;

    const gWrap = gg.attr("transform", `translate(${gx},${gy})`);
    const centerXg = gw / 2;
    const centerYg = gh / 2 + 6;
    const radius = Math.min(gw, gh) * 0.35;
    const thickness = Math.max(18, radius * 0.22);

    const arc = d3.arc().innerRadius(radius - thickness).outerRadius(radius).cornerRadius(thickness / 2);
    const start = -Math.PI / 2;
    const toAngle = d3.scaleLinear().domain([0, 100]).range([0, 2 * Math.PI]);
    const pct = Math.max(0, Math.min(100, +placementPct || 0));

    // track
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

    // active arc
    gWrap
      .selectAll("path.active")
      .data([pct])
      .join(
        (enterPath) =>
          enterPath
            .append("path")
            .attr("class", "active")
            .attr("transform", `translate(${centerXg},${centerYg})`)
            .attr("fill", "url(#gaugeGrad)")
            .attr("stroke", C.pink)
            .attr("stroke-width", 1.5)
            .on("mousemove", (event) => {
              const [mx, my] = d3.pointer(event, svg.node());
              setTooltip({ show: true, x: mx + 12, y: my + 12, html: `<strong>Bursary placement</strong><br/>${pct}%` });
            })
            .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })))
            .transition()
            .duration(900)
            .ease(d3.easeCubicOut)
            .attrTween("d", function () {
              const i = d3.interpolate(0, pct);
              return (t) => arc({ startAngle: start, endAngle: start + toAngle(i(t)) });
            }),
        (update) =>
          update
            .attr("transform", `translate(${centerXg},${centerYg})`)
            .on("mousemove", (event) => {
              const [mx, my] = d3.pointer(event, svg.node());
              setTooltip({ show: true, x: mx + 12, y: my + 12, html: `<strong>Bursary placement</strong><br/>${pct}%` });
            })
            .on("mouseleave", () => setTooltip((t) => ({ ...t, show: false })))
            .transition()
            .duration(700)
            .ease(d3.easeCubicInOut)
            .attr("d", arc({ startAngle: start, endAngle: start + toAngle(pct) }))
      );

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
      .style("fill", "#b7d7ff")
      .style("font-weight", 600)
      .text((d) => d);
  }, [
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
  ]);

  return (
    <div style={{ position: "relative", maxWidth: width }}>
      <svg ref={svgRef} width={width} height={height}>
        <rect className="bg" />
        <defs>
          {/* Gauge gradient (pink) */}
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB3E7" />
            <stop offset="100%" stopColor="#FF6AD5" />
          </linearGradient>
        </defs>
        <text className="chart-title" />
        <text className="chart-subtitle" />
        <g className="inner" transform={`translate(${margin.left},${margin.top})`}>
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
    </div>
  );
}
