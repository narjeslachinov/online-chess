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

        socket.join(
          result.room!.id,
        );

        socket.data.color =
          result.color;

        socket.emit(
          "game-status",
          {
            status:
              result.room!
                .whitePlayer &&
              result.room!
                .blackPlayer
                ? "playing"
                : "waiting-for-opponent",

            color:
              result.color,

            roomId:
              result.room!.id,
          },
        );

        console.log(
          `Player ${playerId} joined as ${result.color}`,
        );

        if (
          result.room!
            .whitePlayer &&
          result.room!
            .blackPlayer
        ) {
          io.to(
            result.room!.id,
          ).emit(
            "game-start",
            {
              roomId:
                result.room!.id,

              whitePlayer:
                result.room!
                  .whitePlayer.id,

              blackPlayer:
                result.room!
                  .blackPlayer.id,
            },
          );

          console.log(
            `Game started in room ${result.room!.id}`,
          );
        }
      },
    );

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
              },
            );
          }
        }

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