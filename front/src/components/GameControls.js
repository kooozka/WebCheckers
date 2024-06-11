import React from 'react';

const GameControls = ({
  login,
  gameId,
  handleLoginChange,
  handleGameIdChange,
  handleCreateGame,
  handleConnectToRandom
}) => {
  return (
    <div className="game-controls">
      <h1>Gra w Warcaby</h1>
      <input
        type="text"
        id="login"
        placeholder="Enter your login"
        value={login}
        onChange={handleLoginChange}
        className="game-input"
      />
      <input
        type="text"
        id="gameId"
        placeholder="Enter game ID"
        value={gameId}
        onChange={handleGameIdChange}
        className="game-input"
      />
      <button onClick={handleCreateGame} className="game-button">
        Create Game
      </button>
      <button onClick={handleConnectToRandom} className="game-button">
        Connect to Random Game
      </button>
    </div>
  );
};

export default GameControls;