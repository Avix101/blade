// Import node modules
const xxh = require('xxhashjs');

// Import custom modules
const blade = require('./blade');
const roomHandler = require('./roomHandler.js');

let io;

const verifyGameIntegrity = roomId => blade.gameExists(roomId);

const verifyDataIntegrity = (data, expectedKeys) => {
  let verified = true;

  if (!data) {
    return false;
  }

  for (let i = 0; i < expectedKeys.length; i++) {
    const key = expectedKeys[i];
    verified = data[key] !== undefined;
  }
  return verified;
};

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
            const gameState = blade.getGameState(socket.roomJoined);
            io.sockets.in(socket.roomJoined).emit('gamestate', gameState);
          });
        }
      }
    });

    socket.on('ready', (data) => {
      if (!verifyGameIntegrity(socket.roomJoined)) {
        return;
      }

      if (!verifyDataIntegrity(data, ['status'])) {
        return;
      }

      const status = roomHandler.getPlayerStatus(socket.roomJoined, socket);
      const ready = data.status === true;
      blade.playerReady(socket.roomJoined, status, ready);
    });

    socket.on('requestDeck', () => {
      if (!verifyGameIntegrity(socket.roomJoined)) {
        return;
      }

      blade.beginGame('lobby', () => {
        io.sockets.in(socket.roomJoined).emit(
          'setDeck',
          blade.getDeck(socket.roomJoined, 'player1'),
        );
      });
    });

    socket.on('sortDeck', () => {
      if (!verifyGameIntegrity(socket.roomJoined)) {
        return;
      }

      const status = roomHandler.getPlayerStatus(socket.roomJoined, socket);
      blade.sortDeck(socket.roomJoined, status, () => {
        socket.emit('sortDeck');
      });
    });

    socket.on('pickFromDeck', () => {
      if (!verifyGameIntegrity(socket.roomJoined)) {
        return;
      }

      const status = roomHandler.getPlayerStatus(socket.roomJoined, socket);
      blade.pickFromDeck(socket.roomJoined, status, (card) => {
        io.sockets.in(socket.roomJoined).emit('pickFromDeck', { player: status, card });
      });
    });

    socket.on('playCard', (data) => {
      if (!verifyGameIntegrity(socket.roomJoined)) {
        return;
      }

      if (!verifyDataIntegrity(data, ['index'])) {
        return;
      }

      const status = roomHandler.getPlayerStatus(socket.roomJoined, socket);
      if (blade.validateCard(socket.roomJoined, status, data.index)) {
        blade.playCard(socket.roomJoined, status, data.index, (cardSet, name) => {
          // socket.emit('playCard', { index: data.index, cardSet });
          io.sockets.in(socket.roomJoined).emit(
            'playCard',
            { index: data.index, cardSet, name },
          );
        });
      }
    });
  });
};

const sendGameState = (roomId, callback) => {
  const gameState = blade.getGameState(roomId);
  io.sockets.in(roomId).emit('gamestate', gameState);
  if (callback) {
    callback();
  }
};

module.exports.init = init;
module.exports.sendGameState = sendGameState;
