<?php

namespace Tests\Feature;

use App\Models\Partner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberPartnerLinkTest extends TestCase
{
    use RefreshDatabase;

    private function linkedPartner(array $overrides = []): Partner
    {
        $vendor = User::factory()->vendor()->create();

        return Partner::factory()->create(array_merge([
            'user_id' => $vendor->id,
            'email' => 'partner-link@example.com',
            'status' => Partner::STATUS_ACTIVE,
            'is_active' => true,
        ], $overrides));
    }

    private function memberPayload(array $overrides = []): array
    {
        return array_merge([
            'role' => 'member',
            'name' => 'Calon Member',
            'nickname' => 'Calon',
            'email' => 'calon-member@example.com',
            'phone' => '081234567890',
            'is_partner' => 'yes',
            'partner_email' => 'partner-link@example.com',
            'companies' => [
                ['company' => 'PT Contoh', 'industry' => 'Retail', 'position' => 'Direktur', 'address' => 'Jl. Contoh No. 1'],
            ],
        ], $overrides);
    }

    public function test_unknown_partner_email_is_rejected(): void
    {
        $this->postJson(route('register.partner-link.request'), ['partner_email' => 'tidak-ada@example.com'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('partner_email');
    }

    public function test_already_linked_partner_is_rejected(): void
    {
        $otherMember = User::factory()->member()->create();
        $partner = $this->linkedPartner([
            'member_user_id' => $otherMember->id,
            'is_member' => true,
        ]);

        $response = $this->postJson(route('register.partner-link.request'), [
            'partner_email' => $partner->email,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('partner_email');

        $this->assertStringContainsString(
            'Partner sudah terhubung dengan Member lain.',
            $response->json('errors.partner_email.0')
        );
    }

    public function test_member_registration_without_partner_otp_is_rejected(): void
    {
        $this->linkedPartner();

        $this->post('/register', $this->memberPayload())
            ->assertSessionHasErrors('partner_email');

        $this->assertDatabaseMissing('users', ['email' => 'calon-member@example.com']);
    }

    public function test_verified_partner_is_auto_linked_after_member_registration(): void
    {
        $partner = $this->linkedPartner();

        $this->postJson(route('register.partner-link.request'), ['partner_email' => $partner->email])
            ->assertOk()
            ->assertJsonPath('ok', true);

        $code = $partner->user->fresh()->otp_code;
        $this->assertNotNull($code);

        $this->postJson(route('register.partner-link.verify'), ['otp' => $code])
            ->assertOk()
            ->assertJsonPath('partner', $partner->name);

        $this->post('/register', $this->memberPayload())->assertOk();

        $member = User::query()->where('email', 'calon-member@example.com')->firstOrFail();

        $partner->refresh();
        $this->assertSame($member->id, $partner->member_user_id);
        $this->assertTrue((bool) $partner->is_member);
        $this->assertSame($member->member_code, $partner->member_id_number);
    }

    public function test_member_shares_master_identity_with_linked_partner(): void
    {
        $partner = $this->linkedPartner();

        $this->postJson(route('register.partner-link.request'), ['partner_email' => $partner->email])->assertOk();
        $code = $partner->user->fresh()->otp_code;
        $this->postJson(route('register.partner-link.verify'), ['otp' => $code])->assertOk();

        $this->post('/register', $this->memberPayload())->assertOk();

        $member = User::query()->where('email', 'calon-member@example.com')->firstOrFail();
        $partner->refresh();

        $this->assertNotNull($member->master_identity_id);
        // Member baru memakai Master Identity partner (bukan membuat identity kedua).
        $this->assertSame($partner->master_identity_id, $member->master_identity_id);
        $this->assertSame($partner->email, $member->masterIdentity?->email);
        $this->assertSame($partner->id, $partner->user->fresh()->partner->id);
        $this->assertSame($member->master_identity_id, $partner->user->fresh()->master_identity_id);
    }

    public function test_wrong_otp_does_not_link_partner(): void
    {
        $partner = $this->linkedPartner();

        $this->postJson(route('register.partner-link.request'), ['partner_email' => $partner->email])->assertOk();

        $this->postJson(route('register.partner-link.verify'), ['otp' => '999999'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('otp');

        $this->post('/register', $this->memberPayload())->assertSessionHasErrors('partner_email');
        $this->assertNull($partner->fresh()->member_user_id);
    }

    public function test_partner_linking_endpoint_requires_existing_partner(): void
    {
        // Partner dengan email sama tapi belum diverifikasi admin tetap boleh di-link
        // selama belum terhubung member lain; email yang tidak terdaftar tetap ditolak.
        $this->postJson(route('register.partner-link.request'), ['partner_email' => ''])
            ->assertStatus(422)
            ->assertJsonValidationErrors('partner_email');
    }
}
