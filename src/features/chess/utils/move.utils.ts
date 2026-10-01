import type {
  Board,
  CastlingRights,
  Piece,
  Position,
} from "../types/chess.types";

function isInsideBoard(
  row: number,
  column: number,
): boolean {
  return (
    row >= 0 &&
    row < 8 &&
    column >= 0 &&
    column < 8
  );
}

function getSlidingMoves(
  board: Board,
  position: Position,
  piece: Piece,
  directions: Position[],
): Position[] {
  const moves: Position[] = [];

  for (const direction of directions) {
    let row =
      position.row + direction.row;

    let column =
      position.column + direction.column;

    while (
      isInsideBoard(row, column)
    ) {
      const target = board[row][column];

      if (!target) {
        moves.push({ row, column });
      } else {
        if (
          target.color !== piece.color
        ) {
          moves.push({ row, column });
        }

        break;
      }

      row += direction.row;
      column += direction.column;
    }
  }

  return moves;
}

function getPawnMoves(
  board: Board,
  position: Position,
  piece: Piece,
  enPassantTarget?: Position | null,
): Position[] {
  const moves: Position[] = [];

  const direction =
    piece.color === "white"
      ? -1
      : 1;

  const startRow =
    piece.color === "white"
      ? 6
      : 1;

  const oneStepRow =
    position.row + direction;

  // حرکت یک خانه‌ای
  if (
    isInsideBoard(
      oneStepRow,
      position.column,
    ) &&
    board[oneStepRow][position.column] ===
      null
  ) {
    moves.push({
      row: oneStepRow,
      column: position.column,
    });

    // حرکت دو خانه‌ای از خانه شروع
    const twoStepRow =
      position.row + direction * 2;

    if (
      position.row === startRow &&
      board[twoStepRow][position.column] ===
        null
    ) {
      moves.push({
        row: twoStepRow,
        column: position.column,
      });
    }
  }

  // حرکت‌های ضربه‌ای معمولی + En Passant
  const captureRow =
    position.row + direction;

  for (const column of [
    position.column - 1,
    position.column + 1,
  ]) {
    if (
      !isInsideBoard(
        captureRow,
        column,
      )
    ) {
      continue;
    }

    const target =
      board[captureRow][column];

    // Capture معمولی
    if (
      target &&
      target.color !== piece.color
    ) {
      moves.push({
        row: captureRow,
        column,
      });
    }

    // En Passant
    if (
      enPassantTarget &&
      enPassantTarget.row === captureRow &&
      enPassantTarget.column === column &&
      !target
    ) {
      moves.push({
        row: captureRow,
        column,
      });
    }
  }

  return moves;
}

function getRookMoves(
  board: Board,
  position: Position,
  piece: Piece,
): Position[] {
  return getSlidingMoves(
    board,
    position,
    piece,
    [
      { row: -1, column: 0 },
      { row: 1, column: 0 },
      { row: 0, column: -1 },
      { row: 0, column: 1 },
    ],
  );
}

function getBishopMoves(
  board: Board,
  position: Position,
  piece: Piece,
): Position[] {
  return getSlidingMoves(
    board,
    position,
    piece,
    [
      { row: -1, column: -1 },
      { row: -1, column: 1 },
      { row: 1, column: -1 },
      { row: 1, column: 1 },
    ],
  );
}

function getQueenMoves(
  board: Board,
  position: Position,
  piece: Piece,
): Position[] {
  return getSlidingMoves(
    board,
    position,
    piece,
    [
      { row: -1, column: 0 },
      { row: 1, column: 0 },
      { row: 0, column: -1 },
      { row: 0, column: 1 },
      { row: -1, column: -1 },
      { row: -1, column: 1 },
      { row: 1, column: -1 },
      { row: 1, column: 1 },
    ],
  );
}

function getKnightMoves(
  board: Board,
  position: Position,
  piece: Piece,
): Position[] {
  const moves: Position[] = [];

  const offsets = [
    { row: -2, column: -1 },
    { row: -2, column: 1 },
    { row: -1, column: -2 },
    { row: -1, column: 2 },
    { row: 1, column: -2 },
    { row: 1, column: 2 },
    { row: 2, column: -1 },
    { row: 2, column: 1 },
  ];

  for (const offset of offsets) {
    const row =
      position.row + offset.row;

    const column =
      position.column + offset.column;

    if (
      !isInsideBoard(row, column)
    ) {
      continue;
    }

    const target =
      board[row][column];

    if (
      !target ||
      target.color !== piece.color
    ) {
      moves.push({ row, column });
    }
  }

  return moves;
}

