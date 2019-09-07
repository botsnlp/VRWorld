// This file contains the boilerplate to execute your React app.
// If you want to modify your application's content, start in "index.js"

// const url = "peerjs-server-api.herokuapp.com";
const url = "localhost:3300";
import io from 'socket.io-client';
  import {validateCommand,getCommand} from './speech-recognition/p5speech/trie';

// import Peer from 'peerjs';
import {
  ReactInstance,
  Surface,
  Module
} from 'react-360-web';
// import WebVRPolyfill from 'webvr-polyfill';
// const polyfill = new WebVRPolyfill();

console.log("Peer:", Peer);
console.log("io:", io);

function init(bundle, parent, options = {}) {
  const r360 = new ReactInstance(bundle, parent, {
    // Add custom options here
    fullScreen: true,
    nativeModules: [
      ctx => new peerAudioModule(ctx),
      ctx => new speechRecognition(ctx)
    ],
    ...options,
  });

  //video panel 
  const videoSurface = r360.getDefaultSurface()
  videoSurface.resize(1000, 600)
  r360.renderToSurface(
    r360.createRoot('ConnectedVideoPanel', {
      /* initial props */ }),
    videoSurface
  );


  // Main center panel 
  const mainSurface = r360.getDefaultSurface()
  mainSurface.resize(1000, 600)
  r360.renderToSurface(
    r360.createRoot('ConnectedMain', {
      /* initial props */ }),
    mainSurface
  );

  const rightPanel = new Surface(400, 600, Surface.SurfaceShape.Flat)
  rightPanel.setAngle(-1.2, 0)
  r360.renderToSurface(
    r360.createRoot('ConnectedLeftPanel', {
      /* initial props */ }),
    rightPanel
  );

  const leftPanel = new Surface(400, 600, Surface.SurfaceShape.Flat)
  leftPanel.setAngle(1.2, 0)
  r360.renderToSurface(
    r360.createRoot('ConnectedRightPanel', {
      /* initial props */ }),
    leftPanel
  );

  const closePanel = new Surface(1000, 500, Surface.SurfaceShape.Flat)
  closePanel.setAngle(0, 0.6)
  r360.renderToSurface(
    r360.createRoot('ConnectedClose', {}),
    closePanel

  )

  //info panel
  const InfoPanel = new Surface(500, 300, Surface.SurfaceShape.Flat)
  InfoPanel.setAngle(0, -0.65)
  r360.renderToSurface(
    r360.createRoot('ConnectedInfo', {}),
    InfoPanel

  )

  const PeoplePanel = new Surface(1000, 600, Surface.SurfaceShape.Flat)
  PeoplePanel.setAngle(-1, 0)
  r360.renderToSurface(
    r360.createRoot('ConnectedPeople', {}),
    PeoplePanel

  )

  //rating surface
  const ratingSurface = r360.getDefaultSurface()
  // ratingSurface.resize(1000,600)
  r360.renderToSurface(
    r360.createRoot('ConnectedRatingPanel', {
      /* initial props */ }),
    ratingSurface
  );

  const KeyboardPanel = new Surface(1000, 300, Surface.SurfaceShape.Flat)
  KeyboardPanel.setAngle(0, -0.75)
  r360.renderToSurface(
    r360.createRoot('ConnectedKeyboard', {}),
    KeyboardPanel

  )

  // Load the initial environment
  r360.compositor.setBackground(r360.getAssetURL('tv-room.jpg'));
}

var socket;
var mypeers = [];
var room = "room";
var gate = true;
var manover = false;
var seeked = false;

//speech recognition
class speechRecognition extends Module{
  constructor(ctx){
    super('speechRecognition')
    this._ctx = ctx;
    // console.log(ctx);

  }

  main(){
    //UTIL
    // function createPassage (string) {
    //   speechParagraph.innerText = string;
    // }

    //MAIN
    function gotSpeech () {
      if(speechRec.resultValue){
        clearTimeout(timeoutID);
        speechString = speechRec.resultString;
        timeoutID = setTimeout(function () {
          console.log(getCommand(validateCommand(speechString)));
          // createPassage(speechString);
        }, 1400);
      }
    }

    var timeoutID;
    var speechString = "";

    var lang = 'en-IN';
    var speechRec = new p5.SpeechRec(lang ,gotSpeech);
    var continuous = true;
    var interim = true;
    speechRec.start(continuous, interim);

  }
}


//audio module
class peerAudioModule extends Module {
  constructor(ctx) {
    super('peerAudioModule')
    this._ctx = ctx;
    // console.log(ctx);
  }

  kandavel(id){
    // console.log("ctx:",ctx);
    // console.log("this._ctx...........",this._ctx)
    // console.log("aids of mohan:",id);
    this._ctx.invokeCallback(
      id, // callback id, passed to the method
      [50]
    );
    // callback();
  }

  socketControll(event){
    if(event.status == "ready"){
      socket.emit("controls", {
        action: "seek",
        id: socket.id,
        room,
        currentTime: event.position
    });
    }
    else if(event.status == "paused"){
      socket.emit("controls", {
        action: "pause",
        id: socket.id,
        room,
        currentTime: event.position
    });
    }
    else if(event.status == "playing"){
      socket.emit("controls", {
        action: "play",
        id: socket.id,
        room,
        currentTime: event.position
    });
    }
  }

