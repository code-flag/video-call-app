const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
const { ExpressPeerServer } = require("peer");
const path = require("path");
const opinions = {
  debug: true,
  allow_discovery: true,
}

let isRoomCreated = false;

const Port = process.env.PORT || 3030;


app.use("/peerjs", ExpressPeerServer(server, opinions));
app.use(express.static(path.join(__dirname, 'public')));

app.locals.classTitle = "JSS3/Mathematics wk2";

app.get("/", (req, res) => {
  console.log("yesss");
  res.redirect(`/${uuidv4()}`);
});


app.get("/:room", (req, res) => {
let mid = req.params.room.split("__");
roomId = mid[0];
isRoomCreated = mid[1] ? true: false;

console.log("iscreated", mid[1], isRoomCreated);
  // res.render("room", { roomId: roomId, Port: Port, isRoomCreated:  isRoomCreated });
  res.send({kk: "fdljio"})
});



io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    setTimeout(()=>{
      socket.to(roomId).broadcast.emit("user-connected", userId);
    }, 1000)
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});

server.listen(Port);