function getKingMoves(
  board: Board,
  position: Position,
  piece: Piece,
): Position[] {
  const moves: Position[] = [];

  const directions = [
    { row: -1, column: -1 },
    { row: -1, column: 0 },
    { row: -1, column: 1 },
    { row: 0, column: -1 },
    { row: 0, column: 1 },
    { row: 1, column: -1 },
    { row: 1, column: 0 },
    { row: 1, column: 1 },
  ];

  for (const direction of directions) {
    const row =
      position.row + direction.row;

    const column =
      position.column + direction.column;

    if (
      !isInsideBoard(row, column)
    ) {
      continue;
    }

    const target =
      board[row][column];

    if (
      !target ||
      target.color !== piece.color
    ) {
      moves.push({ row, column });
    }
  }

  return moves;
}

function getPseudoLegalMoves(
  board: Board,
  position: Position,
  piece: Piece,
  enPassantTarget?: Position | null,
): Position[] {
  switch (piece.type) {
    case "pawn":
      return getPawnMoves(
        board,
        position,
        piece,
        enPassantTarget,
      );

    case "rook":
      return getRookMoves(
        board,
        position,
        piece,
      );

    case "bishop":
      return getBishopMoves(
        board,
        position,
        piece,
      );

    case "knight":
      return getKnightMoves(
        board,
        position,
        piece,
      );

    case "queen":
      return getQueenMoves(
        board,
        position,
        piece,
      );

    case "king":
      return getKingMoves(
        board,
        position,
        piece,
      );

    default:
      return [];
  }
}

export function movePiece(
  board: Board,
  from: Position,
  to: Position,
): Board {
  const newBoard = board.map(
    (row) => [...row],
  );

  newBoard[to.row][to.column] =
    newBoard[from.row][from.column];

  newBoard[from.row][from.column] =
    null;

  return newBoard;
}

function findKing(
  board: Board,
  color: Piece["color"],
): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let column = 0; column < 8; column++) {
      const piece = board[row][column];

      if (
        piece?.type === "king" &&
        piece.color === color
      ) {
        return { row, column };
      }
    }
  }

  return null;
}

export function isSquareAttacked(
  board: Board,
  position: Position,
  byColor: Piece["color"],
): boolean {
  for (let row = 0; row < 8; row++) {
    for (let column = 0; column < 8; column++) {
      const piece = board[row][column];

      if (
        !piece ||
        piece.color !== byColor
      ) {
        continue;
      }

      // برای بررسی Attack نباید En Passant
      // باعث شود خانه‌ای به اشتباه Attacked حساب شود.
      const moves =
        getPseudoLegalMoves(
          board,
          { row, column },
          piece,
          null,
        );

      if (
        moves.some(
          (move) =>
            move.row === position.row &&
            move.column === position.column,
        )
      ) {
        return true;
      }
    }
  }

  return false;
}

export function isInCheck(
  board: Board,
  color: Piece["color"],
): boolean {
  const kingPosition = findKing(
    board,
    color,
  );

  if (!kingPosition) {
    return false;
  }

  const opponent =
    color === "white"
      ? "black"
      : "white";

  return isSquareAttacked(
    board,
    kingPosition,
    opponent,
  );
}

function canCastleKingSide(
  board: Board,
  color: Piece["color"],
  castlingRights: CastlingRights,
): boolean {
  const row =
    color === "white" ? 7 : 0;

  const opponent =
    color === "white"
      ? "black"
      : "white";

  const canCastle =
    color === "white"
      ? castlingRights.whiteKing
      : castlingRights.blackKing;

  if (!canCastle) {
    return false;
  }

  if (
    board[row][4]?.type !== "king" ||
    board[row][4]?.color !== color
  ) {
    return false;
  }

  if (
    board[row][7]?.type !== "rook" ||
    board[row][7]?.color !== color
  ) {
    return false;
  }

  if (
    board[row][5] !== null ||
    board[row][6] !== null
  ) {
    return false;
  }

  if (
    isSquareAttacked(
      board,
      { row, column: 4 },
      opponent,
    ) ||
    isSquareAttacked(
      board,
      { row, column: 5 },
      opponent,
    ) ||
    isSquareAttacked(
      board,
      { row, column: 6 },
      opponent,
    )
  ) {
    return false;
  }

  return true;
}

function canCastleQueenSide(
  board: Board,
  color: Piece["color"],
  castlingRights: CastlingRights,
): boolean {
  const row =
    color === "white" ? 7 : 0;

  const opponent =
    color === "white"
      ? "black"
      : "white";

  const canCastle =
    color === "white"
      ? castlingRights.whiteQueen
      : castlingRights.blackQueen;

  if (!canCastle) {
    return false;
  }

  if (
    board[row][4]?.type !== "king" ||
    board[row][4]?.color !== color
  ) {
    return false;
  }

  if (
    board[row][0]?.type !== "rook" ||
    board[row][0]?.color !== color
  ) {
    return false;
  }

  if (
    board[row][1] !== null ||
    board[row][2] !== null ||
    board[row][3] !== null
  ) {
    return false;
  }

  if (
    isSquareAttacked(
      board,
      { row, column: 4 },
      opponent,
    ) ||
    isSquareAttacked(
      board,
      { row, column: 3 },
      opponent,
    ) ||
    isSquareAttacked(
      board,
      { row, column: 2 },
      opponent,
    )
  ) {
    return false;
  }

  return true;
}

