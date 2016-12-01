#!/bin/bash

docker build -t crypto .
docker run --name zzz crypto browserify src/ethCrypto.js --standalone EthCrypto -o bundle.js
docker cp zzz:bundle.js bundle.js
