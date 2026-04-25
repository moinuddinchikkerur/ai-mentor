






import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import api from "../services/api";
import "../main.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatMinutesFromSeconds = (seconds) => {
  return Math.round(toNumber(seconds) / 60);
};

const formatHourLabel = (minutes) => {
  const hours = toNumber(minutes) / 60;

  if (hours < 1) return `${toNumber(minutes)}m`;

  return `${hours.toFixed(hours >= 10 ? 0 : 1)}h`;
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#4b4458",
        boxWidth: 14,
        font: {
          family: "Inter",
          weight: "700"
        }
      }
    },
    tooltip: {
      backgroundColor: "#2f2937",
      titleColor: "#ffffff",
      bodyColor: "#ffffff",
      padding: 12,
      cornerRadius: 8
    }
  },
  scales: {
    x: {
      grid: {
        color: "rgba(234, 213, 255, 0.55)"
      },
      ticks: {
        color: "#7c7488"
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(234, 213, 255, 0.65)"
      },
      ticks: {
        color: "#7c7488"
      }
    }
  }
};

function Analytics() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardRes, analyticsRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/report/analytics")
      ]);

      setDashboard(dashboardRes.data || {});
      setData(analyticsRes.data.analytics || {});
    } catch (err) {
      console.error("Analytics load failed:", err);
      setError(err.response?.data?.message || "Analytics load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const subjectLabels = useMemo(() => {
    return Object.keys(dashboard?.subjects || {});
  }, [dashboard]);

  const subjectValues = useMemo(() => {
    return subjectLabels.map((subject) => {
      return formatMinutesFromSeconds(dashboard?.subjects?.[subject]);
    });
  }, [dashboard, subjectLabels]);

  const dailyStudy = data?.dailyStudy || [];
  const dailyFocus = data?.dailyFocus || [];
  const totalStudyMinutes = dailyStudy.reduce((sum, item) => sum + toNumber(item.minutes), 0);
  const averageFocus = dailyFocus.length
    ? Math.round(dailyFocus.reduce((sum, item) => sum + toNumber(item.focus), 0) / dailyFocus.length)
    : 0;

  const subjectChartData = {
    labels: subjectLabels.length > 0 ? subjectLabels : ["No Data"],
    datasets: [
      {
        label: "Study Minutes",
        data: subjectValues.length > 0 ? subjectValues : [0],
        backgroundColor: "rgba(192, 38, 211, 0.72)",
        borderColor: "#a21caf",
        borderWidth: 1,
        borderRadius: 8
      }
    ]
  };

  const studyChartData = {
    labels: dailyStudy.map((item) => item.day),
    datasets: [
      {
        label: "Daily Study Minutes",
        data: dailyStudy.map((item) => item.minutes),
        borderColor: "#c026d3",
        backgroundColor: "rgba(192, 38, 211, 0.14)",
        pointBackgroundColor: "#a855f7",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
        borderWidth: 3,
        tension: 0.35,
        fill: true
      }
    ]
  };

  const focusChartData = {
    labels: dailyFocus.map((item) => item.day),
    datasets: [
      {
        label: "Average Focus %",
        data: dailyFocus.map((item) => item.focus),
        borderColor: "#7c3aed",
        backgroundColor: "rgba(124, 58, 237, 0.13)",
        pointBackgroundColor: "#7c3aed",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
        borderWidth: 3,
        tension: 0.35,
        fill: true
      }
    ]
  };

  if (loading && !data && !dashboard) {
    return (
      <div className="an-page">
        <div className="an-state-card">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="an-page">
      <div className="an-shell">
        <header className="an-header">
          <div>
            <p className="an-eyebrow">Performance Analytics</p>
            <h1>Study Dashboard</h1>
            <p>Track your study time, focus quality, and MCQ practice patterns.</p>
          </div>

          <div className="an-actions">
            <button
              className="an-secondary-btn"
              onClick={() => navigate("/dashboard")}
              type="button"
            >
              Dashboard
            </button>

            <button
              className="an-primary-btn"
              onClick={loadData}
              disabled={loading}
              type="button"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        {error && (
          <div className="an-error">
            {error}
          </div>
        )}

        <section className="an-metric-grid">
          <div className="an-metric-card">
            <span>Total Study</span>
            <strong>{formatHourLabel(totalStudyMinutes)}</strong>
            <p>Last 7 days</p>
          </div>

          <div className="an-metric-card">
            <span>Average Focus</span>
            <strong>{averageFocus}%</strong>
            <p>{dailyFocus.length} daily points</p>
          </div>

          <div className="an-metric-card">
            <span>MCQ Accuracy</span>
            <strong>{toNumber(data?.mcq?.averageAccuracy)}%</strong>
            <p>{toNumber(data?.mcq?.totalTests)} tests completed</p>
          </div>

          <div className="an-metric-card">
            <span>Best Topic</span>
            <strong>{data?.mcq?.bestTopic || "No data"}</strong>
            <p>Based on MCQ results</p>
          </div>
        </section>

        <section className="an-grid">
          <article className="an-panel">
            <div className="an-panel-head">
              <div>
                <p>Subjects</p>
                <h2>Study Time</h2>
              </div>
              <span>{subjectLabels.length} subjects</span>
            </div>

            <div className="an-chart-wrap">
              <Bar data={subjectChartData} options={chartOptions} />
            </div>
          </article>

          <article className="an-panel">
            <div className="an-panel-head">
              <div>
                <p>Daily</p>
                <h2>Study Progress</h2>
              </div>
              <span>{formatHourLabel(totalStudyMinutes)}</span>
            </div>

            <div className="an-chart-wrap">
              <Line data={studyChartData} options={chartOptions} />
            </div>
          </article>
        </section>

        <section className="an-grid">
          <article className="an-panel">
            <div className="an-panel-head">
              <div>
                <p>Attention</p>
                <h2>Focus Level</h2>
              </div>
              <span>{averageFocus}% avg</span>
            </div>

            <div className="an-chart-wrap">
              <Line data={focusChartData} options={chartOptions} />
            </div>
          </article>

          <article className="an-panel">
            <div className="an-panel-head">
              <div>
                <p>Practice</p>
                <h2>MCQ Summary</h2>
              </div>
              <span>{toNumber(data?.mcq?.totalTests)} tests</span>
            </div>

            <div className="an-practice-grid">
              <div>
                <span>Total Tests</span>
                <strong>{toNumber(data?.mcq?.totalTests)}</strong>
              </div>

              <div>
                <span>Average Accuracy</span>
                <strong>{toNumber(data?.mcq?.averageAccuracy)}%</strong>
              </div>

              <div>
                <span>Best Topic</span>
                <strong>{data?.mcq?.bestTopic || "No data yet"}</strong>
              </div>

              <div>
                <span>Readiness</span>
                <strong>{toNumber(data?.readinessScore)}%</strong>
              </div>
            </div>

            <div className="an-tip-box">
              <h3>Next Move</h3>
              <p>
                {toNumber(data?.mcq?.totalTests) === 0
                  ? "Take one MCQ test to unlock stronger practice insights."
                  : "Review weak answers first, then take a short timed MCQ set."}
              </p>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}

export default Analytics;
