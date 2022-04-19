'use strict'

//Define local variables associated with video resolution selection buttons in the HTML page
var vgaButton = document.querySelector("button#vga");
var qvgaButton = document.querySelector("button#qvga");
var hdButton = document.querySelector("button#hd");

var dimensions = document.querySelector("p#dimensions");

//Video element in the HTML5 page
var video = document.querySelector("video");
var stream;


function handleSuccess(gotStream) {
// stream available to console
  window.stream = gotStream; 
  
  video.srcObject = gotStream;
  
}

function handleError(error){
  console.log("navigator.getUserMedia error: ", error);
}

//Constraints objects for resolutions video 
var qvgaConstraints  = {
  video: {width:{ exact:320}, height:{exact:240}}
      
};

var vgaConstraints  = {
  video: {width:{ exact:640}, height:{exact:480}}
      
};

var hdConstraints  = {
  video: {width:{ exact:1280}, height:{exact:720}}
      
};


//Associate actions with buttons
qvgaButton.onclick = function(){getMedia(qvgaConstraints)};
vgaButton.onclick = function(){getMedia(vgaConstraints)};
hdButton.onclick = function(){getMedia(hdConstraints)};


//getMedia() with constraints
function getMedia(constraints){
  if (stream) {
    stream.getTracks().forEach(function(track){
    track.stop();
    });
  }
  
//getUserMedia() with constraints
navigator.mediaDevices.getUserMedia(constraints)
  .then(handleSuccess)
  .catch(handleError);
}