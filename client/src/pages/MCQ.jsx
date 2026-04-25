




import { useEffect, useMemo, useRef, useState } from "react";
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

const normalizeQuestion = (text) => {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
};

const shuffleArray = (items) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index]
    ];
  }

  return shuffled;
};

const randomizeQuestionOptions = (question, correctIndex = null) => {
  const correctAnswer = String(question.correctAnswer || "").trim();

  if (!correctAnswer || !Array.isArray(question.options)) {
    return question;
  }

  const cleanOptions = question.options
    .map((option) => String(option || "").trim())
    .filter(Boolean);

  const wrongOptions = cleanOptions.filter(
    (option) => normalizeQuestion(option) !== normalizeQuestion(correctAnswer)
  );

  if (wrongOptions.length < 3) {
    return question;
  }

  const finalOptions = shuffleArray(wrongOptions).slice(0, 3);

  const targetIndex =
    typeof correctIndex === "number"
      ? correctIndex
      : Math.floor(Math.random() * 4);

  finalOptions.splice(targetIndex, 0, correctAnswer);

  return {
    ...question,
    options: finalOptions.slice(0, 4),
    correctAnswer
  };
};

const randomizeQuestionBatch = (items, startIndex = 0) => {
  const positions = shuffleArray([0, 1, 2, 3]);

  return items.map((question, index) => {
    const correctIndex = positions[(startIndex + index) % 4];

    return randomizeQuestionOptions(question, correctIndex);
  });
};

const getQuestionTokens = (text) => {
  return normalizeQuestion(text).split(" ").filter(Boolean);
};

