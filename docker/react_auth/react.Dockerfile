FROM node:10-alpine

WORKDIR /ui
RUN apk add --no-cache \
    autoconf \
    automake \
    bash \
    g++ \
    make
COPY ./ui/package* /ui/
COPY ./ui/webpack* /ui/
RUN more /ui/package*
RUN more /ui/webpack*
RUN yarn install
COPY ./ui /ui