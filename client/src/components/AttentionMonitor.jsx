import React, { useEffect, useRef, useState } from "react";
import "../main.css";

function AttentionMonitor() {

  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const poseRef = useRef(null);
  const streamRef = useRef(null);

  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);

  const [session, setSession] = useState(0);
  const [absent, setAbsent] = useState(0);
  const [alerts, setAlerts] = useState(0);
  const [status, setStatus] = useState("Starting...");

  const [isTabActive, setIsTabActive] = useState(true);
  const [studyTime, setStudyTime] = useState(0);

  const [manualSubject, setManualSubject] = useState("");

  const alertPlayedRef = useRef(false);

  // 🔥 SAVE SUBJECT + TRIGGER DASHBOARD UPDATE (FIX)
  useEffect(() => {
    localStorage.setItem("manualSubject", manualSubject);

    // 🔥 VERY IMPORTANT
    window.dispatchEvent(new Event("manualSubjectChange"));

  }, [manualSubject]);

  // DRAG
  const onMouseDown = () => setDragging(true);
  const onMouseUp = () => setDragging(false);

  const onMouseMove = (e) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - 150,
      y: e.clientY - 80
    });
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging]);

  // 🔥 CAMERA STOP
  const stopCamera = () => {
    try {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setStatus("Camera Stopped ⛔");

    } catch {}
  };

  useEffect(() => {
    startSystem();
  }, []);

  // TAB SWITCH
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setIsTabActive(true);
        if (!streamRef.current) startSystem();
      } else {
        setIsTabActive(false);
        stopCamera();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // CLEANUP
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // TIMER
  useEffect(() => {
    const interval = setInterval(() => {
      setStudyTime(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // AUTO SUBJECT
  const getAutoSubject = () => {
    try {
      const plan = JSON.parse(localStorage.getItem("activePlan"));
      if (!plan) return "General";

      const now = new Date();
      const day = now.toLocaleString("en-US", { weekday: "long" });

      let hour = now.getHours();
      let nextHour = hour + 1;

      const formatTime = (h1, h2) => {
        const f = (h) => (h > 12 ? h - 12 : h) + ":00";
        return `${f(h1)}-${f(h2)}`;
      };

      const slot = formatTime(hour, nextHour);

      return plan?.[day]?.[slot] || "General";

    } catch {
      return "General";
    }
  };

  const getCurrentSubject = () => {
    return manualSubject || getAutoSubject();
  };

  // SEND DATA
  useEffect(() => {
    if (studyTime > 0 && studyTime % 60 === 0) {
      fetch("http://localhost:5000/api/study/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: "moin123",
          subject: getCurrentSubject(),
          duration: 60
        })
      });
    }
  }, [studyTime, manualSubject]);

  const startSystem = async () => {
    try {
      if (streamRef.current) return;

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

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      cameraRef.current = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (poseRef.current) {
            await poseRef.current.send({
              image: videoRef.current
            });
          }
        },
        width: 640,
        height: 480
      });

      cameraRef.current.start();

      setStatus("Monitoring Active ✅");

    } catch (err) {
      console.error(err);
      setStatus("Camera Error ❌");
    }
  };

  const handleResults = (results) => {
    setSession(s => s + 1);

    if (results.poseLandmarks?.length) {
      setAbsent(0);
      setStatus("Body Present ✅");
    } else {
      setAbsent(a => a + 1);
      setStatus("No Body ⚠️");
    }
  };

  const getScore = () => {
    if (session === 0) return 100;
    return Math.max(0, 100 - (absent / session) * 100);
  };

  return (
    <div className="AM-container floating" style={{ top: position.y, left: position.x, position: "fixed", zIndex: 9999 }}>

      <div className="AM-header drag-handle" onMouseDown={onMouseDown}>
        <div className="AM-title">Live Monitor</div>

        <div className={`AM-badge ${status.includes("Present") ? "active" : "inactive"}`}>
          {status}
        </div>
      </div>

      <div className="AM-subject-select">
        <select value={manualSubject} onChange={(e) => setManualSubject(e.target.value)}>
          <option value="">Auto (Timetable)</option>
          <option value="Java">Java</option>
          <option value="C">C</option>
          <option value="Python">Python</option>
          <option value="DBMS">DBMS</option>
        </select>
      </div>

      <div className="AM-video-box">
        {isTabActive ? (
          <video ref={videoRef} className="AM-video" muted playsInline />
        ) : (
          <div className="AM-overlay">Monitoring Paused ⏸️</div>
        )}
      </div>

      <div className="AM-focus">
        <div className="AM-focus-text">
          Focus Level: {getScore().toFixed(0)}%
        </div>
      </div>

    </div>
  );
}

export default AttentionMonitor;