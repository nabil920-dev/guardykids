#!/usr/bin/env bash
set -e

# Railway (and most hosts) inject a PORT. Apache must listen on it.
PORT="${PORT:-8080}"
sed -ri "s/^Listen 80$/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s/:80>/:${PORT}>/" /etc/apache2/sites-available/000-default.conf

# Fresh caches built from the live environment variables.
php artisan config:clear
php artisan cache:clear || true

# Wait for the database, then migrate (retry a few times on first boot).
for i in 1 2 3 4 5 6 7 8 9 10; do
    if php artisan migrate --force; then
        break
    fi
    echo "Database not ready yet (attempt $i) — retrying in 5s..."
    sleep 5
done

# Seed demo data (admin + nurseries + demo accounts). Idempotent.
php artisan db:seed --force || true

# Public symlink so uploaded/seeded images are served at /storage/...
rm -rf public/storage
php artisan storage:link || true

# Optimize for production.
php artisan config:cache || true
php artisan route:cache || true

exec apache2-foreground
