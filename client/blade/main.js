let viewport, viewCtx, prepCanvas, prepCtx;
let socket, hash;
let bladeMat;
let animationFrame;
let cards = [];

const aspectRatio = 16 / 9;

//Calculate the appropriate viewport dimensions
const calcDisplayDimensions = () => {
  const width = window.innerWidth * 0.8;
  const height = width / aspectRatio;
  
  return {
    width,
    height,
  };
}

const resizeGame = (e) => {
  const dimensions = calcDisplayDimensions();
  renderGame(dimensions.width, dimensions.height);
}

const init = () => {
  
  const dimensions = calcDisplayDimensions();
  renderGame(dimensions.width, dimensions.height);
  
  //Grab static images included in client download
  bladeMat = document.querySelector("#bladeMat");
  
  //Connect to the server via sockets
  socket = io.connect();
  
  //Construct the prep canvas (for building frames)
  prepCanvas = document.createElement('canvas');
  prepCanvas.width = "1920";
  prepCanvas.height = "1080";
  prepCtx = prepCanvas.getContext('2d');
  
  //Eventually switch to server call to load cards
  loadBladeCards([{name: "back", src: "/assets/img/cards/00 Back.png"}]);
  
  animationFrame = requestAnimationFrame(update);
};

//Run the init function when the window loads
window.onload = init;

//Resize the viewport when the window resizes
window.addEventListener('resize', resizeGame);