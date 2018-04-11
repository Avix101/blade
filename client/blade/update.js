const update = () => {
  
  if(blastSelect){
    checkCardCollisions(getOpponentHand(), false);
  } else {
    checkCardCollisions(getPlayerHand(), true);
  }
  draw();
  
  animationFrame = requestAnimationFrame(update);
};

const processClick = (e) => {
  if(selectedCard && !gameState.winner && !gameState.waiting){
    switch(gameState.turnType){
      case "pickFromDeck":
        unselectCard(selectedCard);
        socket.emit('pickFromDeck');
        selectedCard = null;
        break;    
      case "playCard":
        const playerHand = getPlayerHand();
        
        if(selectedCard.name === "blast" && !blastSelect){
          blastSelect = true;
          playerBlastCard = selectedCard;
          selectedCard = null;
          updateReadyStatus(false);
          return;
        } else if (blastSelect){
          blastSelect = false;
          const opponentHand = getOpponentHand();
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

const processMouseLeave = (e) => {
  mousePos = {
    x: -200,
    y: -200,
  };
};

const getMouse = (e) => {
  const rect = viewport.getBoundingClientRect();
  const widthRatio = rect.width / prepCanvas.width;
  const heightRatio = rect.height / prepCanvas.height;
  mousePos = {
    x: (e.clientX - rect.left) / widthRatio,
    y: (e.clientY - rect.top) / heightRatio,
  }
}

const pointInRect = (rect, point) => {
  if(point.x > rect.x && point.x < rect.x + rect.width){
    if(point.y > rect.y && point.y < rect.y + rect.height){
      return true;
    }
  }
  
  return false;
};

const rotatePoint = (point, anchor, radians) => {
  const translatedPoint = {x: point.x - anchor.x, y: point.y - anchor.y};
  
  const sin = Math.sin(-radians);
  const cos = Math.cos(-radians);
  
  const newX = (translatedPoint.x * cos) - (translatedPoint.y * sin);
  const newY = (translatedPoint.x * sin) + (translatedPoint.y * cos);
  
  return {x: newX + anchor.x, y: newY + anchor.y};
};

const checkCardCollisions = (cardCollection, selectPlayer) => {
  if(!readyToPlay || gameState.winner !== null || gameState.waiting){
    return;
  }
  
  if(gameState.turnType === "pickFromDeck"){
    const topCard = getTopDeckCard();
    if(topCard){
      cardCollection = [topCard];
    } else {
      cardCollection = [];
    } 
  }
  
  let newSelection = null;
  for(let i = 0; i < cardCollection.length; i++){
    const card = cardCollection[i];
    
    const cardCenter = {x: card.x + (card.width / 2), y: card.y + (card.height / 2)};
    const rotatedPoint = rotatePoint(mousePos, cardCenter, card.radians);
    
    if(pointInRect(card, rotatedPoint)){
      newSelection = card;
    }
  }
  
  if(newSelection && newSelection !== selectedCard){
    
    if(selectedCard){
      unselectCard(selectedCard, NULL_FUNC);
    }
    
    selectedCard = newSelection;
    selectCard(selectedCard, selectPlayer, NULL_FUNC);
  } else if(!newSelection && selectedCard !== null) {
    unselectCard(selectedCard, NULL_FUNC);
    selectedCard = null;
  }
}

const animateDeckWhenReady = (cardCollection, callback) => {
  for(let i = 0; i < cardCollection.length; i++){
    const card = cardCollection[i];
    if(!card.readyToAnimate()){
      return;
    }
  }
  
  if(callback){
    callback();
  }
};

const chainAnimations = (animationPackages, finalCallback) => {
  animationPackages.reverse();
  const animList = animationPackages.map((pack) => pack[0]);
  const paramList = animationPackages.map((pack) => pack[1]);
  const callbacks = [ finalCallback ];
  
  for(let i = 0; i < animationPackages.length; i++){
    const newCallback = () => {
      animList[i].apply(this, paramList[i].concat(callbacks[i]));
    }
    callbacks.push(newCallback);
  }
  
  callbacks[animationPackages.length]();
};

const loadBladeCards = (cardImages) => {
  
  for(let i = 0; i < cardImages.length; i++){
    const cardImage = cardImages[i];
    const image = new Image();
    
    image.onload = () => {
      cardImageStruct[cardImage.name] = image;
      
      cardsLoaded++;
      
      if(cardsLoaded >= cardImages.length){
        //socket.emit('requestDeck');
      }
    }
    
    image.src = cardImage.src;
  }
};

const roomOptions = (data) => {
  if(!inRoom){
    
    if(pageView === "#blade"){
      renderRoomSelection(data.rooms, false);
    }
    
    setTimeout(() => {
      socket.emit('getRooms');
    }, 10);
  }
};

const onRoomSelect = (e) => {
  const roomId = document.querySelector("#roomName");
  roomId.value = e.target.getAttribute('data-room');
};

const createRoom = (e) => {
  socket.emit('createRoom');
};

const joinRoom = (e) => {
  const roomId = document.querySelector("#roomName").value;
  socket.emit('joinRoom', {room: roomId});
};

const roomJoined = (data) => {
  playerStatus = data.status;
  inRoom = true;
  
  const subDeckKeys = Object.keys(deck);
  for(let i = 0; i < subDeckKeys.length; i++){
    const key = subDeckKeys[i];
    deck[key] = [];
  }
  
  fields = {
    'player1': [],
    'player2': [],
  };
  
  gameState.turnType = "pickFromDeck";
  gameState.turnOwner = null;
  gameState.player1Points = 0;
  gameState.player2Points = 0;
  gameState.winner = null;
  gameState.waiting = false;
  
  renderRoomSelection([], true);
}

const setDeck = (data) => {
  
  const subDeckKeys = Object.keys(data);
  for(let i = 0; i < subDeckKeys.length; i++){
    const key = subDeckKeys[i];
    deck[key] = [];
    for(let j = 0; j < data[key].length; j++){
      const cardData = data[key][j];
      let card;
      
      if(cardData){
        const image = cardImageStruct[cardData.ref];
        card = new Card(cardData.ref, cardData.sortValue, {x: -200, y: -200}, {width: image.width, height: image.height});
      } else {
        const image = cardImageStruct["back"];
        card = new Card("back", 0, {x: -200, y: -200}, {width: image.width, height: image.height});
      }
      
      deck[key].push(card);
    }
  }
  
  if(playerStatus === 'player1'){
    initPlayerDeck(deck.player1, deck.p1Deck);
    initOpponentDeck(deck.player2, deck.p2Deck);
  } else if(playerStatus === 'player2'){
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

const getTopDeckCard = () => {
  if(playerStatus === 'player1'){
    return deck.p1Deck[deck.p1Deck.length - 1];
  } else if(playerStatus === 'player2'){
    return deck.p2Deck[deck.p2Deck.length - 1];
  }
};

const getPlayerDeck = () => {
  if(playerStatus === 'player1'){
    return deck.p1Deck;
  } else if(playerStatus === 'player2'){
    return deck.p2Deck;
  }
};

const getOpponentDeck = () => {
  if(playerStatus === 'player1'){
    return deck.p2Deck;
  } else if(playerStatus === 'player2'){
    return deck.p1Deck;
  }
};

const getPlayerField = () => {
  if(playerStatus === 'player1'){
    return fields['player1'];
  } else if(playerStatus === 'player2'){
    return fields['player2'];
  }
};

const getOpponentField = () => {
  if(playerStatus === 'player1'){
    return fields['player2'];
  } else if(playerStatus === 'player2'){
    return fields['player1'];
  }
};

const getPlayerHand = () => {
  if(playerStatus === 'player1'){
    return deck.player1;
  } else if(playerStatus === 'player2'){
    return deck.player2;
  }
};

const getOpponentHand = () => {
  if(playerStatus === 'player1'){
    return deck.player2;
  } else if(playerStatus === 'player2'){
    return deck.player1;
  }
};

const getPlayerPoints = () => {
  if(playerStatus === 'player1'){
    return gameState.player1Points;
  } else if(playerStatus === 'player2'){
    return gameState.player2Points;
  }
};

const getOpponentPoints = () => {
  if(playerStatus === 'player1'){
    return gameState.player2Points;
  } else if(playerStatus === 'player2'){
    return gameState.player1Points;
  }
};

const initPlayerDeck = (playerHand, playerDeck) => {
  chainAnimations([
    [moveTo, [playerHand.concat(playerDeck), -200, 800, 0, false]],
    [moveTo, [playerHand.concat(playerDeck), 300, 800, 400, true]],
    [flushCards, [playerHand, 770, true, true, true]],
    [startCardFlip, [playerHand, false]],
    [foldInCards, [playerHand, 1100, 770]],
    [startCardFlip, [playerHand, true]]
    
  ], () => {
    socket.emit('sortDeck');
  });
};

const initOpponentDeck = (opponentHand, opponentDeck) => {
  chainAnimations([
    [moveTo, [opponentHand.concat(opponentDeck), -200, 40, 0, false]],
    [moveTo, [opponentHand.concat(opponentDeck), 300, 40, 400, true]],
    [flushCards, [opponentHand, 70, false, true, true]],
    [foldInCards, [opponentHand, 1100, 70]],
    [flushCards, [opponentHand, 70, false, false, true]],
  ], () => {
    for(let i = 0; i < opponentHand.length; i++){
      const card = opponentHand[i];
      card.originalLocation = {x: card.x, y: card.y};
    }
  });
};

let confirmReady = 0;
const updateReadyStatus = (status) => {
  if(readyToPlay === status || Object.keys(deck).length <= 0){
    return;
  } else {
    confirmReady++;
    
    if(confirmReady >= 10 && status){
      readyToPlay = status;
      socket.emit('ready', {status});
      confirmReady = 0;
    } else if(!status){
      readyToPlay = status;
      socket.emit('ready', {status});
      confirmReady = 0;
    }
  }
}

const sortDeck = (data) => {
  let playerHand = getPlayerHand();
  
  playerHand = playerHand.sort((cardA, cardB) => {
    return cardB.sortValue - cardA.sortValue;
  });
  
  chainAnimations([
    [startCardFlip, [playerHand, false]],
    [flushCards, [playerHand, 770, true, false, true]]
  ], () => {
    for(let i = 0; i < playerHand.length; i++){
      const card = playerHand[i];
      card.originalLocation = {x: card.x, y: card.y};
    }
  });
};

const pickFromDeck = (data) => {
  const player = data.player;
  gameState.waiting = false;
  
  if(playerStatus === player){
    const playerDeck = getPlayerDeck();
    const index = playerDeck.length - 1;
    const card = playerDeck[index];
    
    if(selectedCard === card){
      selectedCard = null;
    }
    
    fields[player].push(card);
    playerDeck.splice(index, 1);
    card.reveal(data.card.ref);
    
    stackCards(fields[player], true, 500, () => {
      animateDeckWhenReady(fields[player], () => {
        startCardFlip([card], false);
      });
    });
  } else {
    const opponentDeck = getOpponentDeck();
    const index = opponentDeck.length - 1;
    const card = opponentDeck[index];
    
    fields[player].push(card);
    opponentDeck.splice(index, 1);
    card.reveal(data.card.ref);
    
    card.flipImage();
    
    stackCards(fields[player], false, 500, () => {
      animateDeckWhenReady(fields[player], () => {
        startCardFlip([card], false);
      });
    });
  }
};

const splicePlayerCard = (cardSet, index) => {
  cardSet.splice(index, 1);
  cardSet.reverse();
  flushCards(cardSet, 770, true, false, true, () => { 
    for(let i = 0; i < cardSet.length; i++){
      const card = cardSet[i];
      card.originalLocation = {x: card.x, y: card.y};
    }
  });
};

const spliceOpponentCard = (cardSet, index) => {
  cardSet.splice(index, 1);
  cardSet.reverse();
  flushCards(cardSet, 70, false, false, true, () => { 
    for(let i = 0; i < cardSet.length; i++){
      const card = cardSet[i];
      card.originalLocation = {x: card.x, y: card.y};
    }
  });
};

const turnAccepted = () => {
  gameState.waiting = true;
}

const playCard = (data) => {
  const cardSet = deck[data.cardSet];
  const card = cardSet[data.index];
  
  console.log(data);
  
  gameState.waiting = false;
  
  if(selectedCard === card){
    unselectCard(selectedCard);
    selectedCard = null;
  }
  
  //moveTo([card], 1000, 500, 500, false);
  if(deck[data.cardSet] === getPlayerHand()){
    switch(card.name){
      case "bolt":
        selectCard(card, true, () => {
          splicePlayerCard(cardSet, data.index);
        });
        const opponentField = getOpponentField();
        const target = opponentField[opponentField.length - 1];
        startCardFlip([target], false);
        break;
      case "mirror":
        selectCard(card, true, () => {
          splicePlayerCard(cardSet, data.index);
        });
        const temp = getPlayerField();
        if(playerStatus === 'player1'){
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
        if(data.blastIndex > -1 ){
          selectCard(card, true, () => {
            const opponentHand = getOpponentHand();
            spliceOpponentCard(opponentHand, data.blastIndex);
            splicePlayerCard(cardSet, data.index);
          });
        }
        break;
      case "1":
        const playerField = getPlayerField();
        const affectedCard = playerField[playerField.length - 1];
        if(!affectedCard.isRevealed()){
          selectCard(card, true, () => {
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
    
    switch(data.name){
      case "bolt":
        selectCard(card, true, () => {
          startCardFlip([card], false, () => {
            const playerField = getPlayerField();
            const target = playerField[playerField.length - 1];
            startCardFlip([target], false);
            
            //Animate or timeout so that opponent can actually see move
            spliceOpponentCard(cardSet, data.index);
          });
        });
        
        break;
      case "mirror":
        selectCard(card, true, () => {
          startCardFlip([card], false, () => {
            const temp = getPlayerField();
            if(playerStatus === 'player1'){
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
        if(data.blastIndex > -1 ){
          selectCard(card, false, () => {
            startCardFlip([card], false, () => {
              const playerHand = getPlayerHand();
              spliceOpponentCard(cardSet, data.index);
              splicePlayerCard(playerHand, data.blastIndex);
            });
          });
        }
        break;
      case "1":
        const opponentField = getOpponentField();
        const affectedCard = opponentField[opponentField.length - 1];
        if(!affectedCard.isRevealed()){
          selectCard(card, true, () => {
            startCardFlip([affectedCard], false, () => {
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
        stackCards(fields[data.cardSet], false, 500, () => {
          animateDeckWhenReady(fields[data.cardSet], () => {
            startCardFlip([card], false);
          });
        });
        break;
    }
  }
};

const endGame = () => {
  readyToPlay = false;
  selectedCard = null;
  playerBlastCard = null;

  inRoom = false;
  blastSelect = false;
  
  roomOptions({rooms: []});
};

const updateGamestate = (data) => {
  const keys = Object.keys(data);
  
  gameState.waiting = false;
  
  for(let i = 0; i < keys.length; i++){
    const key = keys[i];
    gameState[key] = data[key];
  }
  
  if(gameState.clearFields === true){
    clearFields();
  }
  
  if(gameState.winner !== null){
    endGame();
  }
  
  updateReadyStatus(false);
}

const clearFields = () => {
  const playerField = getPlayerField();
  const opponentField = getOpponentField();
  for(let i = 0; i < playerField.length; i++){
    const card = playerField[i];
    const moveAnim = new Animation(
      {
        begin: 0,
        timeToFinish: 600,
        propsBegin: {x: card.x},
        propsEnd: {x: prepCanvas.width + 100},
      }, true
    );
    
    card.bindAnimation(moveAnim, () => {
      animateDeckWhenReady(playerField, () => {
        gameState.clearFields = false;
        playerField.splice(0, playerField.length);
      });
    });
  }
  
  for(let i = 0; i < opponentField.length; i++){
    const card = opponentField[i];
    const moveAnim = new Animation(
      {
        begin: 0,
        timeToFinish: 600,
        propsBegin: {x: card.x},
        propsEnd: {x: -100},
      }, true
    );
    
    card.bindAnimation(moveAnim, () => {
      animateDeckWhenReady(opponentField, () => {
        gameState.clearFields = false;
        opponentField.splice(0, opponentField.length);
      });
    });
  }
}

const selectCard = (card, playerSelect, callback) => {
  let yMod = Math.cos(card.radians) * 60;
  let xMod = Math.sin(card.radians) * 60;
  if(!playerSelect){
    xMod *= -1;
    yMod *= -1;
  }
  const moveAnim = new Animation(
    {
      begin: 0,
      timeToFinish: 200,
      propsBegin: {x: card.x, y: card.y, hueRotate: card.hueRotate},
      propsEnd: {x: card.originalLocation.x - xMod, y: card.originalLocation.y - yMod, hueRotate: 90}, 
    }, false
  );
  
  card.bindAnimation(moveAnim, callback);
};

const unselectCard = (card, callback) => {
  const moveAnim = new Animation(
    {
      begin: 0,
      timeToFinish: 200,
      propsBegin: {x: card.x, y: card.y, hueRotate: card.hueRotate},
      propsEnd: {x: card.originalLocation.x, y: card.originalLocation.y, hueRotate: 0},
    }, false
  );
  
  card.bindAnimation(moveAnim, callback);
};

const moveTo = (cardCollection, x, y, time, offset, callback) => {
  //const anims = [];
  for(let i = 0; i < cardCollection.length; i++){
    const card = cardCollection[i];
    const moveAnim = new Animation(
      {
        begin: offset ? 100 * i : 0,
        timeToFinish: time,
        propsBegin: {x: card.x, y: card.y},
        propsEnd:  {x, y},
      }, true
    );
    card.bindAnimation(moveAnim, () => {
      card.originalLocation = {x: card.x, y: card.y};
      animateDeckWhenReady(cardCollection, () => {
        //cardCollection.reverse();
        if(callback){
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

const startCardFlip = (cardCollection, reverse, callback) => {
  //const anims = [];
  for(let i = 0; i < cardCollection.length; i++){
    const card = cardCollection[i];
    const distance = card.width / 2;
    const xDiff = distance;
    const yDiff = Math.sin(card.radians) * distance;
    const flipAnimation = new Animation(
      {
        begin: reverse ? i * 50 : (cardCollection.length - 1 - i) * 50,
        timeToFinish: 200,
        propsBegin: {width: card.width, x: card.x, y: card.y},
        propsEnd: {width: 0, x: xDiff + card.x, y: yDiff + card.y},
      }, true
    );
    const width = card.width;
    card.bindAnimation(flipAnimation, () => {
      card.flip();
      endCardFlip(card, cardCollection, width, xDiff, yDiff, callback)
    });
    
    //anims.push(flipAnimation);
  }
  
  //return anims;
};

const endCardFlip = (card, cardCollection, width, xDiff, yDiff, callback) => {
  //const anims = [];
  //for(let i = 0; i < cardCollection.length; i++){
  //const card = cardCollection[i];
  const flipAnimation = new Animation(
    {
      begin: 0,
      timeToFinish: 200,
      propsBegin: {width: 0, x: card.x, y: card.y},
      propsEnd: {width, x: card.x - xDiff, y: card.y - yDiff},
    }, true
  );
  card.bindAnimation(flipAnimation, () => {
    animateDeckWhenReady(cardCollection, callback);
  });
    //anims.push(flipAnimation);
  //}
  //return anims;
};

const flushCards = (cardCollection, baseLineY, curveDown, sequentially, reverse, callback) => {
  //const anims = [];
  for(let i = 0; i < cardCollection.length; i++){
    const card = cardCollection[i];
    const x = 1100 + (100 * (cardCollection.length / 2 - 1 - i));
    
    const middle = Math.floor((cardCollection.length / 2));
    let distanceFromMiddle = middle - i;
    
    if(cardCollection.length % 2 === 0){
      if(distanceFromMiddle < 0){
        distanceFromMiddle = middle - i;
      } else {
        distanceFromMiddle = middle - i - 1;
      }
    }
    
    const y = 
      curveDown ? baseLineY + Math.max(Math.pow(Math.abs(distanceFromMiddle * 6), 1.3), 6)
      : baseLineY - Math.max(Math.pow(Math.abs(distanceFromMiddle * 6), 1.3), 6);
      
    const radians = curveDown ? distanceFromMiddle * 0.05 : distanceFromMiddle * -0.05;
    
    const flushAnim = new Animation(
      {
        begin: sequentially ? (cardCollection.length - 1 - i) * 200 : 0,
        timeToFinish: sequentially ? 600 + (cardCollection.length - 1 - i) * 100 : 600,
        propsBegin: {x: card.x, y: card.y, radians: card.radians},
        propsEnd: {x, y, radians},
      }, true
    );
    
    //anims.push(flushAnim);
    card.bindAnimation(flushAnim, () => {
      animateDeckWhenReady(cardCollection, callback);
      //animateDeckWhenReady(cardCollection, () => {
        //startCardFlip(cardCollection);
      //});
    });
  }
  
  if(reverse){
    cardCollection.reverse();
  }
  //return anims;
};

const stackCards = (cardCollection, expandRight, time, callback) => {
  
  const baseX = expandRight ? 1080 : 670;
  const baseY = expandRight ? 535 : 300;
  for(let i = 0; i < cardCollection.length; i++){
    const card = cardCollection[i];
    
    const x = expandRight ? baseX + (40 * i) : baseX - (40 * i);
    
    const stackAnim = new Animation(
      {
        begin: 0,
        timeToFinish: time,
        propsBegin: {x: card.x, y: card.y, radians: card.radians},
        propsEnd: {x, y: baseY, radians: expandRight ? 0 : Math.PI},
      }, true
    );
    
    card.bindAnimation(stackAnim, () => {
      animateDeckWhenReady(cardCollection, callback);
    });
  }
};

const foldInCards = (cardCollection, x, y, callback) => {
  for(let i = 0; i < cardCollection.length; i++){
    const card = cardCollection[i];
    
    const foldInAnim = new Animation(
      {
        begin: 0,
        timeToFinish: 300,
        propsBegin: {x: card.x, y: card.y, radians: card.radians},
        propsEnd: {x, y, radians: 0},
      }, true
    );
    
    card.bindAnimation(foldInAnim, () => {
      animateDeckWhenReady(cardCollection, callback);
    });
  }
};