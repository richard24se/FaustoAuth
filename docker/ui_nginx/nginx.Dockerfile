FROM richard24se/ui_faustoauth as fe
#Load nginx imagen
FROM nginx:1.15
COPY --from=fe /ui/build /usr/share/nginx/html
WORKDIR /home/
COPY ./docker/ui_nginx/config/app.conf /etc/nginx/conf.d/app.conf
COPY ./docker/ui_nginx/config/nginx.conf /etc/nginx/nginx.conf
ARG hostname_app
ARG port_app
RUN sed -i "s/hostname_app/${hostname_app}/g" /etc/nginx/conf.d/app.conf
RUN sed -i "s/port_app/${port_app}/g" /etc/nginx/conf.d/app.conf
ENTRYPOINT nginx -g 'daemon off;'