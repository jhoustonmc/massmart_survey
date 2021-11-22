from flask import Flask, render_template, request, jsonify, json, session
from azure.storage.blob import ContainerClient, BlobClient, __version__, BlobServiceClient
import datetime, os, re, glob
from os import path, stat

from flask.wrappers import Request

app = Flask(__name__)
# Temporary fix for POC by adding session session config here.
app.secret_key = '\xfd{H\xe5<\x95\xf9\xe3\x96.5\xd1\x01O<!\xd5\xa2\xa0\x9fR"\xa1\xa8'
app.config['SESSION_TYPE'] = 'filesystem'

def download_single_azure_blob(container_name, blob_name, download_path):

	connect_str = "BlobEndpoint=https://bcxmassmartsurvey.blob.core.windows.net/;QueueEndpoint=https://bcxmassmartsurvey.queue.core.windows.net/;FileEndpoint=https://bcxmassmartsurvey.file.core.windows.net/;TableEndpoint=https://bcxmassmartsurvey.table.core.windows.net/;SharedAccessSignature=sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacuptfx&se=2021-12-01T02:03:41Z&st=2021-08-01T18:03:41Z&spr=https&sig=HFhJncWthuHph3KM914TQeR8%2Bnf03uuPBpPoC%2BFBRXI%3D"
	blob_service_client = BlobServiceClient.from_connection_string(connect_str)

	blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
	download_file_path = os.path.join(download_path, blob_name)

	try:
		with open(download_file_path, "wb") as download_file:
			download_file.write(blob_client.download_blob().readall())
	except:
		return -1 # Error when downloading file
	return 1 # File downloaded successfully

def download_all_blobs(container_name, download_path):

	connect_str = "BlobEndpoint=https://bcxmassmartsurvey.blob.core.windows.net/;QueueEndpoint=https://bcxmassmartsurvey.queue.core.windows.net/;FileEndpoint=https://bcxmassmartsurvey.file.core.windows.net/;TableEndpoint=https://bcxmassmartsurvey.table.core.windows.net/;SharedAccessSignature=sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacuptfx&se=2021-12-01T02:03:41Z&st=2021-08-01T18:03:41Z&spr=https&sig=HFhJncWthuHph3KM914TQeR8%2Bnf03uuPBpPoC%2BFBRXI%3D"
	blob_service_client = BlobServiceClient.from_connection_string(connect_str)

	try:
		blob_client = blob_service_client.get_container_client(container=container_name)
		generator = blob_client.list_blobs()

		for blob in generator:
			blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob.name)

			blob_file_path = os.path.join(download_path, blob.name)

			with open(blob_file_path, "wb") as download_file:
				download_file.write(blob_client.download_blob().readall())	
	except:
		return -1
	return 1


@app.route('/')
def index():
	config_container_name = "massmartconfigs"
	config_blob_file_name = "config.json"

	# Downloading json config from Azure
	if (download_single_azure_blob(config_container_name, config_blob_file_name, "./") == -1):
		return render_template('dashboard.html', error="Error with getting data from Azure")
	# Getting variables from config.json
	try:
		with open("./%s" % config_blob_file_name) as f:
			config_json_data = json.load(f)
	except:
		return render_template('dashboard.html', error="Incoming configuration data is incorrect")

	container_name = "massmartfranchises"
	blob_file_name = "massmartfranchiseslist.json"
	local_path = "./data//list"

	# Making sure the data directory exists
	if not path.exists(local_path):
		os.makedirs(local_path)

	# Downloading json from Azure
	if (download_single_azure_blob(container_name, blob_file_name, local_path) == -1):
		return render_template('dashboard.html', error="Error with getting data from Azure")

	try:
		with open("./data//list/%s" % blob_file_name) as f:
			json_data = json.load(f)
		franchise_list = []
		string=""
		for stores in json_data["stores"]:
			if (string!=stores["group"]):
				string=stores["group"]
				franchise_list.append(stores["group"])
	except:
		return render_template('dashboard.html', error="Incoming data is incorrect")

	# Downloading logos from Azure	
	logo_container_name = "massmartlogos"
	logo_local_path = "./static/images/logos"

	# Making sure the logo directory exists
	if not path.exists(logo_local_path):
		os.mkdir(logo_local_path)

	if (download_all_blobs(logo_container_name, logo_local_path) == -1):
		return render_template('dashboard.html', error="Error with getting data from Azure")

	return render_template('dashboard.html', franchise=franchise_list, config_data=config_json_data)


