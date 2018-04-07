// Import node modules
const xxh = require('xxhashjs');

// Import custom modules
const blade = require('./blade');
const roomHandler = require('./roomHandler.js');

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
    socket.emit('roomOptions', { rooms: roomHandler.getRooms() });

    socket.emit('loadBladeCards', blade.getCardImages());

    socket.on('createRoom', () => {
      if (roomHandler.createRoom(socket.hash)) {
        if (roomHandler.joinRoom(socket.hash, socket)) {
          socket.emit('roomJoined', { status: roomHandler.getPlayerStatus(socket.hash, socket) });
        }
      }
    });

    socket.on('joinRoom', (data) => {
      if (roomHandler.joinRoom(data.room, socket)) {
        socket.emit('roomJoined', { status: roomHandler.getPlayerStatus(data.room, socket) });
        if (roomHandler.getPlayerCount(data.room) === 2) {
          blade.beginGame(data.room, () => {
            const sockets = roomHandler.getSockets(data.room);
            const socket1Status = roomHandler.getPlayerStatus(sockets[0].roomJoined, sockets[0]);
            const socket2Status = roomHandler.getPlayerStatus(sockets[1].roomJoined, sockets[1]);
            sockets[0].emit(
              'setDeck',
              blade.getDeck(sockets[0].roomJoined, socket1Status),
            );
            sockets[1].emit(
              'setDeck',
              blade.getDeck(sockets[1].roomJoined, socket2Status),
            );
          });
        }
      }
    });

    socket.on('requestDeck', () => {
      blade.beginGame('lobby', () => {
        io.sockets.in(socket.roomJoined).emit(
          'setDeck',
          blade.getDeck(socket.roomJoined, 'player1'),
        );
      });
    });

    socket.on('sortDeck', () => {
      const status = roomHandler.getPlayerStatus(socket.roomJoined, socket);
      blade.sortDeck(socket.roomJoined, status, () => {
        socket.emit('sortDeck');
      });
    });

    socket.on('playCard', (data) => {
      const status = roomHandler.getPlayerStatus(socket.roomJoined, socket);
      if (blade.validateCard(socket.roomJoined, status, data.index)) {
        blade.playCard(socket.roomJoined, status, data.index, (cardSet) => {
          socket.emit('playCard', { index: data.index, cardSet });
        });
      }
    });

    socket.on('message', (data) => {
      socket.emit('message', data);
    });
  });
};

module.exports = {
  init,
};
