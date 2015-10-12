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
