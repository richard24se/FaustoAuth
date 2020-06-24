FROM dpage/pgadmin4

COPY ./docker/pgadmin/data.json /tmp/data.json
RUN whoami
USER root
RUN apk add virtualbox-guest-additions