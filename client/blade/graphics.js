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

const draw = () => {
  clearCanvas(prepCanvas, prepCtx);
  
  prepCtx.drawImage(bladeMat, 0, 0, prepCanvas.width, prepCanvas.height);
  
  if(!cardImageStruct["back"]){
    return;
  }
  
  const time = new Date().getTime();
  for(let i = 0; i < cards.length; i++){
    const card = cards[i];
    card.update(time);
    
    const image = cardImageStruct[card.name];
    
    prepCtx.save();
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
  }
    
  displayFrame();
}