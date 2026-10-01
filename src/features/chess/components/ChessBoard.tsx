import { initialBoard } from "../data/initial-board";
import type { Piece } from "../types/chess.types";

const pieceSymbols: Record<
  Piece["color"],
  Record<Piece["type"], string>
> = {
  white: {
    king: "♔",
    queen: "♕",
    rook: "♖",
    bishop: "♗",
    knight: "♘",
    pawn: "♙",
  },
  black: {
    king: "♚",
    queen: "♛",
    rook: "♜",
    bishop: "♝",
    knight: "♞",
    pawn: "♟",
  },
};

export default function ChessBoard() {
  return (
    <div className="grid grid-cols-8 overflow-hidden rounded-lg border-4 border-zinc-800">
      {initialBoard.map((row, rowIndex) =>
        row.map((piece, columnIndex) => {
          const isDark = (rowIndex + columnIndex) % 2 === 1;

          return (
                <div
                key={`${rowIndex}-${columnIndex}`}
                className={`flex aspect-square items-center justify-center ${
                    isDark ? "bg-emerald-700" : "bg-amber-100"
                }`}
                >
                {piece && (
                    <span
                    className={`select-none text-5xl leading-none ${
                        piece.color === "white"
                        ? "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]"
                        : "text-zinc-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
                    }`}
                    >
                    {pieceSymbols[piece.color][piece.type]}
                    </span>
                )}
                </div>
          );
        }),
      )}
    </div>
  );
}   