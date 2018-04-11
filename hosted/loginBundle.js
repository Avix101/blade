"use strict";

var profileSelection = void 0;
var profilePics = void 0;

var handleLogin = function handleLogin(e) {
  e.preventDefault();

  if ($("#user").val() == '' || $("#pass").val() == '') {
    handleError("Username or password is empty");
    return false;
  }

  sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);

  return false;
};

var LoginWindow = function LoginWindow(props) {
  return React.createElement(
    "form",
    { id: "loginForm", name: "loginForm",
      onSubmit: handleLogin,
      action: "/login",
      method: "POST",
      className: "mainForm"
    },
    React.createElement(
      "fieldset",
      null,
      React.createElement(
        "legend",
        null,
        "Login"
      ),
      React.createElement(
        "div",
        { className: "form-group row" },
        React.createElement(
          "label",
          { htmlFor: "username", className: "col-sm-3 col-form-label" },
          "Username: "
        ),
        React.createElement(
          "div",
          { className: "col-sm-9" },
          React.createElement("input", { id: "user", className: "form-control", type: "text", name: "username", placeholder: "username" })
        )
      ),
      React.createElement(
        "div",
        { className: "form-group row" },
        React.createElement(
          "label",
          { htmlFor: "pass", className: "col-sm-3 col-form-label" },
          "Password: "
        ),
        React.createElement(
          "div",
          { className: "col-sm-9" },
          React.createElement("input", { id: "pass", className: "form-control", type: "password", name: "pass", placeholder: "password" })
        )
      ),
      React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
      React.createElement(
        "div",
        { className: "form-group row row-centered text-center" },
        React.createElement("div", { className: "col-sm-2" }),
        React.createElement(
          "div",
          { className: "col-sm-8 col-centered" },
          React.createElement("input", { id: "loginButton", className: "formSubmit btn btn-lg btn-primary", type: "submit", value: "Sign in" })
        ),
        React.createElement("div", { className: "col-sm-2" })
      )
    )
  );
};

var createLoginWindow = function createLoginWindow(csrf) {
  ReactDOM.render(React.createElement(LoginWindow, { csrf: csrf }), document.querySelector("#main"));
};

var handleSignup = function handleSignup(e) {
  e.preventDefault();

  if ($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
    handleError("All fields are required");
    return false;
  }

  if ($("#pass").val() !== $("#pass2").val()) {
    handleError("Passwords do not match");
    return false;
  }

  sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect);

  return false;
};

var SignupWindow = function SignupWindow(props) {
  return React.createElement(
    "form",
    { id: "signupForm",
      name: "signupForm",
      onSubmit: handleSignup,
      action: "/signup",
      method: "POST",
      className: "mainForm"
    },
    React.createElement(
      "fieldset",
      null,
      React.createElement(
        "legend",
        null,
        "Sign Up"
      ),
      React.createElement(
        "div",
        { className: "form-group row" },
        React.createElement(
          "label",
          { htmlFor: "username", className: "col-sm-3 col-form-label" },
          "Username: "
        ),
        React.createElement(
          "div",
          { className: "col-sm-9" },
          React.createElement("input", { id: "user", className: "form-control", type: "text", name: "username", placeholder: "username" })
        )
      ),
      React.createElement(
        "div",
        { className: "form-group row" },
        React.createElement(
          "label",
          { htmlFor: "pass", className: "col-sm-3 col-form-label" },
          "Password: "
        ),
        React.createElement(
          "div",
          { className: "col-sm-9" },
          React.createElement("input", { id: "pass", className: "form-control", type: "password", name: "pass", placeholder: "password" })
        )
      ),
      React.createElement(
        "div",
        { className: "form-group row" },
        React.createElement(
          "label",
          { htmlFor: "pass2", className: "col-sm-3 col-form-label" },
          "Password: "
        ),
        React.createElement(
          "div",
          { className: "col-sm-9" },
          React.createElement("input", { id: "pass2", className: "form-control", type: "password", name: "pass2", placeholder: "retype password" })
        )
      ),
      React.createElement("hr", null),
      React.createElement(
        "div",
        { className: "form-group row vertical-center" },
        React.createElement(
          "label",
          { className: "col-sm-4 col-form-label" },
          "Profile Icon: "
        ),
        React.createElement("div", { id: "profileSelection", className: "col-sm-4" }),
        React.createElement(
          "div",
          { className: "col-sm-4" },
          React.createElement("img", { id: "profilePreview", className: "profileIcon", src: "/assets/img/player_icons/alfin.png", alt: "profile" })
        )
      ),
      React.createElement("hr", null),
      React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
      React.createElement(
        "div",
        { className: "form-group row row-centered text-center" },
        React.createElement("div", { className: "col-sm-2" }),
        React.createElement(
          "div",
          { className: "col-sm-8 col-centered" },
          React.createElement("input", { id: "signupButton", className: "formSubmit btn btn-lg btn-primary", type: "submit", value: "Sign Up" })
        ),
        React.createElement("div", { className: "col-sm-2" })
      )
    )
  );
};

var alterPreviewImage = function alterPreviewImage(e) {
  var select = document.querySelector("#profileImgSelect");
  var key = select.options[select.selectedIndex].value;
  document.querySelector("#profilePreview").src = profilePics[key].imageFile;
};

