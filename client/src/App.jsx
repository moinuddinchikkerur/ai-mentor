




import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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

// ✅ Attention Module
import AttentionMonitor from "./components/AttentionMonitor";
import AttentionReport from "./pages/AttentionReport";

// ✅ NEW: Profile Page
import ProfilePage from "./pages/ProfilePage";

// Protected Route
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* ✅ Profile Page */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        {/* Chat */}
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <ChatBot />
            </PrivateRoute>
          }
        />

        {/* Weekly Report */}
        <Route
          path="/report"
          element={
            <PrivateRoute>
              <WeeklyReport />
            </PrivateRoute>
          }
        />

        {/* Analytics */}
        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          }
        />

        {/* MCQ */}
        <Route
          path="/mcq"
          element={
            <PrivateRoute>
              <MCQ />
            </PrivateRoute>
          }
        />

        {/* Evaluate */}
        <Route
          path="/evaluate"
          element={
            <PrivateRoute>
              <Evaluate />
            </PrivateRoute>
          }
        />

        {/* Planner */}
        <Route
          path="/planner"
          element={
            <PrivateRoute>
              <Planner />
            </PrivateRoute>
          }
        />

        {/* Gamification */}
        <Route
          path="/game"
          element={
            <PrivateRoute>
              <Gamification />
            </PrivateRoute>
          }
        />

        {/* Career AI */}
        <Route
          path="/career"
          element={
            <PrivateRoute>
              <CareerAI />
            </PrivateRoute>
          }
        />

        {/* Attention Monitor */}
        <Route
          path="/monitor"
          element={
            <PrivateRoute>
              <AttentionMonitor />
            </PrivateRoute>
          }
        />

        {/* Attention Report */}
        <Route
          path="/attention-report"
          element={
            <PrivateRoute>
              <AttentionReport />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;