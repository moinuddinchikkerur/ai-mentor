

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCog, FaSignOutAlt } from "react-icons/fa";
import {
  authService,
  clearAuthData,
  getStoredUser,
  saveAuthData
} from "../services/api";
import "../main.css";

let profileCache = null;
let profilePromise = null;
let lastFetchTime = 0;

const CACHE_TIME = 30000;

const buildUserState = (profile = {}) => ({
  name: String(profile?.name || "").trim(),
  email: String(profile?.email || "").trim(),
  exam: String(profile?.exam || "").trim(),
  targetDate: profile?.targetDate ? String(profile.targetDate).slice(0, 10) : ""
});

const getInitialUserState = () => {
  const storedUser = getStoredUser() || {};

  return buildUserState({
    name: storedUser.name || localStorage.getItem("name") || "",
    email: storedUser.email || localStorage.getItem("email") || "",
    exam: storedUser.exam || localStorage.getItem("exam") || "",
    targetDate: storedUser.targetDate || localStorage.getItem("targetDate") || ""
  });
};

const getCountdownLabel = (value) => {
  if (!value) return "";

  const target = new Date(`${String(value).slice(0, 10)}T12:00:00`);

  if (Number.isNaN(target.getTime())) return "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diff = Math.ceil((target - today) / 86400000);

  if (diff < 0) {
    return "Target date passed";
  }

  if (diff === 0) {
    return "Target is today";
  }

  return `${diff} day${diff === 1 ? "" : "s"} left`;
};

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getInitialUserState());

  const loadProfile = useCallback(async ({ force = false } = {}) => {
    try {
      const now = Date.now();

      if (!force && profileCache && now - lastFetchTime < CACHE_TIME) {
        setUser(buildUserState(profileCache));
        return;
      }

      if (!force && profilePromise) {
        const profile = await profilePromise;
        setUser(buildUserState(profile));
        return;
      }

      profilePromise = authService.me().then((res) => {
        const profile = res.data?.user || {};

        profileCache = profile;
        lastFetchTime = Date.now();

        saveAuthData({ user: profile });
        return profile;
      });

      const profile = await profilePromise;
      setUser(buildUserState(profile));
    } catch (err) {
      console.error("Profile load failed:", err);
      setUser(getInitialUserState());
    } finally {
      profilePromise = null;
    }
  }, []);

  useEffect(() => {
    loadProfile();

    const refreshProfile = () => {
      profileCache = null;
      profilePromise = null;
      lastFetchTime = 0;
      setUser(getInitialUserState());
      loadProfile({ force: true });
    };

    const syncFromAuthChange = () => {
      const nextUser = getInitialUserState();

      profileCache = null;
      profilePromise = null;
      lastFetchTime = 0;
      setUser(nextUser);

      if (nextUser.name && nextUser.email) {
        loadProfile({ force: true });
      }
    };

    window.addEventListener("profileUpdated", refreshProfile);
    window.addEventListener("authChanged", syncFromAuthChange);

    return () => {
      window.removeEventListener("profileUpdated", refreshProfile);
      window.removeEventListener("authChanged", syncFromAuthChange);
    };
  }, [loadProfile]);

  const handleSettings = (e) => {
    e.stopPropagation();
    navigate("/profile");
  };

  const handleLogout = (e) => {
    e.stopPropagation();

    profileCache = null;
    profilePromise = null;
    lastFetchTime = 0;

    clearAuthData();
    navigate("/", { replace: true });
  };

  const targetCountdown = useMemo(() => {
    return getCountdownLabel(user.targetDate);
  }, [user.targetDate]);

  const statusText = useMemo(() => {
    return user.exam || "Profile active";
  }, [user.exam]);

  if (!user.name || !user.email) return null;

  const firstLetter = user.name.charAt(0).toUpperCase();

  return (
    <div className="profile-container">
      <div className="profile-avatar">
        {firstLetter}
      </div>

      <div className="profile-details">
        <p className="profile-name">{user.name}</p>
        <p className="profile-email">{user.email}</p>

        <div className="profile-status">
          <span className="status-dot"></span>
          {statusText}
        </div>

        {targetCountdown && (
          <p className="profile-target">
            {targetCountdown}
          </p>
        )}
      </div>

      <div className="profile-actions-side">
        <button
          className="icon-btn"
          onClick={handleSettings}
          title="Profile Settings"
          type="button"
        >
          <FaCog />
        </button>

        <button
          className="icon-btn logout-icon"
          onClick={handleLogout}
          title="Logout"
          type="button"
        >
          <FaSignOutAlt />
        </button>
      </div>
    </div>
  );
}

export default Profile;
