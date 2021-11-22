function run_next_step(result_name){

  if (globals.in_timeout == 0){
    if (globals.is_first_run == 1){
      globals.is_first_run = 0;
    }
    else {
      if (result_name == "thumbs_up" || result_name == "thumbs_down"){
        if (result_name == "thumbs_up"){
          elements.svgThumbDown.style.display = "none";
          elements.svgThumbUp.style.display = "block";
          elements.modal.style.display = "block";
          
          globals.json_obj.Response[globals.step_counter] = "Yes";
        }
        else if (result_name == "thumbs_down"){
          elements.svgThumbUp.style.display = "none";
          elements.svgThumbDown.style.display = "block";
          elements.modal.style.display = "block";

          globals.json_obj.Response[globals.step_counter] = "No";
        }
      elements.progressBar.style.width = 14 * (globals.step_counter + 1) + "%";
      globals.in_timeout = 1;
        setTimeout(() => {
          elements.modal.style.display = "none";

          globals.step_counter = globals.step_counter + 1;
          if (globals.step_counter == 7) {

              globals.step_counter = 0;
              
              elements.thumbImg.style.display = "none";
              elements.descriptionHeader.style.display = "none";

            if (result_name == "thumbs_up") {
              globals.in_timeout = 1;

              // Due to large amount of text in response to q5 changing
              // font size and line height.
              document.getElementById("result").classList.add("span-resize");
              document.getElementById("result-con").classList.remove("flex-con-height");
              document.getElementById("result-con").classList.add("flex-con-height-adjust");
              document.getElementById("result").innerHTML = globals.q5_y_responce;

              utils.showSnackBar(globals.lastResponseDiplayTime - 1000, "New survey starting in: ");
              setTimeout(() => {
                globals.in_timeout = 0; 

                // Reseting font sizing
                document.getElementById("result").classList.remove("span-resize");
                document.getElementById("result-con").classList.add("flex-con-height");
                document.getElementById("result-con").classList.remove("flex-con-height-adjust");
                elements.thumbImg.style.display = "block";
                elements.descriptionHeader.style.display = "block";
                document.getElementById("result").innerHTML = "Please share your experience with us. Give me a thumbs up to continue";
              }, globals.lastResponseDiplayTime);
            }
            else if (result_name == "thumbs_down"){
              globals.in_timeout = 1;

              // Due to large amount of text in response to q5 changing
              // font size and line height.
              document.getElementById("result-con").style.justifyContent = "normal";
              document.getElementById("result").classList.add("span-resize");
              document.getElementById("result").innerHTML = globals.q5_n_responce;

            
              utils.showSnackBar(
                  globals.lastResponseDiplayTime - 1000, 
                  "QR code will be displayed in: "
              );
              
              setTimeout(() => {
                globals.in_timeout = 1; 

                elements.svgThumbDown.style.display = "none";
                elements.svgThumbUp.style.display = "none";
                elements.modalImg.style.display = "block";
                elements.modal.style.display = "block";

                utils.showSnackBar(globals.qrCodeDisplayTime - 1000, "New survey starting in: ");
                setTimeout(() => {
                  globals.in_timeout = 0; 

                  // Reseting font sizing
                  document.getElementById("result-con").style.justifyContent = "space-around";
                  document.getElementById("result").classList.remove("span-resize");
                  elements.modalImg.style.display = "none";
                  elements.modal.style.display = "none";
                  elements.thumbImg.style.display = "block";
                  elements.descriptionHeader.style.display = "block";
                  document.getElementById("result").innerHTML = "Please share your experience with us. Give me a thumbs up to continue";
                }, globals.qrCodeDisplayTime);

              }, globals.lastResponseDiplayTime);
            }

						globals.timestamp = moment().format();
            globals.json_obj.TimeStamp = globals.timestamp;

            utils.az_send_data(globals.json_obj); // send the data to azure
          }
          else{
              document.getElementById("result").innerHTML = globals.questions[globals.step_counter];
              setTimeout(() => {  globals.in_timeout = 0; }, globals.in_timeout_lenghth);
          }
        }, 2000);
      }
    }
  }
}