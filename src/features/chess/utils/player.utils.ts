const PLAYER_ID_KEY =
  "chess-player-id";

export function getPlayerId(): string {
  const existingId =
    localStorage.getItem(
      PLAYER_ID_KEY,
    );

  if (existingId) {
    return existingId;
  }

  const newId =
    crypto.randomUUID();

  localStorage.setItem(
    PLAYER_ID_KEY,
    newId,
  );

  return newId;
}