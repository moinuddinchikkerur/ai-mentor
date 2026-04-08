import { useNavigate, useLocation } from "react-router-dom";
import {
  FaComments,
  FaQuestionCircle,
  FaCheckCircle,
  FaBook,
  FaGamepad,
  FaChartBar,
  FaUserTie
} from "react-icons/fa";

import Profile from "./Profile";

function Sidebar() {

  const navigate = useNavigate();
  const location = useLocation();

  const menuItem = (path, icon, label) => (
    <div
      onClick={() => navigate(path)}
      className={`sidebar-item ${
        location.pathname === path ? "active" : ""
      }`}
    >
      <div className="sidebar-icon">{icon}</div>
      <span>{label}</span>
    </div>
  );

  return (
    <div className="sidebar">

      {/* ===== TOP SECTION ===== */}
      <div className="sidebar-top">

        <h2 className="logo">🎓 AI Mentor</h2>

        {/* ✅ PROFILE (clickable → go to profile page) */}
        <div 
          onClick={() => navigate("/profile")} 
          style={{ cursor: "pointer" }}
        >
          <Profile />
        </div>

      </div>

      {/* ===== MENU SECTION ===== */}
      <div className="sidebar-middle">

        <div className="sidebar-group">
          <p className="sidebar-heading">AI Tools</p>

          {menuItem("/chat", <FaComments />, "AI Chat")}
          {menuItem("/mcq", <FaQuestionCircle />, "MCQ Generator")}
          {menuItem("/evaluate", <FaCheckCircle />, "Answer Checker")}
          {menuItem("/planner", <FaBook />, "Study Planner")}
          {menuItem("/game", <FaGamepad />, "Gamification")}
          {menuItem("/career", <FaUserTie />, "Career AI")}
        </div>

        <div className="sidebar-group">
          <p className="sidebar-heading">Reports</p>

          {menuItem("/report", <FaChartBar />, "Weekly Report")}
          {menuItem("/analytics", <FaChartBar />, "Analytics")}
        </div>

        {/* ❌ REMOVED ACCOUNT SECTION */}

      </div>

    </div>
  );
}

export default Sidebar;