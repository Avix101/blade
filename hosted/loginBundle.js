"use strict";

var profileSelection = void 0;

//Process a request to login to a user's account
var handleLogin = function handleLogin(e) {
  e.preventDefault();

  if ($("#user").val() == '' || $("#pass").val() == '') {
    handleError("Username or password is empty");
    return false;
  }

  sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);

  return false;
};

//Process a request to login as a guest
var handleGuestLogin = function handleGuestLogin(e) {
  e.preventDefault();

  sendAjax('GET', $("#guestLoginForm").attr("action"), null, redirect);

  return false;
};

//Process a request to login with reddit
var handleRedditLogin = function handleRedditLogin(e) {
  e.preventDefault();

  return false;
};

//Construct a login window / form that allows the user to enter their details
var LoginWindow = function LoginWindow(props) {
  return React.createElement(
    "div",
    { className: "row" },
    React.createElement(
      "div",
      { className: "col-lg-6" },
      React.createElement(
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
      )
    ),
    React.createElement(
      "div",
      { className: "col-lg-6 border-left" },
      React.createElement(
        "form",
        { id: "guestLoginForm", name: "guestLoginForm",
          onSubmit: handleGuestLogin,
          action: "/guestLogin",
          method: "POST",
          className: "mainForm"
        },
        React.createElement(
          "fieldset",
          null,
          React.createElement(
            "legend",
            null,
            "Alternative Logins"
          ),
          React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
          React.createElement(
            "div",
            { className: "form-group row row-centered text-center" },
            React.createElement("div", { className: "col-sm-2" }),
            React.createElement(
              "div",
              { className: "col-sm-8 col-centered" },
              React.createElement("input", { id: "guestLoginButton", className: "formSubmit btn btn-lg btn-primary", type: "submit", value: "Login as guest" })
            ),
            React.createElement("div", { className: "col-sm-2" })
          )
        )
      ),
      React.createElement(
        "form",
        { id: "redditLoginForm", name: "redditLoginForm",
          onSubmit: handleRedditLogin,
          action: "/redditLogin",
          method: "POST",
          className: "mainForm"
        },
        React.createElement(
          "fieldset",
          null,
          React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
          React.createElement(
            "div",
            { className: "form-group row row-centered text-center" },
            React.createElement("div", { className: "col-sm-2" }),
            React.createElement(
              "div",
              { className: "col-sm-8 col-centered" },
              React.createElement(
                "button",
                { id: "redditLoginButton", className: "formSubmit btn btn-lg btn-danger", type: "submit" },
                "Login w/ Reddit ",
                React.createElement("span", { className: "fab fa-reddit-alien" })
              )
            ),
            React.createElement("div", { className: "col-sm-2" })
          )
        )
      )
    )
  );
};

//Render the login window
var createLoginWindow = function createLoginWindow(csrf) {
  ReactDOM.render(React.createElement(LoginWindow, { csrf: csrf }), document.querySelector("#main"));
};

//Handle a request from a user to sign up for a new account
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

//Construct a sign up window that allows users to select a username, password, and profile character
var SignupWindow = function SignupWindow(props) {
  return React.createElement(
    "div",
    { className: "row" },
    React.createElement("div", { className: "col-lg-3" }),
    React.createElement(
      "div",
      { className: "col-lg-6" },
      React.createElement(
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
      )
    ),
    React.createElement("div", { className: "col-lg-3" })
  );
};

//Render the signup window
var createSignupWindow = function createSignupWindow(csrf) {
  ReactDOM.render(React.createElement(SignupWindow, { csrf: csrf }), document.querySelector("#main"));
};

//Setup the login / signup page
var setup = function setup(csrf) {
  var loginButton = document.querySelector("#loginButton");
  var signupButton = document.querySelector("#signupButton");

  loginButton.addEventListener("click", function (e) {
    e.preventDefault();
    createLoginWindow(csrf);
    return false;
  });

  //If the user switches contexts, update the shown form
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

//Get a new csrf token from the server
var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

//When the page loads, get a token
$(document).ready(function () {
  getToken();
});
"use strict";

var profilePics = void 0;

//If the user selects a different profile character, update the preview image to match
var alterPreviewImage = function alterPreviewImage(e) {
  var select = document.querySelector("#profileImgSelect");
  var key = select.options[select.selectedIndex].value;
  document.querySelector("#profilePreview").src = profilePics[key].imageFile;
};

//Construct a profile character selection window
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

//Render / populate the character selection window
var populateProfileSelection = function populateProfileSelection(profiles) {
  ReactDOM.render(React.createElement(ProfileSelection, { profiles: profiles }), profileSelection);
};

//Get all possible profile characters from the server
var getProfiles = function getProfiles() {
  sendAjax('GET', '/getProfiles', null, function (data) {
    populateProfileSelection(data.profilePics);
    profilePics = data.profilePics;
  });
};

//Hide the success message
var hideSuccess = function hideSuccess(e) {
  e.preventDefault();
  handleSuccess("", true);
};

//Hide the error message
var hideError = function hideError(e) {
  e.preventDefault();
  handleError("", true);
};

//Construct a success message window
var SuccessMessage = function SuccessMessage(props) {

  var className = "alert alert-dismissable alert-success";

  if (props.hide) {
    className = className + " hidden";
  }

  return React.createElement(
    "div",
    { className: className },
    React.createElement(
      "a",
      { href: "#", className: "close", onClick: hideSuccess },
      "\xD7"
    ),
    "Success: ",
    props.message
  );
};

//Construct an error message window
var ErrorMessage = function ErrorMessage(props) {

  var className = "alert alert-dismissible alert-danger";

  if (props.hide) {
    className = className + " hidden";
  }

  return React.createElement(
    "div",
    { className: className },
    React.createElement(
      "a",
      { href: "#", className: "close", onClick: hideError },
      "\xD7"
    ),
    "Error: ",
    props.message
  );
};

var successMessage = "";
var successRepeatCount = 1;

//Handle a successful action by displaying a message to the user
var handleSuccess = function handleSuccess(message, hide) {

  if (!hide) {
    handleError("", true);
  }

  if (window.hideModal) {
    hideModal();
  }

  var msg = message;

  if (successMessage === message) {
    successRepeatCount++;
    msg = message + " (x" + successRepeatCount + ")";
  } else {
    successMessage = msg;
    successRepeatCount = 1;
  }

  ReactDOM.render(React.createElement(SuccessMessage, { message: msg, hide: hide }), document.querySelector("#successMessage"));

  $('html, body').scrollTop(0);
};

var errorMessage = "";
var errorRepeatCount = 1;

//Handle an error message by displaying an error message to the user
var handleError = function handleError(message, hide) {

  if (!hide) {
    handleSuccess("", true);
  }

  if (window.hideModal) {
    hideModal();
  }

  var msg = message;

  if (errorMessage === message) {
    errorRepeatCount++;
    msg = message + " (x" + errorRepeatCount + ")";
  } else {
    errorMessage = msg;
    errorRepeatCount = 1;
  }

  ReactDOM.render(React.createElement(ErrorMessage, { message: msg, hide: hide }), document.querySelector("#errorMessage"));

  $('html, body').scrollTop(0);
};

//Redirect the user to a new page
var redirect = function redirect(response) {
  window.location = response.redirect;
};

//Send an Ajax request to the server to get or post info
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
