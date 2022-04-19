'use strict'

//JavaScript variables associated with send and receive channels
var sendChannel, receiveChannel, localPeerConnection, remotePeerConnection;

//JavaScript variables associated with start, send and close buttons
var startButton = document.getElementById("startButton");
var sendButton = document.getElementById("sendButton");
var closeButton = document.getElementById("closeButton");

//Start-up configuration
startButton.disabled = false;
sendButton.disabled = true;
closeButton.disabled = true;

//Handlers for the click events on the buttons
startButton.onclick = createConnection;
sendButton.onclick = sendData;
closeButton.onclick = closeDataChannels;

//Utility function for logging information to the JavaScript console
function log(text) {
	console.log("At time: " + (performance.now() / 1000).toFixed(3) + " --> " + text);
}

function createConnection() {
	// This is an optional configuration string, associated with NAT traversal setup
	var servers = null;
	var pc_constraints = null;
	var data_constraints= null;
	
	//Create the local PeerConnection object with data channels
	localPeerConnection = new RTCPeerConnection(servers,pc_constraints);

	log("Created local peer connection object localPeerConnection, with Data Channel");

	try {
		//Create data Channel
		sendChannel = localPeerConnection.createDataChannel("sendDataChannel", data_constraints);
		log('Created send data channel');
	} catch (e) {
		alert('Failed to create data channel!');
		log('createDataChannel() failed with following message: ' + e.message);
	}
	//Add a handler associated with ICE protocol events
	localPeerConnection.onicecandidate = gotLocalCandidate;

	//Associate handlers with data channel events
	sendChannel.onopen = handleSendChannelStateChange;
	sendChannel.onclose = handleSendChannelStateChange;

	//Mimic a 'remote' peer connection
	window.remotePeerConnection = new RTCPeerConnection(servers,pc_constraints);
	log('Created remote peer connection object remotePeerConnection, with Data Channel');

	//Associate handlers with peer connection ICE events...
	remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
	// ...and data channel creation event  
	remotePeerConnection.ondatachannel = gotReceiveChannel;

	//Create an Offer
	localPeerConnection.createOffer()
	.then(gotLocalDescription)
    .catch( function(error) {
      console.log('Failed to create signaling message (Offer): ' + error.name);
    });

	//Disable 'Start' button and enable 'Close' button
	startButton.disabled = true;
	closeButton.disabled = false;
}


//Handler for sending data to the 'remote' peer
function sendData() {
	var data = document.getElementById("dataChannelSend").value;
	sendChannel.send(data);
	log('Sent data: ' + data);
}

//'Close' button handler
function closeDataChannels() {
	//Close channels
	log('Closing data channels');
	sendChannel.close();
	log('Closed data channel with label: ' + sendChannel.label);
	receiveChannel.close();
	log('Closed data channel with label: ' + receiveChannel.label);
	//Close peer connections
	localPeerConnection.close();
	remotePeerConnection.close();
	//Reset local variables
	localPeerConnection = null;
	remotePeerConnection = null;
	log('Closed peer connections');
	//Rollback to the initial setup of the HTML5 page
	startButton.disabled = false;
	sendButton.disabled = true;
	closeButton.disabled = true;
	dataChannelSend.value = "";
	dataChannelReceive.value = "";
	dataChannelSend.disabled = true;
	dataChannelSend.placeholder = "1: Press Start; 2: Enter text; 3: Press Send.";
}

//Handler to be called when the 'local' SDP becomes available
function gotLocalDescription(desc) {
	//Add the local description to the local PeerConnection
	localPeerConnection.setLocalDescription(desc);
	log('localPeerConnection\'s SDP: \n' + desc.sdp);
	//Add the remote description to the remote PeerConnection
	remotePeerConnection.setRemoteDescription(desc);

	//Create the Answer
	remotePeerConnection.createAnswer()
	.then(gotRemoteDescription)
	  .catch( function(error) {
	      console.log('Failed to create signaling message (Answer): ' + error.name);
	    });
}

//Handler to be called when the 'remote' SDP becomes available
function gotRemoteDescription(desc) {
	//Add the local description to the remote PeerConnection
	remotePeerConnection.setLocalDescription(desc);
	log('Answer from remotePeerConnection\'s SDP: \n' + desc.sdp);
	//Add the remote description to the local PeerConnection
	localPeerConnection.setRemoteDescription(desc);
}

//Handler to be called whenever a new local ICE candidate becomes available
function gotLocalCandidate(event) {
	log('local ice callback');
	if (event.candidate) {
		remotePeerConnection.addIceCandidate(event.candidate)
		.then(function(error) {
			console.log('Add ICE Candidate success.');
        })
        .catch(function(error) {
        	console.log('Failed to add ICE Candidate ' + error.toString());
        });
		
		log('Local ICE candidate: \n' + event.candidate.candidate);
	}
}

//Handler to be called whenever a new 'remote' ICE candidate becomes available
function gotRemoteIceCandidate(event) {
	log('remote ice callback');
	if (event.candidate) {
		localPeerConnection.addIceCandidate(event.candidate)
		.then(function(error) {
			console.log('Add ICE Candidate success.');
		})
		.catch(function(error) {
			console.log('Failed to add ICE Candidate ' + error.toString());
		});
		
		log('Remote ICE candidate: \n ' + event.candidate.candidate);
	}
}

//Handler associated with the management of remote peer connection's
//data channel events
function gotReceiveChannel(event) {
	log('Receive Channel Callback: event --> ' + event);
	// Retrieve channel information
	receiveChannel = event.channel;

	//Handler associated with open, message and close events 
	receiveChannel.onopen = handleReceiveChannelStateChange;
	receiveChannel.onmessage = handleMessage;
	receiveChannel.onclose = handleReceiveChannelStateChange;
}

//Message event handler
function handleMessage(event) {
	log('Received message: ' + event.data);
	//Show message in the HTML5 page
	document.getElementById("dataChannelReceive").value = event.data;
	//Clean 'Send' text area in the HTML page
	document.getElementById("dataChannelSend").value = '';
}

//Handler for either 'open' or 'close' events on sender's data channel
function handleSendChannelStateChange() {
	var readyState = sendChannel.readyState;
	log('Send channel state is: ' + readyState);
	if (readyState == "open") {
		//Enable 'Send' text area and set focus on it
		dataChannelSend.disabled = false;
		dataChannelSend.focus();
		dataChannelSend.placeholder = "";
		//Enable both 'Send' and 'Close' buttons  
		sendButton.disabled = false;
		closeButton.disabled = false;
	} else { 
		//Disable 'Send' text area
		dataChannelSend.disabled = true;
		//Disable both 'Send' and 'Close' buttons
		sendButton.disabled = true;
		closeButton.disabled = true;
	}
}

//Handler for either 'open' or 'close' events on receiver's data channel
function handleReceiveChannelStateChange() {
	var readyState = receiveChannel.readyState;
	log('Receive channel state is: ' + readyState);
}