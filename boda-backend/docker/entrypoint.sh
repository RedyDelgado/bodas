#!/bin/bash
set -e

echo "Installing dependencies with Composer..."
composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader || true

echo "Clearing cached configs..."
php artisan config:clear || true
php artisan cache:clear || true

echo "Starting cron service..."
service cron start || true

echo "Setting up Laravel scheduler cron job..."
# Agregar cron job que ejecute el scheduler cada minuto
echo "* * * * * www-data cd /var/www/html && php artisan schedule:run >> /var/log/cron.log 2>&1" > /etc/cron.d/laravel-scheduler
chmod 0644 /etc/cron.d/laravel-scheduler

echo "Reloading cron..."
service cron reload

echo "All services started successfully!"
echo "Starting Apache in foreground..."
# Ejecutar Apache en foreground (IMPORTANTE: debe ser el último comando)
exec apache2-foreground