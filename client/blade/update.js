const update = () => {
  
  checkCardCollisions();
  draw();
  
  animationFrame = requestAnimationFrame(update);
};

const processClick = (e) => {
  if(selectedCard){
    const playerHand = getPlayerHand();
    socket.emit('playCard', { index: playerHand.indexOf(selectedCard) });
    selectedCard = null;
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

const checkCardCollisions = () => {
  if(!readyToPlay){
    return;
  }
  
  const playerHand = getPlayerHand();
  
  let newSelection = null;
  for(let i = 0; i < playerHand.length; i++){
    const card = playerHand[i];
    
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
    selectCard(selectedCard, NULL_FUNC);
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
  console.log(data);
  renderRoomSelection(data.rooms, false);
};

const onRoomSelect = (e) => {
  const roomId = document.querySelector("#roomName");
  const select = document.querySelector("#roomOptions");
  roomId.value = select.options[select.selectedIndex].value;
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

const getPlayerHand = () => {
  if(playerStatus === 'player1'){
    return deck.player1;
  } else if(playerStatus === 'player2'){
    return deck.player2;
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
  ]);
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
    readyToPlay = true;
  });
};

const playCard = (data) => {
  const cardSet = deck[data.cardSet];
  const card = cardSet[data.index];
  cardSet.splice(data.index, 1);
  
  if(!fields[data.cardSet]){
    fields[data.cardSet] = [];
  }
  
  fields[data.cardSet].push(card);
  moveTo([card], 1000, 500, 500, false);
  deck[data.cardSet].reverse();
  flushCards(deck[data.cardSet], 770, true, false, true, () => { 
    for(let i = 0; i < deck[data.cardSet].length; i++){
      const card = deck[data.cardSet][i];
      card.originalLocation = {x: card.x, y: card.y};
    }
    readyToPlay = true; 
  });
  readyToPlay = false;
}

const selectCard = (card, unselect, callback) => {
  const yMod = Math.cos(card.radians) * 60;
  const xMod = Math.sin(card.radians) * 60;
  const moveAnim = new Animation(
    {
      begin: 0,
      timeToFinish: 200,
      propsBegin: {x: card.x, y: card.y, hueRotate: card.hueRotate},
      propsEnd: {x: card.originalLocation.x - xMod, y: card.originalLocation.y - yMod, hueRotate: 90}, 
    }
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
    }
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
      }
    );
    card.bindAnimation(moveAnim, () => {
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
      }
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
    }
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
      }
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

const foldInCards = (cardCollection, x, y, callback) => {
  for(let i = 0; i < cardCollection.length; i++){
    const card = cardCollection[i];
    
    const foldInAnim = new Animation(
      {
        begin: 0,
        timeToFinish: 300,
        propsBegin: {x: card.x, y: card.y, radians: card.radians},
        propsEnd: {x, y, radians: 0},
      }
    );
    
    card.bindAnimation(foldInAnim, () => {
      animateDeckWhenReady(cardCollection, callback);
    });
  }
};