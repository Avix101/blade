"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//The animation class bundles a collection of properties to change over a set period of time
//It also updates its state if given a timestamp
var Animation = function () {
  //Build the animation using the given data
  function Animation(logistics, holdReadyStatus) {
    _classCallCheck(this, Animation);

    var time = 0;
    this.startTime = 0;
    this.currentTime = time;
    this.begin = logistics.begin;
    this.timeToFinish = logistics.timeToFinish;
    this.propsBegin = logistics.propsBegin;
    this.propsEnd = logistics.propsEnd;
    this.propsCurrent = {};
    this.complete = false;
    this.holdReadyStatus = holdReadyStatus;

    var propKeys = Object.keys(this.propsBegin);
    for (var i = 0; i < propKeys.length; i++) {
      var key = propKeys[i];
      this.propsCurrent[key] = this.propsBegin[key];
    }
  }

  _createClass(Animation, [{
    key: "bind",


    //Binding an animation sets it's starting time to the current time and begins the animation
    value: function bind(currentTime) {
      this.startTime = currentTime;
      this.currentTime = currentTime;
    }

    //Animations use the current time to update its current status

  }, {
    key: "update",
    value: function update(currentTime) {
      var timeElapsed = currentTime - this.currentTime;
      var timeSinceStart = currentTime - this.startTime;
      this.currentTime += timeElapsed;

      //Don't update if the animation is finished
      if (timeSinceStart < this.begin) {
        return;
      }

      //Calcualte the ratio between start and finish
      var ratio = (timeSinceStart - this.begin) / this.timeToFinish;

      //The ratio should never be greater than 1
      if (ratio > 1) {
        ratio = 1;
      }

      //Update all properties to reflect the current stage of the animation (using lerp)
      var propKeys = Object.keys(this.propsCurrent);
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i];

        this.propsCurrent[key] = lerp(this.propsBegin[key], this.propsEnd[key], ratio);
      }

      //If the animation has reached its end, complete it
      if (ratio >= 1) {
        this.complete = true;
      }
    }

    //Determine if the animation is ready

  }, {
    key: "ready",
    value: function ready() {
      return this.holdReadyStatus;
    }

    //Copy the values calculated by the animation into a given object

  }, {
    key: "copyVals",
    value: function copyVals(obj) {
      var keys = Object.keys(this.propsCurrent);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        obj[key] = this.propsCurrent[key];
      }
    }
  }]);

  return Animation;
}();

