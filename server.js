const socketIO = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");
const uid = require("uid");
const app = express();
app.use(cors());
const server = http.createServer(app);
const freeroom = [];
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("room-init", (roomid) => {
    console.log("Room:requested");
    socket.join(roomid);
    // console.log("room:req:completed - ", roomid);
    socket.on("inbox", (text) => {
      // console.log("new message - ", roomid, text);
      socket.broadcast.to(roomid).emit("recv-message", text);
      // console.log("Room:message;broadcasted -> ", roomid);
    });
    socket.on("peerid", (id) => {
      console.log("Peer ID Receiveed");
      socket.broadcast.to(roomid).emit("recv-peer", id);
      console.log("Peer sent to room -> ", roomid);
      console.log("Peer ID sent");
    });
  });
  console.log("new connection established");

  socket.on("disconnect-room", (room) => {
    console.log("You want to leave -> ", room);
    console.log(socket.adapter.rooms);
    socket.leave(room);
    socket.broadcast
      .to(room)
      .emit("user-left", "Stanger disconnected the room");
    console.log("Disconnected the room -> ", room);
  });
});

app.post("/anyfreeroom", (req, res) => {
  if (freeroom.length == 0) {
    console.log("no free room");
    var roomid = uid.uid(32);
    freeroom.push(roomid);
    return res.json({ message: "created Room", roomid: roomid });
  } else {
    var roomid = freeroom.pop();
    return res.json({ message: "Free room available", roomid: roomid });
  }
});

server.listen(3000, () => {
  console.log("server is running");
});
