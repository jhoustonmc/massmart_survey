let elements = (function() {
	// Snackbar elements
	let snackbarDiv = document.getElementById("snackbar");
	let secondsLeft = document.getElementById("seconds_left");
	let sbMessage = document.getElementById("sb_message");

	// Video elements
	let dummy_video = document.getElementById("dummy_input");
	const videoElement = document.getElementsByClassName('input_video')[0];
	const canvasElement = document.getElementsByClassName('output_canvas')[0];
	const controlsElement = document.getElementsByClassName('control-panel')[0];
	const canvasCtx = canvasElement.getContext('2d');

	// Thumb SVG's and modal
	let svgThumbDown = document.getElementById("svg_thumb_down");
	let svgThumbUp = document.getElementById("svg_thumb_up");
	let modal = document.getElementById("myModal");
	let modalImg = document.getElementById("img01");
	let thumbImg = document.getElementById("thumbs_down_up");
	let descriptionHeader = document.getElementById("tl-survey");

	// Dashboard elements
    let dashboardModal = document.getElementById("dashboardModal");
	let openDashboard = document.getElementById("dashboardOpen");
	let closeDashboard = document.getElementById("dashboardClose");

	let logo = document.getElementById("logo");

	let progressBar = document.getElementById("inner-progress-bar");

	return {
		snackbarDiv,
		secondsLeft,
		sbMessage,
		videoElement,
		canvasElement,
		controlsElement,
		canvasCtx,
		svgThumbUp,
		svgThumbDown,
		dummy_video,
		modal,
		modalImg,
		thumbImg,
		descriptionHeader,
		dashboardModal,
		openDashboard,
		closeDashboard,
		logo,
		progressBar
	}
})();