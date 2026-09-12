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
            'email' => 'testmember@example.com',
            'phone' => '081234567890',
            'address' => 'Jl. Test No. 123',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'name' => 'Test Member',
            'email' => 'testmember@example.com',
            'role' => User::ROLE_MEMBER,
            'approval_status' => User::APPROVAL_PENDING,
            'must_change_password' => true,
        ]);
    }

    public function test_new_partner_can_register_and_creates_partner_record(): void
    {
        $response = $this->post('/register', [
            'role' => 'partner',
            'name' => 'Test Partner Kafe',
            'email' => 'partner@example.com',
            'phone' => '081234567891',
            'address' => 'Jl. Partner No. 456',
            'partner_category' => 'F&B',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'name' => 'Test Partner Kafe',
            'email' => 'partner@example.com',
            'role' => User::ROLE_VENDOR,
            'approval_status' => User::APPROVAL_PENDING,
            'must_change_password' => true,
        ]);

        $this->assertDatabaseHas('partners', [
            'name' => 'Test Partner Kafe',
            'category' => 'F&B',
            'status' => 'inactive',
            'is_active' => false,
        ]);
    }
}
