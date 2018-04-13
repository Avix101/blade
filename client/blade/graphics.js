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
  
  if(!viewport){
    return;
  }
  
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
  
  prepCtx.globalAlpha = card.opacity;
  
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

const drawScore = (playerPoints, opponentPoints) => {
  prepCtx.save();
  prepCtx.font = "96pt Fira Sans, sans-serif";
  
  const playerWidth = prepCtx.measureText(playerPoints).width;
  const opponentWidth = prepCtx.measureText(opponentPoints).width;
  const halfWidth = (prepCanvas.width / 2) - 3;
  
  const opponentGradient = prepCtx.createLinearGradient(0, 355, 0, 427);
  const playerGradient = prepCtx.createLinearGradient(0, 700, 0, 772);
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

const drawTurnIndicator = () => {
  const playerTurn = gameState.turnOwner === playerStatus;
  
  prepCtx.save();
  prepCtx.font = "28pt Fira Sans, sans-serif";
  prepCtx.textAlign = "center";
  prepCtx.textBaseline = "middle";
  const x = 490;
  const y = 645;
  
  switch(gameState.turnType){
    case "playCard":
      if(playerTurn){
        prepCtx.fillStyle = "cyan";
        prepCtx.fillText("Your turn, select a card from your hand!", x, y);
      } else {
        prepCtx.fillStyle = "pink";
        prepCtx.fillText("Wait for your opponent to play a card.", x, y);
      }
      break;
    case "pickFromDeck":
      prepCtx.fillStyle = "white";
      prepCtx.fillText("Score tied - both players draw from their decks.", x, y);
      break;
    default:
      break;
  }
  
  prepCtx.restore();
};

const drawGameResult = () => {
  prepCtx.save();
  prepCtx.globalAlpha = 0.7;
  prepCtx.fillStyle = "black";
  prepCtx.fillRect(0, 0, prepCanvas.width, prepCanvas.height);
  
  prepCtx.globalAlpha = 1;
  prepCtx.font = "72pt Fira Sans, sans-serif";
  prepCtx.textAlign = "center";
  prepCtx.textBaseline = "middle";
  
  if(playerStatus === gameState.winner){
    prepCtx.fillStyle = "blue";
    prepCtx.fillText("You won!", prepCanvas.width / 2, prepCanvas.height / 2);
  } else if(gameState.winner === "tie"){
    prepCtx.fillStyle = "blue";
    prepCtx.fillText("You tied!", prepCanvas.width / 2, prepCanvas.height / 2);
  } else {
    prepCtx.fillStyle = "red";
    prepCtx.fillText("You Lost!", prepCanvas.width / 2, prepCanvas.height / 2);
  }
  
  prepCtx.restore();
};

const drawWaitingOverlay = (text) => {
  prepCtx.save();
  prepCtx.globalAlpha = 0.7;
  prepCtx.fillStyle = "black";
  prepCtx.fillRect(0, 0, prepCanvas.width, prepCanvas.height);
  
  prepCtx.globalAlpha = 1;
  prepCtx.font = "72pt Fira Sans, sans-serif";
  prepCtx.textAlign = "center";
  prepCtx.textBaseline = "middle";
  
  prepCtx.fillStyle = "white";
  prepCtx.fillText(text, prepCanvas.width / 2, prepCanvas.height / 2);
  
  prepCtx.restore();
};

const drawPlayerProfiles = () => {
  const playerProfile = getPlayerProfile();
  const opponentProfile = getOpponentProfile();
  
  prepCtx.save();
  
  prepCtx.font = "32pt Fira Sans, sans-serif";
  prepCtx.textAlign = "center";
  prepCtx.textBaseline = "middle";
  prepCtx.fillStyle = "white";
  
  if(playerProfile){
    prepCtx.drawImage(
      playerProfile.charImage, 
      25, 
      750,
      256,
      256
    );
    
    prepCtx.fillText(playerProfile.username, 153, 1020);
  }
  
  if(opponentProfile){
    prepCtx.drawImage(
      opponentProfile.charImage,
      25,
      -10,
      256,
      256,
    );
    
    prepCtx.fillText(opponentProfile.username, 153, 260);
  }
  
  prepCtx.restore();
};

const draw = () => {
  clearCanvas(prepCanvas, prepCtx);
  
  prepCtx.drawImage(bladeMat, 0, 0, prepCanvas.width, prepCanvas.height);
  
  if(!cardImageStruct["back"]){
    return;
  }
  
  let readyStatus = true;
  
  const time = new Date().getTime();
  const fieldKeys = Object.keys(fields);
  for(let i = 0; i < fieldKeys.length; i++){
    const field = fields[fieldKeys[i]];
    for(let j = 0; j < field.length; j++){
      const card = field[j];
      const update = card.update(time);
      if(update){
        readyStatus = false;
      }
      drawCard(card);
    }
  }
  
  const subDeckKeys = Object.keys(deck);
  for(let i = 0; i < subDeckKeys.length; i++){
    const subDeck = deck[subDeckKeys[i]];
    for(let j = 0; j < subDeck.length; j++){
      const card = subDeck[j];;
      const update = card.update(time);
      if(update){
        readyStatus = false;
      }
      drawCard(card);
    }
  }
  
  drawPlayerProfiles();
  
  updateReadyStatus(readyStatus);
  
  if(!inRoom && gameState.turnType !== "end"){
    drawWaitingOverlay("Please create or join a game...");
  } else {
    drawScore(getPlayerPoints(), getOpponentPoints());
    
    if(gameState.winner){
      drawGameResult();
    } else {
      drawTurnIndicator();
    }
    
    if(gameState.waiting){
      drawWaitingOverlay("Waiting for opponent...");
    }
  }
  
  displayFrame();
}