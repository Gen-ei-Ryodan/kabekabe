<?php

namespace Tests\Feature;

use App\Models\AppNotification;
use App\Models\CommunityInfo;
use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Models\Partner;
use App\Models\Payment;
use App\Models\Promo;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AllRoutesSmokeTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    private function member(): User
    {
        $member = User::factory()->member()->create();

        Membership::factory()->for($member, 'member')->create([
            'status' => 'active',
            'started_at' => now()->subMonth(),
            'expires_at' => now()->addMonths(11),
        ]);

        return $member->fresh();
    }

    private function vendor(): array
    {
        $partner = Partner::factory()->create();

        return [$partner->user, $partner];
    }

    private function seedData(): void
    {
        Promo::factory()->count(2)->create(['status' => Promo::STATUS_APPROVED]);
        Payment::factory()->count(2)->create();
        Transaction::factory()->count(2)->create();
        CommunityInfo::factory()->count(2)->create(['is_published' => true]);
        AppNotification::factory()->count(2)->create();
    }

    public function test_all_member_routes_respond_ok(): void
    {
        $member = $this->member();
        $this->seedData();

        $routes = [
            route('member.home'),
            route('member.promos.show', Promo::first()),
            route('member.partners.index'),
            route('member.partners.show', Partner::first()),
            route('member.history.index'),
            route('member.notifications.index'),
            route('member.billing.index'),
            route('member.account.edit'),
        ];

        foreach ($routes as $url) {
            $this->actingAs($member)->get($url)->assertOk();
        }
    }

    public function test_all_vendor_routes_respond_ok(): void
    {
        [$vendor, $partner] = $this->vendor();
        $promo = Promo::factory()->for($partner)->create(['status' => Promo::STATUS_REJECTED]);
        $this->seedData();

        $routes = [
            route('vendor.dashboard'),
            route('vendor.verify'),
            route('vendor.verify.token', 'some-random-token'),
            route('vendor.promos.index'),
            route('vendor.promos.create'),
            route('vendor.promos.edit', $promo),
            route('vendor.transactions.index'),
            route('vendor.transactions.create'),
            route('vendor.reports.index'),
        ];

        foreach ($routes as $url) {
            $this->actingAs($vendor)->get($url)->assertOk();
        }
    }

    public function test_all_admin_routes_respond_ok(): void
    {
        $admin = $this->admin();
        $this->seedData();
        $promo = Promo::factory()->create(['status' => Promo::STATUS_PENDING]);
        $member = User::factory()->member()->create();
        $member->membership()->create([
            'status' => 'active',
            'started_at' => now()->subMonth(),
            'expires_at' => now()->addMonths(11),
        ]);
        Payment::factory()->approved()->create(['member_id' => $member->id]);

        $routes = [
            route('admin.dashboard'),
            route('admin.members.index'),
            route('admin.members.create'),
            route('admin.members.show', $member),
            route('admin.members.edit', $member),
            route('admin.partners.index'),
            route('admin.partners.create'),
            route('admin.partners.edit', Partner::first()),
            route('admin.promos.index'),
            route('admin.promos.edit', $promo),
            route('admin.payments.index'),
            route('admin.payments.create'),
            route('admin.payments.show', Payment::first()),
            route('admin.banners.index'),
            route('admin.banners.create'),
            route('admin.community.index'),
            route('admin.community.create'),
            route('admin.community.edit', CommunityInfo::first()),
            route('admin.notifications.index'),
            route('admin.transactions.index'),
            route('admin.transactions.show', Transaction::first()),
            route('admin.reports.index'),
        ];

        foreach ($routes as $url) {
            $this->actingAs($admin)->get($url)->assertOk();
        }
    }
}