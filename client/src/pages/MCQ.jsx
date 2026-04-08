import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../main.css";

function MCQ() {

  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");

  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);

  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(null);

  const [explanation, setExplanation] = useState("");



  /* =============================
     LOAD HISTORY
  ============================= */

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/mcq-result/history"
      );

      setHistory(res.data.history || []);

    } catch (err) {

      console.error("History load error", err);

    }

  };



  /* =============================
     LOAD HISTORY SESSION
  ============================= */

  const loadHistorySession = (item) => {

    setSelectedHistory(item);

    setTopic(item.topic);

    // Load stored MCQs
    setQuestions(item.questions || []);

    // reset answers
    setSelectedAnswers({});

    setScore(item.score);

    setChecked(true);

    setExplanation("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  };



  /* =============================
     NEW CHAT
  ============================= */

  const newChat = () => {

    setTopic("");
    setQuestions([]);
    setSelectedAnswers({});
    setChecked(false);
    setScore(null);
    setExplanation("");
    setSelectedHistory(null);
    setLoading(false);

    if (inputRef.current) {
      inputRef.current.focus();
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  };



  /* =============================
     GENERATE MCQ
  ============================= */

  const generateMCQ = async () => {

    if (!topic.trim()) {
      alert("Please enter a topic");
      return;
    }

    setLoading(true);
    setQuestions([]);
    setSelectedAnswers({});
    setChecked(false);
    setScore(null);
    setExplanation("");

    try {

      const res = await axios.post(
        "http://localhost:5000/api/ai/mcq",
        { topic, difficulty }
      );

      if (Array.isArray(res.data.mcqs)) {

        setQuestions(res.data.mcqs);

      } else {

        alert("AI could not generate MCQs");

      }

    } catch (err) {

      console.error(err);
      alert("Failed to generate MCQs");

    }

    setLoading(false);

  };



  /* =============================
     SELECT ANSWER
  ============================= */

  const handleSelect = (qIndex, option) => {

    setSelectedAnswers(prev => ({
      ...prev,
      [qIndex]: option
    }));

  };



  /* =============================
     CHECK ANSWERS
  ============================= */

  const checkAnswers = async () => {

    let correct = 0;

    questions.forEach((q, i) => {

      if (selectedAnswers[i] === q.correctAnswer) {
        correct++;
      }

    });

    setScore(correct);
    setChecked(true);

    try {

      await axios.post(
        "http://localhost:5000/api/mcq-result/save",
        {
          topic,
          totalQuestions: questions.length,
          correctAnswers: correct,
          questions
        }
      );

      loadHistory();

    } catch (err) {

      console.log("Save result error", err);

    }

  };



  /* =============================
     DELETE HISTORY
  ============================= */

  const deleteHistory = async (id) => {

    try {

      await axios.delete(
        `http://localhost:5000/api/mcq-result/${id}`
      );

      if (selectedHistory?._id === id) {
        newChat();
      }

      loadHistory();

    } catch (err) {

      console.error("Delete error", err);

    }

  };



  /* =============================
     AI EXPLANATION
  ============================= */

  const explainAnswer = async (question) => {

    try {

      const res = await axios.post(
        "http://localhost:5000/api/ai/explain",
        { question }
      );

      setExplanation(res.data.explanation);

    } catch (err) {

      console.log("Explain error", err);

    }

  };



  return (

    <div className="mcq-layout">

      {/* SIDEBAR */}

      <div className="mcq-sidebar">

        <h3 className="sidebar-title">Your Chats</h3>

        <button
          className="mcq-new-btn"
          onClick={newChat}
        >
          + New Chat
        </button>

        <div className="history-list">

          {history.length === 0 && (
            <p className="mcq-empty">No history yet</p>
          )}

          {history.map((item) => (

            <div
              key={item._id}
              className={`mcq-history-item ${
                selectedHistory?._id === item._id ? "active-history" : ""
              }`}
              onClick={() => loadHistorySession(item)}
            >

              <span className="mcq-history-topic">
                {item.topic}
              </span>

              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteHistory(item._id);
                }}
              >
                🗑
              </button>

            </div>

          ))}

        </div>

      </div>



      {/* MAIN */}

      <div className="mcq-main">

        <div className="mcq-container">

          <div className="mcq-card">

            <button
              className="mcq-back"
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button>

            <h1 className="mcq-title">
              📘 AI MCQ Generator
            </h1>



            <div className="mcq-input-group">

              <input
                ref={inputRef}
                className="mcq-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter topic"
              />

              <select
                className="mcq-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <button
                className="mcq-btn"
                onClick={generateMCQ}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate MCQs"}
              </button>

            </div>



            {questions.map((q, qIndex) => (

              <div key={qIndex} className="mcq-question">

                <h3>
                  {qIndex + 1}. {q.question}
                </h3>

                {q.options.map((opt, i) => {

                  const isSelected =
                    selectedAnswers[qIndex] === opt;

                  const isCorrect =
                    checked && opt === q.correctAnswer;

                  const isWrong =
                    checked &&
                    isSelected &&
                    opt !== q.correctAnswer;

                  return (

                    <label
                      key={i}
                      className={`mcq-option
                      ${isCorrect ? "correct" : ""}
                      ${isWrong ? "wrong" : ""}`}
                    >

                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        value={opt}
                        checked={isSelected}
                        onChange={() =>
                          handleSelect(qIndex, opt)
                        }
                        disabled={checked}
                      />

                      {opt}

                    </label>

                  );

                })}

                {checked && (

                  <button
                    className="explain-btn"
                    onClick={() =>
                      explainAnswer(q.question)
                    }
                  >
                    Explain Answer 🤖
                  </button>

                )}

              </div>

            ))}



            {questions.length > 0 && !checked && (

              <button
                className="mcq-check-btn"
                onClick={checkAnswers}
              >
                Check Answers
              </button>

            )}



            {checked && score !== null && (

              <div className="mcq-score">

                <h2>
                  Score: {score} / {questions.length}
                </h2>

              </div>

            )}



            {explanation && (

              <div className="explanation-box">

                <h3>AI Explanation</h3>

                <p>{explanation}</p>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>

  );

}

export default MCQ;