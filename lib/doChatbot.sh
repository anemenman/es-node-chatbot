#!/bin/bash

POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -p|--port)
    PORT="$2"
    shift # past argument
    shift # past value
    ;;
    -h|--host)
    HOST="$2"
    shift # past argument
    shift # past value
    ;;
    *)    # unknown option
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

if [ -z $PORT ] || [ -z $HOST ] ; then
	echo "Usage doChatbot.sh -p/--port -h/--host"
	exit
fi

echo PORT  = "${PORT}"
echo HOST  = "${HOST}"

echo "Deleting chatbot indice"
curl -XDELETE "http://$HOST:$PORT/chatbot" && echo

echo "Recreating chatbot indice with new mapping/settings"
curl --header "Content-Type:application/json" -XPUT "http://$HOST:$PORT/chatbot" --data @'chatbot.json' && echo

