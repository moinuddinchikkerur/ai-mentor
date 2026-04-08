import { useEffect, useState } from "react";
import axios from "axios";
import "../main.css";

function MCQHistory() {

  const [history,setHistory] = useState([]);
  const [selected,setSelected] = useState(null);

  useEffect(()=>{
    loadHistory();
  },[]);

  const loadHistory = async ()=>{

    const res = await axios.get(
      "http://localhost:5000/api/mcq-result/history"
    );

    setHistory(res.data.history);

  };

  const deleteItem = async(id)=>{

    await axios.delete(
      `http://localhost:5000/api/mcq-result/${id}`
    );

    loadHistory();

  };

  return(

    <div className="history-layout">

      {/* SIDEBAR */}

      <div className="history-sidebar">

        <h3>📜 MCQ History</h3>

        {history.map((item)=>(
          <div
            key={item._id}
            className="history-item"
            onClick={()=>setSelected(item)}
          >

            <span>{item.topic}</span>

            <button
              className="delete-btn"
              onClick={(e)=>{
                e.stopPropagation();
                deleteItem(item._id);
              }}
            >
              🗑
            </button>

          </div>
        ))}

      </div>


      {/* MAIN AREA */}

      <div className="history-main">

        {selected ? (

          <div className="history-result">

            <h2>{selected.topic}</h2>

            <p>
              Score: {selected.score} / {selected.totalQuestions}
            </p>

            <p>
              ✅ Correct: {selected.correctAnswers}
            </p>

            <p>
              ❌ Wrong: {selected.wrongAnswers}
            </p>

            <p>
              Date: {new Date(selected.createdAt).toLocaleDateString()}
            </p>

          </div>

        ) : (

          <div className="history-empty">
            Select a history item
          </div>

        )}

      </div>

    </div>

  );

}

export default MCQHistory;