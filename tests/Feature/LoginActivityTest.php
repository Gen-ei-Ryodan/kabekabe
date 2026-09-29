<?php

namespace Tests\Feature;

use App\Models\Partner;
use App\Models\User;
use App\Models\UserLoginLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginActivityTest extends TestCase
{
    use RefreshDatabase;

    private const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    private const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

    public function test_member_login_is_recorded_with_ip_device_and_location(): void
    {
        $member = User::factory()->member()->create();

        $this->withHeaders(['User-Agent' => self::CHROME_UA])
            ->post('/login', ['email' => $member->email, 'password' => 'password'])
            ->assertRedirect(route('member.home', absolute: false));

        $log = UserLoginLog::latest('id')->first();

        $this->assertNotNull($log);
        $this->assertSame($member->id, $log->user_id);
        $this->assertSame('web', $log->guard);
        $this->assertSame('member', $log->portal);
        $this->assertSame('127.0.0.1', $log->ip_address);
        $this->assertSame('Chrome', $log->browser);
        $this->assertSame('macOS', $log->platform);
        $this->assertSame('Desktop', $log->device);
        $this->assertSame('Jaringan Lokal / Private', $log->location);
        $this->assertNotNull($log->created_at);
    }

    public function test_partner_and_admin_portals_are_recorded_with_own_portal(): void
    {
        $partner = Partner::factory()->create();
        $admin = User::factory()->admin()->create();

        $this->withHeaders(['User-Agent' => self::IPHONE_UA])
            ->post('/partner', ['email' => $partner->user->email, 'password' => 'password'])
            ->assertRedirect(route('vendor.dashboard', absolute: false));

        $this->withHeaders(['User-Agent' => self::CHROME_UA])
            ->post('/admin', ['email' => $admin->email, 'password' => 'password'])
            ->assertRedirect(route('admin.dashboard', absolute: false));

        $partnerLog = UserLoginLog::where('portal', 'partner')->latest('id')->first();
        $adminLog = UserLoginLog::where('portal', 'admin')->latest('id')->first();

        $this->assertNotNull($partnerLog);
        $this->assertSame('partner', $partnerLog->guard);
        $this->assertSame($partner->user_id, $partnerLog->user_id);
        $this->assertSame('Ponsel', $partnerLog->device);
        $this->assertSame('iOS', $partnerLog->platform);

        $this->assertNotNull($adminLog);
        $this->assertSame('web', $adminLog->guard);
        $this->assertSame('admin', $adminLog->portal);
        $this->assertSame($admin->id, $adminLog->user_id);
    }

    public function test_failed_login_is_not_recorded(): void
    {
        $member = User::factory()->member()->create();

        $this->post('/login', ['email' => $member->email, 'password' => 'wrong-password']);

        $this->assertGuest();
        $this->assertSame(0, UserLoginLog::count());
    }

    public function test_admin_can_view_and_filter_login_logs(): void
    {
        $admin = User::factory()->admin()->create();
        $member = User::factory()->member()->create();

        $this->withHeaders(['User-Agent' => self::CHROME_UA])
            ->post('/login', ['email' => $member->email, 'password' => 'password']);

        $this->withoutVite();
        $this->flushSession();

        $this->actingAs($admin)
            ->get(route('admin.login-logs.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/LoginLogs/Index')
                ->has('logs.data', 1)
                ->where('logs.data.0.user.id', $member->id)
                ->where('logs.data.0.portal', 'member')
            );

        $this->actingAs($admin)
            ->get(route('admin.login-logs.index', ['portal' => 'admin']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/LoginLogs/Index')->has('logs.data', 0));

        $this->actingAs($admin)
            ->get(route('admin.login-logs.index', ['search' => $member->email]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('logs.data', 1));
    }

    public function test_non_admin_cannot_access_login_logs(): void
    {
        $member = User::factory()->member()->create();

        $this->actingAs($member)
            ->get(route('admin.login-logs.index'))
            ->assertForbidden();
    }
}
