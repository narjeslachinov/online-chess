"use client";

import { useState } from "react";

import { initialBoard } from "../data/initial-board";
import {
  getValidMoves,
  isCheckmate,
  isInCheck,
  movePiece,
} from "../utils/move.utils";
import { squareToPosition } from "../utils/board.utils";

import type {
  Board,
  Piece,
  PlayerColor,
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

export default function ChessBoard() {
  const [board, setBoard] =
    useState<Board>(initialBoard);

  const [selectedSquare, setSelectedSquare] =
    useState<string | null>(null);

  const [possibleMoves, setPossibleMoves] =
    useState<string[]>([]);

  const [currentTurn, setCurrentTurn] =
    useState<PlayerColor>("white");

  const [gameOver, setGameOver] =
    useState(false);

  const [winner, setWinner] =
    useState<PlayerColor | null>(null);

  const handleSquareClick = (
    square: string,
    piece: Piece | null,
  ) => {
    if (gameOver) {
      return;
    }

    if (
      selectedSquare &&
      possibleMoves.includes(square)
    ) {
      const from =
        squareToPosition(selectedSquare);

      const to =
        squareToPosition(square);

      const newBoard = movePiece(
        board,
        from,
        to,
      );

      const nextTurn =
        currentTurn === "white"
          ? "black"
          : "white";

      if (
        isCheckmate(
          newBoard,
          nextTurn,
        )
      ) {
        setGameOver(true);
        setWinner(currentTurn);
      }

      setBoard(newBoard);
      setCurrentTurn(nextTurn);
      setSelectedSquare(null);
      setPossibleMoves([]);

      return;
    }

    if (!piece) {
      setSelectedSquare(null);
      setPossibleMoves([]);

      return;
    }

    if (piece.color !== currentTurn) {
      return;
    }

    setSelectedSquare(square);

    const position =
      squareToPosition(square);

    const moves = getValidMoves(
      board,
      position,
      piece,
    );

    const moveSquares = moves.map(
      ({ row, column }) =>
        `${files[column]}${8 - row}`,
    );

    setPossibleMoves(moveSquares);
  };

  const isCurrentPlayerInCheck =
    isInCheck(
      board,
      currentTurn,
    );

  return (
    <div className="w-full">
      <div className="mb-4 text-center text-lg font-semibold text-white">
        {gameOver ? (
          <span>
            کیش و مات! برنده:
            {winner === "white"
              ? " سفید"
              : " سیاه"}
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

      <div className="grid grid-cols-8 overflow-hidden rounded-lg border-4 border-zinc-800">
        {board.map((row, rowIndex) =>
          row.map((piece, columnIndex) => {
            const isDark =
              (rowIndex + columnIndex) % 2 ===
              1;

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
                  handleSquareClick(
                    square,
                    piece,
                  )
                }
                className={`relative flex aspect-square cursor-pointer items-center justify-center ${
                  isDark
                    ? "bg-emerald-700"
                    : "bg-amber-100"
                } ${
                  isSelected
                    ? "ring-4 ring-yellow-400 ring-inset"
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
    </div>
  );
}