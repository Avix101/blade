// Stores all existing rooms
const rooms = {};

// Get the number of players in a room
const getPlayerCount = (roomId) => {
  if (!rooms[roomId]) {
    return -1;
  }
  return rooms[roomId].sockets.length;
};

// Create a new room given an id
const createRoom = (roomId, type) => {
  if (rooms[roomId]) {
    return false;
  }

  rooms[roomId] = {
    id: roomId,
    type,
    sockets: [],
    owner: 'Anonymous',
    player1: null,
    player2: null,
  };

  return true;
};

// Join an existing room given an id
const joinRoom = (roomId, sock) => {
  if (!rooms[roomId]) {
    return false;
  }

  // Update the socket
  const socket = sock;
  if (socket.roomJoined !== roomId) {
    socket.leave(socket.roomJoined);
    socket.join(roomId);
    socket.roomJoined = roomId;
  }

  const room = rooms[roomId];
  const playerCount = getPlayerCount(roomId);

  // Determine and record if the player is player1 or player2
  switch (playerCount) {
    case 0:
      room.sockets.push(socket);
      room.player1 = socket;

      if (socket.handshake.session.account.username) {
        room.owner = socket.handshake.session.account.username;
      }

      return true;
    case 1:
      room.sockets.push(socket);
      room.player2 = socket;
      return true;
    case 2:
    default:
      break;
  }

  return false;
};

// Destroy a room given an id
const destroyRoom = (roomId) => {
  if (!rooms[roomId]) {
    return false;
  }

  rooms[roomId] = null;
  delete rooms[roomId];
  return true;
};

// Leave a room given an id
const leaveRoom = (roomId, sock) => {
  if (!rooms[roomId]) {
    return false;
  }

  const socket = sock;
  socket.leave(socket.roomJoined);

  // Also destroy the room once left
  return destroyRoom(roomId);
};

// Get all sockets in a given room
const getSockets = (roomId) => {
  if (!rooms[roomId]) {
    return [];
  }
  return rooms[roomId].sockets;
};

// Get the profile data of all sockets in a given room
const getProfileData = (roomId) => {
  if (!rooms[roomId]) {
    return {};
  }

  const room = rooms[roomId];

  const data = {};

  // Sockets parse cookie data and have access to session variables
  if (room.player1) {
    data.player1 = {
      profile: room.player1.handshake.session.account.profile_name,
      username: room.player1.handshake.session.account.username,
    };
  }

  if (room.player2) {
    data.player2 = {
      profile: room.player2.handshake.session.account.profile_name,
      username: room.player2.handshake.session.account.username,
    };
  }

  return data;
};

// Get a player's status (player 1 or player 2)
const getPlayerStatus = (roomId, socket) => {
  if (!rooms[roomId]) {
    return null;
  } else if (socket === rooms[roomId].player1) {
    return 'player1';
  } else if (socket === rooms[roomId].player2) {
    return 'player2';
  }

  return null;
};

// Get data regarding all rooms (allow public facing data only)
const getRooms = () => {
  const roomKeys = Object.keys(rooms);

  return roomKeys.reduce((result, key) => {
    // Only return rooms that are open (publicly available)
    if (rooms[key].type === "open") {
      result.push({
        id: key, count: getPlayerCount(key), owner: rooms[key].owner
      });
    }

    return result;
  }, []);
};

// Filter all rooms to all available (open) rooms
const getAvailableRooms = () => {
  const allRooms = getRooms();
  const availableRooms = allRooms.filter(room => getPlayerCount(room.id) < 2);
  return availableRooms;
};

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  getSockets,
  getProfileData,
  getPlayerStatus,
  getPlayerCount,
  getRooms,
  getAvailableRooms,
  destroyRoom,
};
