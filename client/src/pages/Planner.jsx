// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "../main.css";

// function Planner() {

//   const navigate = useNavigate();

//   const [subjects, setSubjects] = useState("");
//   const [days, setDays] = useState(0);
//   const [plan, setPlan] = useState(null);
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [activeId, setActiveId] = useState(null);

//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     fetchHistory();
//   }, []);

//   const fetchHistory = async () => {
//     try {
//       const res = await axios.get(
//         "http://localhost:5000/api/study/history",
//         {
//           headers: { Authorization: `Bearer ${token}` }
//         }
//       );
//       setHistory(res.data.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const makePlan = async () => {

//     const totalDays = parseInt(days);

//     if (!subjects.trim()) return alert("Enter subjects");
//     if (!totalDays || totalDays <= 0 || totalDays > 60)
//       return alert("Enter valid days");

//     setLoading(true);
//     setPlan(null);

//     try {
//       const res = await axios.post(
//         "http://localhost:5000/api/ai/plan",
//         { subjects, days: totalDays }
//       );

//       let receivedPlan = res.data.plan;

//       if (typeof receivedPlan === "string") {
//         receivedPlan = JSON.parse(receivedPlan);
//       }

//       console.log("🔥 PLAN DATA:", receivedPlan);

//       setPlan(receivedPlan);

//       // 🔥 SAVE PLAN
//       await axios.post(
//         "http://localhost:5000/api/study/save",
//         {
//           subjects: subjects.split(",").map(s => s.trim()),
//           days: totalDays,
//           plan: receivedPlan
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` }
//         }
//       );

//       fetchHistory();

     

//     } catch (err) {
//       console.error(err);
//       alert("Error generating plan");
//     }

//     setLoading(false);
//   };

//   const deletePlan = async (id) => {
//     await axios.delete(
//       `http://localhost:5000/api/study/${id}`,
//       {
//         headers: { Authorization: `Bearer ${token}` }
//       }
//     );
//     fetchHistory();
//   };

//   const timeOrder = [
//     "9:00-10:00",
//     "10:00-11:00",
//     "11:00-12:00",
//     "12:00-1:00",
//     "1:00-2:00",
//     "2:00-3:00",
//     "3:00-4:00",
//     "4:00-5:00"
//   ];

//   return (

//     <div className="pr-layout">

//       {/* SIDEBAR */}
//       <div className="pr-sidebar">

//         <h3 className="pr-logo">AI Mentor</h3>

//         <button
//           className="pr-new-btn"
//           onClick={() => {
//             setPlan(null);
//             setActiveId(null);
//           }}
//         >
//           + New Plan
//         </button>

//         <div className="pr-history-list">
//           {history.map((item) => (
//             <div
//               key={item._id}
//               className={`pr-sidebar-item ${activeId === item._id ? "pr-active" : ""}`}
//             >

//               <div
//                 className="pr-history-text"
//                 onClick={() => {
//                   setPlan(item.plan);
//                   setActiveId(item._id);
//                 }}
//               >
//                 <div className="pr-title">
//                   {item.subjects.join(", ")}
//                 </div>
//                 <div className="pr-date">
//                   {new Date(item.createdAt).toLocaleString()}
//                 </div>
//               </div>

//               <button
//                 className="pr-delete-btn"
//                 onClick={() => deletePlan(item._id)}
//               >
//                 ✕
//               </button>

//             </div>
//           ))}
//         </div>

//       </div>

//       {/* MAIN */}
//       <div className="pr-main">

//         <div className="pr-panel">

//           {/* HEADER */}
//           <div className="pr-header">

//             <button
//               className="pr-back-btn"
//               onClick={() => navigate("/dashboard")}
//             >
//               ← Back
//             </button>

//             <h2 className="pr-page-title">Study Planner</h2>

//           </div>

//           {/* FORM */}
//           <div className="pr-form">

//             <div className="pr-field">
//               <label>Subjects</label>
//               <input
//                 className="pr-input"
//                 placeholder="Subjects (DBMS, OS, CN...)"
//                 value={subjects}
//                 onChange={(e) => setSubjects(e.target.value)}
//               />
//             </div>

//             <div className="pr-field">
//               <label>Days</label>
//               <input
//                 type="number"
//                 className="pr-input"
//                 value={days}
//                 onChange={(e) => setDays(parseInt(e.target.value) || 0)}
//               />
//             </div>

//             <button
//               className="pr-generate-btn full"
//               onClick={makePlan}
//             >
//               {loading ? "Generating..." : "Generate Study Plan"}
//             </button>

//           </div>

//           {/* TABLE */}
//           {plan && (
//             <div className="pr-table-container">

//               <table className="pr-table">

