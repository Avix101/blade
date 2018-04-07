let cardImageStruct = {};

const lerp = (val1, val2, ratio) => {
  const component1 = (1 - ratio) * val1;
  const component2 = ratio * val2;
  return component1 + component2;
};

const clearCanvas = (canvas, ctx) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const displayFrame = () => {
  clearCanvas(viewport, viewCtx);
  viewCtx.save();
  viewCtx.imageSmoothingEnabled = false;
  viewCtx.drawImage(
    prepCanvas,
    0,
    0,
    prepCanvas.width,
    prepCanvas.height,
    0,
    0,
    viewport.width,
    viewport.height
  );
};

const drawCard = (card) => {
  let image = cardImageStruct[card.name];
      
  if(!card.isRevealed()){
    image = cardImageStruct["back"];
  }
  
  prepCtx.save();
  
  if(card === selectedCard){
    prepCtx.filter = `hue-rotate(${card.hueRotate}deg)`;
  }
  
  prepCtx.translate(card.x + (card.width / 2), card.y + (card.height / 2));
  prepCtx.rotate(card.radians);
  
  prepCtx.drawImage(
    image,
    -card.width / 2,
    -card.height / 2,
    card.width,
    card.height,
  );
  prepCtx.restore();
};

const draw = () => {
  clearCanvas(prepCanvas, prepCtx);
  
  prepCtx.drawImage(bladeMat, 0, 0, prepCanvas.width, prepCanvas.height);
  
  if(!cardImageStruct["back"]){
    return;
  }
  
  const time = new Date().getTime();
  const subDeckKeys = Object.keys(deck);
  for(let i = 0; i < subDeckKeys.length; i++){
    const subDeck = deck[subDeckKeys[i]];
    for(let j = 0; j < subDeck.length; j++){
      const card = subDeck[j];;
      card.update(time);
      drawCard(card);
    }
  }
  
  const fieldKeys = Object.keys(fields);
  for(let i = 0; i < fieldKeys.length; i++){
    const field = fields[fieldKeys[i]];
    for(let j = 0; j < field.length; j++){
      const card = field[j];
      card.update(time);
      drawCard(card);
    }
  }
  
  displayFrame();
}