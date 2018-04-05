"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Animation = function () {
  function Animation(logistics) {
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
    this.revealed = false;
    this.animation = null;
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
  var subDeckKeys = Object.keys(deck);
  for (var i = 0; i < subDeckKeys.length; i++) {
    var subDeck = deck[subDeckKeys[i]];
    for (var j = 0; j < subDeck.length; j++) {
      var card = subDeck[j];;
      card.update(time);

      var image = cardImageStruct[card.name];

      if (!card.isRevealed()) {
        image = cardImageStruct["back"];
      }

      prepCtx.save();
      prepCtx.translate(card.x + card.width / 2, card.y + card.height / 2);
      prepCtx.rotate(card.radians);

      prepCtx.drawImage(image, -card.width / 2, -card.height / 2, card.width, card.height);
      prepCtx.restore();
    }
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
var cardsLoaded = 0;
var animationFrame = void 0;
var deck = {};
var NULL_FUNC = function NULL_FUNC() {};

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

  //Construct the prep canvas (for building frames)
  prepCanvas = document.createElement('canvas');
  prepCanvas.width = "1920";
  prepCanvas.height = "1080";
  prepCtx = prepCanvas.getContext('2d');

  //Connect to the server via sockets
  socket = io.connect();

  //Attach custom socket events
  socket.on('loadBladeCards', loadBladeCards);
  socket.on('setDeck', setDeck);

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

  draw();

  animationFrame = requestAnimationFrame(update);
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

var chainAnimations = function chainAnimations(cardCollection, animationPackages) {

  animationPackages.reverse();
  var animations = animationPackages.map(function (pack) {
    return pack[0];
  });
  var params = animationPackages.map(function (pack) {
    return pack[1];
  });
  var animateTogether = animationPackages.map(function (pack) {
    return pack[2];
  });

  var funcChain = [NULL_FUNC];

  var _loop = function _loop(i) {
    var animationFuncs = animations[i];
    var paramList = params[i];

    var funcWrapper = function funcWrapper(card) {

      if (animateTogether[i]) {
        animateDeckWhenReady(cardCollection, function () {
          var anims = animationFuncs.apply(null, [cardCollection].concat(paramList));
          for (var j = 0; j < cardCollection.length; j++) {
            var _card = cardCollection[j];
            _card.bindAnimation(anims[j], funcChain[i]);
          }
        });
      } else {
        var anims = animationFuncs.apply(null, [cardCollection].concat(paramList));
        for (var j = 0; j < cardCollection.length; j++) {
          var _card2 = cardCollection[j];
          _card2.bindAnimation(anims[j], funcChain[i]);
        }
      }
    };
    funcChain.push(funcWrapper);
  };

  for (var i = 0; i < animations.length; i++) {
    _loop(i);
  }

  funcChain[funcChain.length - 1]();
};

var loadBladeCards = function loadBladeCards(cardImages) {
  var _loop2 = function _loop2(i) {
    var cardImage = cardImages[i];
    var image = new Image();

    image.onload = function () {
      cardImageStruct[cardImage.name] = image;

      cardsLoaded++;

      if (cardsLoaded >= cardImages.length) {
        socket.emit('requestDeck');
      }
    };

    image.src = cardImage.src;
  };

  for (var i = 0; i < cardImages.length; i++) {
    _loop2(i);
  }
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
        card = new Card(cardData.ref, { x: -200, y: -200 }, { width: _image.width, height: _image.height });
      } else {
        var _image2 = cardImageStruct["back"];
        card = new Card("back", { x: -200, y: -200 }, { width: _image2.width, height: _image2.height });
      }

      deck[key].push(card);
    }
  }

  //moveToPlayerDeck(deck.player1);
  //NOTE: Replace with more consistent value!
  var width = deck.player1[0].width;

  /*chainAnimations(deck.player1, [
    [moveToPlayerDeck, [], true],
    [flushCards, [770, true], true],
    [startCardFlip, [], true],
    [endCardFlip, [width], false]
  ]);*/
  moveToPlayerDeck(deck.player1, function () {
    flushCards(deck.player1, 770, true, function () {
      startCardFlip(deck.player1, false, function () {
        foldInCards(deck.player1, function () {
          startCardFlip(deck.player1, true, function () {
            startCardFlip(deck.player1, false, function () {
              flushCards(deck.player1, 770, true);
            });
          });
        });
      });
    });
  });

  //flushCards(deck.player1, 770, true);
};

var moveToPlayerDeck = function moveToPlayerDeck(cardCollection, callback) {
  //const anims = [];
  for (var i = 0; i < cardCollection.length; i++) {
    var card = cardCollection[i];
    var moveAnim = new Animation({
      begin: 100 * i,
      timeToFinish: 400,
      propsBegin: { x: -100, y: 770 },
      propsEnd: { x: 300, y: 770 }
    });
    card.bindAnimation(moveAnim, function () {
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
  }
  //return anims;
};

var startCardFlip = function startCardFlip(cardCollection, reverse, callback) {
  var _loop3 = function _loop3(i) {
    var card = cardCollection[i];
    var flipAnimation = new Animation({
      begin: reverse ? i * 50 : (cardCollection.length - 1 - i) * 50,
      timeToFinish: 200,
      propsBegin: { width: card.width },
      propsEnd: { width: 0 }
    });
    var width = card.width;
    card.bindAnimation(flipAnimation, function () {
      card.flip();
      endCardFlip(card, cardCollection, width, callback);
    });

    //anims.push(flipAnimation);
  };

  //const anims = [];
  for (var i = 0; i < cardCollection.length; i++) {
    _loop3(i);
  }

  //return anims;
};

var endCardFlip = function endCardFlip(card, cardCollection, width, callback) {
  //const anims = [];
  //for(let i = 0; i < cardCollection.length; i++){
  //const card = cardCollection[i];
  var flipAnimation = new Animation({
    begin: 0,
    timeToFinish: 200,
    propsBegin: { width: 0 },
    propsEnd: { width: width }
  });
  card.bindAnimation(flipAnimation, function () {
    animateDeckWhenReady(cardCollection, callback);
  });
  //anims.push(flipAnimation);
  //}
  //return anims;
};

var flushCards = function flushCards(cardCollection, baseLineY, curveDown, callback) {
  //const anims = [];
  for (var i = 0; i < cardCollection.length; i++) {
    var _card3 = cardCollection[i];
    var x = 1100 + 100 * (cardCollection.length / 2 - 1 - i);

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
      propsBegin: { x: _card3.x, y: _card3.y, radians: _card3.radians },
      propsEnd: { x: x, y: y, radians: radians }
    });

    //anims.push(flushAnim);
    _card3.bindAnimation(flushAnim, function () {
      animateDeckWhenReady(cardCollection, callback);
      //animateDeckWhenReady(cardCollection, () => {
      //startCardFlip(cardCollection);
      //});
    });
  }

  cardCollection.reverse();
  //return anims;
};

var foldInCards = function foldInCards(cardCollection, callback) {
  for (var i = 0; i < cardCollection.length; i++) {
    var _card4 = cardCollection[i];

    var foldInAnim = new Animation({
      begin: 0,
      timeToFinish: 300,
      propsBegin: { x: _card4.x, y: _card4.y, radians: _card4.radians },
      propsEnd: { x: 1100, y: 770, radians: 0 }
    });

    _card4.bindAnimation(foldInAnim, function () {
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
};
