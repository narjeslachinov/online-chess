"use client";

import { useState } from "react";

import { initialBoard } from "../data/initial-board";
import {
  getValidMoves,
  isCheckmate,
  isInCheck,
  moveWithCastling,
} from "../utils/move.utils";
import { squareToPosition } from "../utils/board.utils";

import type {
  Board,
  CastlingRights,
  Piece,
  PieceType,
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

const promotionPieces: PieceType[] = [
  "queen",
  "rook",
  "bishop",
  "knight",
];

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

  const [promotion, setPromotion] =
    useState<{
      row: number;
      column: number;
      color: PlayerColor;
    } | null>(null);

  const [castlingRights, setCastlingRights] =
    useState<CastlingRights>({
      whiteKing: true,
      whiteQueen: true,
      blackKing: true,
      blackQueen: true,
    });

  const resetGame = () => {
    setBoard(initialBoard);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setCurrentTurn("white");
    setGameOver(false);
    setWinner(null);
    setPromotion(null);

    setCastlingRights({
      whiteKing: true,
      whiteQueen: true,
      blackKing: true,
      blackQueen: true,
    });
  };

  const finishTurn = (
    nextBoard: Board,
    movingColor: PlayerColor,
    nextCastlingRights: CastlingRights,
  ) => {
    const nextTurn =
      movingColor === "white"
        ? "black"
        : "white";

    if (
      isCheckmate(
        nextBoard,
        nextTurn,
        nextCastlingRights,
      )
    ) {
      setGameOver(true);
      setWinner(movingColor);
    }

    setBoard(nextBoard);
    setCurrentTurn(nextTurn);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setCastlingRights(nextCastlingRights);
  };

  const handlePromotion = (
    pieceType: PieceType,
  ) => {
    if (!promotion) {
      return;
    }

    const newBoard = board.map(
      (row) => [...row],
    );

    newBoard[promotion.row][
      promotion.column
    ] = {
      type: pieceType,
      color: promotion.color,
    };

    setPromotion(null);

    finishTurn(
      newBoard,
      promotion.color,
      castlingRights,
    );
  };

  const handleSquareClick = (
    square: string,
    piece: Piece | null,
  ) => {
    if (gameOver || promotion) {
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

      const movingPiece =
        board[from.row][from.column];

      if (!movingPiece) {
        return;
      }

      const newBoard =
        moveWithCastling(
          board,
          from,
          to,
        );

      const nextCastlingRights = {
        ...castlingRights,
      };

      if (
        movingPiece.type === "king"
      ) {
        if (
          movingPiece.color === "white"
        ) {
          nextCastlingRights.whiteKing =
            false;

          nextCastlingRights.whiteQueen =
            false;
        } else {
          nextCastlingRights.blackKing =
            false;

          nextCastlingRights.blackQueen =
            false;
        }
      }

      if (
        movingPiece.type === "rook"
      ) {
        if (
          movingPiece.color === "white" &&
          from.row === 7 &&
          from.column === 0
        ) {
          nextCastlingRights.whiteQueen =
            false;
        }

        if (
          movingPiece.color === "white" &&
          from.row === 7 &&
          from.column === 7
        ) {
          nextCastlingRights.whiteKing =
            false;
        }

        if (
          movingPiece.color === "black" &&
          from.row === 0 &&
          from.column === 0
        ) {
          nextCastlingRights.blackQueen =
            false;
        }

        if (
          movingPiece.color === "black" &&
          from.row === 0 &&
          from.column === 7
        ) {
          nextCastlingRights.blackKing =
            false;
        }
      }

      const isPromotion =
        movingPiece.type === "pawn" &&
        (to.row === 0 ||
          to.row === 7);

      if (isPromotion) {
        setBoard(newBoard);

        setSelectedSquare(null);
        setPossibleMoves([]);

        setCastlingRights(
          nextCastlingRights,
        );

        setPromotion({
          row: to.row,
          column: to.column,
          color: movingPiece.color,
        });

        return;
      }

      finishTurn(
        newBoard,
        movingPiece.color,
        nextCastlingRights,
      );

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
      castlingRights,
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
    <div className="relative w-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-lg font-semibold text-white">
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

        <button
          type="button"
          onClick={resetGame}
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200"
        >
          شروع مجدد
        </button>
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