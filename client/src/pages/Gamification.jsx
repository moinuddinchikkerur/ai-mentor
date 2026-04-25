








import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../main.css";

const API_BASE = "http://localhost:5000/api";
const PLAY_HISTORY_KEY = "gamePlayHistory";
const FAVORITES_KEY = "favoriteGames";
const LAST_PLAYED_KEY = "lastPlayedGame";
const REWARD_PREFIX = "gameRewardAt:";
const DAILY_CHALLENGE_PREFIX = "dailyChallengeClaim:";
const REWARD_COOLDOWN_MS = 10 * 60 * 1000;
const DAILY_CHALLENGE_GOAL = 3;
const HISTORY_LIMIT = 30;

const internalGames = [
  {
    key: "chess",
    name: "Chess",
    category: "Strategy",
    description: "Build patience, planning, and pattern recognition.",
    rewardPoints: 3,
    mode: "internal",
    url: "https://playpager.com/embed/chess/index.html"
  },
  {
    key: "snake",
    name: "Snake",
    category: "Arcade",
    description: "Sharpen reaction speed and control under pressure.",
    rewardPoints: 2,
    mode: "internal",
    url: "https://playsnake.org/embed"
  },
  {
    key: "tictactoe",
    name: "Tic Tac Toe",
    category: "Strategy",
    description: "Quick tactical decisions with fast rounds.",
    rewardPoints: 2,
    mode: "internal",
    url: "https://playpager.com/embed/tic-tac-toe/index.html"
  }
];

const externalGames = [
  {
    key: "tetris",
    name: "Tetris",
    category: "Puzzle",
    description: "Improve visual planning and speed.",
    rewardPoints: 2,
    mode: "external",
    url: "https://tetris.com/play-tetris"
  },
  {
    key: "pong",
    name: "Pong",
    category: "Arcade",
    description: "Train timing and hand-eye coordination.",
    rewardPoints: 2,
    mode: "external",
    url: "https://plays.org/game/pong/"
  },
  {
    key: "memory",
    name: "Memory",
    category: "Memory",
    description: "Strengthen short-term recall and focus.",
    rewardPoints: 2,
    mode: "external",
    url: "https://plays.org/game/memory/"
  },
  {
    key: "sudoku",
    name: "Sudoku",
    category: "Puzzle",
    description: "Practice logic, consistency, and mental stamina.",
    rewardPoints: 3,
    mode: "external",
    url: "https://sudoku.com"
  },
  {
    key: "game2048",
    name: "2048",
    category: "Puzzle",
    description: "Blend strategy with number intuition.",
    rewardPoints: 2,
    mode: "external",
    url: "https://play2048.co/"
  }
];

const allGames = [...internalGames, ...externalGames];
const categories = ["All", "Strategy", "Arcade", "Puzzle", "Memory"];

const readStoredArray = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});

const getLevelMeta = (points = 0) => {
  if (points < 50) {
    return {
      label: "Beginner",
      icon: "🟢",
      currentFloor: 0,
      nextTarget: 50
    };
  }

  if (points < 120) {
    return {
      label: "Intermediate",
      icon: "🔵",
      currentFloor: 50,
      nextTarget: 120
    };
  }

  if (points < 250) {
    return {
      label: "Advanced",
      icon: "🟣",
      currentFloor: 120,
      nextTarget: 250
    };
  }

  return {
    label: "Master",
    icon: "🔥",
    currentFloor: 250,
    nextTarget: null
  };
};

