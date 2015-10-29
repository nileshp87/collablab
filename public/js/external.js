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

function login(){
  window.location.replace('/manage');
}
