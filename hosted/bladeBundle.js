"use strict";
"use strict";

var canvas = void 0,
    ctx = void 0;
var socket = void 0,
    hash = void 0;

var init = function init() {

  canvas = document.querySelector("#viewport");
  ctx = canvas.getContext('2d');

  //Connect to the server via sockets
  socket = io.connect();
};

//Run the init function when the window loads
window.onload = init;
"use strict";
