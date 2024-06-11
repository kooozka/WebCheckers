import axios from 'axios';

const url = `http://localhost:8080`;

export const createGame = async (login) => {
  const response = await axios.post(url + "/game/start", login, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });
  return response.data;
};

export const connectToRandom = async (login) => {
  const response = await axios.post(url + "/game/connect/random", login, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });
  return response.data;
};

export const movePiece = async (gameId, currentTurn, fromRow, fromCol, toRow, toCol, deleteRow, deleteCol) => {
  const response = await axios.post(url + "/game/gameplay", {
    color: currentTurn,
    gameMove: { fromRow, fromCol, toRow, toCol },
    gameId,
    deleteRow,
    deleteCol
  });
  return response.data;
};