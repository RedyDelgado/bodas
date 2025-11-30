FROM php:8.2-apache

# Instalar extensiones necesarias para Laravel (pdo_mysql)
RUN docker-php-ext-install pdo pdo_mysql

# Habilitar mod_rewrite para que funcionen las rutas
RUN a2enmod rewrite

WORKDIR /var/www/html

# Copiamos el código (en desarrollo también montaremos el volumen)
COPY . /var/www/html

# Permisos básicos
RUN chown -R www-data:www-data /var/www/html
