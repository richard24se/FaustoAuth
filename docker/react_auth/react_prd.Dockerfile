FROM node:10-alpine as base_react_prd
WORKDIR /ui
RUN apk add --no-cache \
    autoconf \
    automake \
    bash \
    g++ \
    make
COPY ./ui/package.json /ui/
COPY ./ui/webpack* /ui/
RUN yarn install
RUN yarn upgrade
COPY ./ui /ui
ENV GENERATE_SOURCEMAP=false
RUN yarn build
RUN rm -rf ./src ./public ./node_modules webpack.config.js yarn.lock

FROM node:10-alpine
COPY --from=base_react_prd /ui/build /ui/build
WORKDIR /ui
RUN yarn global add serve pm2
COPY ./ui/package.json.server /ui/package.json
RUN yarn install
COPY ./ui/server /ui/server
COPY ./ui/src/loader.jsx /ui/src/loader.jsx 
# ENTRYPOINT serve -s build -l 3000 --debug
ENTRYPOINT  pm2 start server/index.js --no-daemon --name react-frontend 