export function getValidMoves(
  board: Board,
  position: Position,
  piece: Piece,
  castlingRights?: CastlingRights,
  enPassantTarget?: Position | null,
): Position[] {
  const pseudoMoves =
    getPseudoLegalMoves(
      board,
      position,
      piece,
      enPassantTarget,
    );

  const validMoves =
    pseudoMoves.filter((move) => {
      const nextBoard =
        moveWithSpecialRules(
          board,
          position,
          move,
          enPassantTarget,
        );

      return !isInCheck(
        nextBoard,
        piece.color,
      );
    });

  if (
    piece.type === "king" &&
    castlingRights
  ) {
    const row = position.row;

    if (
      canCastleKingSide(
        board,
        piece.color,
        castlingRights,
      )
    ) {
      validMoves.push({
        row,
        column: 6,
      });
    }

    if (
      canCastleQueenSide(
        board,
        piece.color,
        castlingRights,
      )
    ) {
      validMoves.push({
        row,
        column: 2,
      });
    }
  }

  return validMoves;
}

function moveWithSpecialRules(
  board: Board,
  from: Position,
  to: Position,
  enPassantTarget?: Position | null,
): Board {
  if (
    isEnPassantMove(
      board,
      from,
      to,
      enPassantTarget,
    )
  ) {
    return moveWithEnPassant(
      board,
      from,
      to,
    );
  }

  if (
    isCastlingMove(
      board,
      from,
      to,
    )
  ) {
    return moveWithCastling(
      board,
      from,
      to,
    );
  }

  return movePiece(
    board,
    from,
    to,
  );
}

function isCastlingMove(
  board: Board,
  from: Position,
  to: Position,
): boolean {
  const piece =
    board[from.row][from.column];

  return (
    piece?.type === "king" &&
    Math.abs(
      to.column - from.column,
    ) === 2
  );
}

function isEnPassantMove(
  board: Board,
  from: Position,
  to: Position,
  enPassantTarget?: Position | null,
): boolean {
  const piece =
    board[from.row][from.column];

  if (piece?.type !== "pawn") {
    return false;
  }

  if (!enPassantTarget) {
    return false;
  }

  if (
    to.row !== enPassantTarget.row ||
    to.column !== enPassantTarget.column
  ) {
    return false;
  }

  if (from.column === to.column) {
    return false;
  }

  if (board[to.row][to.column] !== null) {
    return false;
  }

  return true;
}

export function moveWithCastling(
  board: Board,
  from: Position,
  to: Position,
): Board {
  const newBoard = movePiece(
    board,
    from,
    to,
  );

  const piece =
    board[from.row][from.column];

  if (
    piece?.type !== "king" ||
    Math.abs(
      to.column - from.column,
    ) !== 2
  ) {
    return newBoard;
  }

  const isKingSide =
    to.column > from.column;

  const rookFromColumn =
    isKingSide ? 7 : 0;

  const rookToColumn =
    isKingSide ? 5 : 3;

  newBoard[to.row][rookToColumn] =
    newBoard[to.row][rookFromColumn];

  newBoard[to.row][rookFromColumn] =
    null;

  return newBoard;
}

export function moveWithEnPassant(
  board: Board,
  from: Position,
  to: Position,
): Board {
  const newBoard = movePiece(
    board,
    from,
    to,
  );

  const piece =
    board[from.row][from.column];

  if (piece?.type !== "pawn") {
    return newBoard;
  }

  if (
    from.column === to.column ||
    board[to.row][to.column] !== null
  ) {
    return newBoard;
  }

  const capturedPawnRow =
    from.row;

  newBoard[capturedPawnRow][to.column] =
    null;

  return newBoard;
}

export function hasAnyValidMove(
  board: Board,
  color: Piece["color"],
  castlingRights?: CastlingRights,
  enPassantTarget?: Position | null,
): boolean {
  for (let row = 0; row < 8; row++) {
    for (let column = 0; column < 8; column++) {
      const piece = board[row][column];

      if (
        !piece ||
        piece.color !== color
      ) {
        continue;
      }

      const moves = getValidMoves(
        board,
        { row, column },
        piece,
        castlingRights,
        enPassantTarget,
      );

      if (moves.length > 0) {
        return true;
      }
    }
  }

  return false;
}

export function isCheckmate(
  board: Board,
  color: Piece["color"],
  castlingRights?: CastlingRights,
  enPassantTarget?: Position | null,
): boolean {
  return (
    isInCheck(board, color) &&
    !hasAnyValidMove(
      board,
      color,
      castlingRights,
      enPassantTarget,
    )
  );
}

export function isStalemate(
  board: Board,
  color: Piece["color"],
  castlingRights?: CastlingRights,
  enPassantTarget?: Position | null,
): boolean {
  return (
    !isInCheck(board, color) &&
    !hasAnyValidMove(
      board,
      color,
      castlingRights,
      enPassantTarget,
    )
  );
}