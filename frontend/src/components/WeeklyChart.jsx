import { Bar } from "react-chartjs-2";
import "chart.js/auto";   // 🔴 THIS LINE IS REQUIRED

const WeeklyChart = ({ weekly }) => {
  // Safety check
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
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default WeeklyChart;
