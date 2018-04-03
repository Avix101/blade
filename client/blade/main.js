let canvas, ctx;
let socket, hash;

const init = () => {
  
  canvas = document.querySelector("#viewport");
  ctx = canvas.getContext('2d');
  
  //Connect to the server via sockets
  socket = io.connect();
};

//Run the init function when the window loads
window.onload = init;