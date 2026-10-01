import type { Position } from "../types/chess.types";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

export function squareToPosition(square: string): Position {
  const file = square[0];
  const rank = Number(square[1]);

  const column = files.indexOf(file);
  const row = 8 - rank;

  return {
    row,
    column,
  };
}