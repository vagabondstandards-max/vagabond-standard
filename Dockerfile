FROM php:8.2-apache
COPY . /var/www/html/
RUN chown -R ww-data:www-data /var/www/html
EXPOSE 80
