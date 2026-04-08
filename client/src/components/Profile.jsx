import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCog, FaSignOutAlt } from "react-icons/fa";
import "../main.css";

function Profile() {

  const [user, setUser] = useState({
    name: "",
    email: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");

    if (name && email) {
      setUser({ name, email });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!user.name || !user.email) return null;

  const firstLetter = user.name.charAt(0).toUpperCase();

  return (
    <div className="profile-container">

      {/* Avatar */}
      <div className="profile-avatar">
        {firstLetter}
      </div>

      {/* Details */}
      <div className="profile-details">
        <p className="profile-name">{user.name}</p>
        <p className="profile-email">{user.email}</p>

        <div className="profile-status">
          <span className="status-dot"></span>
          Active
        </div>
      </div>

      {/* Actions */}
      <div className="profile-actions-side">

        {/* Settings / Profile */}
        <button
          className="icon-btn"
          onClick={() => navigate("/profile")}
          title="Profile Settings"
        >
          <FaCog />
        </button>

        {/* Logout */}
        <button
          className="icon-btn logout-icon"
          onClick={handleLogout}
          title="Logout"
        >
          <FaSignOutAlt />
        </button>

      </div>

    </div>
  );
}

export default Profile;