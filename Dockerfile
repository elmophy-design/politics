# Use the official PHP-Apache image as a base
FROM php:8.2-apache

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
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

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

EXPOSE 80
CMD ["apache2-foreground"]
