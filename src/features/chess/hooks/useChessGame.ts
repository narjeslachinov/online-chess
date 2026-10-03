"use client";

import {
  useEffect,
  useState,
} from "react";

import { socket } from "../socket/socket-client";

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

type OpponentMove = {
  from: string;
  to: string;
  playerColor: PlayerColor;
};

export function useChessGame() {
  const [board, setBoard] =
    useState<Board>(initialBoard);

  const [currentTurn, setCurrentTurn] =
    useState<PlayerColor>("white");

  const [playerColor, setPlayerColor] =
    useState<PlayerColor | null>(null);

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

  /*
   * =========================
   * SOCKET: GAME STATUS
   * =========================
   */

  useEffect(() => {
    const handleGameStatus = (data: {
      status: string;
      color?: PlayerColor;
      currentTurn?: PlayerColor;
    }) => {
      if (
        data.color === "white" ||
        data.color === "black"
      ) {
        setPlayerColor(data.color);
      }

      if (
        data.currentTurn === "white" ||
        data.currentTurn === "black"
      ) {
        setCurrentTurn(
          data.currentTurn,
        );
      }
    };

    socket.on(
      "game-status",
      handleGameStatus,
    );

    return () => {
      socket.off(
        "game-status",
        handleGameStatus,
      );
    };
  }, []);

  /*
   * =========================
   * SOCKET: GAME START
   * =========================
   */

  useEffect(() => {
    const handleGameStart = (data: {
      currentTurn?: PlayerColor;
    }) => {
      if (
        data.currentTurn === "white" ||
        data.currentTurn === "black"
      ) {
        setCurrentTurn(
          data.currentTurn,
        );
      }

      setGameOver(false);
      setWinner(null);
      setDraw(false);
    };

    socket.on(
      "game-start",
      handleGameStart,
    );

    return () => {
      socket.off(
        "game-start",
        handleGameStart,
      );
    };
  }, []);

  /*
   * =========================
   * SOCKET: OPPONENT MOVE
   * =========================
   */

  useEffect(() => {
    const handleOpponentMove = (
      move: OpponentMove,
    ) => {
      /*
       * Server currently sends the move
       * to everyone in the room.
       *
       * Therefore the player who made
       * the move must ignore it.
       */
      if (
        !playerColor ||
        move.playerColor === playerColor
      ) {
        return;
      }

      const from =
        squareToPosition(move.from);

      const to =
        squareToPosition(move.to);

      setBoard((currentBoard) => {
        const movingPiece =
          currentBoard[from.row][from.column];

        if (!movingPiece) {
          console.warn(
            "Opponent move ignored: piece not found.",
          );

          return currentBoard;
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
          currentBoard[to.row][to.column] ===
            null;

        let nextBoard: Board;

        if (isEnPassant) {
          nextBoard =
            moveWithEnPassant(
              currentBoard,
              from,
              to,
            );
        } else {
          nextBoard =
            moveWithCastling(
              currentBoard,
              from,
              to,
            );
        }

        return nextBoard;
      });

      /*
       * Update castling rights
       * after opponent's move.
       */
      setCastlingRights(
        (currentRights) => {
          const nextRights = {
            ...currentRights,
          };

          if (
            move.playerColor === "white"
          ) {
            const movingPiece =
              board[from.row][from.column];

            if (
              movingPiece?.type === "king"
            ) {
              nextRights.whiteKing =
                false;

              nextRights.whiteQueen =
                false;
            }

            if (
              movingPiece?.type === "rook"
            ) {
              if (
                from.row === 7 &&
                from.column === 0
              ) {
                nextRights.whiteQueen =
                  false;
              }

              if (
                from.row === 7 &&
                from.column === 7
              ) {
                nextRights.whiteKing =
                  false;
              }
            }
          }

          if (
            move.playerColor === "black"
          ) {
            const movingPiece =
              board[from.row][from.column];

            if (
              movingPiece?.type === "king"
            ) {
              nextRights.blackKing =
                false;

              nextRights.blackQueen =
                false;
            }

            if (
              movingPiece?.type === "rook"
            ) {
              if (
                from.row === 0 &&
                from.column === 0
              ) {
                nextRights.blackQueen =
                  false;
              }

              if (
                from.row === 0 &&
                from.column === 7
              ) {
                nextRights.blackKing =
                  false;
              }
            }
          }

          return nextRights;
        },
      );

      /*
       * If opponent moved a pawn two squares,
       * create the en-passant target.
       */
      const opponentPiece =
        board[from.row][from.column];

      if (
        opponentPiece?.type === "pawn" &&
        Math.abs(
          to.row - from.row,
        ) === 2
      ) {
        const middleRow =
          (from.row + to.row) / 2;

        setEnPassantTarget(
          `${files[from.column]}${
            8 - middleRow
          }`,
        );
      } else {
        setEnPassantTarget(null);
      }

      setCurrentTurn(
        move.playerColor === "white"
          ? "black"
          : "white",
      );

      setSelectedSquare(null);
      setPossibleMoves([]);
    };

    socket.on(
      "opponent-move",
      handleOpponentMove,
    );

    return () => {
      socket.off(
        "opponent-move",
        handleOpponentMove,
      );
    };
  }, [
    playerColor,
    board,
    enPassantTarget,
  ]);

  /*
   * =========================
   * SOCKET: INVALID MOVE
   * =========================
   */

  useEffect(() => {
    const handleInvalidMove = (
      data: {
        reason: string;
      },
    ) => {
      console.log(
        "Invalid move:",
        data.reason,
      );
    };

    socket.on(
      "invalid-move",
      handleInvalidMove,
    );

    return () => {
      socket.off(
        "invalid-move",
        handleInvalidMove,
      );
    };
  }, []);

  /*
   * =========================
   * RESET GAME
   * =========================
   */

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

  /*
   * =========================
   * FINISH TURN
   * =========================
   */

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

  /*
   * =========================
   * PROMOTION
   * =========================
   */

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

  /*
   * =========================
   * SELECT SQUARE
   * =========================
   */

  const selectSquare = (
    square: string,
  ) => {
    if (
      gameOver ||
      promotion
    ) {
      return;
    }

    /*
     * Player can only move
     * when it is their turn.
     */
    if (
      playerColor &&
      playerColor !== currentTurn
    ) {
      return;
    }

    const position =
      squareToPosition(square);

    const piece =
      board[position.row][
        position.column
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

    if (
      playerColor &&
      piece.color !== playerColor
    ) {
      return;
    }

    setSelectedSquare(square);

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

    setPossibleMoves(
      moveSquares,
    );
  };

  /*
   * =========================
   * MOVE SELECTED PIECE
   * =========================
   */

  const moveSelectedPiece = (
    square: string,
  ) => {
    if (
      !selectedSquare ||
      !possibleMoves.includes(
        square,
      ) ||
      gameOver ||
      promotion
    ) {
      return false;
    }

    /*
     * Extra client-side turn check.
     *
     * Server also checks this.
     */
    if (
      playerColor &&
      playerColor !== currentTurn
    ) {
      return false;
    }

    const from =
      squareToPosition(
        selectedSquare,
      );

    const to =
      squareToPosition(square);

    const movingPiece =
      board[from.row][from.column];

    if (!movingPiece) {
      return false;
    }

    /*
     * =========================
     * EN PASSANT
     * =========================
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
      board[to.row][to.column] ===
        null;

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

    /*
     * =========================
     * EN PASSANT TARGET
     * =========================
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

    /*
     * =========================
     * CASTLING RIGHTS
     * =========================
     */

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

    /*
     * =========================
     * PROMOTION
     * =========================
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

      /*
       * We don't send the move yet.
       *
       * Promotion needs the selected
       * piece type as well.
       */
      return true;
    }

    /*
     * =========================
     * SEND MOVE TO SERVER
     * =========================
     */

    socket.emit(
      "make-move",
      {
        from: selectedSquare,
        to: square,
      },
    );

    /*
     * =========================
     * UPDATE LOCAL BOARD
     * =========================
     */

    finishTurn(
      newBoard,
      movingPiece.color,
      nextCastlingRights,
      nextEnPassantTarget,
    );

    return true;
  };

  /*
   * =========================
   * SQUARE CLICK
   * =========================
   */

  const handleSquareClick = (
    square: string,
  ) => {
    if (
      selectedSquare &&
      possibleMoves.includes(
        square,
      )
    ) {
      moveSelectedPiece(square);
      return;
    }

    selectSquare(square);
  };

  /*
   * =========================
   * CHECK
   * =========================
   */

  const isCurrentPlayerInCheck =
    isInCheck(
      board,
      currentTurn,
    );

  return {
    board,

    currentTurn,

    playerColor,

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