;
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//A card object holds location and animation related data
var Card = function () {
  function Card(name, sortValue, location, size) {
    _classCallCheck(this, Card);

    this.name = name;
    this.sortValue = sortValue;
    this.x = location.x;
    this.y = location.y;
    this.width = size.width * 0.6;
    this.height = size.height * 0.6;
    this.radians = 0;
    this.revealed = false;
    this.animation = null;
    this.hueRotate = 0;
    this.originalLocation = location;
    this.animCallback = null;
    this.sealed = false;
    this.opacity = 1;
  }

  _createClass(Card, [{
    key: "bindAnimation",


    //Animations can be bound to a card, in which case the card will animate when updated
    value: function bindAnimation(animation, callback, seal) {

      if (seal) {
        this.sealed = seal;
      }

      //Start the animation at the time of bind
      this.animation = animation;
      this.animation.bind(new Date().getTime());

      //If the animation comes with a callback, set the callback
      if (callback) {
        this.animCallback = callback;
      } else {
        this.animCallback = null;
      }
    }
  }, {
    key: "isRevealed",


    //Determine if the card is revealed
    value: function isRevealed() {
      return this.revealed;
    }
  }, {
    key: "flip",


    //Toggle whether or not the card is revealed
    value: function flip() {
      this.revealed = !this.revealed;
    }
  }, {
    key: "cancelAnimation",


    //Cancel a card's animation
    value: function cancelAnimation() {
      delete this.animation;
      this.animation = null;
    }
  }, {
    key: "endAnimation",


    //End the card's animation (same as cancel, but calls the animation callback)
    value: function endAnimation() {
      this.cancelAnimation();
      if (this.animCallback) {
        this.animCallback(this);
      }
    }
  }, {
    key: "readyToAnimate",


    //Determine if the card is ready to animate
    value: function readyToAnimate() {
      return this.animation === null;
    }
  }, {
    key: "reveal",


    //Reveal the card's true name
    value: function reveal(name) {
      this.name = name;
    }
  }, {
    key: "flipImage",


    //Visually flip the card 180 degrees
    value: function flipImage() {
      this.radians = (this.radians + Math.PI) % (2 * Math.PI);
    }

    //Update the card based on its current animation

  }, {
    key: "update",
    value: function update(currentTime) {
      if (this.animation) {
        //Update the animation and copy over the new values
        this.animation.update(currentTime);
        this.animation.copyVals(this);

        if (this.animation.complete) {
          this.endAnimation();
          return true;
        }

        return this.animation.ready();
      }
      return this.animation !== null;
    }
  }]);

  return Card;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//An effect object holds info about an effect and its current state
var Effect = function () {
  function Effect(image, location, frameDetails) {
    _classCallCheck(this, Effect);

    this.image = image;
    this.x = location.x;
    this.y = location.y;
    this.frame = 0;
    this.frameWidth = frameDetails.width;
    this.frameHeight = frameDetails.height;
    this.animation = null;
    this.animCallback = null;
    this.opacity = 1;
    this.radians = 0;
    this.hueRotate = 0;
  }

  //Animations can be bound to an effect, in which case the effect will animate when updated


  _createClass(Effect, [{
    key: "bindAnimation",
    value: function bindAnimation(animation, callback, seal) {

      if (seal) {
        this.sealed = seal;
      }

      //Start the animation at the time of bind
      this.animation = animation;
      this.animation.bind(new Date().getTime());

      //If the animation comes with a callback, set the callback
      if (callback) {
        this.animCallback = callback;
      } else {
        this.animCallback = null;
      }
    }
  }, {
    key: "cancelAnimation",


    //Cancel an effect's animation
    value: function cancelAnimation() {
      delete this.animation;
      this.animation = null;
    }
  }, {
    key: "endAnimation",


    //End the effect's animation (same as cancel, but calls the animation callback)
    value: function endAnimation() {
      this.cancelAnimation();
      if (this.animCallback) {
        this.animCallback(this);
      }
    }
  }, {
    key: "readyToAnimate",


    //Determine if the effect is ready to animate
    value: function readyToAnimate() {
      return this.animation === null;
    }
  }, {
    key: "flipImage",


    //Visually flip the effect 180 degrees
    value: function flipImage() {
      this.radians = (this.radians + Math.PI) % (2 * Math.PI);
    }

    //Update the effect based on its current animation

  }, {
    key: "update",
    value: function update(currentTime) {
      if (this.animation) {
        //Update the animation and copy over the new values
        this.animation.update(currentTime);
        this.animation.copyVals(this);

        if (this.animation.complete) {
          this.endAnimation();
          return true;
        }

        return this.animation.ready();
      }
      return this.animation !== null;
    }
  }]);

  return Effect;
}();
"use strict";

var cardImageStruct = {};

//Interpolate between two values given a ratio between 0 and 1
var lerp = function lerp(val1, val2, ratio) {
  var component1 = (1 - ratio) * val1;
  var component2 = ratio * val2;
  return component1 + component2;
};

//Clear the given canvas
var clearCanvas = function clearCanvas(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

//Draw to the display canvas, which is dynamically resizable
var displayFrame = function displayFrame() {

  //If the display canvas doesn't exist, don't draw to it
  if (!viewport) {
    return;
  }

  //Clear the display canvas, draw from the prep canvas
  clearCanvas(viewport, viewCtx);
  viewCtx.save();
  viewCtx.imageSmoothingEnabled = false;
  viewCtx.drawImage(prepCanvas, 0, 0, prepCanvas.width, prepCanvas.height, 0, 0, viewport.width, viewport.height);
  viewCtx.restore();
};

//Draw a card to the prep canvas
var drawCard = function drawCard(card) {
  var image = cardImageStruct[card.name];

  //If the card isn't revealed, draw the back of a card
  if (!card.isRevealed()) {
    image = cardImageStruct["back"];
  }

  prepCtx.save();

  //Adjust the card's color and opacity accordingly
  prepCtx.globalAlpha = card.opacity;

  if (card === selectedCard) {
    prepCtx.filter = "hue-rotate(" + card.hueRotate + "deg)";
  }

  //Translate and rotate the card
  prepCtx.translate(card.x + card.width / 2, card.y + card.height / 2);
  prepCtx.rotate(card.radians);

  //Draw the card to the prep canvas
  prepCtx.drawImage(image, -card.width / 2, -card.height / 2, card.width, card.height);
  prepCtx.restore();
};

//Draw the current scores to the prep canvas
var drawScore = function drawScore(playerPoints, opponentPoints) {
  prepCtx.save();
  prepCtx.font = "96pt Fira Sans, sans-serif";

  var playerWidth = prepCtx.measureText(playerPoints).width;
  var opponentWidth = prepCtx.measureText(opponentPoints).width;
  var halfWidth = prepCanvas.width / 2 - 3;

  //Make text gradients
  var opponentGradient = prepCtx.createLinearGradient(0, 355, 0, 427);
  var playerGradient = prepCtx.createLinearGradient(0, 700, 0, 772);
  playerGradient.addColorStop(0, "white");
  opponentGradient.addColorStop(0, "white");
  playerGradient.addColorStop(0.3, "#dbb75c");
  opponentGradient.addColorStop(0.3, "#dbb75c");

  prepCtx.textAlign = "center";
  prepCtx.textBaseline = "middle";

  //Draw the two scores to the screen
  prepCtx.fillStyle = opponentGradient;
  prepCtx.fillText(opponentPoints, halfWidth, 355);

  prepCtx.fillStyle = playerGradient;
  prepCtx.fillText(playerPoints, halfWidth, 700);

  prepCtx.restore();
};

//Draw the instruction set to the prep canvas
var drawTurnIndicator = function drawTurnIndicator() {
  var playerTurn = gameState.turnOwner === playerStatus;

  prepCtx.save();
  prepCtx.font = "28pt Fira Sans, sans-serif";
  prepCtx.textAlign = "center";
  prepCtx.textBaseline = "middle";
  var x = 490;
  var y = 645;

  //Depending on the gamestate, draw instructions to the screen for the player
  switch (gameState.turnType) {
    case "playCard":
      if (blastSelect) {
        prepCtx.fillStyle = "lightgreen";
        prepCtx.fillText("Select one of your opponent's cards to blast!", x, y);
      } else if (playerTurn) {
        prepCtx.fillStyle = "cyan";
        prepCtx.fillText("Your turn, select a card from your hand!", x, y);
      } else {
        prepCtx.fillStyle = "pink";
        prepCtx.fillText("Wait for your opponent to play a card.", x, y);
      }
      break;
    case "pickFromDeck":
      prepCtx.fillStyle = "white";
      prepCtx.fillText("Score tied - both players draw from their decks.", x, y);
      break;
    default:
      break;
  }

  prepCtx.restore();
};

//Draw the game's result to the prep canvas
var drawGameResult = function drawGameResult() {
  prepCtx.save();
  prepCtx.globalAlpha = 0.7;
  prepCtx.fillStyle = "black";
  prepCtx.fillRect(0, 0, prepCanvas.width, prepCanvas.height);

  prepCtx.globalAlpha = 1;
  prepCtx.font = "72pt Fira Sans, sans-serif";
  prepCtx.textAlign = "center";
  prepCtx.textBaseline = "middle";

  //Depending on the game's winner, draw the appropriate text to the screen
  if (playerStatus === gameState.winner) {
    prepCtx.fillStyle = "blue";
    prepCtx.fillText("You won!", prepCanvas.width / 2, prepCanvas.height / 2);
  } else if (gameState.winner === "tie") {
    prepCtx.fillStyle = "blue";
    prepCtx.fillText("You tied!", prepCanvas.width / 2, prepCanvas.height / 2);
  } else {
    prepCtx.fillStyle = "red";
    prepCtx.fillText("You Lost!", prepCanvas.width / 2, prepCanvas.height / 2);
  }

  prepCtx.restore();
};

//Draw a waiting overlay to the prep canvas
var drawWaitingOverlay = function drawWaitingOverlay(text) {
  prepCtx.save();
  prepCtx.globalAlpha = 0.7;
  prepCtx.fillStyle = "black";
  prepCtx.fillRect(0, 0, prepCanvas.width, prepCanvas.height);

  prepCtx.globalAlpha = 1;
  prepCtx.font = "72pt Fira Sans, sans-serif";
  prepCtx.textAlign = "center";
  prepCtx.textBaseline = "middle";

  prepCtx.fillStyle = "white";
  prepCtx.fillText(text, prepCanvas.width / 2, prepCanvas.height / 2);

  prepCtx.restore();
};

//Draw the player and opponent profiles to the prep canvas
var drawPlayerProfiles = function drawPlayerProfiles() {
  var playerProfile = getPlayerProfile();
  var opponentProfile = getOpponentProfile();

  prepCtx.save();

  prepCtx.font = "32pt Fira Sans, sans-serif";
  prepCtx.textAlign = "center";
  prepCtx.textBaseline = "middle";
  prepCtx.fillStyle = "white";

  //Draw the profile and write their username below it
  if (playerProfile) {

    if (prepCtx.measureText(playerProfile.username).width > 350) {
      prepCtx.font = "18pt Fira Sans, sans-serif";
    }

    prepCtx.drawImage(playerProfile.charImage, 25, 750, 256, 256);

    prepCtx.fillText(playerProfile.username, 153, 1020);
  }

  //Reset font in case it was changed
  prepCtx.font = "32pt Fira Sans, sans-serif";

  if (opponentProfile) {

    if (prepCtx.measureText(opponentProfile.username).width > 350) {
      prepCtx.font = "18pt Fira Sans, sans-serif";
    }

    prepCtx.drawImage(opponentProfile.charImage, 25, -10, 256, 256);

    prepCtx.fillText(opponentProfile.username, 153, 260);
  }

  prepCtx.restore();
};

//The main draw call that populates the prep canvas
var draw = function draw() {
  clearCanvas(prepCanvas, prepCtx);

  //Draw the blade mat in the background
  prepCtx.drawImage(bladeMat, 0, 0, prepCanvas.width, prepCanvas.height);

  if (!cardImageStruct["back"]) {
    return;
  }

  var readyStatus = true;

  //Update and draw all cards in the field
  var time = new Date().getTime();
  var fieldKeys = Object.keys(fields);
  for (var i = 0; i < fieldKeys.length; i++) {
    var field = fields[fieldKeys[i]];
    for (var j = 0; j < field.length; j++) {
      var card = field[j];
      var update = card.update(time);
      if (update) {
        readyStatus = false;
      }
      drawCard(card);
    }
  }

  //Update and draw all cards in the players' hands and decks
  var subDeckKeys = Object.keys(deck);
  for (var _i = 0; _i < subDeckKeys.length; _i++) {
    var subDeck = deck[subDeckKeys[_i]];
    for (var _j = 0; _j < subDeck.length; _j++) {
      var _card = subDeck[_j];;
      var _update = _card.update(time);
      if (_update) {
        readyStatus = false;
      }
      drawCard(_card);
    }
  }

  //Draw the players' profiles
  drawPlayerProfiles();

  //Determine if the player is ready to receive an update
  updateReadyStatus(readyStatus);

  //Draw instructions or a screen overlay depending on the gamestate
  if (playbackData && !isPlayingBack && gameState.turnType !== "end") {
    drawWaitingOverlay("Press Start to Begin Playback");
  } else if (!inRoom && gameState.turnType !== "end") {
    drawWaitingOverlay("Please create or join a game...");
  } else if (gameState.turnType === "begin" && !isPlayingBack) {
    drawWaitingOverlay("Waiting for an opponent to join...");
  } else {
    drawScore(getPlayerPoints(), getOpponentPoints());

    if (gameState.winner) {
      drawGameResult();
    } else {
      drawTurnIndicator();
    }

    if (gameState.waiting) {
      drawWaitingOverlay("Waiting for opponent...");
    }
  }

  //Move the prep canvas to the display canvas
  displayFrame();
};
'use strict';

//Declare all necessary variables
var viewport = void 0,
    viewCtx = void 0,
    prepCanvas = void 0,
    prepCtx = void 0;
var socket = void 0,
    hash = void 0;
var bladeMat = void 0;
var animationFrame = void 0;
var deck = {};
var NULL_FUNC = function NULL_FUNC() {};
var readyToPlay = false;
var selectedCard = null;
var mousePos = { x: 0, y: 0 };

//Variables relating to gamestate
var playerStatus = void 0;
var playerProfiles = {};
var blastSelect = false;
var playerBlastCard = void 0;
var inRoom = false;
var selectionEnabled = true;
var gameState = {
  turnType: "begin",
  turnOwner: null,
  player1Points: 0,
  player2Points: 0,
  winner: null,
  waiting: false
};

//Variables for managing playback
var resetOnClose = false;
var isPlayingBack = false;
var playbackData = void 0;
var playbackSequenceCount = void 0;
var turnSequence = [];

var fields = {
  'player1': [],
  'player2': []
};

//Current page view
var pageView = void 0;

var aspectRatio = 16 / 9;

//Calculate the appropriate viewport dimensions
var calcDisplayDimensions = function calcDisplayDimensions() {
  var width = window.innerWidth * 0.6;
  var height = width / aspectRatio;

  return {
    width: width,
    height: height
  };
};

//Resize the display canvas if its currently onscreen
var resizeGame = function resizeGame(e) {
  exitFullscreen();
  if (pageView === "#blade") {
    var dimensions = calcDisplayDimensions();
    renderGame(dimensions.width, dimensions.height);
  } else if (viewport && document.querySelector("#modalContainer div") && document.querySelector("#modalContainer div").classList.contains("show")) {
    renderPlayback(true);
  }
};

//Load the requested view
var loadView = function loadView() {
  //Find the page's hash
  var hash = window.location.hash;
  pageView = hash;

  //Always render the right panel (regardless of view)
  renderRightPanel();

  //Depending on the hash, render the main content
  switch (hash) {
    case "#blade":
      {
        var dimensions = calcDisplayDimensions();
        renderGame(dimensions.width, dimensions.height);
        break;
      }
    case "#results":
      {
        renderPublicResults();
        break;
      }
    case "#instructions":
      {
        renderInstructions();
        break;
      }
    case "#tocs":
      {
        renderAbout();
        break;
      }
    case "#feedback":
      {
        renderFeedback();
        break;
      }
    case "#profile":
      {
        renderProfile();
        break;
      }
    case "#disclaimer":
      {
        renderDisclaimerWindow();
        break;
      }
    default:
      {
        var _dimensions = calcDisplayDimensions();
        renderGame(_dimensions.width, _dimensions.height);
        pageView = "#blade";
        break;
      }
  }
};

//Run this function when the page loads
var init = function init() {

  //Load the requested view
  loadView();

  //Grab static images included in client download
  bladeMat = document.querySelector("#bladeMat");

  //Construct the prep canvas (for building frames)
  prepCanvas = document.createElement('canvas');
  prepCanvas.width = "1920";
  prepCanvas.height = "1080";
  prepCtx = prepCanvas.getContext('2d');

  //Connect to the server via sockets
  socket = io.connect();

  //Attach custom socket events
  socket.on('loadBladeCards', loadBladeCards);
  socket.on('roomOptions', roomOptions);
  socket.on('roomJoined', roomJoined);
  socket.on('chatMessage', receivedChatMessage);
  socket.on('playerInfo', loadPlayerProfiles);
  socket.on('setDeck', setDeck);
  socket.on('sortDeck', sortDeck);
  socket.on('pickFromDeck', pickFromDeck);
  socket.on('playCard', playCard);
  socket.on('turnAccepted', turnAccepted);
  socket.on('gamestate', updateGamestate);
  socket.on('gamedata', notifyGameData);
  socket.on('playbackData', processPlaybackData);
  socket.on('errorMessage', processError);

  //Start the update loop!
  animationFrame = requestAnimationFrame(update);
  addToChat("You have joined the lobby");
};

//Run the init function when the window loads
window.onload = init;

//Resize the viewport when the window resizes
window.addEventListener('resize', resizeGame);
window.addEventListener('hashchange', loadView);
"use strict";

//Construct the main game window (the canvas)
var GameWindow = function GameWindow(props) {
  return React.createElement(
    "div",
    null,
    React.createElement("canvas", { id: "viewport", width: props.width, height: props.height }),
    React.createElement(
      "div",
      { className: "text-center" },
      React.createElement(
        "button",
        { onClick: goFullscreen, id: "fullscreenButton", className: "btn btn-lg btn-primary moveDown" },
        "Go Fullscreen"
      ),
      React.createElement(
        "button",
        { onClick: exitFullscreen,
          id: "exitFullscreenButton", className: "hidden fullscreenButton btn btn-lg btn-danger" },
        "Exit Fullscreen"
      )
    )
  );
};

//Construct the right panel which holds a Youtube iframe and a chat box
var MusicAndChatWindow = function MusicAndChatWindow(props) {
  return React.createElement(
    "div",
    { className: "text-center" },
    React.createElement(
      "h1",
      null,
      "Music Player"
    ),
    React.createElement("hr", null),
    React.createElement("iframe", {
      src: "https://www.youtube.com/embed/videoseries?list=PLbzURmDMdJdNHYJnRQjXxa0bDZyPcslpO",
      frameBorder: "0", allow: "autoplay; encrypted-media", id: "videoFrame" }),
    React.createElement(
      "h1",
      null,
      "Chat Window"
    ),
    React.createElement("hr", null),
    React.createElement("textarea", { id: "chat", readOnly: true, className: "form-control" }),
    React.createElement(
      "div",
      { className: "input-group" },
      React.createElement("input", { id: "chatBox", type: "text", className: "form-control", placeholder: "Message..." }),
      React.createElement(
        "span",
        { className: "input-group-btn" },
        React.createElement(
          "button",
          { onClick: sendChatMessage, className: "btn btn-lg btn-primary" },
          "Send"
        )
      )
    )
  );
};

//Exit fullscreen
var exitFullscreen = function exitFullscreen() {
  var viewport = document.querySelector("#viewport");
  var fullscreenButton = document.querySelector("#fullscreenButton");
  var exitFullscreenButton = document.querySelector("#exitFullscreenButton");

  if (viewport) {
    viewport.classList.remove("fullscreen");
    var dimensions = calcDisplayDimensions();
    viewport.width = dimensions.width;
    viewport.height = dimensions.height;
    fullscreenButton.classList.remove("hidden");
    exitFullscreenButton.classList.add("hidden");
  }
};

//Enable fullscreen for gameplay
var goFullscreen = function goFullscreen() {
  var viewport = document.querySelector("#viewport");
  var fullscreenButton = document.querySelector("#fullscreenButton");
  var exitFullscreenButton = document.querySelector("#exitFullscreenButton");

  if (viewport) {
    viewport.width = window.innerWidth;
    viewport.height = window.innerHeight;
    viewport.classList.add("fullscreen");
    fullscreenButton.classList.add("hidden");
    exitFullscreenButton.classList.remove("hidden");
  }
};

//Render the right panel
var renderRightPanel = function renderRightPanel() {
  ReactDOM.render(React.createElement(MusicAndChatWindow, null), document.querySelector("#rightPanel"));
};

//Render the main game
var renderGame = function renderGame(width, height) {

  ReactDOM.render(React.createElement(GameWindow, { width: width, height: height }), document.querySelector("#main"));

  //Hook up viewport (display canvas) to JS code
  viewport = document.querySelector("#viewport");
  viewCtx = viewport.getContext('2d');
  viewport.addEventListener('mousemove', getMouse);
  viewport.addEventListener('mouseleave', processMouseLeave);
  viewport.addEventListener('click', processClick);

  renderRightPanel();
};

//Disables the auto-submit functionality of a form
var disableDefaultForm = function disableDefaultForm(e) {
  e.preventDefault();
  return false;
};

//Handle a request to change a password
var handlePasswordChange = function handlePasswordChange(e) {
  e.preventDefault();

  //Password fields cannot be empty
  if ($("#newPassword").val() == '' || $("#newPassword2").val() == '' || $("#password").val() == '') {
    handleError("All fields are required to change password.");
    return false;
  }

  //New password and password confirmation should match
  if ($("#newPassword").val() !== $("#newPassword2").val()) {
    handleError("New password and password confirmation must match");
    return false;
  }

  //Send the data to the server via Ajax
  sendAjax('POST', $("#passwordChangeForm").attr("action"), $("#passwordChangeForm").serialize(), function () {
    handleSuccess("Password successfully changed!");
    $("#newPassword").val("");
    $("#newPassword2").val("");
    $("#password").val("");
  });

  return false;
};

//Handle a request to change a user's icon
var handleIconChange = function handleIconChange(e) {
  e.preventDefault();

  //No need to validate- user can't make a wrong decision, and if they hack into the select,
  //the server will verify the data
  var data = $("#iconChangeForm").serialize();
  sendAjax('POST', $("#iconChangeForm").attr("action"), data, function () {
    handleSuccess("Player icon successfully changed!");
    var profileName = $("#profileImgSelect option:selected").val();
    profileImage = profilePics[profileName].imageFile;
    $("#profile").attr('src', profileImage);
    renderProfile();
  });

  return false;
};

//Handle a request to change a user's privacy setting
var handlePrivacyChange = function handlePrivacyChange(e) {
  e.preventDefault();

  //Again, no need to validate- either true or false
  sendAjax('POST', $("#privacyChangeForm").attr("action"), $("#privacyChangeForm").serialize(), function () {
    handleSuccess('Privacy mode updated!');
    privacy = $("#privacySetting").val();
    renderProfile();
  });

  return false;
};

//Process a request to hide a modal
var hideModal = function hideModal() {
  var modal = document.querySelector("#modalContainer div");

  if (!modal) {
    return;
  }

  modal.classList.remove("show");
  modal.classList.add("hide-anim");

  if (resetOnClose) {
    endGame();
    resetGame();
  }
};

//Handle a request to submit feedback
var handleFeedback = function handleFeedback(e) {
  e.preventDefault();

  if ($("#feedbackName").val() == '' || $("#feedbackText").val == '') {
    handleError("Both a name and feedback are required");
    return false;
  }

  sendAjax('POST', $("#feedbackForm").attr("action"), $("#feedbackForm").serialize(), function () {
    handleSuccess("Feedback successfully submitted!");
    $("#feedbackText").val("");
  });

  return false;
};

//Handle a request to get a list of public games
var handlePublicGameRequest = function handlePublicGameRequest(e) {
  e.preventDefault();

  sendAjax('GET', $("#publicGameResultsForm").attr("action"), $("#publicGameResultsForm").serialize(), function (data) {
    renderPublicGameList(data.data);
  });

  return false;
};

//Construct a window to create / join a room for playing Blade
var RoomWindow = function RoomWindow(props) {

  if (props.renderEmpty) {
    return React.createElement("div", null);
  }

  var roomOptions = void 0;

  //Construct a list of available rooms if there are any
  var bgColor = "bg-secondary";
  if (props.rooms.length > 0) {
    roomOptions = props.rooms.map(function (room) {
      return React.createElement(
        "a",
        { href: "#", className: "list-group-item list-group-item-action " + bgColor,
          "data-room": room.id, onClick: onRoomSelect
        },
        "User: ",
        room.owner,
        " Code: ",
        room.id
      );
    });
  } else {
    roomOptions = [React.createElement(
      "a",
      { href: "#", className: "list-group-item list-group-item-action " + bgColor,
        "data-room": "", onClick: onRoomSelect },
      "No Rooms Available"
    )];
  }

  //Return the created and formatted form
  return React.createElement(
    "div",
    { id: "roomSelect" },
    React.createElement(
      "h1",
      null,
      "Game Select"
    ),
    React.createElement("hr", null),
    React.createElement(
      "form",
      {
        id: "roomForm", name: "roomForm",
        action: "#room",
        onSubmit: disableDefaultForm,
        method: "POST",
        className: "roomForm"
      },
      React.createElement(
        "fieldset",
        null,
        React.createElement(
          "div",
          { className: "form-group text-centered" },
          React.createElement(
            "button",
            { onClick: createOpenRoom, className: "btn btn-lg btn-primary",
              "data-toggle": "tooltip", title: "Create an open game that will be placed in the public list for anyone to join"
            },
            "New Open Game ",
            React.createElement("span", { className: "fas fa-bullhorn" })
          )
        ),
        React.createElement(
          "div",
          { className: "form-group text-centered" },
          React.createElement(
            "button",
            { onClick: createClosedRoom, className: "btn btn-lg btn-primary",
              "data-toggle": "tooltip", title: "Create a closed game that can only be joined by someone who knows the room code"
            },
            "New Closed Game ",
            React.createElement("span", { className: "fas fa-user-secret" })
          )
        ),
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement(
            "div",
            { className: "input-group" },
            React.createElement("input", { id: "roomName", type: "text", className: "form-control", placeholder: "roomcode123" }),
            React.createElement(
              "span",
              { className: "input-group-btn" },
              React.createElement(
                "button",
                { onClick: joinRoom, className: "btn btn-lg btn-success" },
                "Join Game"
              )
            )
          )
        ),
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement(
            "h2",
            null,
            "Existing Games"
          ),
          React.createElement("hr", null),
          React.createElement(
            "div",
            { className: "list-group", id: "roomOptions", onClick: onRoomSelect },
            roomOptions
          )
        )
      )
    )
  );
};

