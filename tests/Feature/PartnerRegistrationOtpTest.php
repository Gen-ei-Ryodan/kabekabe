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
            'pic_email' => 'pic@example.com',
            'pic_whatsapp' => '084444444444',
            'pic_phone' => '082222222222',
            'is_member' => false,
            'email' => 'pic-kopi@example.com',
            'password' => 'Rahasia123!',
            'password_confirmation' => 'Rahasia123!',
            'phone' => '083333333333',
            'industry' => ['F&B - Coffee Shop'],
            // 4 form Master Identity (registrasi partner tanpa akun member).
            'name' => 'Partner Satu',
            'address' => 'Jl. PIC No. 7',
            'district' => 'Kuta',
            'city' => 'Badung',
            'birth_date' => '1991-02-03',
            'companies' => [
                ['company' => 'PT Kopi Baru', 'industry' => 'F&B', 'position' => 'Direktur', 'address' => 'Jl. Kopi No. 1'],
            ],
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

    public function test_member_registration_only_needs_member_email_and_derives_biodata(): void
    {
        $member = User::factory()->member()->create([
            'email' => 'member-satu@example.com',
            'name' => 'Budi Member',
            'birth_date' => '1990-05-04',
            'phone' => '081111111111',
        ]);

        $this->verifyMemberLink('member-satu@example.com');

        $this->post('/partner/register', $this->pathAPayload([
            'is_member' => true,
            'member_email' => 'member-satu@example.com',
            'name' => '',
            'address' => '',
            'companies' => [],
        ]))->assertRedirect(route('partner.otp.show'));

        $partner = Partner::query()->where('email', 'pic-kopi@example.com')->firstOrFail();

        $this->assertTrue((bool) $partner->is_member);
        $this->assertSame($member->id, $partner->member_user_id);
        $this->assertSame($member->member_code, $partner->member_code);
        $this->assertSame('Budi Member', $partner->pic_name);
        $this->assertSame('1990-05-04', $partner->member_birth_date?->toDateString());
        $this->assertSame('member-satu@example.com', $partner->member_email);
        $this->assertSame($member->phone, $partner->pic_phone);
        $this->assertSame(User::query()->where('email', 'pic-kopi@example.com')->first()->name, 'Budi Member');
    }

    public function test_member_registration_rejects_unknown_member_email(): void
    {
        $this->post('/partner/register', $this->pathAPayload([
            'is_member' => true,
            'member_email' => 'tidak-ada@example.com',
        ]))->assertSessionHasErrors('member_email');

        $this->assertNull(User::query()->where('email', 'pic-kopi@example.com')->first());
    }

    public function test_member_registration_requires_member_otp_before_submit(): void
    {
        User::factory()->member()->create(['email' => 'wajib-otp@example.com']);

        $this->post('/partner/register', $this->pathAPayload([
            'is_member' => true,
            'member_email' => 'wajib-otp@example.com',
        ]))->assertSessionHasErrors('member_email');

        $this->assertNull(User::query()->where('email', 'pic-kopi@example.com')->first());
        $this->assertNull(Partner::query()->where('email', 'pic-kopi@example.com')->first());
    }

    public function test_non_member_registration_requires_master_identity_biodata(): void
    {
        // Tanpa akun member, 4 form Master Identity wajib diisi (nama + info usaha).
        $this->post('/partner/register', $this->pathAPayload([
            'name' => '',
        ]))->assertSessionHasErrors('name');

        $this->post('/partner/register', $this->pathAPayload([
            'companies' => [],
        ]))->assertSessionHasErrors('companies');

        $this->post('/partner/register', $this->pathAPayload([
            'phone' => '',
        ]))->assertSessionHasErrors('phone');

        $this->assertNull(User::query()->where('email', 'pic-kopi@example.com')->first());
    }

    public function test_non_member_master_identity_is_saved_to_master_identities(): void
    {
        $this->post('/partner/register', $this->pathAPayload())
            ->assertRedirect(route('partner.otp.show'));

        $user = User::query()->where('email', 'pic-kopi@example.com')->firstOrFail();
        $partner = Partner::query()->where('email', 'pic-kopi@example.com')->firstOrFail();

        $this->assertNotNull($user->master_identity_id);
        $this->assertSame($user->master_identity_id, $partner->master_identity_id);

        $identity = $user->masterIdentity;

        $this->assertSame('pic-kopi@example.com', $identity->email);
        $this->assertSame('Partner Satu', $identity->name);
        $this->assertSame('Jl. PIC No. 7', $identity->address);
        $this->assertSame('Kuta', $identity->district);
        $this->assertSame('Badung', $identity->city);
        $this->assertSame('1991-02-03', $identity->birth_date?->toDateString());
        $this->assertSame('Partner Satu', $user->name);
        $this->assertSame('Direktur', $user->businesses[0]['position']);
        $this->assertSame(['PT Kopi Baru'], $user->business_fields);
    }

    /**
     * Selesaikan alur OTP linking member (request + verify) untuk partner register.
     */
    private function verifyMemberLink(string $memberEmail): void
    {
        $this->postJson(route('partner.member-link.request'), ['member_email' => $memberEmail])
            ->assertOk()
            ->assertJsonPath('ok', true);

        $code = User::query()->where('email', $memberEmail)->firstOrFail()->fresh()->otp_code;
        $this->assertNotNull($code);

        $this->postJson(route('partner.member-link.verify'), ['otp' => $code])
            ->assertOk()
            ->assertJsonPath('ok', true);
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
