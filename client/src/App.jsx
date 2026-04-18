import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Main Components
import Dashboard from "./components/Dashboard";
import ChatBot from "./components/ChatBot";
import WeeklyReport from "./pages/WeeklyReport";
import Analytics from "./components/Analytics";

// AI & Study Pages
import MCQ from "./pages/MCQ";
import Evaluate from "./pages/Evaluate";
import Planner from "./pages/Planner";
import Gamification from "./pages/Gamification";
import CareerAI from "./pages/CareerAI";

// Attention
import AttentionMonitor from "./components/AttentionMonitor";
import AttentionReport from "./pages/AttentionReport";

// Profile
import ProfilePage from "./pages/ProfilePage";

// 🔥 GLOBAL CONTEXT
import React from "react";
export const MonitorContext = React.createContext();

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

function App() {
  const token = localStorage.getItem("token");

  // ✅ INIT FROM STORAGE
  const [isMonitorOn, setIsMonitorOn] = useState(
    localStorage.getItem("monitor") === "on"
  );

  // ✅ KEEP STORAGE IN SYNC
  useEffect(() => {
    localStorage.setItem("monitor", isMonitorOn ? "on" : "off");
  }, [isMonitorOn]);

  return (
    <MonitorContext.Provider value={{ isMonitorOn, setIsMonitorOn }}>
      <BrowserRouter>

        {/* ✅ GLOBAL MONITOR */}
        {token && isMonitorOn && (
          <div className="global-monitor">
            <AttentionMonitor />
          </div>
        )}

        <Routes>

          {/* Auth */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

          {/* Profile */}
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          {/* Chat */}
          <Route path="/chat" element={<PrivateRoute><ChatBot /></PrivateRoute>} />

          {/* Weekly Report */}
          <Route path="/report" element={<PrivateRoute><WeeklyReport /></PrivateRoute>} />

          {/* Analytics */}
          <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />

          {/* MCQ */}
          <Route path="/mcq" element={<PrivateRoute><MCQ /></PrivateRoute>} />

          {/* Evaluate */}
          <Route path="/evaluate" element={<PrivateRoute><Evaluate /></PrivateRoute>} />

          {/* Planner */}
          <Route path="/planner" element={<PrivateRoute><Planner /></PrivateRoute>} />

          {/* Game */}
          <Route path="/game" element={<PrivateRoute><Gamification /></PrivateRoute>} />

          {/* Career */}
          <Route path="/career" element={<PrivateRoute><CareerAI /></PrivateRoute>} />

          {/* Report */}
          <Route path="/attention-report" element={<PrivateRoute><AttentionReport /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </MonitorContext.Provider>
  );
}

export default App;