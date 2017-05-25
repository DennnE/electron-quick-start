#!/bin/bash

set -xe

TRAVIS_BUILD_STEP="$1"
DOCKER_BUILDER_NAME='builder'
THIS_PATH=$(dirname $0)

if [ "$TRAVIS_BUILD_STEP" == "before_install" ]; then
    if [ -n "$ARCH" ]; then DOCKER_IMAGE="$ARCH/$DOCKER_IMAGE"; fi

    docker run --name $DOCKER_BUILDER_NAME -e LANG=C.UTF-8 -e TERM \
           -v $PWD:$PWD -w $PWD/$THIS_PATH -td $DOCKER_IMAGE

    docker exec -i $DOCKER_BUILDER_NAME apt-get update -q
    docker exec -i $DOCKER_BUILDER_NAME apt-get install -y snapcraft
elif [ "$TRAVIS_BUILD_STEP" == "script" ]; then
    docker exec -i $DOCKER_BUILDER_NAME snapcraft
fi
