import React, { useEffect, useState } from "react";
import "../styles/heatmap.css";

const API = "http://localhost:5000/api/stats/calendar?year=2026";

const getColor = (score) => {
  if (!score) return "#1b1b1b";
  if (score < 40) return "#7f1d1d";
  if (score < 60) return "#b91c1c";
  if (score < 80) return "#16a34a";
  return "#22c55e";
};

const ProductivityHeatmap = () => {
  const [dataMap, setDataMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      const map = {};
      data.forEach((d) => {
        map[d.date] = d.score;
      });

      setDataMap(map);
    };

    fetchData();
  }, []);

  const cells = [];
const start = new Date("2026-01-01");
const days = [];

for (let i = 0; i < 365; i++) {
  const date = new Date(start);
  date.setDate(start.getDate() + i);

  const key = date.toISOString().split("T")[0];

  days.push(
    <div
      key={key}
      className="heatmap-cell"
      style={{ backgroundColor: getColor(dataMap[key]) }}
      title={`${key}: ${dataMap[key] || 0}`}
    />
  );
}

  return (
<div className="heatmap-container">
  <h3>Productivity Calendar</h3>

  <div className="heatmap-grid">
    {cells.map((cell) => (
      <div
        key={cell.key}
        className="heatmap-cell"
        style={{ backgroundColor: getColor(cell.score) }}
        title={`${cell.key}: ${cell.score}`}
      />
    ))}
  </div>
</div>
);
};

export default ProductivityHeatmap;