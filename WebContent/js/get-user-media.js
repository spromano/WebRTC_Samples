'use strict'

//Video element in the HTML5 page
var video = document.querySelector("video");

//A MediaStream made only of one video track
var constraints = {audio: false, video: true};

function handleSuccess(stream) {
	
  //make the returned stream available to console...
  window.stream = stream; 
  
  video.srcObject = stream;
}

function handleError(error){
  console.log("navigator.mediaDevices.getUserMedia error: ", error);
}

navigator.mediaDevices.getUserMedia(constraints)
.then(handleSuccess)
.catch(handleError);