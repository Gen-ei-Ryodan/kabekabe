<?php

namespace Tests\Feature\Auth;

use App\Models\Partner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('member.home', absolute: false));
    }

    public function test_partner_can_authenticate_using_the_partner_portal(): void
    {
        $partner = Partner::factory()->create();
        $user = $partner->user;

        $response = $this->post('/partner', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user, 'partner');
        $response->assertRedirect(route('vendor.dashboard', absolute: false));
    }

    public function test_member_credentials_are_rejected_on_partner_portal(): void
    {
        $member = User::factory()->member()->create();

        $this->post('/partner', [
            'email' => $member->email,
            'password' => 'password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest('partner');
    }

    public function test_vendor_credentials_are_rejected_on_member_portal(): void
    {
        $partner = Partner::factory()->create();

        $this->post('/login', [
            'email' => $partner->user->email,
            'password' => 'password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }

    public function test_partner_can_logout_without_killing_member_session(): void
    {
        $partner = Partner::factory()->create();
        $member = User::factory()->member()->create();

        $this->actingAs($member, 'web');
        $this->actingAs($partner->user, 'partner');

        $this->post('/partner/logout')->assertRedirect(route('partner.login'));

        $this->assertGuest('partner');
        $this->assertAuthenticatedAs($member, 'web');
    }
}
