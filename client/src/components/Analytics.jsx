import { useEffect, useState } from "react";
import axios from "axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function Analytics() {

  const [data, setData] = useState(null);

  useEffect(() => {

    const loadData = async () => {

      try {

        const res = await axios.get(
          "http://localhost:5000/api/dashboard",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        setData(res.data);

      } catch (err) {
        alert("Analytics load failed ❌");
      }
    };

    loadData();

  }, []);

  if (!data) return <p>Loading Charts...</p>;

  // Bar Chart (Subjects)
  const barData = {
    labels: ["Physics", "Chemistry", "Biology", "General"],

    datasets: [
      {
        label: "Study Hours",
        data: [
          data.subjects.Physics,
          data.subjects.Chemistry,
          data.subjects.Biology,
          data.subjects.General
        ],
        backgroundColor: "rgba(79,172,254,0.7)"
      }
    ]
  };

  // Line Chart (Weekly Progress - Demo)
  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],

    datasets: [
      {
        label: "Weekly Hours",
        data: [2, 3, 1, 4, 2, 3, 4],
        borderColor: "#4facfe",
        fill: false
      }
    ]
  };

  return (
    <div className="analytics-box">

      <h2>📈 Performance Analytics</h2>

      <div className="chart-box">
        <Bar data={barData} />
      </div>

      <div className="chart-box">
        <Line data={lineData} />
      </div>

    </div>
  );
}

export default Analytics;
