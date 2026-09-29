<?php

namespace Tests\Feature;

use App\Models\Partner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class SingleDeviceLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_session_survives_until_logged_out_or_kicked(): void
    {
        $member = User::factory()->member()->create();

        $this->post('/login', ['email' => $member->email, 'password' => 'password'])
            ->assertRedirect(route('member.home', absolute: false));

        $this->assertAuthenticatedAs($member, 'web');

        // Sesi tetap hidup tanpa bolak-balik login.
        $this->get(route('member.home'))->assertOk();
        $this->get(route('member.history.index'))->assertOk();
        $this->assertAuthenticatedAs($member, 'web');

        $this->post(route('logout'));
        $this->assertGuest('web');
    }

    public function test_older_device_is_kicked_when_account_logs_in_elsewhere(): void
    {
        $member = User::factory()->member()->create();

        $this->post('/login', ['email' => $member->email, 'password' => 'password']);
        $this->assertAuthenticatedAs($member, 'web');

        $sessionToken = $this->app['session.store']->get('login_token.web');
        $this->assertNotNull($sessionToken);

        // Simulasikan login dari device lain (token di DB berganti).
        $member->refresh()->forceFill(['login_token' => Str::random(40)])->save();
        $this->resetAuthGuards();

        $response = $this->get(route('member.home'));
        $response->assertRedirect(route('login'));
        $response->assertSessionHas('status');

        $this->assertGuest('web');
    }

    public function test_kicked_admin_is_sent_to_admin_portal_login(): void
    {
        $admin = User::factory()->admin()->create();

        $this->post('/admin', ['email' => $admin->email, 'password' => 'password']);
        $this->assertAuthenticatedAs($admin, 'web');

        $admin->refresh()->forceFill(['login_token' => Str::random(40)])->save();
        $this->resetAuthGuards();

        $this->get(route('admin.dashboard'))->assertRedirect(route('admin.login'));
        $this->assertGuest('web');
    }

    public function test_kicked_partner_does_not_touch_member_session_in_same_browser(): void
    {
        $member = User::factory()->member()->create();
        $partner = Partner::factory()->create();

        $this->post('/login', ['email' => $member->email, 'password' => 'password']);
        $this->post('/partner', ['email' => $partner->user->email, 'password' => 'password']);

        $this->assertAuthenticatedAs($member, 'web');
        $this->assertAuthenticatedAs($partner->user, 'partner');

        // Device partner login ulang di tempat lain.
        $partner->user->forceFill(['login_token' => Str::random(40)])->save();
        $this->resetAuthGuards();

        $this->get(route('vendor.dashboard'))->assertRedirect(route('partner.login'));
        $this->resetAuthGuards();

        $this->assertGuest('partner');

        // Sesi member di browser yang sama tidak ikut terbunuh.
        $this->assertAuthenticatedAs($member, 'web');
        $this->get(route('member.home'))->assertOk();
    }

    public function test_legacy_session_without_token_is_not_kicked(): void
    {
        $member = User::factory()->member()->create();
        $member->forceFill(['login_token' => Str::random(40)])->save();

        // Sesi yang dibuat sebelum fitur single-device tidak memiliki token di session.
        $this->actingAs($member)->get(route('member.home'))->assertOk();
        $this->assertAuthenticatedAs($member, 'web');
    }

    /**
     * Lupakan guard yang di-cache + kembalikan default guard ke 'web'.
     * Tanpa ini, `Authenticate` pada request sebelumnya memanggil shouldUse('partner')
     * dan bocor ke request berikutnya (di produksi app di-boot ulang tiap request).
     */
    private function resetAuthGuards(): void
    {
        $this->app['auth']->forgetGuards();
        $this->app['auth']->shouldUse('web');
    }
}
