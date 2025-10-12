FROM python:3.12-alpine
ENV PYTHONUNBUFFERED 1
WORKDIR /fastapi
#time zone
RUN apk add tzdata
RUN cp /usr/share/zoneinfo/America/Lima /etc/localtime && \
    echo America/Lima >/etc/timezone
RUN apk update \
    && apk add --virtual build-deps gcc python3-dev musl-dev \
    && apk add --no-cache mariadb-dev  \
    && apk add --no-cache openssl-dev libffi-dev \
    && apk add postgresql-dev
RUN apk add --no-cache \
    autoconf \
    automake \
    bash \
    g++ \
    make 
RUN pip install poetry
# COPY docker/fastapi/reqs_fastapi.pip .
COPY ./fastapi/pyproject.toml .
RUN poetry config virtualenvs.create false
RUN poetry lock && poetry install
# RUN pip3 install -r reqs_fastapi.pip
#test
COPY ./fastapi /fastapi