//Construct an instructions panel for the main section of the site
var InstructionsWindow = function InstructionsWindow(props) {
  return React.createElement(
    "div",
    { className: "container" },
    React.createElement(
      "div",
      { className: "jumbotron" },
      React.createElement(
        "h1",
        { className: "display-3" },
        "Instructions:"
      ),
      React.createElement(
        "p",
        { className: "lead" },
        "Want to know how to play Blade? Of course you do!"
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "h2",
        null,
        "General Game Rules"
      ),
      React.createElement(
        "ol",
        null,
        React.createElement(
          "li",
          null,
          "To start, each player draws a card from their deck. Then, the player with a lower score begins their turn."
        ),
        React.createElement(
          "li",
          null,
          "If you play a numbered card, that card will be transfered to your field pile, and its value will be added to your total (special cards behave differently- please see below)."
        ),
        React.createElement(
          "li",
          null,
          "Every turn, the current player has to make sure their total value is higher than their opponent's."
        ),
        React.createElement(
          "li",
          null,
          "If both players' card values are ever equal (even during the initial draw phase) all current cards are wiped from the field, players start again at 0, and must draw from their decks."
        ),
        React.createElement(
          "li",
          null,
          "Effect cards (cards without a number: bolt, mirror, blast, & force) may not be used last. Players with only effect cards remaining (excluding 1s) will lose when it becomes their turn."
        )
      ),
      React.createElement(
        "h2",
        null,
        "Special Cards"
      ),
      React.createElement(
        "ul",
        { id: "specialCardList" },
        React.createElement(
          "li",
          null,
          React.createElement(
            "div",
            { className: "instructionsCard" },
            React.createElement("img", { className: "rounded pull-left", src: "/assets/img/cards/06x Bolt.png", alt: "Bolt Card" }),
            React.createElement(
              "p",
              null,
              "Bolt cards nullify the most recently played card on the opponent's field. For example, if your opponent played a 7 on their last turn, and you played a bolt, your opponent's 7 would be flipped and not counted in their score."
            )
          )
        ),
        React.createElement(
          "li",
          null,
          React.createElement(
            "div",
            { className: "instructionsCard" },
            React.createElement("img", { className: "rounded pull-left", src: "/assets/img/cards/02x Wand.png", alt: "1 Card" }),
            React.createElement(
              "p",
              null,
              "1s provide you with an opporunity to recover from a bolt card. If you play a 1 when the top card on your field is turned over, the turned over card will recover. If you play a 1 when the top card isn't turned over, it will act as a regular numbered card."
            )
          )
        ),
        React.createElement(
          "li",
          null,
          React.createElement(
            "div",
            { className: "instructionsCard" },
            React.createElement("img", { className: "rounded pull-left", src: "/assets/img/cards/04x Mirror.png", alt: "Mirror Card" }),
            React.createElement(
              "p",
              null,
              "Mirror cards will switch your field pile with your opponent's. This is best used when the point difference between you and your opponent is large."
            )
          )
        ),
        React.createElement(
          "li",
          null,
          React.createElement(
            "div",
            { className: "instructionsCard" },
            React.createElement("img", { className: "rounded pull-left", src: "/assets/img/cards/02x Blast.png", alt: "Blast Card" }),
            React.createElement(
              "p",
              null,
              "Blast cards allow you to select one of your opponent's cards and wipe it from their hand. As an additional special rule, when you play a blast card, you keep your turn and get to play another card."
            )
          )
        ),
        React.createElement(
          "li",
          null,
          React.createElement(
            "div",
            { className: "instructionsCard" },
            React.createElement("img", { className: "rounded pull-left", src: "/assets/img/cards/02x Force.png", alt: "Force Card" }),
            React.createElement(
              "p",
              null,
              "Force cards double your current field score. (Example: a field score of 19 would be turned into 38). Force cards are placed in your field pile and can be bolted, recovered, and mirrored like regular numbered cards."
            )
          )
        )
      )
    )
  );
};

//Construct an about window that holds info pertaining to Trails of Cold Steel I and II
var AboutWindow = function AboutWindow(props) {
  return React.createElement(
    "div",
    { className: "container" },
    React.createElement(
      "div",
      { className: "jumbotron" },
      React.createElement(
        "h1",
        { className: "display-3" },
        "Trails of Cold Steel"
      ),
      React.createElement(
        "p",
        { className: "lead" },
        "Check out the games!"
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "h2",
        null,
        "ToCS 1"
      ),
      React.createElement("img", { className: "banner", src: "/assets/img/tocs1.jpg", alt: "Trails of Cold Steel 1 Banner" }),
      React.createElement(
        "p",
        { className: "lead aboutPara" },
        "Trails of Cold Steel is a Japanese RPG made by Falcom. The first ToCS is the 6th entry in the 'Trails' or 'Kiseki' saga. If you're into high quality story-based RPGs look no further! Blade, the game recreated on this site, is actually a minigame found in ToCS."
      ),
      React.createElement(
        "p",
        { className: "lead aboutPara" },
        "To find out more about the game and how to purchase a copy for yourself, please visit its Steam store page."
      ),
      React.createElement(
        "div",
        { className: "text-centered button-div" },
        React.createElement(
          "a",
          { href: "http://store.steampowered.com/app/538680/The_Legend_of_Heroes_Trails_of_Cold_Steel/", target: "_blank" },
          React.createElement(
            "button",
            { className: "btn btn-lg btn-primary" },
            "ToCS Steam Page"
          )
        )
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "h2",
        null,
        "ToCS II"
      ),
      React.createElement("img", { className: "banner", src: "/assets/img/tocs2.jpg", alt: "Trails of Cold Steel 2 Banner" }),
      React.createElement(
        "p",
        { className: "lead aboutPara" },
        "Because the series follows an overarching story and also because it's typically better to play games in the intended release order, definitly check out ToCS II after ToCS I. Blade exists in both games, but the 'Blast' and 'Force' cards were introduced in ToCS II."
      ),
      React.createElement(
        "p",
        { className: "lead aboutPara" },
        "If you're ready to learn more about the second Trails of Cold Steel game, please visit the Steam store page. It might be obvious, but the page contains spoilers for the first game."
      ),
      React.createElement(
        "div",
        { className: "text-centered button-div" },
        React.createElement(
          "a",
          { href: "http://store.steampowered.com/app/748490/The_Legend_of_Heroes_Trails_of_Cold_Steel_II/", target: "_blank" },
          React.createElement(
            "button",
            { className: "btn btn-lg btn-primary" },
            "ToCS II Steam Page"
          )
        )
      )
    )
  );
};

//Construct a panel / form for submitting user feedback about the site
var FeedbackWindow = function FeedbackWindow(props) {
  return React.createElement(
    "div",
    { className: "container" },
    React.createElement(
      "div",
      { className: "jumbotron" },
      React.createElement(
        "h1",
        { className: "display-3" },
        "Feedback:"
      ),
      React.createElement(
        "p",
        { className: "lead" },
        "Have something to say about the site? Please let me know!"
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "form",
        {
          id: "feedbackForm", name: "feedbackForm",
          action: "/feedback",
          onSubmit: handleFeedback,
          method: "POST"
        },
        React.createElement(
          "fieldset",
          null,
          React.createElement(
            "div",
            { className: "form-group text-centered row" },
            React.createElement(
              "div",
              { className: "col-sm-6" },
              React.createElement(
                "label",
                { htmlFor: "name" },
                "Name:"
              ),
              React.createElement("input", { id: "feedbackName", name: "name", type: "text", className: "form-control", value: username })
            ),
            React.createElement(
              "div",
              { className: "col-sm-6" },
              React.createElement(
                "label",
                { htmlFor: "contact" },
                "Contact (Optional):"
              ),
              React.createElement("input", { id: "feedbackContact", name: "contact", type: "text", className: "form-control", placeholder: "123@email.com" })
            )
          ),
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement("textarea", { id: "feedbackText", name: "feedback", className: "form-control", placeholder: "Feedback..." })
          ),
          React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement("input", { type: "submit", id: "feedbackSubmit", value: "Submit Feedback", className: "btn btn-lg btn-success" })
          )
        )
      )
    )
  );
};

