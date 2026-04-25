




import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../main.css";

const API_BASE = "http://localhost:5000/api/career";

const interestPresets = [
  "Frontend Development",
  "Backend Development",
  "Data Science",
  "AI / Machine Learning",
  "UI / UX Design",
  "Cybersecurity",
  "Mobile App Development",
  "Digital Marketing"
];

const skillPresets = [
  "Beginner",
  "HTML, CSS, JavaScript",
  "React, Node.js",
  "Python, SQL",
  "Communication, Problem Solving",
  "Figma, Canva",
  "Git, GitHub"
];

const educationPresets = [
  "12th Pass",
  "Diploma",
  "BCA",
  "B.Tech CSE",
  "B.Com",
  "Self Taught"
];

const goalPresets = [
  "Get an internship",
  "Build a strong portfolio",
  "Prepare for an entry-level job",
  "Switch career",
  "Start freelancing"
];

const splitItems = (value) => {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const mergeSkillText = (current, preset) => {
  const items = [...splitItems(current), ...splitItems(preset)];
  const seen = new Set();

  return items
    .filter((item) => {
      const key = item.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .join(", ");
};

const formatDateTime = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "Just now";
  }
};

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});

const skillsToText = (value) => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value || "");
};

const normalizeGuideItem = (item) => ({
  _id: item?._id || `career_${Date.now()}`,
  createdAt: item?.createdAt || new Date().toISOString(),
  updatedAt: item?.updatedAt || item?.createdAt || new Date().toISOString(),
  inputs: {
    interest: item?.inputs?.interest || item?.interest || "",
    skills: skillsToText(item?.inputs?.skills || item?.skills || ""),
    education: item?.inputs?.education || item?.education || "",
    goal: item?.inputs?.goal || item?.goal || "",
    workStyle: item?.inputs?.workStyle || item?.workStyle || "Flexible",
    studyTime: item?.inputs?.studyTime || item?.studyTime || "5-7 hrs/week"
  },
  guide: item?.guide || "No result",
  guideData: item?.guideData || null,
  aiUsed: Boolean(item?.aiUsed)
});

