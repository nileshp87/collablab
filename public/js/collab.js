var labStatus = null;
var closing_attempts = 0;
getStatus();

$('#registration').on('shown.bs.modal', function() {
  $('#name').focus();
});

$('#registration').on('hidden.bs.modal', function() {
  $('#idNumber').focus();
});

$('#kickModal').on('hidden.bs.modal', function() {
  $('#idNumber').focus();
  $('#password').val('');
});

$('#kickModal').on('shown.bs.modal', function() {
  $('#password').focus();
});

$('#passwordModal').on('hidden.bs.modal', function() {
  $('#idNumber').focus();
  $('#currentPassword').val('');
  $('#newPassword').val('');
  $('#repeatPassword').val('');
});

$('#passwordModal').on('shown.bs.modal', function() {
  $('#currentPassword').focus();
});

function postData(url, data, callback){
    http = new XMLHttpRequest();
    http.open('POST', url, true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function() {
        if(http.readyState == 4 && http.status == 200) {
            callback(JSON.parse(http.responseText));
        }
    }
    http.send(data);
}

function showNeedsPassword(idNumber){
  $('#hiddenIdPassword').val(idNumber);
  $('#passwordModal').modal('show');
}

function getData(url, callback){
    http = new XMLHttpRequest();
    http.open('GET', url, true);
    http.onreadystatechange = function() {
        if(http.readyState == 4 && http.status == 200) {
            callback(JSON.parse(http.responseText));
        } }
    http.send(null);
}

function submitLogin(){
    idNumber = document.getElementById('idNumber').value;
    document.getElementById('idNumber').value = '';
    if(idNumber.length != 9){
        showBadRead();
        return;
    }
    data = JSON.stringify({'idNumber':idNumber});
    postData('/swipe', data,
    function(statusCode){
        switch(statusCode){
            case 0: showSuccess(); break;
            case 1: showFailure(); break;
            case 2: showRegistration(idNumber); break;
            case 3: showUsersPresent(idNumber); break;
            case 4: showNeedsPassword(idNumber); break;
            default: showFailure(); break;
        }
    });
    document.getElementById('idNumber').focus();
    return false;
}

function getStatus(){
  getData('/status', function(response){
    updatePage(response);
  });
}

function updatePage(newStatus){
  if(newStatus.open){
    document.getElementById('isOpen').innerHTML = 'OPEN';
    $('#isOpen').removeClass('text-danger');
    $('#isOpen').addClass('text-success');
  }else{
    document.getElementById('isOpen').innerHTML = 'CLOSED';
    $('#isOpen').removeClass('text-success');
    $('#isOpen').addClass('text-danger');
  }
  newList = '';

  for(index in newStatus.members){
    newList += '<li>' + newStatus.members[index] + '</li>';
  }
  document.getElementById('who').innerHTML = newList;
}

function showBadRead(){
  $('#idNumber').notify('Swipe Error, try again!', {className: 'error', elementPosition: 'left middle', autoHideDelay: 1000});
}

function showSuccess(){
  $('#idNumber').notify('Success!', {className: 'success', elementPosition: 'left middle', autoHideDelay: 1000});
  getStatus();
}

function showFailure(){
  $('#idNumber').notify('Lab is closed!', {className: 'error', elementPosition: 'left middle', autoHideDelay: 2000});
}

function showUsersPresent(idNumber){
  if(closing_attempts == 2){
    $("#kickModal").modal('show');
    $("#hiddenId").val(idNumber);
    $("#password").focus();
    closing_attempts = 0;
  }else{
    $('#idNumber').notify('People are still present!', {className: 'error', elementPosition: 'left middle', autoHideDelay: 1000});
    closing_attempts++;
    setTimeout( function() {
      closing_attempts = 0;
    }, 30000);
  }
}

function closeLab() {
  $('#kickModal').modal('hide');
  $('#idNumber').notify('Lab has been closed!', {className: 'success', elementPosition: 'left middle', autoHideDelay: 1000});
  getStatus();
}

function lockout() {
  $('#kickModal').modal('hide');
  $('#idNumber').notify('Your account has been locked!', {className: 'error', elementPosition: 'left middle', autoHideDelay: 10000});
}

function successPassword() {
  $('#passwordModal').modal('hide');
  $('#idNumber').notify('Password has been updated!', {className: 'success', elementPosition: 'left middle', autoHideDelay: 3000});
  getStatus();
}

function showRegistration(idNumber){
  $('#registration').modal('show');
  document.getElementById('userIdNumber').value = idNumber;
}

function failedPassword(){
  $('#currentPassword').val('');
  $('#currentPassword').notify('Password is incorrect!', {className: 'error', elementPosition:'right'});
  $('#currentPassword').focus();
  $('#currentPasswordGroup').addClass('has-error');
}

function submitRegistration(){
  name = $('#name').val().trim();
  newId = $('#userIdNumber').val().trim();
  approval = $('#approval').val().trim();

  if(name == ''){
    $('#name').notify('Name is a required field!', {className: 'error', elementPosition:'right middle', autoHideDelay: 2000});
    $('#nameGroup').addClass('has-error');
    $('#name').focus();
    return false;
  }

  if(approval == ''){
    $('#approval').focus();
    return false;
  }

  if(!isNaN(name)){
    $('#name').notify('Name goes here!', {className: 'error', elementPosition:'right middle', autoHideDelay: 2000});
    $('#nameGroup').addClass('has-error');
    $('#name').focus();
    if(name != newId && name.length == 9){
      $('#approval').val(name);
      $('#approval').notify('Moved ID Here!', {className: 'success', elementPosition:'right middle', autoHideDelay: 1000});
    }
    $('#name').val('');
    return false;
  }

  if(!onlyAlphabets(name)){
    $('#name').notify('Name can only contain a-z, A-Z!', {className: 'error', elementPosition:'right middle', autoHideDelay: 2000});
    $('#nameGroup').addClass('has-error');
    $('#name').focus();
    $('#name').val('');
    return false;
  }

  if(newId == ''){
    $('#userIdNumber').focus();
    return false;
  }

  if(newId.length != 9 || isNaN(parseInt(newId))){
    $('#userIdNumber').notify('Invalid swipe, try again!', {className: 'error', elementPosition:'right middle', autoHideDelay: 2000});
    $('#userIdNumberGroup').addClass('has-error');
    $('#userIdNumber').focus();
    $('#userIdNumber').val('');
    return false;
  }

  if(approval.length != 9 || isNaN(parseInt(approval))){
    $('#approval').notify('Invalid swipe, try again!', {className: 'error', elementPosition:'right middle', autoHideDelay: 2000});
    $('#approval').addClass('has-error');
    $('#approval').focus();
    $('#approval').val('');
    return false;
  }

  data = JSON.stringify({'newId':newId, 'name':name, 'approval': approval});
  console.log(data);
  postData('/register', data,
  function(statusCode){
      console.log(statusCode);
      switch(statusCode){
          case 0:
              cancelRegistration();
              $('#idNumber').focus();
              $('#idNumber').notify('You\'ve successfully registered! :), give it a shot!', {className: 'success', elementPosition:'left middle', autoHideDelay: 4000});
              break;

          case 2:
              $('#approval').notify('That wasn\'t a lab monitor\'s ID!', {className: 'error', elementPosition:'right middle', autoHideDelay: 2000});
              $('#approval').addClass('has-error');
              $('#approval').focus();
              $('#approval').val('');
              break;

          case 1:
              cancelRegistration();
              $('#idNumber').notify('You\'re already registered, try swiping!', {className: 'error', elementPosition: 'left middle', autoHideDelay: 3000});
              break;
          default: showFailure(); break;
      }
  });
  return false;
}

function cancelRegistration(){
  $('#registration').modal('hide');
  $('#name').val('');
  $('#userIdNumber').val('');
  $('#approval').val('');
}

function onlyAlphabets(str) {
   var regex = /^[a-zA-Z\s]*$/;
   if (regex.test(str)) {
       return true;
   } else {
       return false;
   }
}

function changePassword() {
  var oldPassword = $('#currentPassword').val().trim();
  var newPassword = $('#newPassword').val().trim();
  var repeat = $('#repeatPassword').val().trim();
  var idNumber = $('#hiddenIdPassword').val().trim();
  console.log(idNumber);

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
  var data = {'password':oldPassword, 'newPassword':newPassword, 'idNumber': idNumber};
  console.log(data);
  postData('/changePassword', JSON.stringify(data), function(statusCode){
    switch(statusCode){
      case 0: successPassword(); break;
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
  postData('/closeLab', data, function(statusCode){
    switch(statusCode){
      case 0: closeLab(); break;
      case 1: wrongPassword(); break;
      case 2: lockout(); break;
    }
  });
}
