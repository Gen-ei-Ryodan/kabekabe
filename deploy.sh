#!/bin/bash
set -e
cd /home/alurelab/repositories/kabekabe
git stash -q 2>/dev/null || true
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
npm ci
npm run build
php artisan config:cache && php artisan route:cache && php artisan view:cache
DOC=/home/alurelab/membership.solusisurabaya.com
rm -rf $DOC/build && cp -r public/build $DOC/build
mkdir -p $DOC/storage
rm -rf $DOC/storage && cp -r storage/app/public $DOC/storage
echo DEPLOY OK $(date)
