import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../main.css"; // Import CSS

function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const change = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        form
      );

      alert(res.data.msg);
      navigate("/");

    } catch (err) {
      alert("Register failed ❌");
    }
  };

  return (

    <div className="re1">

      <div className="re2">

        <div className="re-card">

          <h2 className="re-title">Create Account</h2>
          <p className="re-sub">Start your journey with us 🚀</p>

          <form onSubmit={submit} className="re-form">

            <input
              className="re-input"
              name="name"
              placeholder="Full Name"
              onChange={change}
              required
            />

            <input
              className="re-input"
              name="email"
              type="email"
              placeholder="Email Address"
              onChange={change}
              required
            />

            <input
              className="re-input"
              name="password"
              type="password"
              placeholder="Password"
              onChange={change}
              required
            />

            <button className="re-btn">
              Register
            </button>

          </form>

          <p
            className="re-login"
            onClick={() => navigate("/")}
          >
            Already have an account? <span>Login</span>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;