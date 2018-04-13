const hideSuccess = (e) => {
  e.preventDefault();
  handleSuccess("", true);
};

const hideError = (e) => {
  e.preventDefault();
  handleError("", true);
}

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

const handleSuccess = (message, hide) => {
  
  if(!hide){
    handleError("", true);
  }
  
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

const handleError = (message, hide) => {
  
  if(!hide){
    handleSuccess("", true);
  }
  
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