//Construct a profile panel that holds user info, a password change screen, and game history data
var ProfileWindow = function ProfileWindow(props) {

  //Determine privacy mode data
  var dataPrivate = void 0;
  var privateButtonMsg = void 0;
  var privateButtonClass = void 0;
  if (privacy === "true" || privacy === true) {
    dataPrivate = false;
    privateButtonMsg = "Disable Privacy Mode";
    privateButtonClass = "btn btn-lg btn-danger formSubmit";
  } else {
    dataPrivate = true;
    privateButtonMsg = "Enable Privacy Mode";
    privateButtonClass = "btn btn-lg btn-success formSubmit";
  }

  return React.createElement(
    "div",
    { className: "container" },
    React.createElement(
      "div",
      { className: "jumbotron" },
      React.createElement(
        "h1",
        { className: "display-3" },
        "Personal Profile:"
      ),
      React.createElement(
        "p",
        { className: "lead" },
        "All about you! Kinda."
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "h2",
        null,
        "User Info"
      ),
      React.createElement(
        "p",
        { className: "lead" },
        "Username: ",
        username
      ),
      React.createElement(
        "p",
        { className: "lead" },
        "Profile Pic:",
        React.createElement("img", { src: profileImage, alt: "profileImage" })
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "h2",
        null,
        "Change Password"
      ),
      React.createElement(
        "form",
        {
          id: "passwordChangeForm", name: "passwordChangeForm",
          action: "/changePassword",
          onSubmit: handlePasswordChange,
          method: "POST"
        },
        React.createElement(
          "fieldset",
          null,
          React.createElement(
            "div",
            { className: "form-group text-centered row" },
            React.createElement(
              "label",
              { htmlFor: "newPassword", className: "col-sm-3 col-form-label" },
              "New Password:"
            ),
            React.createElement(
              "div",
              { className: "col-sm-2" },
              React.createElement("input", { id: "newPassword", name: "newPassword", type: "password", className: "form-control", placeholder: "New Password" })
            ),
            React.createElement("div", { className: "col-sm-3" }),
            React.createElement("div", { className: "col-sm-4" })
          ),
          React.createElement(
            "div",
            { className: "form-group text-centered row" },
            React.createElement(
              "label",
              { htmlFor: "newPassword2", className: "col-sm-3 col-form-label" },
              "Confirm New Password:"
            ),
            React.createElement(
              "div",
              { className: "col-sm-2" },
              React.createElement("input", { id: "newPassword2", name: "newPassword2", type: "password", className: "form-control", placeholder: "Confirm" })
            ),
            React.createElement("div", { className: "col-sm-3" }),
            React.createElement("div", { className: "col-sm-4" })
          ),
          React.createElement(
            "div",
            { className: "form-group text-centered row" },
            React.createElement(
              "label",
              { htmlFor: "password", className: "col-sm-3 col-form-label" },
              "Current Password:"
            ),
            React.createElement(
              "div",
              { className: "col-sm-2" },
              React.createElement("input", { id: "password", name: "password", type: "password", className: "form-control", placeholder: "Current Password" })
            ),
            React.createElement("div", { className: "col-sm-3" }),
            React.createElement("div", { className: "col-sm-4" })
          ),
          React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
          React.createElement(
            "div",
            { className: "form-group text-centered row" },
            React.createElement(
              "div",
              { className: "col-sm-5" },
              React.createElement("input", { type: "submit", id: "passwordChangeSubmit", value: "Change Password", className: "btn btn-lg btn-warning formSubmit" })
            ),
            React.createElement("div", { className: "col-sm-3" }),
            React.createElement("div", { className: "col-sm-4" })
          )
        )
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "h2",
        null,
        "Change Player Icon"
      ),
      React.createElement(
        "form",
        {
          id: "iconChangeForm", name: "iconChangeForm",
          action: "/changeIcon",
          onSubmit: handleIconChange,
          method: "POST"
        },
        React.createElement(
          "fieldset",
          null,
          React.createElement(
            "div",
            { className: "form-group row vertical-center" },
            React.createElement(
              "label",
              { className: "col-sm-3 col-form-label" },
              "Profile Icon: "
            ),
            React.createElement("div", { id: "profileSelection", className: "col-sm-2" }),
            React.createElement(
              "div",
              { className: "col-sm-4" },
              React.createElement("img", { id: "profilePreview", className: "profileIcon", src: "/assets/img/player_icons/alfin.png", alt: "profile" })
            )
          ),
          React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
          React.createElement(
            "div",
            { className: "form-group text-centered row" },
            React.createElement(
              "div",
              { className: "col-sm-5" },
              React.createElement("input", { type: "submit", id: "iconChangeSubmit", value: "Change Icon", className: "btn btn-lg btn-info formSubmit" })
            ),
            React.createElement("div", { className: "col-sm-3" }),
            React.createElement("div", { className: "col-sm-4" })
          )
        )
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "h2",
        null,
        "Game Results Privacy"
      ),
      React.createElement(
        "form",
        {
          id: "privacyChangeForm", name: "privacyChangeForm",
          action: "/changePrivacy",
          onSubmit: handlePrivacyChange,
          method: "POST"
        },
        React.createElement(
          "fieldset",
          null,
          React.createElement(
            "p",
            { className: "lead" },
            "While privacy mode is enabled for either you or your opponent, the results of played games will default to not being publicly viewable. Both players must choose to make a game public for it to be public."
          ),
          React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
          React.createElement("input", { id: "privacySetting", type: "hidden", name: "privacy", value: dataPrivate }),
          React.createElement(
            "div",
            { className: "form-group text-centered row" },
            React.createElement(
              "div",
              { className: "col-sm-5" },
              React.createElement("input", { type: "submit", id: "privacyChangeSubmit", value: privateButtonMsg, className: privateButtonClass })
            ),
            React.createElement("div", { className: "col-sm-3" }),
            React.createElement("div", { className: "col-sm-4" })
          )
        )
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement("div", { id: "gameHistory" })
    )
  );
};

//Construct a game history panel the lists a user's previous matches
var GameHistory = function GameHistory(props) {

  //Sort the games by most recently played to least recently
  var games = props.games.sort(function (gameA, gameB) {
    var timeA = new Date(gameA.date).getTime();
    var timeB = new Date(gameB.date).getTime();
    return timeB - timeA;
  });

  //Create a panel that holds all relevant data pertaining to game result
  var wins = 0;
  var losses = 0;
  games = games.map(function (game, index) {

    var date = new Date(game.date);
    var playerProfile = game.playerIdentity === "player1" ? game.player1 : game.player2;
    var opponentProfile = game.playerIdentity === "player1" ? game.player2 : game.player1;
    var playerScore = game.playerIdentity === "player1" ? game.player1Score : game.player2Score;
    var opponentScore = game.playerIdentity === "player1" ? game.player2Score : game.player1Score;
    var playerPrivacy = game.playerIdentity === "player1" ? game.player1Privacy : game.player2Privacy;
    var opponentPrivacy = game.playerIdentity === "player1" ? game.player2Privacy : game.player1Privacy;

    var playerPrivacyMsg = void 0;
    var opponentPrivacyMsg = void 0;
    var privacyButton = void 0;

    if (opponentPrivacy === true) {
      opponentPrivacyMsg = "Opponent vote: Private";
    } else {
      opponentPrivacyMsg = "Opponent vote: Public";
    }

    var status = !playerPrivacy && !opponentPrivacy ? "Public" : "Private";

    //Construct a privacy setting for the game based on the current settings
    if (playerPrivacy === true) {
      playerPrivacyMsg = "Your vote: Private";

      var title = playerPrivacyMsg + ", " + opponentPrivacyMsg + ", Status: " + status;
      privacyButton = React.createElement(
        "button",
        { className: "btn btn-lg btn-success", "data-private": "false", onClick: changeGamePrivacy, title: title },
        "Make Public ",
        React.createElement("span", { className: "fas fa-unlock" })
      );
    } else {
      playerPrivacyMsg = "Your vote: Public";
      var _title = playerPrivacyMsg + ", " + opponentPrivacyMsg + ", Status: " + status;
      privacyButton = React.createElement(
        "button",
        { className: "btn btn-lg btn-danger", "data-private": "true", onClick: changeGamePrivacy, title: _title },
        "Make Private ",
        React.createElement("span", { className: "fas fa-lock" })
      );
    }

    var gameStatus = void 0;
    var gameStatusColor = void 0;

    if (game.winner === game.playerIdentity) {
      gameStatus = "WIN";
      gameStatusColor = "text-success";
      wins++;
    } else if (game.winner === "player1" || game.winner === "player2") {
      gameStatus = "LOSS";
      gameStatusColor = "text-danger";
      losses++;
    } else {
      gameStatus = "TIE";
      gameStatusColor = "text-warning";
    }

    return React.createElement(
      "li",
      { className: "list-group-item d-flex bg-light" },
      React.createElement(
        "div",
        { className: "gameHistory" },
        React.createElement(
          "span",
          { className: "badge badge-primary badge-pill" },
          "#",
          index + 1
        ),
        React.createElement(
          "figure",
          { className: "text-centered" },
          React.createElement("img", { src: playerProfile.profileData.imageFile, alt: playerProfile.profileData.name }),
          React.createElement(
            "figcaption",
            null,
            playerProfile.username
          )
        ),
        React.createElement(
          "span",
          null,
          " VS "
        ),
        React.createElement(
          "figure",
          { className: "text-centered" },
          React.createElement("img", { src: opponentProfile.profileData.imageFile, alt: opponentProfile.profileData.name }),
          React.createElement(
            "figcaption",
            null,
            opponentProfile.username
          )
        )
      ),
      React.createElement(
        "div",
        { className: "gameHistory pull-right text-center" },
        React.createElement(
          "h1",
          { className: gameStatusColor },
          gameStatus
        ),
        React.createElement(
          "p",
          null,
          playerProfile.username,
          "'s Score: ",
          playerScore
        ),
        React.createElement(
          "p",
          null,
          opponentProfile.username,
          "'s Score: ",
          opponentScore
        ),
        React.createElement(
          "p",
          null,
          "Date of Game: ",
          date.toDateString()
        )
      ),
      React.createElement(
        "div",
        { className: "buttonDiv" },
        React.createElement(
          "div",
          null,
          React.createElement("span", { "data-id": game.id }),
          React.createElement(
            "button",
            { className: "btn btn-lg btn-primary", onClick: requestPlaybackData },
            "Watch Replay ",
            React.createElement("span", { className: "fas fa-play" })
          ),
          React.createElement("br", null),
          privacyButton
        )
      )
    );
  });

  var totalGameBarWidth = { width: games.length / games.length * 100 + "%" };
  var winGameBarWidth = { width: wins / games.length * 100 + "%" };
  var lossGameBarWidth = { width: losses / games.length * 100 + "%" };

  //Build the entire game history panel, with all game results included
  return React.createElement(
    "div",
    null,
    React.createElement(
      "h2",
      null,
      "Game History"
    ),
    React.createElement(
      "p",
      { className: "lead" },
      "Total Games Played: ",
      React.createElement(
        "span",
        { className: "text-info" },
        games.length
      )
    ),
    React.createElement(
      "div",
      { className: "progress" },
      React.createElement("div", { className: "progress-bar progress-bar-striped progress-bar-animated bg-info",
        role: "progressbar",
        "aria-value": games.length,
        "aria-valuemin": "0",
        "aria-valuemax": games.length,
        style: totalGameBarWidth
      })
    ),
    React.createElement(
      "p",
      { className: "lead aboutPara" },
      "Wins: ",
      wins,
      "/",
      games.length
    ),
    React.createElement(
      "div",
      { className: "progress" },
      React.createElement("div", { className: "progress-bar progress-bar-striped progress-bar-animated bg-success",
        role: "progressbar",
        "aria-value": wins,
        "aria-valuemin": "0",
        "aria-valuemax": games.length,
        style: winGameBarWidth
      })
    ),
    React.createElement(
      "p",
      { className: "lead aboutPara" },
      "Losses: ",
      losses,
      "/",
      games.length
    ),
    React.createElement(
      "div",
      { className: "progress" },
      React.createElement("div", { className: "progress-bar progress-bar-striped progress-bar-animated bg-danger",
        role: "progressbar",
        "aria-value": losses,
        "aria-valuemin": "0",
        "aria-valuemax": games.length,
        style: lossGameBarWidth
      })
    ),
    React.createElement("br", null),
    React.createElement(
      "p",
      { className: "lead" },
      "Sorted by most recent to least recent:"
    ),
    React.createElement(
      "div",
      { id: "gameHistoryList" },
      React.createElement(
        "ul",
        { className: "list-group" },
        games
      )
    )
  );
};

var DisclaimerWindow = function DisclaimerWindow(props) {
  return React.createElement(
    "div",
    { className: "container" },
    React.createElement(
      "div",
      { className: "jumbotron" },
      React.createElement(
        "h1",
        { className: "display-3" },
        "Site Disclaimer:"
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "ol",
        null,
        React.createElement(
          "li",
          null,
          "As per the signup warning, you have agreed to not use a sensitive password for your account on this site. I don't plan on any breaches, but it's also your responsibility to be careful with your sensitive passwords."
        ),
        React.createElement(
          "li",
          null,
          "I do not claim ownership of the the art assets used on this site. Profile icons, site favicon, and card assets were taken from ToCS I & II and therefore do not belong to me."
        ),
        React.createElement(
          "li",
          null,
          "I do not intend or wish to profit from this site in any way."
        ),
        React.createElement(
          "li",
          null,
          "If you have a legal issue with this site existing, please use the feedback feature to contact me."
        )
      )
    )
  );
};

var PublicGameList = function PublicGameList(props) {

  var games = props.games;
  games = games.map(function (game, index) {

    var date = new Date(game.date);
    var player1Profile = game.player1;
    var player2Profile = game.player2;
    var player1Score = game.player1Score;
    var player2Score = game.player2Score;

    var gameStatus = void 0;
    var gameStatusColor = "text-primary";

    if (game.winner === "player1") {
      gameStatus = player1Profile.username + "'s WIN";
    } else if (game.winner === "player2") {
      gameStatus = player2Profile.username + "'s WIN";
    } else {
      gameStatus = "TIED GAME";
    }

    return React.createElement(
      "li",
      { className: "list-group-item d-flex bg-light" },
      React.createElement(
        "div",
        { className: "publicGameItem" },
        React.createElement(
          "span",
          { className: "badge badge-primary badge-pill" },
          "#",
          index + 1
        ),
        React.createElement(
          "figure",
          { className: "text-centered" },
          React.createElement("img", { src: player1Profile.profileData.imageFile, alt: player1Profile.profileData.name }),
          React.createElement(
            "figcaption",
            null,
            player1Profile.username
          )
        ),
        React.createElement(
          "span",
          null,
          " VS "
        ),
        React.createElement(
          "figure",
          { className: "text-centered" },
          React.createElement("img", { src: player2Profile.profileData.imageFile, alt: player2Profile.profileData.name }),
          React.createElement(
            "figcaption",
            null,
            player2Profile.username
          )
        )
      ),
      React.createElement(
        "div",
        { className: "publicGameItem pull-right text-center" },
        React.createElement(
          "h1",
          { className: gameStatusColor },
          gameStatus
        ),
        React.createElement(
          "p",
          null,
          player1Profile.username,
          "'s Score: ",
          player1Score
        ),
        React.createElement(
          "p",
          null,
          player2Profile.username,
          "'s Score: ",
          player2Score
        ),
        React.createElement(
          "p",
          null,
          "Date of Game: ",
          date.toDateString()
        )
      ),
      React.createElement(
        "div",
        { className: "buttonDiv" },
        React.createElement("span", { "data-id": game.id }),
        React.createElement(
          "button",
          { className: "btn btn-lg btn-primary", onClick: requestPlaybackData },
          "Watch Replay ",
          React.createElement("span", { className: "fas fa-play" })
        )
      )
    );
  });

  var gameLists = [];
  var paginationTabs = [];

  //Break up the number of returned games into chunks of 10
  for (var i = 0; i < games.length; i += 10) {

    var numGamesLeft = games.length - i;
    var gameSet = void 0;

    if (numGamesLeft <= 10) {
      gameSet = games.slice(i);
    } else {
      gameSet = games.slice(i, i + 10);
    }

    //If it's the first set, make it visible. Otherwise, hide the set
    if (i == 0) {
      gameLists.push(React.createElement(
        "ul",
        { id: "gameSet" + gameLists.length, className: "list-group" },
        gameSet
      ));
      paginationTabs.push(React.createElement(
        "li",
        { id: "gameLink" + paginationTabs.length, className: "page-item active" },
        React.createElement(
          "button",
          { className: "page-link", "data-set": paginationTabs.length, onClick: changePublicGameSet },
          paginationTabs.length + 1
        )
      ));
    } else {
      gameLists.push(React.createElement(
        "ul",
        { id: "gameSet" + gameLists.length, className: "list-group hidden" },
        gameSet
      ));
      paginationTabs.push(React.createElement(
        "li",
        { id: "gameLink" + paginationTabs.length, className: "page-item" },
        React.createElement(
          "button",
          { className: "page-link", "data-set": paginationTabs.length, onClick: changePublicGameSet },
          paginationTabs.length + 1
        )
      ));
    }
  };

  //Build the entire public game list panel, with all game results included
  return React.createElement(
    "div",
    null,
    React.createElement(
      "p",
      { className: "lead" },
      "Sorted by most recent to least recent:"
    ),
    React.createElement(
      "p",
      { className: "lead" },
      "# of Results: ",
      games.length
    ),
    React.createElement(
      "div",
      { id: "publicGameHistoryList" },
      gameLists
    ),
    React.createElement(
      "div",
      { className: "flexCenter" },
      React.createElement(
        "ul",
        { id: "publicGamePagination", className: "pagination pagination-lg" },
        React.createElement(
          "li",
          { className: "page-item" },
          React.createElement(
            "button",
            { className: "page-link", "data-set": "0", onClick: changePublicGameSet },
            "\xAB"
          )
        ),
        paginationTabs,
        React.createElement(
          "li",
          { className: "page-item" },
          React.createElement(
            "button",
            { className: "page-link", "data-set": paginationTabs.length - 1, onClick: changePublicGameSet },
            "\xBB"
          )
        )
      )
    )
  );
};

//Construct a game history panel the lists a collection of publicly available matches
var PublicResults = function PublicResults(props) {
  var april13th2018 = '2018-04-13';
  var today = new Date().toISOString().split("T")[0];

  return React.createElement(
    "div",
    { className: "container" },
    React.createElement(
      "div",
      { className: "jumbotron" },
      React.createElement(
        "h1",
        { className: "display-3" },
        "Public Game Results:"
      ),
      React.createElement(
        "p",
        { className: "lead" },
        "Search for games and watch replays! The search criteria limit returned results; so to see every result leave the search criteria empty."
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "form",
        { id: "publicGameResultsForm", name: "publicGameResultsForm",
          onSubmit: handlePublicGameRequest,
          action: "/getPublicGames",
          method: "GET",
          className: "mainForm"
        },
        React.createElement(
          "h2",
          null,
          "Game Search Criteria"
        ),
        React.createElement(
          "fieldset",
          null,
          React.createElement(
            "div",
            { className: "form-group row vertical-align" },
            React.createElement(
              "label",
              { htmlFor: "username", className: "col-sm-3 col-from-label" },
              "Username: "
            ),
            React.createElement(
              "div",
              { className: "col-sm-9" },
              React.createElement("input", { id: "user", className: "form-control", type: "text", name: "username", placholder: "Case Sensitive Username" })
            )
          ),
          React.createElement(
            "div",
            { className: "form-group row vertical-align" },
            React.createElement(
              "label",
              { htmlFor: "startDate", className: "col-sm-3 col-from-label" },
              "Start Date: "
            ),
            React.createElement(
              "div",
              { className: "col-sm-9" },
              React.createElement("input", { id: "startDate", className: "form-control", type: "date", name: "startDate",
                min: april13th2018, max: today /*value={april13th2018}*/
              })
            )
          ),
          React.createElement(
            "div",
            { className: "form-group row vertical-align" },
            React.createElement(
              "label",
              { htmlFor: "endDate", className: "col-sm-3 col-from-label" },
              "End Date: "
            ),
            React.createElement(
              "div",
              { className: "col-sm-9" },
              React.createElement("input", { id: "endDate", className: "form-control", type: "date", name: "endDate",
                min: april13th2018, max: today /*value={today}*/
              })
            )
          ),
          React.createElement(
            "div",
            { className: "form-group row vertical-align" },
            React.createElement(
              "label",
              { htmlFor: "limit", className: "col-sm-3 col-from-label" },
              "Game result limit: "
            ),
            React.createElement(
              "div",
              { className: "col-sm-9" },
              React.createElement(
                "select",
                { name: "limit", className: "custom-select" },
                React.createElement(
                  "option",
                  { value: "50", selected: true },
                  "50"
                ),
                React.createElement(
                  "option",
                  { value: "100" },
                  "100"
                ),
                React.createElement(
                  "option",
                  { value: "200" },
                  "200"
                ),
                React.createElement(
                  "option",
                  { value: "unlim" },
                  "Unlimited"
                )
              )
            )
          ),
          React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
          React.createElement(
            "div",
            { className: "form-group row vertical-align" },
            React.createElement("input", { type: "submit", id: "getPublicGames", value: "Search For Games", className: "btn btn-lg btn-primary" })
          )
        )
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "h2",
        null,
        "Results"
      ),
      React.createElement("div", { id: "publicGameResults" })
    )
  );
};

//Build a pop-out modal window to display to the user
var SiteModal = function SiteModal(props) {
  var id = "playbackModal";

  var modalBody = void 0;

  if (props.render) {
    var dimensions = calcDisplayDimensions();
    var ratio = Math.min(window.innerHeight * 0.5 / dimensions.height, 1);
    dimensions.width *= ratio;
    dimensions.height *= ratio;
    modalBody = React.createElement(
      "div",
      null,
      React.createElement("canvas", { id: "viewportModal", className: "animateExpand", width: dimensions.width, height: dimensions.height }),
      React.createElement("hr", null),
      React.createElement(
        "div",
        { id: "playbackOptions" },
        React.createElement(PlaybackOptions, null)
      )
    );
  } else {
    modalBody = React.createElement(
      "p",
      null,
      "Loading playback data... ",
      React.createElement("span", { className: "fas fa-sync fa-spin" })
    );
  }

  return React.createElement(
    "div",
    { id: id, className: "modal show", tabindex: "-1", role: "dialog" },
    React.createElement("div", { id: "pageMask" }),
    React.createElement(
      "div",
      { className: "modal-dialog", role: "document" },
      React.createElement(
        "div",
        { className: "modal-content" },
        React.createElement(
          "div",
          { className: "modal-header" },
          React.createElement(
            "h1",
            { className: "modal-title" },
            "Game Playback"
          ),
          React.createElement(
            "button",
            { className: "close", "data-dismiss": "modal", "aria-label": "Close", onClick: hideModal },
            React.createElement(
              "span",
              { "aria-hidden": "true" },
              "\xD7"
            )
          )
        ),
        React.createElement(
          "div",
          { className: "modal-body" },
          modalBody
        ),
        React.createElement(
          "div",
          { className: "modal-footer" },
          React.createElement(
            "button",
            { className: "btn btn-lg btn-primary", "data-dismiss": "modal", onClick: hideModal },
            "Done"
          )
        )
      )
    )
  );
};

var PlaybackOptions = function PlaybackOptions(props) {

  var player1Name = void 0;
  var player2Name = void 0;
  if (playerProfiles["player1"] && playerProfiles["player2"]) {
    player1Name = playerProfiles['player1'].username;
    player2Name = playerProfiles['player2'].username;
  } else {
    player1Name = "Player 1";
    player2Name = "Player 2";
  }

  if (!isPlayingBack) {
    return React.createElement(
      "div",
      { className: "container text-center" },
      React.createElement(
        "div",
        { className: "row row-centered" },
        React.createElement(
          "div",
          { className: "form-group col-sm-6 mx-auto" },
          React.createElement(
            "div",
            { className: "custom-control custom-checkbox" },
            React.createElement("input", { type: "checkbox", id: "bypassWaitCheck", className: "custom-control-input", checked: bypassWait, onChange: changeBypassWait }),
            React.createElement(
              "label",
              { className: "custom-control-label", htmlFor: "bypassWaitCheck" },
              "Quick Play (Bypass accurate player wait times)"
            )
          )
        )
      ),
      React.createElement(
        "div",
        { className: "row row-centered" },
        React.createElement(
          "div",
          { className: "form-group col-sm-6 mx-auto" },
          React.createElement(
            "label",
            { classNam: "custom-control-label", htmlFor: "perspectiveSelect" },
            "Perspective: "
          ),
          React.createElement(
            "select",
            { id: "perspectiveSelect", className: "custom-select" },
            React.createElement(
              "option",
              { value: "player1", selected: true },
              " ",
              player1Name,
              "'s "
            ),
            React.createElement(
              "option",
              { value: "player2" },
              " ",
              player2Name,
              "'s "
            )
          )
        )
      ),
      React.createElement(
        "div",
        { className: "row row-centered" },
        React.createElement(
          "div",
          { className: "form-group col-sm-6 mx-auto" },
          React.createElement(
            "button",
            { className: "btn btn-lg btn-success", onClick: startPlayback },
            "Start Playback"
          )
        )
      )
    );
  } else {
    var progressWidth = { width: props.progress / props.total * 100 + "%" };
    return React.createElement(
      "div",
      null,
      React.createElement(
        "p",
        { className: "lead aboutPara" },
        "Playback Progress:"
      ),
      React.createElement(
        "div",
        { className: "progress" },
        React.createElement("div", { className: "progress-bar progress-bar-striped progress-bar-animated bg-info",
          role: "progressbar",
          "aria-value": props.progress,
          "aria-valuemin": "0",
          "aria-valuemax": props.total,
          style: progressWidth
        })
      )
    );
  }
};

//Render the bypass wait control
var renderPlaybackOptions = function renderPlaybackOptions() {

  var modal = document.querySelector("#modalContainer div");

  if (!modal) {
    return;
  }

  ReactDOM.render(React.createElement(PlaybackOptions, {
    progress: playbackSequenceCount - turnSequence.length,
    total: playbackSequenceCount
  }), document.querySelector("#playbackOptions"));
};

//Change which set of public games is being viewed
var changePublicGameSet = function changePublicGameSet(e) {
  //Turn off active link / hide the active game set
  var gamePagination = document.querySelector("#publicGamePagination");
  var activeLink = gamePagination.querySelector(".active");
  var activeLinkId = activeLink.getAttribute("id");
  var activeGameSet = document.querySelector("#gameSet" + activeLinkId.charAt(activeLinkId.length - 1));
  activeLink.classList.remove("active");
  activeGameSet.classList.add("hidden");

  //Active the necessary tab
  var dataSet = e.target.getAttribute("data-set");
  document.querySelector("#gameLink" + dataSet).classList.add("active");
  document.querySelector("#gameSet" + dataSet).classList.remove("hidden");
};

//Request playback data from the server
var requestPlaybackData = function requestPlaybackData(e) {

  if (inRoom) {
    handleError("Cannot request playback while in a game room!");
    return;
  }

  var id = e.target.parentElement.querySelector("span").getAttribute('data-id');

  //There's really no need to have a delay here- the playback data loads in a few milliseconds,
  //but I didn't want it to immediately pop up with the playback canvas
  //However, for the sake of this submission, I'll reduce it to 10ms instead of 1000ms
  setTimeout(function () {
    socket.emit('requestPlaybackData', { id: id });
  }, 10);

  renderPlayback(false);
};

//Change a game's privacy setting
var changeGamePrivacy = function changeGamePrivacy(e) {

  var id = e.target.parentElement.querySelector("span").getAttribute('data-id');
  var privacySetting = e.target.getAttribute('data-private');

  getTokenWithCallback(function (csrfToken) {
    var data = "id=" + id + "&privacy_setting=" + privacySetting + "&_csrf=" + csrfToken;
    sendAjax('POST', '/changeGamePrivacy', data, function () {
      handleSuccess("Game privacy successfully changed!");
      renderProfile();
    });
  });
};

//Handle an error sent from the server
var processError = function processError(data) {
  handleError(data.error, false);
};

//Render the site's dialog box / modal (playback mode)
var renderPlayback = function renderPlayback(renderDisplay) {
  ReactDOM.render(React.createElement(SiteModal, { render: renderDisplay }), document.querySelector("#modalContainer"));

  var modal = document.querySelector("#modalContainer div");

  if (!modal) {
    return;
  }

  modal.classList.remove("hide-anim");
  modal.classList.add("show");
};

//Render the left panel as empty
var clearLeftPane = function clearLeftPane() {
  ReactDOM.render(React.createElement("div", null), document.querySelector("#room"));
};

//Make a call to render the public game history
var renderPublicResults = function renderPublicResults() {
  getTokenWithCallback(function (csrfToken) {
    ReactDOM.render(React.createElement(PublicResults, { csrf: csrfToken }), document.querySelector("#main"));
  });

  clearLeftPane();
};

//Render the disclaimer window
var renderDisclaimerWindow = function renderDisclaimerWindow() {
  ReactDOM.render(React.createElement(DisclaimerWindow, null), document.querySelector("#main"));
};

//Handle game results sent from the server
var renderPublicGameList = function renderPublicGameList(games) {
  ReactDOM.render(React.createElement(PublicGameList, { games: games }), document.querySelector("#publicGameResults"));
};

//Make a call to render the game history section
var renderGameHistory = function renderGameHistory(games) {
  ReactDOM.render(React.createElement(GameHistory, { games: games }), document.querySelector("#gameHistory"));
};

//Make a call to render the profile panel
var renderProfile = function renderProfile() {
  getTokenWithCallback(function (csrfToken) {
    ReactDOM.render(React.createElement(ProfileWindow, { csrf: csrfToken }), document.querySelector("#main"));

    getProfiles();
  });

  //Request game history data
  sendAjax('GET', '/getGameHistory', null, function (data) {
    renderGameHistory(data.data);
  });

  clearLeftPane();
};

//Make a call to render the feedback panel
var renderFeedback = function renderFeedback() {
  getTokenWithCallback(function (csrfToken) {
    ReactDOM.render(React.createElement(FeedbackWindow, { csrf: csrfToken }), document.querySelector("#main"));
  });

  clearLeftPane();
};

//Make a call to render the about ToCS I and II panel
var renderAbout = function renderAbout() {
  ReactDOM.render(React.createElement(AboutWindow, null), document.querySelector("#main"));
  clearLeftPane();
};

//Make a call to render the instructions panel
var renderInstructions = function renderInstructions() {
  ReactDOM.render(React.createElement(InstructionsWindow, null), document.querySelector("#main"));

  clearLeftPane();
};

//Request a newe csrf token and then execute a callback when one is retrieved
var getTokenWithCallback = function getTokenWithCallback(callback) {
  sendAjax('GET', '/getToken', null, function (result) {
    if (callback) {
      callback(result.csrfToken);
    }
  });
};

//Render the room selection panel (left side)
var renderRoomSelection = function renderRoomSelection(rooms, renderEmpty) {
  ReactDOM.render(React.createElement(RoomWindow, { rooms: rooms, renderEmpty: renderEmpty }), document.querySelector("#room"));
};
"use strict";

//The main update call which runs ideally 60 times a second
var update = function update() {

  //Execute playback if enabled
  if (isPlayingBack) {

    //Render the animated progress bar
    renderPlaybackOptions();

    if (readyToPlay) {
      executePlayback();
    }
  }

  //Check for card collisions with the mouse depending on the current state
  if (blastSelect) {
    checkCardCollisions(getOpponentHand(), false);
  } else {
    checkCardCollisions(getPlayerHand(), true);
  }
  //Draw to the canvas
  draw();

  //Request another update
  animationFrame = requestAnimationFrame(update);
};

//Process a mouse click
var processClick = function processClick(e) {
  //Update the mouse position
  getMouse(e);
  //Depending on the gamestate, unselect a card, and update the ready status
  if (selectedCard && !gameState.winner && !gameState.waiting) {
    switch (gameState.turnType) {
      case "pickFromDeck":
        unselectCard(selectedCard);
        socket.emit('pickFromDeck');
        selectedCard = null;
        break;
      case "playCard":
        var playerHand = getPlayerHand();

        if (selectedCard.name === "blast" && !blastSelect && playerStatus === gameState.turnOwner) {
          blastSelect = true;
          playerBlastCard = selectedCard;
          selectedCard = null;
          updateReadyStatus(false);
          return;
        } else if (blastSelect) {
          blastSelect = false;
          var opponentHand = getOpponentHand();
          socket.emit('playCard', {
            index: playerHand.indexOf(playerBlastCard),
            blastIndex: opponentHand.indexOf(selectedCard)
          });

          selectedCard = null;
          playerBlastCard = null;
          updateReadyStatus(false);
          return;
        }

        unselectCard(selectedCard);
        socket.emit('playCard', { index: playerHand.indexOf(selectedCard) });
        selectedCard = null;
        updateReadyStatus(false);
        break;
      default:
        break;
    }
  };
};

//Update the mouse position if it leaves the canvas
var processMouseLeave = function processMouseLeave(e) {
  mousePos = {
    x: -200,
    y: -200
  };
};

//Get the mouse position relative to the position of the canvas
var getMouse = function getMouse(e) {
  var rect = viewport.getBoundingClientRect();
  var widthRatio = rect.width / prepCanvas.width;
  var heightRatio = rect.height / prepCanvas.height;
  mousePos = {
    x: (e.clientX - rect.left) / widthRatio,
    y: (e.clientY - rect.top) / heightRatio
  };
};

//Determine if a given point is inside a given rectangle
var pointInRect = function pointInRect(rect, point) {
  if (point.x > rect.x && point.x < rect.x + rect.width) {
    if (point.y > rect.y && point.y < rect.y + rect.height) {
      return true;
    }
  }

  return false;
};

//Rotate a point around an anchor a number of radians
//Used to calculate collisions with rotated cards
var rotatePoint = function rotatePoint(point, anchor, radians) {
  var translatedPoint = { x: point.x - anchor.x, y: point.y - anchor.y };

  var sin = Math.sin(-radians);
  var cos = Math.cos(-radians);

  var newX = translatedPoint.x * cos - translatedPoint.y * sin;
  var newY = translatedPoint.x * sin + translatedPoint.y * cos;

  return { x: newX + anchor.x, y: newY + anchor.y };
};

//Check to see if the mouse is colliding with any cards
var checkCardCollisions = function checkCardCollisions(cardCollection, selectPlayer) {
  if (!readyToPlay || gameState.winner !== null || gameState.waiting) {
    return;
  }

  //Allow the player to pick from their deck
  if (gameState.turnType === "pickFromDeck") {
    var topCard = getTopDeckCard();
    if (topCard) {
      cardCollection = [topCard];
    } else {
      cardCollection = [];
    }
  }

  //Check the player (or opponents) hand
  var newSelection = null;
  for (var i = 0; i < cardCollection.length; i++) {
    var card = cardCollection[i];

    var cardCenter = { x: card.x + card.width / 2, y: card.y + card.height / 2 };
    var rotatedPoint = rotatePoint(mousePos, cardCenter, card.radians);

    if (pointInRect(card, rotatedPoint)) {
      newSelection = card;
    }
  }

  //Select / unselect cards depending on the collision status
  if (newSelection && newSelection !== selectedCard) {

    if (selectedCard) {
      unselectCard(selectedCard, NULL_FUNC);
    }

    selectedCard = newSelection;
    selectCard(selectedCard, selectPlayer, false, NULL_FUNC);
  } else if (!newSelection && selectedCard !== null) {
    unselectCard(selectedCard, NULL_FUNC);
    selectedCard = null;
  }
};

//Animate the whole deck when all of the cards are ready to be animated
var animateDeckWhenReady = function animateDeckWhenReady(cardCollection, callback) {
  for (var i = 0; i < cardCollection.length; i++) {
    var card = cardCollection[i];
    if (!card.readyToAnimate()) {
      return;
    }
  }

  if (callback) {
    callback();
  }
};

//Chain animations together so each executes after the last one
var chainAnimations = function chainAnimations(animationPackages, finalCallback) {
  animationPackages.reverse();
  var animList = animationPackages.map(function (pack) {
    return pack[0];
  });
  var paramList = animationPackages.map(function (pack) {
    return pack[1];
  });
  var callbacks = [finalCallback];

  //Build a chain of functions to get called by earlier functions

  var _loop = function _loop(i) {
    var newCallback = function newCallback() {
      animList[i].apply(undefined, paramList[i].concat(callbacks[i]));
    };
    callbacks.push(newCallback);
  };

  for (var i = 0; i < animationPackages.length; i++) {
    _loop(i);
  }

  callbacks[animationPackages.length]();
};

//Load all of the blade card images for later drawing usage
var loadBladeCards = function loadBladeCards(cardImages) {
  var _loop2 = function _loop2(i) {
    var cardImage = cardImages[i];
    var image = new Image();

    image.onload = function () {
      cardImageStruct[cardImage.name] = image;
    };

    image.src = cardImage.src;
  };

  for (var i = 0; i < cardImages.length; i++) {
    _loop2(i);
  }
};

//Notify the player if the game result was stored on the server
var notifyGameData = function notifyGameData(data) {
  if (data.saved) {
    handleSuccess("Game result successfully stored on server! (Check profile page)");
  } else {
    handleError("Game result could not be stored! (contact server admin)");
  }
};

//Process room options sent from the server
var roomOptions = function roomOptions(data) {
  if (!inRoom) {

    if (pageView === "#blade") {
      renderRoomSelection(data.rooms, false);
    }

    setTimeout(function () {
      socket.emit('getRooms');
    }, 10);
  }
};

//Handle playback data sent from the server
var processPlaybackData = function processPlaybackData(data) {
  endGame();
  resetGame();
  resetOnClose = true;
  renderPlayback(true);
  viewport = document.querySelector("#viewportModal");
  viewCtx = viewport.getContext('2d');

  loadPlayerProfiles(data.playerData);

  playbackData = data;
};

//Commense playback
var startPlayback = function startPlayback() {
  var data = playbackData;
  var perspectiveSelect = document.querySelector("#perspectiveSelect");
  var perspective = perspectiveSelect.options[perspectiveSelect.selectedIndex].value;

  var game = data.game;

  //Record the total number of actions taken during playback
  playbackSequenceCount = game.gameplay.length;

  //Save loaded player profiles for use after "joining the room"
  var tempProfiles = playerProfiles;

  roomJoined({ status: perspective });

  playerProfiles = tempProfiles;

  setDeck({
    player1: game.p1Hand,
    player2: game.p2Hand,
    p1Deck: game.p1Deck,
    p2Deck: game.p2Deck
  });

  isPlayingBack = true;
  resetOnClose = true;
  turnSequence = game.gameplay;
  waiting = false;
  waitTime = 0;
};

//Allow the user to bypass realistic wait times for executing playback
var changeBypassWait = function changeBypassWait(e) {
  bypassWait = e.target.checked;
  renderPlaybackOptions();
};

//Executes the next move in the playback sequence
var playerDeckCheck = void 0;
var opponentDeckCheck = void 0;
var waiting = false;
var waitTime = 0;
var waitingFnId = void 0;
var bypassWait = false;
var executePlayback = function executePlayback() {

  //If there are no more turns to process, stop playing back
  if (turnSequence.length <= 0) {
    isPlayingBack = false;
    return;
  }

  //Check if the deck length check is equal to the current player's hand size (special card hasn't finished)
  if (playerDeckCheck) {
    if (playerDeckCheck === getPlayerHand().length) {
      return;
    } else {
      playerDeckCheck = null;
    }
  }

  if (opponentDeckCheck) {
    if (opponentDeckCheck === getOpponentHand().length) {
      return;
    } else {
      opponentDeckCheck = null;
    }
  }

  //Check to see if the client wants to wait for accurate timing, and then postpone updates if necessary
  if (waiting) {
    return;
  }

  //Grab the next turn
  var turnFlag = turnSequence.shift();

  //A struct to determine the required actor
  var actor = {
    0: "player1",
    1: "player2"
  };

  var action = NULL_FUNC;

  //Depending on the first flag, play an action
  switch (turnFlag) {
    //Action 0: sort the deck
    case 0:
      {
        action = function action() {
          sortDeck();
          sortOpponentDeck();
        };
        break;
      }
    //Action 1: pick from a player's deck
    case 1:
      {
        var player = actor[turnSequence.shift()];
        var card = getTopDeckCardFrom(player);
        card.ref = card.name;
        var data = { player: player, card: card };
        action = function action() {
          pickFromDeck(data);
        };
        break;
      }
    //Action 2: Update the gamestate (player points in this case)
    case 2:
      {
        var _update = {
          player1Points: turnSequence.shift(),
          player2Points: turnSequence.shift()
        };
        action = function action() {
          updateGamestate(_update);
        };
        break;
      }
    //Action 3: Play any card from a player's hand aside from a blast
    case 3:
      {
        var _player = actor[turnSequence.shift()];
        var index = turnSequence.shift();
        var _card = deck[_player][index];
        var _data = { cardSet: _player, name: _card.name, index: index };

        //Make sure special cards finish what they set out to do before moving on
        if (_card.name === 1 || _card.name === "bolt" || _card.name === "mirror") {
          var isPlayer = playerStatus === _player;
          if (isPlayer) {
            playerDeckCheck = getPlayerHand().length;
          } else {
            opponentDeckCheck = getOpponentHand().length;
          }
        }

        action = function action() {
          playCard(_data);
        };
        break;
      }
    //Action 4: Play a blast from a player's hand (and target opponent's card)
    case 4:
      {
        var _player2 = actor[turnSequence.shift()];
        var _index = turnSequence.shift();
        var _card2 = deck[_player2][_index];
        var _data2 = { cardSet: _player2, name: _card2.name, index: _index, blastIndex: turnSequence.shift() };
        playerDeckCheck = getPlayerHand().length;

        action = function action() {
          playCard(_data2);
        };
        break;
      }
    //Action 5: Wipe the field and start fresh
    case 5:
      {
        action = function action() {
          clearFields();
        };
        break;
      }
    //Action 6: End game
    case 6:
      {
        var winner = void 0;
        var winnerIndex = turnSequence.shift();

        if (winnerIndex === 0) {
          winner = "Tie";
        } else if (winnerIndex === 1) {
          winner = "player1";
        } else if (winnerIndex === 2) {
          winner = "player2";
        } else {
          winner = "Unknown";
        }

        var _update2 = {
          turnType: "end",
          winner: winner
        };

        //No point in waiting for turn length here
        updateGamestate(_update2);

        //Terminate the remaining turn sequence information
        turnSequence = [];

        return;
      }
    default:
      {
        break;
      }
  }

  //Wait time between turns
  waitTime = turnSequence.shift();
  waiting = true;

  if (bypassWait) {
    waitTime = 0;
  }

  waitingFnId = setTimeout(function () {
    action();
    //Allow the action to commence before setting waiting to false
    setTimeout(function () {
      waiting = false;
    }, 100);
  }, waitTime);
};

//When a room is selected from the existing rooms list, paste the code into the room join bar
var onRoomSelect = function onRoomSelect(e) {
  var roomId = document.querySelector("#roomName");
  roomId.value = e.target.getAttribute('data-room');
};

//Request to create a new open room
var createOpenRoom = function createOpenRoom(e) {
  socket.emit('createRoom', { roomType: 'open' });
  addToChat("You have started an open game, please wait for an opponent, or share your room code!");
};

//Request to create a new closed room
var createClosedRoom = function createClosedRoom(e) {
  socket.emit('createRoom', { roomType: 'closed' });
  addToChat("You have started is a closed game, please share your room code with your desired opponent!");
};

//Request to join an existing room
var joinRoom = function joinRoom(e) {
  var roomId = document.querySelector("#roomName").value;
  socket.emit('joinRoom', { room: roomId });
};

//Call to reset the gamestate and various variables
var resetGame = function resetGame() {

  resetOnClose = false;

  var subDeckKeys = Object.keys(deck);
  for (var i = 0; i < subDeckKeys.length; i++) {
    var key = subDeckKeys[i];
    deck[key] = [];
  }

  deck = {};
  fields = {
    'player1': [],
    'player2': []
  };

  playbackData = null;
  isPlayingBack = false;
  playerProfiles = {};
  playerStatus = null;
  turnSequence = [];

  gameState.turnType = "begin";
  gameState.turnOwner = null;
  gameState.player1Points = 0;
  gameState.player2Points = 0;
  gameState.winner = null;
  gameState.waiting = false;

  // Reset any functions waiting via a playback
  clearTimeout(waitingFnId);
  waiting = false;
  waitTime = 0;
};

//When a room is joined, prepare for a new game
var roomJoined = function roomJoined(data) {
  playerStatus = data.status;
  inRoom = true;

  if (data.room) {
    addToChat("You have joined room: " + data.room);
  }

  var subDeckKeys = Object.keys(deck);
  for (var i = 0; i < subDeckKeys.length; i++) {
    var key = subDeckKeys[i];
    deck[key] = [];
  }

  fields = {
    'player1': [],
    'player2': []
  };

  playerProfiles = {};

  gameState.turnType = "begin";
  gameState.turnOwner = null;
  gameState.player1Points = 0;
  gameState.player2Points = 0;
  gameState.winner = null;
  gameState.waiting = false;

  renderRoomSelection([], true);
};

//When player profile data is received request follow-up information and build the player profiles
var loadPlayerProfiles = function loadPlayerProfiles(data) {

  if (data.player1) {
    sendAjax('GET', '/getProfile', "profile=" + data.player1.profile, function (profileData) {
      var image = new Image();
      image.onload = function () {
        playerProfiles['player1'] = {
          charImage: image,
          username: data.player1.username
        };
        renderPlaybackOptions();
      };

      image.src = profileData.imageFile;
    });
  }

  if (data.player2) {
    sendAjax('GET', '/getProfile', "profile=" + data.player2.profile, function (profileData) {
      var image = new Image();
      image.onload = function () {
        playerProfiles['player2'] = {
          charImage: image,
          username: data.player2.username
        };
        renderPlaybackOptions();
      };

      image.src = profileData.imageFile;
    });
  }
};

//Process a response from the server holding deck information
var setDeck = function setDeck(data) {

  var subDeckKeys = Object.keys(data);
  for (var i = 0; i < subDeckKeys.length; i++) {
    var key = subDeckKeys[i];
    deck[key] = [];
    for (var j = 0; j < data[key].length; j++) {
      var cardData = data[key][j];
      var card = void 0;

      //Construct new cards
      if (cardData) {
        var _image = cardImageStruct[cardData.ref];
        card = new Card(cardData.ref, cardData.sortValue, { x: -200, y: -200 }, { width: _image.width, height: _image.height });
      } else {
        var _image2 = cardImageStruct["back"];
        card = new Card("back", 0, { x: -200, y: -200 }, { width: _image2.width, height: _image2.height });
      }

      deck[key].push(card);
    }
  }

  //Start building both decks
  if (playerStatus === 'player1') {
    initPlayerDeck(deck.player1, deck.p1Deck);
    initOpponentDeck(deck.player2, deck.p2Deck);
  } else if (playerStatus === 'player2') {
    initPlayerDeck(deck.player2, deck.p2Deck);
    initOpponentDeck(deck.player1, deck.p1Deck);
  }
};

//Gets the player's profile
var getPlayerProfile = function getPlayerProfile() {
  if (playerStatus === 'player1') {
    return playerProfiles['player1'];
  } else if (playerStatus === 'player2') {
    return playerProfiles['player2'];
  }
};

//Gets the opponent's profile
var getOpponentProfile = function getOpponentProfile() {
  if (playerStatus === 'player1') {
    return playerProfiles['player2'];
  } else if (playerStatus === 'player2') {
    return playerProfiles['player1'];
  }
};

//Gets the top card from the player's deck
var getTopDeckCard = function getTopDeckCard() {
  if (playerStatus === 'player1') {
    return deck.p1Deck[deck.p1Deck.length - 1];
  } else if (playerStatus === 'player2') {
    return deck.p2Deck[deck.p2Deck.length - 1];
  }
};

//Gets the top card from a player's deck
var getTopDeckCardFrom = function getTopDeckCardFrom(status) {
  if (status === 'player1') {
    return deck.p1Deck[deck.p1Deck.length - 1];
  } else if (status === 'player2') {
    return deck.p2Deck[deck.p2Deck.length - 1];
  }
};

//Gets the players deck
var getPlayerDeck = function getPlayerDeck() {
  if (playerStatus === 'player1') {
    return deck.p1Deck;
  } else if (playerStatus === 'player2') {
    return deck.p2Deck;
  }
};

//Gets the opponent's deck
var getOpponentDeck = function getOpponentDeck() {
  if (playerStatus === 'player1') {
    return deck.p2Deck;
  } else if (playerStatus === 'player2') {
    return deck.p1Deck;
  }
};

//Gets the players field (cards on the field)
var getPlayerField = function getPlayerField() {
  if (playerStatus === 'player1') {
    return fields['player1'];
  } else if (playerStatus === 'player2') {
    return fields['player2'];
  }
};

//Gets the opponent's field (cards on the field)
var getOpponentField = function getOpponentField() {
  if (playerStatus === 'player1') {
    return fields['player2'];
  } else if (playerStatus === 'player2') {
    return fields['player1'];
  }
};

//Gets the player's hand
var getPlayerHand = function getPlayerHand() {
  if (playerStatus === 'player1') {
    return deck.player1;
  } else if (playerStatus === 'player2') {
    return deck.player2;
  }
};

//Gets the opponent's hand
var getOpponentHand = function getOpponentHand() {
  if (playerStatus === 'player1') {
    return deck.player2;
  } else if (playerStatus === 'player2') {
    return deck.player1;
  }
};

//Gets the player's points
var getPlayerPoints = function getPlayerPoints() {
  if (playerStatus === 'player1') {
    return gameState.player1Points;
  } else if (playerStatus === 'player2') {
    return gameState.player2Points;
  }
};

//Gets the opponent's points
var getOpponentPoints = function getOpponentPoints() {
  if (playerStatus === 'player1') {
    return gameState.player2Points;
  } else if (playerStatus === 'player2') {
    return gameState.player1Points;
  }
};

//Animate the player's deck
var initPlayerDeck = function initPlayerDeck(playerHand, playerDeck) {
  chainAnimations([[moveTo, [playerHand.concat(playerDeck), -200, 800, 0, false]], [moveTo, [playerHand.concat(playerDeck), 300, 800, 400, true]], [flushCards, [playerHand, 770, true, true, true]], [startCardFlip, [playerHand, false]], [foldInCards, [playerHand, 1100, 770]], [startCardFlip, [playerHand, true]]], function () {
    socket.emit('sortDeck');
  });
};

//Animate the opponent's deck
var initOpponentDeck = function initOpponentDeck(opponentHand, opponentDeck) {
  chainAnimations([[moveTo, [opponentHand.concat(opponentDeck), -200, 40, 0, false]], [moveTo, [opponentHand.concat(opponentDeck), 300, 40, 400, true]], [flushCards, [opponentHand, 70, false, true, true]], [foldInCards, [opponentHand, 1100, 70]], [flushCards, [opponentHand, 70, false, false, true]]], function () {
    for (var i = 0; i < opponentHand.length; i++) {
      var card = opponentHand[i];
      card.originalLocation = { x: card.x, y: card.y };
    }
  });
};

//Update the player's ready status (for updates)
var confirmReady = 0;
var updateReadyStatus = function updateReadyStatus(status) {
  if (readyToPlay === status || Object.keys(deck).length <= 0) {
    return;
  } else {
    confirmReady++;

    if (confirmReady >= 10 && status) {
      readyToPlay = status;
      socket.emit('ready', { status: status });
      confirmReady = 0;
    } else if (!status) {
      readyToPlay = status;
      socket.emit('ready', { status: status });
      confirmReady = 0;
    }
  }
};

//Sort the player's hand and animate it
var sortDeck = function sortDeck(data) {
  var playerHand = getPlayerHand();

  playerHand = playerHand.sort(function (cardA, cardB) {
    return cardB.sortValue - cardA.sortValue;
  });

  chainAnimations([[startCardFlip, [playerHand, false]], [flushCards, [playerHand, 770, true, false, true]]], function () {
    for (var i = 0; i < playerHand.length; i++) {
      var card = playerHand[i];
      card.originalLocation = { x: card.x, y: card.y };
    }
  });
};

//Sort the opponent's hand and animate it
var sortOpponentDeck = function sortOpponentDeck(data) {
  var opponentHand = getOpponentHand();

  opponentHand = opponentHand.sort(function (cardA, cardB) {
    return cardB.sortValue - cardA.sortValue;
  });

  chainAnimations([[flushCards, [opponentHand, 70, false, false, true]]], function () {
    for (var i = 0; i < opponentHand.length; i++) {
      var card = opponentHand[i];
      card.originalLocation = { x: card.x, y: card.y };
    }
  });
};

//process a call from the server to pick the top card from the deck
var pickFromDeck = function pickFromDeck(data) {
  var player = data.player;
  gameState.waiting = false;

  //Animate differently depending on if the card is the player's or the opponent's
  if (playerStatus === player) {
    var playerDeck = getPlayerDeck();
    var index = playerDeck.length - 1;
    var card = playerDeck[index];

    if (selectedCard === card) {
      selectedCard = null;
    }

    fields[player].push(card);
    playerDeck.splice(index, 1);
    card.reveal(data.card.ref);

    stackCards(fields[player], true, 500, function () {
      animateDeckWhenReady(fields[player], function () {
        startCardFlip([card], false);
      });
    });
  } else {
    var opponentDeck = getOpponentDeck();
    var _index2 = opponentDeck.length - 1;
    var _card3 = opponentDeck[_index2];

    fields[player].push(_card3);
    opponentDeck.splice(_index2, 1);
    _card3.reveal(data.card.ref);

    _card3.flipImage();

    stackCards(fields[player], false, 500, function () {
      animateDeckWhenReady(fields[player], function () {
        startCardFlip([_card3], false);
      });
    });
  }
};

//Remove a card from the player's hand and flush the remaining cards in their hand
var splicePlayerCard = function splicePlayerCard(cardSet, index) {
  cardSet.splice(index, 1);
  cardSet.reverse();

  //Reset cards to their original position (cancel selection)
  for (var i = 0; i < cardSet.length; i++) {
    var card = cardSet[i];

    if (selectedCard === card) {
      card.cancelAnimation();
      selectedCard = null;
    }

    card.x = card.originalLocation.x;
    card.y = card.originalLocation.y;
  }

  flushCards(cardSet, 770, true, false, true, function () {
    for (var _i = 0; _i < cardSet.length; _i++) {
      var _card4 = cardSet[_i];
      _card4.x = _card4.originalLocation.x;
      _card4.y = _card4.originalLocation.y;
    }
  });
};

//Remove a card from the opponent's hand and flush the cards remaining in their hand
var spliceOpponentCard = function spliceOpponentCard(cardSet, index) {
  cardSet.splice(index, 1);
  cardSet.reverse();
  flushCards(cardSet, 70, false, false, true, function () {
    for (var i = 0; i < cardSet.length; i++) {
      var card = cardSet[i];
      card.x = card.originalLocation.x;
      card.y = card.originalLocation.y;
    }
  });
};

//The server has accepted the requested turn action
var turnAccepted = function turnAccepted() {
  gameState.waiting = true;
};

//Handle a request from the server to play a card
var playCard = function playCard(data) {
  var cardSet = deck[data.cardSet];
  var card = cardSet[data.index];

  gameState.waiting = false;

  if (selectedCard === card) {
    unselectCard(selectedCard);
    selectedCard = null;
  }

  //Animate the card differently depending on who played it and what the card is
  if (deck[data.cardSet] === getPlayerHand()) {
    switch (card.name) {
      //Special cards are animated differently and have different effects on the game
      case "bolt":
        selectCard(card, true, true, function () {
          fadeCard(card, function () {
            splicePlayerCard(cardSet, data.index);
          });
        });
        var opponentField = getOpponentField();
        var target = opponentField[opponentField.length - 1];
        startCardFlip([target], false);
        break;
      case "mirror":
        selectCard(card, true, true, function () {
          fadeCard(card, function () {
            splicePlayerCard(cardSet, data.index);
          });
        });
        var temp = getPlayerField();
        if (playerStatus === 'player1') {
          fields['player1'] = fields['player2'];
          fields['player2'] = temp;
          stackCards(fields['player1'], true, 500);
          stackCards(fields['player2'], false, 500);
        } else {
          fields['player2'] = fields['player1'];
          fields['player1'] = temp;
          stackCards(fields['player1'], false, 500);
          stackCards(fields['player2'], true, 500);
        }
        break;
      case "blast":
        if (data.blastIndex > -1) {
          selectCard(card, true, true, function () {
            fadeCard(card, function () {
              var opponentHand = getOpponentHand();
              spliceOpponentCard(opponentHand, data.blastIndex);
              splicePlayerCard(cardSet, data.index);
            });
          });
        }
        break;
      case "1":
        var playerField = getPlayerField();
        var affectedCard = playerField[playerField.length - 1];
        if (!affectedCard.isRevealed()) {
          selectCard(card, true, true, function () {
            fadeCard(card, function () {
              splicePlayerCard(cardSet, data.index);
            });
          });
          startCardFlip([affectedCard], false);
        } else {
          fields[data.cardSet].push(card);
          stackCards(fields[data.cardSet], true, 500);
          splicePlayerCard(cardSet, data.index);
        }
        break;
      default:
        fields[data.cardSet].push(card);
        stackCards(fields[data.cardSet], true, 500);
        splicePlayerCard(cardSet, data.index);
        break;
    }
  } else {
    card.reveal(data.name);
    card.flipImage();

    switch (data.name) {
      case "bolt":
        selectCard(card, true, true, function () {
          startCardFlip([card], false, function () {
            var playerField = getPlayerField();
            var target = playerField[playerField.length - 1];
            startCardFlip([target], false);

            //Animate or timeout so that opponent can actually see move
            fadeCard(card, function () {
              spliceOpponentCard(cardSet, data.index);
            });
          });
        });

        break;
      case "mirror":
        selectCard(card, true, true, function () {
          startCardFlip([card], false, function () {
            fadeCard(card, function () {
              var temp = getPlayerField();
              if (playerStatus === 'player1') {
                fields['player1'] = fields['player2'];
                fields['player2'] = temp;
                stackCards(fields['player1'], true, 500);
                stackCards(fields['player2'], false, 500);
              } else {
                fields['player2'] = fields['player1'];
                fields['player1'] = temp;
                stackCards(fields['player1'], false, 500);
                stackCards(fields['player2'], true, 500);
              }
              spliceOpponentCard(cardSet, data.index);
            });
          });
        });
        break;
      case "blast":
        if (data.blastIndex > -1) {
          selectCard(card, true, true, function () {
            startCardFlip([card], false, function () {
              fadeCard(card, function () {
                var playerHand = getPlayerHand();
                spliceOpponentCard(cardSet, data.index);
                splicePlayerCard(playerHand, data.blastIndex);
              });
            });
          });
        }
        break;
      case "1":
        var _opponentField = getOpponentField();
        var _affectedCard = _opponentField[_opponentField.length - 1];
        if (!_affectedCard.isRevealed()) {
          selectCard(card, true, true, function () {
            startCardFlip([card], false, function () {
              fadeCard(card, function () {
                spliceOpponentCard(cardSet, data.index);
              });
            });
            startCardFlip([_affectedCard], false);
          });
        } else {
          fields[data.cardSet].push(card);
          spliceOpponentCard(cardSet, data.index);
          stackCards(fields[data.cardSet], false, 500, function () {
            animateDeckWhenReady(fields[data.cardSet], function () {
              startCardFlip([card], false);
            });
          });
        }
        break;
      default:
        fields[data.cardSet].push(card);
        spliceOpponentCard(cardSet, data.index);
        stackCards(fields[data.cardSet], false, 500, function () {
          animateDeckWhenReady(fields[data.cardSet], function () {
            startCardFlip([card], false);
          });
        });
        break;
    }
  }
};

//End the current game and reset the gamestate
var endGame = function endGame() {
  readyToPlay = false;
  selectedCard = null;
  playerBlastCard = null;

  inRoom = false;
  blastSelect = false;

  roomOptions({ rooms: [] });
};

//Process a server update regarding the gamestate
var updateGamestate = function updateGamestate(data) {

  if (!data) {
    return;
  }

  var keys = Object.keys(data);

  gameState.waiting = false;

  //Update the sent keys
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    gameState[key] = data[key];
  }

  //Process a request to clear the field / end the game
  if (gameState.clearFields === true) {
    clearFields();
  }

  if (gameState.winner !== null) {
    endGame();
  }

  updateReadyStatus(false);
};

