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

type PromotionState = {
  row: number;
  column: number;
  color: PlayerColor;
} | null;

export function useChessGame() {
  const [board, setBoard] =
    useState<Board>(initialBoard);

  const [currentTurn, setCurrentTurn] =
    useState<PlayerColor>("white");

  const [selectedSquare, setSelectedSquare] =
    useState<string | null>(null);

  const [possibleMoves, setPossibleMoves] =
    useState<string[]>([]);

  const [gameOver, setGameOver] =
    useState(false);

  const [winner, setWinner] =
    useState<PlayerColor | null>(null);

  const [draw, setDraw] =
    useState(false);

  const [promotion, setPromotion] =
    useState<PromotionState>(null);

  const [castlingRights, setCastlingRights] =
    useState<CastlingRights>({
      whiteKing: true,
      whiteQueen: true,
      blackKing: true,
      blackQueen: true,
    });

  const [enPassantTarget, setEnPassantTarget] =
    useState<string | null>(null);

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
    setCurrentTurn("white");
    setSelectedSquare(null);
    setPossibleMoves([]);
    setGameOver(false);
    setWinner(null);
    setDraw(false);
    setPromotion(null);
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

  const selectSquare = (
    square: string,
  ) => {
    if (
      gameOver ||
      promotion
    ) {
      return;
    }

    const piece =
      board[
        squareToPosition(square).row
      ][
        squareToPosition(square).column
      ];

    if (!piece) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    if (
      piece.color !== currentTurn
    ) {
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
      getEnPassantPosition(),
    );

    const moveSquares = moves.map(
      ({ row, column }) =>
        `${files[column]}${8 - row}`,
    );

    setPossibleMoves(moveSquares);
  };

  const moveSelectedPiece = (
    square: string,
  ) => {
    if (
      !selectedSquare ||
      !possibleMoves.includes(square) ||
      gameOver ||
      promotion
    ) {
      return false;
    }

    const from =
      squareToPosition(selectedSquare);

    const to =
      squareToPosition(square);

    const movingPiece =
      board[from.row][from.column];

    if (!movingPiece) {
      return false;
    }

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

    let newBoard: Board;

    if (isEnPassant) {
      newBoard =
        moveWithEnPassant(
          board,
          from,
          to,
        );
    } else {
      newBoard =
        moveWithCastling(
          board,
          from,
          to,
        );
    }

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
      setEnPassantTarget(null);

      setPromotion({
        row: to.row,
        column: to.column,
        color: movingPiece.color,
      });

      return true;
    }

    finishTurn(
      newBoard,
      movingPiece.color,
      nextCastlingRights,
      nextEnPassantTarget,
    );

    return true;
  };

  const handleSquareClick = (
    square: string,
  ) => {
    if (
      selectedSquare &&
      possibleMoves.includes(square)
    ) {
      moveSelectedPiece(square);
      return;
    }

    selectSquare(square);
  };

  const isCurrentPlayerInCheck =
    isInCheck(
      board,
      currentTurn,
    );

  return {
    board,
    currentTurn,
    selectedSquare,
    possibleMoves,
    gameOver,
    winner,
    draw,
    promotion,
    castlingRights,
    enPassantTarget,
    isCurrentPlayerInCheck,

    handleSquareClick,
    handlePromotion,
    resetGame,
  };
}