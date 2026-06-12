import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import { getToken, getStoredUser } from "./services/api";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStudentDetails from "./pages/AdminStudentDetails";

import Dashboard from "./components/Dashboard";
import ChatBot from "./components/ChatBot";
import WeeklyReport from "./pages/WeeklyReport";
import Analytics from "./components/Analytics";

import MCQ from "./pages/MCQ";
import Evaluate from "./pages/Evaluate";
import Planner from "./pages/Planner";
import Gamification from "./pages/Gamification";
import CareerAI from "./pages/CareerAI";

import AttentionMonitor from "./components/AttentionMonitor";
import AttentionReport from "./pages/AttentionReport";

import ProfilePage from "./pages/ProfilePage";

export const MonitorContext = React.createContext({
  isMonitorOn: false,
  setIsMonitorOn: () => {}
});

const PrivateRoute = ({ children }) => {
  const token = getToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const token = getToken();
  const user = getStoredUser();

  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  const location = useLocation();
  const [token, setToken] = useState(getToken());
  const [isMonitorOn, setIsMonitorOn] = useState(
    localStorage.getItem("monitor") === "on"
  );

  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/register" ||
    location.pathname === "/login" ||
    location.pathname === "/admin-login";

  useEffect(() => {
    const syncAuth = () => {
      setToken(getToken());
    };

    const syncMonitor = () => {
      setIsMonitorOn(localStorage.getItem("monitor") === "on");
    };

    window.addEventListener("storage", syncAuth);
    window.addEventListener("authChanged", syncAuth);
    window.addEventListener("storage", syncMonitor);
    window.addEventListener("monitorChanged", syncMonitor);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("authChanged", syncAuth);
      window.removeEventListener("storage", syncMonitor);
      window.removeEventListener("monitorChanged", syncMonitor);
    };
  }, []);

  useEffect(() => {
    if (!token && isMonitorOn) {
      localStorage.setItem("monitor", "off");
      setIsMonitorOn(false);
      window.dispatchEvent(new Event("monitorChanged"));
    }
  }, [token, isMonitorOn]);

  return (
    <MonitorContext.Provider value={{ isMonitorOn, setIsMonitorOn }}>
      {token && isMonitorOn && !isAuthPage && <AttentionMonitor floating />}

      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users/:id"
          element={
            <AdminRoute>
              <AdminStudentDetails />
            </AdminRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <ChatBot />
            </PrivateRoute>
          }
        />

        <Route
          path="/report"
          element={
            <PrivateRoute>
              <WeeklyReport />
            </PrivateRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          }
        />

        <Route
          path="/mcq"
          element={
            <PrivateRoute>
              <MCQ />
            </PrivateRoute>
          }
        />

        <Route
          path="/evaluate"
          element={
            <PrivateRoute>
              <Evaluate />
            </PrivateRoute>
          }
        />

        <Route
          path="/planner"
          element={
            <PrivateRoute>
              <Planner />
            </PrivateRoute>
          }
        />

        <Route
          path="/game"
          element={
            <PrivateRoute>
              <Gamification />
            </PrivateRoute>
          }
        />

        <Route
          path="/gamification"
          element={
            <PrivateRoute>
              <Gamification />
            </PrivateRoute>
          }
        />

        <Route
          path="/career"
          element={
            <PrivateRoute>
              <CareerAI />
            </PrivateRoute>
          }
        />

        <Route
          path="/attention-report"
          element={
            <PrivateRoute>
              <AttentionReport />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MonitorContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;