const getQuestionSimilarity = (a, b) => {
  const first = new Set(getQuestionTokens(a));
  const second = new Set(getQuestionTokens(b));

  if (first.size === 0 || second.size === 0) return 0;

  let same = 0;

  first.forEach((token) => {
    if (second.has(token)) same++;
  });

  return same / Math.max(first.size, second.size);
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

const removeDuplicateQuestions = (incomingQuestions, existingQuestions) => {
  const accepted = [...existingQuestions];

  return incomingQuestions.filter((question) => {
    const questionText = question?.question;

    if (!questionText) return false;

    const repeated = accepted.some((oldQuestion) => {
      const oldText = oldQuestion?.question || oldQuestion;

      if (normalizeQuestion(questionText) === normalizeQuestion(oldText)) {
        return true;
      }

      return getQuestionSimilarity(questionText, oldText) >= 0.92;
    });

    if (repeated) return false;

    accepted.push(question);
    return true;
  });
};

function MCQ() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");

  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [activeResultId, setActiveResultId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [checkedUntil, setCheckedUntil] = useState(0);
  const [score, setScore] = useState(null);

  const [explanations, setExplanations] = useState({});
  const [timetableSubjects, setTimetableSubjects] = useState([]);

  const subjectOptions = useMemo(() => {
    const list = timetableSubjects.length > 0
      ? timetableSubjects
      : fallbackSubjects;

    return Array.from(new Set(list));
  }, [timetableSubjects]);

  useEffect(() => {
    const subjects = getTimetableSubjects();

    setTimetableSubjects(subjects);
    setSubject(subjects[0] || "General");

    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get("/mcq-result/history");

      if (res.data.success) {
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.error("History load error:", err);
    }
  };

  const loadHistorySession = (item) => {
    const restoredQuestions = randomizeQuestionBatch(item.questions || []);
    const restoredAnswers = {};

    restoredQuestions.forEach((q, index) => {
      if (q.selectedAnswer) {
        restoredAnswers[index] = q.selectedAnswer;
      }
    });

    setSelectedHistory(item);
    setActiveResultId(item._id || null);
    setSubject(item.subject || subjectOptions[0] || "General");
    setTopic(item.topic || "");
    setDifficulty(item.difficulty || "medium");
    setQuestions(restoredQuestions);
    setSelectedAnswers(restoredAnswers);
    setCheckedUntil(restoredQuestions.length);
    setScore({
      correct: Number(item.correctAnswers || item.score || 0),
      total: Number(item.totalQuestions || restoredQuestions.length)
    });
    setExplanations({});

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const newChat = () => {
    setSubject(subjectOptions[0] || "General");
    setTopic("");
    setDifficulty("medium");
    setQuestions([]);
    setSelectedAnswers({});
    setCheckedUntil(0);
    setScore(null);
    setExplanations({});
    setSelectedHistory(null);
    setActiveResultId(null);
    setLoading(false);

    inputRef.current?.focus();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const generateMCQ = async ({ append = false } = {}) => {
    if (!subject.trim()) {
      alert("Please select a subject");
      return;
    }

    if (!topic.trim()) {
      alert("Please enter a topic");
      return;
    }

    setLoading(true);

    const baseQuestions = append ? questions : [];

    if (!append) {
      setQuestions([]);
      setSelectedAnswers({});
      setCheckedUntil(0);
      setScore(null);
      setExplanations({});
      setSelectedHistory(null);
      setActiveResultId(null);
    }

    try {
      let collectedQuestions = [];
      let attempt = 0;

      while (collectedQuestions.length < 5 && attempt < 5) {
        attempt++;

        const previousQuestions = [
          ...baseQuestions,
          ...collectedQuestions
        ].map((q) => q.question);

        const remainingCount = 5 - collectedQuestions.length;

        const res = await api.post("/ai/mcq", {
          subject,
          topic: topic.trim(),
          difficulty,
          previousQuestions,
          count: remainingCount,
          startNumber: baseQuestions.length + collectedQuestions.length + 1,
          attempt
        });

        const incomingQuestions = Array.isArray(res.data.mcqs)
          ? randomizeQuestionBatch(
              res.data.mcqs,
              baseQuestions.length + collectedQuestions.length
            )
          : [];

        const uniqueQuestions = removeDuplicateQuestions(
          incomingQuestions,
          [...baseQuestions, ...collectedQuestions]
        );

        collectedQuestions = [
          ...collectedQuestions,
          ...uniqueQuestions
        ].slice(0, 5);
      }

      if (collectedQuestions.length === 0) {
        alert("Could not generate new unique questions. Try a more specific topic.");
        return;
      }

      if (append) {
        setQuestions((prev) => [...prev, ...collectedQuestions]);
      } else {
        setQuestions(collectedQuestions);
      }

      if (collectedQuestions.length < 5) {
        alert(`Generated ${collectedQuestions.length} unique questions. Click Continue again for more.`);
      }
    } catch (err) {
      console.error("MCQ generate error:", err);

      alert(
        err.response?.data?.message ||
        "Failed to generate MCQs"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qIndex, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: option
    }));
  };

  const checkAnswers = async () => {
    if (questions.length === 0) return;

    const currentBatch = questions.slice(checkedUntil);

    if (currentBatch.length === 0) return;

    const allAnswered = currentBatch.every((_, index) => {
      const realIndex = checkedUntil + index;
      return selectedAnswers[realIndex];
    });

    if (!allAnswered) {
      alert("Please answer all new questions");
      return;
    }

    const newCheckedUntil = questions.length;

    const totalCorrect = questions
      .slice(0, newCheckedUntil)
      .reduce((count, question, index) => {
        return selectedAnswers[index] === question.correctAnswer
          ? count + 1
          : count;
      }, 0);

    const savedQuestions = questions.slice(0, newCheckedUntil).map((q, index) => ({
      question: q.question,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      selectedAnswer: selectedAnswers[index] || "",
      explanation: q.explanation || ""
    }));

    setCheckedUntil(newCheckedUntil);
    setScore({
      correct: totalCorrect,
      total: newCheckedUntil
    });

    try {
      const res = await api.post("/mcq-result/save", {
        resultId: activeResultId,
        subject,
        topic: topic.trim(),
        difficulty,
        totalQuestions: newCheckedUntil,
        correctAnswers: totalCorrect,
        questions: savedQuestions
      });

      if (res.data.result?._id) {
        setActiveResultId(res.data.result._id);
      }

      loadHistory();
    } catch (err) {
      console.error("Save result error:", err);
    }
  };

  const deleteHistory = async (id) => {
    const ok = window.confirm("Delete this MCQ history?");

    if (!ok) return;

    try {
      await api.delete(`/mcq-result/${id}`);

      if (selectedHistory?._id === id) {
        newChat();
      }

      loadHistory();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const explainAnswer = async (question, qIndex) => {
    try {
      const res = await api.post("/ai/explain", {
        subject,
        topic,
        question,
        selectedAnswer: selectedAnswers[qIndex],
        correctAnswer: questions[qIndex]?.correctAnswer
      });

      setExplanations((prev) => ({
        ...prev,
        [qIndex]: res.data.explanation || "No explanation found"
      }));
    } catch (err) {
      console.error("Explain error:", err);

      setExplanations((prev) => ({
        ...prev,
        [qIndex]: "Explanation failed"
      }));
    }
  };

  const hasUncheckedQuestions = questions.length > checkedUntil;
  const canContinue = questions.length > 0 && questions.length === checkedUntil;

  return (
    <div className="mcq-layout">
      <div className="mcq-sidebar">
        <h3 className="sidebar-title">MCQ History</h3>

        <button className="mcq-new-btn" onClick={newChat}>
          + New MCQ
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
                {item.subject ? `${item.subject}: ` : ""}
                {item.topic}
              </span>

              <button
                className="delete-btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteHistory(item._id);
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mcq-main">
        <div className="mcq-container">
          <div className="mcq-card">
            <button
              className="mcq-back"
              type="button"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>

            <h1 className="mcq-title">AI MCQ Generator</h1>

            <p className="mcq-subtitle">
              Generate MCQs by subject and continue without losing previous questions.
            </p>

            <div className="mcq-input-group">
              <select
                className="mcq-difficulty"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                {subjectOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

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
                type="button"
                onClick={() => generateMCQ({ append: false })}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate 5 MCQs"}
              </button>
            </div>

            {questions.map((q, qIndex) => {
              const isChecked = qIndex < checkedUntil;

              return (
                <div key={`${q.question}-${qIndex}`} className="mcq-question">
                  <h3>
                    {qIndex + 1}. {q.question}
                  </h3>

                  {(q.options || []).map((option, index) => {
                    const isSelected = selectedAnswers[qIndex] === option;
                    const isCorrect = isChecked && option === q.correctAnswer;
                    const isWrong =
                      isChecked && isSelected && option !== q.correctAnswer;

                    return (
                      <label
                        key={`${option}-${index}`}
                        className={`mcq-option ${
                          isCorrect ? "correct" : ""
                        } ${isWrong ? "wrong" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          value={option}
                          checked={isSelected}
                          onChange={() => handleSelect(qIndex, option)}
                          disabled={isChecked}
                        />

                        {option}
                      </label>
                    );
                  })}

                  {isChecked && (
                    <button
                      className="explain-btn"
                      type="button"
                      onClick={() => explainAnswer(q.question, qIndex)}
                    >
                      Explain Answer
                    </button>
                  )}

                  {explanations[qIndex] && (
                    <div className="explanation-box">
                      <h3>AI Explanation</h3>
                      <p>{explanations[qIndex]}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {hasUncheckedQuestions && (
              <button
                className="mcq-check-btn"
                type="button"
                onClick={checkAnswers}
              >
                Check New Answers
              </button>
            )}

            {score && (
              <div className="mcq-score">
                <h2>
                  Score: {score.correct} / {score.total}
                </h2>
              </div>
            )}

            {canContinue && (
              <button
                className="mcq-btn"
                type="button"
                onClick={() => generateMCQ({ append: true })}
                disabled={loading}
              >
                {loading ? "Generating..." : "Continue 5 More"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MCQ;
