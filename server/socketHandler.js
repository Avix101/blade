// Import node modules
const xxh = require('xxhashjs');

//Import custom modules
const blade = require('./blade');

let io;

const init = (ioInstance) => {
  io = ioInstance;

  io.on('connection', (sock) => {
    const socket = sock;

    // Create a new hash for the connected client
    const time = new Date().getTime();
    const hash = xxh.h32(`${socket.id}${time}`, 0x49A99BFF).toString(16);

    socket.hash = hash;
    
    socket.join('lobby');
    socket.roomJoined = 'lobby';
    
    socket.emit('loadBladeCards', blade.getCardImages());
    
    socket.on('requestDeck', () => {
      blade.beginGame('lobby', () => {
        io.sockets.in(socket.roomJoined).emit(
          'setDeck', 
          blade.getDeck(socket.roomJoined, 'player1')
        );
      });
    });

    socket.on('message', (data) => {
      socket.emit('message', data);
    });
  });
};

module.exports = {
  init,
};
