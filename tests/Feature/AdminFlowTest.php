<?php

namespace Tests\Feature;

use App\Models\CommunityInfo;
use App\Models\HomeBanner;
use App\Models\HomePopup;
use App\Models\MembershipPlan;
use App\Models\Partner;
use App\Models\Payment;
use App\Models\Promo;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminFlowTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    public function test_admin_dashboard_shows_stats(): void
    {
        $admin = $this->admin();

        User::factory()->member()->count(3)->create();
        Partner::factory()->count(2)->create();

        $this->actingAs($admin)->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->where('stats.total_members', 3)
                ->where('stats.total_partners', 2)
            );
    }

    public function test_admin_can_create_member_with_membership(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->post(route('admin.members.store'), [
            'name' => 'Member Baru',
            'email' => 'baru@example.com',
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
            'valid_until' => now()->addMonths(6)->toDateString(),
            'whatsapp' => '081234567890',
        ])->assertRedirect();

        $member = User::where('email', 'baru@example.com')->first();

        $this->assertNotNull($member);
        $this->assertSame('member', $member->role);
        $this->assertNotNull($member->member_code);
        $this->assertTrue($member->hasActiveMembership());
    }

    public function test_admin_can_create_member_with_demographics(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->post(route('admin.members.store'), [
            'name' => 'Member Demografi',
            'email' => 'demografi@example.com',
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
            'valid_until' => now()->addMonths(6)->toDateString(),
            'gender' => 'female',
            'birth_date' => '1995-04-12',
            'religion' => 'katolik',
        ])->assertRedirect();

        $member = User::where('email', 'demografi@example.com')->firstOrFail();

        $this->assertSame('female', $member->gender);
        $this->assertSame('1995-04-12', $member->birth_date->toDateString());
        $this->assertSame('katolik', $member->religion);
    }

    public function test_admin_can_update_member_demographics(): void
    {
        $admin = $this->admin();
        $member = User::factory()->member()->create();

        $this->actingAs($admin)->put(route('admin.members.update', $member), [
            'name' => $member->name,
            'email' => $member->email,
            'gender' => 'male',
            'birth_date' => '1990-01-01',
            'religion' => 'islam',
        ])->assertRedirect();

        $member->refresh();

        $this->assertSame('male', $member->gender);
        $this->assertSame('1990-01-01', $member->birth_date->toDateString());
        $this->assertSame('islam', $member->religion);
    }

    public function test_admin_can_create_partner_with_vendor_account(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->post(route('admin.partners.store'), [
            'name' => 'Toko Maju',
            'category' => 'Retail',
            'description' => 'Toko kebutuhan sehari-hari.',
            'vendor_name' => 'Budi Santoso',
            'vendor_email' => 'vendor-maju@example.com',
            'vendor_password' => 'secret-password',
            'vendor_password_confirmation' => 'secret-password',
        ])->assertRedirect(route('admin.partners.index'));

        $vendor = User::where('email', 'vendor-maju@example.com')->first();

        $this->assertNotNull($vendor);
        $this->assertSame('vendor', $vendor->role);
        $this->assertNotNull($vendor->partner);
        $this->assertSame('Toko Maju', $vendor->partner->name);
    }

    public function test_admin_can_approve_pending_promo(): void
    {
        $admin = $this->admin();
        $promo = Promo::factory()->pending()->create();

        $this->actingAs($admin)->put(route('admin.promos.approve', $promo))
            ->assertRedirect();

        $this->assertDatabaseHas('promos', [
            'id' => $promo->id,
            'status' => Promo::STATUS_APPROVED,
        ]);
    }

    public function test_admin_can_reject_pending_promo_with_reason(): void
    {
        $admin = $this->admin();
        $promo = Promo::factory()->pending()->create();

        $this->actingAs($admin)->put(route('admin.promos.reject', $promo), [
            'reason' => 'Melebihi batas diskon.',
        ])->assertRedirect();

        $this->assertDatabaseHas('promos', [
            'id' => $promo->id,
            'status' => Promo::STATUS_REJECTED,
            'rejection_reason' => 'Melebihi batas diskon.',
        ]);
    }

    public function test_admin_approval_of_payment_activates_membership(): void
    {
        $admin = $this->admin();
        $member = User::factory()->member()->create();
        $plan = MembershipPlan::factory()->create(['duration_months' => 3, 'is_active' => true]);

        $payment = Payment::factory()->create([
            'member_id' => $member->id,
            'plan_id' => $plan->id,
            'period_months' => 3,
            'amount' => $plan->price,
        ]);

        $this->actingAs($admin)->put(route('admin.payments.approve', $payment))
            ->assertRedirect(route('admin.payments.index', ['status' => 'approved']));

        $member->load('membership');

        $this->assertTrue($member->hasActiveMembership());
        $this->assertDatabaseHas('payments', ['id' => $payment->id, 'status' => Payment::STATUS_APPROVED]);
    }

    public function test_payment_cannot_be_approved_twice(): void
    {
        $admin = $this->admin();
        $member = User::factory()->member()->create();
        $plan = MembershipPlan::factory()->create(['duration_months' => 3, 'is_active' => true]);

        $payment = Payment::factory()->approved()->create([
            'member_id' => $member->id,
            'plan_id' => $plan->id,
        ]);

        $this->actingAs($admin)->put(route('admin.payments.approve', $payment))->assertStatus(422);
    }

    public function test_admin_can_create_community_content(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->post(route('admin.community.store'), [
            'type' => CommunityInfo::TYPE_EVENT,
            'title' => 'Semnas Digital 2026',
            'content' => 'Event tahunan komunitas.',
            'event_date' => now()->addDays(7)->format('Y-m-d H:i'),
            'location' => 'Jakarta Convention Center',
            'is_published' => 1,
        ])->assertRedirect(route('admin.community.index'));

        $this->assertDatabaseHas('community_infos', [
            'title' => 'Semnas Digital 2026',
            'type' => 'event',
            'is_published' => true,
        ]);
    }

    public function test_published_event_appears_in_admin_community_list(): void
    {
        $admin = $this->admin();

        CommunityInfo::factory()->create([
            'type' => CommunityInfo::TYPE_EVENT,
            'title' => 'Meetup Komunitas',
            'is_published' => true,
            'published_at' => now(),
            'event_date' => now()->addDays(3),
            'created_by' => $admin->id,
        ]);

        $this->actingAs($admin)->get(route('admin.community.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Community/Index')
                ->has('infos.data', 1)
            );
    }

    public function test_admin_can_create_promo_banner(): void
    {
        $admin = $this->admin();
        $promo = Promo::factory()->create([
            'status' => Promo::STATUS_APPROVED,
            'is_active' => true,
        ]);

        $this->actingAs($admin)->post(route('admin.banners.store'), [
            'type' => 'promo',
            'promo_id' => $promo->id,
            'sort_order' => 1,
            'is_active' => 1,
        ])->assertRedirect(route('admin.banners.index'));

        $this->assertDatabaseHas('home_banners', [
            'type' => 'promo',
            'promo_id' => $promo->id,
            'agenda_id' => null,
            'sort_order' => 1,
            'is_active' => true,
        ]);
    }

    public function test_admin_can_configure_home_opening_popup(): void
    {
        $admin = $this->admin();
        $promo = Promo::factory()->create(['status' => Promo::STATUS_APPROVED, 'is_active' => true]);

        $this->actingAs($admin)->put(route('admin.banners.popup.update'), [
            'promo_id' => $promo->id,
            'is_active' => true,
        ])->assertRedirect(route('admin.banners.index'));

        $this->assertDatabaseHas('home_popups', [
            'promo_id' => $promo->id,
            'is_active' => true,
        ]);
    }

    public function test_admin_can_create_agenda_banner_from_published_info(): void
    {
        $admin = $this->admin();
        $info = CommunityInfo::factory()->published()->create([
            'type' => CommunityInfo::TYPE_AGENDA,
        ]);

        $this->actingAs($admin)->post(route('admin.banners.store'), [
            'type' => 'agenda',
            'agenda_id' => $info->id,
            'sort_order' => 2,
            'is_active' => 1,
        ])->assertRedirect(route('admin.banners.index'));

        $this->assertDatabaseHas('home_banners', [
            'type' => 'agenda',
            'agenda_id' => $info->id,
            'promo_id' => null,
            'sort_order' => 2,
            'is_active' => true,
        ]);
    }

    public function test_maximum_three_active_banners_is_enforced(): void
    {
        $admin = $this->admin();

        $promos = Promo::factory()->count(4)->create([
            'status' => Promo::STATUS_APPROVED,
            'is_active' => true,
        ]);

        foreach ($promos->take(3) as $i => $promo) {
            HomeBanner::create([
                'type' => 'promo',
                'promo_id' => $promo->id,
                'sort_order' => $i + 1,
                'is_active' => true,
            ]);
        }

        $response = $this->actingAs($admin)->post(route('admin.banners.store'), [
            'type' => 'promo',
            'promo_id' => $promos->last()->id,
            'sort_order' => 4,
            'is_active' => 1,
        ]);

        $response->assertSessionHasErrors('is_active');
        $this->assertDatabaseCount('home_banners', 3);
    }

    public function test_admin_can_toggle_banner_active_state(): void
    {
        $admin = $this->admin();
        $promo = Promo::factory()->create([
            'status' => Promo::STATUS_APPROVED,
            'is_active' => true,
        ]);
        $banner = HomeBanner::create([
            'type' => 'promo',
            'promo_id' => $promo->id,
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->actingAs($admin)->put(route('admin.banners.toggle', $banner), [
            'is_active' => 0,
        ])->assertRedirect();

        $this->assertDatabaseHas('home_banners', [
            'id' => $banner->id,
            'is_active' => false,
        ]);
    }

    public function test_admin_cannot_activate_a_fourth_banner_via_toggle(): void
    {
        $admin = $this->admin();

        $promos = Promo::factory()->count(4)->create([
            'status' => Promo::STATUS_APPROVED,
            'is_active' => true,
        ]);

        foreach ($promos->take(3) as $i => $promo) {
            HomeBanner::create([
                'type' => 'promo',
                'promo_id' => $promo->id,
                'sort_order' => $i + 1,
                'is_active' => true,
            ]);
        }

        $inactive = HomeBanner::create([
            'type' => 'promo',
            'promo_id' => $promos->last()->id,
            'sort_order' => 4,
            'is_active' => false,
        ]);

        $this->actingAs($admin)->put(route('admin.banners.toggle', $inactive), [
            'is_active' => 1,
        ])->assertSessionHasErrors('is_active');

        $this->assertDatabaseHas('home_banners', [
            'id' => $inactive->id,
            'is_active' => false,
        ]);
    }

    public function test_admin_can_broadcast_notification_to_members(): void
    {
        $admin = $this->admin();

        User::factory()->member()->count(3)->create();

        $this->actingAs($admin)->post(route('admin.notifications.store'), [
            'title' => 'Pengumuman Libur',
            'body' => 'Komunitas tutup sementara pada hari libur nasional.',
            'type' => 'community',
        ])->assertRedirect(route('admin.notifications.index'));

        $this->assertDatabaseCount('app_notifications', 3);
    }

    public function test_admin_can_send_notification_to_single_member(): void
    {
        $admin = $this->admin();
        $member = User::factory()->member()->create();

        $this->actingAs($admin)->post(route('admin.notifications.store'), [
            'recipient_id' => $member->id,
            'title' => 'Pesan Pribadi',
            'body' => 'Selamat datang!',
            'type' => 'system',
        ])->assertRedirect(route('admin.notifications.index'));

        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $member->id,
            'title' => 'Pesan Pribadi',
        ]);
    }

    public function test_admin_transaction_report_aggregates_by_period(): void
    {
        $admin = $this->admin();

        Transaction::factory()->count(2)->create([
            'transacted_at' => now()->subDay(),
            'total_amount' => 100000,
            'discount_amount' => 10000,
            'net_amount' => 90000,
        ]);

        Transaction::factory()->create([
            'transacted_at' => now()->subMonths(2),
        ]);

        $this->actingAs($admin)->get(route('admin.reports.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Reports/Index')
                ->where('summary.total_transactions', 2)
                ->where('summary.net_amount', 180000)
            );
    }

    public function test_member_show_page_loads(): void
    {
        $admin = $this->admin();
        $member = User::factory()->member()->create();

        $this->actingAs($admin)->get(route('admin.members.show', $member))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Members/Show')
                ->where('member.id', $member->id)
            );
    }

    public function test_admin_member_index_supports_member_and_date_filters(): void
    {
        $admin = $this->admin();
        $matching = User::factory()->member()->create([
            'name' => 'Filter Member',
            'member_code' => 'MMB-12345',
            'created_at' => now()->subDays(10),
        ]);
        $matching->membership()->create([
            'status' => 'active',
            'started_at' => now()->subDays(10),
            'expires_at' => now()->addDays(20),
        ]);
        User::factory()->member()->create(['name' => 'Other Member', 'member_code' => 'MMB-99999']);

        $this->actingAs($admin)->get(route('admin.members.index', [
            'name' => 'Filter',
            'member_id' => '12345',
            'valid_from' => now()->addDays(19)->toDateString(),
            'valid_to' => now()->addDays(21)->toDateString(),
            'joined_from' => now()->subDays(11)->toDateString(),
            'joined_to' => now()->subDays(9)->toDateString(),
        ]))->assertInertia(fn ($page) => $page
            ->component('Admin/Members/Index')
            ->has('members.data', 1)
            ->where('members.data.0.id', $matching->id)
        );
    }

    public function test_admin_partner_index_supports_category_filter(): void
    {
        $admin = $this->admin();
        $matching = Partner::factory()->create(['category' => 'Retail']);
        Partner::factory()->create(['category' => 'Salon']);

        $this->actingAs($admin)->get(route('admin.partners.index', ['category' => 'Retail']))
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Partners/Index')
                ->has('partners.data', 1)
                ->where('partners.data.0.id', $matching->id)
                ->where('filters.category', 'Retail')
            );
    }
}
