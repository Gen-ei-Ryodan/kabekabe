<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_member_can_register_and_receives_pending_approval(): void
    {
        $response = $this->post('/register', [
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
            'company' => 'PT Maju Bersama',
            'hobbies' => ['Bulutangkis', 'Golf'],
            'business_fields' => ['Retail', 'F&B'],
        ]);

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
    }

    public function test_new_partner_can_register_and_creates_partner_record(): void
    {
        $response = $this->post('/register', [
            'role' => 'partner',
            'name' => 'Test Partner Kafe',
            'pic_name' => 'Budi Santoso',
            'pic_phone' => '081234567891',
            'email' => 'partner@example.com',
            'phone' => '081234567892',
            'address' => 'Jl. Partner No. 456',
            'district' => 'Kuta',
            'city' => 'Badung',
            'category' => 'F&B',
            'industry' => 'Makanan & Minuman',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'name' => 'Budi Santoso',
            'email' => 'partner@example.com',
            'role' => User::ROLE_VENDOR,
            'approval_status' => User::APPROVAL_PENDING,
            'must_change_password' => true,
        ]);

        $this->assertDatabaseHas('partners', [
            'name' => 'Test Partner Kafe',
            'pic_name' => 'Budi Santoso',
            'category' => 'F&B',
            'industry' => 'Makanan & Minuman',
            'status' => 'inactive',
            'is_active' => false,
        ]);
    }
}
