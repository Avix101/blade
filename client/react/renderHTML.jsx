let profilePics;

//If the user selects a different profile character, update the preview image to match
const alterPreviewImage = (e) => {
  const select = document.querySelector("#profileImgSelect");
  const key = select.options[select.selectedIndex].value;
  document.querySelector("#profilePreview").src = profilePics[key].imageFile;
}

//Construct a profile character selection window
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

//Render / populate the character selection window
const populateProfileSelection = (profiles) => {
  ReactDOM.render(
    <ProfileSelection profiles={profiles} />,
    profileSelection
  );
}

//Get all possible profile characters from the server
const getProfiles = () => {
  sendAjax('GET', '/getProfiles', null, (data) => {
    populateProfileSelection(data.profilePics);
    profilePics = data.profilePics;
  });
};

//Hide the success message
const hideSuccess = (e) => {
  e.preventDefault();
  handleSuccess("", true);
};

//Hide the error message
const hideError = (e) => {
  e.preventDefault();
  handleError("", true);
}

//Construct a success message window
const SuccessMessage = (props) => {
  
  let className = "alert alert-dismissable alert-success";
 
  if(props.hide){
      className = `${className} hidden`;
  }
  
  return (
    <div className={className}>
      <a href="#" className="close" onClick={hideSuccess}>&times;</a>
      Success: {props.message}
    </div>
  );
};

//Construct an error message window
const ErrorMessage = (props) => {
  
  let className = "alert alert-dismissible alert-danger";
 
  if(props.hide){
      className = `${className} hidden`;
  }
  
  return (
    <div className={className}>
      <a href="#" className="close" onClick={hideError}>&times;</a>
      Error: {props.message}
    </div>
  );
};

let successMessage = "";
let successRepeatCount = 1;

//Handle a successful action by displaying a message to the user
const handleSuccess = (message, hide) => {
  
  if(!hide){
    handleError("", true);
  }
  
  hideModal();
  
  let msg = message;
  
  if(successMessage === message){
    successRepeatCount++;
    msg = `${message} (x${successRepeatCount})`;
  } else {
    successMessage = msg;
    successRepeatCount = 1;
  }
  
  ReactDOM.render(
    <SuccessMessage message={msg} hide={hide} />,
    document.querySelector("#successMessage")
  );
  
  $('html, body').scrollTop(0);
};

let errorMessage = "";
let errorRepeatCount = 1;

//Handle an error message by displaying an error message to the user
const handleError = (message, hide) => {
  
  if(!hide){
    handleSuccess("", true);
  }
  
  hideModal();
  
  let msg = message;
  
  if(errorMessage === message){
    errorRepeatCount++;
    msg = `${message} (x${errorRepeatCount})`;
  } else {
    errorMessage = msg;
    errorRepeatCount = 1;
  }
  
  ReactDOM.render(
    <ErrorMessage message={msg} hide={hide} />,
    document.querySelector("#errorMessage")
  );
  
  $('html, body').scrollTop(0);
};

//Redirect the user to a new page
const redirect = (response) => {
	window.location = response.redirect;
};

//Send an Ajax request to the server to get or post info
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