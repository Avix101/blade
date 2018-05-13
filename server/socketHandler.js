// Import node modules
const xxh = require('xxhashjs');

// Import custom modules
const blade = require('./blade');
const roomHandler = require('./roomHandler.js');

const models = require('./models');

const { GameResult } = models;
const { Account } = models;

let io;

// Functions to verify game and data integrity when sent by a socket
const verifyGameIntegrity = roomId => blade.gameExists(roomId);

const verifyDataIntegrity = (data, expectedKeys) => {
  let verified = true;

  if (!data) {
    return false;
  }

  // Verify that the expected keys are present
  for (let i = 0; i < expectedKeys.length; i++) {
    const key = expectedKeys[i];
    verified = data[key] !== undefined;
  }
  return verified;
};

// Save a game result into mongo
const saveGame = (roomId, gameState, metaData, callback) => {
  // Configure socket data
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


  // Update both socket sessions (to make sure privacy settings are correct) before saving
  player1.handshake.session.reload(() => {
    player2.handshake.session.reload(() => {
      // Build a game data object, pass to mongo
      const gameData = {
        player1Id: player1.handshake.session.account._id,
        player2Id: player2.handshake.session.account._id,
        player1Privacy: player1.handshake.session.account.privacy,
        player2Privacy: player2.handshake.session.account.privacy,
        player1Score: gameState.player1Points,
        player2Score: gameState.player2Points,
        winner: gameState.winner,
        meta: metaData,
      };

      const newGameResult = new GameResult.GameResultModel(gameData);

      const savePromise = newGameResult.save();

      // Alert users that data was saved (or not saved)
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
    });
  });
};

// Limits for sockets
const DDOS = 1000;

// Keeps track of # of socket requests
let requestCounter = {};

// Checks and clears the rate limiter every 1000ms
const checkRateLimiter = () => {
  const socketKeys = Object.keys(requestCounter);
  for (let i = 0; i < socketKeys.length; i++) {
    const key = socketKeys[i];
    if (requestCounter[key] > DDOS) {
      if (io.sockets.connected[key]) {
        io.sockets.connected[key].emit('errorMessage', {
          error:
          'Rate limiter activated: Call limit exceeded. Connection to server broken.',
        });
        io.sockets.connected[key].disconnect();
      }
    }
  }
	
  requestCounter = {};
};

// Run check every second
setInterval(() => {
  checkRateLimiter();
}, 1000);

