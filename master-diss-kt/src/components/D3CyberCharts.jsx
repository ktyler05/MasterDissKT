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

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

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
  }, [data, width, height, margin, title, desc, setTooltip]);

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