var ProfileSelection = function ProfileSelection(props) {

  var profileKeys = Object.keys(props.profiles);
  var profiles = profileKeys.map(function (key) {
    var profile = props.profiles[key];

    return React.createElement(
      "option",
      { value: key },
      profile.name
    );
  });

  return React.createElement(
    "select",
    { name: "profile_name", id: "profileImgSelect", onChange: alterPreviewImage, className: "custom-select" },
    profiles
  );
};

var populateProfileSelection = function populateProfileSelection(profiles) {
  console.log(profiles);
  ReactDOM.render(React.createElement(ProfileSelection, { profiles: profiles }), profileSelection);
};

var createSignupWindow = function createSignupWindow(csrf) {
  ReactDOM.render(React.createElement(SignupWindow, { csrf: csrf }), document.querySelector("#main"));
};

var setup = function setup(csrf) {
  var loginButton = document.querySelector("#loginButton");
  var signupButton = document.querySelector("#signupButton");

  loginButton.addEventListener("click", function (e) {
    e.preventDefault();
    createLoginWindow(csrf);
    return false;
  });

  signupButton.addEventListener("click", function (e) {
    e.preventDefault();
    createSignupWindow(csrf);
    profileSelection = document.querySelector("#profileSelection");
    getProfiles();
    return false;
  });

  //Default to login screen initially
  createLoginWindow(csrf);
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

var getProfiles = function getProfiles() {
  sendAjax('GET', '/getProfiles', null, function (data) {
    populateProfileSelection(data.profilePics);
    profilePics = data.profilePics;
  });
};

$(document).ready(function () {
  getToken();
});
"use strict";

//Construct the main game window (the canvas)
var GameWindow = function GameWindow(props) {
  return React.createElement("canvas", { id: "viewport", width: props.width, height: props.height });
};

var renderGame = function renderGame(width, height) {
  ReactDOM.render(React.createElement(GameWindow, { width: width, height: height }), document.querySelector("#main"));

  //Hook up viewport (display canvas) to JS code
  viewport = document.querySelector("#viewport");
  viewCtx = viewport.getContext('2d');
  viewport.addEventListener('mousemove', getMouse);
  viewport.addEventListener('mouseleave', processMouseLeave);
  viewport.addEventListener('click', processClick);
};

var disableDefaultForm = function disableDefaultForm(e) {
  e.preventDefault();
  return false;
};

var RoomWindow = function RoomWindow(props) {

  if (props.renderEmpty) {
    return React.createElement("div", null);
  }

  var rooms = props.rooms;

  if (rooms.length === 0) {
    rooms = [{ id: "No Rooms Available", count: 0 }];
  };

  var roomOptions = rooms.map(function (room) {
    var bgColor = "bg-secondary";
    return React.createElement(
      "a",
      { href: "#", className: "list-group-item list-group-item-action " + bgColor,
        "data-room": room.id, onClick: onRoomSelect },
      room.id,
      " ",
      room.count,
      "/2"
    );
  });

  return React.createElement(
    "div",
    { id: "roomSelect" },
    React.createElement(
      "h1",
      null,
      "Game Select"
    ),
    React.createElement("hr", null),
    React.createElement(
      "form",
      {
        id: "roomForm", name: "roomForm",
        action: "#room",
        onSubmit: disableDefaultForm,
        method: "POST",
        className: "roomForm"
      },
      React.createElement(
        "fieldset",
        null,
        React.createElement(
          "div",
          { className: "form-group text-centered" },
          React.createElement(
            "button",
            { onClick: createRoom, className: "btn btn-lg btn-primary" },
            "Create New Game"
          )
        ),
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement(
            "div",
            { className: "input-group" },
            React.createElement("input", { id: "roomName", type: "text", className: "form-control", placeholder: "roomcode123" }),
            React.createElement(
              "span",
              { className: "input-group-btn" },
              React.createElement(
                "button",
                { onClick: joinRoom, className: "btn btn-lg btn-success" },
                "Join Game"
              )
            )
          )
        ),
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement(
            "h2",
            null,
            "Existing Games"
          ),
          React.createElement(
            "div",
            { className: "list-group", id: "roomOptions", onClick: onRoomSelect },
            roomOptions
          )
        )
      )
    )
  );
};

var renderRoomSelection = function renderRoomSelection(rooms, renderEmpty) {
  ReactDOM.render(React.createElement(RoomWindow, { rooms: rooms, renderEmpty: renderEmpty }), document.querySelector("#room"));
};

var ErrorMessage = function ErrorMessage(props) {
  return React.createElement(
    "div",
    { className: "alert alert-dismissible alert-danger" },
    React.createElement(
      "a",
      { href: "#", className: "close", "data-dismiss": "alert" },
      "\xD7"
    ),
    "Error: ",
    props.message
  );
};

var handleError = function handleError(message) {
  //$("#errorMessage").text(message);
  //$("#errorMessage").animate({ width: 'toggle' }, 350);
  ReactDOM.render(React.createElement(ErrorMessage, { message: message }), document.querySelector("#errorMessage"));
};

var redirect = function redirect(response) {
  //$("#domoMessage").animate({ width: 'hide' }, 350);
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};
