


import { useLocation, useNavigate } from "react-router-dom";
import {
  FaBook,
  FaChartBar,
  FaCheckCircle,
  FaComments,
  FaEye,
  FaGamepad,
  FaQuestionCircle,
  FaUserTie
} from "react-icons/fa";

import Profile from "./Profile";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItem = (path, icon, label) => (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(path)}
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate(path);
      }}
      className={`sidebar-item ${location.pathname === path ? "active" : ""}`}
    >
      <div className="sidebar-icon">{icon}</div>
      <span>{label}</span>
    </div>
  );

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <h2
          className="logo"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/dashboard")}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate("/dashboard");
          }}
        >
          MinTas
        </h2>

        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate("/profile")}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate("/profile");
          }}
          style={{ cursor: "pointer" }}
        >
          <Profile />
        </div>
      </div>

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
          {menuItem("/attention-report", <FaEye />, "Attention Report")}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;



