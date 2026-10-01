"use client";

import { useEffect, useState } from "react";

import { socket } from "../socket/socket-client";

export default function SocketTest() {
  const [connected, setConnected] =
    useState(false);

  useEffect(() => {
    const handleConnect = () => {
      setConnected(true);
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