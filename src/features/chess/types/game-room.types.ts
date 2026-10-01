export type Player = {
  id: string;
};

export type GameRoom = {
  id: string;

  whitePlayer: Player | null;

  blackPlayer: Player | null;
};