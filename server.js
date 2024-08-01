const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const io = socketIo(httpServer);

  let onlineUsers = 0;

  io.on('connection', (socket) => {
    onlineUsers++;
    io.emit('userCount', onlineUsers);
    socket.broadcast.emit('userJoined');

    socket.on('disconnect', () => {
      onlineUsers--;
      io.emit('userCount', onlineUsers);
    });
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
