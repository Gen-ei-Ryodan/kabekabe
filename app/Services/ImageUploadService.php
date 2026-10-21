<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadService
{
    /**
     * Simpan upload gambar: resize sesuai batas (tanpa upscale) lalu konversi ke WebP.
     * File yang tidak bisa diproses GD (PDF, korup, dsb) fallback disimpan apa adanya.
     *
     * @return string Path relatif pada disk, contoh: 'banners/xxxx.webp'
     */
    public static function uploadAndResize(
        UploadedFile $file,
        string $directory,
        int $maxWidth = 1200,
        int $maxHeight = 1200,
        int $quality = 80,
        string $disk = 'public'
    ): string {
        $source = @file_get_contents($file->getRealPath());
        $image = $source === false ? false : @imagecreatefromstring($source);

        if ($image === false) {
            return $file->store($directory, $disk);
        }

        $width = imagesx($image);
        $height = imagesy($image);
        $scale = min(1, $maxWidth / $width, $maxHeight / $height);
        $newWidth = max(1, (int) round($width * $scale));
        $newHeight = max(1, (int) round($height * $scale));

        $resized = imagecreatetruecolor($newWidth, $newHeight);
        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        imagefilledrectangle($resized, 0, 0, $newWidth, $newHeight, imagecolorallocatealpha($resized, 0, 0, 0, 127));
        imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        ob_start();
        imagewebp($resized, null, $quality);
        $webp = ob_get_clean();

        imagedestroy($resized);
        imagedestroy($image);

        if (! is_string($webp) || $webp === '') {
            return $file->store($directory, $disk);
        }

        $path = trim($directory, '/').'/'.Str::random(40).'.webp';
        Storage::disk($disk)->put($path, $webp);

        return $path;
    }
}
