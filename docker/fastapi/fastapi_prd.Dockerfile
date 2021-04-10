FROM python:3.9-slim as base_prd
WORKDIR /fastapi
#time zone
# RUN apk add tzdata
# RUN cp /usr/share/zoneinfo/America/Lima /etc/localtime && \
#     echo America/Lima >/etc/timezone
# RUN apk update \
#     && apk add --virtual build-deps gcc python3-dev musl-dev \
#     && apk add --no-cache mariadb-dev  \
#     && apk add --no-cache libressl-dev libffi-dev \
#     && apk add postgresql-dev
# RUN apk add --no-cache \
#     autoconf \
#     automake \
#     bash \
#     g++ \
#     make 
RUN apt-get clean && \
    apt-get update && \
    apt-get install -y \
            tzdata \
            libffi-dev \
            python3-dev \
            build-essential 

RUN echo America/Lima >/etc/timezone && \
    ln -sf /usr/share/zoneinfo/America/Lima /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata

# COPY docker/fastapi/reqs_fastapi.pip .
# RUN pip3 install -r reqs_fastapi.pip
COPY ./fastapi /fastapi
# PRD
RUN pip install pyarmor
WORKDIR /fastapi
RUN pyarmor obfuscate --recursive /fastapi/run.py
# RUN cp -rf /api/src/.env /api/dist/.env
# RUN rm -rf /api/src
WORKDIR /fastapi/dist
FROM python:3.9-slim
RUN apt-get clean && \
    apt-get update && \
    apt-get install -y \
            tzdata \
            libffi-dev \
            python3-dev \
            build-essential 

RUN echo America/Lima >/etc/timezone && \
    ln -sf /usr/share/zoneinfo/America/Lima /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata
#librery dependency for postgressql-binary
RUN apt-get install libpq-dev gcc -y
COPY --from=base_prd /fastapi /fastapi
WORKDIR /fastapi
COPY docker/fastapi/reqs_fastapi.pip .
RUN pip3 install -r reqs_fastapi.pip
WORKDIR /fastapi/dist
ENTRYPOINT gunicorn run:app -k uvicorn.workers.UvicornWorker  -b 0.0.0.0:5000 --timeout 38400 -w 8 --max-requests 100 --forwarded-allow-ips="*"