//Process a request to clear the player / opponent fields (move the cards offscreen)
var clearFields = function clearFields() {
  var playerField = getPlayerField();
  var opponentField = getOpponentField();
  for (var i = 0; i < playerField.length; i++) {
    var card = playerField[i];
    var moveAnim = new Animation({
      begin: 0,
      timeToFinish: 600,
      propsBegin: { x: card.x },
      propsEnd: { x: prepCanvas.width + 100 }
    }, true);

    card.bindAnimation(moveAnim, function () {
      animateDeckWhenReady(playerField, function () {
        gameState.clearFields = false;
        playerField.splice(0, playerField.length);
      });
    });
  }

  for (var _i2 = 0; _i2 < opponentField.length; _i2++) {
    var _card5 = opponentField[_i2];
    var _moveAnim = new Animation({
      begin: 0,
      timeToFinish: 600,
      propsBegin: { x: _card5.x },
      propsEnd: { x: -100 }
    }, true);

    _card5.bindAnimation(_moveAnim, function () {
      animateDeckWhenReady(opponentField, function () {
        gameState.clearFields = false;
        opponentField.splice(0, opponentField.length);
      });
    });
  }
};

//Construct an animation to select a card
var selectCard = function selectCard(card, playerSelect, sealBond, callback) {
  var yMod = Math.cos(card.radians) * 60;
  var xMod = Math.sin(card.radians) * 60;
  if (!playerSelect) {
    xMod *= -1;
    yMod *= -1;
  }
  var moveAnim = new Animation({
    begin: 0,
    timeToFinish: 200,
    propsBegin: { x: card.x, y: card.y, hueRotate: card.hueRotate },
    propsEnd: { x: card.originalLocation.x - xMod, y: card.originalLocation.y - yMod, hueRotate: 90 }
  }, false);

  if (card.sealed) {
    return;
  }

  card.bindAnimation(moveAnim, callback, sealBond ? true : false);
};

