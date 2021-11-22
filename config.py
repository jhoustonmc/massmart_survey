from azure.storage.blob import __version__, BlobServiceClient
import os
from os import path

config_container_name = "massmartconfigs"
config_blob_file_name = "config.json"

connect_str = "BlobEndpoint=https://bcxmassmartsurvey.blob.core.windows.net/;QueueEndpoint=https://bcxmassmartsurvey.queue.core.windows.net/;FileEndpoint=https://bcxmassmartsurvey.file.core.windows.net/;TableEndpoint=https://bcxmassmartsurvey.table.core.windows.net/;SharedAccessSignature=sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacuptfx&se=2021-12-01T02:03:41Z&st=2021-08-01T18:03:41Z&spr=https&sig=HFhJncWthuHph3KM914TQeR8%2Bnf03uuPBpPoC%2BFBRXI%3D"
blob_service_client = BlobServiceClient.from_connection_string(connect_str)

container_client = blob_service_client.get_container_client(container=config_container_name)
blob_client = container_client.get_blob_client(config_blob_file_name)
# remove old config
blob_client.delete_blob()

upload_file_path = os.path.join('./', config_blob_file_name)
# replace with new
with open(upload_file_path, "rb") as data:
    blob_client.upload_blob(data)
