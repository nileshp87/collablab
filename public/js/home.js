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
  var username = $('#newUsername').val();
  if(!isValidUsername(username)){
      addError('newUsername', 'Invalid username, must be alphanumeric, spaces between 4 and 30 characters!');
      return false;
  }
  var data = {'username': username};
  postData('/manage/changeUsername', JSON.stringify(data), function(statusCode){
    switch(statusCode){
      case 0: success('newUsername', 'Username changed successfully!'); $('#newUsername').val(''); break;
      case 1: addError('newUsername', "Username is already taken!"); break;
    }
  });
}

function changeNickname(){
  var nickname = $('#nickname').val();
  if(!isValidNickname(nickname)){
      addError('nickname', 'Invalid nickname, must be alphanumeric, spaces between 4 and 30 characters!');
      return false;
  }
  var data = {'nickname': nickname};
  postData('/manage/changeNickname', JSON.stringify(data), function(statusCode){
    switch(statusCode){
      case 0: success('nickname', 'Nickname changed successfully!'); break;
      case 1: addError('nickname', "Couldn't change nickname!"); break;
    }
  });
}

function passphrase(){
  var passphrase = $('#passphrase').val();
  var data = {'passphrase': passphrase};
  postData('/manage/getPermission', JSON.stringify(data), function(statusCode){
    switch(statusCode){
      case 0: success('passphrase', 'Passphrase granted successfully, refresh page to view!'); break;
      case 1: addError('passphrase', 'Invalid passphrase!'); break;
    }
  });
}

function changeName(){
  var name = $('#newName').val();
  var data = {'name': name};
  if(!isValidName(name)){
    addError('newName', 'Invalid name, must only be letters and spaces.');
    return false;
  }
  postData('/manage/changeName', JSON.stringify(data), function(statusCode){
    switch(statusCode){
      case 0: success('newName', 'Name changed successfully'); $('#newName').val(''); break;
      case 1: addError('newName', 'Failed for some reason, site may be down'); break;
    }
  });
}

function changePassword(){
  var oldPass = $('#oldPassword').val();
  var newPass = $('#newPassword').val();
  var conPass = $('#confirmPassword').val();
  var error = false;
  if(oldPass.trim() == ''){
    addError('oldPassword', 'You need to fill out your current password');
    error = true;
  }
  if(newPass.trim() == ''){
    addError('newPassword', 'You need to fill out a new password');
    error = true;
  }
  if(newPass != conPass){
    addError('confirmPassword', 'Your passwords do not match!');
    $('#newPassword').val('');
    $('#confirmPassword').val('');
    error = true;
  }
  if(!error){
    var data = {'password': oldPass, 'newPassword': newPass};
    postData('/manage/changePassword', JSON.stringify(data), function(statusCode){
      switch(statusCode){
        case 0: success('confirmPassword', 'Your password has been updated successfully!'); $('#newPassword').val(''); $('#confirmPassword').val(''); break;
        case 1: addError('oldPassword', 'Your old password was incorrect'); break;
      }
      $('#oldPassword').val('');
    });
  }
}

function deleteAccount(){
  var password = $('#password').val();
  var data = {'password': password};
  if(password.trim() == ''){
    addError('password', 'You need to fill out this before you can delete your account.');
    return;
  }
  postData('/manage/deleteAccount', JSON.stringify(data), function(statusCode){
    switch(statusCode){
      case 0: alert('Your account is now deleted!'); location.reload(); break;
      case 1: addError('password', 'Your password is incorrect'); $('#password').val(''); break;
    }
  });
}

function success(id, message){
  $('#'+id).notify( message, {className: 'success', elementPosition: 'right middle', autoHideDelay: 3000});
}
