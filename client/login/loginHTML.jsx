let profileSelection;
let profilePics;

const handleLogin = (e) => {
	e.preventDefault();
	
	if($("#user").val() == '' || $("#pass").val() == ''){
		handleError("Username or password is empty");
		return false;
	}
	
	sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);
	
	return false;
};

const LoginWindow = (props) => {
	return (
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
	);
};

const createLoginWindow = (csrf) => {
	ReactDOM.render(
		<LoginWindow csrf={csrf} />,
		document.querySelector("#main")
	);
};

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

const SignupWindow = (props) => {
	return (
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
	);
};

const alterPreviewImage = (e) => {
  const select = document.querySelector("#profileImgSelect");
  const key = select.options[select.selectedIndex].value;
  document.querySelector("#profilePreview").src = profilePics[key].imageFile;
}

const ProfileSelection = (props) => {
  
  const profileKeys = Object.keys(props.profiles);
  const profiles = profileKeys.map((key) => {
    const profile = props.profiles[key];
    
    return (
      <option value={key}>
        {profile.name}
      </option>
    );
  });
  
  return (
    <select name="profile_name" id="profileImgSelect" onChange={alterPreviewImage} className="custom-select">
      {profiles}
    </select>
  );
};

const populateProfileSelection = (profiles) => {
  console.log(profiles);
  ReactDOM.render(
    <ProfileSelection profiles={profiles} />,
    profileSelection
  );
}

const createSignupWindow = (csrf) => {
	ReactDOM.render(
		<SignupWindow csrf={csrf} />,
		document.querySelector("#main")
	);
};

const setup = (csrf) => {
	const loginButton = document.querySelector("#loginButton");
	const signupButton = document.querySelector("#signupButton");
	
	loginButton.addEventListener("click", (e) => {
		e.preventDefault();
		createLoginWindow(csrf);
		return false;
	});
	
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

const getToken = () => {
	sendAjax('GET', '/getToken', null, (result) => {
		setup(result.csrfToken);
	});
};

const getProfiles = () => {
  sendAjax('GET', '/getProfiles', null, (data) => {
    populateProfileSelection(data.profilePics);
    profilePics = data.profilePics;
  });
};

$(document).ready(() => {
	getToken();
});