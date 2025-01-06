#!/bin/sh

# Exit script on any error
set -e

# Set default values for variables
AWS_REGION=${AWS_REGION:-us-east-2}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}
ECR_REPOSITORY=${ECR_REPOSITORY:-twentyplots-ui}
DOCKER_IMAGE_TAG=${DOCKER_IMAGE_TAG:-latest}
PLATFORM=${PLATFORM:-linux/amd64}
PROJECT_DIR=${PROJECT_DIR:-../20plots-ui}
REGISTRY_URI=${REGISTRY_URI:-${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com}

# Check if AWS_ACCOUNT_ID is set
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo "Please set AWS_ACCOUNT_ID environment variable."
    exit 1
fi

# Full image URI
IMAGE_URI=${REGISTRY_URI}/${ECR_REPOSITORY}:${DOCKER_IMAGE_TAG}

# Clean up Docker system
docker system prune -a -f

cd "$PROJECT_DIR"

# Log in to the container registry
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$REGISTRY_URI"

# Create and bootstrap the builder instance if it doesn't exist
if ! docker buildx inspect mybuilder > /dev/null 2>&1; then
    docker buildx create --name mybuilder --use
    docker buildx inspect mybuilder --bootstrap
fi

# Build and push the image
docker buildx build --push --platform "$PLATFORM" -t "$IMAGE_URI" .