import { Server } from "socket.io";

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket",
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("joinRoom", ({ room, name }) => {
        socket.join(room);
        console.log(`${name} joined room: ${room}`);
      });

      socket.on("sendMessage", ({ room, message }) => {
        io.to(room).emit("receiveMessage", message);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });
  }

  res.end();
};

export default ioHandler;
