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

      // FIX
      setData(result.calendar || []);
    };

    fetchCalendar();
  }, []);

  const getClass = (value) => {
    if (!value) return "color-empty";
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
    </div>
  );
};

export default ProductivityHeatmap;