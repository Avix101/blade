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
      if (playerTurn) {
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
    prepCtx.drawImage(playerProfile.charImage, 25, 750, 256, 256);

    prepCtx.fillText(playerProfile.username, 153, 1020);
  }

  if (opponentProfile) {
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
  if (!inRoom && gameState.turnType !== "end") {
    drawWaitingOverlay("Please create or join a game...");
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
  if (pageView === "#blade") {
    var dimensions = calcDisplayDimensions();
    renderGame(dimensions.width, dimensions.height);
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
  return React.createElement("canvas", { id: "viewport", width: props.width, height: props.height });
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
            { onClick: createRoom, className: "btn btn-lg btn-primary" },
            "Create New Game"
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
        "Want to know how to play Blade? Well, let me help!"
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
        "Check out the original games!"
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
        "Trails of Cold Steel is a Japanese RPG made by Falcom, and published by XSEED in the US. The first ToCS is the 6th entry in the 'Trails' or 'Kiseki' saga which is part of an even larger series titled \"The Legend of Heroes\". Blade is a recreation of a minigame found in ToCS."
      ),
      React.createElement(
        "p",
        { className: "lead aboutPara" },
        "To find out more about the original game and how to purchase a copy for yourself, please visit its Steam store page."
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
        "The second entry in the Cold Steel arc of the Trails series picks up where the first one left off. It is highly recommended that the games are played in order. Blade exists in both games, but the 'Blast' and 'Force' cards were introduced in ToCS II."
      ),
      React.createElement(
        "p",
        { className: "lead aboutPara" },
        "If you're ready to learn more about the second Trails of Cold Steel game, please visit the Steam store page. Be aware that the page contains spoilers for the first game."
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

//Render the left panel as empty
var clearLeftPane = function clearLeftPane() {
  ReactDOM.render(React.createElement("div", null), document.querySelector("#room"));
};

//Make a call to render the game history section
var renderGameHistory = function renderGameHistory(games) {
  ReactDOM.render(React.createElement(GameHistory, { games: games }), document.querySelector("#gameHistory"));
};

//Make a call to render the profile panel
var renderProfile = function renderProfile() {
  getTokenWithCallback(function (csrfToken) {
    ReactDOM.render(React.createElement(ProfileWindow, { csrf: csrfToken }), document.querySelector("#main"));
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

//When a room is selected from the existing rooms list, paste the code into the room join bar
var onRoomSelect = function onRoomSelect(e) {
  var roomId = document.querySelector("#roomName");
  roomId.value = e.target.getAttribute('data-room');
};

//Request to create a new room
var createRoom = function createRoom(e) {
  socket.emit('createRoom');
};

//Request to join an existing room
var joinRoom = function joinRoom(e) {
  var roomId = document.querySelector("#roomName").value;
  socket.emit('joinRoom', { room: roomId });
};

//When a room is joined, prepare for a new game
var roomJoined = function roomJoined(data) {
  playerStatus = data.status;
  inRoom = true;
  addToChat("You have joined room: " + data.room);

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

//Sort the player's deck and animate it
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
    var _index = opponentDeck.length - 1;
    var _card = opponentDeck[_index];

    fields[player].push(_card);
    opponentDeck.splice(_index, 1);
    _card.reveal(data.card.ref);

    _card.flipImage();

    stackCards(fields[player], false, 500, function () {
      animateDeckWhenReady(fields[player], function () {
        startCardFlip([_card], false);
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
      var _card2 = cardSet[_i];
      _card2.x = _card2.originalLocation.x;
      _card2.y = _card2.originalLocation.y;
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
          stackCards(fields[data.cardSet], true, 500);
          spliceOpponentCard(cardSet, data.index);
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
    var _card3 = opponentField[_i2];
    var _moveAnim = new Animation({
      begin: 0,
      timeToFinish: 600,
      propsBegin: { x: _card3.x },
      propsEnd: { x: -100 }
    }, true);

    _card3.bindAnimation(_moveAnim, function () {
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
    var _card4 = cardCollection[i];
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
    _card4.originalLocation.x = x;
    _card4.originalLocation.y = y;

    var flushAnim = new Animation({
      begin: sequentially ? (cardCollection.length - 1 - i) * 200 : 0,
      timeToFinish: sequentially ? 600 + (cardCollection.length - 1 - i) * 100 : 600,
      propsBegin: { x: _card4.x, y: _card4.y, radians: _card4.radians },
      propsEnd: { x: x, y: y, radians: radians }
    }, true);

    _card4.bindAnimation(flushAnim, function () {
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
    var _card5 = cardCollection[i];

    var x = expandRight ? baseX + 40 * i : baseX - 40 * i;

    var stackAnim = new Animation({
      begin: 0,
      timeToFinish: time,
      propsBegin: { x: _card5.x, y: _card5.y, radians: _card5.radians },
      propsEnd: { x: x, y: baseY, radians: expandRight ? 0 : Math.PI }
    }, true);

    _card5.bindAnimation(stackAnim, function () {
      animateDeckWhenReady(cardCollection, callback);
    });
  }
};

//Construct an animation fold cards into one pile
var foldInCards = function foldInCards(cardCollection, x, y, callback) {
  for (var i = 0; i < cardCollection.length; i++) {
    var _card6 = cardCollection[i];

    var foldInAnim = new Animation({
      begin: 0,
      timeToFinish: 300,
      propsBegin: { x: _card6.x, y: _card6.y, radians: _card6.radians },
      propsEnd: { x: x, y: y, radians: 0 }
    }, true);

    _card6.bindAnimation(foldInAnim, function () {
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
};
"use strict";

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
