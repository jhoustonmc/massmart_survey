onmessage = function(e) {
	if (e.data.start === true) {
		let timeLeft = 1000;
		let start = Date.now();
		let current = Date.now();

		while (current < start + e.data.waitLength) {
			if (current > start + timeLeft) {
				postMessage((e.data.waitLength - timeLeft) / 1000);
				timeLeft += 1000;
			}   
			current = Date.now();
		}
		postMessage(0);
	}
}