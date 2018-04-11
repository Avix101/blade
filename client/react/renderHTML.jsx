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