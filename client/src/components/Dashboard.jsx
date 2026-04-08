

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../main.css";

import Sidebar from "./Sidebar";
import AttentionMonitor from "./AttentionMonitor";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function Dashboard() {

  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMonitor, setShowMonitor] = useState(false);
  const [burnoutAlert, setBurnoutAlert] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [showChart, setShowChart] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const getSubjectsFromPlan = (plan) => {
    if (!plan) return [];

    const subjectsSet = new Set();

    Object.values(plan).forEach(day => {
      Object.values(day).forEach(subject => {
        if (
          subject &&
          subject !== "Break" &&
          subject !== "Revision"
        ) {
          subjectsSet.add(subject);
        }
      });
    });

    return Array.from(subjectsSet);
  };

  const planSubjects = getSubjectsFromPlan(selectedPlan);

  const getChartData = () => {
    if (!data) return [];

    if (selectedSubject && selectedSubject !== "ALL") {
      return [{
        name: selectedSubject,
        hours: data.subjects?.[selectedSubject] || 0
      }];
    }

    const subjects = planSubjects.length > 0
      ? planSubjects
      : Object.keys(data.subjects || {});

    return subjects.map((sub) => ({
      name: sub,
      hours: data.subjects?.[sub] || 0
    }));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        logout();
        return;
      }

      const res = await axios.get(
        "http://localhost:5000/api/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(res.data);

      if (res.data?.plans && res.data.plans.length > 0) {
        setSelectedPlan(res.data.plans[0].plan);
      } else if (res.data?.plan) {
        setSelectedPlan(res.data.plan);
      }

    } catch (err) {
      if (err.response?.status === 401) logout();
      else setError("Failed to load dashboard ❌");
    } finally {
      setLoading(false);
    }
  };

  const fetchStreak = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/streak/update",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setStreak(res.data.streak);
      }

    } catch {}
  };

  const getLevel = (points) => {
    if (!points) return "Beginner 🟢";
    if (points < 20) return "Beginner 🟢";
    if (points < 50) return "Intermediate 🔵";
    if (points < 100) return "Advanced 🟣";
    return "Master 🔥";
  };

  useEffect(() => {
    fetchData();
    fetchStreak();
  }, []);

  useEffect(() => {
    if (data?.totalHours > 8) setBurnoutAlert(true);
  }, [data]);

  useEffect(() => {
    if (burnoutAlert) {
      const timer = setTimeout(() => {
        setBurnoutAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [burnoutAlert]);

  return (
    <div className="layout">

      <Sidebar logout={logout} />

      <div className="main-content">

        {burnoutAlert && (
          <div className="burnout-popup">
            ⚠️ Burnout Alert! Take rest 🧠💙
          </div>
        )}

        <h1>📊 AI Personal Exam Mentor</h1>

        <p className="da-welcome">
          Welcome back 👋 Keep growing every day!
        </p>

        {/* MONITOR */}
        <div className="monitor-section">
          <div className="monitor-header">

            <h3>🎥 Live Attention Monitoring</h3>

            {!showMonitor ? (
              <button
                className="monitor-start"
                onClick={() => setShowMonitor(true)}
              >
                Start Monitoring
              </button>
            ) : (
              <button
                className="monitor-stop"
                onClick={() => setShowMonitor(false)}
              >
                Stop Monitoring
              </button>
            )}

          </div>

          {showMonitor && (
            <div className="monitor-card">
              <AttentionMonitor />
            </div>
          )}
        </div>

        {/* PROGRESS */}
        {streak && (
          <div className="da-progress">
            <h3>🏆 Your Progress</h3>

            <div className="da-progress-grid">
              <div>🔥 Streak <span>{streak.days} Days</span></div>
              <div>⭐ Points <span>{streak.points}</span></div>
              <div>🎯 Level <span>{getLevel(streak.points)}</span></div>
            </div>
          </div>
        )}

        {/* BUTTON */}
        {data && (
          <div className="da-plan-btn">
            <button
              className="view-plan-btn"
              onClick={() => setShowTable(true)}
            >
              📅 View Timetable
            </button>
          </div>
        )}

        {/* WEEKLY */}
        {!loading && data && (
          <>
            <h3 className="da-title">📈 Weekly Performance</h3>

            <div className="da-stats">

              <div
                className="da-card"
                onClick={() => {
                  setSelectedSubject("ALL");
                  setShowChart(true);
                }}
                style={{ cursor: "pointer" }}
              >
                <h2>{data.totalHours || 0} hrs</h2>
                <p>Study Time</p>
              </div>

              {planSubjects.map((sub, i) => (
                <div
                  className="da-card"
                  key={i}
                  onClick={() => {
                    setSelectedSubject(sub);
                    setShowChart(true);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <h2>{data.subjects?.[sub] || 0}</h2>
                  <p>{sub}</p>
                </div>
              ))}

            </div>
          </>
        )}

        {/* CHART POPUP */}
        {showChart && (
          <div className="modal-overlay">
            <div className="modal-box">

              <div className="modal-header">
                <h2>
                  📊 {selectedSubject === "ALL" ? "All Subjects" : selectedSubject}
                </h2>
                <button onClick={() => setShowChart(false)}>✖</button>
              </div>

              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getChartData()}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>
        )}

        {/* 🔥 TIMETABLE POPUP (ADDED FEATURE) */}
        {showTable && (
          <div className="modal-overlay">

            <div className="modal-box">

              <div className="modal-header">
                <h2>📅 Study Timetable</h2>
                <button onClick={() => setShowTable(false)}>✖</button>
              </div>

              {!selectedPlan ? (
                <p style={{ color: "red" }}>
                  ⚠️ No timetable found. Please create one first.
                </p>
              ) : (
                <div className="pr-table-container">
                  <table className="pr-table">

                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>9-10</th>
                        <th>10-11</th>
                        <th>11-12</th>
                        <th>12-1</th>
                        <th>1-2</th>
                        <th>2-3</th>
                        <th>3-4</th>
                        <th>4-5</th>
                      </tr>
                    </thead>

                    <tbody>
                      {Object.entries(selectedPlan).map(([day, slots]) => (
                        <tr key={day}>
                          <td className="day-col">{day}</td>

                          {[
                            "9:00-10:00",
                            "10:00-11:00",
                            "11:00-12:00",
                            "12:00-1:00",
                            "1:00-2:00",
                            "2:00-3:00",
                            "3:00-4:00",
                            "4:00-5:00"
                          ].map((time, i) => (
                            <td
                              key={i}
                              className={slots[time] === "Break" ? "break-cell" : ""}
                            >
                              {slots[time] || "-"}
                            </td>
                          ))}

                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;