




import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import "../main.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
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
      const email = form.email.trim().toLowerCase();

      const res = await authService.register({
        name: form.name.trim(),
        email,
        password: form.password
      });

      setType("success");
      setMessage(res.data?.message || "Registered Successfully");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            email,
            registered: true
          }
        });
      }, 700);
    } catch (err) {
      setType("error");
      setMessage(
        err.response?.data?.message ||
          err.message ||
          "Register failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="re1">
      {message && (
        <div className={`lo-toast ${type}`}>
          {message}
        </div>
      )}

      <div className="re2">
        <div className="re-card">
          <h2 className="re-title">Create Account</h2>
          <p className="re-sub">Start your journey with us</p>

          <form onSubmit={submit} className="re-form">
            <input
              className="re-input"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={change}
              autoComplete="name"
              required
            />

            <input
              className="re-input"
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={change}
              autoComplete="email"
              required
            />

            <input
              className="re-input"
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={change}
              autoComplete="new-password"
              minLength="6"
              required
            />

            <button
              type="submit"
              className="re-btn"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p
            className="re-login"
            onClick={() => navigate("/login")}
          >
            Already have an account? <span>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