const formatCooldown = (milliseconds) => {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

function Gamification() {
  const [selectedGameKey, setSelectedGameKey] = useState("");
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [playHistory, setPlayHistory] = useState([]);
  const [dailyClaimed, setDailyClaimed] = useState(false);

  const todayKey = getTodayKey();

  const selectedGame = useMemo(() => {
    return internalGames.find((item) => item.key === selectedGameKey) || null;
  }, [selectedGameKey]);

  const levelMeta = useMemo(() => {
    return getLevelMeta(streak?.points || 0);
  }, [streak]);

  const levelProgress = useMemo(() => {
    const points = streak?.points || 0;

    if (!levelMeta.nextTarget) return 100;

    const span = levelMeta.nextTarget - levelMeta.currentFloor;
    const current = points - levelMeta.currentFloor;

    return Math.max(0, Math.min(100, Math.round((current / span) * 100)));
  }, [streak, levelMeta]);

  const todayPlayed = useMemo(() => {
    return playHistory.filter((item) => item.dayKey === todayKey);
  }, [playHistory, todayKey]);

  const uniqueGamesPlayed = useMemo(() => {
    return new Set(playHistory.map((item) => item.key)).size;
  }, [playHistory]);

  const lastPlayedGame = useMemo(() => {
    const key = localStorage.getItem(LAST_PLAYED_KEY);
    return allGames.find((item) => item.key === key) || null;
  }, [playHistory]);

  const filteredGames = useMemo(() => {
    return allGames.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  const achievements = useMemo(() => {
    const streakDays = streak?.days || 0;
    const points = streak?.points || 0;
    const gamesPlayed = streak?.gamesPlayed || playHistory.length;

    return [
      {
        id: "first-step",
        title: "First Step",
        icon: "⭐",
        unlocked: streakDays >= 1,
        progress: Math.min(streakDays, 1),
        goal: 1
      },
      {
        id: "3-day-streak",
        title: "3 Day Streak",
        icon: "🔥",
        unlocked: streakDays >= 3,
        progress: Math.min(streakDays, 3),
        goal: 3
      },
      {
        id: "weekly-warrior",
        title: "Weekly Warrior",
        icon: "🏆",
        unlocked: streakDays >= 7,
        progress: Math.min(streakDays, 7),
        goal: 7
      },
      {
        id: "point-collector",
        title: "Point Collector",
        icon: "💎",
        unlocked: points >= 100,
        progress: Math.min(points, 100),
        goal: 100
      },
      {
        id: "brain-gamer",
        title: "Brain Gamer",
        icon: "🎮",
        unlocked: gamesPlayed >= 5,
        progress: Math.min(gamesPlayed, 5),
        goal: 5
      },
      {
        id: "explorer",
        title: "Game Explorer",
        icon: "🧭",
        unlocked: uniqueGamesPlayed >= 4,
        progress: Math.min(uniqueGamesPlayed, 4),
        goal: 4
      }
    ];
  }, [streak, playHistory, uniqueGamesPlayed]);

  const loadStreak = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API_BASE}/streak/me`, getAuthHeader());

      if (res.data.success) {
        setStreak(res.data.streak);
      }
    } catch (err) {
      console.error("Streak load failed", err);
      setError("Unable to load game progress right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setFavorites(readStoredArray(FAVORITES_KEY));
    setPlayHistory(readStoredArray(PLAY_HISTORY_KEY));
    setDailyClaimed(
      localStorage.getItem(`${DAILY_CHALLENGE_PREFIX}${todayKey}`) === "claimed"
    );

    const lastGame = localStorage.getItem(LAST_PLAYED_KEY);

    if (lastGame && internalGames.some((item) => item.key === lastGame)) {
      setSelectedGameKey(lastGame);
    }

    loadStreak();
  }, [loadStreak, todayKey]);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [message]);

  const saveHistoryEntry = (gameItem) => {
    const nextHistory = [
      {
        key: gameItem.key,
        name: gameItem.name,
        mode: gameItem.mode,
        playedAt: new Date().toISOString(),
        dayKey: todayKey
      },
      ...playHistory
    ].slice(0, HISTORY_LIMIT);

    setPlayHistory(nextHistory);
    localStorage.setItem(PLAY_HISTORY_KEY, JSON.stringify(nextHistory));
    localStorage.setItem(LAST_PLAYED_KEY, gameItem.key);
  };

  const toggleFavorite = (gameKey) => {
    const nextFavorites = favorites.includes(gameKey)
      ? favorites.filter((item) => item !== gameKey)
      : [...favorites, gameKey];

    setFavorites(nextFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavorites));
  };

  const rewardGame = async (gameItem, customPoints = null, customReason = "") => {
    try {
      const rewardKey = `${REWARD_PREFIX}${gameItem.key}`;
      const lastRewardAt = Number(localStorage.getItem(rewardKey) || 0);
      const remaining = REWARD_COOLDOWN_MS - (Date.now() - lastRewardAt);

      if (remaining > 0) {
        setMessage(
          `Reward cooldown active for ${gameItem.name}. Try again in ${formatCooldown(remaining)}.`
        );
        return false;
      }

      setRewardLoading(true);

      const res = await axios.post(
        `${API_BASE}/streak/reward`,
        {
          reason: customReason || `Played ${gameItem.name}`,
          points: customPoints ?? gameItem.rewardPoints
        },
        getAuthHeader()
      );

      if (res.data.success) {
        setStreak(res.data.streak);
        localStorage.setItem(rewardKey, String(Date.now()));
        setMessage(
          `${customPoints ?? gameItem.rewardPoints} points added for ${gameItem.name}.`
        );
        return true;
      }

      return false;
    } catch (err) {
      console.error("Reward failed", err);
      setError("Reward could not be added right now.");
      return false;
    } finally {
      setRewardLoading(false);
    }
  };

  const openInternalGame = async (gameItem) => {
    setSelectedGameKey(gameItem.key);
    saveHistoryEntry(gameItem);
    await rewardGame(gameItem);
  };

  const openExternalGame = async (gameItem) => {
    window.open(gameItem.url, "_blank", "noopener,noreferrer");
    saveHistoryEntry(gameItem);
    await rewardGame(gameItem);
  };

  const handlePlayGame = async (gameItem) => {
    setError("");

    if (gameItem.mode === "internal") {
      await openInternalGame(gameItem);
      return;
    }

    await openExternalGame(gameItem);
  };

  const handleClaimDailyChallenge = async () => {
    if (todayPlayed.length < DAILY_CHALLENGE_GOAL || dailyClaimed) {
      return;
    }

    try {
      setClaimLoading(true);
      const challengeGame = {
        key: "daily-challenge",
        name: "Daily Challenge",
        rewardPoints: 8
      };

      const claimed = await rewardGame(
        challengeGame,
        8,
        `Completed daily challenge with ${todayPlayed.length} games`
      );

      if (claimed) {
        localStorage.setItem(
          `${DAILY_CHALLENGE_PREFIX}${todayKey}`,
          "claimed"
        );
        setDailyClaimed(true);
      }
    } finally {
      setClaimLoading(false);
    }
  };

  const recentActivity = playHistory.slice(0, 5);

  return (
    <div className="layout">
      <Sidebar />

      <div className="main-content">
        <h1>Gamification Center</h1>
        <p className="da-welcome">
          Play smart, keep your streak alive, unlock rewards, and come back with better focus.
        </p>

        {error && <p className="da-error">{error}</p>}
        {message && <p className="da-info">{message}</p>}

        <div className="da-progress">
          <h3>Your Game Progress</h3>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="da-progress-grid">
              <div>🔥 Streak: {streak?.days || 0} Days</div>
              <div>⭐ Points: {streak?.points || 0}</div>
              <div>
                🎯 Level: {levelMeta.label} {levelMeta.icon}
              </div>
            </div>
          )}

          {!loading && (
            <div style={{ marginTop: "16px" }}>
              <div
                style={{
                  height: "10px",
                  background: "#f3e8ff",
                  borderRadius: "999px",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    width: `${levelProgress}%`,
                    height: "100%",
                    background: "linear-gradient(135deg, #c026d3, #a855f7)"
                  }}
                />
              </div>

              <p style={{ marginTop: "10px" }}>
                {levelMeta.nextTarget
                  ? `${Math.max(levelMeta.nextTarget - (streak?.points || 0), 0)} points to reach the next level`
                  : "Top level unlocked"}
              </p>
            </div>
          )}
        </div>

        <div className="da-progress">
          <h3>Daily Challenge</h3>

          <div className="da-progress-grid">
            <div>🎯 Goal: Play {DAILY_CHALLENGE_GOAL} games today</div>
            <div>🕹️ Progress: {todayPlayed.length}/{DAILY_CHALLENGE_GOAL}</div>
            <div>{dailyClaimed ? "✅ Reward claimed" : "🎁 Reward: 8 points"}</div>
          </div>

          <div style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              className="view-plan-btn"
              type="button"
              onClick={handleClaimDailyChallenge}
              disabled={
                claimLoading ||
                dailyClaimed ||
                todayPlayed.length < DAILY_CHALLENGE_GOAL
              }
            >
              {claimLoading ? "Claiming..." : "Claim Daily Reward"}
            </button>

            {lastPlayedGame && (
              <button
                className="monitor-start"
                type="button"
                onClick={() => handlePlayGame(lastPlayedGame)}
              >
                Continue {lastPlayedGame.name}
              </button>
            )}
          </div>
        </div>

        <div className="da-progress">
          <h3>Achievements</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px"
            }}
          >
            {achievements.map((badge) => (
              <div
                key={badge.id}
                className="da-card"
                style={{ cursor: "default" }}
              >
                <h2 style={{ fontSize: "18px" }}>
                  {badge.icon} {badge.title}
                </h2>
                <p>
                  {badge.unlocked
                    ? "Unlocked"
                    : `${badge.progress}/${badge.goal} progress`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="da-progress">
            <h3>Favorites</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px"
              }}
            >
              {allGames
                .filter((item) => favorites.includes(item.key))
                .map((item) => (
                  <div key={item.key} className="da-card">
                    <h2 style={{ fontSize: "20px" }}>{item.name}</h2>
                    <p>{item.category}</p>

                    <div
                      style={{
                        marginTop: "14px",
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        justifyContent: "center"
                      }}
                    >
                      <button
                        className="view-plan-btn"
                        type="button"
                        onClick={() => handlePlayGame(item)}
                      >
                        Play
                      </button>

                      <button
                        className="monitor-stop"
                        type="button"
                        onClick={() => toggleFavorite(item.key)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="da-progress">
          <h3>Game Library</h3>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "18px"
            }}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games"
              style={{
                minWidth: "220px",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid #ead5ff"
              }}
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                minWidth: "180px",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid #ead5ff"
              }}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <div style={{ alignSelf: "center" }}>
              {rewardLoading ? "Adding reward..." : `${filteredGames.length} games found`}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px"
            }}
          >
            {filteredGames.map((item) => (
              <div key={item.key} className="da-card">
                <h2 style={{ fontSize: "20px" }}>{item.name}</h2>
                <p>{item.category}</p>

                <p
                  style={{
                    marginTop: "12px",
                    color: "#4b4458",
                    fontSize: "14px",
                    minHeight: "42px"
                  }}
                >
                  {item.description}
                </p>

                <p style={{ marginTop: "10px", fontSize: "13px" }}>
                  {item.mode === "internal"
                    ? "Playable inside website"
                    : "Opens in a new tab"}
                </p>

                <div
                  style={{
                    marginTop: "14px",
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    justifyContent: "center"
                  }}
                >
                  <button
                    className="view-plan-btn"
                    type="button"
                    onClick={() => handlePlayGame(item)}
                  >
                    Play
                  </button>

                  <button
                    className="monitor-start"
                    type="button"
                    onClick={() => toggleFavorite(item.key)}
                  >
                    {favorites.includes(item.key) ? "Unfavorite" : "Favorite"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedGame && (
          <div className="da-progress">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "16px",
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: "16px"
              }}
            >
              <div>
                <h3>{selectedGame.name}</h3>
                <p style={{ marginTop: "8px" }}>{selectedGame.description}</p>
              </div>

              <button
                className="monitor-stop"
                type="button"
                onClick={() => setSelectedGameKey("")}
              >
                Close Game
              </button>
            </div>

            <iframe
              src={selectedGame.url}
              width="100%"
              height="640"
              title={selectedGame.name}
              style={{
                border: "none",
                borderRadius: "10px",
                background: "#f8f2ff"
              }}
            />
          </div>
        )}

        <div className="da-progress">
          <h3>Recent Activity</h3>

          {recentActivity.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px"
              }}
            >
              {recentActivity.map((item, index) => (
                <div key={`${item.key}-${item.playedAt}-${index}`} className="da-card">
                  <h2 style={{ fontSize: "18px" }}>{item.name}</h2>
                  <p>{item.mode === "internal" ? "Played inside website" : "Opened external game"}</p>
                  <p style={{ marginTop: "10px", fontSize: "13px" }}>
                    {new Date(item.playedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No game activity yet. Start with one quick round.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Gamification;
