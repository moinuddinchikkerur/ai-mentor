import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService, saveAuthData } from "../services/api";
import "../main.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);

  const change = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    setMessage("");
    setType("");
    setLoading(true);

    try {
      const res = await authService.adminLogin({
        email: form.email.trim().toLowerCase(),
        password: form.password
      });

      if (!res.data?.token || !res.data?.user) {
        throw new Error("Invalid admin login response");
      }

      saveAuthData({
        token: res.data.token,
        user: res.data.user
      });

      setType("success");
      setMessage("Admin Login Successful");

      setTimeout(() => {
        navigate("/admin", { replace: true });
      }, 600);
    } catch (err) {
      setType("error");
      setMessage(
        err.response?.data?.message ||
          err.message ||
          "Invalid admin email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lo1">
      {message && (
        <div className={`lo-toast ${type}`}>
          {message}
        </div>
      )}

      <div className="lo2">
        <div className="lo-card">
          <h2 className="lo-title">Admin Login</h2>
          <p className="lo-sub">Login to manage AI Mentor</p>

          <form onSubmit={submit} className="lo-form">
            <input
              className="lo-input"
              name="email"
              type="email"
              placeholder="Admin Email Address"
              value={form.email}
              onChange={change}
              autoComplete="email"
              required
            />

            <input
              className="lo-input"
              name="password"
              type="password"
              placeholder="Admin Password"
              value={form.password}
              onChange={change}
              autoComplete="current-password"
              required
            />

            <button
              type="submit"
              className="lo-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Admin Login"}
            </button>
          </form>

          <p
            className="lo-register"
            onClick={() => navigate("/login")}
          >
            Student? <span>Go to Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
