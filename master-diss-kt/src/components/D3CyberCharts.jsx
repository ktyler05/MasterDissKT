import React, { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";

const useResizeObserver = (ref) => {
  const [bounds, setBounds] = React.useState();
  useEffect(() => {
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

const ChartFrame = ({ title, subtitle, children, height = 420 }) => (
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
        <p style={{ margin: "6px 0 0", color: "#5a5f7a", fontSize: 13 }}>{subtitle}</p>
      )}
    </header>
    <div style={{ position: "relative", height }}>{children}</div>
  </section>
);


export const DiversityGroupedBars = () => {
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const bounds = useResizeObserver(wrapperRef);

  const data = useMemo(
    () => [
      { group: "Female", "All UK workforce": 48, Digital: 30, "Senior cyber": 12, "Cyber (all)": 17 },
      { group: "Ethnic minorities", "All UK workforce": 13, Digital: 18, "Senior cyber": 9, "Cyber (all)": 15 },
      { group: "Disabled people", "All UK workforce": 17, Digital: 13, "Senior cyber": 4, "Cyber (all)": 6 },
      { group: "Neurodivergent", "All UK workforce": 0, Digital: 0, "Senior cyber": 8, "Cyber (all)": 13 },
    ],
    []
  );

  useEffect(() => {
    if (!bounds) return;
    const { width, height } = bounds;
    const margin = { top: 28, right: 16, bottom: 68, left: 54 }; 
    const innerW = Math.max(240, width - margin.left - margin.right);
    const innerH = Math.max(220, height - margin.top - margin.bottom);

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "Diversity across workforce segments");

    svg.selectAll("*").remove();
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const seriesKeys = ["All UK workforce", "Digital", "Senior cyber", "Cyber (all)"];

    const x0 = d3.scaleBand().domain(data.map((d) => d.group)).rangeRound([0, innerW]).paddingInner(0.28);
    const x1 = d3.scaleBand().domain(seriesKeys).rangeRound([0, x0.bandwidth()]).padding(0.18);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d3.max(seriesKeys, (k) => d[k])) || 50])
      .nice()
      .range([innerH, 0]);

    const color = d3
      .scaleOrdinal()
      .domain(seriesKeys)
      .range(["#6f7ce8", "#9a7be0", "#b18cf0", "#7b68b6"]);

    const xAxis = d3.axisBottom(x0).tickPadding(10); // padding added
    const yAxis = d3.axisLeft(y).ticks(6).tickFormat((t) => t + "%").tickPadding(8);

    g.append("g").attr("transform", `translate(0,${innerH})`).attr("class", "x-axis").call(xAxis);
    g.append("g").attr("class", "y-axis").call(yAxis);

   
    const groups = g
      .selectAll("g.group")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "group")
      .attr("transform", (d) => `translate(${x0(d.group)},0)`);

    groups
      .selectAll("rect")
      .data((d) => seriesKeys.map((key) => ({ key, value: d[key], group: d.group })))
      .enter()
      .append("rect")
      .attr("x", (d) => x1(d.key))
      .attr("y", (d) => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", (d) => innerH - y(d.value))
      .attr("rx", 6)
      .attr("fill", (d) => color(d.key))
      .on("mousemove", (event, d) => {
        d3.select(tooltipRef.current)
          .style("left", `${event.offsetX + 10}px`)
          .style("top", `${event.offsetY - 10}px`)
          .style("opacity", 1)
          .html(`
            <div class="tt-title">${d.group}</div>
            <div class="tt-sub">${d.key}</div>
            <div class="tt-value">${d.value}%</div>
          `);
      })
      .on("mouseleave", () => d3.select(tooltipRef.current).style("opacity", 0));

   
    const legend = g.append("g").attr("transform", `translate(0, -18)`);
    const leg = legend
      .selectAll("g.leg")
      .data(seriesKeys)
      .enter()
      .append("g")
      .attr("class", "leg")
      .attr("transform", (d, i) => `translate(${i * Math.min(200, innerW / seriesKeys.length + 30)}, -4)`);

    leg.append("rect").attr("width", 12).attr("height", 12).attr("rx", 3).attr("fill", (d) => color(d));
    leg.append("text").attr("x", 16).attr("y", 10).style("font-size", 12).text((d) => d);
  }, [bounds, data]);

  return (
    <ChartFrame title="Representation across workforce segments" subtitle="Share of each group represented (percentage)">
      <div ref={wrapperRef} style={{ position: "relative", width: "100%", height: "100%" }}>
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
        <div ref={tooltipRef} className="d3-tooltip" />
      </div>
    </ChartFrame>
  );
};