//Construct an animation to unselect a card
var unselectCard = function unselectCard(card, callback) {

  var moveAnim = new Animation({
    begin: 0,
    timeToFinish: 200,
    propsBegin: { x: card.x, y: card.y, hueRotate: card.hueRotate },
    propsEnd: { x: card.originalLocation.x, y: card.originalLocation.y, hueRotate: 0 }
  }, false);

  if (card.sealed) {
    return;
  }

  card.bindAnimation(moveAnim, callback);
};

//Construct an animation to move a card somewhere
var moveTo = function moveTo(cardCollection, x, y, time, offset, callback) {
  var _loop3 = function _loop3(i) {
    var card = cardCollection[i];
    var moveAnim = new Animation({
      begin: offset ? 100 * i : 0,
      timeToFinish: time,
      propsBegin: { x: card.x, y: card.y },
      propsEnd: { x: x, y: y }
    }, true);
    card.bindAnimation(moveAnim, function () {
      card.originalLocation = { x: card.x, y: card.y };
      animateDeckWhenReady(cardCollection, function () {

        if (callback) {
          callback();
        }
      });
    });
  };

  for (var i = 0; i < cardCollection.length; i++) {
    _loop3(i);
  }
};

//Construct an animation to start flipping a card over
var startCardFlip = function startCardFlip(cardCollection, reverse, callback) {
  var _loop4 = function _loop4(i) {
    var card = cardCollection[i];
    var distance = card.width / 2;
    var xDiff = distance;
    var yDiff = Math.sin(card.radians) * distance;
    var flipAnimation = new Animation({
      begin: reverse ? i * 50 : (cardCollection.length - 1 - i) * 50,
      timeToFinish: 200,
      propsBegin: { width: card.width, x: card.x, y: card.y },
      propsEnd: { width: 0, x: xDiff + card.x, y: yDiff + card.y }
    }, true);
    var width = card.width;
    card.bindAnimation(flipAnimation, function () {
      card.flip();
      endCardFlip(card, cardCollection, width, xDiff, yDiff, callback);
    });
  };

  for (var i = 0; i < cardCollection.length; i++) {
    _loop4(i);
  }
};

