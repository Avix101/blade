//Construct the main game window (the canvas)
const GameWindow = (props) => {
  return (
    <canvas id="viewport" width={props.width} height={props.height}></canvas>
  );
};

const MusicAndChatWindow = (props) => {
  return (
    <div className="text-center">
      <h1>Music Player</h1>
      <hr />
      <iframe 
        src="https://www.youtube.com/embed/videoseries?list=PLbzURmDMdJdNHYJnRQjXxa0bDZyPcslpO"
        frameBorder="0" allow="autoplay; encrypted-media" id="videoFrame">
      </iframe>
      
      <h1>Chat Window</h1>
      <hr />
      <textarea id="chat" readOnly className="form-control"></textarea>
      <div className="input-group">
        <input id="chatBox" type="text" className="form-control" placeholder="Message..." />
        <span className="input-group-btn">
          <button onClick={sendChatMessage} className="btn btn-lg btn-primary">Send</button>
        </span>
      </div>
    </div>
  );
}

const renderRightPanel = () => {
  ReactDOM.render(
    <MusicAndChatWindow />,
    document.querySelector("#rightPanel")
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
  
  renderRightPanel();
};

const disableDefaultForm = (e) => {
  e.preventDefault();
  return false;
};

const handlePasswordChange = (e) => {
	e.preventDefault();
	
	if($("#newPassword").val() == '' || $("#newPassword2").val() == '' || $("#password").val() == ''){
		handleError("All fields are required to change password.");
		return false;
	}
  
  if($("#newPassword").val() !==  $("#newPassword2").val()){
    handleError("New password and password confirmation must match");
    return false;
  }

  sendAjax('POST', $("#passwordChangeForm").attr("action"), $("#passwordChangeForm").serialize(), () => {
    handleSuccess("Password successfully changed!");
    $("#newPassword").val("");
    $("#newPassword2").val("");
    $("#password").val("");
  });
	
	return false;
};

const handleFeedback = (e) => {
  e.preventDefault();
  
  if($("#feedbackName").val() == '' || $("#feedbackText").val == ''){
    handleError("Both a name and feedback are required");
    return false;
  }
  
  sendAjax('POST', $("#feedbackForm").attr("action"), $("#feedbackForm").serialize(), () => {
    handleSuccess("Feedback successfully submitted!");
    $("#feedbackText").val("");
  });
  
  return false;
};

const RoomWindow = (props) => {
  
  if(props.renderEmpty){
    return (<div></div>);
  }
  
  let roomOptions;
  
  const bgColor = "bg-secondary";
  if(props.rooms.length > 0){
    roomOptions = props.rooms.map((room) => {
      return (
        <a href="#" className={`list-group-item list-group-item-action ${bgColor}`}
          data-room={room.id} onClick={onRoomSelect}
        >
          User: {room.owner} Code: {room.id}
        </a>
      );
    });
  } else {
    roomOptions = [(
      <a href="#" className={`list-group-item list-group-item-action ${bgColor}`}
          data-room="" onClick={onRoomSelect}>No Rooms Available</a>
    )];
  }
  
  
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
            <hr />
            <div className="list-group" id="roomOptions" onClick={onRoomSelect}>
              {roomOptions}
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

const InstructionsWindow = (props) => {
  return (
    <div className="container">
      <div className="jumbotron">
        <h1 className="display-3">Instructions:</h1>
        <p className="lead">Want to know how to play Blade? Well, let me help!</p>
        <hr className="my-4" />
        <h2>General Game Rules</h2>
        <ol>
          <li>To start, each player draws a card from their deck. Then, the player with a lower
          score begins their turn.</li>
          <li>If you play a numbered card, that card will be transfered to your field pile, and its value
          will be added to your total (special cards behave differently- please see below).</li>
          <li>Every turn, the current player has to make sure their total value is higher than
          their opponent's.</li>
          <li>If both players' card values are ever equal (even during the initial draw phase)
          all current cards are wiped from the field, players start again at 0, and must draw from
          their decks.</li>
          <li>Effect cards (cards without a number: bolt, mirror, blast, &amp; force) may not be used last.
          Players with only effect cards remaining (excluding 1s) will lose when it becomes their turn.</li>
        </ol>
        <h2>Special Cards</h2>
        <ul id="specialCardList">
          <li>
            <div className="instructionsCard">
              <img className="rounded pull-left" src="/assets/img/cards/06x Bolt.png" alt="Bolt Card" />
              <p>Bolt cards nullify the most recently played card on the opponent's field. For example,
              if your opponent played a 7 on their last turn, and you played a bolt, your opponent's 7 would
              be flipped and not counted in their score.</p>
            </div>
          </li>
          <li> 
            <div className="instructionsCard">
              <img className="rounded pull-left" src="/assets/img/cards/02x Wand.png" alt="1 Card" />
              <p>1s provide you with an opporunity to recover from a bolt card. If you play a 1 when
              the top card on your field is turned over, the turned over card will recover. If you play a 1
              when the top card isn't turned over, it will act as a regular numbered card.</p>
            </div>
          </li>
          <li> 
            <div className="instructionsCard">
              <img className="rounded pull-left" src="/assets/img/cards/04x Mirror.png" alt="Mirror Card" />
              <p>Mirror cards will switch your field pile with your opponent's. This is best used when the point difference
              between you and your opponent is large.</p>
            </div>
          </li>
          <li> 
            <div className="instructionsCard">
              <img className="rounded pull-left" src="/assets/img/cards/02x Blast.png" alt="Blast Card" />
              <p>Blast cards allow you to select one of your opponent's cards and wipe it from their hand. As an
              additional special rule, when you play a blast card, you keep your turn and get to play another card.</p>
            </div>
          </li>
          <li> 
            <div className="instructionsCard">
              <img className="rounded pull-left" src="/assets/img/cards/02x Force.png" alt="Force Card" />
              <p>Force cards double your current field score. (Example: a field score of 19 would be
              turned into 38). Force cards are placed in your field pile and can be bolted, recovered, and mirrored
              like regular numbered cards.</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

const AboutWindow = (props) => {
  return (
    <div className="container">
      <div className="jumbotron">
        <h1 className="display-3">Trails of Cold Steel</h1>
        <p className="lead">Check out the original games!</p>
        <hr className="my-4" />
        <h2>ToCS 1</h2>
        <img className="banner" src="/assets/img/tocs1.jpg" alt="Trails of Cold Steel 1 Banner" />
        <p className="lead aboutPara">Trails of Cold Steel is a Japanese RPG made by Falcom, and published by XSEED in the US. The first
        ToCS is the 6th entry in the 'Trails' or 'Kiseki' saga which is part of an even larger series
        titled "The Legend of Heroes". Blade is a recreation of a minigame found in ToCS.</p>
        <p className="lead aboutPara">To find out more about the original game and how to purchase a copy for yourself, please visit its
        Steam store page.</p>
        <div className="text-centered button-div">
          <a href="http://store.steampowered.com/app/538680/The_Legend_of_Heroes_Trails_of_Cold_Steel/" target="_blank">
            <button className="btn btn-lg btn-primary">ToCS Steam Page</button>
          </a>
        </div>
        <hr className="my-4" />
        
        <h2>ToCS II</h2>
        <img className="banner" src="/assets/img/tocs2.jpg" alt="Trails of Cold Steel 2 Banner" />
        <p className="lead aboutPara">The second entry in the Cold Steel arc of the Trails series picks up
        where the first one left off. It is highly recommended that the games are played in order. Blade exists in
        both games, but the 'Blast' and 'Force' cards were introduced in ToCS II.</p>
        <p className="lead aboutPara">If you're ready to learn more about the second Trails of Cold Steel game,
        please visit the Steam store page. Be aware that the page contains spoilers for the first game.</p>
        <div className="text-centered button-div">
          <a href="http://store.steampowered.com/app/748490/The_Legend_of_Heroes_Trails_of_Cold_Steel_II/" target="_blank">
            <button className="btn btn-lg btn-primary">ToCS II Steam Page</button>
          </a>
        </div>
        
      </div>
    </div>
  );
};

const FeedbackWindow = (props) => {
  return(
    <div className="container">
      <div className="jumbotron">
        <h1 className="display-3">Feedback:</h1>
        <p className="lead">Have something to say about the site? Please let me know!</p>
        <hr className="my-4" />
        
        <form
        id="feedbackForm" name="feedbackForm"
        action="/feedback"
        onSubmit={handleFeedback}
        method="POST"
        >
          <fieldset>
            <div className="form-group text-centered row">
              <div className="col-sm-6">
                <label htmlFor="name">Name:</label>
                <input id="feedbackName" name="name" type="text" className="form-control" value={username} />
              </div>
              <div className="col-sm-6">
                <label htmlFor="contact">Contact (Optional):</label>
                <input id="feedbackContact" name="contact" type="text" className="form-control" placeholder="123@email.com" />
              </div>
            </div>
            <div className="form-group">
              <textarea id="feedbackText" name="feedback" className="form-control" placeholder="Feedback..." />
            </div>
            <input type="hidden" name="_csrf" value={props.csrf} />
            <div className="form-group">
              <input type="submit" id="feedbackSubmit" value="Submit Feedback" className="btn btn-lg btn-success" />
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

const ProfileWindow = (props) => {
  return (
    <div className="container">
      <div className="jumbotron">
        <h1 className="display-3">Personal Profile:</h1>
        <p className="lead">All about you! Kinda.</p>
        <hr className="my-4" />
        
        <h2>User Info</h2>
        <p className="lead">Username: {username}</p>
        <p className="lead">Profile Pic:
          <img src={profileImage} alt="profileImage" />
        </p>
        <hr className="my-4" />
        
        <h2>Change Password</h2>
        <form
        id="passwordChangeForm" name="passwordChangeForm"
        action="/changePassword"
        onSubmit={handlePasswordChange}
        method="POST"
        >
          <fieldset>
            <div className="form-group text-centered row">
              <label htmlFor="newPassword" className="col-sm-3 col-form-label">New Password:</label>
              <div className="col-sm-2">
                <input id="newPassword" name="newPassword" type="password" className="form-control" placeholder="New Password" />
              </div>
              <div className="col-sm-3"></div>
              <div className="col-sm-4"></div>
            </div>
            <div className="form-group text-centered row">
              <label htmlFor="newPassword2" className="col-sm-3 col-form-label">Confirm New Password:</label>
              <div className="col-sm-2">
                <input id="newPassword2" name="newPassword2" type="password" className="form-control" placeholder="Confirm" />
              </div>
              <div className="col-sm-3"></div>
              <div className="col-sm-4"></div>
            </div>
            <div className="form-group text-centered row">
              <label htmlFor="password" className="col-sm-3 col-form-label">Current Password:</label>
              <div className="col-sm-2">
                <input id="password" name="password" type="password" className="form-control" placeholder="Current Password" />
              </div>
              <div className="col-sm-3"></div>
              <div className="col-sm-4"></div>
            </div>
            <input type="hidden" name="_csrf" value={props.csrf} />
            <div className="form-group text-centered row">
              <div className="col-sm-5">
                <input type="submit" id="passwordChangeSubmit" value="Change Password" className="btn btn-lg btn-warning formSubmit" />
              </div>
              <div className="col-sm-3"></div>
              <div className="col-sm-4"></div>
            </div>
          </fieldset>
        </form>
        <hr className="my-4" />
        
        <div id="gameHistory">
        </div>
      </div>
    </div>
  );
};

const GameHistory = (props) => {
  
  console.log(props.games);
  
  let games = props.games.sort((gameA, gameB) => {
    const timeA = new Date(gameA.date).getTime();
    const timeB = new Date(gameB.date).getTime();
    return timeB - timeA;
  });
  
  let wins = 0;
  let losses = 0;
  games = games.map((game, index) => {
    
    const date = new Date(game.date);
    const playerProfile = game.playerIdentity === "player1" ? game.player1 : game.player2;
    const opponentProfile = game.playerIdentity === "player1" ? game.player2 : game.player1;
    const playerScore = game.playerIdentity === "player1" ? game.player1Score : game.player2Score;
    const opponentScore = game.playerIdentity === "player1" ? game.player2Score : game.player1Score;
    
    let gameStatus;
    let gameStatusColor;
    
    if(game.winner === game.playerIdentity){
      gameStatus = "WIN";
      gameStatusColor = "text-success";
      wins++;
    } else if (game.winner === "player1" || game.winner === "player2"){
      gameStatus = "LOSS";
      gameStatusColor = "text-danger";
      losses++;
    } else {
      gameStatus = "TIE";
      gameStatusColor = "text-warning";
    }
    
    return (
      <li className="list-group-item d-flex bg-light">
        <div className="gameHistory">
          <span className="badge badge-primary badge-pill">#{index + 1}</span>
          <figure className="text-centered">
            <img src={playerProfile.profileData.imageFile} alt={playerProfile.profileData.name} />
            <figcaption>{playerProfile.username}</figcaption>
          </figure>
          <span> VS </span>
          <figure className="text-centered">
            <img src={opponentProfile.profileData.imageFile} alt={opponentProfile.profileData.name} />
            <figcaption>{opponentProfile.username}</figcaption>
          </figure>
        </div>
        <div className="gameHistory pull-right text-center">
          <h1 className={gameStatusColor}>{gameStatus}</h1>
          <p>{playerProfile.username}'s Score: {playerScore}</p>
          <p>{opponentProfile.username}'s Score: {opponentScore}</p>
          <p>Date of Game: {date.toDateString()}</p>
        </div>
      </li>
    );
  });
  
  const totalGameBarWidth = {width: `${(games.length / games.length) * 100}%`};
  const winGameBarWidth = {width: `${(wins / games.length) * 100}%`};
  const lossGameBarWidth = {width: `${(losses / games.length) * 100}%`};
  
  return (
    <div>
      <h2>Game History</h2>
      <p className="lead">Total Games Played: <span className="text-info">{games.length}</span></p>
      <div className="progress">
        <div className="progress-bar progress-bar-striped progress-bar-animated bg-info"
          role="progressbar" 
          aria-value={games.length}
          aria-valuemin="0"
          aria-valuemax={games.length}
          style={totalGameBarWidth}
        ></div>
      </div>
      
      <p className="lead aboutPara">Wins: {wins}/{games.length}</p>
      <div className="progress">
        <div className="progress-bar progress-bar-striped progress-bar-animated bg-success"
          role="progressbar" 
          aria-value={wins}
          aria-valuemin="0"
          aria-valuemax={games.length}
          style={winGameBarWidth}
        ></div>
      </div>
      
      <p className="lead aboutPara">Losses: {losses}/{games.length}</p>
      <div className="progress">
        <div className="progress-bar progress-bar-striped progress-bar-animated bg-danger"
          role="progressbar" 
          aria-value={losses}
          aria-valuemin="0"
          aria-valuemax={games.length}
          style={lossGameBarWidth}
        ></div>
      </div>
      <br />
      
      <div id="gameHistoryList">
        <ul className="list-group">
          {games}
        </ul>
      </div>
    </div>
  );
}

const clearLeftPane = () => {
  ReactDOM.render(
    <div></div>,
    document.querySelector("#room")
  );
};

const renderGameHistory = (games) => {
  ReactDOM.render(
    <GameHistory games={games} />,
    document.querySelector("#gameHistory")
  );
};

const renderProfile = () => {
  getTokenWithCallback((csrfToken) => {
    ReactDOM.render(
      <ProfileWindow csrf={csrfToken} />,
      document.querySelector("#main")
    );
  });
  
  sendAjax('GET', '/getGameHistory', null, (data) => {
    renderGameHistory(data.data);
  });
  
  clearLeftPane();
};

const renderFeedback = () => {
  getTokenWithCallback((csrfToken) => {
    ReactDOM.render(
      <FeedbackWindow csrf={csrfToken} />,
      document.querySelector("#main")
    );
  });
  
  clearLeftPane();
};

const renderAbout = () => {
  ReactDOM.render(
    <AboutWindow />,
    document.querySelector("#main")
  );
  clearLeftPane();
};

const renderInstructions = () => {
  ReactDOM.render(
    <InstructionsWindow />,
    document.querySelector("#main")
  );
  
  clearLeftPane();
};

const getTokenWithCallback = (callback) => {
	sendAjax('GET', '/getToken', null, (result) => {
		if(callback){
      callback(result.csrfToken);
    }
	});
};

const renderRoomSelection = (rooms, renderEmpty) => {
  ReactDOM.render(
    <RoomWindow rooms={rooms} renderEmpty={renderEmpty} />,
    document.querySelector("#room")
  );
};