export const ConfidenceGroupedBars = () => {
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const bounds = useResizeObserver(wrapperRef);

  const data = useMemo(
    () => [
      { task: "Dealing with breaches", Businesses: 33, "Large business": 2, Charities: 34, "Public sector": 4 },
      { task: "Configured firewalls", Businesses: 28, "Large business": 13, Charities: 29, "Public sector": 8 },
      { task: "Detect/remove malware", Businesses: 23, "Large business": 2, Charities: 25, "Public sector": 5 },
      { task: "Transferring personal data", Businesses: 29, "Large business": 13, Charities: 27, "Public sector": 15 },
      { task: "Restricting software", Businesses: 22, "Large business": 4, Charities: 21, "Public sector": 4 },
      { task: "Choosing secure settings", Businesses: 15, "Large business": 4, Charities: 16, "Public sector": 3 },
      { task: "Automatic updates", Businesses: 13, "Large business": 4, Charities: 16, "Public sector": 3 },
      { task: "Admin rights control", Businesses: 9, "Large business": 3, Charities: 10, "Public sector": 3 },
      { task: "Creating backups", Businesses: 6, "Large business": 2, Charities: 8, "Public sector": 4 },
      { task: "Accounts & auth", Businesses: 14, "Large business": 8, Charities: 17, "Public sector": 4 },
    ],
    []
  );

  useEffect(() => {
    if (!bounds) return;
    const { width, height } = bounds;
    const margin = { top: 28, right: 20, bottom: 38, left: 210 }; 
    const innerW = Math.max(300, width - margin.left - margin.right);
    const innerH = Math.max(260, height - margin.top - margin.bottom);

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "% not confident in basic tasks by org type");

    svg.selectAll("*").remove();
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const keys = ["Businesses", "Large business", "Charities", "Public sector"];

    const y0 = d3.scaleBand().domain(data.map((d) => d.task)).range([0, innerH]).paddingInner(0.22);
    const y1 = d3.scaleBand().domain(keys).range([0, y0.bandwidth()]).padding(0.16);
    const x = d3.scaleLinear().domain([0, d3.max(data, (d) => d3.max(keys, (k) => d[k])) || 40]).nice().range([0, innerW]);

    const color = d3.scaleOrdinal().domain(keys).range(["#6f7ce8", "#9a7be0", "#b18cf0", "#7b68b6"]);

    const xAxis = d3.axisBottom(x).ticks(6).tickFormat((t) => t + "%").tickPadding(8);
    const yAxis = d3.axisLeft(y0).tickSize(0).tickPadding(10); // padding added

    g.append("g").attr("transform", `translate(0,${innerH})`).call(xAxis);
    g.append("g").call(yAxis);

    const rows = g
      .selectAll("g.row")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "row")
      .attr("transform", (d) => `translate(0,${y0(d.task)})`);

    rows
      .selectAll("rect")
      .data((d) => keys.map((k) => ({ key: k, value: d[k], task: d.task })))
      .enter()
      .append("rect")
      .attr("y", (d) => y1(d.key))
      .attr("x", 0)
      .attr("height", y1.bandwidth())
      .attr("width", (d) => x(d.value))
      .attr("rx", 6)
      .attr("fill", (d) => color(d.key))
      .on("mousemove", (event, d) => {
        d3.select(tooltipRef.current)
          .style("left", `${event.offsetX + margin.left + 10}px`)
          .style("top", `${event.offsetY + margin.top - 10}px`)
          .style("opacity", 1)
          .html(`
            <div class="tt-title">${d.task}</div>
            <div class="tt-sub">${d.key}</div>
            <div class="tt-value">${d.value}% not confident</div>
          `);
      })
      .on("mouseleave", () => d3.select(tooltipRef.current).style("opacity", 0));

    const legend = g.append("g").attr("transform", `translate(0, -18)`);
    const leg = legend
      .selectAll("g.leg")
      .data(keys)
      .enter()
      .append("g")
      .attr("class", "leg")
      .attr("transform", (_d, i) => `translate(${i * Math.min(200, innerW / keys.length + 30)}, -4)`);

    leg.append("rect").attr("width", 12).attr("height", 12).attr("rx", 3).attr("fill", (d) => color(d));
    leg.append("text").attr("x", 16).attr("y", 10).style("font-size", 12).text((d) => d);
  }, [bounds, data]);

  return (
    <ChartFrame title="% not confident in basic cyber security tasks" subtitle="By organisation type; lower is better" height={560}>
      <div ref={wrapperRef} style={{ position: "relative", width: "100%", height: "100%" }}>
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
        <div ref={tooltipRef} className="d3-tooltip" />
      </div>
    </ChartFrame>
  );
};


