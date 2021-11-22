elements.canvasElement.width = globals.videoWidth;
elements.canvasElement.height = globals.videoHeight;

let canvasMediaStream = elements.canvasElement.captureStream();

// We'll add this to our control panel later, but we'll save it here so we can
// call tick() each time the graph runs.
const fpsControl = new FPS();

for (month in month_list) {
  let currentMonth =  new Date().getMonth()
  if (month == currentMonth) {
    document.getElementById(month_list[month].id).selected = true
  }
}

navigator.mediaDevices.getUserMedia({ video: true, audio: false })
.then(function(stream) {
		elements.dummy_video.srcObject = stream;
		elements.dummy_video.play();
})
.catch(function(err) {
	alert("There seems to be an issue with your camera, please ensure that no other programs are using it and then refresh the page. If the problem persists you may need to restart your device.");
});

function onResults(results) {
  // Hide the spinner.
  // document.body.classList.add('loaded');
  // console.log("We have a result");
  // Update the frame rate.
	if (globals.firstOnResultRun) {
		document.getElementById("result").innerHTML = "Please share your experience with us. Give me a thumbs up to continue";
		globals.startTimer = Date.now();
		globals.firstOnResultRun = false;
	}
  fpsControl.tick();

  // Draw the overlays.
  elements.canvasCtx.save();
  elements.canvasCtx.clearRect(0, 0, elements.canvasElement.width, elements.canvasElement.height);
  elements.canvasCtx.drawImage(
      results.image, 0, 0, elements.canvasElement.width, elements.canvasElement.height);
  if (results.multiHandLandmarks && results.multiHandedness) {

    get_prediction(results);
    
    for (let index = 0; index < results.multiHandLandmarks.length; index++) {
      const classification = results.multiHandedness[index];
      const isRightHand = classification.label === 'Right';
      const landmarks = results.multiHandLandmarks[index];
      drawConnectors(
          elements.canvasCtx, landmarks, HAND_CONNECTIONS,
          {color: isRightHand ? '#00FF00' : '#FF0000'}),
      drawLandmarks(elements.canvasCtx, landmarks, {
        color: isRightHand ? '#00FF00' : '#FF0000',
        fillColor: isRightHand ? '#FF0000' : '#00FF00',
        radius: (x) => {
          return lerp(x.from.z, -0.15, .1, 10, 1);
        }
      });
    }
  }
  elements.canvasCtx.restore();

	// Inactive timer
	globals.current = Date.now();
	
	if (globals.prevPredictionResult == "" && !globals.in_timeout && globals.step_counter != 0) {
		if (globals.current > (globals.startTimer + globals.inactiveLength - globals.inactiveCountdown + 1000)) {		
			if (globals.startWorkerTimer && window.Worker) {
				globals.startWorkerTimer = false;
				globals.inactiveWorker = new Worker("/static/js/worker.js");
		
				let secondsLeft = document.getElementById("seconds_left");
				let sbMessage = document.getElementById("sb_message");
				sbMessage.textContent = "Survey inactive, restarting in: ";
				secondsLeft.textContent = globals.inactiveCountdown / 1000;
				elements.snackbarDiv.classList.add("show");
		
				globals.inactiveWorker.postMessage({start: true, waitLength: globals.inactiveCountdown});
				globals.inactiveWorker.onmessage = function(e) {
					secondsLeft.textContent = e.data;
					if (e.data <= 0) {
						globals.timestamp = moment().format();
						globals.json_obj.TimeStamp = globals.timestamp;
						utils.az_send_data(globals.json_obj);
						elements.snackbarDiv.classList.remove("show");
						globals.inactiveWorker.terminate();
						globals.step_counter = 0;
						document.getElementById("result").innerHTML = globals.questions[globals.step_counter];
						globals.startTimer = Date.now();
						globals.startWorkerTimer = true;
					}
				}
			}
		}
	} else if (!globals.startWorkerTimer && globals.prevPredictionResult != "") {
		elements.snackbarDiv.classList.remove("show");
		globals.inactiveWorker.terminate();
		globals.startWorkerTimer = true;
		globals.startTimer = Date.now();
	} else {
		globals.startTimer = Date.now();
	}
	globals.prevPredictionResult = "";
}

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}`;
}});

// hands.onResults(onResults);

$(function(){
  $('#submit').click(function(){
    let loginMessage = document.getElementById("result");
    loginMessage.innerHTML = "Logging in, please wait...";

    $.ajax({
      url: '/authenticate',
      data: $('form').serialize(),
      type: 'POST',
        success: function(msg){
          if (msg.status == "success") {
            loginMessage.innerHTML = "Login successful, loading please wait...";
						if (globals.devDebug) {
							elements.dummy_video.style.transform = "scaleX(1)";
							elements.dummy_video.srcObject = canvasMediaStream;
							elements.dummy_video.play();
						}
            console.log('Authenticated');
            let logo = document.getElementById("logo");
            logo.src = `static/images/logos/${msg.image}`;
            if (msg.image == "Builderslogo.png") {
              logo.classList.add("builders-logo");
            }
            globals.questions.push(...msg.questions);
						globals.questionsLength = msg.questions.length;
            for (let i = 0; i < msg.questions.length; i++) {
              globals.json_obj.Q_NO[i] = msg.questions[i];
            }
            globals.json_obj.Device = `${msg.uuid}`;
            document.getElementById("svg_thumb_up_icon").style.fill = `${msg.colour}`;
            document.getElementById("svg_thumb_down_icon").style.fill = `${msg.colour}`;
            document.getElementById("svg_thumb_up_popup").style.fill = `${msg.colour}`;
            document.getElementById("svg_thumb_down_popup").style.fill = `${msg.colour}`;
            document.getElementById("authentication_form").style.display = "none";
            // main();
						hands.onResults(onResults);
          } else {
            loginMessage.innerHTML = msg.status;
          }
        },
        error: function(msg){
          console.log("400/500 error");
        }
    });
  });
});

/**
 * Instantiate a camera. We'll feed each frame we receive into the solution.
 */
const camera = new Camera(elements.videoElement, {
  onFrame: async () => {
    await hands.send({image: elements.videoElement});
  },
  width: globals.videoWidth,
  height: globals.videoHeight
});
camera.start();

// Present a control panel through which the user can manipulate the solution
// options.
new ControlPanel(elements.controlsElement, {
      selfieMode: true,
      maxNumHands: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5
    })
    .add([
      new StaticText({title: 'MediaPipe Hands'}),
      fpsControl,
      new Toggle({title: 'Selfie Mode', field: 'selfieMode'}),
      new Slider(
          {title: 'Max Number of Hands', field: 'maxNumHands', range: [1, 4], step: 1}),
      new Slider({
        title: 'Min Detection Confidence',
        field: 'minDetectionConfidence',
        range: [0, 1],
        step: 0.01
      }),
      new Slider({
        title: 'Min Tracking Confidence',
        field: 'minTrackingConfidence',
        range: [0, 1],
        step: 0.01
      }),
    ])
    .on(options => {
      elements.videoElement.classList.toggle('selfie', options.selfieMode);
      hands.setOptions(options);
    });
