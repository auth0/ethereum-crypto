FROM node:wheezy
COPY package.json package.json
ENV vld bld
RUN npm install
RUN npm install -g mocha
RUN npm install -g browserify
ADD src src
ADD test test
RUN mocha test
