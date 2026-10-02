"use client";

import { useEffect, useState } from "react";

import { socket } from "../socket/socket-client";
import { getPlayerId } from "../utils/player.utils";

export default function SocketTest() {
  const [connected, setConnected] =
    useState(false);

    useEffect(() => {
      const handleConnect = () => {
        setConnected(true);

        const playerId = getPlayerId();

        socket.emit(
          "join-game",
          playerId,
        );
      };

      const handleDisconnect = () => {
        setConnected(false);
      };

      socket.on(
        "connect",
        handleConnect,
      );

      socket.on(
        "disconnect",
        handleDisconnect,
      );

      socket.on(
        "game-status",
        (data) => {
          console.log(
            "Game status:",
            data,
          );
        },
      );

      socket.on(
        "game-start",
        (data) => {
          console.log(
            "Game started:",
            data,
          );
        },
      );

      socket.connect();

      return () => {
        socket.off(
          "connect",
          handleConnect,
        );

        socket.off(
          "disconnect",
          handleDisconnect,
        );

        socket.off(
          "game-status",
        );

        socket.off(
          "game-start",
        );

        socket.disconnect();
      };
    }, []);

  return (
    <div className="text-white">
      {connected
        ? "🟢 متصل به سرور"
        : "🔴 قطع از سرور"}
    </div>
  );
}