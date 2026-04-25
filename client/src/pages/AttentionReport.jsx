

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../main.css";

const formatDuration = (seconds) => {
  const total = Number(seconds || 0);

  if (total <= 0) return "0s";

  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

const formatDateTime = (value) => {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};

const getScoreTone = (score) => {
  const value = Number(score || 0);

  if (value >= 90) return "excellent";
  if (value >= 75) return "good";
  if (value >= 55) return "fair";
  return "low";
};

const getSourceLabel = (source) => {
  return source === "manual" ? "Manual" : "Timetable";
};

function AttentionReport() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/attention/my-report");

      setLogs(Array.isArray(res.data?.logs) ? res.data.logs : []);
      setSummary(res.data?.summary || null);
    } catch (err) {
      console.error("Failed to load attention report:", err);
      setError(
        err.response?.data?.message || "Failed to load attention report"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const clearReport = async () => {
    const ok = window.confirm("Clear all attention logs?");

    if (!ok) return;

    try {
      setClearing(true);
      await api.delete("/attention/my-report");
      setLogs([]);
      setSummary(null);
    } catch (err) {
      console.error("Clear report failed:", err);
      alert(err.response?.data?.message || "Failed to clear attention report");
    } finally {
      setClearing(false);
    }
  };

  const statItems = useMemo(() => {
    if (!summary) return [];

    return [
      {
        label: "Tracked Time",
        value: formatDuration(summary.totalSessionTime || 0)
      },
      {
        label: "Absent Time",
        value: formatDuration(summary.totalAbsentTime || 0)
      },
      {
        label: "Total Alerts",
        value: `${summary.totalAlerts || 0}`
      },
      {
        label: "Best Subject",
        value: summary.bestSubject || "No data yet"
      },
      {
        label: "Needs Attention",
        value: summary.needsAttentionSubject || "No data yet"
      },
      {
        label: "Total Logs",
        value: `${summary.totalLogs || 0}`
      }
    ];
  }, [summary]);

  return (
    <div className="ar-page">
      <div className="ar-shell">
        <div className="ar-header-row">
          <div className="ar-header-main">
            <button
              className="ar-back-btn"
              type="button"
              onClick={() => navigate("/dashboard")}
            >
              Back
            </button>

            <div className="ar-heading-block">
              <p className="ar-eyebrow">Focus Tracking</p>
              <h1 className="ar-title">Attention Report</h1>
              <p className="ar-subtitle">
                Track subject-wise focus, time away, and recent attention quality.
              </p>
            </div>
          </div>

          <div className="ar-actions">
            <button
              className="ar-secondary-btn"
              type="button"
              onClick={load}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <button
              className="ar-primary-btn"
              type="button"
              onClick={clearReport}
              disabled={clearing}
            >
              {clearing ? "Clearing..." : "Clear Logs"}
            </button>
          </div>
        </div>

        {error && <p className="ar-error">{error}</p>}

        <div className="ar-layout">
          <aside className="ar-sidebar">
            <div className="ar-focus-card">
              <p className="ar-focus-label">Average Focus</p>
              <h2 className="ar-focus-value">
                {summary ? `${summary.averageFocus || 0}%` : "--"}
              </h2>
              <span className="ar-focus-meta">
                {summary
                  ? `${summary.totalLogs || 0} synced sessions`
                  : "No report data yet"}
              </span>
            </div>

            <div className="ar-stat-grid">
              {statItems.map((item) => (
                <div key={item.label} className="ar-stat-card">
                  <p className="ar-stat-label">{item.label}</p>
                  <h3 className="ar-stat-value">{item.value}</h3>
                </div>
              ))}
            </div>

            {summary?.subjectBreakdown?.length > 0 && (
              <div className="ar-side-panel">
                <div className="ar-side-panel-head">
                  <p className="ar-panel-kicker">Subject Insights</p>
                  <h3 className="ar-panel-title">Breakdown</h3>
                </div>

                <div className="ar-breakdown-list">
                  {summary.subjectBreakdown.map((item) => {
                    const tone = getScoreTone(item.averageFocus);

                    return (
                      <div key={item.subject} className="ar-breakdown-item">
                        <div className="ar-breakdown-top">
                          <strong>{item.subject}</strong>
                          <span className={`ar-score-pill ${tone}`}>
                            {item.averageFocus}%
                          </span>
                        </div>

                        <div className="ar-progress-track">
                          <div
                            className={`ar-progress-fill ${tone}`}
                            style={{
                              width: `${Math.max(item.averageFocus || 0, 6)}%`
                            }}
                          />
                        </div>

                        <div className="ar-breakdown-meta">
                          <span>{formatDuration(item.totalSessionTime)}</span>
                          <span>{item.totalAlerts} alerts</span>
                          <span>{item.totalLogs} logs</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          <section className="ar-main">
            <div className="ar-table-panel">
              <div className="ar-table-head">
                <div>
                  <p className="ar-panel-kicker">Recent Activity</p>
                  <h3 className="ar-panel-title">Attention Sessions</h3>
                </div>

                <div className="ar-record-badge">
                  {logs.length} {logs.length === 1 ? "record" : "records"}
                </div>
              </div>

              <div className="ar-table-wrap">
                <table className="ar-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Subject</th>
                      <th>Source</th>
                      <th>Tracked</th>
                      <th>Absent</th>
                      <th>Alerts</th>
                      <th>Score</th>
                    </tr>
                  </thead>

                  <tbody>
                    {!loading && logs.length > 0 ? (
                      logs.map((log) => {
                        const tone = getScoreTone(log.focusScore || 0);

                        return (
                          <tr key={log._id}>
                            <td>{formatDateTime(log.date)}</td>
                            <td>{log.subject || "General"}</td>
                            <td>
                              <span className={`ar-source-pill ${log.subjectSource || "auto"}`}>
                                {getSourceLabel(log.subjectSource)}
                              </span>
                            </td>
                            <td>{formatDuration(log.totalSessionTime)}</td>
                            <td>{formatDuration(log.absentTime)}</td>
                            <td>{log.alertsTriggered || 0}</td>
                            <td>
                              <span className={`ar-score-pill ${tone}`}>
                                {Math.round(log.focusScore || 0)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="ar-empty-row">
                          {loading ? "Loading report..." : "No attention logs yet"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AttentionReport;