  socketPause(pauseid){
    console.log("huo",pauseid)
    socket.on("controlUpdate", (obj) => {
      // this._ctx.invokeCallback(
      //   manoverid, // callback id, passed to the method
      //   []
      // );
      if (obj.id === socket.id)
          return;
      console.log(obj);
      // if (obj.action === "play") {
          // this._ctx.invokeCallback(
          //   seekid, // callback id, passed to the method
          //   [obj.currentTime]
          // );
          // this._ctx.invokeCallback(
          //   resumeid, // callback id, passed to the method
          //   []
          // );
          // vid.play().catch();
      // }
      if (obj.action === "pause") {
          // this._ctx.invokeCallback(
          //   seekid, // callback id, passed to the method
          //   [obj.currentTime]
          // );
          this._ctx.invokeCallback(
            pauseid, // callback id, passed to the method
            []
          );
          // vid.pause();
      }
      // if (obj.action === "seek") {
      //     // vid.currentTime = obj.seektime;
      //     this._ctx.invokeCallback(
      //       seekid, // callback id, passed to the method
      //       [obj.currentTime]
      //     );
      // }
  });
  }

  socketPlay(playid){
    socket.on("controlUpdate", (obj) => {
      
      if (obj.id === socket.id)
          return;
      console.log(obj);
      if (obj.action === "play") {
          this._ctx.invokeCallback(
            playid, // callback id, passed to the method
            [obj.currentTime]
          );
      }
  });
  }

  socketSeek(seekid){
    socket.on("controlUpdate", (obj) => {
      
      if (obj.id === socket.id)
          return;
      console.log(obj);
      if (obj.action === "play") {
          this._ctx.invokeCallback(
           seekid, // callback id, passed to the method
            [obj.currentTime]
          );
        }
    });
  }
  


  //  socket connection establish
  socketconnection() {
      socket = io.connect(url);

      function deletePeerData(peerid) {
        var index = -1;
        for (var i = 0; i < mypeers.length; i++) {
          if (mypeers[i].peerid === peerid)
            index = i;
        }
        if (index !== -1)
          mypeers.splice(index, 1);
      }

      socket.on("connect", () => {
          console.log("connected");
          socket.emit("joinRoom", room);

          console.log("Server:controls");

          socket.on("roomJoinSuccess", () => {
            console.log("Room joined");
            var peer = new Peer({
              host: 'peerjs-server-api.herokuapp.com',
              path:'/peer',
              secure: true,
              port: 443,
              config: {
                'iceServers': [{
                  url: 'stun:stun1.l.google.com:19302'
                }]
              }
            });

            peer.on("connection", (c) => {
              // sel("#conn").innerHTML += c.peer + ",";

              //PUSH CONN TO CONN LIST FINALLY
              deletePeerData(c.peer);
              mypeers.push(c);
              console.log(c);
              console.log("pushed");
              c.on('data', function (data) {
                console.log("hit");
                // inject(newchip(`Peer message, ${data}`));
              });
              callPeer(c.peer);
            });

            peer.on('open', (id) => {
              console.log("id generated");
              peer.id = id;
              // sel(".head").innerHTML = id;
              socket.emit('signal', {
                peerid: peer.id
              });
            });

            function callPeer(id) {
              console.log(id + "call");
              var call;
              navigator.mediaDevices.getUserMedia({
                audio: true,
              }).then((stream) => {
                call = peer.call(id, stream);
                call.on('stream', (stream) => {
                  console.log("received stream answered");
                  // var audio = document.createElement("audio");
                  var audio = new Audio();
                  audio.srcObject = stream;
                  // audio.style.display = "none";
                  // sel("#wrapper").appendChild(audio);
                  audio.play();
                  // let b = new Audio();
                  // b.muted = true;
                  // b.srcObject = stream;

                  // var peerInput = context.createMediaStreamSource(
                  //     stream);
                  // console.log("connecting to dest");
                  // peerInput.connect(context.destination);
                });
              })
            }
            peer.on('call', function (call) {
              // inject(newchip("call received"));
              navigator.mediaDevices.getUserMedia({
                audio: true,
              }).then((stream) => {
                call.answer(stream);
                call.on('stream', function (stream) {
                  console.log("received stream");
                  var audio = new Audio();
                  // var audio = document.createElement("audio");
                  audio.srcObject = stream;
                  // audio.style.display = "none";
                  // sel("#wrapper").appendChild(audio);
                  audio.play();
                  // let a = new Audio();
                  // a.muted = true;
                  // a.srcObject = stream;
                  // var peerInput = context
                  //     .createMediaStreamSource(
                  //         stream);
                  // console.log("connecting to dest");
                  // peerInput.connect(context.destination);
                  // inject(newchip("Done"));
                });
              });
            });
            peer.on('data', function (data) {
              console.log("hittedma");
              // inject(newchip(`! Peer message, ${data}`));
            });
            socket.on("signal", (d) => {
              console.log(d + "signalled");
              if (d.peerid == peer.id) {
                console.log("hit oops");
                return;
              }
              var conn = peer.connect(d.peerid, {
                reliable: true
              });
              console.log("peer added");
              conn.on('open', function () {
                console.log("connectedtopeer");
                console.log(conn);
                mypeers.push(conn);
                console.log("pushed to no of peers");
                // sel("#conn").innerHTML += conn.peer + ",";
                conn.on('data', function (data) {
                  console.log("hittedma");
                  // inject(newchip(`Peer message, ${data}`));
                });
              });
            });
          })

        })
      }





        //  peer logic
        // videostatus(status){
        //   if(status === 'playing'){

        //   }
        //   else if(status === 'loading'){

        //   }
        //   else if()
        // }

        stream() {
          navigator.mediaDevices.getUserMedia({
            audio: true,
          }).then((stream) => {
            window.stream = stream;
          });
          console.log(new Audio());
          console.log("loaded...")
        }


      }

      window.React360 = {
        init
      };