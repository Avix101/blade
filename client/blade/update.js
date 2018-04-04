const update = () => {
  
  draw();
  
  animationFrame = requestAnimationFrame(update);
};

//REMOVE -- TESTING ONLY
let flushedCards = false;

const updateCards = () => {
  if(!flushedCards && cards[9].readyToAnimate()){
    flushCards(cards, 770, true);
    flushedCards = true;
  }
};

const loadBladeCards = (cardImages) => {
  for(let i = 0; i < cardImages.length; i++){
    const cardImage = cardImages[i];
    const image = new Image();
    
    image.onload = () => {
      cardImageStruct[cardImage.name] = image;
      
      for(let i = 0; i < 10; i++){
        const card = new Card(cardImage.name, {x: -100, y: 800}, {width: image.width, height: image.height});
        const moveAnim = new Animation(
          {
            begin: 100 * i,
            timeToFinish: 400,
            propsBegin: {x: -100},
            propsEnd:  {x: 300},
          }
        );
        card.bindAnimation(moveAnim, () => {
          updateCards();
        });
        cards.push(card);
      }
      
    }
    
    image.src = cardImage.src;
  }
};

const flushCards = (cardCollection, baseLineY, curveDown) => {
  
  for(let i = 0; i < cardCollection.length; i++){
    const card = cardCollection[i];
    const x = 500 + (100 * (cardCollection.length - 1 - i));
    
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
    card.bindAnimation(flushAnim);
  }
  
  cards.reverse();
};