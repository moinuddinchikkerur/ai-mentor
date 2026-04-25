
import { useEffect, useState } from "react";
import axios from "axios";
import "../main.css";

function MCQHistory() {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);

  const token = localStorage.getItem("token");

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/mcq-result/history",
        authHeader
      );

      setHistory(res.data.history || []);
    } catch (err) {
      console.error("History load failed", err);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/mcq-result/${id}`,
        authHeader
      );

      if (selected?._id === id) {
        setSelected(null);
      }

      loadHistory();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="history-layout">
      <div className="history-sidebar">
        <h3>📜 MCQ History</h3>

        {history.length === 0 && (
          <p className="mcq-empty">No history yet</p>
        )}

        {history.map((item) => (
          <div
            key={item._id}
            className="history-item"
            onClick={() => setSelected(item)}
          >
            <span>{item.topic}</span>

            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                deleteItem(item._id);
              }}
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      <div className="history-main">
        {selected ? (
          <div className="history-result">
            <h2>{selected.topic}</h2>

            <p>
              Difficulty: {selected.difficulty || "medium"}
            </p>

            <p>
              Score: {selected.score} / {selected.totalQuestions}
            </p>

            <p>
              ✅ Correct: {selected.correctAnswers}
            </p>

            <p>
              ❌ Wrong: {selected.wrongAnswers}
            </p>

            <p>
              Accuracy: {selected.accuracy || 0}%
            </p>

            <p>
              Date: {new Date(selected.createdAt).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <div className="history-empty">
            Select a history item
          </div>
        )}
      </div>
    </div>
  );
}

export default MCQHistory;