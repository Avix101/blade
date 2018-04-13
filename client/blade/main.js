let viewport, viewCtx, prepCanvas, prepCtx;
let socket, hash;
let bladeMat;
let cardsLoaded = 0;
let animationFrame;
let deck = {};
const NULL_FUNC = () => {};
let readyToPlay = false;
let selectedCard = null;
let mousePos = {x: 0, y: 0};
let bladeLink, instructionsLink, aboutLink, feedbackLink, disclaimerLink, profileLink

let playerStatus;
let blastSelect = false;
let playerBlastCard;
let inRoom = false;
let selectionEnabled = true;
const gameState = {
  turnType: "pickFromDeck",
  turnOwner: null,
  player1Points: 0,
  player2Points: 0,
  winner: null,
  waiting: false,
};

let fields = {
  'player1': [],
  'player2': [],
};

let pageView;

const aspectRatio = 16 / 9;

//Calculate the appropriate viewport dimensions
const calcDisplayDimensions = () => {
  const width = window.innerWidth * 0.6;
  const height = width / aspectRatio;
  
  return {
    width,
    height,
  };
}

const resizeGame = (e) => {
  if(pageView === "#blade"){
    const dimensions = calcDisplayDimensions();
    renderGame(dimensions.width, dimensions.height);
  }
}

const loadView = () => {
  const hash = window.location.hash;
  pageView = hash;
  
  switch(hash){
    case "#blade": {
      const dimensions = calcDisplayDimensions();
      renderGame(dimensions.width, dimensions.height);
      break;
    }
    case "#instructions": {
      renderInstructions();
      break;
    }
    case "#tocs": {
      renderAbout();
      break;
    }
    case "#feedback": {
      renderFeedback();
      break;
    }
    case "#profile": {
      renderProfile();
      break;
    }
    default: {
      const dimensions = calcDisplayDimensions();
      renderGame(dimensions.width, dimensions.height);
      pageView = "#blade";
      break;
    }
  }
};

const init = () => {
  
  loadView();
  
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
  socket.on('roomOptions', roomOptions);
  socket.on('roomJoined', roomJoined);
  socket.on('setDeck', setDeck);
  socket.on('sortDeck', sortDeck);
  socket.on('pickFromDeck', pickFromDeck);
  socket.on('playCard', playCard);
  socket.on('turnAccepted', turnAccepted);
  socket.on('gamestate', updateGamestate);
  socket.on('gamedata', notifyGameData);
  
  //Eventually switch to server call to load cards
  //loadBladeCards([{name: "back", src: "/assets/img/cards/00 Back.png"}]);
  
  animationFrame = requestAnimationFrame(update);
};

//Run the init function when the window loads
window.onload = init;

//Resize the viewport when the window resizes
window.addEventListener('resize', resizeGame);
window.addEventListener('hashchange', loadView);