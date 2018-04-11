"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Animation = function () {
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
    value: function bind(currentTime) {
      this.startTime = currentTime;
      this.currentTime - currentTime;
    }
  }, {
    key: "update",
    value: function update(currentTime) {
      var timeElapsed = currentTime - this.currentTime;
      var timeSinceStart = currentTime - this.startTime;
      this.currentTime += timeElapsed;

      if (timeSinceStart < this.begin) {
        return;
      }

      var ratio = (timeSinceStart - this.begin) / this.timeToFinish;

      if (ratio > 1) {
        ratio = 1;
      }

      var propKeys = Object.keys(this.propsCurrent);
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i];

        this.propsCurrent[key] = lerp(this.propsBegin[key], this.propsEnd[key], ratio);
      }

      if (ratio >= 1) {
        this.complete = true;
      }
    }
  }, {
    key: "ready",
    value: function ready() {
      return this.holdReadyStatus;
    }
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
    //this.queuedAnimations = [];
    this.animCallback = null;
  }

  _createClass(Card, [{
    key: "bindAnimation",
    value: function bindAnimation(animation, callback) {
      this.animation = animation;
      this.animation.bind(new Date().getTime());

      if (callback) {
        this.animCallback = callback;
      } else {
        this.animCallback = null;
      }
    }
  }, {
    key: "isRevealed",


    /*queueAnimation(animation, params, callback){
      this.queuedAnimations.push({animation, callback});
    };
    
    nextAnimation(){
      if (this.queuedAnimations.length > 0){
        const queued = this.queuedAnimations[0];
        const animation = queued.animation.apply(this, queued.params);
        this.bindAnimation(animation, queued.callback);
        this.queuedAnimations.splice(0, 1);
      }
    };
    
    clearQueue(){
      this.queuedAnimations = [];
    };*/

    value: function isRevealed() {
      return this.revealed;
    }
  }, {
    key: "flip",
    value: function flip() {
      this.revealed = !this.revealed;
    }
  }, {
    key: "cancelAnimation",
    value: function cancelAnimation() {
      delete this.animation;
      this.animation = null;
    }
  }, {
    key: "endAnimation",
    value: function endAnimation() {
      this.cancelAnimation();
      if (this.animCallback) {
        this.animCallback(this);
      }
    }
  }, {
    key: "readyToAnimate",
    value: function readyToAnimate() {
      return this.animation === null;
    }
  }, {
    key: "reveal",
    value: function reveal(name) {
      this.name = name;
    }
  }, {
    key: "flipImage",
    value: function flipImage() {
      this.radians = (this.radians + Math.PI) % (2 * Math.PI);
    }
  }, {
    key: "update",
    value: function update(currentTime) {
      if (this.animation) {
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

var lerp = function lerp(val1, val2, ratio) {
  var component1 = (1 - ratio) * val1;
  var component2 = ratio * val2;
  return component1 + component2;
};

var clearCanvas = function clearCanvas(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

var displayFrame = function displayFrame() {
  clearCanvas(viewport, viewCtx);
  viewCtx.save();
  viewCtx.imageSmoothingEnabled = false;
  viewCtx.drawImage(prepCanvas, 0, 0, prepCanvas.width, prepCanvas.height, 0, 0, viewport.width, viewport.height);
};

var drawCard = function drawCard(card) {
  var image = cardImageStruct[card.name];

  if (!card.isRevealed()) {
    image = cardImageStruct["back"];
  }

  prepCtx.save();

  if (card === selectedCard) {
    prepCtx.filter = "hue-rotate(" + card.hueRotate + "deg)";
  }

  prepCtx.translate(card.x + card.width / 2, card.y + card.height / 2);
  prepCtx.rotate(card.radians);

  prepCtx.drawImage(image, -card.width / 2, -card.height / 2, card.width, card.height);
  prepCtx.restore();
};

var drawScore = function drawScore(playerPoints, opponentPoints) {
  prepCtx.save();
  prepCtx.font = "96pt Fira Sans, sans-serif";

  var playerWidth = prepCtx.measureText(playerPoints).width;
  var opponentWidth = prepCtx.measureText(opponentPoints).width;
  var halfWidth = prepCanvas.width / 2 - 3;

  console.log;

  var opponentGradient = prepCtx.createLinearGradient(0, 355, 0, 427);
  var playerGradient = prepCtx.createLinearGradient(0, 700, 0, 772);
  playerGradient.addColorStop(0, "white");
  opponentGradient.addColorStop(0, "white");
  playerGradient.addColorStop(0.3, "#dbb75c");
  opponentGradient.addColorStop(0.3, "#dbb75c");

  prepCtx.textAlign = "center";
  prepCtx.textBaseline = "middle";

  prepCtx.fillStyle = opponentGradient;
  prepCtx.fillText(opponentPoints, halfWidth, 355);

  prepCtx.fillStyle = playerGradient;
  prepCtx.fillText(playerPoints, halfWidth, 700);

  prepCtx.restore();
};

var drawTurnIndicator = function drawTurnIndicator() {
  var playerTurn = gameState.turnOwner === playerStatus;

  prepCtx.save();
  prepCtx.font = "72pt Fira Sans, sans-serif";
  prepCtx.textAlign = "center";
  prepCtx.textBaseline = "middle";

  if (playerTurn) {
    prepCtx.fillStyle = "blue";
    prepCtx.fillText("Your Turn!", 520, 640);
  } else {
    prepCtx.fillStyle = "red";
    prepCtx.fillText("Opponent's Turn!", 1400, 400);
  }
};

var drawGameResult = function drawGameResult() {
  prepCtx.save();
  prepCtx.globalAlpha = 0.7;
  prepCtx.fillStyle = "black";
  prepCtx.fillRect(0, 0, prepCanvas.width, prepCanvas.height);

  prepCtx.globalAlpha = 1;
  prepCtx.font = "72pt Fira Sans, sans-serif";
  prepCtx.textAlign = "center";
  prepCtx.textBaseline = "middle";

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

var drawWaitingOverlay = function drawWaitingOverlay() {
  prepCtx.save();
  prepCtx.globalAlpha = 0.7;
  prepCtx.fillStyle = "black";
  prepCtx.fillRect(0, 0, prepCanvas.width, prepCanvas.height);

  prepCtx.globalAlpha = 1;
  prepCtx.font = "72pt Fira Sans, sans-serif";
  prepCtx.textAlign = "center";
  prepCtx.textBaseline = "middle";

  prepCtx.fillStyle = "white";
  prepCtx.fillText("Waiting for opponent...", prepCanvas.width / 2, prepCanvas.height / 2);

  prepCtx.restore();
};

var draw = function draw() {
  clearCanvas(prepCanvas, prepCtx);

  prepCtx.drawImage(bladeMat, 0, 0, prepCanvas.width, prepCanvas.height);

  if (!cardImageStruct["back"]) {
    return;
  }

  var readyStatus = true;

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

  updateReadyStatus(readyStatus);

  drawScore(getPlayerPoints(), getOpponentPoints());

  if (gameState.winner) {
    drawGameResult();
  } else {
    drawTurnIndicator();
  }

  if (gameState.waiting) {
    drawWaitingOverlay();
  }

  displayFrame();
};
'use strict';

var viewport = void 0,
    viewCtx = void 0,
    prepCanvas = void 0,
    prepCtx = void 0;
var socket = void 0,
    hash = void 0;
var bladeMat = void 0;
var cardsLoaded = 0;
var animationFrame = void 0;
var deck = {};
var NULL_FUNC = function NULL_FUNC() {};
var readyToPlay = false;
var selectedCard = null;
var mousePos = { x: 0, y: 0 };

var playerStatus = void 0;
var blastSelect = false;
var playerBlastCard = void 0;
var inRoom = false;
var gameState = {
  turnType: "pickFromDeck",
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

var resizeGame = function resizeGame(e) {
  var dimensions = calcDisplayDimensions();
  renderGame(dimensions.width, dimensions.height);
};

var init = function init() {

  var dimensions = calcDisplayDimensions();
  renderGame(dimensions.width, dimensions.height);

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
  socket.on('setDeck', setDeck);
  socket.on('sortDeck', sortDeck);
  socket.on('pickFromDeck', pickFromDeck);
  socket.on('playCard', playCard);
  socket.on('turnAccepted', turnAccepted);
  socket.on('gamestate', updateGamestate);

  //Eventually switch to server call to load cards
  //loadBladeCards([{name: "back", src: "/assets/img/cards/00 Back.png"}]);

  animationFrame = requestAnimationFrame(update);
};

//Run the init function when the window loads
window.onload = init;

//Resize the viewport when the window resizes
window.addEventListener('resize', resizeGame);
"use strict";

var update = function update() {

  if (blastSelect) {
    checkCardCollisions(getOpponentHand(), false);
  } else {
    checkCardCollisions(getPlayerHand(), true);
  }
  draw();

  animationFrame = requestAnimationFrame(update);
};

var processClick = function processClick(e) {
  if (selectedCard && !gameState.winner && !gameState.waiting) {
    switch (gameState.turnType) {
      case "pickFromDeck":
        unselectCard(selectedCard);
        socket.emit('pickFromDeck');
        selectedCard = null;
        break;
      case "playCard":
        var playerHand = getPlayerHand();

        if (selectedCard.name === "blast" && !blastSelect) {
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

var processMouseLeave = function processMouseLeave(e) {
  mousePos = {
    x: -200,
    y: -200
  };
};

var getMouse = function getMouse(e) {
  var rect = viewport.getBoundingClientRect();
  var widthRatio = rect.width / prepCanvas.width;
  var heightRatio = rect.height / prepCanvas.height;
  mousePos = {
    x: (e.clientX - rect.left) / widthRatio,
    y: (e.clientY - rect.top) / heightRatio
  };
};

var pointInRect = function pointInRect(rect, point) {
  if (point.x > rect.x && point.x < rect.x + rect.width) {
    if (point.y > rect.y && point.y < rect.y + rect.height) {
      return true;
    }
  }

  return false;
};

var rotatePoint = function rotatePoint(point, anchor, radians) {
  var translatedPoint = { x: point.x - anchor.x, y: point.y - anchor.y };

  var sin = Math.sin(-radians);
  var cos = Math.cos(-radians);

  var newX = translatedPoint.x * cos - translatedPoint.y * sin;
  var newY = translatedPoint.x * sin + translatedPoint.y * cos;

  return { x: newX + anchor.x, y: newY + anchor.y };
};

var checkCardCollisions = function checkCardCollisions(cardCollection, selectPlayer) {
  if (!readyToPlay || gameState.winner !== null || gameState.waiting) {
    return;
  }

  if (gameState.turnType === "pickFromDeck") {
    var topCard = getTopDeckCard();
    if (topCard) {
      cardCollection = [topCard];
    } else {
      cardCollection = [];
    }
  }

  var newSelection = null;
  for (var i = 0; i < cardCollection.length; i++) {
    var card = cardCollection[i];

    var cardCenter = { x: card.x + card.width / 2, y: card.y + card.height / 2 };
    var rotatedPoint = rotatePoint(mousePos, cardCenter, card.radians);

    if (pointInRect(card, rotatedPoint)) {
      newSelection = card;
    }
  }

  if (newSelection && newSelection !== selectedCard) {

    if (selectedCard) {
      unselectCard(selectedCard, NULL_FUNC);
    }

    selectedCard = newSelection;
    selectCard(selectedCard, selectPlayer, NULL_FUNC);
  } else if (!newSelection && selectedCard !== null) {
    unselectCard(selectedCard, NULL_FUNC);
    selectedCard = null;
  }
};

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

var chainAnimations = function chainAnimations(animationPackages, finalCallback) {
  animationPackages.reverse();
  var animList = animationPackages.map(function (pack) {
    return pack[0];
  });
  var paramList = animationPackages.map(function (pack) {
    return pack[1];
  });
  var callbacks = [finalCallback];

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

var loadBladeCards = function loadBladeCards(cardImages) {
  var _loop2 = function _loop2(i) {
    var cardImage = cardImages[i];
    var image = new Image();

    image.onload = function () {
      cardImageStruct[cardImage.name] = image;

      cardsLoaded++;

      if (cardsLoaded >= cardImages.length) {
        //socket.emit('requestDeck');
      }
    };

    image.src = cardImage.src;
  };

  for (var i = 0; i < cardImages.length; i++) {
    _loop2(i);
  }
};

var roomOptions = function roomOptions(data) {
  if (!inRoom) {
    renderRoomSelection(data.rooms, false);
    setTimeout(function () {
      socket.emit('getRooms');
    }, 10);
  }
};

var onRoomSelect = function onRoomSelect(e) {
  var roomId = document.querySelector("#roomName");
  roomId.value = e.target.getAttribute('data-room');
};

var createRoom = function createRoom(e) {
  socket.emit('createRoom');
};

var joinRoom = function joinRoom(e) {
  var roomId = document.querySelector("#roomName").value;
  socket.emit('joinRoom', { room: roomId });
};

var roomJoined = function roomJoined(data) {
  playerStatus = data.status;
  inRoom = true;

  var subDeckKeys = Object.keys(deck);
  for (var i = 0; i < subDeckKeys.length; i++) {
    var key = subDeckKeys[i];
    deck[key] = [];
  }

  fields = {
    'player1': [],
    'player2': []
  };

  gameState.turnType = "pickFromDeck";
  gameState.turnOwner = null;
  gameState.player1Points = 0;
  gameState.player2Points = 0;
  gameState.winner = null;
  gameState.waiting = false;

  renderRoomSelection([], true);
};

var setDeck = function setDeck(data) {

  var subDeckKeys = Object.keys(data);
  for (var i = 0; i < subDeckKeys.length; i++) {
    var key = subDeckKeys[i];
    deck[key] = [];
    for (var j = 0; j < data[key].length; j++) {
      var cardData = data[key][j];
      var card = void 0;

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

  if (playerStatus === 'player1') {
    initPlayerDeck(deck.player1, deck.p1Deck);
    initOpponentDeck(deck.player2, deck.p2Deck);
  } else if (playerStatus === 'player2') {
    initPlayerDeck(deck.player2, deck.p2Deck);
    initOpponentDeck(deck.player1, deck.p1Deck);
  }
  //initPlayerDeck(playerStatus === 'player1' ? deck.);

  //moveToPlayerDeck(deck.player1);
  //NOTE: Replace with more consistent value!
  //const width = deck.player1[0].width;

  /*chainAnimations(deck.player1, [
    [moveToPlayerDeck, [], true],
    [flushCards, [770, true], true],
    [startCardFlip, [], true],
    [endCardFlip, [width], false]
  ]);*/
  //console.log(deck.player1.concat(deck.p1Deck));
  /*moveToPlayerDeck(deck.player1.concat(deck.p1Deck), () => {
    flushCards(deck.player1, 770, true, true, () => {
      startCardFlip(deck.player1, false, () => {
        foldInCards(deck.player1, () => {
          startCardFlip(deck.player1, true, () => {
            startCardFlip(deck.player1, false, () => {
              flushCards(deck.player1, 770, true, false);
            });
          });
        });
      });
    });
  });*/

  //flushCards(deck.player1, 770, true);
};

var getTopDeckCard = function getTopDeckCard() {
  if (playerStatus === 'player1') {
    return deck.p1Deck[deck.p1Deck.length - 1];
  } else if (playerStatus === 'player2') {
    return deck.p2Deck[deck.p2Deck.length - 1];
  }
};

var getPlayerDeck = function getPlayerDeck() {
  if (playerStatus === 'player1') {
    return deck.p1Deck;
  } else if (playerStatus === 'player2') {
    return deck.p2Deck;
  }
};

var getOpponentDeck = function getOpponentDeck() {
  if (playerStatus === 'player1') {
    return deck.p2Deck;
  } else if (playerStatus === 'player2') {
    return deck.p1Deck;
  }
};

var getPlayerField = function getPlayerField() {
  if (playerStatus === 'player1') {
    return fields['player1'];
  } else if (playerStatus === 'player2') {
    return fields['player2'];
  }
};

var getOpponentField = function getOpponentField() {
  if (playerStatus === 'player1') {
    return fields['player2'];
  } else if (playerStatus === 'player2') {
    return fields['player1'];
  }
};

var getPlayerHand = function getPlayerHand() {
  if (playerStatus === 'player1') {
    return deck.player1;
  } else if (playerStatus === 'player2') {
    return deck.player2;
  }
};

var getOpponentHand = function getOpponentHand() {
  if (playerStatus === 'player1') {
    return deck.player2;
  } else if (playerStatus === 'player2') {
    return deck.player1;
  }
};

var getPlayerPoints = function getPlayerPoints() {
  if (playerStatus === 'player1') {
    return gameState.player1Points;
  } else if (playerStatus === 'player2') {
    return gameState.player2Points;
  }
};

var getOpponentPoints = function getOpponentPoints() {
  if (playerStatus === 'player1') {
    return gameState.player2Points;
  } else if (playerStatus === 'player2') {
    return gameState.player1Points;
  }
};

var initPlayerDeck = function initPlayerDeck(playerHand, playerDeck) {
  chainAnimations([[moveTo, [playerHand.concat(playerDeck), -200, 800, 0, false]], [moveTo, [playerHand.concat(playerDeck), 300, 800, 400, true]], [flushCards, [playerHand, 770, true, true, true]], [startCardFlip, [playerHand, false]], [foldInCards, [playerHand, 1100, 770]], [startCardFlip, [playerHand, true]]], function () {
    socket.emit('sortDeck');
  });
};

var initOpponentDeck = function initOpponentDeck(opponentHand, opponentDeck) {
  chainAnimations([[moveTo, [opponentHand.concat(opponentDeck), -200, 40, 0, false]], [moveTo, [opponentHand.concat(opponentDeck), 300, 40, 400, true]], [flushCards, [opponentHand, 70, false, true, true]], [foldInCards, [opponentHand, 1100, 70]], [flushCards, [opponentHand, 70, false, false, true]]], function () {
    for (var i = 0; i < opponentHand.length; i++) {
      var card = opponentHand[i];
      card.originalLocation = { x: card.x, y: card.y };
    }
  });
};

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

var pickFromDeck = function pickFromDeck(data) {
  var player = data.player;
  gameState.waiting = false;

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

var splicePlayerCard = function splicePlayerCard(cardSet, index) {
  cardSet.splice(index, 1);
  cardSet.reverse();
  flushCards(cardSet, 770, true, false, true, function () {
    for (var i = 0; i < cardSet.length; i++) {
      var card = cardSet[i];
      card.originalLocation = { x: card.x, y: card.y };
    }
  });
};

var spliceOpponentCard = function spliceOpponentCard(cardSet, index) {
  cardSet.splice(index, 1);
  cardSet.reverse();
  flushCards(cardSet, 70, false, false, true, function () {
    for (var i = 0; i < cardSet.length; i++) {
      var card = cardSet[i];
      card.originalLocation = { x: card.x, y: card.y };
    }
  });
};

var turnAccepted = function turnAccepted() {
  gameState.waiting = true;
};

var playCard = function playCard(data) {
  var cardSet = deck[data.cardSet];
  var card = cardSet[data.index];

  console.log(data);

  gameState.waiting = false;

  if (selectedCard === card) {
    unselectCard(selectedCard);
    selectedCard = null;
  }

  //moveTo([card], 1000, 500, 500, false);
  if (deck[data.cardSet] === getPlayerHand()) {
    switch (card.name) {
      case "bolt":
        selectCard(card, true, function () {
          splicePlayerCard(cardSet, data.index);
        });
        var opponentField = getOpponentField();
        var target = opponentField[opponentField.length - 1];
        startCardFlip([target], false);
        break;
      case "mirror":
        selectCard(card, true, function () {
          splicePlayerCard(cardSet, data.index);
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
          selectCard(card, true, function () {
            var opponentHand = getOpponentHand();
            spliceOpponentCard(opponentHand, data.blastIndex);
            splicePlayerCard(cardSet, data.index);
          });
        }
        break;
      case "1":
        var playerField = getPlayerField();
        var affectedCard = playerField[playerField.length - 1];
        if (!affectedCard.isRevealed()) {
          selectCard(card, true, function () {
            splicePlayerCard(cardSet, data.index);
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
        selectCard(card, true, function () {
          startCardFlip([card], false, function () {
            var playerField = getPlayerField();
            var target = playerField[playerField.length - 1];
            startCardFlip([target], false);

            //Animate or timeout so that opponent can actually see move
            spliceOpponentCard(cardSet, data.index);
          });
        });

        break;
      case "mirror":
        selectCard(card, true, function () {
          startCardFlip([card], false, function () {
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
        break;
      case "blast":
        if (data.blastIndex > -1) {
          selectCard(card, false, function () {
            startCardFlip([card], false, function () {
              var playerHand = getPlayerHand();
              spliceOpponentCard(cardSet, data.index);
              splicePlayerCard(playerHand, data.blastIndex);
            });
          });
        }
        break;
      case "1":
        var _opponentField = getOpponentField();
        var _affectedCard = _opponentField[_opponentField.length - 1];
        if (!_affectedCard.isRevealed()) {
          selectCard(card, true, function () {
            startCardFlip([_affectedCard], false, function () {
              spliceOpponentCard(cardSet, data.index);
            });
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

var endGame = function endGame() {
  readyToPlay = false;
  selectedCard = null;
  playerBlastCard = null;

  inRoom = false;
  blastSelect = false;

  roomOptions({ rooms: [] });
};

var updateGamestate = function updateGamestate(data) {
  var keys = Object.keys(data);

  gameState.waiting = false;

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    gameState[key] = data[key];
  }

  if (gameState.clearFields === true) {
    clearFields();
  }

  if (gameState.winner !== null) {
    endGame();
  }

  updateReadyStatus(false);
};

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

  for (var _i = 0; _i < opponentField.length; _i++) {
    var _card2 = opponentField[_i];
    var _moveAnim = new Animation({
      begin: 0,
      timeToFinish: 600,
      propsBegin: { x: _card2.x },
      propsEnd: { x: -100 }
    }, true);

    _card2.bindAnimation(_moveAnim, function () {
      animateDeckWhenReady(opponentField, function () {
        gameState.clearFields = false;
        opponentField.splice(0, opponentField.length);
      });
    });
  }
};

var selectCard = function selectCard(card, playerSelect, callback) {
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

  card.bindAnimation(moveAnim, callback);
};

var unselectCard = function unselectCard(card, callback) {
  var moveAnim = new Animation({
    begin: 0,
    timeToFinish: 200,
    propsBegin: { x: card.x, y: card.y, hueRotate: card.hueRotate },
    propsEnd: { x: card.originalLocation.x, y: card.originalLocation.y, hueRotate: 0 }
  }, false);

  card.bindAnimation(moveAnim, callback);
};

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
        //cardCollection.reverse();
        if (callback) {
          callback();
        }
      });
      //animateDeckWhenReady(cardCollection, () => {
      //flushCards(cardCollection, 770, true);
      //});
    });
    //anims.push(moveAnim);
  };

  //const anims = [];
  for (var i = 0; i < cardCollection.length; i++) {
    _loop3(i);
  }
  //return anims;
};

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

    //anims.push(flipAnimation);
  };

  //const anims = [];
  for (var i = 0; i < cardCollection.length; i++) {
    _loop4(i);
  }

  //return anims;
};

var endCardFlip = function endCardFlip(card, cardCollection, width, xDiff, yDiff, callback) {
  //const anims = [];
  //for(let i = 0; i < cardCollection.length; i++){
  //const card = cardCollection[i];
  var flipAnimation = new Animation({
    begin: 0,
    timeToFinish: 200,
    propsBegin: { width: 0, x: card.x, y: card.y },
    propsEnd: { width: width, x: card.x - xDiff, y: card.y - yDiff }
  }, true);
  card.bindAnimation(flipAnimation, function () {
    animateDeckWhenReady(cardCollection, callback);
  });
  //anims.push(flipAnimation);
  //}
  //return anims;
};

var flushCards = function flushCards(cardCollection, baseLineY, curveDown, sequentially, reverse, callback) {
  //const anims = [];
  for (var i = 0; i < cardCollection.length; i++) {
    var _card3 = cardCollection[i];
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

    var y = curveDown ? baseLineY + Math.max(Math.pow(Math.abs(distanceFromMiddle * 6), 1.3), 6) : baseLineY - Math.max(Math.pow(Math.abs(distanceFromMiddle * 6), 1.3), 6);

    var radians = curveDown ? distanceFromMiddle * 0.05 : distanceFromMiddle * -0.05;

    var flushAnim = new Animation({
      begin: sequentially ? (cardCollection.length - 1 - i) * 200 : 0,
      timeToFinish: sequentially ? 600 + (cardCollection.length - 1 - i) * 100 : 600,
      propsBegin: { x: _card3.x, y: _card3.y, radians: _card3.radians },
      propsEnd: { x: x, y: y, radians: radians }
    }, true);

    //anims.push(flushAnim);
    _card3.bindAnimation(flushAnim, function () {
      animateDeckWhenReady(cardCollection, callback);
      //animateDeckWhenReady(cardCollection, () => {
      //startCardFlip(cardCollection);
      //});
    });
  }

  if (reverse) {
    cardCollection.reverse();
  }
  //return anims;
};

var stackCards = function stackCards(cardCollection, expandRight, time, callback) {

  var baseX = expandRight ? 1080 : 670;
  var baseY = expandRight ? 535 : 300;
  for (var i = 0; i < cardCollection.length; i++) {
    var _card4 = cardCollection[i];

    var x = expandRight ? baseX + 40 * i : baseX - 40 * i;

    var stackAnim = new Animation({
      begin: 0,
      timeToFinish: time,
      propsBegin: { x: _card4.x, y: _card4.y, radians: _card4.radians },
      propsEnd: { x: x, y: baseY, radians: expandRight ? 0 : Math.PI }
    }, true);

    _card4.bindAnimation(stackAnim, function () {
      animateDeckWhenReady(cardCollection, callback);
    });
  }
};

var foldInCards = function foldInCards(cardCollection, x, y, callback) {
  for (var i = 0; i < cardCollection.length; i++) {
    var _card5 = cardCollection[i];

    var foldInAnim = new Animation({
      begin: 0,
      timeToFinish: 300,
      propsBegin: { x: _card5.x, y: _card5.y, radians: _card5.radians },
      propsEnd: { x: x, y: y, radians: 0 }
    }, true);

    _card5.bindAnimation(foldInAnim, function () {
      animateDeckWhenReady(cardCollection, callback);
    });
  }
};
"use strict";

//Construct the main game window (the canvas)
var GameWindow = function GameWindow(props) {
  return React.createElement("canvas", { id: "viewport", width: props.width, height: props.height });
};

var renderGame = function renderGame(width, height) {
  ReactDOM.render(React.createElement(GameWindow, { width: width, height: height }), document.querySelector("#main"));

  //Hook up viewport (display canvas) to JS code
  viewport = document.querySelector("#viewport");
  viewCtx = viewport.getContext('2d');
  viewport.addEventListener('mousemove', getMouse);
  viewport.addEventListener('mouseleave', processMouseLeave);
  viewport.addEventListener('click', processClick);
};

var disableDefaultForm = function disableDefaultForm(e) {
  e.preventDefault();
  return false;
};

var RoomWindow = function RoomWindow(props) {

  if (props.renderEmpty) {
    return React.createElement("div", null);
  }

  var rooms = props.rooms;

  if (rooms.length === 0) {
    rooms = [{ id: "No Rooms Available", count: 0 }];
  };

  var roomOptions = rooms.map(function (room) {
    var bgColor = "bg-secondary";
    return React.createElement(
      "a",
      { href: "#", className: "list-group-item list-group-item-action " + bgColor,
        "data-room": room.id, onClick: onRoomSelect },
      room.id,
      " ",
      room.count,
      "/2"
    );
  });

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

var renderRoomSelection = function renderRoomSelection(rooms, renderEmpty) {
  ReactDOM.render(React.createElement(RoomWindow, { rooms: rooms, renderEmpty: renderEmpty }), document.querySelector("#room"));
};

var ErrorMessage = function ErrorMessage(props) {
  return React.createElement(
    "div",
    { className: "alert alert-dismissible alert-danger" },
    React.createElement(
      "a",
      { href: "#", className: "close", "data-dismiss": "alert" },
      "\xD7"
    ),
    "Error: ",
    props.message
  );
};

var handleError = function handleError(message) {
  //$("#errorMessage").text(message);
  //$("#errorMessage").animate({ width: 'toggle' }, 350);
  ReactDOM.render(React.createElement(ErrorMessage, { message: message }), document.querySelector("#errorMessage"));
};

var redirect = function redirect(response) {
  //$("#domoMessage").animate({ width: 'hide' }, 350);
  window.location = response.redirect;
};

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
