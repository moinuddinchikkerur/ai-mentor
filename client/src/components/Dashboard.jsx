


import { useCallback, useEffect, useMemo, useState } from "react";
import "../main.css";

import api from "../services/api";
import Sidebar from "./Sidebar";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

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

const dayOrder = [
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

const getSlotValue = (slots, time) => {
  return slots?.[time] || slots?.[oldTimeKeys[time]] || "";
};

const isStudySubject = (subject) => {
  const value = String(subject || "").trim();

  if (!value) return false;

  return !["break", "revision", "-", "free", "none"].includes(
    value.toLowerCase()
  );
};

const getSubjectsFromPlan = (plan) => {
  if (!plan) return [];

  const subjects = new Set();

  Object.values(plan).forEach((daySlots) => {
    timeOrder.forEach((time) => {
      const subject = getSlotValue(daySlots, time);

      if (isStudySubject(subject)) {
        subjects.add(String(subject).trim());
      }
    });

    Object.values(daySlots || {}).forEach((subject) => {
      if (isStudySubject(subject)) {
        subjects.add(String(subject).trim());
      }
    });
  });

  return Array.from(subjects);
};

const getOrderedPlanEntries = (plan) => {
  const usedDays = new Set();
  const ordered = [];

  dayOrder.forEach((day) => {
    if (plan?.[day]) {
      ordered.push([day, plan[day]]);
      usedDays.add(day);
    }
  });

  Object.entries(plan || {}).forEach(([day, slots]) => {
    if (!usedDays.has(day)) {
      ordered.push([day, slots]);
    }
  });

  return ordered;
};

const formatTime = (seconds) => {
  const totalSeconds = Number(seconds || 0);

  if (totalSeconds <= 0) return "0m";

  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);

  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};

const getLevel = (points) => {
  const value = Number(points || 0);

  if (value < 20) return "Beginner";
  if (value < 50) return "Intermediate";
  if (value < 100) return "Advanced";
  return "Master";
};

