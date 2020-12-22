#!/usr/bin/env bash

ID=faviconate
KEY=$RANDOM

echo "Building project"
npm run build
if  [[ $? -gt 0 ]]
then
    exit
fi

echo "Building image"
docker build --tag=${ID}-${KEY} . && \

echo "Running image"
docker run  --name=${ID}-container-${KEY} -p80:80 -eLOG_LEVEL=trace ${ID}-${KEY}

echo "Stopping container"
# docker rm -f ${ID}-container