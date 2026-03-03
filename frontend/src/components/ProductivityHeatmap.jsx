import { useMemo } from "react";
import "../styles/heatmap.css";
import useCalendarData from "../hooks/useCalendarData";
import { buildYearMatrix, getColorByScore } from "../utils/heatmap.utils";
import Skeleton from "../ui/Skeleton";

const ProductivityHeatmap = ({ year = new Date().getFullYear() }) => {
  const { data, loading, error } = useCalendarData(year);

  const matrix = useMemo(() => {
    return buildYearMatrix(year, data);
  }, [year, data]);

  if (loading) return <Skeleton height="200px" />;
  if (error) return <p className="center-text">{error}</p>;

  return (
    <div className="heatmap-wrapper">
      <div className="heatmap-grid">
        {matrix.map((week, weekIndex) =>
          week.map((day, dayIndex) => (
            <div
              key={`${weekIndex}-${dayIndex}`}
              className="heatmap-cell"
              style={{
                backgroundColor: day
                  ? getColorByScore(day.score)
                  : "#1e293b",
              }}
              title={
                day
                  ? `${day.date} — Score: ${day.score}`
                  : "No data"
              }
            />
          ))
        )}
      </div>

      <div className="heatmap-legend">
        <span>Low</span>
        <div className="legend-box" style={{ background: "#163d2a" }} />
        <div className="legend-box" style={{ background: "#2ea043" }} />
        <div className="legend-box" style={{ background: "#56f97a" }} />
        <span>High</span>
      </div>
    </div>
  );
};

export default ProductivityHeatmap;