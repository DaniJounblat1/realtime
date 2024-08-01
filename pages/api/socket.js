import { Server } from "socket.io";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("Setting up socket.io...");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("joinRoom", ({ room }) => {
        socket.join(room);
        console.log(`${socket.id} joined room: ${room}`);
      });

      socket.on("sendMessage", (message) => {
        io.to(message.room).emit("receiveMessage", message);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });
  } else {
    console.log("Socket.io already set up");
  }

  res.end();
}
