FROM nginx:1.15
WORKDIR /home/
RUN apt-get clean && \
    apt-get update && \
    apt-get install -y \
    tzdata
RUN echo America/Lima >/etc/timezone && \
    ln -sf /usr/share/zoneinfo/America/Lima /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata
RUN apt-get install -y openssl apt-transport-https ca-certificates tzdata
RUN openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout privkey.pem -out fullchain.pem -subj "/C=PE/ST=Lima/L=Lima/O=Fausto/OU=IT/CN=server_erm"

WORKDIR /home/
COPY ./docker/nginx/config/app.conf /etc/nginx/conf.d/app.conf
RUN openssl genrsa 4096 > account.key
RUN openssl genrsa 4096 > domain.key
RUN openssl req -new -sha256 -key domain.key -subj "/CN=faustoauth.com" > domain.csr
RUN apt install wget python3 inetutils-ping -y
RUN mkdir -p /var/www/challenges/
RUN wget -O - "https://raw.githubusercontent.com/diafygi/acme-tiny/master/acme_tiny.py" > acme_tiny.py
RUN echo "127.0.0.1 faustoauth.com" >> /etc/hosts
#RUN wget http://faustoauth.com/.well-known/acme-challenge
#RUN python3 acme_tiny.py --account-key ./account.key --csr ./domain.csr --acme-dir /var/www/challenges/ > ./signed_chain.crt
