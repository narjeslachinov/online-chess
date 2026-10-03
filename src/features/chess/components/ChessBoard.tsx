"use client";

import { useChessGame } from "../hooks/useChessGame";

import type {
  Piece,
  PieceType,
} from "../types/chess.types";

const files = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
];

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

const promotionPieces: PieceType[] = [
  "queen",
  "rook",
  "bishop",
  "knight",
];

export default function ChessBoard() {
  const {
    board,
    currentTurn,
    selectedSquare,
    possibleMoves,
    gameOver,
    winner,
    draw,
    promotion,
    isCurrentPlayerInCheck,

    handleSquareClick,
    handlePromotion,
    resetGame,
  } = useChessGame();

  return (
    <div className="relative w-full">
      {/* Game Status */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-lg font-semibold text-white">
          {gameOver ? (
            <span>
              {draw
                ? "بازی مساوی شد — پات!"
                : `کیش و مات! برنده: ${
                    winner === "white"
                      ? "سفید"
                      : "سیاه"
                  }`}
            </span>
          ) : (
            <span>
              نوبت:
              {currentTurn === "white"
                ? " سفید"
                : " سیاه"}

              {isCurrentPlayerInCheck && (
                <span className="mr-2 text-red-400">
                  — کیش!
                </span>
              )}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={resetGame}
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200"
        >
          شروع مجدد
        </button>
      </div>

      {/* Chess Board */}
      <div className="grid grid-cols-8 overflow-hidden rounded-lg border-4 border-zinc-800">
        {board.map((row, rowIndex) =>
          row.map((piece, columnIndex) => {
            const isDark =
              (rowIndex + columnIndex) % 2 === 1;

            const square =
              `${files[columnIndex]}${8 - rowIndex}`;

            const isSelected =
              selectedSquare === square;

            const isPossibleMove =
              possibleMoves.includes(square);

            return (
              <div
                key={`${rowIndex}-${columnIndex}`}
                onClick={() =>
                  handleSquareClick(square)
                }
                className={`relative flex aspect-square cursor-pointer items-center justify-center ${
                  isDark
                    ? "bg-emerald-700"
                    : "bg-amber-100"
                } ${
                  isSelected
                    ? "ring-4 ring-inset ring-yellow-400"
                    : ""
                } ${
                  isPossibleMove
                    ? "after:absolute after:h-4 after:w-4 after:rounded-full after:bg-yellow-400"
                    : ""
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
                    {
                      pieceSymbols[
                        piece.color
                      ][piece.type]
                    }
                  </span>
                )}
              </div>
            );
          }),
        )}
      </div>

      {/* Promotion Modal */}
      {promotion && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-black/70">
          <div className="rounded-xl bg-zinc-900 p-6 shadow-2xl">
            <h2 className="mb-5 text-center text-lg font-bold text-white">
              انتخاب مهره
            </h2>

            <div className="grid grid-cols-4 gap-3">
              {promotionPieces.map(
                (pieceType) => (
                  <button
                    key={pieceType}
                    type="button"
                    onClick={() =>
                      handlePromotion(
                        pieceType,
                      )
                    }
                    className="flex h-20 w-20 flex-col items-center justify-center rounded-lg bg-white transition hover:bg-zinc-200"
                  >
                    <span className="text-4xl text-zinc-900">
                      {
                        pieceSymbols[
                          promotion.color
                        ][pieceType]
                      }
                    </span>

                    <span className="mt-1 text-xs capitalize text-zinc-600">
                      {pieceType}
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}