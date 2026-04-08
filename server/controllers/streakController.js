import Streak from "../models/Streak.js";

export const updateStreak = async (req, res) => {
  try {

    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    let streak = await Streak.findOne({ userId });

    const today = new Date();
    today.setHours(0,0,0,0);

    if (!streak) {

      streak = new Streak({
        userId,
        days: 1,
        points: 10,
      });

    } else {

      const last = new Date(streak.lastActive);
      last.setHours(0,0,0,0);

      const diff =
        (today - last) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        // Continue streak
        streak.days += 1;
        streak.points += 5;
      }

      if (diff > 1) {
        // Reset streak
        streak.days = 1;
        streak.points = 10;
      }

      streak.lastActive = new Date();
    }

    await streak.save();

    res.json({
      success: true,
      streak,
    });

  } catch (err) {

    console.error("❌ Streak Error:", err);

    res.status(500).json({
      success: false,
      message: "Streak update failed",
    });
  }
};