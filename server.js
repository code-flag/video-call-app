const express     = require('express');
const app         = require('express')();
const server      = require('http').createServer(app);
const io          = require('socket.io')(server, {
  cors: {
    origin: '*'
  }
});
const ejs         = require('ejs');
const { v4: uuidv4 } = require("uuid");

app.set("view engine", "ejs");

const { ExpressPeerServer } = require("peer");
const path = require("path");
const opinions = {
  debug: true,
  allow_discovery: true,
}

let isRoomCreated = false;

const Port = process.env.PORT || 3030;


app.use("/peerjs", ExpressPeerServer(server, opinions));
// app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static("public"));

app.locals.classTitle = "JSS3/Mathematics wk2";

roomUsers = {};



app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});


app.get("/:room", (req, res) => {
let mid = req.params.room.split("__");
roomId = mid[0];
let userName;
isRoomCreated = mid[1] ? true: false;
if (!isRoomCreated) {
  console.log("room id", roomId);
  roomUsers[roomId] = ["host"];
  userName = "host"
}else{
  roomUsers[roomId].push(mid[1]);
  userName = mid[1];
}
  res.render("room", { roomId: roomId, Port: Port, isRoomCreated:  isRoomCreated, userName: userName });
});



// io.on("connection", (socket) => {
//   socket.on("join-room", (roomId, userId, userName) => {
//     socket.join(roomId);
//     setTimeout(()=>{
//       socket.to(roomId).broadcast.emit("user-connected", userId);
//     }, 1000)
//     socket.on("message", (message) => {
//       io.to(roomId).emit("createMessage", message, userName);
//     });
//   });
// });


io.on("connection", (socket) => {
  socket.emit("socket-connected", "socket connected with id " + socket?.id);
  console.log("connected", socket.id);



  socket.on("join-room", (roomId, userId, userName) => {
    console.log("joined", roomId, userId, userName);
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });


  });
});

server.listen(Port, () => {
  console.log(`Mesenger Server is running on http://localhost:${Port}`);
});
