




// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { authService, saveAuthData } from "../services/api";
// import "../main.css";

// function Login() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [form, setForm] = useState({
//     email: location.state?.email || "",
//     password: ""
//   });

//   const [message, setMessage] = useState("");
//   const [type, setType] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (location.state?.registered) {
//       setType("success");
//       setMessage("Registration successful. Please login.");
//     }
//   }, [location.state]);

//   const change = (e) => {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.value
//     });
//   };

//   const submit = async (e) => {
//     e.preventDefault();

//     setMessage("");
//     setType("");
//     setLoading(true);

//     try {
//       const res = await authService.login({
//         email: form.email.trim().toLowerCase(),
//         password: form.password
//       });

//       if (!res.data?.token || !res.data?.user) {
//         throw new Error("Invalid login response");
//       }

//       saveAuthData({
//         token: res.data.token,
//         user: res.data.user
//       });

//       setType("success");
//       setMessage("Login Successful");

//       setTimeout(() => {
//         navigate("/dashboard", { replace: true });
//       }, 600);
//     } catch (err) {
//       setType("error");
//       setMessage(
//         err.response?.data?.message ||
//           err.message ||
//           "Invalid email or password"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="lo1">
//       {message && (
//         <div className={`lo-toast ${type}`}>
//           {message}
//         </div>
//       )}

//       <div className="lo2">
//         <div className="lo-card">
//           <h2 className="lo-title">Welcome Back</h2>
//           <p className="lo-sub">Login to continue</p>

//           <form onSubmit={submit} className="lo-form">
//             <input
//               className="lo-input"
//               name="email"
//               type="email"
//               placeholder="Email Address"
//               value={form.email}
//               onChange={change}
//               autoComplete="email"
//               required
//             />

//             <input
//               className="lo-input"
//               name="password"
//               type="password"
//               placeholder="Password"
//               value={form.password}
//               onChange={change}
//               autoComplete="current-password"
//               required
//             />

//             <button
//               type="submit"
//               className="lo-btn"
//               disabled={loading}
//             >
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </form>

//           <p
//             className="lo-register"
//             onClick={() => navigate("/")}
//           >
//             New here? <span>Create Account</span>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;



import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService, saveAuthData } from "../services/api";
import "../main.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: location.state?.email || "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.registered) {
      setType("success");
      setMessage("Registration successful. Please login.");
    }
  }, [location.state]);

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
      const res = await authService.login({
        email: form.email.trim().toLowerCase(),
        password: form.password
      });

      if (!res.data?.token || !res.data?.user) {
        throw new Error("Invalid login response");
      }

      saveAuthData({
        token: res.data.token,
        user: res.data.user
      });

      setType("success");
      setMessage("Login Successful");

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 600);
    } catch (err) {
      setType("error");
      setMessage(
        err.response?.data?.message ||
          err.message ||
          "Invalid email or password"
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
          <h2 className="lo-title">Welcome Back</h2>
          <p className="lo-sub">Login to continue</p>

          <form onSubmit={submit} className="lo-form">
            <input
              className="lo-input"
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={change}
              autoComplete="email"
              required
            />

            <input
              className="lo-input"
              name="password"
              type="password"
              placeholder="Password"
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
              {loading ? "Logging in..." : "Login"}
            </button>

            <button
              type="button"
              className="lo-btn lo-admin-btn"
              onClick={() => navigate("/admin-login")}
            >
              Admin Login
            </button>
          </form>

          <p
            className="lo-register"
            onClick={() => navigate("/")}
          >
            New here? <span>Create Account</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
