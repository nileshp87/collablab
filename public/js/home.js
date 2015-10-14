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

function changeNickname(){
  var nickname = $('#nickname').val();
  console.log(nickname);
  data = {'nickname': nickname};
  postData('/manage/changeNickname', JSON.stringify(data), function(statusCode){
    switch(statusCode){
      case 0: success('nickname', 'Nickname changed successfully'); break;
      case 1: addError('nickname', "Couldn't change nickname"); break;
    }
  });
}

function success(id, message){
  $('#'+id).notify( message, {className: 'success', elementPosition: 'right middle', autoHideDelay: 3000});
}
