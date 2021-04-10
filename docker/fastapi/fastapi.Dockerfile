FROM python:3.9-alpine
ENV PYTHONUNBUFFERED 1
WORKDIR /fastapi
#time zone
RUN apk add tzdata
RUN cp /usr/share/zoneinfo/America/Lima /etc/localtime && \
    echo America/Lima >/etc/timezone
RUN apk update \
    && apk add --virtual build-deps gcc python3-dev musl-dev \
    && apk add --no-cache mariadb-dev  \
    && apk add --no-cache libressl-dev libffi-dev \
    && apk add postgresql-dev
RUN apk add --no-cache \
    autoconf \
    automake \
    bash \
    g++ \
    make 

COPY docker/fastapi/reqs_fastapi.pip .
RUN pip3 install -r reqs_fastapi.pip
COPY ./fastapi /fastapi