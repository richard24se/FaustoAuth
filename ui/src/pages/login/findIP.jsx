//BACKLOG KNOW HOW
/*
function getIP(newIP){

  window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;  
  var pc = new RTCPeerConnection({iceServers:[]}), 
  noop = function(){}; 
  
  function putIP(x){
    newIP(x)
  }

  pc.createDataChannel("");  
  pc.createOffer(pc.setLocalDescription.bind(pc), noop);   
  pc.onicecandidate = function(ice){ 
    
    if(!ice || !ice.candidate || !ice.candidate.candidate)  return;
    try{
      var myIP = null
      myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
      //console.log("OK IP: "+myIP)
      putIP(myIP)
    }catch{
      myIP = "ERROR: Intente en otro explorador!"
      //console.log("FAIL IP: "+myIP)
      putIP(myIP)
    }
    //return myIP;
  }; 
}*/

var findIP = new Promise(r => {
  try {
    var w = window,
      a = new(w.RTCPeerConnection || w.mozRTCPeerConnection || w.webkitRTCPeerConnection)({
          iceServers: []
      }),
    b = () => {};
    a.createDataChannel("");
    a.createOffer(c => a.setLocalDescription(c, b, b), b);
    a.onicecandidate = c => {
        try {
            c.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g).forEach(r)
        } catch (e) {
          r("ERROR: Intente en otro explorador o desactiva el Anonymize!");
        }
    }

  }catch(e){
    r("ERROR: WebRTC Desactivado");
  }
  
})
export default findIP;