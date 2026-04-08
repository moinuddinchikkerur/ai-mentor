// import { useState, useEffect } from "react";
// import axios from "axios";
// import "../main.css";

// function Evaluate() {

//   const [chatId, setChatId] = useState(Date.now().toString());
//   const [question, setQuestion] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [result, setResult] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [chats, setChats] = useState([]);

//   /* ======================
//      Load Chat History
//   ====================== */

//   useEffect(() => {
//     loadChats();
//   }, []);

//   const loadChats = async () => {

//     try {

//       const res = await axios.get(
//         "http://localhost:5000/api/ai/chats"
//       );

//       setChats(res.data || []);

//     } catch (error) {

//       console.error("❌ Failed to load chats", error);

//     }

//   };

//   /* ======================
//      Load Single Chat
//   ====================== */

//   const loadChat = async (id) => {

//     try {

//       const res = await axios.get(
//         `http://localhost:5000/api/ai/chat/${id}`
//       );

//       if (!res.data || res.data.length === 0) return;

//       const last = res.data[res.data.length - 1];

//       setChatId(id);
//       setQuestion(last.question);
//       setAnswer(last.answer);
//       setResult(last.result);

//     } catch (error) {

//       console.error("❌ Failed to load chat", error);

//     }

//   };

//   /* ======================
//      Evaluate Answer
//   ====================== */

//   const evaluate = async () => {

//     if (!question || !answer) {
//       alert("Please enter question and answer");
//       return;
//     }

//     setLoading(true);
//     setResult("");

//     try {

//       const res = await axios.post(
//         "http://localhost:5000/api/ai/evaluate",
//         {
//           chatId,
//           question,
//           answer
//         }
//       );

//       setResult(res.data.result || "No response");

//       loadChats();

//     } catch (error) {

//       console.error("❌ Evaluation error:", error);

//       setResult("❌ Evaluation failed");

//     }

//     setLoading(false);

//   };

//   /* ======================
//      New Chat
//   ====================== */

//   const newChat = () => {

//     setChatId(Date.now().toString());
//     setQuestion("");
//     setAnswer("");
//     setResult("");

//   };

//   /* ======================
//      Delete Chat
//   ====================== */

//   const deleteChat = async (id) => {

//     try {

//       await axios.delete(
//         `http://localhost:5000/api/ai/chat/${id}`
//       );

//       loadChats();

//       if (chatId === id) {
//         newChat();
//       }

//     } catch (error) {

//       console.error("❌ Delete failed", error);

//     }

//   };

//   /* ======================
//      UI
//   ====================== */

//   return (

//     <div className="ev-container">

//       {/* SIDEBAR */}

//       <div className="ev-history">

//         <button
//           className="new-chat-btn"
//           onClick={newChat}
//         >
//           ➕ New Chat
//         </button>

//         <h3>Chats</h3>

//         {chats.length === 0 && (
//           <p className="no-history">
//             No history yet
//           </p>
//         )}

//         {chats.map((chat) => (

//           <div
//             key={chat._id}
//             className="history-card"
//           >

//             <div
//               className="history-title"
//               onClick={() => loadChat(chat._id)}
//             >
//               {chat.lastQuestion
//                 ? chat.lastQuestion.substring(0, 50)
//                 : "Untitled Chat"}
//             </div>

//             <button
//               className="delete-btn"
//               onClick={() => deleteChat(chat._id)}
//             >
//               🗑
//             </button>

//           </div>

//         ))}

//       </div>


//       {/* MAIN PANEL */}

//       <div className="ev2">

//         <h2 className="ev-title">
//           📝 Answer Evaluator
//         </h2>

//         <div className="ev-group">

//           <label>Question</label>

//           <textarea
//             className="ev-input"
//             placeholder="Enter your question..."
//             value={question}
//             onChange={(e) =>
//               setQuestion(e.target.value)
//             }
//           />

//         </div>

//         <div className="ev-group">

//           <label>Your Answer</label>

//           <textarea
//             className="ev-input"
//             placeholder="Enter your answer..."
//             value={answer}
//             onChange={(e) =>
//               setAnswer(e.target.value)
//             }
//           />

