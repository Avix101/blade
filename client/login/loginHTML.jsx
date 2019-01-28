let profileSelection;

//Process a request to login to a user's account
const handleLogin = (e) => {
	e.preventDefault();

	if($("#user").val() == '' || $("#pass").val() == ''){
		handleError("Username or password is empty");
		return false;
	}

	sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);

	return false;
};

//Process a request to login as a guest
const handleGuestLogin = (e) => {
  e.preventDefault();

  sendAjax('GET', $("#guestLoginForm").attr("action"), null, redirect);

  return false;
};

//Process a request to login with reddit
const handleRedditLogin = (e) => {
  e.preventDefault();

  sendAjax('GET', $("#redditLoginForm").attr("action"), null, redirect);

  return false;
};

//Construct a login window / form that allows the user to enter their details
const LoginWindow = (props) => {
	return (
		<div className="row">
      <div className="col-lg-6">
        <form id="loginForm" name="loginForm"
          onSubmit={handleLogin}
          action="/login"
          method="POST"
          className="mainForm"
        >
          <fieldset>
            <legend>Login</legend>
            <div className="form-group row">
              <label htmlFor="username" className="col-sm-3 col-form-label">Username: </label>
              <div className="col-sm-9">
                <input id="user" className="form-control" type="text" name="username" placeholder="username" />
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="pass" className="col-sm-3 col-form-label">Password: </label>
              <div className="col-sm-9">
                <input id="pass" className="form-control" type="password" name="pass" placeholder="password" />
              </div>
            </div>
            <input type="hidden" name="_csrf" value={props.csrf} />
            <div className="form-group row row-centered text-center">
              <div className="col-sm-2"></div>
              <div className="col-sm-8 col-centered">
                <input id="loginButton" className="formSubmit btn btn-lg btn-primary" type="submit" value="Sign in" />
              </div>
              <div className="col-sm-2"></div>
            </div>
          </fieldset>
        </form>
      </div>
      <div className="col-lg-6 border-left">
        <form id="guestLoginForm" name="guestLoginForm"
          onSubmit={handleGuestLogin}
          action="/guestLogin"
          method="POST"
          className="mainForm"
        >
          <fieldset>
            <legend>Alternative Logins</legend>
            <input type="hidden" name="_csrf" value={props.csrf} />
            <div className="form-group row row-centered text-center">
              <div className="col-sm-2"></div>
              <div className="col-sm-8 col-centered">
                <input id="guestLoginButton" className="formSubmit btn btn-lg btn-primary" type="submit" value="Login as guest" />
              </div>
              <div className="col-sm-2"></div>
            </div>
          </fieldset>
        </form>
        <form id="redditLoginForm" name="redditLoginForm"
          onSubmit={handleRedditLogin}
          action="/redditLogin"
          method="POST"
          className="mainForm"
        >
          <fieldset>
            <input type="hidden" name="_csrf" value={props.csrf} />
            <div className="form-group row row-centered text-center">
              <div className="col-sm-2"></div>
              <div className="col-sm-8 col-centered">
                <button id="redditLoginButton" className="formSubmit btn btn-lg btn-danger" type="submit">
                  Login w/ reddit <span className="fab fa-reddit-alien"></span>
                </button>
              </div>
              <div className="col-sm-2"></div>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
	);
};

//Render the login window
const createLoginWindow = (csrf) => {
	ReactDOM.render(
		<LoginWindow csrf={csrf} />,
		document.querySelector("#main")
	);
};

//Handle a request from a user to sign up for a new account
const handleSignup = (e) => {
	e.preventDefault();

	if($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == ''){
		handleError("All fields are required");
		return false;
	}

	if($("#pass").val() !== $("#pass2").val()){
		handleError("Passwords do not match");
		return false;
	}

	sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect);

	return false;
};

//Construct a sign up window that allows users to select a username, password, and profile character
const SignupWindow = (props) => {
	return (
    <div className="row">
      <div className="col-lg-3"></div>
      <div className="col-lg-6">
        <form id="signupForm"
          name="signupForm"
          onSubmit={handleSignup}
          action="/signup"
          method="POST"
          className="mainForm"
        >
          <fieldset>
            <legend>Sign Up</legend>
            <div className="form-group row">
              <label htmlFor="username" className="col-sm-3 col-form-label">Username: </label>
              <div className="col-sm-9">
                <input id="user" className="form-control" type="text" name="username" placeholder="username" />
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="pass" className="col-sm-3 col-form-label">Password: </label>
              <div className="col-sm-9">
                <input id="pass" className="form-control" type="password" name="pass" placeholder="password" />
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="pass2" className="col-sm-3 col-form-label">Password: </label>
              <div className="col-sm-9">
                <input id="pass2" className="form-control" type="password" name="pass2" placeholder="retype password" />
              </div>
            </div>
						<div className="card text-white bg-danger mb-3">
						  <div className="card-header"><span className="fas fa-exclamation-circle"></span> Warning</div>
						  <div className="card-body">
						    <h4 className="card-title">Password Recommendation</h4>
						    <p className="card-text">Please DO NOT use a password for this site that you use for anything else.
								Expect that your password could be compromised, even though it's unlikely.</p>
						  </div>
						</div>
						<div className="form-group row">
              <input id="passWarningAck" className="form-control col-sm-3" type="checkbox" name="pass_warning_ack" />
              <div className="col-sm-9">
								<label htmlFor="passWarningAck" className="col-form-label">I understand the above warning about my password and accept
								that it's my responsibility to keep my valuable passwords safe.</label>
							</div>
            </div>
            <hr />
            <div className="form-group row vertical-center">
              <label className="col-sm-4 col-form-label">Profile Icon: </label>
              <div id="profileSelection" className="col-sm-4"></div>
              <div className="col-sm-4">
                <img id="profilePreview" className="profileIcon" src="/assets/img/player_icons/alfin.png" alt="profile" />
              </div>
            </div>
            <hr />
            <input type="hidden" name="_csrf" value={props.csrf} />
            <div className="form-group row row-centered text-center">
              <div className="col-sm-2"></div>
              <div className="col-sm-8 col-centered">
                <input id="signupButton" className="formSubmit btn btn-lg btn-primary" type="submit" value="Sign Up" />
              </div>
              <div className="col-sm-2"></div>
            </div>
          </fieldset>
        </form>
      </div>
      <div className="col-lg-3"></div>
    </div>
	);
};

//Render the signup window
const createSignupWindow = (csrf) => {
	ReactDOM.render(
		<SignupWindow csrf={csrf} />,
		document.querySelector("#main")
	);
};

//Setup the login / signup page
const setup = (csrf) => {
	const loginButton = document.querySelector("#loginButton");
	const signupButton = document.querySelector("#signupButton");

	loginButton.addEventListener("click", (e) => {
		e.preventDefault();
		createLoginWindow(csrf);
		return false;
	});

  //If the user switches contexts, update the shown form
	signupButton.addEventListener("click", (e) => {
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
const getToken = () => {
	sendAjax('GET', '/getToken', null, (result) => {
		setup(result.csrfToken);
	});
};

//When the page loads, get a token
$(document).ready(() => {
	getToken();
});
