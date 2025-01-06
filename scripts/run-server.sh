#!/bin/bash
echo "This will only work with the containerized UI run with run-ui.sh"
cd ../20plots-server
docker build --no-cache -t 20plots-server .
CONTAINER_NAME=20plots-server-container

# check if the container is running or exists
if [ $(docker ps -aq -f name=$CONTAINER_NAME) ]; then
   # stop and remove it
   docker stop $CONTAINER_NAME
   docker rm $CONTAINER_NAME
fi

CONTAINER_ID=$(docker run \
--name $CONTAINER_NAME \
-e TWENTYPLOTS_FRONTEND_URL=http://localhost \
-e TWENTYPLOTS_JWT_SECRET \
-e TWENTYPLOTS_POSTGRES_URL=jdbc:postgresql://host.docker.internal:5432/twentyplotsdb \
-e TWENTYPLOTS_OPENAI_APIKEY \
-e TWENTYPLOTS_OPENAI_URL \
-e TWENTYPLOTS_OPENAI_MODEL \
-e TWENTYPLOTS_POSTGRES_USERNAME \
-e TWENTYPLOTS_POSTGRES_PASSWORD \
-e TWENTYPLOTS_ACTIVE_ENV \
-p 8080:8080 \
-d 20plots-server)

docker logs --follow $CONTAINER_ID
