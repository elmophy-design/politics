# Use the official PHP-Apache image as a base
FROM php:8.4-apache

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm \
    libpq-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd pdo_pgsql pgsql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set the working directory to where your Laravel app is
WORKDIR /var/www/html

# Copy the entire repository contents
COPY . .

# *** IMPORTANT: Navigate into your 'backend' folder ***
WORKDIR /var/www/html/backend

# Install PHP dependencies
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Install and build frontend assets (if any are needed in the backend)
RUN if [ -f "package.json" ]; then npm install && npm run build; fi

# Set permissions for Laravel
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Configure Apache to serve from the 'public' directory of your backend
RUN sed -i 's!/var/www/html!/var/www/html/backend/public!g' /etc/apache2/sites-available/000-default.conf

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Create startup script with migrations + seeding inline
RUN echo '#!/bin/bash\n\
set -e\n\
echo "🚀 Starting container..."\n\
cd /var/www/html/backend\n\
if [ -z "$APP_KEY" ]; then\n\
    echo "❌ APP_KEY is not set. Set it in Render environment variables (php artisan key:generate --show)."\n\
    exit 1\n\
fi\n\
if [ -n "$DB_HOST" ] && [ -n "$DB_DATABASE" ]; then\n\
    echo "⏳ Waiting for database to be ready..."\n\
    ATTEMPTS=0\n\
    MAX_ATTEMPTS=30\n\
    until php artisan db:show > /dev/null 2>&1 || [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; do\n\
        ATTEMPTS=$((ATTEMPTS + 1))\n\
        echo "⏳ Waiting for database... (attempt $ATTEMPTS/$MAX_ATTEMPTS)"\n\
        sleep 2\n\
    done\n\
    echo "🗄️ Running database migrations..."\n\
    php artisan migrate --force\n\
    echo "✅ Migrations completed successfully!"\n\
    echo "🌱 Seeding roles, permissions, and admin user..."\n\
    php artisan db:seed --force\n\
    echo "✅ Seeding completed successfully!"\n\
else\n\
    echo "⚠️ Database environment variables not set. Skipping migrations and seeding."\n\
fi\n\
if [ "$APP_ENV" = "production" ]; then\n\
    echo "⚙️ Caching configurations..."\n\
    php artisan config:cache\n\
    php artisan route:cache\n\
    php artisan view:cache\n\
fi\n\
echo "✅ Starting Apache..."\n\
exec apache2-foreground' > /usr/local/bin/startup.sh \
    && chmod +x /usr/local/bin/startup.sh

ENTRYPOINT ["/usr/local/bin/startup.sh"]
