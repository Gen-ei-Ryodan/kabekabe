<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/member/home')->assertRedirect(route('login'));
        $this->get('/admin/dashboard')->assertRedirect(route('login'));
        $this->get('/vendor/dashboard')->assertRedirect(route('login'));
    }

    public function test_root_redirects_member_to_member_home(): void
    {
        $member = User::factory()->member()->create();

        $this->actingAs($member)->get('/')->assertRedirect(route('member.home'));
    }

    public function test_root_redirects_admin_to_admin_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/')->assertRedirect(route('admin.dashboard'));
    }

    public function test_root_redirects_vendor_to_vendor_dashboard(): void
    {
        $vendor = User::factory()->vendor()->create();

        $this->actingAs($vendor)->get('/')->assertRedirect(route('vendor.dashboard'));
    }

    public function test_member_cannot_access_admin_pages(): void
    {
        $member = User::factory()->member()->create();

        $this->actingAs($member)->get(route('admin.dashboard'))->assertForbidden();
        $this->actingAs($member)->get(route('admin.members.index'))->assertForbidden();
    }

    public function test_member_cannot_access_vendor_pages(): void
    {
        $member = User::factory()->member()->create();

        $this->actingAs($member)->get(route('vendor.dashboard'))->assertForbidden();
    }

    public function test_admin_cannot_access_member_pages(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get(route('member.home'))->assertForbidden();
    }

    public function test_vendor_cannot_access_member_pages(): void
    {
        $vendor = User::factory()->vendor()->create();

        $this->actingAs($vendor)->get(route('member.home'))->assertForbidden();
    }

    public function test_vendor_cannot_access_admin_pages(): void
    {
        $vendor = User::factory()->vendor()->create();

        $this->actingAs($vendor)->get(route('admin.dashboard'))->assertForbidden();
    }

    public function test_member_home_renders_and_assigns_card_credentials(): void
    {
        $member = User::factory()->member()->create([
            'member_code' => null,
            'card_token' => null,
        ]);

        $response = $this->actingAs($member)->get(route('member.home'));

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Member/Home')
                ->has('member.member_code')
                ->where('member.membership_status', 'inactive')
            );

        $this->assertNotNull($member->fresh()->member_code);
        $this->assertNotNull($member->fresh()->card_token);
    }
}