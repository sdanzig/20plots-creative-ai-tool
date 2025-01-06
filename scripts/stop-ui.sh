#!/bin/bash
CONTAINER_NAME=20plots-ui-container

if [[ $(docker ps -a -f "name=$CONTAINER_NAME" --format '{{.Names}}') == $CONTAINER_NAME ]]; then
    echo "Stopping and removing 20plots-ui container with name: $CONTAINER_NAME"
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
else
    echo "No 20plots-ui container exists."
fi
