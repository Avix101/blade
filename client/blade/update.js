const update = () => {
  
  draw();
  
  animationFrame = requestAnimationFrame(update);
};

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

const chainAnimations = (cardCollection, animationPackages) => {

  animationPackages.reverse();
  const animations = animationPackages.map((pack) => pack[0]);
  const params = animationPackages.map((pack) => pack[1]);
  const animateTogether = animationPackages.map((pack) => pack[2]);
  
  const funcChain = [NULL_FUNC];
  
  for(let i = 0; i < animations.length; i++){
    const animationFuncs = animations[i];
    const paramList = params[i];
    
    const funcWrapper = (card) => {
      
      if(animateTogether[i]){
        animateDeckWhenReady(cardCollection, () => {
          const anims = animationFuncs.apply(null, [cardCollection].concat(paramList));
          for(let j = 0; j < cardCollection.length; j++){
            const card = cardCollection[j];
            card.bindAnimation(anims[j], funcChain[i]);
          }
        });
      } else {
        const anims = animationFuncs.apply(null, [cardCollection].concat(paramList));
        for(let j = 0; j < cardCollection.length; j++){
          const card = cardCollection[j];
          card.bindAnimation(anims[j], funcChain[i]);
        }
      }
      
    }
    funcChain.push(funcWrapper);
  }
  
  funcChain[funcChain.length - 1]();
}

const loadBladeCards = (cardImages) => {
  
  for(let i = 0; i < cardImages.length; i++){
    const cardImage = cardImages[i];
    const image = new Image();
    
    image.onload = () => {
      cardImageStruct[cardImage.name] = image;
      
      cardsLoaded++;
      
      if(cardsLoaded >= cardImages.length){
        socket.emit('requestDeck');
      }
    }
    
    image.src = cardImage.src;
  }
};

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
        card = new Card(cardData.ref, {x: -200, y: -200}, {width: image.width, height: image.height});
      } else {
        const image = cardImageStruct["back"];
        card = new Card("back", {x: -200, y: -200}, {width: image.width, height: image.height});
      }
      
      deck[key].push(card);
    }
  }
  
  //moveToPlayerDeck(deck.player1);
  //NOTE: Replace with more consistent value!
  const width = deck.player1[0].width;
  
  /*chainAnimations(deck.player1, [
    [moveToPlayerDeck, [], true],
    [flushCards, [770, true], true],
    [startCardFlip, [], true],
    [endCardFlip, [width], false]
  ]);*/
  moveToPlayerDeck(deck.player1, () => {
    flushCards(deck.player1, 770, true, () => {
      startCardFlip(deck.player1, false, () => {
        foldInCards(deck.player1, () => {
          startCardFlip(deck.player1, true, () => {
            startCardFlip(deck.player1, false, () => {
              flushCards(deck.player1, 770, true);
            });
          });
        });
      });
    });
  });
  
  //flushCards(deck.player1, 770, true);
};

const moveToPlayerDeck = (cardCollection, callback) => {
  //const anims = [];
  for(let i = 0; i < cardCollection.length; i++){
    const card = cardCollection[i];
    const moveAnim = new Animation(
      {
        begin: 100 * i,
        timeToFinish: 400,
        propsBegin: {x: -100, y: 770},
        propsEnd:  {x: 300, y: 770},
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
    const flipAnimation = new Animation(
      {
        begin: reverse ? i * 50 : (cardCollection.length - 1 - i) * 50,
        timeToFinish: 200,
        propsBegin: {width: card.width},
        propsEnd: {width: 0},
      }
    );
    const width = card.width;
    card.bindAnimation(flipAnimation, () => {
      card.flip();
      endCardFlip(card, cardCollection, width, callback)
    });
    
    //anims.push(flipAnimation);
  }
  
  //return anims;
};

const endCardFlip = (card, cardCollection, width, callback) => {
  //const anims = [];
  //for(let i = 0; i < cardCollection.length; i++){
  //const card = cardCollection[i];
  const flipAnimation = new Animation(
    {
      begin: 0,
      timeToFinish: 200,
      propsBegin: {width: 0},
      propsEnd: {width},
    }
  );
  card.bindAnimation(flipAnimation, () => {
    animateDeckWhenReady(cardCollection, callback);
  });
    //anims.push(flipAnimation);
  //}
  //return anims;
};

const flushCards = (cardCollection, baseLineY, curveDown, callback) => {
  //const anims = [];
  for(let i = 0; i < cardCollection.length; i++){
    const card = cardCollection[i];
    const x = 1100 + (100 * (cardCollection.length / 2 - 1 - i));
    
    const middle = (cardCollection.length / 2);
    let distanceFromMiddle = middle - i - 1;
    
    if(cardCollection.length % 2 === 0){
      if(distanceFromMiddle < 0){
        distanceFromMiddle = middle - i;
      }
    }
    
    const y = baseLineY + Math.max(Math.pow(Math.abs(distanceFromMiddle * 6), 1.3), 6);
    const radians = distanceFromMiddle * 0.05;
    
    const flushAnim = new Animation(
      {
        begin: (cardCollection.length - 1 - i) * 200,
        timeToFinish: 600 + (cardCollection.length - 1 - i) * 100,
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
  
  cardCollection.reverse();
  //return anims;
};

const foldInCards = (cardCollection, callback) => {
  for(let i = 0; i < cardCollection.length; i++){
    const card = cardCollection[i];
    
    const foldInAnim = new Animation(
      {
        begin: 0,
        timeToFinish: 300,
        propsBegin: {x: card.x, y: card.y, radians: card.radians},
        propsEnd: {x: 1100, y: 770, radians: 0},
      }
    );
    
    card.bindAnimation(foldInAnim, () => {
      animateDeckWhenReady(cardCollection, callback);
    });
  }
};