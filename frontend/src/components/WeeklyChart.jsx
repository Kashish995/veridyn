import { Bar } from "react-chartjs-2";

const WeeklyChart = ({ weekly }) => {
  // 🛡️ SAFETY: handle undefined or empty data
  if (!weekly || Object.keys(weekly).length === 0) {
    return <p>No weekly data yet.</p>;
  }

  const labels = Object.keys(weekly);
  const values = Object.values(weekly);

  const data = {
    labels,
    datasets: [
      {
        label: "Chapters studied",
        data: values,
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  return <Bar data={data} />;
};

export default WeeklyChart;
