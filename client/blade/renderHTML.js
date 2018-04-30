//Construct the main game window (the canvas)
const GameWindow = (props) => {
  return (
    <div>
      <canvas id="viewport" width={props.width} height={props.height}></canvas>
      <div className="text-center">
        <button onClick={goFullscreen} id="fullscreenButton" className="btn btn-lg btn-primary moveDown">Go Fullscreen</button>
        <button onClick={exitFullscreen} 
          id="exitFullscreenButton" className="hidden fullscreenButton btn btn-lg btn-danger">Exit Fullscreen
        </button>
      </div>
    </div>
  );
};

//Construct the right panel which holds a Youtube iframe and a chat box
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
};

//Exit fullscreen
const exitFullscreen = () => {
  const viewport = document.querySelector("#viewport");
  const fullscreenButton = document.querySelector("#fullscreenButton");
  const exitFullscreenButton = document.querySelector("#exitFullscreenButton");
  
  if(viewport){
    viewport.classList.remove("fullscreen");
    const dimensions = calcDisplayDimensions();
    viewport.width = dimensions.width;
    viewport.height = dimensions.height;
    fullscreenButton.classList.remove("hidden");
    exitFullscreenButton.classList.add("hidden");
  }
};

//Enable fullscreen for gameplay
const goFullscreen = () => {
  const viewport = document.querySelector("#viewport");
  const fullscreenButton = document.querySelector("#fullscreenButton");
  const exitFullscreenButton = document.querySelector("#exitFullscreenButton");
  
  if(viewport){
    viewport.width = window.innerWidth;
    viewport.height = window.innerHeight;
    viewport.classList.add("fullscreen");
    fullscreenButton.classList.add("hidden");
    exitFullscreenButton.classList.remove("hidden");
  }
};

//Render the right panel
const renderRightPanel = () => {
  ReactDOM.render(
    <MusicAndChatWindow />,
    document.querySelector("#rightPanel")
  );
};

//Render the main game
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

//Disables the auto-submit functionality of a form
const disableDefaultForm = (e) => {
  e.preventDefault();
  return false;
};

//Handle a request to change a password
const handlePasswordChange = (e) => {
	e.preventDefault();
	
  //Password fields cannot be empty
	if($("#newPassword").val() == '' || $("#newPassword2").val() == '' || $("#password").val() == ''){
		handleError("All fields are required to change password.");
		return false;
	}
  
  //New password and password confirmation should match
  if($("#newPassword").val() !==  $("#newPassword2").val()){
    handleError("New password and password confirmation must match");
    return false;
  }

  //Send the data to the server via Ajax
  sendAjax('POST', $("#passwordChangeForm").attr("action"), $("#passwordChangeForm").serialize(), () => {
    handleSuccess("Password successfully changed!");
    $("#newPassword").val("");
    $("#newPassword2").val("");
    $("#password").val("");
  });
	
	return false;
};

//Handle a request to change a user's icon
const handleIconChange = (e) => {
  e.preventDefault();
  
  //No need to validate- user can't make a wrong decision, and if they hack into the select,
  //the server will verify the data
  const data = $("#iconChangeForm").serialize();
  sendAjax('POST', $("#iconChangeForm").attr("action"), data, () => {
    handleSuccess(`Player icon successfully changed!`);
    const profileName = $("#profileImgSelect option:selected").val();
    profileImage = profilePics[profileName].imageFile;
    $("#profile").attr('src', profileImage);
    renderProfile();
  });
  
  return false;
};

//Handle a request to change a user's privacy setting
const handlePrivacyChange = (e) => {
  e.preventDefault();
  
  //Again, no need to validate- either true or false
  sendAjax('POST', $("#privacyChangeForm").attr("action"), $("#privacyChangeForm").serialize(), () => {
    handleSuccess('Privacy mode updated!');
    privacy = $("#privacySetting").val();
    renderProfile();
  });
  
  return false;
};

//Process a request to hide a modal
const hideModal = () => {
  const modal = document.querySelector("#modalContainer div");
  
  if(!modal){
    return;
  }
  
  modal.classList.remove("show");
  modal.classList.add("hide-anim");
  
  if(resetOnClose){
    endGame();
    resetGame();
  }
};

