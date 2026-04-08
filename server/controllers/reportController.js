import { generateWeeklyReport } from "../services/reportService.js";

export const getWeeklyReport = async (req, res) => {
  try {

    const { userId } = req.params;

    const report = await generateWeeklyReport(userId);

    res.json({
      success: true,
      report
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      msg: "Report generation failed"
    });
  }
};
