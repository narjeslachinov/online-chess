import { createServer } from "node:http";
import { Server } from "socket.io";

const PORT = 3001;

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log(
    `Player connected: ${socket.id}`,
  );

  socket.on("disconnect", () => {
    console.log(
      `Player disconnected: ${socket.id}`,
    );
  });
});

httpServer.listen(PORT, () => {
  console.log(
    `Socket server running on http://localhost:${PORT}`,
  );
});