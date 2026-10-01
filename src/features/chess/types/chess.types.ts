export type PieceType =
  | "king"
  | "queen"
  | "rook"
  | "bishop"
  | "knight"
  | "pawn";

export type PieceColor = "white" | "black";

export type Piece = {
  type: PieceType;
  color: PieceColor;
};

export type Square = Piece | null;

export type Board = Square[][];

export type Position = {
  row: number;
  column: number;
};

export type PlayerColor = "white" | "black";

export type CastlingRights = {
  whiteKing: boolean;
  whiteQueen: boolean;
  blackKing: boolean;
  blackQueen: boolean;
};