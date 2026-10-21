<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CompressExistingImagesCommand extends Command
{
    protected $signature = 'images:compress-existing';
    protected $description = 'Compress and resize existing images in storage and static public assets';

    public function handle()
    {
        $this->info('Starting compression of existing images...');

        $baseDir = storage_path('app/public');
        $folders = [
            'avatars' => 400,
            'banners' => 1200,
            'community-images' => 1200,
            'home-popups' => 1200,
            'partner-logos' => 600,
            'partner-ads' => 800,
            'promos' => 1000,
            'transaction-proofs' => 1000,
        ];

        $totalSavings = 0;

        foreach ($folders as $folder => $maxDimension) {
            $dir = $baseDir . '/' . $folder;
            if (!is_dir($dir)) {
                continue;
            }

            $files = glob($dir . '/*');
            foreach ($files as $filePath) {
                if (is_file($filePath) && !is_link($filePath)) {
                    $saved = $this->compressImage($filePath, $maxDimension, $maxDimension);
                    $totalSavings += $saved;
                }
            }
        }

        // Static public assets
        $staticAssets = [
            public_path('bglogin.png') => [1600, 1600],
            public_path('bgmobile.jpeg') => [1200, 1200],
            public_path('images/logoafter.png') => [600, 600],
        ];

        foreach ($staticAssets as $filePath => [$maxW, $maxH]) {
            if (file_exists($filePath)) {
                $saved = $this->compressImage($filePath, $maxW, $maxH);
                $totalSavings += $saved;
            }
        }

        $mbSaved = round($totalSavings / (1024 * 1024), 2);
        $this->info("Done! Total space saved: {$mbSaved} MB");

        return Command::SUCCESS;
    }

    private function compressImage(string $filePath, int $maxWidth, int $maxHeight, int $quality = 80): int
    {
        $oldSize = filesize($filePath);
        $imgData = @file_get_contents($filePath);
        if (!$imgData) {
            return 0;
        }

        $source = @imagecreatefromstring($imgData);
        if (!$source) {
            return 0;
        }

        $origWidth = imagesx($source);
        $origHeight = imagesy($source);

        $scale = min(1.0, $maxWidth / max(1, $origWidth), $maxHeight / max(1, $origHeight));
        $newWidth = (int) round($origWidth * $scale);
        $newHeight = (int) round($origHeight * $scale);

        // Even if scale == 1.0, re-encode to optimize size
        $target = imagecreatetruecolor($newWidth, $newHeight);

        // Preserve alpha
        imagealphablending($target, false);
        imagesavealpha($target, true);
        $transparent = imagecolorallocatealpha($target, 0, 0, 0, 127);
        imagefilledrectangle($target, 0, 0, $newWidth, $newHeight, $transparent);

        imagecopyresampled($target, $source, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);

        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $tempPath = $filePath . '.tmp';

        if ($ext === 'png') {
            // PNG compression level 0-9
            imagealphablending($target, false);
            imagesavealpha($target, true);
            imagepng($target, $tempPath, 8);
        } elseif ($ext === 'webp') {
            imagewebp($target, $tempPath, $quality);
        } else {
            // default jpeg
            imagejpeg($target, $tempPath, $quality);
        }

        imagedestroy($source);
        imagedestroy($target);

        if (file_exists($tempPath)) {
            $newSize = filesize($tempPath);
            if ($newSize < $oldSize) {
                rename($tempPath, $filePath);
                $saved = $oldSize - $newSize;
                $this->line("Optimized: " . basename($filePath) . " (" . round($oldSize/1024) . "KB -> " . round($newSize/1024) . "KB, saved " . round($saved/1024) . "KB)");
                return $saved;
            } else {
                @unlink($tempPath);
            }
        }

        return 0;
    }
}