//Construct an animation to finish flipping a card over
var endCardFlip = function endCardFlip(card, cardCollection, width, xDiff, yDiff, callback) {

  var flipAnimation = new Animation({
    begin: 0,
    timeToFinish: 200,
    propsBegin: { width: 0, x: card.x, y: card.y },
    propsEnd: { width: width, x: card.x - xDiff, y: card.y - yDiff }
  }, true);
  card.bindAnimation(flipAnimation, function () {
    animateDeckWhenReady(cardCollection, callback);
  });
};

//Construct an animation to flush a set of cards to look like they belong to a hand
var flushCards = function flushCards(cardCollection, baseLineY, curveDown, sequentially, reverse, callback) {
  for (var i = 0; i < cardCollection.length; i++) {
    var _card6 = cardCollection[i];
    var x = 1100 + 100 * (cardCollection.length / 2 - 1 - i);

    var middle = Math.floor(cardCollection.length / 2);
    var distanceFromMiddle = middle - i;

    if (cardCollection.length % 2 === 0) {
      if (distanceFromMiddle < 0) {
        distanceFromMiddle = middle - i;
      } else {
        distanceFromMiddle = middle - i - 1;
      }
    }

    //Animate differently depending on player status
    var y = curveDown ? baseLineY + Math.max(Math.pow(Math.abs(distanceFromMiddle * 6), 1.3), 6) : baseLineY - Math.max(Math.pow(Math.abs(distanceFromMiddle * 6), 1.3), 6);

    var radians = curveDown ? distanceFromMiddle * 0.05 : distanceFromMiddle * -0.05;

    //Reset the card location
    _card6.originalLocation.x = x;
    _card6.originalLocation.y = y;

    var flushAnim = new Animation({
      begin: sequentially ? (cardCollection.length - 1 - i) * 200 : 0,
      timeToFinish: sequentially ? 600 + (cardCollection.length - 1 - i) * 100 : 600,
      propsBegin: { x: _card6.x, y: _card6.y, radians: _card6.radians },
      propsEnd: { x: x, y: y, radians: radians }
    }, true);

    _card6.bindAnimation(flushAnim, function () {
      animateDeckWhenReady(cardCollection, callback);
    });
  }

  if (reverse) {
    cardCollection.reverse();
  }
};

