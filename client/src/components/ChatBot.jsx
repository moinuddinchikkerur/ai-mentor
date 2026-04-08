// import { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "../main.css";

// function ChatBot() {

//   const navigate = useNavigate();
//   const endRef = useRef(null);

//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [sessions, setSessions] = useState([]);
//   const [active, setActive] = useState(null);


//   /* =========================
//      LOAD CHATS FROM DATABASE
//   ========================= */

//   useEffect(() => {
//     loadChats();
//   }, []);


//   const loadChats = async () => {
//     try {

//       const res = await axios.get("http://localhost:5000/api/chat");

//       if (res.data.success) {
//         setSessions(res.data.chats);
//       }

//     } catch (err) {
//       console.error("Load chat error:", err);
//     }
//   };


//   /* =========================
//      AUTO SCROLL
//   ========================= */

//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [sessions, active, loading]);


//   /* =========================
//      CREATE NEW CHAT
//   ========================= */

//   const newChat = async () => {

//     try {

//       const res = await axios.post(
//         "http://localhost:5000/api/chat/new"
//       );

//       if (res.data.success) {

//         const newSession = res.data.chat;

//         setSessions((prev) => [newSession, ...prev]);

//         setActive(newSession._id);

//       }

//     } catch (err) {
//       console.error("New chat error:", err);
//     }

//   };


//   /* =========================
//      SEND MESSAGE
//   ========================= */

//   const sendMessage = async () => {

//     if (!message.trim() || loading || active === null) return;

//     setLoading(true);

//     const userMsg = {
//       role: "user",
//       content: message
//     };

//     /* Update UI immediately */

//     setSessions((prev) =>
//       prev.map((s) =>
//         s._id === active
//           ? { ...s, messages: [...s.messages, userMsg] }
//           : s
//       )
//     );

//     try {

//       const res = await axios.post(
//         "http://localhost:5000/api/chat/message",
//         {
//           chatId: active,
//           message: message
//         }
//       );

//       const botMsg = {
//         role: "ai",
//         content: res.data.reply || "AI error"
//       };

//       setSessions((prev) =>
//         prev.map((s) =>
//           s._id === active
//             ? { ...s, messages: [...s.messages, botMsg] }
//             : s
//         )
//       );

//     } catch (err) {

//       console.error("Chat error:", err);

//       const errorMsg = {
//         role: "ai",
//         content: "Server error ❌"
//       };

//       setSessions((prev) =>
//         prev.map((s) =>
//           s._id === active
//             ? { ...s, messages: [...s.messages, errorMsg] }
//             : s
//         )
//       );

//     } finally {

//       setLoading(false);
//       setMessage("");

//     }

//   };


//   /* =========================
//      CURRENT CHAT
//   ========================= */

//   const currentChat =
//     sessions.find((s) => s._id === active)?.messages || [];


//   return (

//     <div className="cb-app">

//       {/* =========================
//           SIDEBAR
//       ========================= */}

//       <div className="cb-side">

//         <h3>🤖 AI Mentor</h3>

//         <button className="cb-new" onClick={newChat}>
//           + New Chat
//         </button>

//         <div className="cb-history">

//           {sessions.length === 0 && (
//             <p className="cb-empty">
//               No chats yet
//             </p>
//           )}

//           {sessions.map((s) => (
//             <div
//               key={s._id}
//               className={
//                 active === s._id
//                   ? "cb-item active"
//                   : "cb-item"
//               }
//               onClick={() => setActive(s._id)}
//             >
//               💬 {s.title}
//             </div>
//           ))}

//         </div>

//       </div>


//       {/* =========================
//           MAIN CHAT
//       ========================= */}

//       <div className="cb-main">

//         {/* TOP BAR */}

//         <div className="cb-top">

//           <span>AI Exam Mentor</span>

//           <button
//             onClick={() => navigate("/dashboard")}
//           >
//             Dashboard
//           </button>

//         </div>


//         {/* CHAT BODY */}

//         <div className="cb-body">

//           {active === null && (
//             <div className="cb-welcome">
//               <h2>Start New Chat 👋</h2>
//               <p>Click "New Chat" to begin</p>
//             </div>
//           )}

//           {currentChat.map((c, i) => (
//             <div
//               key={i}
//               className={
//                 c.role === "user"
//                   ? "cb-row user"
//                   : "cb-row bot"
//               }
//             >

//               <div className="cb-avatar">
//                 {c.role === "user" ? "👤" : "🤖"}
//               </div>

//               <div className="cb-bubble">
//                 {c.content}
//               </div>

//             </div>
//           ))}

//           {loading && (
//             <div className="cb-row bot">
//               <div className="cb-avatar">🤖</div>
//               <div className="cb-bubble typing">
//                 Thinking...
//               </div>
//             </div>
//           )}

//           <div ref={endRef}></div>

//         </div>


//         {/* INPUT */}

//         <div className="cb-bottom">

//           <input
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder="Type your question..."
//             disabled={loading || active === null}
//             onKeyDown={(e) => {
//               if (e.key === "Enter") sendMessage();
//             }}
//           />

