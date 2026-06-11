# Laravel 12 (PHP 8.2) on Apache — ready for Railway / any container host.
FROM php:8.2-apache

# --- System libraries + PHP extensions Laravel needs ---
RUN apt-get update && apt-get install -y --no-install-recommends \
        git curl zip unzip \
        libzip-dev libonig-dev \
    && docker-php-ext-install pdo_mysql mbstring bcmath zip exif pcntl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# --- Composer ---
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# --- Apache: serve Laravel's /public folder + enable URL rewriting ---
RUN a2enmod rewrite
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

WORKDIR /var/www/html

# Install PHP dependencies first (better layer caching)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --no-interaction --prefer-dist

# Copy the application and finish the autoloader
COPY . .
RUN composer dump-autoload --optimize --no-dev

# Permissions for Laravel's writable dirs
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Start: prepare DB + serve
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8080
CMD ["entrypoint.sh"]
