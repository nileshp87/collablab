$('#passwordModal').on('hidden.bs.modal', function() {
  $('#idNumber').focus();
  $('#currentPassword').val('');
  $('#newPassword').val('');
  $('#repeatPassword').val('');
  $("#currentPassword").removeClass('has-error');
  $("#repeatPassword").removeClass('has-error');
});

$('#passwordModal').on('shown.bs.modal', function() {
  $('#currentPassword').focus();
});

function login(){
  var idNumber = $("#idNumber").val().trim();
  var password = $("#password").val().trim();
  if(!isValidId(idNumber) && !isValidUsername(idNumber)){
    addError('idNumber', 'Please enter a valid username or ID number here');
    return false;
  }
  if(password.length < 5){
    addError('password', 'Password is required, and must be at least 5 characters long');
  }
  data = JSON.stringify({'idNumber': idNumber, 'password': password});

  postData('/users/login', data, function(statusCode){
    switch(statusCode){
      case 0: successfulLogin(); break;
      case 1: invalidCredentials(); break;
      case 2: showNeedsPassword(); break;
    }
  });
  return false;
}

function showNeedsPassword(){
  $('#hiddenId').val(idNumber);
  $('#passwordModal').modal('show');
}

function successfulLogin(){
  location.replace('/manage/home');
}

function invalidCredentials(){
  addError('password', 'Incorrect login information given!');
  addError('idNumber', 'Incorrect login information given!');
}
