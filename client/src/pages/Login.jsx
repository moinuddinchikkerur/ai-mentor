// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "../main.css";

// function Login() {

//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     email: "",
//     password: ""
//   });

//   const [message, setMessage] = useState("");
//   const [type, setType] = useState(""); // success / error

//   const change = (e) => {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.value
//     });
//   };

//   const submit = async (e) => {
//     e.preventDefault();

//     setMessage(""); // clear old msg

//     try {

//       const res = await axios.post(
//         "http://localhost:5000/api/auth/login",
//         form
//       );

//       localStorage.setItem("token", res.data.token);

//       // SUCCESS MESSAGE
//       setType("success");
//       setMessage("Login Successful ✅");

//       setTimeout(() => {
//         navigate("/dashboard");
//       }, 2000);

//     } catch (err) {

//       // ERROR MESSAGE
//       setType("error");
//       setMessage("Invalid Email or Password ❌");
//     }
//   };

//   return (

//     <div className="lo1">

//       {/* CUSTOM POPUP */}
//       {message && (
//         <div className={`lo-toast ${type}`}>
//           {message}
//         </div>
//       )}

//       <div className="lo2">

//         <div className="lo-card">

//           <h2 className="lo-title">Welcome Back</h2>
//           <p className="lo-sub">Login to continue 🚀</p>

//           <form onSubmit={submit} className="lo-form">

//             <input
//               className="lo-input"
//               name="email"
//               type="email"
//               placeholder="Email Address"
//               onChange={change}
//               required
//             />

//             <input
//               className="lo-input"
//               name="password"
//               type="password"
//               placeholder="Password"
//               onChange={change}
//               required
//             />

//             <button className="lo-btn">
//               Login
//             </button>

//           </form>

//           <p
//             className="lo-register"
//             onClick={() => navigate("/register")}
//           >
//             New here? <span>Create Account</span>
//           </p>

//         </div>

//       </div>

//     </div>
//   );
// }

// export default Login;










import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../main.css";

function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [type, setType] = useState(""); // success | error
  const [loading, setLoading] = useState(false);

  /* =====================
     Handle Input Change
  ===================== */
  const change = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  /* =====================
     Handle Login Submit
  ===================== */
  const submit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );

      // ✅ STORE EVERYTHING FOR PROFILE
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.user.name);
      localStorage.setItem("email", res.data.user.email);

      setType("success");
      setMessage("Login Successful ✅");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (err) {

      setType("error");
      setMessage(
        err.response?.data?.message ||
        "Invalid Email or Password ❌"
      );

    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="lo1">

      {/* Toast Message */}
      {message && (
        <div className={`lo-toast ${type}`}>
          {message}
        </div>
      )}

      <div className="lo2">

        <div className="lo-card">

          <h2 className="lo-title">Welcome Back</h2>
          <p className="lo-sub">Login to continue 🚀</p>

          <form onSubmit={submit} className="lo-form">

            <input
              className="lo-input"
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={change}
              required
            />

            <input
              className="lo-input"
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={change}
              required
            />

            <button
              type="submit"
              className="lo-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          <p
            className="lo-register"
            onClick={() => navigate("/register")}
          >
            New here? <span>Create Account</span>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;