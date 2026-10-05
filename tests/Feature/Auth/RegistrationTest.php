<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    private function memberPayload(array $overrides = []): array
    {
        return array_merge([
            'role' => 'member',
            'name' => 'Test Member',
            'nickname' => 'Tester',
            'email' => 'testmember@example.com',
            'phone' => '081234567890',
            'gender' => 'Pria',
            'birth_date' => '1990-01-01',
            'birth_place' => 'Denpasar',
            'marital_status' => 'Menikah',
            'religion' => 'Katolik',
            'address' => 'Jl. Test No. 123',
            'district' => 'Kuta',
            'city' => 'Badung',
            'hobbies' => ['Bulutangkis', 'Golf'],
            'companies' => [
                ['company' => 'PT Maju Bersama', 'industry' => 'Retail', 'position' => 'Direktur', 'address' => 'Jl. Maju No. 1'],
            ],
        ], $overrides);
    }

    public function test_new_member_can_register_and_receives_pending_approval(): void
    {
        $response = $this->post('/register', $this->memberPayload());

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'name' => 'Test Member',
            'nickname' => 'Tester',
            'email' => 'testmember@example.com',
            'role' => User::ROLE_MEMBER,
            'approval_status' => User::APPROVAL_PENDING,
            'must_change_password' => true,
            'gender' => 'Pria',
            'city' => 'Badung',
        ]);

        $user = User::query()->where('email', 'testmember@example.com')->firstOrFail();

        // Data usaha tersimpan (baru & legacy).
        $this->assertFalse($user->is_household);
        $this->assertSame('PT Maju Bersama (Retail)', $user->company);
        $this->assertSame('Retail', $user->industry);
        $this->assertSame(['PT Maju Bersama'], $user->business_fields);
        $this->assertSame('Jl. Maju No. 1', $user->business_address);
        $this->assertSame('Direktur', $user->businesses[0]['position']);
        $this->assertSame('Jl. Maju No. 1', $user->businesses[0]['address']);
    }

    public function test_member_registration_requires_business_info_unless_household(): void
    {
        $response = $this->post('/register', $this->memberPayload([
            'email' => 'nobusiness@example.com',
            'companies' => [
                ['company' => '', 'industry' => '', 'position' => '', 'address' => ''],
            ],
        ]));

        $response->assertSessionHasErrors('companies');

        $this->assertDatabaseMissing('users', ['email' => 'nobusiness@example.com']);
    }

    public function test_member_registration_requires_jabatan_on_each_business(): void
    {
        $response = $this->post('/register', $this->memberPayload([
            'email' => 'nojbt@example.com',
            'companies' => [
                ['company' => 'PT Tanpa Jabatan', 'industry' => 'Retail', 'position' => '', 'address' => ''],
            ],
        ]));

        $response->assertSessionHasErrors('companies.0.position');

        $this->assertDatabaseMissing('users', ['email' => 'nojbt@example.com']);
    }

    public function test_household_member_can_register_without_business_info(): void
    {
        $response = $this->post('/register', $this->memberPayload([
            'name' => 'IRT Member',
            'email' => 'irt@example.com',
            'is_household' => true,
            'companies' => [],
        ]));

        $response->assertStatus(200);

        $user = User::query()->where('email', 'irt@example.com')->firstOrFail();

        $this->assertTrue($user->is_household);
        $this->assertNull($user->businesses);
        $this->assertNull($user->company);
        $this->assertNull($user->business_fields);
        $this->assertSame(User::APPROVAL_PENDING, $user->approval_status);
    }

    public function test_register_success_screen_does_not_reveal_password(): void
    {
        $response = $this->post('/register', $this->memberPayload([
            'email' => 'nopassword@example.com',
        ]));

        $response->assertOk();

        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Auth/RegisterSuccess')
            ->missing('generatedPassword'));
    }

    public function test_member_registration_creates_master_identity(): void
    {
        $this->post('/register', $this->memberPayload([
            'email' => 'identity@example.com',
        ]))->assertOk();

        $user = User::query()->where('email', 'identity@example.com')->firstOrFail();

        $this->assertNotNull($user->master_identity_id);

        $identity = $user->masterIdentity;

        $this->assertSame('identity@example.com', $identity->email);
        $this->assertSame('Test Member', $identity->name);
        $this->assertSame('Badung', $identity->city);
        $this->assertSame(['Bulutangkis', 'Golf'], $identity->hobbies);
    }

    public function test_new_partner_can_register_and_creates_partner_record(): void
    {
        $response = $this->post('/register', $this->partnerPayload());

        // Belum dianggap terverifikasi: diarahkan ke halaman OTP dulu.
        $response->assertRedirect(route('partner.otp.show'));

        $this->assertDatabaseHas('users', [
            'name' => 'Budi Santoso',
            'email' => 'partner@example.com',
            'role' => User::ROLE_VENDOR,
            'approval_status' => User::APPROVAL_PENDING,
            'must_change_password' => true,
        ]);

        $user = User::query()->where('email', 'partner@example.com')->firstOrFail();

        $this->assertNull($user->email_verified_at);
        $this->assertNotNull($user->otp_code);
        $this->assertSame('partner_register', $user->otp_purpose);

        $this->assertDatabaseHas('partners', [
            'name' => 'PT Kopi Nikmat',
            'trade_name' => 'Kopi Nikmat Senopati',
            'is_member' => true,
            'member_id_number' => 'KBKB-MEM-001',
            'pic_name' => 'Budi Santoso',
            'category' => 'F&B',
            'industry' => 'F&B - Resto/Depot',
            'status' => 'inactive',
            'is_active' => false,
        ]);
    }

    public function test_partner_registration_requires_valid_otp_before_approval(): void
    {
        $this->post('/register', $this->partnerPayload([
            'email' => 'otp-check@example.com',
        ]))->assertRedirect(route('partner.otp.show'));

        $user = User::query()->where('email', 'otp-check@example.com')->firstOrFail();
        $code = $user->otp_code;

        $this->get(route('partner.otp.show'))->assertOk();

        // Kode salah → tetap belum terverifikasi.
        $this->post(route('partner.otp.verify'), ['otp' => '000000'])
            ->assertSessionHasErrors('otp');

        $this->assertNull($user->fresh()->email_verified_at);

        // Kode benar → verifikasi sukses, status tetap menunggu approval admin.
        $this->post(route('partner.otp.verify'), ['otp' => $code])
            ->assertRedirect(route('partner.register.thankyou'));

        $user->refresh();
        $this->assertNotNull($user->email_verified_at);
        $this->assertNull($user->otp_code);
        $this->assertSame(User::APPROVAL_PENDING, $user->approval_status);
    }

    private function partnerPayload(array $overrides = []): array
    {
        return array_merge([
            'role' => 'partner',
            'name' => 'PT Kopi Nikmat',
            'trade_name' => 'Kopi Nikmat Senopati',
            'pic_name' => 'Budi Santoso',
            'pic_phone' => '081234567891',
            'email' => 'partner@example.com',
            'phone' => '081234567892',
            'address' => 'Jl. Partner No. 456',
            'district' => 'Kuta',
            'city' => 'Badung',
            'category' => 'F&B',
            'industry' => ['F&B - Resto/Depot'],
            'is_member' => true,
            'member_id_number' => 'KBKB-MEM-001',
            'member_name' => 'Budi Santoso',
            'member_birth_date' => '1990-01-01',
        ], $overrides);
    }

    public function test_partner_category_is_derived_from_selected_industries(): void
    {
        // Industri pertama yang bukan 'Lain-lain' yang menang.
        $this->post('/register', $this->partnerPayload([
            'email' => 'kategori1@example.com',
            'industry' => ['Salon', 'F&B - Coffee Shop'],
        ]))->assertRedirect(route('partner.otp.show'));

        $this->assertDatabaseHas('partners', [
            'email' => 'kategori1@example.com',
            'category' => 'Kecantikan',
        ]);

        // Industri yang tidak terdaftar => Lain-lain.
        $this->post('/register', $this->partnerPayload([
            'email' => 'kategori2@example.com',
            'trade_name' => 'Kopi Lain 2',
            'industry' => ['Konsultan'],
        ]))->assertRedirect(route('partner.otp.show'));

        $this->assertDatabaseHas('partners', [
            'email' => 'kategori2@example.com',
            'category' => 'Lain-lain',
        ]);
    }
}
