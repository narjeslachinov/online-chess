import type { Board, Piece } from "../types/chess.types";

const white = (type: Piece["type"]): Piece => ({
  type,
  color: "white",
});

const black = (type: Piece["type"]): Piece => ({
  type,
  color: "black",
});

export const initialBoard: Board = [
  [
    black("rook"),
    black("knight"),
    black("bishop"),
    black("queen"),
    black("king"),
    black("bishop"),
    black("knight"),
    black("rook"),
  ],
  [
    black("pawn"),
    black("pawn"),
    black("pawn"),
    black("pawn"),
    black("pawn"),
    black("pawn"),
    black("pawn"),
    black("pawn"),
  ],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [
    white("pawn"),
    white("pawn"),
    white("pawn"),
    white("pawn"),
    white("pawn"),
    white("pawn"),
    white("pawn"),
    white("pawn"),
  ],
  [
    white("rook"),
    white("knight"),
    white("bishop"),
    white("queen"),
    white("king"),
    white("bishop"),
    white("knight"),
    white("rook"),
  ],
];