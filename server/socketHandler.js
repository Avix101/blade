// Import node modules
const xxh = require('xxhashjs');

let io;

const init = (ioInstance) => {
  io = ioInstance;

  io.on('connection', (sock) => {
    const socket = sock;

    // Create a new hash for the connected client
    const time = new Date().getTime();
    const hash = xxh.h32(`${socket.id}${time}`, 0x49A99BFF).toString(16);

    socket.hash = hash;

    socket.on('message', (data) => {
      socket.emit('message', data);
    });
  });
};

module.exports = {
  init,
};
