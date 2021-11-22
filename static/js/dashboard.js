
(function(){
	// When the user clicks on the button, open the modal
  elements.logo.onclick = function() {
    dashboardModal.style.display = "block";
		globals.in_timeout = 1;
  }

  // When the user clicks on <span> (x), close the modal
  elements.closeDashboard.onclick = function() {
    dashboardModal.style.display = "none";
		globals.in_timeout = 0;
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == dashboardModal) {
        dashboardModal.style.display = "none";
				globals.in_timeout = 0;
    }
  }


	$(function(){
		$('#dashboard-submit').click(function(){
			let dashboardMessage = document.getElementById("dashboardMessage");
			document.getElementById("dashboard-password").style.display = "none";
			document.getElementById("dashboard-submit").style.display = "none";
			dashboardMessage.innerHTML = "Loading please wait...";
            
			$.ajax({
        url: '/get_all_data',
				data: $('form').serialize(),
				type: 'POST',
				success: function(msg){
          globals.in_timeout = 1;
            if (msg.status == "success") {
              
              let month_list = document.querySelectorAll("option[id='month_list']")
              
              for (month in month_list) {
                let currentMonth =  new Date().getMonth()
                if (month == currentMonth) {
                  let select_menu = document.getElementById("select_months")
                  select_menu.selectedIndex = month
                }
              }

              globals.bar_graph_array = msg.bar_graph_array
              globals.multiple_line_array = msg.multiple_line_array
              document.getElementById("graph-display").style.display = "block";
              dashboardMessage.innerHTML = "";

              // Dynamically populates store buttons

              var store_row = document.getElementById("store_rows");
              let i = 0;

              console.log(msg.uuid_store_list);

              for (index in msg.uuid_store_list) {
                if (i == 0) {
                  var store_col = document.createElement("div");
                  store_col.className = "col-4";
                  store_row.appendChild(store_col);
                }
                let store_button = document.createElement("input");
                let store_label = document.createElement("label");
                let break_line = document.createElement("br")

                store_button.type = "checkbox";
                store_button.name = "store_checkbox";
                store_button.id = `${msg.uuid_store_list[index][0]}`;

                store_label.htmlFor = `${msg.uuid_store_list[index][0]}`;
                store_label.textContent = `${msg.uuid_store_list[index][1]}`;

                store_button.onclick = function() {
                  // gets uuids of selected stores to send to backend for data management
                  let stores = document.querySelectorAll("input[name='store_checkbox']")
                  let selected_stores_list = []
                  
                  for (store in stores) {
                    let selected_stores = document.getElementById(`${stores[store].id}`)
                    if (selected_stores !== null)
                      if (selected_stores.checked == true){
                        selected_stores_list.push(selected_stores.id)
                      }
                  }
                  $.ajax({
                    url: '/get_uuid_data',
                    type: 'POST',
                    data: JSON.stringify(selected_stores_list),
                    contentType: "application/json",
                    success: function(msg){
                      console.log(msg.bar_graph_display)
                      console.log(msg.multiple_line_array)
                      
                      globals.bar_graph_array = msg.bar_graph_array
                      globals.multiple_line_array = msg.multiple_line_array

                      displayBarGraph(globals.bar_graph_array)
                      displayLineGraph(globals.multiple_line_array)
                    },
                    error: function(msg){
                      console.log("400/500 error");
                    }
                  });
                }
                
                store_col.appendChild(store_button);
                store_col.appendChild(store_label);
                store_col.appendChild(break_line)
                i++;
                if (i == 4) {
                  i = 0;
                }
              }
              
              
              // Populates dashboard questions
              questions_list = document.getElementById("question_list");
              i = 0;
              
              for (question_i in globals.json_obj.Q_NO) {
                question_row = document.createElement("div");
                question_row.className = "row db-bb";
                questions_list.appendChild(question_row);

                question_number_col = document.createElement("div");
                question_number_col.className = "col-1 db-qnum";
                question_number_col.textContent = "Q"+(parseInt(question_i)+1)
                question_row.appendChild(question_number_col);

                question_content_col = document.createElement("div");
                question_content_col.className = "col-11 db-pa";
                question_content_col.textContent = globals.json_obj.Q_NO[question_i]
                question_row.appendChild(question_content_col);

              }
              
              // NEW CHARTS START
              displayBarGraph(globals.bar_graph_array)
              displayLineGraph(globals.multiple_line_array)

              // END
						} else {
							dashboardMessage.innerHTML = msg.status;
						}
					},
					error: function(msg){
						console.log("400/500 error");
					}
			});
		});
	});

  function displayLineGraph(multiple_line_array) {
    
    google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawChart);

        
      const curve_line_display = []
      curve_line_display.push(['Day', 'Thumbs up', 'Thumbs down'])
      dateArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
      for (day in dateArray) {
        curve_line_display.push([dateArray[day], multiple_line_array[0][day], multiple_line_array[1][day]]);
      }

      function drawChart() {
        var data = google.visualization.arrayToDataTable(curve_line_display);

        var options = {
          title: 'Company Performance',
          curveType: 'function',
          legend: { position: 'bottom' }
        };

        var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

        chart.draw(data, options);
      }
  }

  function displayBarGraph(bar_graph_array) {

    const bar_graph_display = []
    bar_graph_display.push(['Q No', 'thumbs up', 'thumbs down'])
    for (i = 0; i < (bar_graph_array.length); i++){
      bar_graph_display.push([`Q${i+1}`, bar_graph_array[i][0], bar_graph_array[i][1]])
    }

    
    google.charts.load('current', {'packages':['bar']});
    google.charts.setOnLoadCallback(drawChart);
    
    function drawChart() {
      var data = google.visualization.arrayToDataTable(bar_graph_display);

      var options = {
        colors: ['#008000', '#ff0000'],
        legend: { position: "none" },
        bars: 'horizontal' // Required for Material Bar Charts.
      };

      var chart = new google.charts.Bar(document.getElementById('barchart_material'));

      chart.draw(data, google.charts.Bar.convertOptions(options));
    }

  }


})();