


import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../main.css";

const numberValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatHourLabel = (value) => {
  const hours = numberValue(value);
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
};

const getReadinessTone = (score) => {
  if (score >= 75) return "strong";
  if (score >= 45) return "medium";
  return "weak";
};

const getBarHeight = (value, max) => {
  const current = numberValue(value);

  if (!current || !max) return "0%";

  return `${Math.max(8, Math.round((current / max) * 100))}%`;
};

const getGeneratedLabel = (value) => {
  if (!value) return "";

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};

function WeeklyReport() {
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/report/weekly");

      if (!res.data.success) {
        throw new Error(res.data.message || "Report load failed");
      }

      setReport(res.data.report);
    } catch (err) {
      console.error("Report load failed:", err);
      setError(err.response?.data?.message || "Report load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const subjectList = useMemo(() => {
    if (Array.isArray(report?.subjectList)) {
      return report.subjectList;
    }

    return Object.entries(report?.subjects || {}).map(([name, value]) => {
      if (typeof value === "object" && value !== null) {
        return {
          name,
          hours: numberValue(value.hours),
          status: value.status || "No status",
          percentage: numberValue(value.percentage)
        };
      }

      return {
        name,
        hours: 0,
        status: String(value || "No status"),
        percentage: 0
      };
    });
  }, [report]);

  const recommendations = useMemo(() => {
    if (Array.isArray(report?.recommendations) && report.recommendations.length) {
      return report.recommendations;
    }

    return report?.suggestion ? [report.suggestion] : [];
  }, [report]);

  const dailyStudy = report?.dailyStudy || [];
  const dailyFocus = report?.dailyFocus || [];
  const readinessScore = numberValue(report?.readinessScore || String(report?.passProbability || "").replace("%", ""));
  const readinessTone = getReadinessTone(readinessScore);
  const maxDailyMinutes = Math.max(...dailyStudy.map((item) => numberValue(item.minutes)), 1);

  return (
    <div className="wr-page">
      <div className="wr-shell">
        <header className="wr-header">
          <div>
            <p className="wr-eyebrow">Weekly Report</p>
            <h1>Study Performance</h1>
            <p>
              {report?.range || "Last 7 Days"}
              {report?.generatedAt ? ` • Updated ${getGeneratedLabel(report.generatedAt)}` : ""}
            </p>
          </div>

          <div className="wr-actions">
            <button
              className="wr-secondary-btn"
              onClick={() => navigate("/dashboard")}
              type="button"
            >
              Back to Dashboard
            </button>

            <button
              className="wr-primary-btn"
              onClick={fetchReport}
              disabled={loading}
              type="button"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        {error && (
          <div className="wr-error">
            {error}
          </div>
        )}

        {loading && !report ? (
          <div className="wr-loading">
            Building your weekly report...
          </div>
        ) : report ? (
          <>
            <section className="wr-hero-grid">
              <div className={`wr-score-card ${readinessTone}`}>
                <p>Readiness Score</p>

                <div
                  className="wr-score-ring"
                  style={{ "--score": `${readinessScore}%` }}
                >
                  <span>{readinessScore}%</span>
                </div>

                <h2>{report.readinessLabel || "Keep Building"}</h2>
                <small>{report.suggestion}</small>
              </div>

              <div className="wr-metric-grid">
                <div className="wr-metric-card">
                  <span>Planned</span>
                  <strong>{formatHourLabel(report.plannedHours)}</strong>
                </div>

                <div className="wr-metric-card">
                  <span>Completed</span>
                  <strong>{formatHourLabel(report.completedHours)}</strong>
                </div>

                <div className="wr-metric-card">
                  <span>Pending</span>
                  <strong>{formatHourLabel(report.pendingHours)}</strong>
                </div>

                <div className="wr-metric-card">
                  <span>Completion</span>
                  <strong>{numberValue(report.completionRate)}%</strong>
                </div>

                <div className="wr-metric-card">
                  <span>Avg Focus</span>
                  <strong>{numberValue(report.averageFocus)}%</strong>
                </div>

                <div className="wr-metric-card">
                  <span>MCQ Accuracy</span>
                  <strong>{numberValue(report.mcq?.averageAccuracy)}%</strong>
                </div>
              </div>
            </section>

            <section className="wr-grid-two">
              <div className="wr-panel">
                <div className="wr-panel-head">
                  <div>
                    <p>Study Trend</p>
                    <h2>Last 7 Days</h2>
                  </div>

                  <span>{report.activeStudyDays || 0}/7 active days</span>
                </div>

                <div className="wr-bar-chart">
                  {dailyStudy.map((item) => (
                    <div className="wr-bar-item" key={`${item.day}-${item.date}`}>
                      <div className="wr-bar-track">
                        <span
                          className="wr-study-bar"
                          style={{ height: getBarHeight(item.minutes, maxDailyMinutes) }}
                        ></span>
                      </div>

                      <strong>{item.day}</strong>
                      <small>{item.minutes || 0}m</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="wr-panel">
                <div className="wr-panel-head">
                  <div>
                    <p>Focus Trend</p>
                    <h2>Attention Quality</h2>
                  </div>

                  <span>{report.totalFocusLogs || 0} records</span>
                </div>

                <div className="wr-focus-list">
                  {dailyFocus.map((item) => (
                    <div className="wr-focus-row" key={`${item.day}-${item.date}`}>
                      <span>{item.day}</span>

                      <div className="wr-focus-track">
                        <strong style={{ width: `${numberValue(item.focus)}%` }}></strong>
                      </div>

                      <em>{item.focus || 0}%</em>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="wr-grid-two">
              <div className="wr-panel">
                <div className="wr-panel-head">
                  <div>
                    <p>Subjects</p>
                    <h2>Priority Breakdown</h2>
                  </div>

                  <span>{subjectList.length} subjects</span>
                </div>

                <div className="wr-subject-list">
                  {subjectList.length > 0 ? (
                    subjectList.map((subject) => (
                      <article
                        className={`wr-subject-card ${subject.statusTone || ""}`}
                        key={subject.name}
                      >
                        <div>
                          <h3>{subject.name}</h3>
                          <p>{subject.status}</p>
                        </div>

                        <strong>{formatHourLabel(subject.hours)}</strong>

                        <div className="wr-subject-track">
                          <span style={{ width: `${numberValue(subject.percentage)}%` }}></span>
                        </div>

                        {subject.advice && <small>{subject.advice}</small>}
                      </article>
                    ))
                  ) : (
                    <div className="wr-empty">
                      No subject data yet. Complete a study session to unlock subject insights.
                    </div>
                  )}
                </div>
              </div>

              <div className="wr-panel">
                <div className="wr-panel-head">
                  <div>
                    <p>Practice</p>
                    <h2>MCQ Summary</h2>
                  </div>

                  <span>{report.mcq?.totalTests || 0} tests</span>
                </div>

                <div className="wr-insight-grid">
                  <div>
                    <span>Average Accuracy</span>
                    <strong>{numberValue(report.mcq?.averageAccuracy)}%</strong>
                  </div>

                  <div>
                    <span>Best Topic</span>
                    <strong>{report.mcq?.bestTopic || "No data yet"}</strong>
                  </div>

                  <div>
                    <span>Best Accuracy</span>
                    <strong>{numberValue(report.mcq?.bestAccuracy)}%</strong>
                  </div>

                  <div>
                    <span>Study Streak</span>
                    <strong>{report.studyStreak || 0} days</strong>
                  </div>
                </div>

                <div className="wr-recommendations">
                  <h3>Next Best Steps</h3>

                  <ul>
                    {recommendations.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="wr-empty">
            No report data available yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default WeeklyReport;
