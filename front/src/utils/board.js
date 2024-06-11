export const initialBoard = () => {
    const board = [];
    for (let row = 0; row < 8; row++) {
      const currentRow = [];
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          if (row < 3) {
            currentRow.push('B');
          } else if (row > 4) {
            currentRow.push('W');
          } else {
            currentRow.push('N');
          }
        } else {
          currentRow.push('N');
        }
      }
      board.push(currentRow);
    }
    return board;
  };