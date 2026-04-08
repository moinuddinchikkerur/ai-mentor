import React, { useEffect, useRef, useState } from "react";
import "../main.css"; // ✅ Import CSS

function AttentionMonitor() {

  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const poseRef = useRef(null);
  const streamRef = useRef(null);

  const [session, setSession] = useState(0);
  const [absent, setAbsent] = useState(0);
  const [alerts, setAlerts] = useState(0);
  const [status, setStatus] = useState("Starting...");

  useEffect(() => {

    startSystem();

    const handleVisibility = () => {
      if (document.hidden) stopCamera();
      else startSystem();
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stopCamera();
      document.removeEventListener("visibilitychange", handleVisibility);
    };

  }, []);

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

  const stopCamera = () => {

    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    }

    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }

    if (poseRef.current) {
      poseRef.current.close();
      poseRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStatus("Camera Paused ⏸️");
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

  useEffect(() => {

    if (absent >= 60) {
      new Audio("/alert.mp3").play();
      setAlerts(a => a + 1);
      setAbsent(0);
    }

  }, [absent]);

  const getScore = () => {
    if (session === 0) return 100;
    return Math.max(0, 100 - (absent / session) * 100);
  };

  return (

  <div className="AM-container">

    {/* HEADER */}
    <div className="AM-header">

      <div className="AM-title">
        Live Monitor
      </div>

      <div
        className={`AM-badge ${
          status.includes("Active") || status.includes("Present")
            ? "active"
            : "inactive"
        }`}
      >
        {status}
      </div>

    </div>


    {/* VIDEO */}
    <div className="AM-video-box">

      <video
        ref={videoRef}
        className="AM-video"
        muted
        playsInline
        disablePictureInPicture
        controls={false}
      />

    </div>


    {/* FOCUS BAR */}
    <div className="AM-focus">

      <div className="AM-focus-text">
        Focus Level: {getScore().toFixed(0)}%
      </div>

      <div className="AM-focus-bar">
        <div
          className="AM-focus-fill"
          style={{ width: `${getScore()}%` }}
        />
      </div>

    </div>


    {/* STATS */}
    <div className="AM-stats">

      <div className="AM-stat">
        {session}s
        <br />
        Session
      </div>

      <div className="AM-stat">
        {absent}s
        <br />
        Absent
      </div>

      <div className="AM-stat">
        {alerts}
        <br />
        Alerts
      </div>

      <div className="AM-stat">
        {getScore().toFixed(0)}%
        <br />
        Score
      </div>

    </div>

  </div>
);
}

export default AttentionMonitor;