//Handle a request to submit feedback
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

//Handle a request to get a list of public games
const handlePublicGameRequest = (e) => {
  e.preventDefault();
  
  sendAjax('GET', $("#publicGameResultsForm").attr("action"), $("#publicGameResultsForm").serialize(), (data) => {
    renderPublicGameList(data.data);
  });
  
  return false;
};

//Construct a window to create / join a room for playing Blade
const RoomWindow = (props) => {
  
  if(props.renderEmpty){
    return (<div></div>);
  }
  
  let roomOptions;
  
  //Construct a list of available rooms if there are any
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
  
  //Return the created and formatted form
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

//Construct an instructions panel for the main section of the site
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

//Construct an about window that holds info pertaining to Trails of Cold Steel I and II
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

//Construct a panel / form for submitting user feedback about the site
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

//Construct a profile panel that holds user info, a password change screen, and game history data
const ProfileWindow = (props) => {
  
  //Determine privacy mode data
  let dataPrivate;
  let privateButtonMsg;
  let privateButtonClass;
  if(privacy === "true" || privacy === true){
    dataPrivate = false;
    privateButtonMsg = "Disable Privacy Mode";
    privateButtonClass = "btn btn-lg btn-danger formSubmit";
  } else {
    dataPrivate = true;
    privateButtonMsg = "Enable Privacy Mode";
    privateButtonClass = "btn btn-lg btn-success formSubmit";
  }
  
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
        
        <h2>Change Player Icon</h2>
        <form
        id="iconChangeForm" name="iconChangeForm"
        action="/changeIcon"
        onSubmit={handleIconChange}
        method="POST"
        >
          <fieldset>
            <div className="form-group row vertical-center">
              <label className="col-sm-3 col-form-label">Profile Icon: </label>
              <div id="profileSelection" className="col-sm-2"></div>
              <div className="col-sm-4">
                <img id="profilePreview" className="profileIcon" src="/assets/img/player_icons/alfin.png" alt="profile" />
              </div>
            </div>
            <input type="hidden" name="_csrf" value={props.csrf} />
            <div className="form-group text-centered row">
              <div className="col-sm-5">
                <input type="submit" id="iconChangeSubmit" value="Change Icon" className="btn btn-lg btn-info formSubmit" />
              </div>
              <div className="col-sm-3"></div>
              <div className="col-sm-4"></div>
            </div>
          </fieldset>
        </form>
        <hr className="my-4" />
        
        <h2>Game Results Privacy</h2>
        <form
        id="privacyChangeForm" name="privacyChangeForm"
        action="/changePrivacy"
        onSubmit={handlePrivacyChange}
        method="POST"
        >
          <fieldset>
            <p className="lead">While privacy mode is enabled for either you or your opponent,
            the results of played games will default to not being publicly viewable. Both
            players must choose to make a game public for it to be public.</p>
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input id="privacySetting" type="hidden" name="privacy" value={dataPrivate} />
            <div className="form-group text-centered row">
              <div className="col-sm-5">
                <input type="submit" id="privacyChangeSubmit" value={privateButtonMsg} className={privateButtonClass} />
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

//Construct a game history panel the lists a user's previous matches
const GameHistory = (props) => {
  
  //Sort the games by most recently played to least recently
  let games = props.games.sort((gameA, gameB) => {
    const timeA = new Date(gameA.date).getTime();
    const timeB = new Date(gameB.date).getTime();
    return timeB - timeA;
  });
  
  //Create a panel that holds all relevant data pertaining to game result
  let wins = 0;
  let losses = 0;
  games = games.map((game, index) => {
    
    const date = new Date(game.date);
    const playerProfile = game.playerIdentity === "player1" ? game.player1 : game.player2;
    const opponentProfile = game.playerIdentity === "player1" ? game.player2 : game.player1;
    const playerScore = game.playerIdentity === "player1" ? game.player1Score : game.player2Score;
    const opponentScore = game.playerIdentity === "player1" ? game.player2Score : game.player1Score;
    const playerPrivacy = game.playerIdentity === "player1" ? game.player1Privacy : game.player2Privacy;
    const opponentPrivacy = game.playerIdentity === "player1" ? game.player2Privacy : game.player1Privacy;
    
    let playerPrivacyMsg;
    let opponentPrivacyMsg;
    let privacyButton;
    
    if(opponentPrivacy === true){
      opponentPrivacyMsg = "Opponent vote: Private";
    } else {
      opponentPrivacyMsg = "Opponent vote: Public";
    }
    
    const status = !playerPrivacy && !opponentPrivacy ? "Public" : "Private";
    
    //Construct a privacy setting for the game based on the current settings
    if(playerPrivacy === true){
      playerPrivacyMsg = "Your vote: Private";
      
      const title = `${playerPrivacyMsg}, ${opponentPrivacyMsg}, Status: ${status}`;
      privacyButton = (
        <button className="btn btn-lg btn-success" data-private="false" onClick={changeGamePrivacy} title={title}>
          Make Public <span className="fas fa-unlock"></span>
        </button>
      );
    } else {
      playerPrivacyMsg = "Your vote: Public";
      const title = `${playerPrivacyMsg}, ${opponentPrivacyMsg}, Status: ${status}`;
      privacyButton = (
        <button className="btn btn-lg btn-danger" data-private="true" onClick={changeGamePrivacy} title={title}>
          Make Private <span className="fas fa-lock"></span>
        </button>
      );
    }
    
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
        <div className="buttonDiv">
          <div>
            <span data-id={game.id}></span>
            <button className="btn btn-lg btn-primary" onClick={requestPlaybackData}>
              Watch Replay <span className="fas fa-play"></span>
            </button>
            <br />
            {privacyButton}
          </div>
        </div>
      </li>
    );
  });
  
  const totalGameBarWidth = {width: `${(games.length / games.length) * 100}%`};
  const winGameBarWidth = {width: `${(wins / games.length) * 100}%`};
  const lossGameBarWidth = {width: `${(losses / games.length) * 100}%`};
  
  //Build the entire game history panel, with all game results included
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
      
      <p className="lead">Sorted by most recent to least recent:</p>
      <div id="gameHistoryList">
        <ul className="list-group">
          {games}
        </ul>
      </div>
    </div>
  );
};