export const GraduatesStackedBars100 = () => {
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const bounds = useResizeObserver(wrapperRef);

  const raw = useMemo(
    () => [
      { type: "Cyber UG", Female: 14, Male: 86 },
      { type: "Cyber PG", Female: 24, Male: 76 },
      { type: "CS UG", Female: 19, Male: 81 },
      { type: "CS PG", Female: 33, Male: 67 },
    ],
    []
  );

  useEffect(() => {
    if (!bounds) return;
    const { width, height } = bounds;
    const margin = { top: 28, right: 20, bottom: 62, left: 56 }; 
    const innerW = Math.max(260, width - margin.left - margin.right);
    const innerH = Math.max(220, height - margin.top - margin.bottom);

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "Gender identity of cyber and CS graduates (100% stacked)");
    svg.selectAll("*").remove();
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const keys = ["Female", "Male"];
    const x = d3.scaleBand().domain(raw.map((d) => d.type)).range([0, innerW]).padding(0.3);
    const y = d3.scaleLinear().domain([0, 100]).range([innerH, 0]);
    const color = d3.scaleOrdinal().domain(keys).range(["#6f7ce8", "#9a7be0"]);

    const stackGen = d3.stack().keys(keys).order(d3.stackOrderNone).offset(d3.stackOffsetExpand);
    const stacked = stackGen(raw.map((row) => ({ ...row })));
    stacked.forEach((layer) => {
      layer.forEach((segment) => {
        segment[0] *= 100;
        segment[1] *= 100;
      });
    });
    const series = stacked;

    
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickPadding(10));
    g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat((t) => t + "%").tickPadding(10));

   
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
      .attr("x", (seg) => x(seg.data.type))
      .attr("y", (seg) => y(seg[1]))
      .attr("height", (seg) => y(seg[0]) - y(seg[1]))
      .attr("width", x.bandwidth())
      .attr("rx", 6)
      .on("mousemove", (event, seg) => {
        const key = d3.select(event.target.parentNode).datum().key;
        const value = Math.round(seg.data[key]);
        d3.select(tooltipRef.current)
          .style("left", `${event.offsetX + margin.left + 10}px`)
          .style("top", `${event.offsetY + margin.top - 10}px`)
          .style("opacity", 1)
          .html(`
            <div class="tt-title">${seg.data.type}</div>
            <div class="tt-sub">${key}</div>
            <div class="tt-value">${value}%</div>
          `);
      })
      .on("mouseleave", () => d3.select(tooltipRef.current).style("opacity", 0));

  
    const legend = g.append("g").attr("transform", `translate(0, -18)`);
    const leg = legend
      .selectAll("g.leg")
      .data(keys)
      .enter()
      .append("g")
      .attr("class", "leg")
      .attr("transform", (_d, i) => `translate(${i * 120}, -4)`);

    leg.append("rect").attr("width", 12).attr("height", 12).attr("rx", 3).attr("fill", (d) => color(d));
    leg.append("text").attr("x", 16).attr("y", 10).style("font-size", 12).text((d) => d);
  }, [bounds, raw]);

  return (
    <ChartFrame title="Gender identity of cyber & CS graduates (2021/22)" subtitle="Each bar sums to 100%" height={380}>
      <div ref={wrapperRef} style={{ position: "relative", width: "100%", height: "100%" }}>
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
        <div ref={tooltipRef} className="d3-tooltip" />
      </div>
    </ChartFrame>
  );
};


export default function D3CyberChartsDemo() {
  return (
    <div>
      <DiversityGroupedBars />
      <ConfidenceGroupedBars />
      <GraduatesStackedBars100 />
    </div>
  );
}
