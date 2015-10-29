var closing_attempts = 0;
getStatus(true);
$('#registration').on('shown.bs.modal', function() {
  $('#name').focus();
});

$('#registration').on('hidden.bs.modal', function() {
  $('#idNumber').focus();
  $('#name').val('');
  $('#userIdNumber').val('');
  $('#approval').val('');
  $('#passphrase').val('');
  $('#username').val('');
  $("#approvalGroup").removeClass('has-error');
  $("#userIdNumberGroup").removeClass('has-error');
  $("#passphraseGroup").removeClass('has-error');
  $("#usernameGroup").removeClass('has-error');
});

$('#closeModal').on('hidden.bs.modal', function() {
  $('#idNumber').focus();
  $('#password').val('');
  $("#passwordGroup").removeClass('has-error');
});

$('#closeModal').on('shown.bs.modal', function() {
  $('#password').focus();
});

$('#kickModal').on('hidden.bs.modal', function(){
  $('#idNumber').val('');
});

$('#passwordModal').on('hidden.bs.modal', function() {
  $('#idNumber').focus();
  $('#currentPassword').val('');
  $('#newPassword').val('');
  $('#repeatPassword').val('');
  $("#currentPasswordGroup").removeClass('has-error');
  $("#repeatPasswordGroup").removeClass('has-error');
  $('#currentPasswordGroup').removeClass('hidden');
});

$('#passwordModal').on('shown.bs.modal', function() {
  if($('#currentPassword').val() != ''){
    $('#newPassword').focus();
  }else{
    $('#currentPassword').focus();
  }
});

function showNeedsPassword(idNumber){
  $('#hiddenId').val(idNumber);
  $('#passwordModal').modal('show');
}

function submitLogin(){
    hideModals();
    var idNumber = document.getElementById('idNumber').value;
    var convertedId = convertSwipe(idNumber);
    document.getElementById('idNumber').value = '';
    if(!isValidId(convertedId) && !isValidUsername(idNumber)){
        showMessage('Please try again!', 3000, 'error');
        return;
    }
    if(convertedId){
      swipe(convertedId);
    }else{
      swipe(idNumber);
    }
    document.getElementById('idNumber').focus();
    return false;
}

function swipe(idNumber){
  data = JSON.stringify({'idNumber':idNumber});
  postData('/lab/swipe', data,
  function(statusCode){
      switch(statusCode){
          case 0: showMessage('Success!'); break;
          case 1: showMessage('Lab is currently closed!', 2000, 'error'); break;
          case 2: showRegistration(idNumber); break;
          case 3: showUsersPresent(idNumber); break;
          case 4: showNeedsPassword(idNumber); break;
          default: showFailure(); break;
      }
  });
}

function showMessage(message, time, type){
  message = message || 'Success!';
  time = time || 2000;
  type = type || 'success';
  $('#idNumber').notify(message, {className: type, elementPosition: 'left middle', autoHideDelay: time});
  getStatus(true);
}

function showUsersPresent(idNumber){
  if(closing_attempts == 1){
    $("#closeModal").modal('show');
    $("#hiddenId").val(idNumber);
    $("#password").focus();
    closing_attempts = 0;
  }else{
    showMessage('Users are still present! Swipe again to close!', 4000, 'error');
    closing_attempts++;
    setTimeout( function() {
      closing_attempts = 0;
    }, 30000);
  }
}

function hideModals(){
  $('#kickModal').modal('hide');
  $('#passwordModal').modal('hide');
  $('#registration').modal('hide');
  $('#closeModal').modal('hide');
  getStatus(true);
}

function showRegistration(idNumber){
  if(!labStatus.open){
    showMessage('Lab is currently closed!', 2000, 'error');
    return;
  }
  $('#registration').modal('show');
  if(common.isValidId(idNumber)){
    document.getElementById('userIdNumber').value = idNumber;
  }else{
    document.getElementById('username').value = idNumber;
  }
}

function failedPassword(){
  $('#currentPassword').val('');
  $('#currentPassword').notify('Password is incorrect!', {className: 'error', elementPosition:'right'});
  $('#currentPassword').focus();
  $('#currentPasswordGroup').addClass('has-error');
}

