"use client";

import { useState } from "react";

import { initialBoard } from "../data/initial-board";

import {
  getValidMoves,
  isCheckmate,
  isInCheck,
  isStalemate,
  moveWithCastling,
  moveWithEnPassant,
} from "../utils/move.utils";

import { squareToPosition } from "../utils/board.utils";

import type {
  Board,
  CastlingRights,
  Piece,
  PieceType,
  PlayerColor,
  Position,
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

  const [draw, setDraw] =
    useState(false);

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

  /*
   * این مقدار مثلاً می‌تواند باشد:
   *
   * "e6"
   *
   * یعنی اگر Pawn سیاه از e7 به e5 آمده،
   * سفید می‌تواند در حرکت بعدی به e6
   * En Passant انجام دهد.
   */
  const [enPassantTarget, setEnPassantTarget] =
    useState<string | null>(null);

  /*
   * تبدیل "e6" به:
   *
   * {
   *   row: 2,
   *   column: 4
   * }
   */
  const getEnPassantPosition =
    (): Position | null => {
      if (!enPassantTarget) {
        return null;
      }

      return squareToPosition(
        enPassantTarget,
      );
    };

  const resetGame = () => {
    setBoard(initialBoard);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setCurrentTurn("white");
    setGameOver(false);
    setWinner(null);
    setPromotion(null);
    setDraw(false);
    setEnPassantTarget(null);

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
    nextEnPassantTarget: string | null,
  ) => {
    const nextTurn =
      movingColor === "white"
        ? "black"
        : "white";

    const enPassantPosition =
      nextEnPassantTarget
        ? squareToPosition(
            nextEnPassantTarget,
          )
        : null;

    if (
      isCheckmate(
        nextBoard,
        nextTurn,
        nextCastlingRights,
        enPassantPosition,
      )
    ) {
      setGameOver(true);
      setWinner(movingColor);
    } else if (
      isStalemate(
        nextBoard,
        nextTurn,
        nextCastlingRights,
        enPassantPosition,
      )
    ) {
      setGameOver(true);
      setDraw(true);
    }

    setBoard(nextBoard);
    setCurrentTurn(nextTurn);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setCastlingRights(
      nextCastlingRights,
    );
    setEnPassantTarget(
      nextEnPassantTarget,
    );
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
      null,
    );
  };

  const handleSquareClick = (
    square: string,
    piece: Piece | null,
  ) => {
    if (gameOver || promotion) {
      return;
    }

    /*
     * --------------------------------
     * حرکت مهره انتخاب‌شده
     * --------------------------------
     */
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

      /*
       * بررسی می‌کنیم حرکت فعلی
       * En Passant است یا نه.
       */
      const currentEnPassantPosition =
        getEnPassantPosition();

      const isEnPassant =
        movingPiece.type === "pawn" &&
        currentEnPassantPosition !== null &&
        to.row ===
          currentEnPassantPosition.row &&
        to.column ===
          currentEnPassantPosition.column &&
        from.column !== to.column &&
        board[to.row][to.column] === null;

      /*
       * اگر En Passant باشد،
       * Pawn حریف باید از صفحه حذف شود.
       */
      let newBoard: Board;

      if (isEnPassant) {
        newBoard =
          moveWithEnPassant(
            board,
            from,
            to,
          );
      } else {
        /*
         * در غیر این صورت حرکت عادی
         * یا Castling.
         */
        newBoard =
          moveWithCastling(
            board,
            from,
            to,
          );
      }

      /*
       * --------------------------------
       * تعیین En Passant برای حرکت بعدی
       * --------------------------------
       *
       * فقط زمانی Target ساخته می‌شود
       * که Pawn دقیقاً دو خانه حرکت کرده باشد.
       */
      let nextEnPassantTarget:
        | string
        | null = null;

      if (
        movingPiece.type === "pawn" &&
        Math.abs(
          to.row - from.row,
        ) === 2
      ) {
        const middleRow =
          (from.row + to.row) / 2;

        nextEnPassantTarget =
          `${files[from.column]}${
            8 - middleRow
          }`;
      }

      const nextCastlingRights = {
        ...castlingRights,
      };

      /*
       * --------------------------------
       * Castling Rights - King
       * --------------------------------
       */
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

      /*
       * --------------------------------
       * Castling Rights - Rook
       * --------------------------------
       */
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

      /*
       * --------------------------------
       * Promotion
       * --------------------------------
       */
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

        setEnPassantTarget(null);

        setPromotion({
          row: to.row,
          column: to.column,
          color: movingPiece.color,
        });

        return;
      }

      /*
       * پایان حرکت
       */
      finishTurn(
        newBoard,
        movingPiece.color,
        nextCastlingRights,
        nextEnPassantTarget,
      );

      return;
    }

    /*
     * اگر خانه خالی بود
     */
    if (!piece) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    /*
     * اگر مهره متعلق به نوبت فعلی نبود
     */
    if (piece.color !== currentTurn) {
      return;
    }

    /*
     * انتخاب مهره
     */
    setSelectedSquare(square);

    const position =
      squareToPosition(square);

    /*
     * Target فعلی En Passant
     * را به Position تبدیل می‌کنیم.
     */
    const currentEnPassantPosition =
      getEnPassantPosition();

    /*
     * گرفتن حرکت‌های قانونی
     */
    const moves = getValidMoves(
      board,
      position,
      piece,
      castlingRights,
      currentEnPassantPosition,
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

      <div className="grid grid-cols-8 overflow-hidden rounded-lg border-4 border-zinc-800">
        {board.map((row, rowIndex) =>
          row.map(
            (
              piece,
              columnIndex,
            ) => {
              const isDark =
                (rowIndex +
                  columnIndex) %
                  2 ===
                1;

              const square =
                `${files[columnIndex]}${
                  8 - rowIndex
                }`;

              const isSelected =
                selectedSquare ===
                square;

              const isPossibleMove =
                possibleMoves.includes(
                  square,
                );

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
                        piece.color ===
                        "white"
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
            },
          ),
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