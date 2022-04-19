'use strict'
//JavaScript variables holding stream and connection information  
var localStream, localPeerConnection, remotePeerConnection;

//JavaScript variables associated with HTML5 video elements in the page
var localVideo = document.getElementById("localVideo");
var remoteVideo = document.getElementById("remoteVideo");

//Define local variables associated with call management buttons in the HTML page
var startButton = document.getElementById("startButton");
var callButton = document.getElementById("callButton");
var hangupButton = document.getElementById("hangupButton");

//Offer Options
var offerOptions = {offerToReceiveAudio: 1, offerToReceiveVideo: 1};

//Start-up configuration
startButton.disabled = false;
callButton.disabled = true;
hangupButton.disabled = true;

//Handlers for the click events on the buttons
startButton.onclick = start;
callButton.onclick = call;
hangupButton.onclick = hangup;

//Utility function for logging information to the JavaScript console
function log(text) {
  console.log("At time: " + (performance.now() / 1000).toFixed(3) + " --> " + text);
}

//handleSuccess() 
function handleSuccess(stream){
  log("Received local stream");
  localVideo.srcObject = stream;
  localStream = stream;

  //Enable the 'Call' button 
  callButton.disabled = false;
}


//Function start() associated with clicking on the 'Start' button
function start() {
  log("Requesting local stream");
  
  //Disable the 'Start' button
  startButton.disabled = true;
  
  //call getUserMedia()
  navigator.mediaDevices.getUserMedia({audio:true, video:true})
  .then(handleSuccess)
  .catch( function(error) {
      log("navigator.mediaDevices.getUserMedia error: ", error);
    });
}


//Function call() associated with clicking on the 'Call' button
function call() {
  //Disable the 'Call' button
  callButton.disabled = true;
  
  //Enable the 'Hangup' button
  hangupButton.disabled = false;
  log("Starting call");

  
  //Log info about video and audio device in use
  if (localStream.getVideoTracks().length > 0) {
	   log('Using video device: ' + localStream.getVideoTracks()[0].label);
	  }
  if (localStream.getAudioTracks().length > 0) {
	   log('Using audio device: ' + localStream.getAudioTracks()[0].label);
	  }
 
  //This is an optional configuration string, associated with NAT traversal setup
  var servers = null;

  
  //Create the local PeerConnection object
  localPeerConnection = new RTCPeerConnection(servers);
  log("Created local peer connection object localPeerConnection");
  //Add a handler associated with ICE protocol events
  localPeerConnection.onicecandidate = gotLocalIceCandidate;

  //Create the remote PeerConnection object
  remotePeerConnection = new RTCPeerConnection(servers);
  log("Created remote peer connection object remotePeerConnection");
  //Add a handler associated with ICE protocol events...
  remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
  
  //Handler for the remote stream
  remotePeerConnection.onaddstream = gotRemoteStream;

  //Add the local stream
  localPeerConnection.addStream(localStream);
  log("Added localStream to localPeerConnection");
  
  //Create an Offer
  localPeerConnection.createOffer(offerOptions)
  .then(gotLocalDescription)
  .catch( function(error) {
      console.log('Failed to create signaling message (Offer): ' + error.name);
    });
}



//Handler to be called when the 'local' SDP becomes available
function gotLocalDescription(description){
  //Add the local description to the local PeerConnection
  localPeerConnection.setLocalDescription(description);
  log("Offer from localPeerConnection: \n" + description.sdp);
  
  //Add the remote description to the remote PeerConnection
  remotePeerConnection.setRemoteDescription(description);
  
  //Create the Answer
  remotePeerConnection.createAnswer()
  .then(gotRemoteDescription)
  .catch( function(error) {
      console.log('Failed to create signaling message (Answer): ' + error.name);
    });
  
  
}

//Handler to be called when the 'remote' SDP becomes available
function gotRemoteDescription(description){
  //Add the local description to the remote PeerConnection
  remotePeerConnection.setLocalDescription(description);
  log("Answer from remotePeerConnection: \n" + description.sdp);
  //Add the remote description to the local PeerConnection
  localPeerConnection.setRemoteDescription(description);
}

//Function hangup() associated with clicking on the 'Hang Up' button
function hangup() {
  log("Ending call");
  //Close PeerConnection(s)
  localPeerConnection.close();
  remotePeerConnection.close();
  //Reset local variables
  localPeerConnection = null;
  remotePeerConnection = null;
  //Disable 'Hangup' button
  hangupButton.disabled = true;
  //Enable 'Call' button
  callButton.disabled = false;
}

//Handler to be called as soon as the remote stream becomes available
function gotRemoteStream(event){	
  //Associate the remote video element with the retrieved stream
  remoteVideo.srcObject = event.stream; 
  log("Received remote stream");
}


//Handler to be called whenever a new local ICE candidate becomes available
function gotLocalIceCandidate(event){
  if (event.candidate) {
	//Add candidate to the remote PeerConnection 
    remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate))
    .then(function(error) {
       console.log('Add ICE Candidate success (Local).');
    })
    .catch(function(error) {
       console.log('Failed to add ICE Candidate (Local) ' + error.toString());
    });
    
    log("Local ICE candidate: \n" + event.candidate.candidate);
  }
}

//Handler to be called whenever a new 'remote' ICE candidate becomes available
function gotRemoteIceCandidate(event){
  if (event.candidate) {
	//Add candidate to the local PeerConnection	  
    localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate))
    .then(function(error) {
       console.log('Add ICE Candidate success (Remote).');
    })
    .catch(function(error) {
       console.log('Failed to add ICE Candidate (Remote) ' + error.toString());
    });
    
    log("Remote ICE candidate: \n " + event.candidate.candidate);
  }
}