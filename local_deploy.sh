#!/bin/sh

# build image
docker build -t es-node-chatbot .

# Start es
/usr/local/bin/docker-compose up -d es-node-chatbot-elasticsearch

sleep 20

cd lib && ./doChatbot.sh -h localhost -p 9221 && cd ..

# run chat-bot
/usr/local/bin/docker-compose up -d

#docker rmi $(docker images --filter "dangling=true" -q --no-trunc)
