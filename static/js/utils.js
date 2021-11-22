let utils = (function(){

	function showSnackBar(waitLength, message) {
		if (window.Worker) {
			const myWorker = new Worker("/static/js/worker.js");
	
			let start = true;
			elements.sbMessage.textContent = message;
			elements.secondsLeft.textContent = waitLength / 1000;
			elements.snackbarDiv.classList.add("show");
	
			myWorker.postMessage({start, waitLength});
			myWorker.onmessage = function(e) {
				elements.secondsLeft.textContent = e.data;
				if (e.data <= 0) {
					elements.snackbarDiv.classList.remove("show");
					myWorker.terminate();
				}
			}
		}
	}

	function sort_stores() {
		$.ajax({
			url: '/sort_stores',
			type: "GET",
			data: { franchise: $('#franchise').val()},
				success: function(msg) {
					if (msg.status == "success") {
						document.getElementById('massmart_store').disabled = false;
						document.getElementById('massmart_store').value = "";
						var datalist = document.getElementById("massmart_stores");
						datalist.querySelectorAll('*').forEach(n => n.remove());
						msg.store_list.forEach(store => {
							var el = document.createElement("option");
							el.textContent = store;
							datalist.appendChild(el);
						});
					} else {
						console.log("Something went wrong");
					}
				},
				error: function(msg){
					console.log("400/500 error");
				}
		});
	}

	function az_send_data(json_obj){
		json_obj.Store = document.getElementById("massmart_store").value;
		delete json_obj.Response[-1];
    delete json_obj.Response[0];
		// console.log("###About to Send To Azure#########");
		$.ajax({
			method: "POST",
			url: "/json_receiver",
			data : JSON.stringify(json_obj),
			contentType: "application/json",
			success : function() {
				console.log("JSON userData sent to Backend json_receiver()");
				// console.log("JSON objjjjjjj", JSON.stringify(json_obj));

				// Reset responses.
				let i = 1;
				while (i <= globals.questionsLength) {
					globals.json_obj.Response[i++] = null; 
				}
			},
		});
	}

	return {
		showSnackBar,
		sort_stores,
		az_send_data 
	}

})();

