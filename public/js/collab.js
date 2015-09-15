function postData(url, data, callback){
    http = new XMLHttpRequest();
    http.open('POST', url, true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    http.onreadystatechange = function() {
        if(http.readyState == 4 && http.status == 200) {
            callback();
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
    }
    postData('/swipe', "idNumber=" + document.getElementById('idNumber').value,
    function(statusCode){
        switch(statusCode){
            case 0: showSuccess(); break;
            case 1: showLabMonitor(); break;
            default: showFailure(); break;
        }
    });
    return false;
}

showBadRead(){
    console.log("Bad Read");
}

showSuccess(){
    console.log("Successful Read");
}

showFailure(){
    console.log("Lab is Closed");
}


