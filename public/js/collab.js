var labStatus = null;
getStatus();

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
            case 2: showRegistration(); break;
            case 3: showUsersPresent(); break;
            default: showFailure(); break;
        }
    });
    document.getElementById('idNumber').value = "";
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
  $.notify("Swipe Error, try again.", "error");
}

function showSuccess(){
  $.notify("Swipe Successful!", "success");
  getStatus();
}

function showFailure(){
  $.notify("Lab is closed!", "error");
}
