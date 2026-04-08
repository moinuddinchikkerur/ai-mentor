import React, { useEffect, useState } from "react";
import axios from "axios";

function AttentionReport() {

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res =
      await axios.get("/api/attention/my-report");

    setLogs(res.data);
  };

  return (
    <div style={{ padding: 20 }}>

      <h2>My Attention Report</h2>

      <table border="1" width="100%">

        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Absent</th>
            <th>Alerts</th>
            <th>Score</th>
          </tr>
        </thead>

        <tbody>

          {logs.map(l => (
            <tr key={l._id}>
              <td>
                {new Date(l.date).toLocaleDateString()}
              </td>
              <td>{l.totalSessionTime}</td>
              <td>{l.absentTime}</td>
              <td>{l.alertsTriggered}</td>
              <td>{l.focusScore}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}

export default AttentionReport;