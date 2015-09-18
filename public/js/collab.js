var labStatus = null;
getStatus();

$('#registration').on('shown.bs.modal', function() {
  $('#name').focus();
});

$('#registration').on('hidden.bs.modal', function() {
  $('#idNumber').focus();
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
        console.log(statusCode);
        switch(statusCode){
            case 0: showSuccess(); break;
            case 1: noLabMonitor(); break;
            case 2: showRegistration(idNumber); break;
            case 3: showUsersPresent(); break;
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
  }else{
    document.getElementById('isOpen').innerHTML = 'CLOSED';
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
  $('#idNumber').notify('Swipe Successful!', {className: 'success', elementPosition: 'left middle', autoHideDelay: 1000});
  getStatus();
}

function showFailure(){
  $('#idNumber').notify('Lab is closed!', {className: 'error', elementPosition: 'left middle', autoHideDelay: 1000});
}

function showRegistration(idNumber){
  $('#registration').modal('show');
  document.getElementById('userIdNumber').value = idNumber;
}

function submitRegistration(){
  console.log("called");
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
