<?php

namespace Tests\Feature;

use App\Models\Partner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PartnerRegistrationOtpTest extends TestCase
{
    use RefreshDatabase;

    private function pathAPayload(array $overrides = []): array
    {
        return array_merge([
            'company_name' => 'PT Kopi Baru',
            'company_address' => 'Jl. Kopi No. 1',
            'company_phone' => '081111111111',
            'pic_name' => 'PIC Kopi',
            'pic_phone' => '082222222222',
            'is_member' => false,
            'name' => 'Partner Satu',
            'email' => 'pic-kopi@example.com',
            'password' => 'Rahasia123!',
            'password_confirmation' => 'Rahasia123!',
            'phone' => '083333333333',
            'industry' => ['F&B - Coffee Shop'],
        ], $overrides);
    }

    public function test_partner_register_form_redirects_to_otp_and_stays_pending(): void
    {
        $this->post('/partner/register', $this->pathAPayload())
            ->assertRedirect(route('partner.otp.show'));

        $user = User::query()->where('email', 'pic-kopi@example.com')->firstOrFail();

        $this->assertNull($user->email_verified_at);
        $this->assertNotNull($user->otp_code);
        $this->assertSame('partner_register', $user->otp_purpose);
        $this->assertSame(User::APPROVAL_PENDING, $user->approval_status);

        $partner = Partner::query()->where('email', 'pic-kopi@example.com')->firstOrFail();
        $this->assertSame(Partner::STATUS_INACTIVE, $partner->status);
        $this->assertFalse((bool) $partner->is_active);

        $this->get(route('partner.otp.show'))->assertOk();
    }

    public function test_partner_cannot_login_before_otp_verified(): void
    {
        $this->post('/partner/register', $this->pathAPayload())
            ->assertRedirect(route('partner.otp.show'));

        $this->from('/partner')->post('/partner', [
            'email' => 'pic-kopi@example.com',
            'password' => 'Rahasia123!',
        ])->assertRedirect('/partner');

        $this->assertStringContainsString('belum diverifikasi', $this->errorMessage('email'));
    }

    public function test_verified_partner_still_waits_for_admin_approval(): void
    {
        $this->post('/partner/register', $this->pathAPayload())
            ->assertRedirect(route('partner.otp.show'));

        $user = User::query()->where('email', 'pic-kopi@example.com')->firstOrFail();

        $this->post(route('partner.otp.verify'), ['otp' => $user->otp_code])
            ->assertRedirect(route('partner.register.thankyou'));

        $user->refresh();
        $this->assertNotNull($user->email_verified_at);
        $this->assertNull($user->otp_code);
        $this->assertSame(User::APPROVAL_PENDING, $user->approval_status);

        // OTP sukses tapi approval admin belum ada → tetap tidak bisa login.
        $this->from('/partner')->post('/partner', [
            'email' => 'pic-kopi@example.com',
            'password' => 'Rahasia123!',
        ])->assertRedirect('/partner');

        $this->assertStringContainsString('menunggu persetujuan', $this->errorMessage('email'));
    }

    public function test_member_and_partner_can_share_the_same_email(): void
    {
        User::factory()->member()->create([
            'email' => 'satu@example.com',
            'password' => Hash::make('MemberPass123!'),
        ]);

        $this->post('/partner/register', $this->pathAPayload([
            'email' => 'satu@example.com',
        ]))->assertRedirect(route('partner.otp.show'));

        $this->assertSame(2, User::query()->where('email', 'satu@example.com')->count());

        // Login member tetap menemukan akun member (kredensial di-scoping role).
        $this->post('/login', [
            'email' => 'satu@example.com',
            'password' => 'MemberPass123!',
        ])->assertRedirect(route('member.home'));
    }

    public function test_duplicate_partner_email_is_rejected(): void
    {
        $this->post('/partner/register', $this->pathAPayload())->assertRedirect(route('partner.otp.show'));

        $this->post('/partner/register', $this->pathAPayload([
            'name' => 'Partner Dua',
            'company_name' => 'PT Kopi Dua',
        ]))->assertSessionHasErrors('email');
    }

    private function errorMessage(string $key): string
    {
        $errors = session('errors');

        if (is_array($errors)) {
            return $errors['default']['messages'][$key][0] ?? json_encode($errors);
        }

        return $errors->first($key);
    }
}
