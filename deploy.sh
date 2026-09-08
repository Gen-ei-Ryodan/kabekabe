#!/bin/bash
set -e
cd /home/alurelab/repositories/kabekabe
git stash -q 2>/dev/null || true
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
npm ci
npm run build
if [ ! -e public/storage ]; then
    php artisan storage:link
fi
php artisan config:cache && php artisan route:cache && php artisan view:cache
DOC=/home/alurelab/membership.solusisurabaya.com
rm -rf $DOC/build && cp -r public/build $DOC/build
mkdir -p $DOC/storage
cp -r storage/app/public/. $DOC/storage/ 2>/dev/null || true
# copy static assets (images, favicon, etc.) from public/ — but skip build/ & storage/
cp public/bglogin.png $DOC/bglogin.png 2>/dev/null || true
cp public/bgmobile.jpeg $DOC/bgmobile.jpeg 2>/dev/null || true
mkdir -p $DOC/images
cp public/images/logoafter.png $DOC/images/logoafter.png 2>/dev/null || true
cp public/favicon.ico $DOC/favicon.ico 2>/dev/null || true
cp public/robots.txt $DOC/robots.txt 2>/dev/null || true
echo DEPLOY OK $(date)