@app.route('/sort_stores', methods=['GET'])
def sort_stores():
	if request.method == 'GET':
		franchise = request.args.get('franchise')
		# Getting data from json file
		with open("./data//list/massmartfranchiseslist.json") as f:
			json_data = json.load(f)

		store_list = []
		for stores in json_data["stores"]:
			if (stores["group"] == franchise):
				store_list.append(stores["store"])

		status = "success"
		# Sending data to frontend
		return ({"status": status, "store_list": store_list})


@app.route('/authenticate', methods=['POST'])
def authenticate():
	if request.method == 'POST':
		try: 
			franchise = request.form['franchise']
			session['franchise'] = franchise
			print(f'-----THE SESSION ---------\n{session["franchise"]}')
			store = request.form['massmart_store']
			password = request.form['password']
		except:
			return({"status": "Incorrect data submitted"})
		with open("./data//list/massmartfranchiseslist.json") as f:
			json_data = json.load(f)

		# Getting colour, password, questions and franchise specific to store picked
		for stores in json_data["stores"]:
			if (stores["store"] == store and stores["group"] == franchise):
				questions = stores["questions"]
				store_password = stores["upassword"]
				colour = stores["color"]
				image = stores["logo"]
				uuid = stores["uuid"]
				session['uuid_list'] = [uuid]
				status = "success"
				break
			else:
				status = "error"
		if (status == "error"):
			return({"status": "Incorrect data submitted"})
	
		# Authenticating password
		if (password == store_password):
			status = "success"
		else:
			status = "Password incorrect"
		return({"status": status, "store": store, "colour": colour, "franchise": franchise, "image": image, "questions":questions, "uuid":uuid })


def multiple_line_chart(json_data):
	currentDate = 1
	endDate = 31
	thumbsUpArray = []
	thumbsDownArray = []
	thumbsup = 0
	thumbsdown = 0
	objectIndex = 0
	i = 1
	while ((currentDate - 1) <= endDate and objectIndex < len(json_data)):
		try:
			obj_date = json_data[objectIndex]["TimeStamp"]
			obj_response = json_data[objectIndex]["Response"]
		except:
			continue
		i = 1
		
		if (obj_date != None and int(obj_date[8:10]) == currentDate):
			for response in obj_response:
				if (obj_response[str(i)] == "Yes"):
					thumbsup += 1
				elif (obj_response[str(i)] == "No"):
					thumbsdown += 1
				i += 1
			objectIndex += 1
		else:
			thumbsUpArray.append(thumbsup)
			thumbsDownArray.append(thumbsdown)
			thumbsup = 0
			thumbsdown = 0
			currentDate += 1
	while (currentDate <= endDate):
		thumbsUpArray.append(thumbsup)
		thumbsDownArray.append(thumbsdown)
		thumbsup = 0
		thumbsdown = 0
		currentDate += 1
	return (thumbsUpArray, thumbsDownArray)


def doughnut_chart_Q_NO(json_data, Q_NO):
	thumbsup = 0
	thumbsdown = 0

	for obj in json_data:
		obj_response = obj["Response"]
		obj_response_list = list(obj["Response"])
		obj_response_index = obj_response_list[Q_NO]
		if (obj_response[str(obj_response_index)] == "Yes"):
			thumbsup += 1
		elif (obj_response[str(obj_response_index)] == "No"):
			thumbsdown += 1
				
	return (thumbsup, thumbsdown)

def get_uuid_list():
	
	with open("./data//list/massmartfranchiseslist.json") as f:
		json_obj = json.load(f)

	uuid_store_list = []
	if ('franchise' in session):
		for obj in json_obj['stores']:
			if (session['franchise'] == obj['group']):
				session['uuid_list'].append(obj['uuid'])
				uuid_store_list.append([obj['uuid'], obj['store']])
	else:
		print("Error getting uuids")
	
	return(uuid_store_list)


def get_franchise_data(uuid_list):
	container_name = "massmartsurveyuploads"
	local_data_path = "./data/downloads"
	
	# Making sure the data directory exists
	if not path.exists(local_data_path):
		os.makedirs(local_data_path)

	connect_str = "BlobEndpoint=https://bcxmassmartsurvey.blob.core.windows.net/;QueueEndpoint=https://bcxmassmartsurvey.queue.core.windows.net/;FileEndpoint=https://bcxmassmartsurvey.file.core.windows.net/;TableEndpoint=https://bcxmassmartsurvey.table.core.windows.net/;SharedAccessSignature=sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacuptfx&se=2021-12-01T02:03:41Z&st=2021-08-01T18:03:41Z&spr=https&sig=HFhJncWthuHph3KM914TQeR8%2Bnf03uuPBpPoC%2BFBRXI%3D"
	blob_service_client = BlobServiceClient.from_connection_string(connect_str)

	container_client = blob_service_client.get_container_client(container=container_name)
	generator = container_client.list_blobs()
	json_download_data = []

	for blob in generator:
		blob_name = blob.name
		if (any(uuid in blob_name for uuid in uuid_list)):
			try:
				blob_file_path = os.path.join(local_data_path, blob_name)
				blob_file_path = blob_file_path.replace(':', "-")
				blob_file_path = blob_file_path.replace(' ', "_")
				if not path.exists(blob_file_path):
					blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)

					with open(blob_file_path, "wb") as download_file:
						download_file.write(blob_client.download_blob().readall())

				with open(blob_file_path) as f:
					if os.stat(blob_file_path).st_size != 0:
						json_download_data.append(json.load(f))
				# os.remove(blob_file_path)
			except:
				return render_template('index.html', error="Error with getting data")

	return(json_download_data)


