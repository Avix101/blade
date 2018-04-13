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
    id: roomId,
    sockets: [],
    owner: 'Anonymous',
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
  if (socket.roomJoined !== roomId) {
    socket.leave(socket.roomJoined);
    socket.join(roomId);
    socket.roomJoined = roomId;
  }

  const room = rooms[roomId];
  const playerCount = getPlayerCount(roomId);

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

const destroyRoom = (roomId) => {
  if (!rooms[roomId]) {
    return false;
  }

  rooms[roomId] = null;
  delete rooms[roomId];
  return true;
};

const leaveRoom = (roomId, sock) => {
  if (!rooms[roomId]) {
    return false;
  }

  const socket = sock;
  socket.leave(socket.roomJoined);

  return destroyRoom(roomId);
};

const getSockets = (roomId) => {
  if (!rooms[roomId]) {
    return [];
  }
  return rooms[roomId].sockets;
};

const getProfileData = (roomId) => {
  if (!rooms[roomId]) {
    return {};
  }

  const room = rooms[roomId];

  const data = {};

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
  return roomKeys.map(key => ({ id: key, count: getPlayerCount(key), owner: rooms[key].owner }));
};

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