//           <button
//             onClick={sendMessage}
//             disabled={loading || active === null}
//           >
//             Send
//           </button>

//         </div>

//       </div>

//     </div>

//   );

// }

// export default ChatBot;






import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../main.css";

function ChatBot() {

  const navigate = useNavigate();
  const endRef = useRef(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);


  /* =========================
     LOAD CHATS
  ========================= */

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {

    try {

      const res = await axios.get("http://localhost:5000/api/chat");

      if (res.data.success) {

        setSessions(res.data.chats);

        if(res.data.chats.length > 0){
          setActive(res.data.chats[0]._id);
        }

      }

    } catch (err) {

      console.error("Load chat error:", err);

    }

  };


  /* =========================
     AUTO SCROLL
  ========================= */

  useEffect(() => {

    endRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [sessions, active, loading]);


  /* =========================
     CREATE NEW CHAT
  ========================= */

  const newChat = async () => {

    try {

      const res = await axios.post(
        "http://localhost:5000/api/chat/new"
      );

      if (res.data.success) {

        const newSession = res.data.chat;

        setSessions((prev) => [newSession, ...prev]);

        setActive(newSession._id);

      }

    } catch (err) {

      console.error("New chat error:", err);

    }

  };


  /* =========================
     DELETE CHAT
  ========================= */

  const deleteChat = async (id) => {

    try {

      await axios.delete(
        `http://localhost:5000/api/chat/${id}`
      );

      const updated = sessions.filter(c => c._id !== id);

      setSessions(updated);

      if(active === id){
        setActive(null);
      }

    } catch (err) {

      console.error("Delete chat error", err);

    }

  };


  /* =========================
     SEND MESSAGE
  ========================= */

  const sendMessage = async () => {

    if (!message.trim() || loading || active === null) return;

    setLoading(true);

    const userMsg = {
      role: "user",
      content: message
    };

    setSessions((prev) =>
      prev.map((s) =>
        s._id === active
          ? { ...s, messages: [...s.messages, userMsg] }
          : s
      )
    );

    try {

      const res = await axios.post(
        "http://localhost:5000/api/chat/message",
        {
          chatId: active,
          message: message
        }
      );

      const botMsg = {
        role: "ai",
        content: res.data.reply || "AI error"
      };

      setSessions((prev) =>
        prev.map((s) =>
          s._id === active
            ? { ...s, messages: [...s.messages, botMsg] }
            : s
        )
      );

    } catch (err) {

      console.error("Chat error:", err);

      const errorMsg = {
        role: "ai",
        content: "Server error ❌"
      };

      setSessions((prev) =>
        prev.map((s) =>
          s._id === active
            ? { ...s, messages: [...s.messages, errorMsg] }
            : s
        )
      );

    } finally {

      setLoading(false);
      setMessage("");

    }

  };


  /* =========================
     CURRENT CHAT
  ========================= */

  const currentChat =
    sessions.find((s) => s._id === active)?.messages || [];


  return (

    <div className="cb-app">

      {/* =========================
          SIDEBAR
      ========================= */}

      <div className="cb-side">

        <h3>🤖 AI Mentor</h3>

        <button
          className="cb-new"
          onClick={newChat}
        >
          + New Chat
        </button>

        <div className="cb-history">

          {sessions.length === 0 && (
            <p className="cb-empty">
              No chats yet
            </p>
          )}

          {sessions.map((s) => (

            <div
              key={s._id}
              className={
                active === s._id
                  ? "cb-item active"
                  : "cb-item"
              }
            >

              <span
                onClick={() => setActive(s._id)}
              >
                💬 {s.title}
              </span>

              <button
                className="delete-btn"
                onClick={(e)=>{
                  e.stopPropagation();
                  deleteChat(s._id);
                }}
              >
                🗑
              </button>

            </div>

          ))}

        </div>

      </div>


      {/* =========================
          MAIN CHAT
      ========================= */}

      <div className="cb-main">

        {/* TOP BAR */}

        <div className="cb-top">

          <span>AI Exam Mentor</span>

          <button
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>

        </div>


        {/* CHAT BODY */}

        <div className="cb-body">

          {active === null && (
            <div className="cb-welcome">
              <h2>Start New Chat 👋</h2>
              <p>Click "New Chat" to begin</p>
            </div>
          )}

          {currentChat.map((c, i) => (

            <div
              key={i}
              className={
                c.role === "user"
                  ? "cb-row user"
                  : "cb-row bot"
              }
            >

              <div className="cb-avatar">
                {c.role === "user" ? "👤" : "🤖"}
              </div>

              <div className="cb-bubble">
                {c.content}
              </div>

            </div>

          ))}

          {loading && (

            <div className="cb-row bot">

              <div className="cb-avatar">🤖</div>

              <div className="cb-bubble typing">
                Thinking...
              </div>

            </div>

          )}

          <div ref={endRef}></div>

        </div>


        {/* INPUT */}

        <div className="cb-bottom">

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your question..."
            disabled={loading || active === null}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />

          <button
            onClick={sendMessage}
            disabled={loading || active === null}
          >
            Send
          </button>

        </div>

      </div>

    </div>

  );

}

export default ChatBot;