import type { GameRoom, Player } from "../src/features/chess/types/game-room.types";

export class RoomManager {
  private rooms = new Map<
    string,
    GameRoom
  >();

  private waitingPlayers: Player[] = [];

  private readonly defaultRoomId =
    "main-room";

  getRoom(): GameRoom {
    let room =
      this.rooms.get(
        this.defaultRoomId,
      );

    if (!room) {
      room = {
        id: this.defaultRoomId,
        whitePlayer: null,
        blackPlayer: null,
      };

      this.rooms.set(
        this.defaultRoomId,
        room,
      );
    }

    return room;
  }

  addPlayer(
    player: Player,
  ): {
    room: GameRoom | null;
    color:
      | "white"
      | "black"
      | "waiting";
  } {
    const room = this.getRoom();

    if (
      room.whitePlayer?.id ===
      player.id
    ) {
      return {
        room,
        color: "white",
      };
    }

    if (
      room.blackPlayer?.id ===
      player.id
    ) {
      return {
        room,
        color: "black",
      };
    }

    if (!room.whitePlayer) {
      room.whitePlayer = player;

      return {
        room,
        color: "white",
      };
    }

    if (!room.blackPlayer) {
      room.blackPlayer = player;

      return {
        room,
        color: "black",
      };
    }

    const alreadyWaiting =
      this.waitingPlayers.some(
        (waitingPlayer) =>
          waitingPlayer.id ===
          player.id,
      );

    if (!alreadyWaiting) {
      this.waitingPlayers.push(
        player,
      );
    }

    return {
      room: null,
      color: "waiting",
    };
  }

  removePlayer(
    playerId: string,
  ): {
    removedColor:
      | "white"
      | "black"
      | "waiting"
      | null;

    room: GameRoom;
  } {
    const room = this.getRoom();

    if (
      room.whitePlayer?.id ===
      playerId
    ) {
      room.whitePlayer = null;

      return {
        removedColor: "white",
        room,
      };
    }

    if (
      room.blackPlayer?.id ===
      playerId
    ) {
      room.blackPlayer = null;

      return {
        removedColor: "black",
        room,
      };
    }

    const waitingIndex =
      this.waitingPlayers.findIndex(
        (player) =>
          player.id === playerId,
      );

    if (waitingIndex !== -1) {
      this.waitingPlayers.splice(
        waitingIndex,
        1,
      );

      return {
        removedColor: "waiting",
        room,
      };
    }

    return {
      removedColor: null,
      room,
    };
  }

  promoteWaitingPlayer(): {
    player: Player | null;
    color:
      | "white"
      | "black"
      | null;
  } {
    const room = this.getRoom();

    const nextPlayer =
      this.waitingPlayers.shift();

    if (!nextPlayer) {
      return {
        player: null,
        color: null,
      };
    }

    if (!room.whitePlayer) {
      room.whitePlayer =
        nextPlayer;

      return {
        player: nextPlayer,
        color: "white",
      };
    }

    if (!room.blackPlayer) {
      room.blackPlayer =
        nextPlayer;

      return {
        player: nextPlayer,
        color: "black",
      };
    }

    this.waitingPlayers.unshift(
      nextPlayer,
    );

    return {
      player: null,
      color: null,
    };
  }

  getWaitingPlayers(): Player[] {
    return [
      ...this.waitingPlayers,
    ];
  }
}