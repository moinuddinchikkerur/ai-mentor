

















import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../main.css";

const timeOrder = [
  "9-10",
  "10-11",
  "11-12",
  "12-1",
  "1-2",
  "2-3",
  "3-4",
  "4-5"
];

const oldTimeKeys = {
  "9-10": "9:00-10:00",
  "10-11": "10:00-11:00",
  "11-12": "11:00-12:00",
  "12-1": "12:00-1:00",
  "1-2": "1:00-2:00",
  "2-3": "2:00-3:00",
  "3-4": "3:00-4:00",
  "4-5": "4:00-5:00"
};

const fallbackSubjects = [
  "General",
  "Physics",
  "Chemistry",
  "Biology",
  "Mathematics",
  "English",
  "Computer Science",
  "Python",
  "Java",
  "DBMS",
  "Operating System",
  "Computer Networks"
];

const allowedMaxMarks = [2, 5, 10, 15, 20, 25, 30];

const createChatId = () => {
  return `eval-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const getSlotValue = (slots, time) => {
  return slots?.[time] || slots?.[oldTimeKeys[time]] || "";
};

const isValidSubject = (value) => {
  const subject = String(value || "").trim();

  if (!subject) return false;

  return !["break", "revision", "-", "none", "free"].includes(
    subject.toLowerCase()
  );
};

const getTimetableSubjects = () => {
  try {
    const activePlan = localStorage.getItem("activePlan");

    if (!activePlan) return [];

    const plan = JSON.parse(activePlan);
    const subjects = new Set();

    Object.values(plan || {}).forEach((daySlots) => {
      timeOrder.forEach((time) => {
        const subject = getSlotValue(daySlots, time);

        if (isValidSubject(subject)) {
          subjects.add(String(subject).trim());
        }
      });

      Object.values(daySlots || {}).forEach((subject) => {
        if (isValidSubject(subject)) {
          subjects.add(String(subject).trim());
        }
      });
    });

    return Array.from(subjects);
  } catch {
    return [];
  }
};

function Evaluate() {
  const navigate = useNavigate();

  const [chatId, setChatId] = useState(() => createChatId());
  const [activeChatId, setActiveChatId] = useState(null);
  const [selectedEntryId, setSelectedEntryId] = useState(null);

  const [subject, setSubject] = useState("");
  const [historySubject, setHistorySubject] = useState("ALL");
  const [maxMarks, setMaxMarks] = useState(10);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState("");

  const [chats, setChats] = useState([]);
  const [entries, setEntries] = useState([]);
  const [timetableSubjects, setTimetableSubjects] = useState([]);

  const subjectOptions = useMemo(() => {
    const source = timetableSubjects.length > 0
      ? timetableSubjects
      : fallbackSubjects;

    return Array.from(
      new Set([...(source || []), subject].filter(Boolean))
    );
  }, [timetableSubjects, subject]);

  const currentChatId = activeChatId || chatId;

  useEffect(() => {
    const subjects = getTimetableSubjects();

    setTimetableSubjects(subjects);
    setSubject((current) => current || subjects[0] || "General");
  }, []);

  const loadChats = useCallback(async () => {
    try {
      setLoadingChats(true);

      const params = {};

      if (historySubject && historySubject !== "ALL") {
        params.subject = historySubject;
      }

      const res = await api.get("/ai/chats", { params });

      if (res.data.success) {
        setChats(res.data.chats || []);
      }
    } catch (err) {
      console.error("Failed to load chats:", err);
    } finally {
      setLoadingChats(false);
    }
  }, [historySubject]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const loadEntry = (entry) => {
    if (!entry) return;

    setSelectedEntryId(entry._id || null);
    setSubject(entry.subject || subjectOptions[0] || "General");
    setMaxMarks(Number(entry.maxMarks || 10));
    setQuestion(entry.question || "");
    setAnswer(entry.answer || "");
    setResult(entry.result || "");
  };

  const loadChat = useCallback(async (id) => {
    try {
      setLoadingChat(true);
      setError("");

      const res = await api.get(`/ai/chat/${id}`);

      if (!res.data.success) return;

      const chatEntries = res.data.entries || [];

      setEntries(chatEntries);
      setActiveChatId(id);
      setChatId(id);

      if (chatEntries.length > 0) {
        const latest = chatEntries[chatEntries.length - 1];
        loadEntry(latest);
      }
    } catch (err) {
      console.error("Failed to load chat:", err);
      setError(err.response?.data?.message || "Failed to load chat");
    } finally {
      setLoadingChat(false);
    }
  }, [subjectOptions]);

  const newChat = useCallback((nextSubject = "", nextMarks = null) => {
    const freshChatId = createChatId();

    setChatId(freshChatId);
    setActiveChatId(null);
    setSelectedEntryId(null);
    setQuestion("");
    setAnswer("");
    setResult("");
    setEntries([]);
    setError("");
    setSubject(nextSubject || subject || subjectOptions[0] || "General");
    setMaxMarks(nextMarks || maxMarks || 10);
  }, [subject, subjectOptions, maxMarks]);

  const handleSubjectChange = (value) => {
    if (entries.length > 0 && value !== subject) {
      const ok = window.confirm(
        "Changing subject will start a new history. Continue?"
      );

      if (!ok) return;

      newChat(value, maxMarks);
      return;
    }

    setSubject(value);
  };

  const handleMarksChange = (value) => {
    const numericValue = Number(value);

    if (entries.length > 0 && numericValue !== maxMarks) {
      const ok = window.confirm(
        "Changing max marks will start a new history. Continue?"
      );

      if (!ok) return;

      newChat(subject, numericValue);
      return;
    }

    setMaxMarks(numericValue);
  };

  const evaluate = async () => {
    const cleanQuestion = question.trim();
    const cleanAnswer = answer.trim();
    const cleanSubject = subject.trim();

    if (!cleanSubject) {
      alert("Please select subject");
      return;
    }

    if (!cleanQuestion || !cleanAnswer) {
      alert("Please enter question and answer");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult("");

      const sessionId = currentChatId || createChatId();

      const res = await api.post("/ai/evaluate", {
        chatId: sessionId,
        subject: cleanSubject,
        maxMarks: Number(maxMarks),
        question: cleanQuestion,
        answer: cleanAnswer
      });

      if (res.data.success) {
        const savedChatId = res.data.evaluation?.chatId || sessionId;

        setActiveChatId(savedChatId);
        setChatId(savedChatId);
        setResult(res.data.result || "No response");

        await loadChats();
        await loadChat(savedChatId);
      }
    } catch (err) {
      console.error("Evaluation error:", err);

      const message =
        err.response?.data?.message || "Evaluation failed";

      setError(message);
      setResult(message);
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (id) => {
    const ok = window.confirm("Delete this chat history?");

    if (!ok) return;

    try {
      await api.delete(`/ai/chat/${id}`);

      if (currentChatId === id) {
        newChat();
      }

      await loadChats();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="ev-container">
      <div className="ev-history">
        <button
          className="new-chat-btn"
          type="button"
          onClick={() => newChat()}
        >
          + New Chat
        </button>

        <h3>Chats</h3>

        <select
          className="ev-subject-filter"
          value={historySubject}
          onChange={(e) => setHistorySubject(e.target.value)}
        >
          <option value="ALL">All Subjects</option>
          {subjectOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {loadingChats && (
          <p className="no-history">Loading chats...</p>
        )}

        {!loadingChats && chats.length === 0 && (
          <p className="no-history">No history yet</p>
        )}

        {chats.map((chat) => (
          <div
            key={chat._id}
            className={`history-card ${
              activeChatId === chat._id ? "active-history" : ""
            }`}
            onClick={() => loadChat(chat._id)}
          >
            <div className="history-title">
              {chat.lastQuestion
                ? chat.lastQuestion.substring(0, 55)
                : "Untitled Chat"}

              <div className="history-subtext">
                <span className="history-badge">
                  {chat.subject || "General"}
                </span>
                <span>
                  {chat.totalEntries || 0} attempt
                  {(chat.totalEntries || 0) > 1 ? "s" : ""}
                </span>
                {typeof chat.lastMarks === "number" && (
                  <span>{chat.lastMarks}/{chat.lastMaxMarks || 20}</span>
                )}
              </div>
            </div>

            <button
              className="delete-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteChat(chat._id);
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="ev2">
        <button
          className="back-btn"
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>

        <h2 className="ev-title">Answer Evaluator</h2>

        <p className="ev-meta">
          {activeChatId
            ? `Active history • ${entries.length} saved attempt${entries.length !== 1 ? "s" : ""}`
            : "Start a new answer evaluation history"}
        </p>

        {loadingChat && (
          <p className="ev-loading">Loading selected history...</p>
        )}

        <div className="ev-toolbar-grid">
          <div className="ev-group">
            <label>Subject</label>

            <select
              className="ev-select"
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
            >
              {subjectOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="ev-group">
            <label>Max Marks</label>

            <select
              className="ev-select"
              value={maxMarks}
              onChange={(e) => handleMarksChange(e.target.value)}
            >
              {allowedMaxMarks.map((mark) => (
                <option key={mark} value={mark}>
                  {mark} Marks
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ev-group">
          <label>Question</label>

          <textarea
            className="ev-input"
            placeholder="Enter your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>

        <div className="ev-group">
          <label>Your Answer</label>

          <textarea
            className="ev-input"
            placeholder="Enter your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </div>

        <button
          className="ev-btn"
          type="button"
          onClick={evaluate}
          disabled={loading}
        >
          {loading ? "Evaluating..." : "Evaluate Answer"}
        </button>

        {error && (
          <div className="ev-result">
            {error}
          </div>
        )}

        {result && !error && (
          <div className="ev-result">
            {result}
          </div>
        )}

        {entries.length > 0 && (
          <div className="ev-entry-list">
            <h3 className="ev-entry-title">Saved Attempts</h3>

            {[...entries].reverse().map((entry, index) => (
              <div
                key={entry._id || index}
                className={`ev-entry-card ${
                  selectedEntryId === entry._id ? "active-history" : ""
                }`}
                onClick={() => loadEntry(entry)}
              >
                <div className="ev-entry-head">
                  <span className="history-badge">
                    {entry.subject || "General"}
                  </span>

                  {typeof entry.marks === "number" && (
                    <span className="ev-entry-marks">
                      {entry.marks}/{entry.maxMarks || 20}
                    </span>
                  )}
                </div>

                <p className="ev-entry-question">
                  {entry.question}
                </p>

                <p className="ev-entry-time">
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Evaluate;
