


import Streak from "../models/Streak.js";

const getDefaultStreak = async (userId) => {
  let streak = await Streak.findOne({ userId });

  if (!streak) {
    streak = await Streak.create({
      userId,
      days: 0,
      points: 0,
      gamesPlayed: 0,
      rewards: []
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!streak) {
      streak = new Streak({
        userId,
        days: 1,
        points: 10,
        gamesPlayed: 0,
        rewards: [
          {
            reason: "Daily login",
            points: 10
          }
        ],
        lastActive: new Date()
      });
    } else {
      const last = new Date(streak.lastActive);
      last.setHours(0, 0, 0, 0);

      const diff = (today - last) / (1000 * 60 * 60 * 24);

      if (diff === 0) {
        // already counted today
      } else if (diff === 1) {
        streak.days += 1;
        streak.points += 5;
        streak.rewards.push({
          reason: "Daily streak",
          points: 5
        });
      } else if (diff > 1) {
        streak.days = 1;
        streak.points += 10;
        streak.rewards.push({
          reason: "Streak restarted",
          points: 10
        });
      }

      streak.lastActive = new Date();
    }

    await streak.save();

    res.json({
      success: true,
      streak
    });

  } catch (err) {
    console.error("❌ Streak Error:", err);

    res.status(500).json({
      success: false,
      message: "Streak update failed"
    });
  }
};

export const getMyStreak = async (req, res) => {
  try {
    const streak = await getDefaultStreak(req.user.id);

    res.json({
      success: true,
      streak
    });

  } catch (err) {
    console.error("❌ Get Streak Error:", err);

    res.status(500).json({
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

    res.json({
      success: true,
      streak
    });

  } catch (err) {
    console.error("❌ Reward Error:", err);

    res.status(500).json({
      success: false,
      message: "Reward failed"
    });
  }
};





