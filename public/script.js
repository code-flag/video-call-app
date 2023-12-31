const PRE = "DELTA";
const SUF = "MEET";
var room_id = ROOM_ID;
var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;
var local_stream;
var screenStream;
var peer = null;
var currentPeer = null;
var screenSharing = false;
const socket = io("/");
var userPeerId = '';
var mainUserPeerId = '';

const videoGrid = document.getElementById("videos__group");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");

const shareScreen = document.querySelector("#shareScreen");

backBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});

user = prompt("Enter your name");

// var peer = new Peer({
//   // host: '127.0.0.1',
//   host: "jvs-video-app.onrender.com",
//   secure: true,
//   // port: '',
//   path: '/peerjs',
//   port: 443,
//   debug: 3,

//   config: {
//     'iceServers': [
//       {
//         urls: "stun:stun.relay.metered.ca:80",
//       },
//       {
//         urls: "turn:a.relay.metered.ca:80",
//         username: "eeb64afd49d5799fe41de5ac",
//         credential: "IbwBDjAqpxDBfF1Y",
//       },
//       {
//         urls: "turn:a.relay.metered.ca:80?transport=tcp",
//         username: "eeb64afd49d5799fe41de5ac",
//         credential: "IbwBDjAqpxDBfF1Y",
//       },
//       {
//         urls: "turn:a.relay.metered.ca:443",
//         username: "eeb64afd49d5799fe41de5ac",
//         credential: "IbwBDjAqpxDBfF1Y",
//       },
//       {
//         urls: "turn:a.relay.metered.ca:443?transport=tcp",
//         username: "eeb64afd49d5799fe41de5ac",
//         credential: "IbwBDjAqpxDBfF1Y",
//       },
//       /**
//        * xpressTURN provides fast, free and reliable TURN servers for your WebRTC applications and services.
//        */
//       {
//         urls: "relay1.expressturn.com:3478",
//         username: "ef2S7F40GFP6W6N595",
//         credential: "2ETziG8YBuDvbrLt",
//       },
//   ]
//   },
// });

function createRoom() {
  console.log("Creating Room");
  peer = new Peer(room_id);
  peer.on("open", (id) => {
    console.log("Peer Connected with ID: ", id);
    userPeerId = id;
    mainUserPeerId = id;

    getUserMedia(
      { video: true, audio: true },
      (stream) => {
        local_stream = stream;
        setLocalStream(local_stream);

        /** get all the already joined user stream */
        peer.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (stream) => {
            console.log("streammmmm", stream);
            userPeerId = stream.id
            setRemoteStream(stream);
          });
          currentPeer = call;
        });

        // listen to all the connected user

        socket.on("user-connected", (userId) => {
          console.log("main", userPeerId, "connected", userId);
          connectToNewUser(userId, stream);
        });

        socket.on("new-screen-sharing", (userId) => {
          rearrangeDivForScreenSharingDisplay(userId);
        });

        socket.on("new-screen-sharing-stopped", (userId) => {
           removeScreenSharingDisplayClass(userId);
        });
      },
      (err) => {
        console.log(err);
      }
    );
    socket.emit("join-room", room_id, id, user);
  });
}

socket.on("socket-connected", (val) => {
  console.log("connection info: ", val);
});

function joinRoom() {
  peer = new Peer();
  peer.on("open", (id) => {
    console.log("Connected with Id: " + id);
    userPeerId = id;
    mainUserPeerId = id;


    getUserMedia(
      { video: true, audio: true },
      (stream) => {
        local_stream = stream;
        setLocalStream(local_stream);

        peer.on("call", (call) => {
          call.answer(local_stream);
          call.on("stream", (stream) => {
            console.log("join streammmmm", stream);
            setRemoteStream(stream);
          });
          currentPeer = call;
        });

        socket.emit("join-room", room_id, id, user);

        socket.on("user-connected", (userId) => {
          console.log("main", userPeerId, "connected", userId);
          connectToNewUser(userId, stream);
        });

        
        socket.on("new-screen-sharing", (userId) => {
          rearrangeDivForScreenSharingDisplay(userId);
        });

        socket.on("new-screen-sharing-stopped", (userId) => {
           removeScreenSharingDisplayClass(userId);
        });
      },
      (err) => {
        console.log(err);
      }
    );
  });
}

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  userPeerId = userId;
  call.on("stream", (userVideoStream) => {
    console.log("streammmmm connect", stream);
    setRemoteStream(userVideoStream);
  });
  currentPeer = call;
};

function setLocalStream(stream) {
  let video = document.createElement("video");
  video.setAttribute("id", "local-video");
  video.srcObject = stream;
  video.muted = true;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.appendChild(video);
  });
}

function setRemoteStream(stream) {
  let id = new Date();

  const video = document.createElement("video");
  video.setAttribute("id", userPeerId);

  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.appendChild(video);
  });
}


function rearrangeDivForScreenSharingDisplay(elementId){
  let divId = "#videos__group " + "#" + elementId;
  console.log("diiv", divId);
  const elem = $(divId).remove().prependTo('#videos__group');
  elem.prependTo("#videos__group");
  elem.addClass("shared-screen");
}

function removeScreenSharingDisplayClass(elementId){
  let divId = "#videos__group " + "#" + elementId;
  console.log("dividd", divId);
  const elem = $(divId).removeClass("shared-screen");
}


let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
  const enabled = local_stream.getAudioTracks()[0].enabled;
  if (enabled) {
    local_stream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    local_stream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = local_stream.getVideoTracks()[0].enabled;
  if (enabled) {
    local_stream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    local_stream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

shareScreen.addEventListener("click", () => {
  if (screenSharing) {
    stopScreenSharing();
    shareScreen.classList.toggle("background__red");
    socket.emit("screen-sharing-stopped", room_id, mainUserPeerId)
  }
  else
  {
    startScreenShare();
    shareScreen.classList.toggle("background__red");
    socket.emit("screen-sharing", room_id, mainUserPeerId)
  }
});

inviteButton.addEventListener("click", (e) => {
  // prompt(
  //   "Copy this link and send it to people you want to meet with",
  //   window.location.href
  // );

  let currentTime = new Date().getMilliseconds();

  navigator.clipboard.writeText(window.location.href + "__" + currentTime);
  alert(
    "Meeting link copied to clipboard \n" +
      window.location.href +
      "__" +
      currentTime
  );
});

socket.on("createMessage", (message, userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${
          userName === user ? "me" : userName
        }</span> </b>
        <span>${message}</span>
    </div>`;
});

function startScreenShare() {
  if (screenSharing) {
    stopScreenSharing();
  }
  navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
    screenStream = stream;
    let videoTrack = screenStream.getVideoTracks()[0];
    videoTrack.onended = () => {
      stopScreenSharing();
    };
    if (peer) {
      let sender = currentPeer.peerConnection.getSenders().find(function (s) {
        return s.track.kind == videoTrack.kind;
      });
      sender.replaceTrack(videoTrack);
      screenSharing = true;
    }
    console.log(screenStream);
  });
}

function stopScreenSharing() {
  if (!screenSharing) return;
  let videoTrack = local_stream.getVideoTracks()[0];
  if (peer) {
    let sender = currentPeer.peerConnection.getSenders().find(function (s) {
      return s.track.kind == videoTrack.kind;
    });
    sender.replaceTrack(videoTrack);
  }
  screenStream.getTracks().forEach(function (track) {
    track.stop();
  });
  screenSharing = false;
}

if (isRoomCreated === "true" || isRoomCreated === true) {
  joinRoom();
} else {
  createRoom();
}
