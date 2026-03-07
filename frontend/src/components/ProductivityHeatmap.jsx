import React, { useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

const ProductivityHeatmap = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
  const fetchCalendar = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      "http://localhost:5000/api/stats/calendar?year=2026",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const result = await res.json();

    // 🔧 HERE we generate full year
    const calendarData = result.calendar || [];

    const fullYear = [];
    const start = new Date("2026-01-01");

    for (let i = 0; i < 365; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      const dateStr = d.toISOString().slice(0, 10);

      const existing = calendarData.find(
        (item) => item.date === dateStr
      );

      fullYear.push(existing || { date: dateStr });
    }

    setData(fullYear);
  };

  fetchCalendar();
}, []);

  const getClass = (value) => {
  if (!value || value.score === undefined) {
    return "color-empty";
  }

  if (value.score < 40) return "color-github-1";
  if (value.score < 60) return "color-github-2";
  if (value.score < 80) return "color-github-3";
  return "color-github-4";
};

  return (
    <div>
      <CalendarHeatmap
        startDate={new Date("2026-01-01")}
        endDate={new Date("2026-12-31")}
        values={data}
        classForValue={getClass}
        tooltipDataAttrs={(value) => {
          if (!value || !value.date) return null;
          return {
            "data-tip": `${value.date} — ${value.score}%`
          };
        }}
      />
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="legend-box color-empty"></div>
        <div className="legend-box color-github-1"></div>
        <div className="legend-box color-github-2"></div>
        <div className="legend-box color-github-3"></div>
        <div className="legend-box color-github-4"></div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ProductivityHeatmap;