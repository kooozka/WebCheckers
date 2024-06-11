import React from 'react';
import Piece from './Piece';

const Square = ({ piece, row, col, selectedPiece, possibleMoves, handleSquareClick }) => {
  const isBlack = (row + col) % 2 === 1;
  const isSelected = selectedPiece && selectedPiece.row === row && selectedPiece.col === col;
  const isPossibleMove = possibleMoves.some(move => move.row === row && move.col === col);

  return (
    <div
      className={`square ${isBlack ? 'black-square' : 'white-square'} ${isSelected ? 'selected' : ''} ${isPossibleMove ? 'possible-move' : ''}`}
      onClick={() => handleSquareClick(row, col)}
    >
      {piece && <Piece piece={piece} />}
    </div>
  );
};

export default Square;