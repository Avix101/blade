"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Animation = function () {
  function Animation(logistics) {
    _classCallCheck(this, Animation);

    var time = new Date().getTime();
    this.startTime = time;
    this.currentTime = time;
    this.begin = logistics.begin;
    this.timeToFinish = logistics.timeToFinish;
    this.propsBegin = logistics.propsBegin;
    this.propsEnd = logistics.propsEnd;
    this.propsCurrent = {};
    this.complete = false;

    var propKeys = Object.keys(this.propsBegin);
    for (var i = 0; i < propKeys.length; i++) {
      var key = propKeys[i];
      this.propsCurrent[key] = this.propsBegin[key];
    }
  }

  _createClass(Animation, [{
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
  function Card(name, location, size) {
    _classCallCheck(this, Card);

    this.name = name;
    this.x = location.x;
    this.y = location.y;
    this.width = size.width * 0.6;
    this.height = size.height * 0.6;
    this.radians = 0;
    this.animation = null;
    this.animCallback = null;
  }

  _createClass(Card, [{
    key: "bindAnimation",
    value: function bindAnimation(animation, callback) {
      this.animation = animation;

      if (callback) {
        this.animCallback = callback;
      } else {
        this.animCallback = null;
      }
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
        this.animCallback();
        this.animCallback = null;
      }
    }
  }, {
    key: "readyToAnimate",
    value: function readyToAnimate() {
      return this.animation === null;
    }
  }, {
    key: "update",
    value: function update(currentTime) {
      if (this.animation) {
        this.animation.update(currentTime);
        this.animation.copyVals(this);

        if (this.animation.complete) {
          this.endAnimation();
        }
      }
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

var draw = function draw() {
  clearCanvas(prepCanvas, prepCtx);

  prepCtx.drawImage(bladeMat, 0, 0, prepCanvas.width, prepCanvas.height);

  if (!cardImageStruct["back"]) {
    return;
  }

  var time = new Date().getTime();
  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    card.update(time);

    var image = cardImageStruct[card.name];

    prepCtx.save();
    prepCtx.translate(card.x + card.width / 2, card.y + card.height / 2);
    prepCtx.rotate(card.radians);
    prepCtx.drawImage(image, -card.width / 2, -card.height / 2, card.width, card.height);
    prepCtx.restore();
  }

  displayFrame();
};
"use strict";

var viewport = void 0,
    viewCtx = void 0,
    prepCanvas = void 0,
    prepCtx = void 0;
var socket = void 0,
    hash = void 0;
var bladeMat = void 0;
var animationFrame = void 0;
var cards = [];

var aspectRatio = 16 / 9;

//Calculate the appropriate viewport dimensions
var calcDisplayDimensions = function calcDisplayDimensions() {
  var width = window.innerWidth * 0.8;
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

  //Connect to the server via sockets
  socket = io.connect();

  //Construct the prep canvas (for building frames)
  prepCanvas = document.createElement('canvas');
  prepCanvas.width = "1920";
  prepCanvas.height = "1080";
  prepCtx = prepCanvas.getContext('2d');

  //Eventually switch to server call to load cards
  loadBladeCards([{ name: "back", src: "/assets/img/cards/00 Back.png" }]);

  animationFrame = requestAnimationFrame(update);
};

//Run the init function when the window loads
window.onload = init;

//Resize the viewport when the window resizes
window.addEventListener('resize', resizeGame);
"use strict";

var update = function update() {

  draw();

  animationFrame = requestAnimationFrame(update);
};

//REMOVE -- TESTING ONLY
var flushedCards = false;

var updateCards = function updateCards() {
  if (!flushedCards && cards[9].readyToAnimate()) {
    flushCards(cards, 770, true);
    flushedCards = true;
  }
};

var loadBladeCards = function loadBladeCards(cardImages) {
  var _loop = function _loop(i) {
    var cardImage = cardImages[i];
    var image = new Image();

    image.onload = function () {
      cardImageStruct[cardImage.name] = image;

      for (var _i = 0; _i < 10; _i++) {
        var card = new Card(cardImage.name, { x: -100, y: 800 }, { width: image.width, height: image.height });
        var moveAnim = new Animation({
          begin: 100 * _i,
          timeToFinish: 400,
          propsBegin: { x: -100 },
          propsEnd: { x: 300 }
        });
        card.bindAnimation(moveAnim, function () {
          updateCards();
        });
        cards.push(card);
      }
    };

    image.src = cardImage.src;
  };

  for (var i = 0; i < cardImages.length; i++) {
    _loop(i);
  }
};

var flushCards = function flushCards(cardCollection, baseLineY, curveDown) {

  for (var i = 0; i < cardCollection.length; i++) {
    var card = cardCollection[i];
    var x = 500 + 100 * (cardCollection.length - 1 - i);

    var middle = cardCollection.length / 2;
    var distanceFromMiddle = middle - i - 1;

    if (cardCollection.length % 2 === 0) {
      if (distanceFromMiddle < 0) {
        distanceFromMiddle = middle - i;
      }
    }

    var y = baseLineY + Math.max(Math.pow(Math.abs(distanceFromMiddle * 6), 1.3), 6);
    var radians = distanceFromMiddle * 0.05;

    var flushAnim = new Animation({
      begin: (cardCollection.length - 1 - i) * 200,
      timeToFinish: 600 + (cardCollection.length - 1 - i) * 100,
      propsBegin: { x: card.x, y: card.y, radians: card.radians },
      propsEnd: { x: x, y: y, radians: radians }
    });
    card.bindAnimation(flushAnim);
  }

  cards.reverse();
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
};
