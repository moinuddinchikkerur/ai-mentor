import Streak from "../models/Streak.js";

const DAY_MS = 1000 * 60 * 60 * 24;
const DAILY_LOGIN_POINTS = 10;
const DAILY_STREAK_POINTS = 5;
const MISSED_DAY_PENALTY = 10;

const getStartOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getDayDiff = (fromDate, toDate) => {
  const from = getStartOfDay(fromDate);
  const to = getStartOfDay(toDate);

  return Math.round((to - from) / DAY_MS);
};

const getDefaultStreak = async (userId) => {
  let streak = await Streak.findOne({ userId });

  if (!streak) {
    streak = await Streak.create({
      userId,
      days: 0,
      points: 0,
      gamesPlayed: 0,
      rewards: [],
      lastActive: new Date()
    });
  }

  return streak;
};

export const updateStreak = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    let streak = await Streak.findOne({ userId });
    const now = new Date();

    if (!streak) {
      streak = new Streak({
        userId,
        days: 1,
        points: DAILY_LOGIN_POINTS,
        gamesPlayed: 0,
        rewards: [
          {
            reason: "Daily login",
            points: DAILY_LOGIN_POINTS
          }
        ],
        lastActive: now
      });

      await streak.save();

      return res.json({
        success: true,
        streak
      });
    }

    const diff = getDayDiff(streak.lastActive, now);

    if (diff === 0) {
      return res.json({
        success: true,
        streak
      });
    }

    if (diff === 1) {
      streak.days += 1;
      streak.points += DAILY_STREAK_POINTS;
      streak.rewards.push({
        reason: "Daily streak",
        points: DAILY_STREAK_POINTS
      });
    }

    if (diff > 1) {
      const missedDays = diff - 1;
      const penalty = missedDays * MISSED_DAY_PENALTY;

      streak.days = Math.max(0, streak.days - missedDays);
      streak.points = Math.max(0, streak.points - penalty);

      streak.rewards.push({
        reason: `Missed ${missedDays} day${missedDays > 1 ? "s" : ""}`,
        points: -penalty
      });
    }

    streak.lastActive = now;

    await streak.save();

    return res.json({
      success: true,
      streak
    });
  } catch (err) {
    console.error("Streak Error:", err);

    return res.status(500).json({
      success: false,
      message: "Streak update failed"
    });
  }
};

export const getMyStreak = async (req, res) => {
  try {
    const streak = await getDefaultStreak(req.user.id);

    return res.json({
      success: true,
      streak
    });
  } catch (err) {
    console.error("Get Streak Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load streak"
    });
  }
};

export const addReward = async (req, res) => {
  try {
    const { reason, points } = req.body;

    const streak = await getDefaultStreak(req.user.id);

    const rewardPoints = Math.min(Number(points || 1), 10);

    streak.points += rewardPoints;
    streak.gamesPlayed += 1;
    streak.rewards.push({
      reason: reason || "Reward",
      points: rewardPoints
    });

    await streak.save();

    return res.json({
      success: true,
      streak
    });
  } catch (err) {
    console.error("Reward Error:", err);

    return res.status(500).json({
      success: false,
      message: "Reward failed"
    });
  }
};