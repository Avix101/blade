// Import node modules
const xxh = require('xxhashjs');

// Import custom modules
const blade = require('./blade');
const roomHandler = require('./roomHandler.js');

const models = require('./models');

const { GameResult } = models;

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

const saveGame = (roomId, gameState, callback) => {
  console.log('saving game');
  const sockets = roomHandler.getSockets(roomId);
  const [socket1, socket2] = sockets;
  const socket1Status = roomHandler.getPlayerStatus(roomId, socket1);
  const socket2Status = roomHandler.getPlayerStatus(roomId, socket2);
  const player1 = socket1Status === 'player1' ? socket1 : socket2;
  const player2 = socket2Status === 'player2' ? socket2 : socket1;

  if (!player1 || !player2 || !gameState) {
    if (socket1) {
      socket1.emit('gamedata', { saved: false });
    }
    if (socket2) {
      socket2.emit('gamedata', { saved: false });
    }

    return;
  }

  const gameData = {
    player1Id: player1.handshake.session.account._id,
    player2Id: player2.handshake.session.account._id,
    player1Score: gameState.player1Points,
    player2Score: gameState.player2Points,
    winner: gameState.winner,
  };

  const newGameResult = new GameResult.GameResultModel(gameData);

  const savePromise = newGameResult.save();

  savePromise.then(() => {
    socket1.emit('gamedata', { saved: true });
    socket2.emit('gamedata', { saved: true });
  });

  savePromise.catch(() => {
    socket1.emit('gamedata', { saved: false });
    socket2.emit('gamedata', { saved: false });
  });

  if (callback) {
    callback();
  }
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

    socket.on('getRooms', () => {
      socket.emit('roomOptions', { rooms: roomHandler.getRooms() });
    });

    socket.on('createRoom', () => {
      if (roomHandler.createRoom(socket.hash)) {
        if (roomHandler.joinRoom(socket.hash, socket)) {
          socket.emit('roomJoined', { room: socket.hash, status: roomHandler.getPlayerStatus(socket.hash, socket) });
        }
      }
    });

    socket.on('joinRoom', (data) => {
      if (roomHandler.joinRoom(data.room, socket)) {
        socket.emit('roomJoined', { room: data.room, status: roomHandler.getPlayerStatus(data.room, socket) });
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

            io.sockets.in(socket.roomJoined).emit(
              'playerInfo',
              roomHandler.getProfileData(socket.roomJoined),
            );
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
        console.log('broken integrity');
        return;
      }

      const status = roomHandler.getPlayerStatus(socket.roomJoined, socket);
      if (blade.pickFromDeck(socket.roomJoined, status, (card) => {
        console.log('callback');
        console.log(socket.roomJoined);
        io.sockets.in(socket.roomJoined).emit('pickFromDeck', { player: status, card });
      })) {
        socket.emit('turnAccepted');
      }
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
        if (blade.playCard(
          socket.roomJoined, status, data.index, data.blastIndex,
          (cardSet, name, blastIndex) => {
          // socket.emit('playCard', { index: data.index, cardSet });
            io.sockets.in(socket.roomJoined).emit(
              'playCard',
              {
                index: data.index, cardSet, name, blastIndex,
              },
            );
          },
        )) {
          socket.emit('turnAccepted');
        }
      }
    });

    socket.on('chatMessage', (data) => {
      if (!socket.handshake.session.account || !socket.roomJoined) {
        return;
      }

      const { username } = socket.handshake.session.account;
      const message = `${username}: ${data.message}`;
      io.sockets.in(socket.roomJoined).emit('chatMessage', { message });
    });

    socket.on('disconnect', () => {
      const roomId = socket.roomJoined;
      const status = roomHandler.getPlayerStatus(socket.roomJoined, socket);

      if (blade.gameExists(socket.roomJoined)) {
        blade.resolveDisconnect(roomId, status, () => {
          const gameState = blade.getGameState(socket.roomJoined);
          saveGame(socket.roomJoined, gameState, () => {
            roomHandler.leaveRoom(socket.roomJoined, socket);
          });
          blade.killGame(roomId);
          io.sockets.in(roomId).emit('gamestate', gameState);
        });
      } else {
        roomHandler.leaveRoom(socket.roomJoined, socket);
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

const killGame = (roomId) => {
  if (roomHandler.destroyRoom(roomId)) {
    if (blade.gameExists(roomId)) {
      blade.killGame(roomId);
    }
  }
};

module.exports.init = init;
module.exports.sendGameState = sendGameState;
module.exports.killGame = killGame;
module.exports.saveGame = saveGame;