const PublicGameList = (props) => {
  
  let games = props.games;
  games = games.map((game, index) => {
    
    const date = new Date(game.date);
    const player1Profile = game.player1;
    const player2Profile = game.player2;
    const player1Score = game.player1Score;
    const player2Score = game.player2Score;
    
    let gameStatus;
    const gameStatusColor = "text-primary";
    
    if(game.winner === "player1"){
      gameStatus = `${player1Profile.username}'s WIN`;
    } else if (game.winner === "player2"){
      gameStatus = `${player2Profile.username}'s WIN`;
    } else {
      gameStatus = "TIED GAME";
    }
    
    return (
      <li className="list-group-item d-flex bg-light">
        <div className="publicGameItem">
          <span className="badge badge-primary badge-pill">#{index + 1}</span>
          <figure className="text-centered">
            <img src={player1Profile.profileData.imageFile} alt={player1Profile.profileData.name} />
            <figcaption>{player1Profile.username}</figcaption>
          </figure>
          <span> VS </span>
          <figure className="text-centered">
            <img src={player2Profile.profileData.imageFile} alt={player2Profile.profileData.name} />
            <figcaption>{player2Profile.username}</figcaption>
          </figure>
        </div>
        <div className="publicGameItem pull-right text-center">
          <h1 className={gameStatusColor}>{gameStatus}</h1>
          <p>{player1Profile.username}'s Score: {player1Score}</p>
          <p>{player2Profile.username}'s Score: {player2Score}</p>
          <p>Date of Game: {date.toDateString()}</p>
        </div>
        <div className="buttonDiv">
          <span data-id={game.id}></span>
          <button className="btn btn-lg btn-primary" onClick={requestPlaybackData}>
            Watch Replay <span className="fas fa-play"></span>
          </button>
        </div>
      </li>
    );
  });
  
  let gameLists = [];
  let paginationTabs = [];
  
  //Break up the number of returned games into chunks of 10
  for(let i = 0; i < games.length; i += 10){
    
    const numGamesLeft = games.length - i;
    let gameSet;
    
    if(numGamesLeft <= 10){
      gameSet = games.slice(i);
    } else {
      gameSet = games.slice(i, i + 10);
    }
    
    //If it's the first set, make it visible. Otherwise, hide the set
    if(i == 0){
      gameLists.push(
        <ul id={`gameSet${gameLists.length}`} className="list-group">
          {gameSet}
        </ul>
      );
      paginationTabs.push(
        <li id={`gameLink${paginationTabs.length}`} className="page-item active">
          <button className="page-link" data-set={paginationTabs.length} onClick={changePublicGameSet}>{paginationTabs.length + 1}</button>
        </li>
      );
    } else {
      gameLists.push(
        <ul id={`gameSet${gameLists.length}`} className="list-group hidden">
          {gameSet}
        </ul>
      );
      paginationTabs.push(
        <li id={`gameLink${paginationTabs.length}`} className="page-item">
          <button className="page-link" data-set={paginationTabs.length} onClick={changePublicGameSet}>{paginationTabs.length + 1}</button>
        </li>
      );
    }
  };
  
  //Build the entire public game list panel, with all game results included
  return (
    <div>
      <p className="lead">Sorted by most recent to least recent:</p>
      <p className="lead"># of Results: {games.length}</p>
      <div id="publicGameHistoryList">
        {gameLists}
      </div>
      <div className="flexCenter">
        <ul id="publicGamePagination" className="pagination pagination-lg">
          <li className="page-item">
            <button className="page-link" data-set="0" onClick={changePublicGameSet}>&laquo;</button>
          </li>
          {paginationTabs}
          <li className="page-item">
            <button className="page-link" data-set={paginationTabs.length - 1} onClick={changePublicGameSet}>&raquo;</button>
          </li>
        </ul>
      </div>
    </div>
  );
};