function Dashboard() {
  const [data, setData] = useState(null);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [isMonitorOn, setIsMonitorOn] = useState(
    localStorage.getItem("monitor") === "on"
  );
  const [burnoutAlert, setBurnoutAlert] = useState(false);

  const [showTable, setShowTable] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plansList, setPlansList] = useState([]);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [planLocked, setPlanLocked] = useState(false);

  const [showChart, setShowChart] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const handleMonitorToggle = (nextValue) => {
    localStorage.setItem("monitor", nextValue ? "on" : "off");
    setIsMonitorOn(nextValue);
    window.dispatchEvent(new Event("monitorChanged"));
  };

  const fetchData = useCallback(async ({ background = false } = {}) => {
    try {
      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const res = await api.get("/dashboard");
      const dashboardData = res.data || {};

      setData(dashboardData);

      const incomingPlans = Array.isArray(dashboardData.plans)
        ? dashboardData.plans
        : [];

      const normalizedPlans = incomingPlans.length > 0
        ? incomingPlans
        : dashboardData.plan
          ? [
              {
                _id: "latest-plan",
                title: "Plan 1",
                plan: dashboardData.plan
              }
            ]
          : [];

      setPlansList(normalizedPlans);
    } catch (err) {
      console.error("Dashboard load failed:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchStreak = useCallback(async () => {
    try {
      const res = await api.post("/streak/update", {});

      if (res.data.success) {
        setStreak(res.data.streak);
      }
    } catch (err) {
      console.error("Streak load failed:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchStreak();
  }, [fetchData, fetchStreak]);

  useEffect(() => {
    const syncMonitor = () => {
      setIsMonitorOn(localStorage.getItem("monitor") === "on");
    };

    window.addEventListener("storage", syncMonitor);
    window.addEventListener("monitorChanged", syncMonitor);

    return () => {
      window.removeEventListener("storage", syncMonitor);
      window.removeEventListener("monitorChanged", syncMonitor);
    };
  }, []);

  useEffect(() => {
    if (plansList.length === 0) {
      setSelectedPlan(null);
      setSelectedPlanIndex(0);
      setPlanLocked(false);
      return;
    }

    if (!selectedPlan && !planLocked && plansList[0]?.plan) {
      setSelectedPlanIndex(0);
      setSelectedPlan(plansList[0].plan);
    }
  }, [plansList, selectedPlan, planLocked]);

  useEffect(() => {
    if (selectedPlan) {
      localStorage.setItem("activePlan", JSON.stringify(selectedPlan));
      window.dispatchEvent(new Event("activePlanChanged"));
      return;
    }

    localStorage.removeItem("activePlan");
    window.dispatchEvent(new Event("activePlanChanged"));
  }, [selectedPlan]);

  useEffect(() => {
    const refresh = () => {
      fetchData({ background: true });
    };

    window.addEventListener("dashboardRefresh", refresh);

    return () => {
      window.removeEventListener("dashboardRefresh", refresh);
    };
  }, [fetchData]);

  useEffect(() => {
    if ((data?.todayHours || 0) > 8 * 3600) {
      setBurnoutAlert(true);
    }
  }, [data]);

  useEffect(() => {
    if (!burnoutAlert) return;

    const timer = setTimeout(() => {
      setBurnoutAlert(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [burnoutAlert]);

  const planSubjects = useMemo(() => {
    return getSubjectsFromPlan(selectedPlan);
  }, [selectedPlan]);

  const performanceSubjects = useMemo(() => {
    if (planSubjects.length > 0) return planSubjects;
    return Object.keys(data?.subjects || {});
  }, [planSubjects, data]);

  const subjectStats = useMemo(() => {
    return performanceSubjects.map((subject) => ({
      subject,
      seconds: Number(data?.subjects?.[subject] || 0)
    }));
  }, [performanceSubjects, data]);

  const hasRecordedSubjectTime = useMemo(() => {
    return subjectStats.some((item) => item.seconds > 0);
  }, [subjectStats]);

  const visiblePerformanceSubjects = useMemo(() => {
    const sorted = [...subjectStats].sort((a, b) => {
      if (b.seconds !== a.seconds) return b.seconds - a.seconds;
      return a.subject.localeCompare(b.subject);
    });

    const filtered = hasRecordedSubjectTime
      ? sorted.filter((item) => item.seconds > 0)
      : sorted;

    return filtered.map((item) => item.subject);
  }, [subjectStats, hasRecordedSubjectTime]);

  const weakSubject = useMemo(() => {
    if (!hasRecordedSubjectTime || subjectStats.length === 0) return null;

    return [...subjectStats].sort((a, b) => {
      if (a.seconds !== b.seconds) return a.seconds - b.seconds;
      return a.subject.localeCompare(b.subject);
    })[0]?.subject || null;
  }, [hasRecordedSubjectTime, subjectStats]);

  const todaySubjects = useMemo(() => {
    if (!selectedPlan) return [];

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long"
    });

    const todayPlanKey = Object.keys(selectedPlan).find(
      (day) => day.toLowerCase() === today.toLowerCase()
    );

    if (!todayPlanKey) return [];

    return timeOrder
      .map((time) => getSlotValue(selectedPlan[todayPlanKey], time))
      .filter(isStudySubject)
      .map((subject) => String(subject).trim());
  }, [selectedPlan]);

  const todayFocusCards = useMemo(() => {
    const counts = new Map();

    todaySubjects.forEach((subject) => {
      counts.set(subject, (counts.get(subject) || 0) + 1);
    });

    return Array.from(counts.entries()).map(([subject, count]) =>
      count > 1 ? `${subject} x${count}` : subject
    );
  }, [todaySubjects]);

  const currentPlanInfo = useMemo(() => {
    if (!selectedPlan) {
      return {
        current: "",
        next: ""
      };
    }

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long"
    });

    const todayPlanKey = Object.keys(selectedPlan).find(
      (day) => day.toLowerCase() === today.toLowerCase()
    );

    if (!todayPlanKey) {
      return {
        current: "",
        next: ""
      };
    }

    const todayPlan = selectedPlan[todayPlanKey] || {};
    const hour = new Date().getHours();
    const currentIndex = hour >= 9 && hour < 17 ? hour - 9 : -1;

    const currentSubject =
      currentIndex >= 0
        ? getSlotValue(todayPlan, timeOrder[currentIndex])
        : "";

    let nextSubject = "";

    for (let index = currentIndex + 1; index < timeOrder.length; index += 1) {
      const subject = getSlotValue(todayPlan, timeOrder[index]);

      if (isStudySubject(subject)) {
        nextSubject = String(subject).trim();
        break;
      }
    }

    return {
      current: isStudySubject(currentSubject) ? String(currentSubject).trim() : "",
      next: nextSubject
    };
  }, [selectedPlan]);

  const dailyGoalPercent = useMemo(() => {
    if (!data) return 0;

    const dailyGoalSeconds = 4 * 3600;
    const todaySeconds = data.todayHours || 0;
    const percent = Math.round((todaySeconds / dailyGoalSeconds) * 100);

    return Math.min(percent, 100);
  }, [data]);

  const aiTip = useMemo(() => {
    if (!data) return "";

    if ((data.todayHours || 0) > 8 * 3600) {
      return "You studied a lot today. Take rest and protect your focus.";
    }

    if ((data.todayHours || 0) === 0 && todayFocusCards.length > 0) {
      return `Start with ${todayFocusCards[0]} and build momentum early.`;
    }

    if (weakSubject) {
      return `Focus more on ${weakSubject} today to balance your preparation.`;
    }

    return "Great consistency. Keep following your timetable step by step.";
  }, [data, weakSubject, todayFocusCards]);

  const sideInsight = useMemo(() => {
    if (currentPlanInfo.current) {
      return `Current Slot: ${currentPlanInfo.current}`;
    }

    if (currentPlanInfo.next) {
      return `Next Subject: ${currentPlanInfo.next}`;
    }

    if (weakSubject) {
      return `Weak Subject: ${weakSubject}`;
    }

    return "No data yet";
  }, [currentPlanInfo, weakSubject]);

  const chartData = useMemo(() => {
    if (!data) return [];

    const toMinutes = (seconds) => Math.floor(Number(seconds || 0) / 60);

    if (selectedSubject && selectedSubject !== "ALL") {
      return [
        {
          name: selectedSubject,
          minutes: toMinutes(data.subjects?.[selectedSubject] || 0)
        }
      ];
    }

    const subjectsToShow =
      visiblePerformanceSubjects.length > 0
        ? visiblePerformanceSubjects
        : performanceSubjects;

    return subjectsToShow.map((subject) => ({
      name: subject,
      minutes: toMinutes(data.subjects?.[subject] || 0)
    }));
  }, [data, selectedSubject, visiblePerformanceSubjects, performanceSubjects]);

  const openTimetable = () => {
    if (!selectedPlan && plansList[0]?.plan) {
      setSelectedPlanIndex(0);
      setSelectedPlan(plansList[0].plan);
    }

    setShowTable(true);
  };

  const weeklySubjects =
    visiblePerformanceSubjects.length > 0
      ? visiblePerformanceSubjects
      : performanceSubjects;

  return (
    <div className="layout">
      <Sidebar />

      <div className="main-content">
        {loading && !data && <p>Loading dashboard...</p>}
        {refreshing && <p className="da-info">Refreshing dashboard...</p>}
        {error && <p className="da-error">{error}</p>}

        {burnoutAlert && (
          <div className="burnout-popup">
            Burnout Alert! Take rest and protect your focus.
          </div>
        )}

        <h1>AI Personal Exam Mentor</h1>

        <p className="da-welcome">
          Welcome back. Keep growing every day.
        </p>

        <div className="monitor-section">
          <div className="monitor-header">
            <h3>Live Attention Monitoring</h3>

            {!isMonitorOn ? (
              <button
                className="monitor-start"
                onClick={() => handleMonitorToggle(true)}
                type="button"
              >
                Start Monitoring
              </button>
            ) : (
              <button
                className="monitor-stop"
                onClick={() => handleMonitorToggle(false)}
                type="button"
              >
                Stop Monitoring
              </button>
            )}
          </div>
        </div>

        {streak && (
          <div className="da-progress">
            <h3>Your Progress</h3>

            <div className="da-progress-grid">
              <div>{streak.days} Days</div>
              <div>{streak.points} Points</div>
              <div>{getLevel(streak.points)}</div>
            </div>
          </div>
        )}

        {data && (
          <div className="da-progress">
            <h3>AI Study Tip</h3>

            <div className="da-progress-grid">
              <div>{aiTip}</div>
              <div>Daily Goal: {dailyGoalPercent}%</div>
              <div>{sideInsight}</div>
            </div>
          </div>
        )}

        {data && (
          <div className="da-progress">
            <h3>Today&apos;s Focus</h3>

            <div className="da-progress-grid">
              {todayFocusCards.length > 0 ? (
                todayFocusCards.map((subject) => (
                  <div key={subject}>{subject}</div>
                ))
              ) : (
                <div>No timetable found for today</div>
              )}
            </div>
          </div>
        )}

        <div className="da-plan-btn">
          <button
            className="view-plan-btn"
            onClick={openTimetable}
            type="button"
          >
            View Timetable
          </button>
        </div>

        {data && (
          <>
            <h3 className="da-title">Weekly Performance</h3>

            <div className="da-stats">
              <div
                className="da-card"
                onClick={() => {
                  setSelectedSubject("ALL");
                  setShowChart(true);
                }}
              >
                <h2>{formatTime(data.totalHours || 0)}</h2>
                <p>Study Time</p>
              </div>

              {weeklySubjects.map((subject) => (
                <div
                  className="da-card"
                  key={subject}
                  onClick={() => {
                    setSelectedSubject(subject);
                    setShowChart(true);
                  }}
                >
                  <h2>{formatTime(data.subjects?.[subject] || 0)}</h2>
                  <p>{subject}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {showChart && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div className="modal-header">
                <h2>
                  {selectedSubject === "ALL" ? "All Subjects" : selectedSubject}
                </h2>

                <button
                  onClick={() => setShowChart(false)}
                  type="button"
                >
                  X
                </button>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => [`${value} min`, "Study Time"]} />
                  <Bar dataKey="minutes" fill="#c026d3" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {showTable && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div className="modal-header">
                <h2>Study Timetable</h2>

                <button
                  onClick={() => setShowTable(false)}
                  type="button"
                >
                  X
                </button>
              </div>

              {plansList.length > 0 ? (
                <>
                  <select
                    className="plan-dropdown"
                    value={selectedPlanIndex}
                    onChange={(e) => {
                      const index = parseInt(e.target.value, 10);

                      if (plansList[index]) {
                        setSelectedPlanIndex(index);
                        setSelectedPlan(plansList[index].plan);
                        setPlanLocked(true);
                      }
                    }}
                  >
                    {plansList.map((planItem, index) => (
                      <option key={planItem._id || index} value={index}>
                        {planItem.title ||
                          planItem.name ||
                          planItem.subject ||
                          `Plan ${index + 1}`}
                      </option>
                    ))}
                  </select>

                  <table className="pr-table">
                    <thead>
                      <tr>
                        <th>Day</th>

                        {timeOrder.map((time) => (
                          <th key={time}>{time}</th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {getOrderedPlanEntries(selectedPlan || {}).map(([day, slots]) => (
                        <tr key={day}>
                          <td>{day}</td>

                          {timeOrder.map((time) => (
                            <td key={time}>
                              {getSlotValue(slots, time) || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <p className="no-plan">No saved timetable yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;





                              