@app.route('/get_all_data', methods=['POST'])
def get_all_data():
	status = "success"
	all_store_data = get_franchise_data(session['uuid_list'])
	all_store_line_array = multiple_line_chart(all_store_data)
	i = 0
	doughnut_q_array = []
	while i < 6:
		doughnut_q_array.append(doughnut_chart_Q_NO(all_store_data, i))
		i +=1

	return({"status": status,"multiple_line_array": all_store_line_array, "uuid_store_list": get_uuid_list(), "bar_graph_array": doughnut_q_array })

@app.route('/get_uuid_data', methods=['POST'])
def get_uuid_data():
	status = "success"
	uuid_list = request.get_json()

	all_store_data = get_franchise_data(uuid_list)
	all_store_line_array = multiple_line_chart(all_store_data)

	i = 0
	doughnut_q_array = []
	while i < 6:
		doughnut_q_array.append(doughnut_chart_Q_NO(all_store_data, i))
		i +=1

	return({"status": status,"multiple_line_array": all_store_line_array, "uuid_store_list": get_uuid_list(), "bar_graph_array": doughnut_q_array })

def write_txt(userData, file_uid):
# Create a local directory to hold blob data
	local_path = "./data"

#Make the directory if it does not exist	
	if not path.exists(local_path):
		os.mkdir(local_path)

	time_stmp = str(datetime.datetime.now())

#	(if ran on windows) file names cannot have semi-colons. So had to replace some characters in the time stamp
	if os.name == 'nt':
		time_stmp = time_stmp.replace(':', '-')
		time_stmp = time_stmp.replace('.', ' ')

	# Create a file in the local data directory to upload 
	local_file_name = time_stmp + "_" + file_uid + ".json"
	upload_file_path = os.path.join(local_path, local_file_name)

	# Write text to the file
	file = open(upload_file_path, 'w')
	file.write(userData)
	file.close()

	az_uploader(upload_file_path, local_file_name)


def az_uploader(upload_file_path, local_file_name):
	container_name = "massmartsurveyuploads"

	connect_str = "BlobEndpoint=https://bcxmassmartsurvey.blob.core.windows.net/;QueueEndpoint=https://bcxmassmartsurvey.queue.core.windows.net/;FileEndpoint=https://bcxmassmartsurvey.file.core.windows.net/;TableEndpoint=https://bcxmassmartsurvey.table.core.windows.net/;SharedAccessSignature=sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacuptfx&se=2021-12-01T02:03:41Z&st=2021-08-01T18:03:41Z&spr=https&sig=HFhJncWthuHph3KM914TQeR8%2Bnf03uuPBpPoC%2BFBRXI%3D"

	blob_service_client = BlobServiceClient.from_connection_string(connect_str)	

	upload_status = -1
	try:
		blob_client = blob_service_client.get_blob_client(container=container_name, blob=local_file_name)

		# Uploading the created file user data file
		with open(upload_file_path, "rb") as data:
			blob_client.upload_blob(data)
		upload_status = 1
	except:
		upload_status = 0

	if (upload_status == 1):
		#Upload to blob storage was succesful, so we delete the json file in data folder
		os.remove(upload_file_path)

		#upload retry if it failed previously OR if there is json in the data folder
		file_list = len(os.listdir("./data"))
		if file_list > 1:
			for file_name in glob.iglob("./data" + "//*.json", recursive=False):
				jsnFileName = file_name.split("\\", 1)
				az_uploader(file_name, jsnFileName[1])


@app.route('/json_receiver', methods=['POST'])
def json_receiver():
	userData = request.get_json()
	file_uid = userData["Device"]
	json_obj = json.dumps(userData)
	write_txt(json_obj, file_uid)

#	The return statement is just notifying that it received the JSON succesfully
	return json.dumps({'success':True}), 200, {'ContentType':'application/json'}


TEMPLATES_AUTO_RELOAD = True
if __name__ == '__main__':

	app.run(debug=True, port=5000)


