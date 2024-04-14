const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const { ACTIONS } = require("./ACTIONS.JS");
const { CANVASACTIONS } = require("./ACTIONS.JS");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const userSockerMap = {};
const roomData = {};

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSockerMap[socketId],
      };
    }
  );
}

function generateTimeStamp() {
  const currentTime = new Date();
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const amOrPm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

  const timestamp = `${formattedHours}:${formattedMinutes} ${amOrPm}`;
  return timestamp;
}

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSockerMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach((client) => {
      io.to(client.socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: client.socketId,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    //Send to all users except the sender
    roomData[roomId] = code;
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ roomId, socketId }) => {
    //Send to just newly joined user.
    if (!roomData[roomId]) {
      roomData[roomId] = `function sayHello() {
   console.log("Hello, World!");
}`;
    }
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code: roomData[roomId] });
  });

  socket.on(ACTIONS.MESSAGE, ({ roomId, message }) => {
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.MESSAGE, {
        message,
        id: Date.now(),
        username: userSockerMap[socket.id],
        timestamp: generateTimeStamp(),
      });
    });
  });

  socket.on(CANVASACTIONS.RECTANGLE, ({ roomId, rectangles, action }) => {
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(CANVASACTIONS.RECTANGLE, {
        rectangles,
        action,
      });
    });
  });
  socket.on(CANVASACTIONS.CIRCLE, ({ roomId, circles, action }) => {
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(CANVASACTIONS.CIRCLE, {
        circles,
        action,
      });
    });
  });
  socket.on(CANVASACTIONS.ARROW, ({ roomId, arrows, action }) => {
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(CANVASACTIONS.ARROW, {
        arrows,
        action,
      });
    });
  });
  socket.on(CANVASACTIONS.SCRIBBLE, ({ roomId, scribbles, action }) => {
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(CANVASACTIONS.SCRIBBLE, {
        scribbles,
        action,
      });
    });
  });
  socket.on(CANVASACTIONS.TEXT, ({ roomId, texts, action }) => {
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(CANVASACTIONS.TEXT, {
        texts,
        action,
      });
    });
  });
  socket.on(CANVASACTIONS.ERASE, ({ roomId, shapeId, action }) => {
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(CANVASACTIONS.ERASE, {
        shapeId,
        action,
      });
    });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      getAllConnectedClients(roomId).length === 1 && delete roomData[roomId];
      socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSockerMap[socket.id],
      });
    });
    delete userSockerMap[socket.id];
    socket.leave();
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server has started listening on port " + PORT);
});
