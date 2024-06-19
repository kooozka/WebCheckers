import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import './App.css';
import { initialBoard } from './utils/board';
import Board from './components/Board';
import GameControls from './components/GameControls';
import { createGame, connectToRandom, movePiece } from './services/gameService.js';
import Public from "./components/Public";
import Protected from "./components/Protected";
import useAuth from "./hooks/useAuth";

let client = null;

function App() {
  const [board, setBoard] = useState(initialBoard());
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [gameId, setGameId] = useState('');
  const [gameOn, setGameOn] = useState(false);
  const [login, setLogin] = useState('');
  const [currentTurn, setCurrentTurn] = useState('');
  const [playerColor, setPlayerColor] = useState('');

  useEffect(() => {
    if (gameId) {
      connectToSocket(gameId);
    }
  }, [gameId]);

  const connectToSocket = (gameId) => {
    if (client && client.connected) {
      return;
    }
    client = new Client();
    client.configure({
      brokerURL: `ws://localhost:8080/gameplay`,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected');
        client.subscribe(`/topic/game-progress/${gameId}`, message => {
          const move = JSON.parse(message.body);
          console.log("data:" + move);
          displayResponse(move);
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
      debug: (str) => {
        console.log(new Date(), str);
      }
    });
    client.activate();
  };

  const handleCreateGame = async () => {
    if (!login) {
      alert("Please enter login");
      return;
    }
    try {
      const data = await createGame(login);
      setGameId(data.id);
      setCurrentTurn('W');
      setPlayerColor('W');
      alert("Your created a game. Game id is: " + data.id);
      setGameOn(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleConnectToRandom = async () => {
    if (!login) {
      alert("Please enter login");
      return;
    }
    try {
      const data = await connectToRandom(login);
      setGameId(data.id);
      setCurrentTurn('B');
      connectToSocket(data.id);
      setPlayerColor('B');
      alert("Congrats you're playing with: " + data.player1.login);
      setGameOn(true);
      displayResponse(data)
    } catch (error) {
      console.log(error);
    }
  };

  const handleLoginChange = (event) => {
    setLogin(event.target.value);
  };

  const handleGameIdChange = (event) => {
    setGameId(event.target.value);
  };

  const handleSquareClick = (row, col) => {
    const possibleTakes = checkAllPossibleTakes(currentTurn);
    if (currentTurn === playerColor) {
      const piece = board[row][col];
      if (possibleTakes.length > 0) {
        if (selectedPiece && possibleTakes.some(move => move.row === row && move.col === col)) {
          const move = possibleTakes.find(move => move.row === row && move.col === col);
          handleMovePiece(selectedPiece.row, selectedPiece.col, row, col, move.jump.row, move.jump.col);
          setPossibleMoves([]);
        } else if ((piece === currentTurn || piece === currentTurn + 'K') && possibleTakes.some(move => move.startRow === row && move.startCol === col)) {
          setSelectedPiece({ row, col });
          setPossibleMoves(calculatePossibleMoves(row, col, piece));
        }
      } else {
        if (selectedPiece && row === selectedPiece.row && col === selectedPiece.col) {
          setSelectedPiece(null);
          setPossibleMoves([]);
        } else if (selectedPiece && possibleMoves.some(move => move.row === row && move.col === col)) {
          handleMovePiece(selectedPiece.row, selectedPiece.col, row, col);
          setPossibleMoves([]);
        } else if ((piece === currentTurn) || (piece === currentTurn + 'K')) {
          setSelectedPiece({ row, col });
          setPossibleMoves(calculatePossibleMoves(row, col, piece));
        }
      }
    }
  };

  const checkAllPossibleTakes = (player) => {
    const possibleTakes = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === player || board[row][col] === player + 'K') {
          const takes = checkPossibleTake(row, col, board[row][col]);
          if (takes.length > 0) {
            possibleTakes.push(...takes);
          }
        }
      }
    }
    return possibleTakes;
  };

  const checkPossibleTake = (row, col, piece) => {
    const directions = getDirections(piece);
    const possibleMoves = [];
    const enemyPiece = piece === 'W' || piece === 'WK' ? 'B' : 'W';
    const enemyKing = piece === 'W' || piece === 'WK' ? 'BK' : 'WK';

    directions.forEach(([dRow, dCol]) => {
      const enemyRow = row + dRow;
      const enemyCol = col + dCol;
      const jumpRow = row + 2 * dRow;
      const jumpCol = col + 2 * dCol;

      if ((board[enemyRow]?.[enemyCol] === enemyPiece || board[enemyRow]?.[enemyCol] === enemyKing) && board[jumpRow]?.[jumpCol] === 'N') {
        possibleMoves.push({ row: jumpRow, col: jumpCol, startRow: row, startCol: col, jump: { row: enemyRow, col: enemyCol } });
      }
    });
    return possibleMoves;
  };

  const calculatePossibleMoves = (row, col, piece) => {
    const directions = getDirections(piece);
    const possibleMoves = [];
    const possibleTake = checkPossibleTake(row, col, piece);

    if (possibleTake.length > 0) {
      return possibleTake;
    }
    directions.forEach(([dRow, dCol]) => {
      const newRow = row + dRow;
      const newCol = col + dCol;
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 && board[newRow][newCol] === 'N') {
        possibleMoves.push({ row: newRow, col: newCol });
      }
    });
    return possibleMoves;
  };

  const getDirections = (piece) => {
    const directions = piece === 'W' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
    if (piece === 'WK' || piece === 'BK') {
      directions.push([1, 1], [1, -1], [-1, -1], [-1, 1]);
    }
    return directions;
  };

  const handleMovePiece = async (fromRow, fromCol, toRow, toCol, deleteRow, deleteCol, updateState = true) => {
    if (!gameOn || currentTurn !== playerColor) return;
    if (updateState) {
      try {
        const data = await movePiece(gameId, currentTurn, fromRow, fromCol, toRow, toCol, deleteRow, deleteCol);
        displayResponse(data);
      } catch (error) {
        console.error("Błąd podczas wysyłania ruchu:", error);
        return;
      }
    }
    if (updateState) {
      setSelectedPiece(null);
    }
  };

  const displayResponse = (game) => {
    if (!game.board) {
      return;
    }

    if (game.winner) {
      alert("Winner is " + game.winner);
      setGameOn(false);
    }
    setBoard(game.boardAsArray);
    setCurrentTurn(game.currentTurn);
  };

  const isLogin = useAuth();
  return isLogin ? (
    <div className="App">
      <div className="container">
        <GameControls
          login={login}
          gameId={gameId}
          handleLoginChange={handleLoginChange}
          handleGameIdChange={handleGameIdChange}
          handleCreateGame={handleCreateGame}
          handleConnectToRandom={handleConnectToRandom}
        />
        <div className="board">
          <Board
            board={board}
            selectedPiece={selectedPiece}
            possibleMoves={possibleMoves}
            handleSquareClick={handleSquareClick}
          />
        </div>
      </div>
    </div>
  ):<Public></Public>;
}

export default App;
