#!/bin/bash
echo "This will only work with the non-containerized UI run with dev-run-ui.sh"
cd ../20plots-server

CONTAINER_NAME=20plots-server-container

# check if the container is running or exists
if [ $(docker ps -aq -f name=$CONTAINER_NAME) ]; then
   # stop and remove it
   docker stop $CONTAINER_NAME
   docker rm $CONTAINER_NAME
fi

./gradlew clean build
TWENTYPLOTS_FRONTEND_URL=http://localhost:3000 java -jar build/libs/20plots-0.0.1-SNAPSHOT.jar
