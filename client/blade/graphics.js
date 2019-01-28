let cardImageStruct = {};

//Interpolate between two values given a ratio between 0 and 1
const lerp = (val1, val2, ratio) => {
  const component1 = (1 - ratio) * val1;
  const component2 = ratio * val2;
  return component1 + component2;
};

//Clear the given canvas
const clearCanvas = (canvas, ctx) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

//Draw to the display canvas, which is dynamically resizable
const displayFrame = () => {

  //If the display canvas doesn't exist, don't draw to it
  if(!viewport){
    return;
  }

  //Clear the display canvas, draw from the prep canvas
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
  viewCtx.restore();
};

//Draw a card to the prep canvas
const drawCard = (card) => {
  let image = cardImageStruct[card.name];

  //If the card isn't revealed, draw the back of a card
  if(!card.isRevealed()){
    image = cardImageStruct["back"];
  }

  prepCtx.save();

  //Adjust the card's color and opacity accordingly
  prepCtx.globalAlpha = card.opacity;

  if(card === selectedCard){
    prepCtx.filter = `hue-rotate(${card.hueRotate}deg)`;
  }

  //Translate and rotate the card
  prepCtx.translate(card.x + (card.width / 2), card.y + (card.height / 2));
  prepCtx.rotate(card.radians);

  //Draw the card to the prep canvas
  prepCtx.drawImage(
    image,
    -card.width / 2,
    -card.height / 2,
    card.width,
    card.height,
  );
  prepCtx.restore();
};

//Draw the current scores to the prep canvas
const drawScore = (playerPoints, opponentPoints) => {
  prepCtx.save();
  prepCtx.font = "96pt Fira Sans, sans-serif";

  const playerWidth = prepCtx.measureText(playerPoints).width;
  const opponentWidth = prepCtx.measureText(opponentPoints).width;
  const halfWidth = (prepCanvas.width / 2) - 3;

  //Make text gradients
  const opponentGradient = prepCtx.createLinearGradient(0, 355, 0, 427);
  const playerGradient = prepCtx.createLinearGradient(0, 700, 0, 772);
  playerGradient.addColorStop(0, "white");
  opponentGradient.addColorStop(0, "white");
  playerGradient.addColorStop(0.3, "#dbb75c");
  opponentGradient.addColorStop(0.3, "#dbb75c");

  prepCtx.textAlign = "center";
  prepCtx.textBaseline = "middle";

  //Draw the two scores to the screen
  prepCtx.fillStyle = opponentGradient;
  prepCtx.fillText(opponentPoints, halfWidth, 355);

  prepCtx.fillStyle = playerGradient;
  prepCtx.fillText(playerPoints, halfWidth, 700);

  prepCtx.restore();
};

//Draw the instruction set to the prep canvas
const drawTurnIndicator = () => {
  const playerTurn = gameState.turnOwner === playerStatus;

  prepCtx.save();
  prepCtx.font = "28pt Fira Sans, sans-serif";
  prepCtx.textAlign = "center";
  prepCtx.textBaseline = "middle";
  const x = 490;
  const y = 645;

  //Depending on the gamestate, draw instructions to the screen for the player
  switch(gameState.turnType){
    case "playCard":
      if(blastSelect){
        prepCtx.fillStyle = "lightgreen";
        prepCtx.fillText("Select one of your opponent's cards to blast!", x, y);
      } else if(playerTurn){
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

//Draw the game's result to the prep canvas
const drawGameResult = () => {
  prepCtx.save();
  prepCtx.globalAlpha = 0.7;
  prepCtx.fillStyle = "black";
  prepCtx.fillRect(0, 0, prepCanvas.width, prepCanvas.height);

  prepCtx.globalAlpha = 1;
  prepCtx.font = "72pt Fira Sans, sans-serif";
  prepCtx.textAlign = "center";
  prepCtx.textBaseline = "middle";

  //Depending on the game's winner, draw the appropriate text to the screen
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

//Draw a waiting overlay to the prep canvas
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

//Draw the player and opponent profiles to the prep canvas
const drawPlayerProfiles = () => {
  const playerProfile = getPlayerProfile();
  const opponentProfile = getOpponentProfile();

  prepCtx.save();

  prepCtx.font = "32pt Fira Sans, sans-serif";
  prepCtx.textAlign = "center";
  prepCtx.textBaseline = "middle";
  prepCtx.fillStyle = "white";

  //Draw the profile and write their username below it
  if(playerProfile){

    if(prepCtx.measureText(playerProfile.username).width > 350){
      prepCtx.font = "18pt Fira Sans, sans-serif";
    }

    prepCtx.drawImage(
      playerProfile.charImage,
      25,
      750,
      256,
      256
    );

    prepCtx.fillText(playerProfile.username, 153, 1020);
  }

  //Reset font in case it was changed
  prepCtx.font = "32pt Fira Sans, sans-serif";

  if(opponentProfile){

    if(prepCtx.measureText(opponentProfile.username).width > 350){
      prepCtx.font = "18pt Fira Sans, sans-serif";
    }

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

//The main draw call that populates the prep canvas
const draw = () => {
  clearCanvas(prepCanvas, prepCtx);

  //Draw the blade mat in the background
  prepCtx.drawImage(bladeMat, 0, 0, prepCanvas.width, prepCanvas.height);

  if(!cardImageStruct["back"]){
    return;
  }

  let readyStatus = true;

  //Update and draw all cards in the field
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

  //Update and draw all cards in the players' hands and decks
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

  //Draw the players' profiles
  drawPlayerProfiles();

  //Determine if the player is ready to receive an update
  updateReadyStatus(readyStatus);

  //Draw instructions or a screen overlay depending on the gamestate
  if(playbackData && !isPlayingBack && gameState.turnType !== "end"){
    drawWaitingOverlay("Press Start to Begin Playback");
  } else if(!inRoom && gameState.turnType !== "end"){
    drawWaitingOverlay("Please create or join a game...");
  } else if(gameState.turnType === "begin"){
    drawWaitingOverlay("Waiting for an opponent to join...");
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

  //Move the prep canvas to the display canvas
  displayFrame();
}