function submitRegistration(){
  var name = $('#name').val().trim();
  var newId = convertSwipe($('#userIdNumber').val().trim());
  var approval = convertSwipe($('#approval').val().trim());
  var username = $('#username').val().trim();
  var passphrase = $('#passphrase').val().trim();

  if(isValidId(newId)){
    $('#userIdNumber').val(newId);
  }

  if(isValidId(approval)){
    $('#approval').val(approval);
  }

  if(name == ''){
    addError('name', 'Name is a required field!');
    return false;
  }
  if(passphrase == ''){
    if(approval == ''){
      $('#approval').focus();
      return false;
    }
  }
  if(!isNaN(name)){
    if(name != newId && name.length == 9){
      $('#approval').val(name);
      $('#approval').notify('Moved ID Here!', {className: 'success', elementPosition:'right middle', autoHideDelay: 1000});
    }
    addError('name', 'Name goes here!');
    return false;
  }

  if(!isValidName(name)){
    addError('name','Name can only contain a-z, A-Z!');
    return false;
  }

  if(newId == ''){
    $('#userIdNumber').focus();
    return false;
  }

  if(newId.length != 9 || isNaN(parseInt(newId))){
    addError('userIdNumber', 'Invalid swipe, try again!');
    return false;
  }

  if((approval.length != 9 || isNaN(parseInt(approval))) && passphrase == ''){
    addError('approval', 'Invalid swipe, try again!');
    return false;
  }
  if(username.length < 4){
    addError('username', 'Username must consist of at least 4 alphanumeric character!');
    return false;
  }

  if(!isValidUsername(username)){
    addError('username', 'Username must contain only alphanumeric characters!');
    return false;
  }

  data = JSON.stringify({'newId':newId, 'name':name, 'approverId': approval, 'username': username, 'passphrase': passphrase});
  postData('/users/register', data,
    function(statusCode){
        switch(statusCode){
            case 0:
                hideModals();
                showMessage('You\'ve successfully registered! :), give it a shot!', 4000);
                if(passphrase != ''){
                  $('#currentPassword').val(passphrase);
                }else{
                  $('#currentPassword').val(newId);
                }
                $('#currentPasswordGroup').addClass('hidden');
                $('#idNumber').val(newId);
                submitLogin();
                break;

            case 2:
                addError('approval', 'That wasn\'t a lab monitor\'s ID!');
                break;

            case 1:
                hideModals();
                showMessage('You\'re already registered!');
                break;
            case 3:
                addError('username', 'Username is already taken!');
                break;
            case 4:
                addError('passphrase', 'Your passphrase is invalid!');
                break;
            default: showFailure(); break;
        }
  });
  return false;
}

function changePassword() {
  var oldPassword = $('#currentPassword').val().trim();
  var newPassword = $('#newPassword').val().trim();
  var repeat = $('#repeatPassword').val().trim();
  var idNumber = $('#hiddenId').val().trim();

  if (oldPassword == ""){
    $('#currentPassword').notify('Passwords field blank!', {className: 'error', elementPosition:'right'});
    $('#currentPassword').focus();
    $('#currentPasswordGroup').addClass('has-error');
    return;
  }
  if(newPassword == ""){
    $('#newPassword').notify('Passwords field blank!', {className: 'error', elementPosition:'right'});
    $('#newPassword').focus();
    $('#newPasswordGroup').addClass('has-error');
    return;
  }
  if(repeat == "" || repeat != newPassword){
    $('#repeatPassword').notify('Passwords do not match!', {className: 'error', elementPosition:'right'});
    $('#repeatPassword').focus();
    $('#repeatPasswordGroup').addClass('has-error');
    return;
  }
  if(idNumber == ''){
    $('#passwordModal').modal('hide');
  }
  if(newPassword.length < 5){
    addError('newPassword', 'Password must be at least five characters long!');
    $('#repeatPassword').val('');
  }
  var data = {'password':oldPassword, 'newPassword':newPassword, 'idNumber': idNumber};

  postData('/users/changePassword', JSON.stringify(data), function(statusCode){
    switch(statusCode){
      case 0: hideModals(); break;
      case 1: failedPassword(); break;
    }
  });
}

function kickRemaining(){
  var password = $("#password").val().trim();
  var id = $("#hiddenId").val();
  if(password == ""){
    $("#password").focus();
    return false;
  }
  data = {'password':password, 'idNumber': id};
  postData('/lab/close', JSON.stringify(data), function(statusCode){
    switch(statusCode){
      case 0: hideModals(); showMessage('Lab closed!', 5000); break;
      case 1: wrongPassword(); break;
      case 2: hideModals(); showMessage('Your account has been locked!', 5000, 'error'); break;
    }
  });
}

function kick(username){
  $("#kickName").html(labStatus.members[username]);
  $("#kickModal").modal();
  $('#idNumber').val(username);
}

var labStatus = null;
getStatus();
setInterval(getStatus, 5000);

function getStatus(internal){
  getData('/lab/status', function(response){
    updatePage(response, internal);
  });
}

function updatePage(newStatus, internal){
  internal = internal || false;
  if(newStatus.open){
    document.getElementById('isOpen').innerHTML = 'OPEN';
    $('#isOpen').removeClass('text-danger');
    $('#isOpen').addClass('text-success');
  }else{
    document.getElementById('isOpen').innerHTML = 'CLOSED';
    $('#isOpen').removeClass('text-success');
    $('#isOpen').addClass('text-danger');
  }
  var newList = '';
  if(internal){
    for(index in newStatus.members){
      newList += "<button class=\"list-group-item\" onClick=\"kick('" + index +"')\">" + newStatus.members[index] +"</button>";
    }
  }else{
    for(index in newStatus.members){
      newList += "<li class=\"list-group-item\">" + newStatus.members[index] + '</li>';
    }
  }
  labStatus = newStatus;
  document.getElementById('who').innerHTML = newList;
}
