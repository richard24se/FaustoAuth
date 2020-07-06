FROM dpage/pgadmin4
COPY ./docker/pgadmin/data.json /tmp/data.json
COPY ./docker/pgadmin/data.json /pgadmin4/servers.json
RUN whoami
USER root
RUN apk add virtualbox-guest-additions