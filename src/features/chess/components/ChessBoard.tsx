"use client";

import { useState } from "react";

import { initialBoard } from "../data/initial-board";
import type { Piece } from "../types/chess.types";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

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
  const [selectedSquare, setSelectedSquare] =
    useState<string | null>(null);

  return (
    <div className="grid grid-cols-8 overflow-hidden rounded-lg border-4 border-zinc-800">
      {initialBoard.map((row, rowIndex) =>
        row.map((piece, columnIndex) => {
          const isDark = (rowIndex + columnIndex) % 2 === 1;

          const square = `${files[columnIndex]}${8 - rowIndex}`;

          const isSelected = selectedSquare === square;

          return (
            <div
              key={`${rowIndex}-${columnIndex}`}
              onClick={() => {
                if (!piece) return;

                setSelectedSquare(square);
              }}
              className={`flex aspect-square cursor-pointer items-center justify-center ${
                isDark ? "bg-emerald-700" : "bg-amber-100"
              } ${
                isSelected
                  ? "ring-4 ring-yellow-400 ring-inset"
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