//Construct an animation to stack cards on the field
var stackCards = function stackCards(cardCollection, expandRight, time, callback) {

  var baseX = expandRight ? 1080 : 670;
  var baseY = expandRight ? 535 : 300;
  for (var i = 0; i < cardCollection.length; i++) {
    var _card7 = cardCollection[i];

    var x = expandRight ? baseX + 40 * i : baseX - 40 * i;

    var stackAnim = new Animation({
      begin: 0,
      timeToFinish: time,
      propsBegin: { x: _card7.x, y: _card7.y, radians: _card7.radians },
      propsEnd: { x: x, y: baseY, radians: expandRight ? 0 : Math.PI }
    }, true);

    _card7.bindAnimation(stackAnim, function () {
      animateDeckWhenReady(cardCollection, callback);
    });
  }
};

//Construct an animation fold cards into one pile
var foldInCards = function foldInCards(cardCollection, x, y, callback) {
  for (var i = 0; i < cardCollection.length; i++) {
    var _card8 = cardCollection[i];

    var foldInAnim = new Animation({
      begin: 0,
      timeToFinish: 300,
      propsBegin: { x: _card8.x, y: _card8.y, radians: _card8.radians },
      propsEnd: { x: x, y: y, radians: 0 }
    }, true);

    _card8.bindAnimation(foldInAnim, function () {
      animateDeckWhenReady(cardCollection, callback);
    });
  }
};

//Construct an animation to fade out cards
var fadeCard = function fadeCard(card, callback) {
  var fadeAnim = new Animation({
    begin: 0,
    timeToFinish: 500,
    propsBegin: { opacity: 1 },
    propsEnd: { opacity: 0 }
  }, true);

  card.bindAnimation(fadeAnim, callback);
};

//Send a chat message to other players in the room
var sendChatMessage = function sendChatMessage(e) {
  var chatBox = document.querySelector("#chatBox");
  var message = chatBox.value;
  chatBox.value = "";
  socket.emit('chatMessage', { message: message });
};

//Display chat messages received from other players
var receivedChatMessage = function receivedChatMessage(data) {
  var message = data.message;
  addToChat(message);
};

//Add a message to the chat window
var addToChat = function addToChat(text) {
  var chatWindow = document.querySelector("#chat");
  chatWindow.value = chatWindow.value + "\n" + text;
  chatWindow.scrollTop = chatWindow.scrollHeight;
};
"use strict";

var profilePics = void 0;

//If the user selects a different profile character, update the preview image to match
var alterPreviewImage = function alterPreviewImage(e) {
  var select = document.querySelector("#profileImgSelect");
  var key = select.options[select.selectedIndex].value;
  document.querySelector("#profilePreview").src = profilePics[key].imageFile;
};

//Construct a profile character selection window
var ProfileSelection = function ProfileSelection(props) {

  var profileKeys = Object.keys(props.profiles);
  var profiles = profileKeys.map(function (key) {
    var profile = props.profiles[key];

    return React.createElement(
      "option",
      { value: key },
      profile.name
    );
  });

  return React.createElement(
    "select",
    { name: "profile_name", id: "profileImgSelect", onChange: alterPreviewImage, className: "custom-select" },
    profiles
  );
};

//Render / populate the character selection window
var populateProfileSelection = function populateProfileSelection(profiles) {
  ReactDOM.render(React.createElement(ProfileSelection, { profiles: profiles }), profileSelection);
};

//Get all possible profile characters from the server
var getProfiles = function getProfiles() {
  sendAjax('GET', '/getProfiles', null, function (data) {
    populateProfileSelection(data.profilePics);
    profilePics = data.profilePics;
  });
};

//Hide the success message
var hideSuccess = function hideSuccess(e) {
  e.preventDefault();
  handleSuccess("", true);
};

//Hide the error message
var hideError = function hideError(e) {
  e.preventDefault();
  handleError("", true);
};

//Construct a success message window
var SuccessMessage = function SuccessMessage(props) {

  var className = "alert alert-dismissable alert-success";

  if (props.hide) {
    className = className + " hidden";
  }

  return React.createElement(
    "div",
    { className: className },
    React.createElement(
      "a",
      { href: "#", className: "close", onClick: hideSuccess },
      "\xD7"
    ),
    "Success: ",
    props.message
  );
};

//Construct an error message window
var ErrorMessage = function ErrorMessage(props) {

  var className = "alert alert-dismissible alert-danger";

  if (props.hide) {
    className = className + " hidden";
  }

  return React.createElement(
    "div",
    { className: className },
    React.createElement(
      "a",
      { href: "#", className: "close", onClick: hideError },
      "\xD7"
    ),
    "Error: ",
    props.message
  );
};

var successMessage = "";
var successRepeatCount = 1;

//Handle a successful action by displaying a message to the user
var handleSuccess = function handleSuccess(message, hide) {

  if (!hide) {
    handleError("", true);
  }

  if (window.hideModal) {
    hideModal();
  }

  var msg = message;

  if (successMessage === message) {
    successRepeatCount++;
    msg = message + " (x" + successRepeatCount + ")";
  } else {
    successMessage = msg;
    successRepeatCount = 1;
  }

  ReactDOM.render(React.createElement(SuccessMessage, { message: msg, hide: hide }), document.querySelector("#successMessage"));

  $('html, body').scrollTop(0);
};

var errorMessage = "";
var errorRepeatCount = 1;

//Handle an error message by displaying an error message to the user
var handleError = function handleError(message, hide) {

  if (!hide) {
    handleSuccess("", true);
  }

  if (window.hideModal) {
    hideModal();
  }

  var msg = message;

  if (errorMessage === message) {
    errorRepeatCount++;
    msg = message + " (x" + errorRepeatCount + ")";
  } else {
    errorMessage = msg;
    errorRepeatCount = 1;
  }

  ReactDOM.render(React.createElement(ErrorMessage, { message: msg, hide: hide }), document.querySelector("#errorMessage"));

  $('html, body').scrollTop(0);
};

//Redirect the user to a new page
var redirect = function redirect(response) {
  window.location = response.redirect;
};

//Send an Ajax request to the server to get or post info
var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};
