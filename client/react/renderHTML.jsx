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

const disableDefaultForm = (e) => {
  e.preventDefault();
  return false;
};

const RoomWindow = (props) => {
  
  if(props.renderEmpty){
    return (<div></div>);
  }
  
  let rooms = props.rooms;
  
  if(rooms.length === 0){
    rooms = [{id: "No Rooms Available", count: 0}];
  };
  
  const roomOptions = rooms.map((room) => {
    const bgColor = "bg-secondary";
    return (
      <a href="#" className={`list-group-item list-group-item-action ${bgColor}`}
        data-room={room.id} onClick={onRoomSelect}>{room.id} {room.count}/2</a>
    );
  });
  
  return (
    <div id="roomSelect">
      <h1>Game Select</h1>
      <hr />
      <form
        id="roomForm" name="roomForm"
        action="#room"
        onSubmit={disableDefaultForm}
        method="POST"
        className="roomForm"
      >
        <fieldset>
          <div className="form-group text-centered">
            <button onClick={createRoom} className="btn btn-lg btn-primary">Create New Game</button>
          </div>
          <div className="form-group">
            <div className="input-group">
              <input id="roomName" type="text" className="form-control" placeholder="roomcode123" />
              <span className="input-group-btn">
                <button onClick={joinRoom} className="btn btn-lg btn-success">Join Game</button>
              </span>
            </div>
          </div>
          <div className="form-group">
            <h2>Existing Games</h2>
            <div className="list-group" id="roomOptions" onClick={onRoomSelect}>
              {roomOptions}
            </div>
          </div>
        </fieldset>
      </form>
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