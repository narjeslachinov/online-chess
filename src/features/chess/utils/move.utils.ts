import type {
  Board,
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
    let row = position.row + direction.row;
    let column =
      position.column + direction.column;

    while (isInsideBoard(row, column)) {
      const target = board[row][column];

      if (!target) {
        moves.push({ row, column });
      } else {
        if (target.color !== piece.color) {
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
): Position[] {
  const moves: Position[] = [];

  const direction =
    piece.color === "white" ? -1 : 1;

  const startRow =
    piece.color === "white" ? 6 : 1;

  const oneStepRow =
    position.row + direction;

  if (
    isInsideBoard(
      oneStepRow,
      position.column,
    ) &&
    board[oneStepRow][position.column] === null
  ) {
    moves.push({
      row: oneStepRow,
      column: position.column,
    });

    const twoStepRow =
      position.row + direction * 2;

    if (
      position.row === startRow &&
      board[twoStepRow][position.column] === null
    ) {
      moves.push({
        row: twoStepRow,
        column: position.column,
      });
    }
  }

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

    if (
      target &&
      target.color !== piece.color
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

    if (!isInsideBoard(row, column)) {
      continue;
    }

    const target = board[row][column];

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

    if (!isInsideBoard(row, column)) {
      continue;
    }

    const target = board[row][column];

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
): Position[] {
  switch (piece.type) {
    case "pawn":
      return getPawnMoves(
        board,
        position,
        piece,
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

      if (!piece || piece.color !== byColor) {
        continue;
      }

      const moves = getPseudoLegalMoves(
        board,
        { row, column },
        piece,
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

export function getValidMoves(
  board: Board,
  position: Position,
  piece: Piece,
): Position[] {
  const pseudoMoves =
    getPseudoLegalMoves(
      board,
      position,
      piece,
    );

  return pseudoMoves.filter((move) => {
    const nextBoard = movePiece(
      board,
      position,
      move,
    );

    return !isInCheck(
      nextBoard,
      piece.color,
    );
  });
}
export function hasAnyValidMove(
  board: Board,
  color: Piece["color"],
): boolean {
  for (let row = 0; row < 8; row++) {
    for (let column = 0; column < 8; column++) {
      const piece = board[row][column];

      if (!piece || piece.color !== color) {
        continue;
      }

      const moves = getValidMoves(
        board,
        { row, column },
        piece,
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
): boolean {
  return (
    isInCheck(board, color) &&
    !hasAnyValidMove(board, color)
  );
}