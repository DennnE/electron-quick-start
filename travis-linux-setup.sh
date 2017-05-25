#!/bin/bash

set -xe

TRAVIS_BUILD_STEP="$1"
DOCKER_BUILDER_NAME='builder'
THIS_PATH=$(dirname $0)

if [ -z "$TRAVIS_BUILD_STEP" ]; then
    echo "No travis build step"
    exit 0
fi

function docker_exec() {
    docker exec -i $DOCKER_BUILDER_NAME $*
}

if [ "$TRAVIS_BUILD_STEP" == "before_install" ]; then
    if [ -n "$ARCH" ]; then DOCKER_IMAGE="$ARCH/$DOCKER_IMAGE"; fi

    docker run --name $DOCKER_BUILDER_NAME -e LANG=C.UTF-8 -e TERM \
           -v $PWD:$PWD -w $PWD/$THIS_PATH -td $DOCKER_IMAGE

    docker_exec apt-get update -q
    docker_exec apt-get install -y snapcraft
elif [ "$TRAVIS_BUILD_STEP" == "script" ]; then
    docker_exec snapcraft
fi
