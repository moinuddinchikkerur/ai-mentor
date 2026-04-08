import { useState } from "react";

function Gamification() {

  const [game, setGame] = useState("");

  // Games that work inside iframe
  const games = {
    chess: "https://playpager.com/embed/chess/index.html",
    snake: "https://playsnake.org/embed",
    tictactoe: "https://playpager.com/embed/tic-tac-toe/index.html"
  };

  // Games that must open in new tab
  const externalGames = {
    tetris: "https://tetris.com/play-tetris",
    pong: "https://plays.org/game/pong/",
    memory: "https://plays.org/game/memory/",
    sudoku: "https://sudoku.com",
    game2048: "https://play2048.co/"
  };

  return (

    <div style={{ padding: "20px" }}>

      <h1>🎮 Gamification Center</h1>
      <p>Play games and earn points</p>

      {/* Games inside website */}

      <h3>Play inside website</h3>

      <div style={{ marginBottom: "20px" }}>

        {Object.keys(games).map((g) => (
          <button
            key={g}
            onClick={() => setGame(g)}
            style={{
              margin: "5px",
              padding: "10px 15px",
              cursor: "pointer",
              borderRadius: "6px"
            }}
          >
            Play {g}
          </button>
        ))}

      </div>

      {/* Games opening new tab */}

      <h3>More Games</h3>

      <div style={{ marginBottom: "20px" }}>

        {Object.keys(externalGames).map((g) => (
          <button
            key={g}
            onClick={() => window.open(externalGames[g], "_blank")}
            style={{
              margin: "5px",
              padding: "10px 15px",
              cursor: "pointer",
              borderRadius: "6px"
            }}
          >
            Play {g}
          </button>
        ))}

      </div>

      {/* Game viewer */}

      {game && (

        <div
          style={{
            marginTop: "20px",
            background: "#f3f3f3",
            borderRadius: "12px",
            padding: "10px"
          }}
        >

          <iframe
            src={games[game]}
            width="100%"
            height="600"
            title="game"
            style={{ border: "none", borderRadius: "10px" }}
          />

        </div>

      )}

    </div>

  );

}

export default Gamification;