const rooms = {};

const getPlayerCount = (roomId) => {
  if (!rooms[roomId]) {
    return -1;
  }
  return rooms[roomId].sockets.length;
};

const createRoom = (roomId) => {
  if (rooms[roomId]) {
    return false;
  }

  rooms[roomId] = {
    sockets: [],
    player1: null,
    player2: null,
  };

  return true;
};

const joinRoom = (roomId, sock) => {
  if (!rooms[roomId]) {
    return false;
  }

  const socket = sock;
  socket.leave(socket.roomJoined);
  socket.join(roomId);
  socket.roomJoined = roomId;

  const room = rooms[roomId];
  const playerCount = getPlayerCount(roomId);

  switch (playerCount) {
    case 0:
      room.sockets.push(socket);
      room.player1 = socket;
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

const getSockets = (roomId) => {
  if (!rooms[roomId]) {
    return [];
  }
  return rooms[roomId].sockets;
};

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

const getRooms = () => {
  const roomKeys = Object.keys(rooms);
  return roomKeys.map(key => ({ id: key, count: getPlayerCount(key) }));
};

const getAvailableRooms = () => {
  const allRooms = getRooms();
  const availableRooms = allRooms.filter(room => room.count < 2);
  return availableRooms;
};

const destroyRoom = (roomId) => {
  if (!rooms[roomId]) {
    return false;
  }

  rooms[roomId] = null;
  delete rooms[roomId];
  return true;
};

module.exports = {
  createRoom,
  joinRoom,
  getSockets,
  getPlayerStatus,
  getPlayerCount,
  getRooms,
  getAvailableRooms,
  destroyRoom,
};
