import { createServer } from "node:http";

import { Server } from "socket.io";

import { RoomManager } from "./room-manager";

const PORT = 3001;

const httpServer =
  createServer();

const io = new Server(
  httpServer,
  {
    cors: {
      origin:
        "http://localhost:3000",
    },
  },
);

const roomManager =
  new RoomManager();

io.on(
  "connection",
  (socket) => {
    console.log(
      `Socket connected: ${socket.id}`,
    );

    // =========================
    // JOIN GAME
    // =========================

    socket.on(
      "join-game",
      (
        playerId: string,
      ) => {
        const result =
          roomManager.addPlayer({
            id: playerId,
          });

        socket.data.playerId =
          playerId;

        // Player must wait
        if (
          result.color ===
          "waiting"
        ) {
          socket.data.color =
            "waiting";

          socket.emit(
            "game-status",
            {
              status: "waiting",
            },
          );

          console.log(
            `Player ${playerId} is waiting.`,
          );

          return;
        }

        // Join room
        socket.join(
          result.room!.id,
        );

        socket.data.color =
          result.color;

        const isGameReady =
          Boolean(
            result.room!
              .whitePlayer &&
            result.room!
              .blackPlayer,
          );

        socket.emit(
          "game-status",
          {
            status: isGameReady
              ? "playing"
              : "waiting-for-opponent",

            color:
              result.color,

            roomId:
              result.room!.id,

            currentTurn:
              result.room!
                .currentTurn,
          },
        );

        console.log(
          `Player ${playerId} joined as ${result.color}`,
        );

        // Start game when both players exist
        if (isGameReady) {
          io.to(
            result.room!.id,
          ).emit(
            "game-start",
            {
              roomId:
                result.room!.id,

              whitePlayer:
                result.room!
                  .whitePlayer!.id,

              blackPlayer:
                result.room!
                  .blackPlayer!.id,

              currentTurn:
                result.room!
                  .currentTurn,
            },
          );

          console.log(
            `Game started in room ${result.room!.id}`,
          );
        }
      },
    );

    // =========================
    // MAKE MOVE
    // =========================

    socket.on(
      "make-move",
      (
        move: {
          from: string;
          to: string;
        },
      ) => {
        const playerId =
          socket.data.playerId;

        const color =
          socket.data.color;

        if (
          !playerId ||
          (color !== "white" &&
            color !== "black")
        ) {
          return;
        }

        const room =
          roomManager.getRoom();

        if (
          !room.whitePlayer ||
          !room.blackPlayer
        ) {
          return;
        }

        // Check that player belongs to this room
        const playerIsInRoom =
          room.whitePlayer.id ===
            playerId ||
          room.blackPlayer.id ===
            playerId;

        if (!playerIsInRoom) {
          return;
        }

        // Check player's turn
        if (
          color !==
          room.currentTurn
        ) {
          socket.emit(
            "invalid-move",
            {
              reason:
                "NOT_YOUR_TURN",
            },
          );

          return;
        }

        const chessMove = {
          from: move.from,
          to: move.to,
          playerColor: color,
        };

        // Send move to everyone in the room
        io.to(
          room.id,
        ).emit(
          "opponent-move",
          chessMove,
        );

        // Change turn
        room.currentTurn =
          room.currentTurn ===
          "white"
            ? "black"
            : "white";

        console.log(
          `Move ${move.from} -> ${move.to} by ${color}`,
        );
      },
    );

    // =========================
    // DISCONNECT
    // =========================

    socket.on(
      "disconnect",
      () => {
        const playerId =
          socket.data.playerId;

        if (!playerId) {
          return;
        }

        const result =
          roomManager.removePlayer(
            playerId,
          );

        if (
          !result.removedColor
        ) {
          return;
        }

        console.log(
          `Player ${playerId} disconnected.`,
        );

        if (
          result.removedColor !==
            "white" &&
          result.removedColor !==
            "black"
        ) {
          return;
        }

        // Promote waiting player
        const promoted =
          roomManager.promoteWaitingPlayer();

        if (
          promoted.player &&
          promoted.color
        ) {
          const waitingSocket =
            Array.from(
              io.sockets.sockets.values(),
            ).find(
              (socket) =>
                socket.data.playerId ===
                promoted.player!.id,
            );

          if (waitingSocket) {
            waitingSocket.join(
              result.room.id,
            );

            waitingSocket.data.color =
              promoted.color;

            waitingSocket.emit(
              "game-status",
              {
                status:
                  "waiting-for-opponent",

                color:
                  promoted.color,

                roomId:
                  result.room.id,

                currentTurn:
                  result.room
                    .currentTurn,
              },
            );

            console.log(
              `Waiting player ${promoted.player.id} promoted to ${promoted.color}.`,
            );
          }
        }

        // Notify remaining players
        io.to(
          result.room.id,
        ).emit(
          "player-left",
          {
            playerId,

            color:
              result.removedColor,
          },
        );
      },
    );
  },
);

httpServer.listen(
  PORT,
  () => {
    console.log(
      `Socket server running on http://localhost:${PORT}`,
    );
  },
);