//Construct a game history panel the lists a collection of publicly available matches
const PublicResults = (props) => {
  const april13th2018 = '2018-04-13';
  const today = new Date().toISOString().split("T")[0];
  
  return (
    <div className="container">
      <div className="jumbotron">
        <h1 className="display-3">Public Game Results:</h1>
        <p className="lead">Search for games and watch replays!</p>
        <hr className="my-4" />
        <form id="publicGameResultsForm" name="publicGameResultsForm"
          onSubmit={handlePublicGameRequest}
          action="/getPublicGames"
          method="GET"
          className="mainForm"
        >
          <h2>Game Search Criteria</h2>
          <fieldset>
            <div className="form-group row vertical-align">
              <label htmlFor="username" className="col-sm-3 col-from-label">Username: </label>
              <div className="col-sm-9">
                <input id="user" className="form-control" type="text" name="username" placholder="Case Sensitive Username" />
              </div>
            </div>
            <div className="form-group row vertical-align">
              <label htmlFor="startDate" className="col-sm-3 col-from-label">Start Date: </label>
              <div className="col-sm-9">
                <input id="startDate" className="form-control" type="date" name="startDate"
                  min={april13th2018} max={today} /*value={april13th2018}*/
                />
              </div>
            </div>
            <div className="form-group row vertical-align">
              <label htmlFor="endDate" className="col-sm-3 col-from-label">End Date: </label>
              <div className="col-sm-9">
                <input id="endDate" className="form-control" type="date" name="endDate"
                  min={april13th2018} max={today} /*value={today}*/
                />
              </div>
            </div>
            <div className="form-group row vertical-align">
              <label htmlFor="limit" className="col-sm-3 col-from-label">Game result limit: </label>
              <div className="col-sm-9">
                <select name="limit" className="custom-select">
                  <option value="50" selected>50</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="unlim">Unlimited</option>
                </select>
              </div>
            </div>
            <input type="hidden" name="_csrf" value={props.csrf} />
            <div className="form-group row vertical-align">
              <input type="submit" id="getPublicGames" value="Search For Games" className="btn btn-lg btn-primary" />
            </div>
          </fieldset>
        
        </form>
        <hr className="my-4" />
        <h2>Results</h2>
        <div id="publicGameResults"></div>
      </div>
    </div>
  );
};

