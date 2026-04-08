// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "../main.css";

// function CareerAI() {
//   const [interest, setInterest] = useState("");
//   const [skills, setSkills] = useState("");
//   const [education, setEducation] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const chatEndRef = useRef(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, loading]);

//   const getCareerGuide = async () => {
//     if (!interest) return alert("Enter interest");

//     const userMessage = `🎯 ${interest} | 🧠 ${skills} | 🎓 ${education}`;
//     setMessages((prev) => [...prev, { type: "user", text: userMessage }]);
//     setLoading(true);

//     try {
//       const token = localStorage.getItem("token");

//       const res = await axios.post(
//         "http://localhost:5000/api/career/guide",
//         { interest, skills, education },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setMessages((prev) => [
//         ...prev,
//         { type: "ai", text: res.data.guide || "No result" },
//       ]);
//     } catch {
//       setMessages((prev) => [
//         ...prev,
//         { type: "ai", text: "❌ Server error" },
//       ]);
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="cr2-container">

//       {/* HEADER */}
//       <div className="cr2-header">
//         🎯 Career AI Assistant
//       </div>

//       {/* CHAT */}
//       <div className="cr2-chat">

//         {messages.length === 0 && (
//           <div className="cr2-empty">
//             Start your career journey 🚀
//           </div>
//         )}

//         {messages.map((msg, i) => (
//           <div key={i} className={`cr2-msg ${msg.type}`}>
//             {msg.text.split("\n").map((line, j) => (
//               <p key={j}>{line}</p>
//             ))}
//           </div>
//         ))}

//         {loading && <div className="cr2-msg ai">Thinking...</div>}

//         <div ref={chatEndRef} />
//       </div>

//       {/* INPUT */}
//       <div className="cr2-input">
//         <input
//           placeholder="Interest..."
//           value={interest}
//           onChange={(e) => setInterest(e.target.value)}
//         />
//         <input
//           placeholder="Skills..."
//           value={skills}
//           onChange={(e) => setSkills(e.target.value)}
//         />
//         <input
//           placeholder="Education..."
//           value={education}
//           onChange={(e) => setEducation(e.target.value)}
//         />

//         <button onClick={getCareerGuide}>Send</button>
//       </div>

//       <button className="cr2-back" onClick={() => navigate("/dashboard")}>
//         ⬅ Back
//       </button>

//     </div>
//   );
// }

// export default CareerAI;











import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../main.css";

function CareerAI() {
  const [interest, setInterest] = useState("");
  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const getCareerGuide = async () => {
    if (!interest) return alert("Enter interest");

    const userMessage = `🎯 ${interest} | 🧠 ${skills} | 🎓 ${education}`;
    setMessages((prev) => [...prev, { type: "user", text: userMessage }]);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/career/guide",
        { interest, skills, education },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) => [
        ...prev,
        { type: "ai", text: res.data.guide || "No result" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { type: "ai", text: "❌ Server error" },
      ]);
    }

    setLoading(false);
  };
return (
  <div className="cr5-container">

    {/* HEADER */}
    <div className="cr5-header">
      <button className="cr5-back" onClick={() => navigate("/dashboard")}>
        ⬅ Back
      </button>
      <div className="cr5-title">🎯 Career AI Assistant</div>
    </div>

    {/* CENTER CARD */}
    <div className="cr5-center">

      <div className="cr5-card">

        <h2>Start your career journey 🚀</h2>

        <input
          placeholder="Interest..."
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
        />

        <input
          placeholder="Skills..."
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />

        <input
          placeholder="Education..."
          value={education}
          onChange={(e) => setEducation(e.target.value)}
        />

        <button onClick={getCareerGuide}>
          🚀 Generate Career
        </button>

      </div>

      {/* CHAT BELOW */}
      {messages.length > 0 && (
        <div className="cr5-chat">
          {messages.map((msg, i) => (
            <div key={i} className={`cr5-msg ${msg.type}`}>
              {msg.text}
            </div>
          ))}
        </div>
      )}

    </div>

  </div>
);
}

export default CareerAI;