// Attach custom functions to sockets
const init = (ioInstance) => {
  io = ioInstance;

  io.on('connection', (sock) => {
    const socket = sock;
		
		// General rate limiter for sockets
    socket.use((packet, next) => {
      if (!requestCounter[socket.id]) {
        requestCounter[socket.id] = 1;
      } else {
        requestCounter[socket.id]++;
      }
      next();
    });

    // Create a new hash for the connected client
    const time = new Date().getTime();
    const hash = xxh.h32(`${socket.id}${time}`, 0x49A99BFF).toString(16);

    socket.hash = hash;

    // Join the lobby initially
    socket.join('lobby');
    socket.roomJoined = 'lobby';
    socket.emit('roomOptions', { rooms: roomHandler.getRooms() });

    socket.emit('loadBladeCards', blade.getCardImages());

    // Handles a request to get available rooms
    socket.on('getRooms', () => {
      socket.emit('roomOptions', { rooms: roomHandler.getRooms() });
    });

    // Handles a request to create a new room
    socket.on('createRoom', () => {
      if (roomHandler.createRoom(socket.hash)) {
        if (roomHandler.joinRoom(socket.hash, socket)) {
          // Update socket session!!
          socket.handshake.session.reload(() => {
            socket.emit('roomJoined', {
              room: socket.hash,
              status: roomHandler.getPlayerStatus(socket.hash, socket),
            });
          });
        }
      }
    });

    // Handles a request to join an existing room
    socket.on('joinRoom', (data) => {
      if (roomHandler.joinRoom(data.room, socket)) {
        socket.emit('roomJoined', { room: data.room, status: roomHandler.getPlayerStatus(data.room, socket) });
        if (roomHandler.getPlayerCount(data.room) === 2) {
          // Update socket session!!
          socket.handshake.session.reload(() => {
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
          });
        }
      }
    });

    // Handles a request to change a player's ready status
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

    // Sends back a deck to the player
    socket.on('requestDeck', () => {
      if (!verifyGameIntegrity(socket.roomJoined)) {
        return;
      }

      // Begins the game
      blade.beginGame('lobby', () => {
        io.sockets.in(socket.roomJoined).emit(
          'setDeck',
          blade.getDeck(socket.roomJoined, 'player1'),
        );
      });
    });

    // Handles a request to sort a given deck
    socket.on('sortDeck', () => {
      if (!verifyGameIntegrity(socket.roomJoined)) {
        return;
      }

      const status = roomHandler.getPlayerStatus(socket.roomJoined, socket);
      blade.sortDeck(socket.roomJoined, status, () => {
        socket.emit('sortDeck');
      });
    });

    // Handles a request to pick from the player's deck
    socket.on('pickFromDeck', () => {
      if (!verifyGameIntegrity(socket.roomJoined)) {
        return;
      }

      const status = roomHandler.getPlayerStatus(socket.roomJoined, socket);
      if (blade.pickFromDeck(socket.roomJoined, status, (card) => {
        io.sockets.in(socket.roomJoined).emit('pickFromDeck', { player: status, card });
      })) {
        socket.emit('turnAccepted');
      }
    });

    // Handles a request to play a card
    socket.on('playCard', (data) => {
      if (!verifyGameIntegrity(socket.roomJoined)) {
        return;
      }

      if (!verifyDataIntegrity(data, ['index'])) {
        return;
      }

      // Data must be verified before the action will be accepted
      const status = roomHandler.getPlayerStatus(socket.roomJoined, socket);
      if (blade.validateCard(socket.roomJoined, status, data.index)) {
        if (blade.playCard(
          socket.roomJoined, status, data.index, data.blastIndex,
          (cardSet, name, blastIndex) => {
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

    // Handle a chat message (send to all players in the room)
    socket.on('chatMessage', (data) => {
      if (!socket.handshake.session.account || !socket.roomJoined) {
        return;
      }

      const { username } = socket.handshake.session.account;
      const message = `${username}: ${data.message}`;
      io.sockets.in(socket.roomJoined).emit('chatMessage', { message });
    });

    // Handle a request to load playback data
    socket.on('requestPlaybackData', (data) => {
      // Playback data cannot be viewed during a game
      if (verifyGameIntegrity(socket.roomJoined)) {
        socket.emit('errorMessage', { error: 'Cannot request playback data during a game' });
        return;
      }

      if (!verifyDataIntegrity(data, ['id'])) {
        return;
      }

      // Search for the requested game
      GameResult.GameResultModel.findById(data.id, (err, game) => {
        // The game could not be found, send an error
        if (err) {
          socket.emit('errorMessage', { error: 'The data for this game is missing' });
          return;
        }

        // The game contains no metadata (game created prior to implementation), send error
        if (!game.meta) {
          socket.emit('errorMessage', { error: 'Playback data was not recorded for this game' });
          return;
        }

        const { meta } = game;

        // Find the accounts of the game's players
        Account.AccountModel.findByIdMultiple([game.player1Id, game.player2Id], (er2, accounts) => {
          // If account data can't be found, terminate the request
          if (er2 || !accounts) {
            socket.emit('errorMessage', {
              error: 'Participating accounts could not be retrieved, playback canceled',
            });
            return;
          }

          // Only allow the return of a single account if the player played against themself
          if (accounts.length !== 2 && !(game.player1Id.toString() === game.player2Id.toString())) {
            socket.emit('errorMessage', {
              error: 'Participating accounts could not be retrieved, playback canceled',
            });
            return;
          }

          const accountData = accounts.map(account => ({
            username: account.username,
            profile: account.profile_name,
          }));

          const playerData = {
            player1: game.player1Id.toString() === accounts[0]._id.toString() ?
              accountData[0] :
              accountData[1],
            player2: game.player2Id.toString() === accounts[0]._id.toString() ?
              accountData[0] :
              accountData[1],
          };

          // Playback data successfully retrieved, format and send back to requester
          socket.emit('playbackData', {
            game: {
              p1Hand: blade.buildCardSet(meta.p1Hand),
              p2Hand: blade.buildCardSet(meta.p2Hand),
              p1Deck: blade.buildCardSet(meta.p1Deck),
              p2Deck: blade.buildCardSet(meta.p2Deck),
              gameplay: meta.gameplay,
            },
            playerData,
          });
        });
      });
    });

    // Handle a socket disconnect
    socket.on('disconnect', () => {
      const roomId = socket.roomJoined;
      const status = roomHandler.getPlayerStatus(socket.roomJoined, socket);

      // Resolve the current game, have the socket leave the room, and destroy the room
      if (blade.gameExists(socket.roomJoined)) {
        blade.resolveDisconnect(roomId, status, () => {
          const gameState = blade.getGameState(socket.roomJoined);
          const metaData = blade.getGameMeta(socket.roomJoined);
          saveGame(socket.roomJoined, gameState, metaData, () => {
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

// Send the current gamestate out to all clients in the room
const sendGameState = (roomId, callback) => {
  const gameState = blade.getGameState(roomId);
  io.sockets.in(roomId).emit('gamestate', gameState);
  if (callback) {
    callback();
  }
};

// Kill a currently running game
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