function CareerAI() {
  const navigate = useNavigate();
  const resultRef = useRef(null);

  const [interest, setInterest] = useState("");
  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState("");
  const [goal, setGoal] = useState("");
  const [workStyle, setWorkStyle] = useState("Flexible");
  const [studyTime, setStudyTime] = useState("5-7 hrs/week");

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);

      const res = await axios.get(`${API_BASE}/history`, getAuthConfig());
      const items = Array.isArray(res.data?.data)
        ? res.data.data.map(normalizeGuideItem)
        : [];

      setHistory(items);
    } catch (err) {
      console.error("Career history load error:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (result || loading || error) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result, loading, error]);

  const skillPreview = useMemo(() => {
    return splitItems(skills).slice(0, 8);
  }, [skills]);

  const upsertHistory = (nextItem) => {
    setHistory((prev) => [
      nextItem,
      ...prev.filter((item) => item._id !== nextItem._id)
    ]);
  };

  const resetBuilder = () => {
    setInterest("");
    setSkills("");
    setEducation("");
    setGoal("");
    setWorkStyle("Flexible");
    setStudyTime("5-7 hrs/week");
    setResult(null);
    setError("");
    setCopied(false);
  };

  const deleteHistoryItem = async (id) => {
    const ok = window.confirm("Delete this saved career plan?");

    if (!ok || !id || deletingId) return;

    try {
      setDeletingId(id);
      setError("");

      await axios.delete(`${API_BASE}/history/${id}`, getAuthConfig());

      setHistory((prev) => prev.filter((item) => item._id !== id));
      setResult((prev) => (prev?._id === id ? null : prev));
    } catch (err) {
      console.error("Career history delete error:", err);
      setError(
        err.response?.data?.message || "Could not delete this saved career plan."
      );
    } finally {
      setDeletingId("");
    }
  };

  const loadHistoryItem = (item) => {
    setInterest(item?.inputs?.interest || "");
    setSkills(item?.inputs?.skills || "");
    setEducation(item?.inputs?.education || "");
    setGoal(item?.inputs?.goal || "");
    setWorkStyle(item?.inputs?.workStyle || "Flexible");
    setStudyTime(item?.inputs?.studyTime || "5-7 hrs/week");
    setResult(item);
    setError("");
    setCopied(false);
  };

  const copyGuide = async () => {
    if (!result?.guide) return;

    try {
      await navigator.clipboard.writeText(result.guide);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Could not copy the guide.");
    }
  };

  const getCareerGuide = async () => {
    if (!interest.trim()) {
      setError("Interest is required.");
      return;
    }

    if (loading) return;

    const payload = {
      interest: interest.trim(),
      skills: skills.trim(),
      education: education.trim(),
      goal: goal.trim(),
      workStyle,
      studyTime
    };

    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const res = await axios.post(`${API_BASE}/guide`, payload, getAuthConfig());

      const nextResult = normalizeGuideItem(
        res.data?.savedGuide || {
          createdAt: res.data?.generatedAt,
          inputs: payload,
          guide: res.data?.guide || "No result",
          guideData: res.data?.guideData || null,
          aiUsed: res.data?.aiUsed || false
        }
      );

      setResult(nextResult);
      upsertHistory(nextResult);
    } catch (err) {
      console.error("Career guide error:", err);

      setError(
        err.response?.data?.message || "Career guidance failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    getCareerGuide();
  };

  const guideData = result?.guideData || {};
  const profile = guideData?.profile || {};
  const careerOptions = Array.isArray(guideData?.careerOptions)
    ? guideData.careerOptions
    : [];
  const requiredSkills = Array.isArray(guideData?.requiredSkills)
    ? guideData.requiredSkills
    : [];
  const roadmap = Array.isArray(guideData?.roadmap) ? guideData.roadmap : [];
  const projects = Array.isArray(guideData?.projects) ? guideData.projects : [];
  const interviewFocus = Array.isArray(guideData?.interviewFocus)
    ? guideData.interviewFocus
    : [];
  const nextSteps = Array.isArray(guideData?.nextSteps)
    ? guideData.nextSteps
    : [];

  return (
    <div className="cr5-container">
      <div className="cr5-header">
        <button
          type="button"
          className="cr5-back"
          onClick={() => navigate("/dashboard")}
        >
          Back
        </button>

        <div className="cr5-title">Career AI Assistant</div>

        <div className="cr5-header-actions">
          <button
            type="button"
            className="cr5-header-btn"
            onClick={resetBuilder}
          >
            New
          </button>

          <button
            type="button"
            className="cr5-header-btn"
            onClick={copyGuide}
            disabled={!result?.guide}
          >
            {copied ? "Copied" : "Copy Guide"}
          </button>
        </div>
      </div>

      <div className="cr5-center">
        <div className="cr5-card cr5-form-card">
          <h2>Build your career roadmap</h2>

          <p className="cr5-subtitle">
            Tell the assistant what you like, what you already know, and what
            kind of career move you want next.
          </p>

          <form className="cr5-form" onSubmit={handleSubmit}>
            <input
              placeholder="Interest..."
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
            />

            <textarea
              className="cr5-textarea"
              placeholder="Skills... (example: HTML, CSS, JavaScript)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              rows={3}
            />

            <input
              placeholder="Education..."
              value={education}
              onChange={(e) => setEducation(e.target.value)}
            />

            <input
              placeholder="Goal... (example: get internship, switch career)"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />

            <select
              value={workStyle}
              onChange={(e) => setWorkStyle(e.target.value)}
            >
              <option value="Flexible">Preferred work style: Flexible</option>
              <option value="Remote">Preferred work style: Remote</option>
              <option value="Hybrid">Preferred work style: Hybrid</option>
              <option value="Onsite">Preferred work style: Onsite</option>
            </select>

            <select
              value={studyTime}
              onChange={(e) => setStudyTime(e.target.value)}
            >
              <option value="3-5 hrs/week">Study time: 3-5 hrs/week</option>
              <option value="5-7 hrs/week">Study time: 5-7 hrs/week</option>
              <option value="8-10 hrs/week">Study time: 8-10 hrs/week</option>
              <option value="10+ hrs/week">Study time: 10+ hrs/week</option>
            </select>

            <button type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate Career Guide"}
            </button>
          </form>

          <div className="cr5-preset-block">
            <h3>Quick interests</h3>
            <div className="cr5-chip-row">
              {interestPresets.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="cr5-chip"
                  onClick={() => setInterest(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="cr5-preset-block">
            <h3>Quick skills</h3>
            <div className="cr5-chip-row">
              {skillPresets.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="cr5-chip"
                  onClick={() => setSkills(mergeSkillText(skills, item))}
                >
                  {item}
                </button>
              ))}
            </div>

            {skillPreview.length > 0 && (
              <div className="cr5-skill-preview">
                {skillPreview.map((item) => (
                  <span key={item} className="cr5-mini-chip">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="cr5-preset-block">
            <h3>Education</h3>
            <div className="cr5-chip-row">
              {educationPresets.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="cr5-chip"
                  onClick={() => setEducation(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="cr5-preset-block">
            <h3>Goal</h3>
            <div className="cr5-chip-row">
              {goalPresets.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="cr5-chip"
                  onClick={() => setGoal(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="cr5-chat cr5-history-panel">
          <div className="cr5-section-head">
            <h3>Saved career plans</h3>
          </div>

          {historyLoading ? (
            <div className="cr5-msg ai">Loading saved career plans...</div>
          ) : history.length === 0 ? (
            <div className="cr5-msg ai">
              Your saved career searches will appear here.
            </div>
          ) : (
            <div className="cr5-history-list">
              {history.map((item) => (
                <div key={item._id} className="cr5-history-item">
                  <button
                    type="button"
                    className="cr5-history-main"
                    onClick={() => loadHistoryItem(item)}
                  >
                    <strong>{item?.inputs?.interest || "Career Search"}</strong>
                    <span>{item?.inputs?.goal || "Career roadmap"}</span>
                    <small>{formatDateTime(item.createdAt)}</small>
                  </button>

                  <div className="cr5-history-actions">
                    <button
                      type="button"
                      className="cr5-delete-btn"
                      onClick={() => deleteHistoryItem(item._id)}
                      disabled={deletingId === item._id}
                    >
                      {deletingId === item._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cr5-chat cr5-result-panel" ref={resultRef}>
          {!result && !loading && !error && (
            <div className="cr5-msg ai">
              Generate a guide to see role matches, skills to build, a 90-day
              roadmap, project ideas, and interview focus areas.
            </div>
          )}

          {loading && (
            <div className="cr5-msg ai">
              Thinking through the best career direction for you...
            </div>
          )}

          {error && <div className="cr5-msg ai">{error}</div>}

          {result && (
            <div className="cr5-result-body">
              <div className="cr5-section-head">
                <h3>Career result</h3>
                <small>{formatDateTime(result.createdAt)}</small>
              </div>

              <div className="cr5-result-section">
                <h3>Profile Summary</h3>

                <div className="cr5-badge-row">
                  <span className="cr5-mini-chip">
                    Interest: {profile.interest || result?.inputs?.interest}
                  </span>
                  <span className="cr5-mini-chip">
                    Level: {profile.level || "Beginner"}
                  </span>
                  <span className="cr5-mini-chip">
                    Work Style: {profile.workStyle || result?.inputs?.workStyle || "Flexible"}
                  </span>
                  <span className="cr5-mini-chip">
                    Study Time: {profile.studyTime || result?.inputs?.studyTime || "5-7 hrs/week"}
                  </span>
                </div>

                <p className="cr5-result-text">
                  {guideData.overview || "Career guidance generated successfully."}
                </p>
              </div>

              {careerOptions.length > 0 && (
                <div className="cr5-result-section">
                  <h3>Best Career Matches</h3>

                  <div className="cr5-role-grid">
                    {careerOptions.map((option) => (
                      <div key={option.title} className="cr5-role-card">
                        <h4>{option.title}</h4>
                        <p>Match Score: {option.matchScore}%</p>
                        <p>{option.why}</p>
                        <p>
                          <strong>First Step:</strong> {option.firstStep}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {requiredSkills.length > 0 && (
                <div className="cr5-result-section">
                  <h3>Skills To Build</h3>

                  <div className="cr5-badge-row">
                    {requiredSkills.map((item) => (
                      <span key={item} className="cr5-mini-chip">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {roadmap.length > 0 && (
                <div className="cr5-result-section">
                  <h3>Roadmap</h3>

                  <div className="cr5-roadmap">
                    {roadmap.map((phase) => (
                      <div key={phase.phase} className="cr5-roadmap-card">
                        <h4>{phase.phase}</h4>

                        <ul>
                          {phase.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {projects.length > 0 && (
                <div className="cr5-result-section">
                  <h3>Portfolio Projects</h3>

                  <ul className="cr5-list">
                    {projects.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {interviewFocus.length > 0 && (
                <div className="cr5-result-section">
                  <h3>Interview Focus</h3>

                  <ul className="cr5-list">
                    {interviewFocus.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {nextSteps.length > 0 && (
                <div className="cr5-result-section">
                  <h3>Immediate Next Steps</h3>

                  <ul className="cr5-list">
                    {nextSteps.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="cr5-result-section">
                <h3>Detailed AI Guidance</h3>

                <div className="cr5-msg ai" style={{ whiteSpace: "pre-wrap" }}>
                  {result.guide}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CareerAI;