//                 <thead>
//                   <tr>
//                     <th>Day / Time</th>
//                     <th>9-10</th>
//                     <th>10-11</th>
//                     <th>11-12</th>
//                     <th>12-1</th>
//                     <th>1-2</th>
//                     <th>2-3</th>
//                     <th>3-4</th>
//                     <th>4-5</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {Object.entries(plan).map(([day, slots]) => (
//                     <tr key={day}>
//                       <td className="day-col">{day}</td>

//                       {timeOrder.map((time, i) => (
//                         <td
//                           key={i}
//                           className={slots[time] === "Break" ? "break-cell" : ""}
//                         >
//                           {slots[time]}
//                         </td>
//                       ))}

//                     </tr>
//                   ))}
//                 </tbody>

//               </table>

//             </div>
//           )}

//         </div>

//       </div>

//     </div>
//   );
// }

// export default Planner;









import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../main.css";

function Planner() {

  const navigate = useNavigate();

  const [title, setTitle] = useState(""); // ✅ NEW
  const [subjects, setSubjects] = useState("");
  const [plan, setPlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/study/history",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setHistory(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const makePlan = async () => {

    if (!subjects.trim()) return alert("Enter subjects");

    setLoading(true);
    setPlan(null);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai/plan",
        { subjects }
      );

      let receivedPlan = res.data.plan;

      if (typeof receivedPlan === "string") {
        receivedPlan = JSON.parse(receivedPlan);
      }

      setPlan(receivedPlan);

      await axios.post(
        "http://localhost:5000/api/study/save",
        {
          title,
          subjects: subjects.split(",").map(s => s.trim()),
          plan: receivedPlan
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchHistory();

    } catch (err) {
      console.error(err);
      alert("Error generating plan");
    }

    setLoading(false);
  };

  const deletePlan = async (id) => {
    await axios.delete(
      `http://localhost:5000/api/study/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    fetchHistory();
  };

  const timeOrder = [
    "9:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:00-1:00",
    "1:00-2:00",
    "2:00-3:00",
    "3:00-4:00",
    "4:00-5:00"
  ];

  return (

    <div className="pr-layout">

      {/* SIDEBAR */}
      <div className="pr-sidebar">

        <h3 className="pr-logo">AI Mentor</h3>

        <button
          className="pr-new-btn"
          onClick={() => {
            setPlan(null);
            setActiveId(null);
          }}
        >
          + New Plan
        </button>

        <div className="pr-history-list">
          {history.map((item) => (
            <div
              key={item._id}
              className={`pr-sidebar-item ${activeId === item._id ? "pr-active" : ""}`}
            >

              <div
                className="pr-history-text"
                onClick={() => {
                  setPlan(item.plan);
                  setActiveId(item._id);
                }}
              >
                <div className="pr-title">
                  {item.title || item.subjects.join(", ")}
                </div>
                <div className="pr-date">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>

              <button
                className="pr-delete-btn"
                onClick={() => deletePlan(item._id)}
              >
                ✕
              </button>

            </div>
          ))}
        </div>

      </div>

      {/* MAIN */}
      <div className="pr-main">

        <div className="pr-panel">

          {/* HEADER */}
          <div className="pr-header">

            <button
              className="pr-back-btn"
              onClick={() => navigate("/dashboard")}
            >
              ← Back
            </button>

            <h2 className="pr-page-title">Study Planner</h2>

          </div>

          {/* FORM */}
          <div className="pr-form">

            {/* 🔥 TITLE INPUT */}
            <div className="pr-field">
              <label>Plan Title</label>
              <input
                className="pr-input"
                placeholder="Enter plan title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="pr-field">
              <label>Subjects</label>
              <input
                className="pr-input"
                placeholder="Subjects (DBMS, OS, CN...)"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
              />
            </div>

            <button
              className="pr-generate-btn full"
              onClick={makePlan}
            >
              {loading ? "Generating..." : "Generate Study Plan"}
            </button>

          </div>

          {/* TABLE */}
          {plan && (
            <div className="pr-table-container">

              <h3 className="pr-table-title">
                📅 {title || "Weekly Study Plan"}
              </h3>

              <table className="pr-table">

                <thead>
                  <tr>
                    <th>Day / Time</th>
                    <th>9-10</th>
                    <th>10-11</th>
                    <th>11-12</th>
                    <th>12-1</th>
                    <th>1-2</th>
                    <th>2-3</th>
                    <th>3-4</th>
                    <th>4-5</th>
                  </tr>
                </thead>

                <tbody>
                  {Object.entries(plan).map(([day, slots]) => (
                    <tr key={day}>
                      <td className="day-col">{day}</td>

                      {timeOrder.map((time, i) => (
                        <td
                          key={i}
                          className={slots[time] === "Break" ? "break-cell" : ""}
                        >
                          {slots[time]}
                        </td>
                      ))}

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Planner;