//         </div>

//         <button
//           className="ev-btn"
//           onClick={evaluate}
//           disabled={loading}
//         >

//           {loading
//             ? "Evaluating..."
//             : "Evaluate Answer"}

//         </button>

//         {result && (

//           <div className="ev-result">
//             {result}
//           </div>

//         )}

//       </div>

//     </div>

//   );

// }

// export default Evaluate;




import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";   // ⭐ add this
import axios from "axios";
import "../main.css";

function Evaluate() {

  const navigate = useNavigate();   // ⭐ navigation

  const [chatId, setChatId] = useState(Date.now().toString());
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/ai/chats"
      );

      setChats(res.data || []);

    } catch (error) {

      console.error("❌ Failed to load chats", error);

    }

  };

  const loadChat = async (id) => {

    try {

      const res = await axios.get(
        `http://localhost:5000/api/ai/chat/${id}`
      );

      if (!res.data || res.data.length === 0) return;

      const last = res.data[res.data.length - 1];

      setChatId(id);
      setQuestion(last.question);
      setAnswer(last.answer);
      setResult(last.result);

    } catch (error) {

      console.error("❌ Failed to load chat", error);

    }

  };

  const evaluate = async () => {

    if (!question || !answer) {
      alert("Please enter question and answer");
      return;
    }

    setLoading(true);
    setResult("");

    try {

      const res = await axios.post(
        "http://localhost:5000/api/ai/evaluate",
        {
          chatId,
          question,
          answer
        }
      );

      setResult(res.data.result || "No response");

      loadChats();

    } catch (error) {

      console.error("❌ Evaluation error:", error);

      setResult("❌ Evaluation failed");

    }

    setLoading(false);

  };

  const newChat = () => {

    setChatId(Date.now().toString());
    setQuestion("");
    setAnswer("");
    setResult("");

  };

  const deleteChat = async (id) => {

    try {

      await axios.delete(
        `http://localhost:5000/api/ai/chat/${id}`
      );

      loadChats();

      if (chatId === id) {
        newChat();
      }

    } catch (error) {

      console.error("❌ Delete failed", error);

    }

  };

  return (

    <div className="ev-container">

      {/* SIDEBAR */}

      <div className="ev-history">

        <button
          className="new-chat-btn"
          onClick={newChat}
        >
          ➕ New Chat
        </button>

        <h3>Chats</h3>

        {chats.length === 0 && (
          <p className="no-history">
            No history yet
          </p>
        )}

        {chats.map((chat) => (

          <div
            key={chat._id}
            className="history-card"
          >

            <div
              className="history-title"
              onClick={() => loadChat(chat._id)}
            >
              {chat.lastQuestion
                ? chat.lastQuestion.substring(0, 50)
                : "Untitled Chat"}
            </div>

            <button
              className="delete-btn"
              onClick={() => deleteChat(chat._id)}
            >
              🗑
            </button>

          </div>

        ))}

      </div>

      {/* MAIN PANEL */}

      <div className="ev2">

        {/* ⭐ BACK BUTTON */}
        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ⬅ Back to Dashboard
        </button>

        <h2 className="ev-title">
          📝 Answer Evaluator
        </h2>

        <div className="ev-group">

          <label>Question</label>

          <textarea
            className="ev-input"
            placeholder="Enter your question..."
            value={question}
            onChange={(e) =>
              setQuestion(e.target.value)
            }
          />

        </div>

        <div className="ev-group">

          <label>Your Answer</label>

          <textarea
            className="ev-input"
            placeholder="Enter your answer..."
            value={answer}
            onChange={(e) =>
              setAnswer(e.target.value)
            }
          />

        </div>

        <button
          className="ev-btn"
          onClick={evaluate}
          disabled={loading}
        >

          {loading
            ? "Evaluating..."
            : "Evaluate Answer"}

        </button>

        {result && (

          <div className="ev-result">
            {result}
          </div>

        )}

      </div>

    </div>

  );

}

export default Evaluate;