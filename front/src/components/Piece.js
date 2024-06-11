// components/Piece.js
import React from 'react';

const Piece = ({ piece }) => {
  const pieceClass = piece === 'B' ? 'black-piece' : piece === 'W' ? 'white-piece' : piece === 'BK' ? 'black-king' : piece === 'WK' ? 'white-king' : '';
  return <div className={`piece ${pieceClass}`}></div>;
};

export default Piece;