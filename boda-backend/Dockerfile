FROM php:8.2-apache

# 1) Librerías del sistema necesarias para GD + ZIP
RUN apt-get update && apt-get install -y \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libzip-dev \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install gd pdo pdo_mysql zip

# 2) Habilitar mod_rewrite para Laravel
RUN a2enmod rewrite

WORKDIR /var/www/html

# 3) Copiar código
COPY . /var/www/html

# 3.1) Instalar Composer dentro de la imagen
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

# 4) Permisos
RUN chown -R www-data:www-data /var/www/html

# 5) MUY IMPORTANTE: DocumentRoot -> /public
RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' \
    /etc/apache2/sites-available/000-default.conf && \
    sed -ri -e 's!/var/www/html!/var/www/html/public!g' \
    /etc/apache2/apache2.conf

# 6) Al iniciar el contenedor, instalar dependencias y arrancar Apache
CMD ["bash", "-lc", "composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader && apache2-foreground"]
