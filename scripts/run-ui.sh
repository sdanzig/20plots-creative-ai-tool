#!/bin/bash
echo "This will only work with the containerized server run with run-server.sh"
cd ../20plots-ui

# Build the Docker image
docker build --no-cache --build-arg REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL -t 20plots-ui .

CONTAINER_NAME=20plots-ui-container

# check if the container is running or exists
if [ $(docker ps -aq -f name=$CONTAINER_NAME) ]; then
   # stop and remove it
   docker stop $CONTAINER_NAME
   docker rm $CONTAINER_NAME
fi

# Run the Docker container
CONTAINER_ID=$(docker run \
--name $CONTAINER_NAME \
-e REACT_APP_BACKEND_URL \
-p 80:80 \
-d 20plots-ui)

docker logs --follow $CONTAINER_ID
