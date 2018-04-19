//Declare all necessary variables
let viewport, viewCtx, prepCanvas, prepCtx;
let socket, hash;
let bladeMat;
let animationFrame;
let deck = {};
const NULL_FUNC = () => {};
let readyToPlay = false;
let selectedCard = null;
let mousePos = {x: 0, y: 0};

//Variables relating to gamestate
let playerStatus;
let playerProfiles = {};
let blastSelect = false;
let playerBlastCard;
let inRoom = false;
let selectionEnabled = true;
const gameState = {
  turnType: "begin",
  turnOwner: null,
  player1Points: 0,
  player2Points: 0,
  winner: null,
  waiting: false,
};

//Variables for managing playback
let isPlayingBack = false;
let playbackData;
let playbackSequenceCount;
let turnSequence = [];

let fields = {
  'player1': [],
  'player2': [],
};

//Current page view
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

//Resize the display canvas if its currently onscreen
const resizeGame = (e) => {
  if(pageView === "#blade"){
    const dimensions = calcDisplayDimensions();
    renderGame(dimensions.width, dimensions.height);
  } else if(viewport && document.querySelector("#modalContainer div").classList.contains("show")){
    renderPlayback(true);
  }
}

//Load the requested view
const loadView = () => {
  //Find the page's hash
  const hash = window.location.hash;
  pageView = hash;
  
  //Always render the right panel (regardless of view)
  renderRightPanel();
  
  //Depending on the hash, render the main content
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

//Run this function when the page loads
const init = () => {
  
  //Load the requested view
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
  socket.on('chatMessage', receivedChatMessage);
  socket.on('playerInfo', loadPlayerProfiles);
  socket.on('setDeck', setDeck);
  socket.on('sortDeck', sortDeck);
  socket.on('pickFromDeck', pickFromDeck);
  socket.on('playCard', playCard);
  socket.on('turnAccepted', turnAccepted);
  socket.on('gamestate', updateGamestate);
  socket.on('gamedata', notifyGameData);
  socket.on('playbackData', processPlaybackData);
  socket.on('errorMessage', processError);
  
  //Start the update loop!
  animationFrame = requestAnimationFrame(update);
  addToChat("You have joined the lobby");
};

//Run the init function when the window loads
window.onload = init;

//Resize the viewport when the window resizes
window.addEventListener('resize', resizeGame);
window.addEventListener('hashchange', loadView);