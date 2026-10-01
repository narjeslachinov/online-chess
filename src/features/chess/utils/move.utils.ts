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

  const direction = piece.color === "white" ? -1 : 1;

  const nextRow = position.row + direction;

  if (
    nextRow >= 0 &&
    nextRow < 8 &&
    board[nextRow][position.column] === null
  ) {
    moves.push({
      row: nextRow,
      column: position.column,
    });
  }

  return moves;
}