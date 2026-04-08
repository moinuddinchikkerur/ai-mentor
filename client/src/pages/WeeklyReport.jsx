import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function WeeklyReport() {

  const [report, setReport] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {

    const fetchReport = async () => {
      try {

        const res = await axios.get(
          "http://localhost:5000/api/report/weekly",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        setReport(res.data.report);

      } catch (err) {
        alert("Report load failed ❌");
      }
    };

    fetchReport();

  }, []);

  return (
    <div className="report-container">

      <div className="report-box">

        <h1>📄 Weekly Report</h1>

        {!report ? (
          <p>Loading...</p>
        ) : (
          <>
            <p><b>Week:</b> {report.week}</p>
            <p><b>Planned Hours:</b> {report.plannedHours}</p>
            <p><b>Completed:</b> {report.completedHours}</p>
            <p><b>Pending:</b> {report.pendingHours}</p>

            <h3>Subjects</h3>

            {Object.keys(report.subjects).map((s, i) => (
              <p key={i}>
                {s}: {report.subjects[s]}
              </p>
            ))}

            <p><b>Pass Chance:</b> {report.passProbability}</p>

            <p><b>Suggestion:</b> {report.suggestion}</p>
          </>
        )}

        <button onClick={() => navigate("/dashboard")}>
          ⬅ Back
        </button>

      </div>

    </div>
  );
}

export default WeeklyReport;
