import React from 'react';
import Square from './Square';

const Board = ({ board, selectedPiece, possibleMoves, handleSquareClick }) => {
  return board.map((row, rowIndex) =>
    row.map((piece, colIndex) => (
      <Square
        key={`${rowIndex}-${colIndex}`}
        piece={piece}
        row={rowIndex}
        col={colIndex}
        selectedPiece={selectedPiece}
        possibleMoves={possibleMoves}
        handleSquareClick={handleSquareClick}
      />
    ))
  );
};

export default Board;