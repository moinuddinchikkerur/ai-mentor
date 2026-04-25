





import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../main.css";

const timeOrder = [
  "9-10",
  "10-11",
  "11-12",
  "12-1",
  "1-2",
  "2-3",
  "3-4",
  "4-5"
];

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const oldTimeKeys = {
  "9-10": "9:00-10:00",
  "10-11": "10:00-11:00",
  "11-12": "11:00-12:00",
  "12-1": "12:00-1:00",
  "1-2": "1:00-2:00",
  "2-3": "2:00-3:00",
  "3-4": "3:00-4:00",
  "4-5": "4:00-5:00"
};

const parseSubjectsInput = (value) => {
  const seen = new Set();

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, 12);
};

const subjectsToText = (value) => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value || "");
};

const parsePlanObject = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  return value;
};

const getSlotValue = (slots, time) => {
  return slots?.[time] || slots?.[oldTimeKeys[time]] || "-";
};

function Planner() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [subjects, setSubjects] = useState("");
  const [plan, setPlan] = useState(null);
  const [strategy, setStrategy] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [error, setError] = useState("");

  const subjectPreview = useMemo(() => {
    return parseSubjectsInput(subjects);
  }, [subjects]);

  const orderedPlan = useMemo(() => {
    if (!plan) return [];

    return weekDays
      .map((day) => [day, plan[day] || {}])
      .filter(([, slots]) => Object.keys(slots).length > 0);
  }, [plan]);

  const buttonLabel = activeId
    ? "Update Study Plan"
    : "Generate Study Plan";

  const syncActivePlan = useCallback((nextPlan) => {
    if (nextPlan) {
      localStorage.setItem("activePlan", JSON.stringify(nextPlan));
    } else {
      localStorage.removeItem("activePlan");
    }

    window.dispatchEvent(new Event("dashboardRefresh"));
    window.dispatchEvent(new Event("activePlanChanged"));
  }, []);

  const applyPlan = useCallback((item) => {
    const nextPlan = parsePlanObject(item?.plan);

    if (!nextPlan) {
      return;
    }

    setPlan(nextPlan);
    setStrategy(item?.strategy || item?.aiResponse || "");
    setTitle(item?.title || "");
    setSubjects(subjectsToText(item?.subjects));
    setActiveId(item?._id || null);
    setError("");

    syncActivePlan(nextPlan);
  }, [syncActivePlan]);

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);

      const res = await api.get("/study/plans");

      const plans = Array.isArray(res.data?.data)
        ? [...res.data.data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        : [];

      setHistory(plans);
    } catch (err) {
      console.error("Failed to load planner history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const resetBuilder = () => {
    setTitle("");
    setSubjects("");
    setPlan(null);
    setStrategy("");
    setActiveId(null);
    setError("");
    syncActivePlan(null);
  };

  const persistPlan = async ({
    planTitle,
    cleanSubjects,
    nextStrategy,
    receivedPlan
  }) => {
    const payload = {
      title: planTitle,
      subjects: cleanSubjects,
      days: 7,
      strategy: nextStrategy,
      aiResponse: nextStrategy,
      plan: receivedPlan
    };

    if (activeId) {
      return api.put(`/study/plan/${activeId}`, payload);
    }

    return api.post("/study/save-plan", payload);
  };

  const makePlan = async () => {
    const cleanSubjects = parseSubjectsInput(subjects);

    if (cleanSubjects.length === 0) {
      alert("Enter at least one subject");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const planTitle = title.trim() || "Weekly Study Plan";

      const res = await api.post("/ai/plan", {
        title: planTitle,
        subjects: cleanSubjects.join(", "),
        days: 7
      });

      const receivedPlan = parsePlanObject(res.data?.plan);
      const normalizedSubjects =
        Array.isArray(res.data?.subjects) && res.data.subjects.length > 0
          ? res.data.subjects
          : cleanSubjects;
      const nextStrategy = res.data?.strategy || res.data?.aiResponse || "";

      if (!receivedPlan) {
        throw new Error("Invalid plan format received from server");
      }

      setPlan(receivedPlan);
      setStrategy(nextStrategy);
      syncActivePlan(receivedPlan);

      const saveRes = await persistPlan({
        planTitle,
        cleanSubjects: normalizedSubjects,
        nextStrategy,
        receivedPlan
      });

      const savedPlan = saveRes.data?.plan || saveRes.data?.data || null;

      if (savedPlan?._id) {
        applyPlan(savedPlan);
      } else {
        setTitle(planTitle);
        setSubjects(normalizedSubjects.join(", "));
      }

      await fetchHistory();
    } catch (err) {
      console.error("Planner generate error:", err);

      const message =
        err.response?.data?.message ||
        err.message ||
        "Error generating plan";

      setError(message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (id) => {
    const ok = window.confirm("Delete this study plan?");

    if (!ok) return;

    try {
      await api.delete(`/study/plan/${id}`);

      const remaining = history.filter((item) => item._id !== id);
      setHistory(remaining);

      if (activeId === id) {
        if (remaining.length > 0) {
          applyPlan(remaining[0]);
        } else {
          setPlan(null);
          setStrategy("");
          setActiveId(null);
          setTitle("");
          setSubjects("");
          setError("");
          syncActivePlan(null);
        }
      }
    } catch (err) {
      console.error("Delete plan failed:", err);
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="pr-layout">
      <div className="pr-sidebar">
        <h3 className="pr-logo">AI Mentor</h3>

        <button
          className="pr-new-btn"
          type="button"
          onClick={resetBuilder}
        >
          + New Plan
        </button>

        <div className="pr-history-list">
          {historyLoading && (
            <p className="pr-empty-history">Loading plan history...</p>
          )}

          {!historyLoading && history.length === 0 && (
            <p className="pr-empty-history">No saved plans yet</p>
          )}

          {history.map((item) => (
            <div
              key={item._id}
              className={`pr-sidebar-item ${
                activeId === item._id ? "pr-active" : ""
              }`}
            >
              <div
                className="pr-history-text"
                onClick={() => applyPlan(item)}
              >
                <div className="pr-title">
                  {item.title ||
                    item.subject ||
                    (Array.isArray(item.subjects)
                      ? item.subjects.join(", ")
                      : item.subjects) ||
                    "Study Plan"}
                </div>

                <div className="pr-date">
                  {new Date(item.createdAt).toLocaleString()}
                </div>

                {Array.isArray(item.subjects) && item.subjects.length > 0 && (
                  <div className="pr-meta">
                    {item.subjects.slice(0, 4).join(", ")}
                    {item.subjects.length > 4 ? "..." : ""}
                  </div>
                )}
              </div>

              <button
                className="pr-delete-btn"
                type="button"
                onClick={() => deletePlan(item._id)}
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pr-main">
        <div className="pr-panel">
          <div className="pr-header">
            <button
              className="pr-back-btn"
              type="button"
              onClick={() => navigate("/dashboard")}
            >
              Back
            </button>

            <h2 className="pr-page-title">Study Planner</h2>
          </div>

          <div className="pr-form">
            <div className="pr-field">
              <label>Plan Title</label>
              <input
                className="pr-input"
                placeholder="Enter plan title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="pr-field">
              <label>Subjects</label>
              <input
                className="pr-input"
                placeholder="Subjects (java,c,python)"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
              />

              <p className="pr-helper">
                Add subjects separated by commas. Duplicate subjects are removed automatically.
              </p>

              {subjectPreview.length > 0 && (
                <div className="pr-chip-list">
                  {subjectPreview.map((item) => (
                    <span key={item} className="pr-chip">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              className="pr-generate-btn full"
              type="button"
              onClick={makePlan}
              disabled={loading}
            >
              {loading ? "Generating..." : buttonLabel}
            </button>
          </div>

          {error && <p className="pr-error">{error}</p>}

          {strategy && (
            <div className="pr-strategy-box">
              <h3 className="pr-strategy-title">AI Study Strategy</h3>
              <p className="pr-strategy-text">{strategy}</p>
            </div>
          )}

          {!plan && !loading && (
            <div className="pr-empty-plan">
              Generate a new study plan or open one from history.
            </div>
          )}

          {plan && (
            <div className="pr-table-container">
              <h3 className="pr-table-title">
                {title || "Weekly Study Plan"}
              </h3>

              <table className="pr-table">
                <thead>
                  <tr>
                    <th>Day / Time</th>
                    {timeOrder.map((time) => (
                      <th key={time}>{time}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {orderedPlan.map(([day, slots]) => (
                    <tr key={day}>
                      <td className="day-col">{day}</td>

                      {timeOrder.map((time) => {
                        const value = getSlotValue(slots, time);

                        return (
                          <td
                            key={`${day}-${time}`}
                            className={value === "Break" ? "break-cell" : ""}
                          >
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Planner;