#!/bin/bash
set -e  # Exit on error

echo "🚀 Starting Render build..."

# Navigate to backend
cd backend

# Install PHP dependencies
echo "📦 Installing PHP dependencies..."
composer install --no-interaction --optimize-autoloader --no-dev

# Install and build frontend assets (if any in backend)
if [ -f "package.json" ]; then
    echo "📦 Installing NPM dependencies..."
    npm install
    echo "🔨 Building assets..."
    npm run build
fi

# Laravel setup
echo "⚙️ Setting up Laravel..."
php artisan key:generate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
echo "🗄️ Running database migrations..."
php artisan migrate --force

echo "✅ Build completed successfully!"
