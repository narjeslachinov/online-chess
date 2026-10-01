import type {
  Board,
  Piece,
  Position,
} from "../types/chess.types";

export function getPawnMoves(
  board: Board,
  position: Position,
  piece: Piece,
): Position[] {
  const moves: Position[] = [];

  const direction =
    piece.color === "white" ? -1 : 1;

  const startRow =
    piece.color === "white" ? 6 : 1;

  const oneStepRow =
    position.row + direction;

  if (
    oneStepRow >= 0 &&
    oneStepRow < 8 &&
    board[oneStepRow][position.column] === null
  ) {
    moves.push({
      row: oneStepRow,
      column: position.column,
    });

    const twoStepRow =
      position.row + direction * 2;

    if (
      position.row === startRow &&
      board[twoStepRow][position.column] === null
    ) {
      moves.push({
        row: twoStepRow,
        column: position.column,
      });
    }
  }

  const captureRow =
    position.row + direction;

  if (
    captureRow >= 0 &&
    captureRow < 8
  ) {
    const captureColumns = [
      position.column - 1,
      position.column + 1,
    ];

    for (const column of captureColumns) {
      if (
        column < 0 ||
        column >= 8
      ) {
        continue;
      }

      const targetPiece =
        board[captureRow][column];

      if (
        targetPiece &&
        targetPiece.color !== piece.color
      ) {
        moves.push({
          row: captureRow,
          column,
        });
      }
    }
  }

  return moves;
}

export function movePiece(
  board: Board,
  from: Position,
  to: Position,
): Board {
  const newBoard = board.map((row) => [...row]);

  newBoard[to.row][to.column] =
    newBoard[from.row][from.column];

  newBoard[from.row][from.column] = null;

  return newBoard;
}