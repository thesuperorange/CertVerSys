FROM node:8-alpine AS build-env

RUN apk add --no-cache make gcc g++ python git bash

ENV appdir /opt/app
WORKDIR $appdir

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
COPY package.json /tmp/package.json
RUN cd /tmp && npm install
RUN cp -a /tmp/node_modules $appdir
# From here we load our application's code in, therefore the previous docker
# "layer" thats been cached will be used if possible
COPY ./ $appdir
# dist 
RUN npm run build

# start nginx container
FROM nginx:1.13-alpine
ENV appdir /usr/share/nginx/html
WORKDIR $appdir
COPY --from=build-env /opt/app/dist $appdir
RUN mv static/config.release.json static/config.json