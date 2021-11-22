let globals = (function() {
	// Dev settings
	let devDebug = devDebugConfig;

	// Browser aspect ratio
	let videoWidth = 1280;
	let videoHeight = 960;
	let browserName = detectBrowser();
	if (browserName == "Firefox") {
		videoHeight = 720;
	}

	// Globals for run_next_step loop;
	let is_first_run = 1;
	let in_timeout = 0;
	let qrCodeDisplayTime = 15000;
	let lastResponseDiplayTime = 13000;
	let in_timeout_lenghth = 2000;
	let step_counter = 0;

	// JSON obj to be uploaded and questions
	let timestamp = moment().format();
	let questions = [
		"Please share your experience with us. Give me a thumbs up to continue",
	];
	let questionsLength = 0;
	let q5_y_responce = "Thank you for providing your feedback. Unfortunately, associates and their immediate family members are not eligible to enter the competition.";
	let q5_n_responce = "Please use your cell phone to scan the QR code to complete the rest of the survey to confirm your entry to win a R5,000 Game voucher. If your cell phone does not have QR code capability, you may complete the survey on feedback.game.co.za T’s and C’s apply.";
	let json_obj = {
		Device: null,
		Store: null,
		TimeStamp: null,
		Q_NO: {
		},
		Response: {
			0: null,
			1: null,
			2: null,
			3: null,
			4: null,
			5: null,
			6: null
		}
	};

	// Debouncing and prediction results
	let thumbsUpCount = 0;
	let thumbsDownCount = 0;
	let debounceResult = "";
	let debounceSize = 3;
	let predictionResult = "";
	let prevPredictionResult = "";

	// Inactive timer
	let startTimer;
	let current;
	let inactiveLength = waitTimerConfig * 1000;
	let inactiveCountdown = countdownTimerConfig * 1000;
	let firstOnResultRun = true;
	let startWorkerTimer = true;
	let inactiveWorker;

	// Dashboard Data 
	let multiple_line_array = []
	let bar_graph_array = []


	return {
		devDebug,
		browserName,
		videoWidth,
		videoHeight,
		is_first_run,
		in_timeout,
		qrCodeDisplayTime,
		lastResponseDiplayTime,
		in_timeout_lenghth,
		step_counter,
		timestamp,
		questions,
		q5_y_responce,
		q5_n_responce,
		thumbsUpCount,
		thumbsDownCount,
		debounceResult,
		debounceSize,
		predictionResult,
		prevPredictionResult,
		startTimer,
		current,
		inactiveLength,
		inactiveCountdown,
		firstOnResultRun,
		startWorkerTimer,
		inactiveWorker,
		json_obj,
		questionsLength,
		multiple_line_array,
		bar_graph_array
	}
})();
