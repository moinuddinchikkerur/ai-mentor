import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../main.css";

function AdminStudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        setMessage("");

        const res = await api.get(`/admin/users/${id}/details`);
        setData(res.data || null);
      } catch (err) {
        console.error("Student details load error:", err);

        setMessage(
          err.response?.data?.message ||
            err.message ||
            "Failed to load student details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadDetails();
    }
  }, [id]);

  const formatDate = (value) => {
    return value ? new Date(value).toLocaleDateString() : "-";
  };

  const formatHours = (value) => {
    const number = Number(value || 0);
    return Number.isInteger(number) ? number : number.toFixed(2);
  };

  if (loading) {
    return (
      <div className="admin-console">
        <p className="admin-muted">Loading student details...</p>
      </div>
    );
  }

  if (message) {
    return (
      <div className="admin-console">
        <button className="admin-small-btn" onClick={() => navigate("/admin")}>
          Back
        </button>

        <div className="admin-alert">{message}</div>
      </div>
    );
  }

  const user = data?.user || {};
  const summary = data?.summary || {};
  const mcqResults = data?.mcqResults || [];
  const studyLogs = data?.studyLogs || [];
  const attentionLogs = data?.attentionLogs || [];
  const weeklyReports = data?.weeklyReports || [];

  return (
    <div className="admin-console admin-details-page">
      <div className="admin-detail-hero">
        <div>
          <button className="admin-back-link" onClick={() => navigate("/admin")}>
            Back to Dashboard
          </button>

          <h1>{user.name || "Student Details"}</h1>

          <div className="admin-detail-meta">
            <span>{user.email || "-"}</span>
            <span>{user.exam || "No exam selected"}</span>
            <span>{user.role || "student"}</span>
            <span className={user.isBlocked ? "status-danger" : "status-good"}>
              {user.isBlocked ? "Blocked" : "Active"}
            </span>
          </div>
        </div>
      </div>

      <div className="admin-detail-stats">
        <div className="admin-stat">
          <span>MCQ Attempts</span>
          <strong>{summary.mcqCount || 0}</strong>
        </div>

        <div className="admin-stat">
          <span>Avg Accuracy</span>
          <strong>{summary.averageMcqAccuracy || 0}%</strong>
        </div>

        <div className="admin-stat">
          <span>Study Logs</span>
          <strong>{summary.studyLogCount || 0}</strong>
        </div>

        <div className="admin-stat">
          <span>Study Hours</span>
          <strong>{formatHours(summary.totalStudyHours)}</strong>
        </div>

        <div className="admin-stat">
          <span>Avg Focus</span>
          <strong>{summary.averageFocus || 0}%</strong>
        </div>

        <div className="admin-stat">
          <span>Reports</span>
          <strong>{summary.weeklyReportCount || 0}</strong>
        </div>
      </div>

      <div className="admin-detail-layout">
        <section className="admin-panel detail-section">
          <div className="admin-section-head">
            <h2>Recent MCQ Results</h2>
            <span>{mcqResults.length} records</span>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table compact">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Subject</th>
                  <th>Difficulty</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {mcqResults.map((item) => (
                  <tr key={item._id}>
                    <td>{item.topic || "-"}</td>
                    <td>{item.subject || "-"}</td>
                    <td>{item.difficulty || "-"}</td>
                    <td>{item.score || 0}</td>
                    <td>
                      <strong>{item.accuracy || 0}%</strong>
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!mcqResults.length && (
              <p className="admin-muted">No MCQ results found.</p>
            )}
          </div>
        </section>

        <section className="admin-panel detail-section">
          <div className="admin-section-head">
            <h2>Recent Study Logs</h2>
            <span>{studyLogs.length} records</span>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table compact">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Hours</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {studyLogs.map((item) => (
                  <tr key={item._id}>
                    <td>{item.title || item.entryType || "-"}</td>
                    <td>{item.subject || item.subjects?.join(", ") || "-"}</td>
                    <td>{formatHours(item.hours)}</td>
                    <td>{item.score || 0}</td>
                    <td>{formatDate(item.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!studyLogs.length && (
              <p className="admin-muted">No study logs found.</p>
            )}
          </div>
        </section>

        <section className="admin-panel detail-section">
          <div className="admin-section-head">
            <h2>Recent Attention Logs</h2>
            <span>{attentionLogs.length} records</span>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table compact">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Focus</th>
                  <th>Alerts</th>
                  <th>Absent Time</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {attentionLogs.map((item) => (
                  <tr key={item._id}>
                    <td>{item.subject || "-"}</td>
                    <td>
                      <strong>{item.focusScore || 0}%</strong>
                    </td>
                    <td>{item.alertsTriggered || 0}</td>
                    <td>{item.absentTime || 0}</td>
                    <td>{formatDate(item.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!attentionLogs.length && (
              <p className="admin-muted">No attention logs found.</p>
            )}
          </div>
        </section>

        <section className="admin-panel detail-section">
          <div className="admin-section-head">
            <h2>Weekly Reports</h2>
            <span>{weeklyReports.length} records</span>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table compact">
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Completed</th>
                  <th>Pending</th>
                  <th>Focus</th>
                  <th>Pass Chance</th>
                </tr>
              </thead>

              <tbody>
                {weeklyReports.map((item) => (
                  <tr key={item._id}>
                    <td>
                      {formatDate(item.weekStart)} - {formatDate(item.weekEnd)}
                    </td>
                    <td>{formatHours(item.completedHours)}</td>
                    <td>{formatHours(item.pendingHours)}</td>
                    <td>{item.averageFocus || 0}%</td>
                    <td>{item.passProbability || "0%"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!weeklyReports.length && (
              <p className="admin-muted">No weekly reports found.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminStudentDetails;
