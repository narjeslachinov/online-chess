import type {
  PlayerColor,
} from "./chess.types";

export type Player = {
  id: string;
};

export type GameRoom = {
  id: string;

  whitePlayer: Player | null;

  blackPlayer: Player | null;

  currentTurn: PlayerColor;
};