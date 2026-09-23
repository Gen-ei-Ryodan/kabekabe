<?php

namespace Tests\Feature;

use App\Mail\PromoApprovedMail;
use App\Models\Partner;
use App\Models\Promo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PromoPhotoTest extends TestCase
{
    use RefreshDatabase;

    private function vendorWithActivePartner(): array
    {
        $partner = Partner::factory()->create(['is_active' => true, 'expires_at' => now()->addMonth()]);

        return [$partner, $partner->user->fresh()];
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Diskon Spesial',
            'description' => 'Promo dengan foto.',
            'discount_type' => 'percent',
            'discount_value' => 10,
            'min_purchase' => 50000,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(14)->toDateString(),
            'terms' => 'Berlaku untuk member aktif.',
        ], $overrides);
    }

    public function test_vendor_can_create_promo_with_optional_photos(): void
    {
        Storage::fake('public');
        User::factory()->admin()->create();
        [, $vendor] = $this->vendorWithActivePartner();

        $this->actingAs($vendor)->post(route('vendor.promos.store'), $this->validPayload([
            'logo' => UploadedFile::fake()->image('logo.png', 100, 100),
            'promo_image' => UploadedFile::fake()->image('promo.jpg', 400, 300),
            'product_image' => UploadedFile::fake()->image('product.png', 400, 300),
        ]), ['uploads' => true])->assertRedirect(route('vendor.promos.index'));

        $promo = Promo::firstOrFail();

        $this->assertNotNull($promo->logo);
        $this->assertNotNull($promo->promo_image);
        $this->assertNotNull($promo->product_image);
        Storage::disk('public')->assertExists($promo->promo_image);
        $this->assertStringStartsWith('/storage/', $promo->promoImageUrl());
    }

    public function test_promo_photos_are_optional(): void
    {
        User::factory()->admin()->create();
        [, $vendor] = $this->vendorWithActivePartner();

        $this->actingAs($vendor)->post(route('vendor.promos.store'), $this->validPayload())
            ->assertRedirect(route('vendor.promos.index'));

        $promo = Promo::firstOrFail();

        $this->assertNull($promo->logo);
        $this->assertNull($promo->promo_image);
        $this->assertNull($promo->product_image);
        $this->assertNull($promo->promo_image_url);
    }

    public function test_promo_photo_must_be_image(): void
    {
        User::factory()->admin()->create();
        [, $vendor] = $this->vendorWithActivePartner();

        $this->actingAs($vendor)->post(route('vendor.promos.store'), $this->validPayload([
            'promo_image' => UploadedFile::fake()->create('dokumen.pdf', 100, 'application/pdf'),
        ]), ['uploads' => true])->assertSessionHasErrors('promo_image');

        $this->assertDatabaseCount('promos', 0);
    }

    public function test_member_sees_promo_photos_on_detail_page(): void
    {
        $promo = Promo::factory()->approved()->create([
            'promo_image' => 'promos/promo-detail.jpg',
            'product_image' => 'promos/product-detail.jpg',
            'logo' => 'promos/logo-detail.png',
        ]);

        $member = User::factory()->member()->create();
        $member->membership()->create([
            'status' => 'active',
            'started_at' => now()->subMonth(),
            'expires_at' => now()->addMonths(11),
        ]);

        $this->actingAs($member)->get(route('member.promos.show', $promo))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Member/Promos/Show')
                ->where('promo.promo_image_url', '/storage/promos/promo-detail.jpg')
                ->where('promo.product_image_url', '/storage/promos/product-detail.jpg')
                ->where('promo.logo_url', '/storage/promos/logo-detail.png')
            );
    }

    public function test_member_promo_list_includes_promo_photo(): void
    {
        Promo::factory()->approved()->create(['promo_image' => 'promos/list-thumb.jpg']);

        $member = User::factory()->member()->create();

        $this->actingAs($member)->get(route('member.partners.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Member/Partners/Index')
                ->where('promos.data.0.promo_image_url', '/storage/promos/list-thumb.jpg')
            );
    }

    public function test_admin_approving_promo_sends_email_to_members_with_photos(): void
    {
        Mail::fake();

        $admin = User::factory()->admin()->create();
        $member = User::factory()->member()->create(['email' => 'member@test.id']);
        $promo = Promo::factory()->pending()->create([
            'promo_image' => 'promos/email-promo.jpg',
            'logo' => 'promos/email-logo.png',
            'product_image' => 'promos/email-product.jpg',
        ]);

        $this->actingAs($admin)->put(route('admin.promos.approve', $promo))
            ->assertRedirect();

        Mail::assertSent(PromoApprovedMail::class, function (PromoApprovedMail $mail) use ($member, $promo) {
            return $mail->hasTo('member@test.id')
                && $mail->promo->is($promo)
                && $mail->member->is($member);
        });

        $this->assertDatabaseHas('promos', [
            'id' => $promo->id,
            'status' => Promo::STATUS_APPROVED,
        ]);
    }

    public function test_promo_approved_email_renders_with_photo_urls(): void
    {
        $member = User::factory()->member()->create(['name' => 'Budi', 'email' => 'budi@test.id']);
        $promo = Promo::factory()->approved()->create([
            'promo_image' => 'promos/render-promo.jpg',
            'logo' => 'promos/render-logo.png',
            'product_image' => 'promos/render-product.jpg',
            'terms' => 'Khusus member aktif.',
        ]);

        $mail = new PromoApprovedMail($member, $promo);

        $this->assertStringContainsString('Promo Baru:', $mail->envelope()->subject);
        $this->assertStringContainsString('mail.promo-approved', $mail->content()->view);

        $html = view('mail.promo-approved', ['member' => $member, 'promo' => $promo])->render();

        $this->assertStringContainsString('/storage/promos/render-promo.jpg', $html);
        $this->assertStringContainsString('/storage/promos/render-logo.png', $html);
        $this->assertStringContainsString('/storage/promos/render-product.jpg', $html);
        $this->assertStringContainsString('Budi', $html);
        $this->assertStringContainsString('Khusus member aktif.', $html);
    }
}