//Build a pop-out modal window to display to the user
const SiteModal = (props) => {
  const id = "playbackModal";
  
  let modalBody;
  
  if(props.render){
    const dimensions = calcDisplayDimensions();
    const ratio = Math.min(window.innerHeight * 0.5 / dimensions.height, 1);
    dimensions.width *= ratio;
    dimensions.height *= ratio;
    modalBody = (
	  <div>
	    <canvas id="viewportModal" className="animateExpand" width={dimensions.width} height={dimensions.height}></canvas>
	    <hr />
      <div id="playbackOptions">
        <PlaybackOptions />
	    </div>
	  </div>
	);
  } else {
    modalBody = <p>Loading playback data... <span className="fas fa-sync fa-spin"></span></p>;
  }
  
  return (
    <div id={id} className="modal show" tabindex="-1" role="dialog">
      <div id="pageMask"></div>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title">Game Playback</h1>
            <button className="close" data-dismiss="modal" aria-label="Close" onClick={hideModal}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {modalBody}
          </div>
          <div className="modal-footer">
            <button className="btn btn-lg btn-primary" data-dismiss="modal" onClick={hideModal}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const PlaybackOptions = (props) => {
	
  let player1Name;
  let player2Name;
  if(playerProfiles["player1"] && playerProfiles["player2"]){
    player1Name = playerProfiles['player1'].username;
    player2Name = playerProfiles['player2'].username;
  } else {
    player1Name = "Player 1";
    player2Name = "Player 2";
  }
  
  if(!isPlayingBack){
    return (
      <div className="container text-center">
        <div className="row row-centered">
          <div className="form-group col-sm-6 mx-auto">
            <div className="custom-control custom-checkbox">
              <input type="checkbox" id="bypassWaitCheck" className="custom-control-input" checked={bypassWait} onChange={changeBypassWait}/>
              <label className="custom-control-label" htmlFor="bypassWaitCheck">Quick Play (Bypass accurate player wait times)</label>
            </div>
          </div>
        </div>
        <div className="row row-centered">
          <div className="form-group col-sm-6 mx-auto">
            <label classNam="custom-control-label" htmlFor="perspectiveSelect">Perspective: </label>
            <select id="perspectiveSelect" className="custom-select">
              <option value="player1" selected> {player1Name}'s </option>
              <option value="player2"> {player2Name}'s </option>
            </select>
          </div>
        </div>
        <div className="row row-centered">
          <div className="form-group col-sm-6 mx-auto">
            <button className="btn btn-lg btn-success" onClick={startPlayback}>Start Playback</button>
          </div>
        </div>
      </div>
    );
  } else {
    const progressWidth = {width: `${(props.progress / props.total) * 100}%`};
    return (
      <div>
        <p className="lead aboutPara">Playback Progress:</p>
        <div className="progress">
          <div className="progress-bar progress-bar-striped progress-bar-animated bg-info"
            role="progressbar" 
            aria-value={props.progress}
            aria-valuemin="0"
            aria-valuemax={props.total}
            style={progressWidth}
          ></div>
        </div>
      </div>
    );
  }
};

//Render the bypass wait control
const renderPlaybackOptions = () => {
	
  const modal = document.querySelector("#modalContainer div");
  
  if(!modal){
    return;
  }
  
  ReactDOM.render(
		<PlaybackOptions 
      progress={playbackSequenceCount - turnSequence.length}
      total={playbackSequenceCount}
    />,
		document.querySelector("#playbackOptions")
	);
};

//Change which set of public games is being viewed
const changePublicGameSet = (e) => {
  //Turn off active link / hide the active game set
  const gamePagination = document.querySelector("#publicGamePagination");
  const activeLink = gamePagination.querySelector(".active");
  const activeLinkId = activeLink.getAttribute("id");
  const activeGameSet = document.querySelector(`#gameSet${activeLinkId.charAt(activeLinkId.length - 1)}`);
  activeLink.classList.remove("active");
  activeGameSet.classList.add("hidden");
  
  //Active the necessary tab
  const dataSet = e.target.getAttribute("data-set");
  document.querySelector(`#gameLink${dataSet}`).classList.add("active");
  document.querySelector(`#gameSet${dataSet}`).classList.remove("hidden");
};

//Request playback data from the server
const requestPlaybackData = (e) => {
  
  if(inRoom){
    handleError("Cannot request playback while in a game room!");
    return;
  }
  
  const id = e.target.parentElement.querySelector("span").getAttribute('data-id');
  
  setTimeout(() => {
	socket.emit('requestPlaybackData', { id });
  }, 1000);
  
  renderPlayback(false);
}

//Change a game's privacy setting
const changeGamePrivacy = (e) => {
  
  const id = e.target.parentElement.querySelector("span").getAttribute('data-id');
  const privacySetting = e.target.getAttribute('data-private');
  
  getTokenWithCallback((csrfToken) => {
    const data = `id=${id}&privacy_setting=${privacySetting}&_csrf=${csrfToken}`;
    sendAjax('POST', '/changeGamePrivacy', data, () => {
      handleSuccess("Game privacy successfully changed!");
      renderProfile();
    });
  });
};

//Handle an error sent from the server
const processError = (data) => {
  handleError(data.error, false);
}

//Render the site's dialog box / modal (playback mode)
const renderPlayback = (renderDisplay) => {
  ReactDOM.render(
    <SiteModal render={renderDisplay} />,
    document.querySelector("#modalContainer")
  );
  
  const modal = document.querySelector("#modalContainer div");
  
  if(!modal){
    return;
  }
  
  modal.classList.remove("hide-anim");
  modal.classList.add("show");
}

//Render the left panel as empty
const clearLeftPane = () => {
  ReactDOM.render(
    <div></div>,
    document.querySelector("#room")
  );
};

//Make a call to render the public game history
const renderPublicResults = () => {  
  getTokenWithCallback((csrfToken) => {
    ReactDOM.render(
      <PublicResults csrf={csrfToken} />,
      document.querySelector("#main")
    );
  });
  
  clearLeftPane();
};

//Handle game results sent from the server
const renderPublicGameList = (games) => {
  ReactDOM.render(
    <PublicGameList games={games} />,
    document.querySelector("#publicGameResults")
  );
};

//Make a call to render the game history section
const renderGameHistory = (games) => {
  ReactDOM.render(
    <GameHistory games={games} />,
    document.querySelector("#gameHistory")
  );
};

//Make a call to render the profile panel
const renderProfile = () => {
  getTokenWithCallback((csrfToken) => {
    ReactDOM.render(
      <ProfileWindow csrf={csrfToken} />,
      document.querySelector("#main")
    );
    
    getProfiles();
  });
  
  //Request game history data
  sendAjax('GET', '/getGameHistory', null, (data) => {
    renderGameHistory(data.data);
  });
  
  clearLeftPane();
};

//Make a call to render the feedback panel
const renderFeedback = () => {
  getTokenWithCallback((csrfToken) => {
    ReactDOM.render(
      <FeedbackWindow csrf={csrfToken} />,
      document.querySelector("#main")
    );
  });
  
  clearLeftPane();
};

//Make a call to render the about ToCS I and II panel
const renderAbout = () => {
  ReactDOM.render(
    <AboutWindow />,
    document.querySelector("#main")
  );
  clearLeftPane();
};

//Make a call to render the instructions panel
const renderInstructions = () => {
  ReactDOM.render(
    <InstructionsWindow />,
    document.querySelector("#main")
  );
  
  clearLeftPane();
};

//Request a newe csrf token and then execute a callback when one is retrieved
const getTokenWithCallback = (callback) => {
	sendAjax('GET', '/getToken', null, (result) => {
		if(callback){
      callback(result.csrfToken);
    }
	});
};

//Render the room selection panel (left side)
const renderRoomSelection = (rooms, renderEmpty) => {
  ReactDOM.render(
    <RoomWindow rooms={rooms} renderEmpty={renderEmpty} />,
    document.querySelector("#room")
  );
};