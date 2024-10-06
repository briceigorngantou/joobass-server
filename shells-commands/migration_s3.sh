#!/bin/bash
user="administrator"
username="contact@jobaas.cm"
password="string9S#"
server=$1 #"192.168.1.17:4000" #"jobaas-backend-dev.herokuapp.com"
https=$2 #"192.168.1.17:4000" #"jobaas-backend-dev.herokuapp.com"
#start the migration by making a temporary folder
mkdir "tmp_test"
#function to get extension from a mime type string
function getext() {
   [ "$#" != 1 ] && { echo "Wrong number of arguments. Provide exactly one." >&2; return 254; }
   [ -r "$1" ] || { echo "Not a file, nonexistent or unreadable." >&2; return 1; }
   grep "^$(file -b --mime-type "$1")"$'\t' /etc/mime.types |
      awk -F '\t+' '{print $2}'
}
#get the token of admin
token=$(curl -s -v -X POST -H "Accept: \ application/json" \
  -d  "email=${username}&password=${password}" \
  "http${https}://${server}/api/v1/auth/login/${user}" | jq -r '.data.accessToken')
echo "token : $token"
#get list of All Metafiles

response_metafiles=$(curl -v -X GET -H "Authorization: Bearer ${token}" \
  -H "Content-Type: application/json" \
  -H "Accept: \ application/json" \
  "http${https}://${server}/api/v1/fileManager/metadata?pagination=false")
  
echo "${response_metafiles}" > "test_shell.json"

number_of_metafiles=$(jq -r '.data.length' <<< "$response_metafiles")
#iterating the metafiles to get the streams and send them to s3 bucket
#for ((i=0;i<=${number_of_metafiles};i++))
for row in $(echo "${response_metafiles}" | jq -r '.data.metadataFiles[] | @base64'); do
    _jq() {
     echo ${row} | base64 --decode | jq -r  ${1}
    }

#   echo  $(_jq '.') >> "test_shell_${i}.json"
#   echo $(_jq '.name')
  #first we get the meta data relatives to the file and download the stream with the _jq function using jq package*

  cour_name=$(_jq '.name');
  cour_metaId=$(_jq '._id');
  cour_id_file=$(_jq '.fileId');
  cour_type_file=$(_jq '.fileType');
  cour_mimeType=$(curl -s -I "http${https}://$server/api/v1/fileManager/${cour_id_file}/stream" | grep -i "^Content-Type:")
#  cour_extension=$(grep "${cour_mimeType}" /etc/mime.types | awk '{print $2}')
  cour_extension=$(getext "$cour_mimeType");
  echo  "${cour_mimeType}" >> "test_shell.txt"
  owner=$(_jq '.owner');
  
  echo "************ Debut de la migration du fichier avec l'id"
  
  stream_in=$(curl -v -X GET \
    -o "./tmp_test/${cour_type_file}_${cour_id_file}"\
    "http${https}://$server/api/v1/fileManager/${cour_id_file}/stream")
  $(sleep 2)
  #Now we migrate the data into s3 bucket and update all collections that should change
  echo "file=@./tmp_test/${cour_type_file}_${cour_id_file}.${cour_extension}"
  
  stream_out=$(curl -v -X PUT \
    -H "Authorization: Bearer ${token}" \
    -F "file=@./tmp_test/${cour_type_file}_${cour_id_file}" \
    -F "extension=${cour_mimeType}" \
    -F "name=${cour_name}" \
    "http${https}://${server}/api/v1/fileManager/metafile/${cour_metaId}/migration?fileType=${cour_type_file}")
  echo "Fin de la migration du fichier avec l'id ${cour_id_file}"
  #rm "./tmp_test/${cour_type_file}_${cour_id_file}"
  $(sleep 3)
done
# '{"email": "${username}", "password": "${password}"}'   application/json   \ application/x-www-form-urlencoded       -H "Content-Type: multipart/form-data" \
