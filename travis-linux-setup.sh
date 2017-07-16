#!/bin/bash

set -xe

DOCKER_BUILDER_NAME='builder'
THIS_PATH=$(dirname $0)

if [ -n "$ARCH" ]; then DOCKER_IMAGE="$ARCH/$DOCKER_IMAGE"; fi

docker run --name $DOCKER_BUILDER_NAME -e LANG=C.UTF-8 -e TERM \
       -v $PWD:$PWD -w $PWD/$THIS_PATH -td $DOCKER_IMAGE

docker exec -i $DOCKER_BUILDER_NAME apt-get update -q
docker exec -i $DOCKER_BUILDER_NAME apt-get install -y snapcraft