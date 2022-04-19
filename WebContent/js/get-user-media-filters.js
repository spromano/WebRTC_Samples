'use strict';

//Define local variables associated with selection buttons in the HTML page
var snapshotButton = document.querySelector('button#snapshot');
var filterSelect = document.querySelector('select#filter');

// Put variables in global scope to make them available to the browser console.
var video = document.querySelector('video');
var canvas = document.querySelector('canvas');
canvas.width = 480;
canvas.height = 360;

//Snapshot function
snapshotButton.onclick = function() {
  canvas.className = filterSelect.value;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
};


//Filter function
filterSelect.onchange = function() {
  video.className = filterSelect.value;
};


//A MediaStream made only of one video track
var constraints = {audio: false, video: true};


function handleSuccess(stream) {
// make stream available to browser console
  window.stream = stream;
  
  video.srcObject = stream;
}


function handleError(error) {
  console.log('navigator.mediaDevices.getUserMedia error: ', error);
}


navigator.mediaDevices.getUserMedia(constraints)
.then(handleSuccess)
.catch(handleError);