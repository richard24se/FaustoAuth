FROM python:3.9-slim as base_prd
WORKDIR /fastapi
#time zone
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

COPY ./fastapi /fastapi
# PRD
RUN pip install pyarmor
WORKDIR /fastapi
RUN pyarmor obfuscate --recursive /fastapi/run.py
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