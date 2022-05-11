// logs messages to the user
var log = {
    logs: [''],
    logCounter: 0,
  };
  export function logUser( message:string ) {
    let logLen = log.logs.length - 1;
    log.logCounter++; // Count all messages

    message = log.logCounter.toString() + ': ' + message;
  
    log.logs.unshift(message); //logend the message to the beginning of array

    if (logLen >= 5){ //wait till logs are filled in the array
      
      //Deletes the oldest log 
      log.logs.pop();    
    }

    // Now Loop to output the logs
    for (let i = logLen; i >= 0  ;i--){

      // Delete the already existing logs in the UI
      var delLog = document.querySelector(`#log${i}`);
      if ( delLog != null ) {
        delLog.remove();
      }
      // build up the HTML
      if ( i === 0){
        var html = `<h6 id="log${i}" class="w3-hover w3-round w3-center w3-animate-opacity	"> ${log.logs[i]}</h6> `;
      } else {
        var html = `<h6 id="log${i}" class="w3-round w3-center"> ${log.logs[i]}</h6> `;
      }
      // Now create the log in the UI
      document.querySelector('#gamestatus').insertAdjacentHTML('afterbegin', html);
      // Log also in Console
    }
    console.log(message);
  }