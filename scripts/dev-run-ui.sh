#!/bin/bash
echo "This will only work with the non-containerized server run with dev-run-server.sh"
cd ../20plots-ui

CONTAINER_NAME=20plots-ui-container

# check if the container is running or exists
if [ $(docker ps -aq -f name=$CONTAINER_NAME) ]; then
   # stop and remove it
   docker stop $CONTAINER_NAME
   docker rm $CONTAINER_NAME
fi

echo "REACT_APP_BACKEND_URL=http://localhost:8080">.env
npm build
npm run start