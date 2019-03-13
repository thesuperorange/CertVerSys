FROM node:8

ENV appdir /opt/cert-contract
WORKDIR $appdir
# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
COPY package.json /tmp/
RUN cd /tmp && npm install
RUN cp -a /tmp/node_modules $appdir
# From here we load our application's code in, therefore the previous docker
# "layer" thats been cached will be used if possible
RUN npm install -g truffle
COPY ./ $appdir