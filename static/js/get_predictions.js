function get_prediction(results) {

  let palmPoint = new Array(results.multiHandLandmarks[0][0].x, results.multiHandLandmarks[0][0].y);

  let thumbBottom = new Array(results.multiHandLandmarks[0][2].x, results.multiHandLandmarks[0][2].y);
  let thumbMiddle = new Array(results.multiHandLandmarks[0][3].x, results.multiHandLandmarks[0][3].y);
  let thumbTop = new Array(results.multiHandLandmarks[0][4].x, results.multiHandLandmarks[0][4].y);

  let indexBottom = new Array(results.multiHandLandmarks[0][5].x, results.multiHandLandmarks[0][5].y);
  let indexMiddle = new Array(results.multiHandLandmarks[0][6].x, results.multiHandLandmarks[0][6].y);
  let indexTop = new Array(results.multiHandLandmarks[0][8].x, results.multiHandLandmarks[0][8].y);

  let middleFingerBottom = new Array(results.multiHandLandmarks[0][9].x, results.multiHandLandmarks[0][9].y);
  let middleFingerMiddle = new Array(results.multiHandLandmarks[0][10].x, results.multiHandLandmarks[0][10].y);
  let middleFingerTop = new Array(results.multiHandLandmarks[0][12].x, results.multiHandLandmarks[0][12].y);

  let ringBottom = new Array(results.multiHandLandmarks[0][13].x, results.multiHandLandmarks[0][13].y);
  let ringMiddle = new Array(results.multiHandLandmarks[0][14].x, results.multiHandLandmarks[0][14].y);
  let ringTop = new Array(results.multiHandLandmarks[0][16].x, results.multiHandLandmarks[0][16].y);
  
  let pinkyBottom = new Array(results.multiHandLandmarks[0][17].x, results.multiHandLandmarks[0][17].y);
  let pinkyMiddle = new Array(results.multiHandLandmarks[0][18].x, results.multiHandLandmarks[0][18].y);
  let pinkyTop = new Array(results.multiHandLandmarks[0][20].x, results.multiHandLandmarks[0][20].y);

  if (results.multiHandedness[0].label == "Right"){
    if (thumbTop[1] < thumbMiddle[1] && thumbMiddle[1] < thumbBottom[1] && thumbBottom[1] < pinkyBottom[1]) {
      if (palmPoint[0] > indexBottom[0] && palmPoint[0] > pinkyBottom[0]) {
        if (indexBottom[0] < indexTop[0] && middleFingerBottom[0] < middleFingerTop[0] && ringBottom[0] < ringTop[0] && pinkyBottom[0] < pinkyTop[0]) {
          // console.log("thumbs up right back hand")
          globals.predictionResult = "thumbs_up"
        }
        else {
          if (indexMiddle[0] < indexTop[0] && middleFingerMiddle[0] < middleFingerTop[0] && ringMiddle[0] < ringTop[0] && pinkyMiddle[0] < pinkyTop[0]) {
            // console.log("thumbs up right back hand")
            globals.predictionResult = "thumbs_up"
          }
        }
      }
      else if (palmPoint[0] < indexBottom[0]  && palmPoint[0] < pinkyBottom[0]) {
        if (indexBottom[0] > indexTop[0] && middleFingerBottom[0] > middleFingerTop[0] && ringBottom[0] > ringTop[0] && pinkyBottom[0] > pinkyTop[0]){
          // console.log("thumbs up right front hand")
          globals.predictionResult = "thumbs_up"
        } 
      }
    }
    else if (thumbTop[1] > thumbMiddle[1] && thumbMiddle[1] > thumbBottom[1]  && thumbBottom[1] > pinkyBottom[1]) {
      if (palmPoint[0] > indexBottom[0] && palmPoint[0] > pinkyBottom[0]) {
        if (indexBottom[0] < indexTop[0] && middleFingerBottom[0] < middleFingerTop[0] && ringBottom[0] < ringTop[0] && pinkyBottom[0] < pinkyTop[0]) {
          // console.log("Thumbs down right front hand")
          globals.predictionResult = "thumbs_down"
        }
      }
      else if (palmPoint[0] < indexBottom[0] && palmPoint[0] < pinkyBottom[0]) {
        if (indexBottom[0] > indexTop[0] && middleFingerBottom[0] > middleFingerTop[0] && ringBottom[0] > ringTop[0] && pinkyBottom[0] > pinkyTop[0]){
          // console.log("Thumbs down right back hand")
          globals.predictionResult = "thumbs_down"
        }
        else {
          if (indexMiddle[0] > indexTop[0] && middleFingerMiddle[0] > middleFingerTop[0] && ringMiddle[0] > ringTop[0] && pinkyMiddle[0] > pinkyTop[0]) {
            // console.log("thumbs down right back hand")
            globals.predictionResult = "thumbs_down"
          }
        }
      }
    }
  }
  else if (results.multiHandedness[0].label == "Left"){
    if (thumbTop[1] < thumbMiddle[1] && thumbMiddle[1] < thumbBottom[1] && thumbBottom[1] < pinkyBottom[1]) {
      if (palmPoint[0] > indexBottom[0] && palmPoint[0] > pinkyBottom[0]) {
        if (indexBottom[0] < indexTop[0] && middleFingerBottom[0] < middleFingerTop[0] && ringBottom[0] < ringTop[0] && pinkyBottom[0] < pinkyTop[0]) {
          // console.log("thumbs up left front hand")
          globals.predictionResult = "thumbs_up"
        }
      }
      else if (palmPoint[0] < indexBottom[0] && palmPoint[0] < pinkyBottom[0]) {
        if (indexBottom[0] > indexTop[0] && middleFingerBottom[0] > middleFingerTop[0] && ringBottom[0] > ringTop[0] && pinkyBottom[0] > pinkyTop[0]) {
          // console.log("thumbs up left back hand")
          globals.predictionResult = "thumbs_up"
        }
        else {
          if (indexMiddle[0] > indexTop[0] && middleFingerMiddle[0] > middleFingerTop[0] && ringMiddle[0] > ringTop[0] && pinkyMiddle[0] > pinkyTop[0]) {
            // console.log("thumbs up left back hand")
            globals.predictionResult = "thumbs_up"
          }
        }
      }
    }
    else if (thumbTop[1] > thumbMiddle[1] && thumbMiddle[1] > thumbBottom[1]  && thumbBottom[1] > pinkyBottom[1]) {
      if (palmPoint[0] > indexBottom[0] && palmPoint[0] > pinkyBottom[0]) {
        if (indexBottom[0] < indexTop[0] && middleFingerBottom[0] < middleFingerTop[0] && ringBottom[0] < ringTop[0] && pinkyBottom[0] < pinkyTop[0]) {
          // console.log("thumbs down left back hand")
          globals.predictionResult = "thumbs_down"
        }
        else {
          if (indexMiddle[0] < indexTop[0] && middleFingerMiddle[0] < middleFingerTop[0] && ringMiddle[0] < ringTop[0] && pinkyMiddle[0] < pinkyTop[0]) {
            // console.log("thumbs down left back hand")
            globals.predictionResult = "thumbs_down"
          }
        }
      }
      else if (palmPoint[0] < indexBottom[0] && palmPoint[0] < pinkyBottom[0]) {
        if (indexBottom[0] > indexTop[0] && middleFingerBottom[0] > middleFingerTop[0] && ringBottom[0] > ringTop[0] && pinkyBottom[0] > pinkyTop[0]) {
          // console.log("thumbs down left front hand")
          globals.predictionResult = "thumbs_down"
        }
      }
    }
  }
  
	// Debouncing
	if (globals.predictionResult == "thumbs_up") {
		globals.thumbsUpCount++;
	}
	else if (globals.predictionResult == "thumbs_down") {
		globals.thumbsDownCount++;
	} else {
		globals.thumbsUpCount = 0;
		globals.thumbsDownCount = 0;
	}

	if (globals.thumbsUpCount >= globals.debounceSize) {
		globals.debounceResult = "thumbs_up";
		globals.thumbsUpCount = 0;
		globals.thumbsDownCount = 0;
	} else if (globals.thumbsDownCount >= globals.debounceSize) {
		globals.debounceResult = "thumbs_down";
		globals.thumbsUpCount = 0;
		globals.thumbsDownCount = 0;
	} 

	run_next_step(globals.debounceResult);
	globals.prevPredictionResult = globals.predictionResult;
	globals.debounceResult = "";
	globals.predictionResult = "";
}