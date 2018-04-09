//Construct the main game window (the canvas)
const GameWindow = (props) => {
  return (
    <canvas id="viewport" width={props.width} height={props.height}></canvas>
  );
};

const renderGame = (width, height) => {
  ReactDOM.render(
    <GameWindow width={width} height={height} />,
    document.querySelector("#main")
  );
  
  //Hook up viewport (display canvas) to JS code
  viewport = document.querySelector("#viewport");
  viewCtx = viewport.getContext('2d');
  viewport.addEventListener('mousemove', getMouse);
  viewport.addEventListener('mouseleave', processMouseLeave);
  viewport.addEventListener('click', processClick);
};

const RoomWindow = (props) => {
  
  if(props.renderEmpty){
    return (<div></div>);
  }
  
  const roomOptions = props.rooms.map((room) => {
    return <option value={room.id}>{room.id} {room.count}/2</option>
  });
  
  return (
    <div id="roomSelect">
      <p>
        <button onClick={createRoom}>Create Room</button>
      </p>
      <p>
        <input id="roomName" type="text" />
        <button onClick={joinRoom}>Join Room</button>
      </p>
      <select id="roomOptions" onClick={onRoomSelect}>
        {roomOptions}
      </select>
    </div>
  );
};

const renderRoomSelection = (rooms, renderEmpty) => {
  ReactDOM.render(
    <RoomWindow rooms={rooms} renderEmpty={renderEmpty} />,
    document.querySelector("#room")
  );
}

const ErrorMessage = (props) => {
  return (
    <div className="alert alert-dismissible alert-danger">
      <a href="#" className="close" data-dismiss="alert">&times;</a>
      Error: {props.message}
    </div>
  );
}

const handleError = (message) => {
	//$("#errorMessage").text(message);
	//$("#errorMessage").animate({ width: 'toggle' }, 350);
  ReactDOM.render(
    <ErrorMessage message={message} />,
    document.querySelector("#errorMessage")
  );
};

const redirect = (response) => {
	//$("#domoMessage").animate({ width: 'hide' }, 350);
	window.location = response.redirect;
};

const sendAjax = (type, action, data, success) => {
	$.ajax({
		cache: false,
		type,
		url: action,
		data,
		dataType: "json",
		success,
		error: (xhr, status, error) => {
			const messageObj = JSON.parse(xhr.responseText);
			handleError(messageObj.error);
		},
	});
};