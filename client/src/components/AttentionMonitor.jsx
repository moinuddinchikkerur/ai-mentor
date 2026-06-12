import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const FLOATING_STORAGE_KEY = "monitorFloatingPosition";
const FLOATING_DEFAULT_TOP = 84;
const FLOATING_DEFAULT_RIGHT_GAP = 10;
const FLOATING_DEFAULT_WIDTH = 270;
const FLOATING_MARGIN = 8;

const createSessionId = () => {
  return `attention_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const formatSeconds = (seconds) => {
  const total = Number(seconds || 0);

  if (total <= 0) return "0m";

  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

const isStudySubject = (value) => {
  const subject = String(value || "").trim().toLowerCase();

  if (!subject) return false;

  return !["break", "revision", "-", "none", "free"].includes(subject);
};

const getDefaultFloatingPosition = () => {
  if (typeof window === "undefined") {
    return {
      top: FLOATING_DEFAULT_TOP,
      left: FLOATING_MARGIN
    };
  }

  return {
    top: FLOATING_DEFAULT_TOP,
    left: Math.max(
      FLOATING_MARGIN,
      window.innerWidth - FLOATING_DEFAULT_WIDTH - FLOATING_DEFAULT_RIGHT_GAP
    )
  };
};

const getInitialFloatingPosition = () => {
  try {
    const raw = localStorage.getItem(FLOATING_STORAGE_KEY);

    if (!raw) {
      return getDefaultFloatingPosition();
    }

    const parsed = JSON.parse(raw);

    if (Number.isFinite(parsed?.top) && Number.isFinite(parsed?.left)) {
      return {
        top: parsed.top,
        left: parsed.left
      };
    }
  } catch {}

  return getDefaultFloatingPosition();
};

const getPlanSubjects = () => {
  try {
    const raw = localStorage.getItem("activePlan");

    if (!raw) return [];

    const plan = JSON.parse(raw);

    if (!plan || typeof plan !== "object") return [];

    const subjects = new Set();

    Object.values(plan).forEach((daySlots) => {
      Object.values(daySlots || {}).forEach((subject) => {
        const value = String(subject || "").trim();

        if (isStudySubject(value)) {
          subjects.add(value);
        }
      });
    });

    return Array.from(subjects);
  } catch {
    return [];
  }
};

const getCurrentTimetableInfo = () => {
  try {
    const raw = localStorage.getItem("activePlan");

    if (!raw) {
      return {
        displaySubject: "No active timetable",
        saveSubject: "General",
        slotText: "No slot",
        allowManualSubject: true
      };
    }

    const plan = JSON.parse(raw);

    if (!plan || typeof plan !== "object") {
      return {
        displaySubject: "No active timetable",
        saveSubject: "General",
        slotText: "No slot",
        allowManualSubject: true
      };
    }

    const now = new Date();
    const day = now.toLocaleString("en-US", { weekday: "long" });
    const hour = now.getHours();

    const slotIndex = hour >= 9 && hour < 17 ? hour - 9 : -1;

    if (slotIndex === -1) {
      return {
        displaySubject: "Outside study hours",
        saveSubject: "General",
        slotText: `${day} | No active slot`,
        allowManualSubject: true
      };
    }

    const slotKey = timeOrder[slotIndex];
    const todayPlan = plan?.[day];

    if (!todayPlan) {
      return {
        displaySubject: "No subject set",
        saveSubject: "General",
        slotText: `${day} | ${slotKey}`,
        allowManualSubject: true
      };
    }

    const rawSubject =
      todayPlan[slotKey] || todayPlan[oldTimeKeys[slotKey]] || "";
    const subject = String(rawSubject || "").trim();

    if (!subject) {
      return {
        displaySubject: "No subject set",
        saveSubject: "General",
        slotText: `${day} | ${slotKey}`,
        allowManualSubject: true
      };
    }

    if (!isStudySubject(subject)) {
      return {
        displaySubject: subject,
        saveSubject: "General",
        slotText: `${day} | ${slotKey}`,
        allowManualSubject: true
      };
    }

    return {
      displaySubject: subject,
      saveSubject: subject,
      slotText: `${day} | ${slotKey}`,
      allowManualSubject: false
    };
  } catch {
    return {
      displaySubject: "No active timetable",
      saveSubject: "General",
      slotText: "No slot",
      allowManualSubject: true
    };
  }
};

const getScoreFromTimes = (totalTime, absentTime) => {
  const total = Number(totalTime || 0);
  const absent = Number(absentTime || 0);

  if (total <= 0) return 100;

  return Math.max(
    0,
    Math.min(100, Math.round(((total - absent) / total) * 100))
  );
};

function AttentionMonitor({ floating = true }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const poseRef = useRef(null);
  const streamRef = useRef(null);

  const dragRef = useRef({
    active: false,
    offsetX: 0,
    offsetY: 0
  });

  const saveIntervalRef = useRef(null);
  const trackingIntervalRef = useRef(null);
  const timetableIntervalRef = useRef(null);
  const lastSavedMinuteRef = useRef(0);
  const lastSeenRef = useRef(Date.now());
  const awayAlertActiveRef = useRef(false);

  const sessionIdRef = useRef(createSessionId());
  const startedAtRef = useRef(new Date().toISOString());

  const latestRef = useRef({
    studyTime: 0,
    absentTime: 0,
    alerts: 0
  });

  const subjectRef = useRef("General");
  const subjectSourceRef = useRef("timetable");
  const subjectKeyRef = useRef("");
  const subjectReadyRef = useRef(false);

  const [status, setStatus] = useState("Starting...");
  const [isTabActive, setIsTabActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [studyTime, setStudyTime] = useState(0);
  const [absentTime, setAbsentTime] = useState(0);
  const [alerts, setAlerts] = useState(0);
  const [timetableVersion, setTimetableVersion] = useState(0);
  const [manualSubject, setManualSubject] = useState(
    localStorage.getItem("manualSubject") || ""
  );
  const [position, setPosition] = useState(getInitialFloatingPosition);

  const score = useMemo(() => {
    return getScoreFromTimes(studyTime, absentTime);
  }, [studyTime, absentTime]);

  const timetableInfo = useMemo(() => {
    return getCurrentTimetableInfo();
  }, [timetableVersion]);

  const availableSubjects = useMemo(() => {
    const subjects = getPlanSubjects();
    const currentManual = manualSubject.trim();

    if (currentManual && !subjects.includes(currentManual)) {
      subjects.unshift(currentManual);
    }

    return subjects;
  }, [manualSubject, timetableVersion]);

  const resolvedSubject = useMemo(() => {
    const manual = manualSubject.trim();

    if (timetableInfo.allowManualSubject && manual) {
      return manual;
    }

    return timetableInfo.saveSubject || "General";
  }, [manualSubject, timetableInfo]);

  const subjectSource = useMemo(() => {
    return timetableInfo.allowManualSubject && manualSubject.trim()
      ? "manual"
      : "timetable";
  }, [manualSubject, timetableInfo]);

  const clampFloatingPosition = useCallback((nextPosition) => {
    if (!floating || typeof window === "undefined") {
      return nextPosition;
    }

    const cardWidth = containerRef.current?.offsetWidth || FLOATING_DEFAULT_WIDTH;
    const cardHeight = containerRef.current?.offsetHeight || 320;

    const maxLeft = Math.max(
      FLOATING_MARGIN,
      window.innerWidth - cardWidth - FLOATING_MARGIN
    );
    const maxTop = Math.max(
      FLOATING_MARGIN,
      window.innerHeight - cardHeight - FLOATING_MARGIN
    );

    return {
      left: Math.min(Math.max(FLOATING_MARGIN, nextPosition.left), maxLeft),
      top: Math.min(Math.max(FLOATING_MARGIN, nextPosition.top), maxTop)
    };
  }, [floating]);

  const closeMonitor = useCallback(() => {
    localStorage.setItem("monitor", "off");
    window.dispatchEvent(new Event("monitorChanged"));
  }, []);

  const handleDragStart = useCallback((event) => {
    if (!floating) return;
    if (event.button !== 0) return;
    if (event.target.closest("button")) return;

    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect) return;

    dragRef.current = {
      active: true,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top
    };

    setIsDragging(true);
    event.preventDefault();
  }, [floating]);

  useEffect(() => {
    if (!floating) return;

    const handleMouseMove = (event) => {
      if (!dragRef.current.active) return;

      const nextPosition = clampFloatingPosition({
        left: event.clientX - dragRef.current.offsetX,
        top: event.clientY - dragRef.current.offsetY
      });

      setPosition(nextPosition);
    };

    const handleMouseUp = () => {
      if (!dragRef.current.active) return;

      dragRef.current.active = false;
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [floating, clampFloatingPosition]);

  useEffect(() => {
    if (!floating) return;

    setPosition((prev) => clampFloatingPosition(prev));
  }, [floating, clampFloatingPosition, timetableInfo.allowManualSubject]);

  useEffect(() => {
    if (!floating) return;

    const handleResize = () => {
      setPosition((prev) => clampFloatingPosition(prev));
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [floating, clampFloatingPosition]);

  useEffect(() => {
    if (!floating || isDragging) return;

    localStorage.setItem(FLOATING_STORAGE_KEY, JSON.stringify(position));
  }, [floating, isDragging, position]);

  useEffect(() => {
    if (manualSubject.trim()) {
      localStorage.setItem("manualSubject", manualSubject.trim());
    } else {
      localStorage.removeItem("manualSubject");
    }

    window.dispatchEvent(new Event("manualSubjectChange"));
  }, [manualSubject]);

  useEffect(() => {
    if (!timetableInfo.allowManualSubject && manualSubject) {
      setManualSubject("");
    }
  }, [timetableInfo.allowManualSubject, manualSubject]);

  useEffect(() => {
    latestRef.current = {
      studyTime,
      absentTime,
      alerts
    };
  }, [studyTime, absentTime, alerts]);

  useEffect(() => {
    const refreshTimetable = () => {
      setTimetableVersion((prev) => prev + 1);
    };

    window.addEventListener("storage", refreshTimetable);
    window.addEventListener("dashboardRefresh", refreshTimetable);
    window.addEventListener("activePlanChanged", refreshTimetable);

    timetableIntervalRef.current = setInterval(refreshTimetable, 30000);

    return () => {
      window.removeEventListener("storage", refreshTimetable);
      window.removeEventListener("dashboardRefresh", refreshTimetable);
      window.removeEventListener("activePlanChanged", refreshTimetable);

      if (timetableIntervalRef.current) {
        clearInterval(timetableIntervalRef.current);
        timetableIntervalRef.current = null;
      }
    };
  }, []);

  const buildPayload = useCallback(() => {
    const current = latestRef.current;

    return {
      sessionId: sessionIdRef.current,
      subject: subjectRef.current,
      subjectSource: subjectSourceRef.current,
      totalSessionTime: current.studyTime,
      absentTime: current.absentTime,
      alertsTriggered: current.alerts,
      focusLevel: getScoreFromTimes(current.studyTime, current.absentTime),
      startedAt: startedAtRef.current,
      endedAt: new Date().toISOString()
    };
  }, []);

  const persistAttention = useCallback(
    async ({ keepalive = false } = {}) => {
      const payload = buildPayload();

      if (payload.totalSessionTime <= 0) return;

      if (keepalive) {
        const token = localStorage.getItem("token");
        const baseURL = api.defaults.baseURL || "http://localhost:5000/api";

        if (!token) return;

        try {
          await fetch(`${baseURL}/attention/save`, {
            method: "POST",
            keepalive: true,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
        } catch (err) {
          console.error("Keepalive attention save failed:", err);
        }

        return;
      }

      await api.post("/attention/save", payload);
    },
    [buildPayload]
  );

  useEffect(() => {
    const nextSubject = resolvedSubject || "General";
    const nextSource = subjectSource || "timetable";
    const nextKey = `${nextSource}:${nextSubject}`;

    if (!subjectReadyRef.current) {
      subjectReadyRef.current = true;
      subjectKeyRef.current = nextKey;
      subjectRef.current = nextSubject;
      subjectSourceRef.current = nextSource;
      return;
    }

    if (subjectKeyRef.current === nextKey) {
      return;
    }

    const current = latestRef.current;
    const hasTime =
      current.studyTime > 0 ||
      current.absentTime > 0 ||
      current.alerts > 0;

    if (hasTime) {
      persistAttention().catch((err) => {
        console.error("Subject switch attention save failed:", err);
      });
    }

    sessionIdRef.current = createSessionId();
    startedAtRef.current = new Date().toISOString();

    lastSavedMinuteRef.current = 0;
    latestRef.current = {
      studyTime: 0,
      absentTime: 0,
      alerts: 0
    };

    setStudyTime(0);
    setAbsentTime(0);
    setAlerts(0);

    lastSeenRef.current = Date.now();
    awayAlertActiveRef.current = false;

    subjectKeyRef.current = nextKey;
    subjectRef.current = nextSubject;
    subjectSourceRef.current = nextSource;
  }, [resolvedSubject, subjectSource, persistAttention]);

  const stopCamera = useCallback((nextStatus = "Camera Stopped") => {
    try {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      poseRef.current = null;

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setStatus(nextStatus);
    } catch (err) {
      console.error("Stop camera failed:", err);
    }
  }, []);

  const handleResults = useCallback((results) => {
    if (results.poseLandmarks?.length) {
      lastSeenRef.current = Date.now();
      awayAlertActiveRef.current = false;
      setStatus("Body Present");
    }
  }, []);

  const startSystem = useCallback(async () => {
    try {
      if (document.visibilityState !== "visible") return;
      if (streamRef.current) return;

      if (!window.Pose || !window.Camera) {
        setStatus("Pose library missing");
        return;
      }

      const pose = new window.Pose({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      pose.onResults(handleResults);
      poseRef.current = pose;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      cameraRef.current = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (poseRef.current && videoRef.current) {
            await poseRef.current.send({
              image: videoRef.current
            });
          }
        },
        width: 640,
        height: 480
      });

      cameraRef.current.start();
      lastSeenRef.current = Date.now();
      setStatus("Monitoring Active");
    } catch (err) {
      console.error("Camera start failed:", err);
      setStatus("Camera Error");
    }
  }, [handleResults]);

  useEffect(() => {
    startSystem();

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }

      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }

      persistAttention({ keepalive: true });
      stopCamera("Camera Stopped");
    };
  }, [persistAttention, startSystem, stopCamera]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setIsTabActive(true);
        lastSeenRef.current = Date.now();
        awayAlertActiveRef.current = false;
        startSystem();
      } else {
        setIsTabActive(false);
        persistAttention().catch((err) => {
          console.error("Visibility save error:", err);
        });
        stopCamera("Monitoring Paused");
      }
    };

    const handlePageHide = () => {
      persistAttention({ keepalive: true });
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [persistAttention, startSystem, stopCamera]);

  useEffect(() => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }

    trackingIntervalRef.current = setInterval(() => {
      if (!isTabActive || !streamRef.current) return;

      setStudyTime((prev) => prev + 1);

      const missingFor = Date.now() - lastSeenRef.current;

      if (missingFor > 4000) {
        setAbsentTime((prev) => prev + 1);
        setStatus("No Body");

        if (!awayAlertActiveRef.current) {
          awayAlertActiveRef.current = true;
          setAlerts((prev) => prev + 1);
        }
      } else {
        awayAlertActiveRef.current = false;
        setStatus("Body Present");
      }
    }, 1000);

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
    };
  }, [isTabActive]);

  useEffect(() => {
    const completedMinute = Math.floor(studyTime / 60);

    if (completedMinute > 0 && completedMinute > lastSavedMinuteRef.current) {
      lastSavedMinuteRef.current = completedMinute;

      api.post("/study/save", {
        subject: resolvedSubject,
        duration: 60,
        score
      })
        .then(() => {
          window.dispatchEvent(new Event("dashboardRefresh"));
        })
        .catch((err) => {
          console.error("Study save error:", err);
        });
    }
  }, [studyTime, score, resolvedSubject]);

  useEffect(() => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
    }

    saveIntervalRef.current = setInterval(() => {
      persistAttention().catch((err) => {
        console.error("Attention save error:", err);
      });
    }, 30000);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
    };
  }, [persistAttention]);

  return (
    <div
      ref={containerRef}
      className={`AM-container ${floating ? "floating" : "embedded"} ${
        isDragging ? "dragging" : ""
      }`}
      style={
        floating
          ? {
              top: `${position.top}px`,
              left: `${position.left}px`,
              right: "auto"
            }
          : undefined
      }
    >
      <div
        className={`AM-header ${floating ? "AM-header-draggable" : ""}`}
        onMouseDown={floating ? handleDragStart : undefined}
      >
        <div className="AM-title-wrap">
          <div className="AM-title">Focus Monitor</div>
          <span className="AM-subtitle">
            {subjectSource === "manual"
              ? resolvedSubject
              : timetableInfo.displaySubject}
          </span>
        </div>

        <div className="AM-header-actions">
          <div
            className={`AM-badge ${
              !isTabActive
                ? "inactive"
                : status.includes("Present") || status.includes("Active")
                  ? "active"
                  : "inactive"
            }`}
          >
            {!isTabActive
              ? "Paused"
              : status.includes("Present")
                ? "Present"
                : status}
          </div>

          {floating && (
            <button
              type="button"
              className="AM-close-btn"
              onClick={closeMonitor}
              aria-label="Close monitor"
            >
              X
            </button>
          )}
        </div>
      </div>

      <div className="AM-subject-bar">
        {timetableInfo.allowManualSubject ? (
          <div className="AM-subject-card">
            <span className="AM-subject-label">Subject</span>

            {availableSubjects.length > 0 ? (
              <select
                className="AM-manual-select"
                value={manualSubject}
                onChange={(e) => setManualSubject(e.target.value)}
              >
                <option value="">Select subject</option>
                {availableSubjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="AM-manual-select"
                placeholder="Enter subject"
                value={manualSubject}
                onChange={(e) => setManualSubject(e.target.value)}
              />
            )}
          </div>
        ) : (
          <div className="AM-subject-card">
            <span className="AM-subject-label">Current Subject</span>
            <strong className="AM-subject-value">{resolvedSubject}</strong>
          </div>
        )}

        <div className="AM-subject-card">
          <span className="AM-subject-label">Slot</span>
          <strong className="AM-subject-value">{timetableInfo.slotText}</strong>
        </div>
      </div>

      <div className="AM-video-box">
        {isTabActive ? (
          <video ref={videoRef} className="AM-video" muted playsInline />
        ) : (
          <div className="AM-overlay">Monitoring Paused</div>
        )}
      </div>

      <div className="AM-stats-grid">
        <div className="AM-stat-card">
          <span className="AM-stat-label">Tracked</span>
          <strong className="AM-stat-value">{formatSeconds(studyTime)}</strong>
        </div>

        <div className="AM-stat-card">
          <span className="AM-stat-label">Away</span>
          <strong className="AM-stat-value">{formatSeconds(absentTime)}</strong>
        </div>

        <div className="AM-stat-card">
          <span className="AM-stat-label">Focus</span>
          <strong className="AM-stat-value">{score}%</strong>
        </div>
      </div>
    </div>
  );
}

export default AttentionMonitor;