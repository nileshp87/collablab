function loadTab(index){
  hideAll();
  switch(index){
    case 0: show('self'); break;
    case 1: show('lm'); break;
    case 2: show('exec'); break;
    case 3: show('admin'); break;
  }
}

function hideAll(){
  $('#self').addClass('hidden');
  $('#selfTab').removeClass('active')
  $('#lm').addClass('hidden');
  $('#lmTab').removeClass('active')
  $('#exec').addClass('hidden');
  $('#execTab').removeClass('active')
  $('#admin').addClass('hidden');
  $('#adminTab').removeClass('active')
}

function show(tab){
  $('#' + tab).removeClass('hidden');
  $('#' + tab + 'Tab').addClass('active')
}

function changeUsername(){
  var username = $('#username').val();
  if(!isValidUsername(username)){
      addError('username', 'Invalid username, must be alphanumeric, spaces between 4 and 30 characters!');
      return false;
  }
  data = {'username': username};
  postData('/manage/changeUsername', JSON.stringify(data), function(statusCode){
    switch(statusCode){
      case 0: success('username', 'Username changed successfully!'); break;
      case 1: addError('username', "Username is already taken!"); break;
    }
  });
}

function changeNickname(){
  var nickname = $('#nickname').val();
  if(!isValidNickname(nickname)){
      addError('nickname', 'Invalid nickname, must be alphanumeric, spaces between 4 and 30 characters!');
      return false;
  }
  data = {'nickname': nickname};
  postData('/manage/changeNickname', JSON.stringify(data), function(statusCode){
    switch(statusCode){
      case 0: success('nickname', 'Nickname changed successfully!'); break;
      case 1: addError('nickname', "Couldn't change nickname!"); break;
    }
  });
}

function passphrase(){
  var passphrase = $('#passphrase').val();
  data = {'passphrase': passphrase};
  postData('/manage/getPermission', JSON.stringify(data), function(statusCode){
    switch(statusCode){
      case 0: success('passphrase', 'Passphrase granted successfully, refresh page to view!'); break;
      case 1: addError('passphrase', 'Invalid passphrase!'); break;
    }
  });
}

function success(id, message){
  $('#'+id).notify( message, {className: 'success', elementPosition: 'right middle', autoHideDelay: 3000});
}
