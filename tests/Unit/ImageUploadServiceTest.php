<?php

namespace Tests\Unit;

use App\Services\ImageUploadService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageUploadServiceTest extends TestCase
{
    private function png(int $width, int $height): UploadedFile
    {
        $img = imagecreatetruecolor($width, $height);
        imagealphablending($img, false);
        imagesavealpha($img, true);
        imagefilledrectangle($img, 0, 0, $width, $height, imagecolorallocatealpha($img, 0, 0, 0, 127));
        imagefilledrectangle(
            $img,
            (int) ($width / 4),
            (int) ($height / 4),
            (int) ($width * 3 / 4),
            (int) ($height * 3 / 4),
            imagecolorallocate($img, 255, 0, 0)
        );

        ob_start();
        imagepng($img);
        $binary = ob_get_clean();
        imagedestroy($img);

        return UploadedFile::fake()->createWithContent('test.png', $binary);
    }

    public function test_large_image_is_capped_and_converted_to_webp(): void
    {
        Storage::fake('public');

        $path = ImageUploadService::uploadAndResize($this->png(2400, 600), 'banners', 1200, 1200);

        Storage::disk('public')->assertExists($path);
        $this->assertStringEndsWith('.webp', $path);
        [$width, $height, $type] = getimagesize(Storage::disk('public')->path($path));
        $this->assertSame(1200, $width);
        $this->assertSame(300, $height);
        $this->assertSame(IMAGETYPE_WEBP, $type);
    }

    public function test_small_image_keeps_original_size_and_transparency(): void
    {
        Storage::fake('public');

        $path = ImageUploadService::uploadAndResize($this->png(320, 240), 'banners', 1200, 1200);

        [$width, $height] = getimagesize(Storage::disk('public')->path($path));
        $this->assertSame(320, $width);
        $this->assertSame(240, $height);

        $webp = imagecreatefromwebp(Storage::disk('public')->path($path));
        $this->assertSame(127, imagecolorsforindex($webp, imagecolorat($webp, 0, 0))['alpha']);
        imagedestroy($webp);
    }

    public function test_non_image_file_falls_back_to_plain_store(): void
    {
        Storage::fake('public');

        $path = ImageUploadService::uploadAndResize(
            UploadedFile::fake()->create('dokumen.pdf', 10, 'application/pdf'),
            'proofs'
        );

        Storage::disk('public')->assertExists($path);
        $this->assertStringEndsWith('.pdf', $path);
    }
}
