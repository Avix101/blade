//The main update call which runs ideally 60 times a second
const update = () => {
  
  //Check for card collisions with the mouse depending on the current state
  if(blastSelect){
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
const processClick = (e) => {
  //Depending on the gamestate, unselect a card, and update the ready status
  if(selectedCard && !gameState.winner && !gameState.waiting){
    switch(gameState.turnType){
      case "pickFromDeck":
        unselectCard(selectedCard);
        socket.emit('pickFromDeck');
        selectedCard = null;
        break;    
      case "playCard":
        const playerHand = getPlayerHand();
        
        if(selectedCard.name === "blast" && !blastSelect && playerStatus === gameState.turnOwner){
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

//Update the mouse position if it leaves the canvas
const processMouseLeave = (e) => {
  mousePos = {
    x: -200,
    y: -200,
  };
};

//Get the mouse position relative to the position of the canvas
const getMouse = (e) => {
  const rect = viewport.getBoundingClientRect();
  const widthRatio = rect.width / prepCanvas.width;
  const heightRatio = rect.height / prepCanvas.height;
  mousePos = {
    x: (e.clientX - rect.left) / widthRatio,
    y: (e.clientY - rect.top) / heightRatio,
  }
}

//Determine if a given point is inside a given rectangle
const pointInRect = (rect, point) => {
  if(point.x > rect.x && point.x < rect.x + rect.width){
    if(point.y > rect.y && point.y < rect.y + rect.height){
      return true;
    }
  }
  
  return false;
};

//Rotate a point around an anchor a number of radians
//Used to calculate collisions with rotated cards
const rotatePoint = (point, anchor, radians) => {
  const translatedPoint = {x: point.x - anchor.x, y: point.y - anchor.y};
  
  const sin = Math.sin(-radians);
  const cos = Math.cos(-radians);
  
  const newX = (translatedPoint.x * cos) - (translatedPoint.y * sin);
  const newY = (translatedPoint.x * sin) + (translatedPoint.y * cos);
  
  return {x: newX + anchor.x, y: newY + anchor.y};
};

//Check to see if the mouse is colliding with any cards
const checkCardCollisions = (cardCollection, selectPlayer) => {
  if(!readyToPlay || gameState.winner !== null || gameState.waiting){
    return;
  }
  
  //Allow the player to pick from their deck
  if(gameState.turnType === "pickFromDeck"){
    const topCard = getTopDeckCard();
    if(topCard){
      cardCollection = [topCard];
    } else {
      cardCollection = [];
    } 
  }
  
  //Check the player (or opponents) hand
  let newSelection = null;
  for(let i = 0; i < cardCollection.length; i++){
    const card = cardCollection[i];
    
    const cardCenter = {x: card.x + (card.width / 2), y: card.y + (card.height / 2)};
    const rotatedPoint = rotatePoint(mousePos, cardCenter, card.radians);
    
    if(pointInRect(card, rotatedPoint)){
      newSelection = card;
    }
  }
  
  //Select / unselect cards depending on the collision status
  if(newSelection && newSelection !== selectedCard){
    
    if(selectedCard){
      unselectCard(selectedCard, NULL_FUNC);
    }
    
    selectedCard = newSelection;
    selectCard(selectedCard, selectPlayer, false, NULL_FUNC);
  } else if(!newSelection && selectedCard !== null) {
    unselectCard(selectedCard, NULL_FUNC);
    selectedCard = null;
  }
}

//Animate the whole deck when all of the cards are ready to be animated
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

//Chain animations together so each executes after the last one
const chainAnimations = (animationPackages, finalCallback) => {
  animationPackages.reverse();
  const animList = animationPackages.map((pack) => pack[0]);
  const paramList = animationPackages.map((pack) => pack[1]);
  const callbacks = [ finalCallback ];
  
  //Build a chain of functions to get called by earlier functions
  for(let i = 0; i < animationPackages.length; i++){
    const newCallback = () => {
      animList[i].apply(this, paramList[i].concat(callbacks[i]));
    }
    callbacks.push(newCallback);
  }
  
  callbacks[animationPackages.length]();
};

//Load all of the blade card images for later drawing usage
const loadBladeCards = (cardImages) => {
  
  for(let i = 0; i < cardImages.length; i++){
    const cardImage = cardImages[i];
    const image = new Image();
    
    image.onload = () => {
      cardImageStruct[cardImage.name] = image;
    }
    
    image.src = cardImage.src;
  }
};

//Notify the player if the game result was stored on the server
const notifyGameData = (data) => {
  if(data.saved){
    handleSuccess("Game result successfully stored on server! (Check profile page)");
  } else {
    handleError("Game result could not be stored! (contact server admin)");
  }
};

//Process room options sent from the server
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

//When a room is selected from the existing rooms list, paste the code into the room join bar
const onRoomSelect = (e) => {
  const roomId = document.querySelector("#roomName");
  roomId.value = e.target.getAttribute('data-room');
};

//Request to create a new room
const createRoom = (e) => {
  socket.emit('createRoom');
};

//Request to join an existing room
const joinRoom = (e) => {
  const roomId = document.querySelector("#roomName").value;
  socket.emit('joinRoom', {room: roomId});
};

//When a room is joined, prepare for a new game
const roomJoined = (data) => {
  playerStatus = data.status;
  inRoom = true;
  addToChat(`You have joined room: ${data.room}`);
  
  const subDeckKeys = Object.keys(deck);
  for(let i = 0; i < subDeckKeys.length; i++){
    const key = subDeckKeys[i];
    deck[key] = [];
  }
  
  fields = {
    'player1': [],
    'player2': [],
  };
  
  playerProfiles = {};
  
  gameState.turnType = "begin";
  gameState.turnOwner = null;
  gameState.player1Points = 0;
  gameState.player2Points = 0;
  gameState.winner = null;
  gameState.waiting = false;
  
  renderRoomSelection([], true);
}

//When player profile data is received request follow-up information and build the player profiles
const loadPlayerProfiles = (data) => {
  
  if(data.player1){
    sendAjax('GET', '/getProfile', `profile=${data.player1.profile}`, (profileData) => {
      const image = new Image();
      image.onload = () => {
        playerProfiles['player1'] = {
          charImage: image,
          username: data.player1.username,
        }
      };
      
      image.src = profileData.imageFile;
    });
  }
  
  if(data.player2){
    sendAjax('GET', '/getProfile', `profile=${data.player2.profile}`, (profileData) => {
      const image = new Image();
      image.onload = () => {
        playerProfiles['player2'] = {
          charImage: image,
          username: data.player2.username,
        }
      };
      
      image.src = profileData.imageFile;
    });
  }
};

//Process a response from the server holding deck information
const setDeck = (data) => {
  
  const subDeckKeys = Object.keys(data);
  for(let i = 0; i < subDeckKeys.length; i++){
    const key = subDeckKeys[i];
    deck[key] = [];
    for(let j = 0; j < data[key].length; j++){
      const cardData = data[key][j];
      let card;
      
      //Construct new cards
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
  
  //Start building both decks
  if(playerStatus === 'player1'){
    initPlayerDeck(deck.player1, deck.p1Deck);
    initOpponentDeck(deck.player2, deck.p2Deck);
  } else if(playerStatus === 'player2'){
    initPlayerDeck(deck.player2, deck.p2Deck);
    initOpponentDeck(deck.player1, deck.p1Deck);
  }
};

//Gets the player's profile
const getPlayerProfile = () => {
  if(playerStatus === 'player1'){
    return playerProfiles['player1'];
  } else if(playerStatus === 'player2'){
    return playerProfiles['player2'];
  }
};

//Gets the opponent's profile
const getOpponentProfile = () => {
  if(playerStatus === 'player1'){
    return playerProfiles['player2'];
  } else if(playerStatus === 'player2'){
    return playerProfiles['player1'];
  }
};

//Gets the top card from the player's deck
const getTopDeckCard = () => {
  if(playerStatus === 'player1'){
    return deck.p1Deck[deck.p1Deck.length - 1];
  } else if(playerStatus === 'player2'){
    return deck.p2Deck[deck.p2Deck.length - 1];
  }
};

//Gets the players deck
const getPlayerDeck = () => {
  if(playerStatus === 'player1'){
    return deck.p1Deck;
  } else if(playerStatus === 'player2'){
    return deck.p2Deck;
  }
};

//Gets the opponent's deck
const getOpponentDeck = () => {
  if(playerStatus === 'player1'){
    return deck.p2Deck;
  } else if(playerStatus === 'player2'){
    return deck.p1Deck;
  }
};

//Gets the players field (cards on the field)
const getPlayerField = () => {
  if(playerStatus === 'player1'){
    return fields['player1'];
  } else if(playerStatus === 'player2'){
    return fields['player2'];
  }
};

//Gets the opponent's field (cards on the field)
const getOpponentField = () => {
  if(playerStatus === 'player1'){
    return fields['player2'];
  } else if(playerStatus === 'player2'){
    return fields['player1'];
  }
};

//Gets the player's hand
const getPlayerHand = () => {
  if(playerStatus === 'player1'){
    return deck.player1;
  } else if(playerStatus === 'player2'){
    return deck.player2;
  }
};

//Gets the opponent's hand
const getOpponentHand = () => {
  if(playerStatus === 'player1'){
    return deck.player2;
  } else if(playerStatus === 'player2'){
    return deck.player1;
  }
};

//Gets the player's points
const getPlayerPoints = () => {
  if(playerStatus === 'player1'){
    return gameState.player1Points;
  } else if(playerStatus === 'player2'){
    return gameState.player2Points;
  }
};

//Gets the opponent's points
const getOpponentPoints = () => {
  if(playerStatus === 'player1'){
    return gameState.player2Points;
  } else if(playerStatus === 'player2'){
    return gameState.player1Points;
  }
};

//Animate the player's deck
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

//Animate the opponent's deck
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

//Update the player's ready status (for updates)
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

//Sort the player's deck and animate it
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

//process a call from the server to pick the top card from the deck
const pickFromDeck = (data) => {
  const player = data.player;
  gameState.waiting = false;
  
  //Animate differently depending on if the card is the player's or the opponent's
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

//Remove a card from the player's hand and flush the remaining cards in their hand
const splicePlayerCard = (cardSet, index) => {
  cardSet.splice(index, 1);
  cardSet.reverse();
  
  //Reset cards to their original position (cancel selection)
  for(let i = 0; i < cardSet.length; i++){
    const card = cardSet[i];
    
    if(selectedCard === card){
      card.cancelAnimation();
      selectedCard = null;
    }
    
    card.x = card.originalLocation.x;
    card.y = card.originalLocation.y;
  }
  
  flushCards(cardSet, 770, true, false, true, () => { 
    for(let i = 0; i < cardSet.length; i++){
      const card = cardSet[i];
      card.x = card.originalLocation.x;
      card.y = card.originalLocation.y;
    }
  });
};

//Remove a card from the opponent's hand and flush the cards remaining in their hand
const spliceOpponentCard = (cardSet, index) => {
  cardSet.splice(index, 1);
  cardSet.reverse();
  flushCards(cardSet, 70, false, false, true, () => { 
    for(let i = 0; i < cardSet.length; i++){
      const card = cardSet[i];
      card.x = card.originalLocation.x;
      card.y = card.originalLocation.y;
    }
  });
};

//The server has accepted the requested turn action
const turnAccepted = () => {
  gameState.waiting = true;
}

//Handle a request from the server to play a card
const playCard = (data) => {
  const cardSet = deck[data.cardSet];
  const card = cardSet[data.index];
  
  gameState.waiting = false;
  
  if(selectedCard === card){
    unselectCard(selectedCard);
    selectedCard = null;
  }
  
  //Animate the card differently depending on who played it and what the card is
  if(deck[data.cardSet] === getPlayerHand()){
    switch(card.name){
      //Special cards are animated differently and have different effects on the game
      case "bolt":
        selectCard(card, true, true, () => {
          fadeCard(card, () => {
            splicePlayerCard(cardSet, data.index);
          });
        });
        const opponentField = getOpponentField();
        const target = opponentField[opponentField.length - 1];
        startCardFlip([target], false);
        break;
      case "mirror":
        selectCard(card, true, true, () => {
          fadeCard(card, () => {
            splicePlayerCard(cardSet, data.index);
          });
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
          selectCard(card, true, true, () => {
            fadeCard(card, () => {
              const opponentHand = getOpponentHand();
              spliceOpponentCard(opponentHand, data.blastIndex);
              splicePlayerCard(cardSet, data.index);
            });
          });
        }
        break;
      case "1":
        const playerField = getPlayerField();
        const affectedCard = playerField[playerField.length - 1];
        if(!affectedCard.isRevealed()){
          selectCard(card, true, true, () => {
            fadeCard(card, () => {
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
    
    switch(data.name){
      case "bolt":
        selectCard(card, true, true, () => {
          startCardFlip([card], false, () => {
            const playerField = getPlayerField();
            const target = playerField[playerField.length - 1];
            startCardFlip([target], false);
            
            //Animate or timeout so that opponent can actually see move
            fadeCard(card, () => {
              spliceOpponentCard(cardSet, data.index);
            });
          });
        });
        
        break;
      case "mirror":
        selectCard(card, true, true, () => {
          startCardFlip([card], false, () => {
            fadeCard(card, () => {
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
        });
        break;
      case "blast":
        if(data.blastIndex > -1 ){
          selectCard(card, true, true, () => {
            startCardFlip([card], false, () => {
              fadeCard(card, () => {
                const playerHand = getPlayerHand();
                spliceOpponentCard(cardSet, data.index);
                splicePlayerCard(playerHand, data.blastIndex);
              });
            });
          });
        }
        break;
      case "1":
        const opponentField = getOpponentField();
        const affectedCard = opponentField[opponentField.length - 1];
        if(!affectedCard.isRevealed()){
          selectCard(card, true, true, () => {
            startCardFlip([card], false, () => {
              fadeCard(card, () => {
                spliceOpponentCard(cardSet, data.index);
              });
            });
            startCardFlip([affectedCard], false);
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

//End the current game and reset the gamestate
const endGame = () => {
  readyToPlay = false;
  selectedCard = null;
  playerBlastCard = null;

  inRoom = false;
  blastSelect = false;
  
  roomOptions({rooms: []});
};

//Process a server update regarding the gamestate
const updateGamestate = (data) => {
  
  if(!data){
    return;
  }
  
  const keys = Object.keys(data);
  
  gameState.waiting = false;
  
  //Update the sent keys
  for(let i = 0; i < keys.length; i++){
    const key = keys[i];
    gameState[key] = data[key];
  }
  
  //Process a request to clear the field / end the game
  if(gameState.clearFields === true){
    clearFields();
  }
  
  if(gameState.winner !== null){
    endGame();
  }
  
  updateReadyStatus(false);
}

//Process a request to clear the player / opponent fields (move the cards offscreen)
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

//Construct an animation to select a card
const selectCard = (card, playerSelect, sealBond, callback) => {
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
  
  if(card.sealed){
    return;
  }
  
  card.bindAnimation(moveAnim, callback, sealBond ? true : false);
};

//Construct an animation to unselect a card
const unselectCard = (card, callback) => {
  
  const moveAnim = new Animation(
    {
      begin: 0,
      timeToFinish: 200,
      propsBegin: {x: card.x, y: card.y, hueRotate: card.hueRotate},
      propsEnd: {x: card.originalLocation.x, y: card.originalLocation.y, hueRotate: 0},
    }, false
  );
  
  if(card.sealed){
    return;
  }
  
  card.bindAnimation(moveAnim, callback);
};

//Construct an animation to move a card somewhere
const moveTo = (cardCollection, x, y, time, offset, callback) => {
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
        
        if(callback){
          callback();
        }
      });
    });
  }
};

//Construct an animation to start flipping a card over
const startCardFlip = (cardCollection, reverse, callback) => {
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
  }
};

//Construct an animation to finish flipping a card over
const endCardFlip = (card, cardCollection, width, xDiff, yDiff, callback) => {

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
};

//Construct an animation to flush a set of cards to look like they belong to a hand
const flushCards = (cardCollection, baseLineY, curveDown, sequentially, reverse, callback) => {
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
    
    //Animate differently depending on player status
    const y = 
      curveDown ? baseLineY + Math.max(Math.pow(Math.abs(distanceFromMiddle * 6), 1.3), 6)
      : baseLineY - Math.max(Math.pow(Math.abs(distanceFromMiddle * 6), 1.3), 6);
      
    const radians = curveDown ? distanceFromMiddle * 0.05 : distanceFromMiddle * -0.05;
    
    //Reset the card location
    card.originalLocation.x = x;
    card.originalLocation.y = y;
    
    const flushAnim = new Animation(
      {
        begin: sequentially ? (cardCollection.length - 1 - i) * 200 : 0,
        timeToFinish: sequentially ? 600 + (cardCollection.length - 1 - i) * 100 : 600,
        propsBegin: {x: card.x, y: card.y, radians: card.radians},
        propsEnd: {x, y, radians},
      }, true
    );
    
    card.bindAnimation(flushAnim, () => {
      animateDeckWhenReady(cardCollection, callback);
    });
  }
  
  if(reverse){
    cardCollection.reverse();
  }
};

//Construct an animation to stack cards on the field
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

//Construct an animation fold cards into one pile
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

//Construct an animation to fade out cards
const fadeCard = (card, callback) => {
  const fadeAnim = new Animation(
    {
      begin: 0,
      timeToFinish: 500,
      propsBegin: {opacity: 1},
      propsEnd: {opacity: 0},
    }, true
  );
  
  card.bindAnimation(fadeAnim, callback);
};

//Send a chat message to other players in the room
const sendChatMessage = (e) => {
  const chatBox = document.querySelector("#chatBox");
  const message = chatBox.value;
  chatBox.value = "";
  socket.emit('chatMessage', { message });
};

//Display chat messages received from other players
const receivedChatMessage = (data) => {
  const message = data.message;
  addToChat(message);
}

//Add a message to the chat window
const addToChat = (text) => {
  const chatWindow = document.querySelector("#chat");
  chatWindow.value = `${chatWindow.value}\n${text}`;
};