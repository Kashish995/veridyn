import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function WeeklyChart({ weekly }) {
  if (!weekly) return null;

  const labels = Object.keys(weekly.days);
  const values = Object.values(weekly.days);

  const data = {
    labels,
    datasets: [
      {
        label: "Chapters studied",
        data: values,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
  };

  return <Bar data={data} options={options} />;
}
