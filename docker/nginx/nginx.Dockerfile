FROM nginx:1.15
COPY ./docker/nginx/app.conf /etc/nginx/conf.d/app.conf
ARG hostname_app
ARG port_app
RUN sed -i "s/hostname_app/${hostname_app}/g" /etc/nginx/conf.d/app.conf
RUN sed -i "s/port_app/${port_app}/g" /etc/nginx/conf.d/app.conf
ENTRYPOINT nginx -g 'daemon off;'