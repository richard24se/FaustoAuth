FROM python:3.6-slim as base_prd
WORKDIR /api
COPY ./api/requirements.pip /api/requirements.pip
# RUN pip install -r requirements.pip
COPY ./api/src /api/src
# PRD
RUN pip install pyarmor
WORKDIR /api/
RUN pyarmor obfuscate --recursive src/run.py
# RUN cp -rf /api/src/.env /api/dist/.env
# RUN rm -rf /api/src
WORKDIR /api/dist
FROM python:3.6-slim
RUN apt-get update
#librery dependency for postgressql-binary
RUN apt-get install libpq-dev gcc -y
COPY --from=base_prd /api /api
WORKDIR /api
RUN pip install -r requirements.pip
WORKDIR /api/dist
WORKDIR /api/src
ENTRYPOINT gunicorn run:APP -b 0.0.0.0:5000 --timeout 38400 -w 8 --max-requests 100