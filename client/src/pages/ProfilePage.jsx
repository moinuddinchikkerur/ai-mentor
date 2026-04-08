import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "../main.css";

function ProfilePage() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");

    if (name && email) {
      setFormData({
        name,
        email,
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    const storedPassword = localStorage.getItem("password");

    if (formData.oldPassword !== storedPassword) {
      alert("❌ Old password incorrect");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert("❌ Passwords do not match");
      return;
    }

    localStorage.setItem("name", formData.name);
    localStorage.setItem("email", formData.email);

    if (formData.newPassword) {
      localStorage.setItem("password", formData.newPassword);
    }

    alert("✅ Profile Updated");
  };

  const firstLetter = formData.name
    ? formData.name.charAt(0).toUpperCase()
    : "?";

  return (
    <div className="profile-wrapper">

      <div className="profile-card-pro">

        {/* 🔙 BACK BUTTON */}
        <div className="profile-back">
          <button onClick={() => navigate("/dashboard")}>
            <FaArrowLeft />
          </button>
        </div>

        {/* HEADER */}
        <div className="profile-header">
          <div className="profile-avatar-pro">{firstLetter}</div>
          <h2>Profile Settings</h2>
          <p>Manage your account details</p>
        </div>

        {/* FORM */}
        <div className="profile-form-pro">

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Old Password</label>
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* SAVE BUTTON */}
        <div className="profile-actions-pro">
          <button onClick={handleSave} className="save-btn-pro">
            Save Changes
          </button>
        </div>

      </div>

    </div>
  );
}

export default ProfilePage;