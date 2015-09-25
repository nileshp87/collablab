var labStatus = null;

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
      newList += "<li>" + newStatus.members[index] + "&nbsp;<button onClick=\"swipe('" +
      index + "')\" class=\"btn btn-danger btn-xs\"><span class=\"glyphicon glyphicon-remove\"></span></button> </li>";
    }
  }else{
    for(index in newStatus.members){
      newList += '<li>' + newStatus.members[index] + '</li>';
    }
  }
  labStatus = newStatus;
  document.getElementById('who').innerHTML = newList;
}

function isValidId(idNumber){
  return idNumber != null && idNumber.trim().length == 9 && !isNaN(idNumber);
};

function isValidUsername(username){
  var regex = /^[\d\w]{4,}$/;
  return username != null && regex.test(username);
};

function isValidName(str) {
  var regex = /^[a-zA-Z\s]*$/;
  return regex.test(str);
};


function addError(idName, error){
  $('#'+idName).notify(error, {className: 'error', elementPosition: 'right middle', autoHideDelay: 2000});
  $('#'+idName).focus();
  $('#'+idName + 'Group').addClass('has-error');
  $('#'+idName).val('');
}
