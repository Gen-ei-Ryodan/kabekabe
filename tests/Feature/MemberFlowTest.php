<?php

namespace Tests\Feature;

use App\Models\CommunityInfo;
use App\Models\HomeBanner;
use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Models\Promo;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberFlowTest extends TestCase
{
    use RefreshDatabase;

    private function activeMember(): User
    {
        $member = User::factory()->member()->create();

        $member->membership()->create([
            'status' => 'active',
            'started_at' => now()->subMonth(),
            'expires_at' => now()->addMonths(11),
        ]);

        return $member->fresh();
    }

    public function test_member_home_shows_active_status(): void
    {
        $member = $this->activeMember();

        $this->actingAs($member)->get(route('member.home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Member/Home')
                ->where('member.membership_status', 'active')
            );
    }

    public function test_approved_active_promo_is_visible_to_members(): void
    {
        $member = $this->activeMember();

        Promo::factory()->create([
            'status' => Promo::STATUS_APPROVED,
            'is_active' => true,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDays(15),
        ]);

        $this->actingAs($member)->get(route('member.partners.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Member/Partners/Index')
                ->has('promos.data', 1)
            );
    }

    public function test_pending_promo_is_hidden_from_members(): void
    {
        $member = $this->activeMember();

        Promo::factory()->pending()->create();

        $this->actingAs($member)->get(route('member.partners.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Member/Partners/Index')
                ->has('promos.data', 0)
            );
    }

    public function test_promo_show_returns_404_for_pending_promo(): void
    {
        $member = $this->activeMember();

        $promo = Promo::factory()->pending()->create();

        $this->actingAs($member)->get(route('member.promos.show', $promo))->assertNotFound();
    }

    public function test_promo_show_for_active_promo_exposes_member_active_flag(): void
    {
        $member = $this->activeMember();

        $promo = Promo::factory()->create([
            'status' => Promo::STATUS_APPROVED,
            'is_active' => true,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDays(15),
        ]);

        $this->actingAs($member)->get(route('member.promos.show', $promo))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Member/Promos/Show')
                ->where('member_active', true)
            );
    }

    public function test_member_home_returns_curated_promo_and_agenda_banners(): void
    {
        $member = $this->activeMember();

        $promo = Promo::factory()->create([
            'status' => Promo::STATUS_APPROVED,
            'is_active' => true,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDays(15),
        ]);

        $agenda = CommunityInfo::factory()->create([
            'type' => CommunityInfo::TYPE_AGENDA,
            'is_published' => true,
            'published_at' => now()->subDay(),
            'event_date' => now()->addDays(7),
        ]);

        HomeBanner::create(['type' => 'promo', 'promo_id' => $promo->id, 'sort_order' => 1, 'is_active' => true]);
        HomeBanner::create(['type' => 'agenda', 'agenda_id' => $agenda->id, 'sort_order' => 2, 'is_active' => true]);

        $this->actingAs($member)->get(route('member.home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Member/Home')
                ->has('banners', 2)
                ->where('banners.0.type', 'promo')
                ->where('banners.0.promo.id', $promo->id)
                ->where('banners.0.promo.partner.name', $promo->partner->name)
                ->where('banners.0.agenda', null)
                ->where('banners.1.type', 'agenda')
                ->where('banners.1.agenda.id', $agenda->id)
                ->where('banners.1.agenda.event_date', $agenda->event_date->toISOString())
                ->where('banners.1.promo', null)
            );
    }

    public function test_banner_with_unavailable_target_is_filtered_out(): void
    {
        $member = $this->activeMember();

        $promo = Promo::factory()->create([
            'status' => Promo::STATUS_APPROVED,
            'is_active' => true,
        ]);
        $visibleBanner = HomeBanner::create(['type' => 'promo', 'promo_id' => $promo->id, 'sort_order' => 1, 'is_active' => true]);

        // Deactivated promo (no longer visible to members).
        $deactivated = Promo::factory()->create(['status' => Promo::STATUS_APPROVED, 'is_active' => false]);
        HomeBanner::create(['type' => 'promo', 'promo_id' => $deactivated->id, 'sort_order' => 2, 'is_active' => true]);

        // Unpublished community info.
        $draft = CommunityInfo::factory()->draft()->create();
        HomeBanner::create(['type' => 'agenda', 'agenda_id' => $draft->id, 'sort_order' => 3, 'is_active' => true]);

        // Dangling target (deleted promo, nullOnDelete keeps the banner row).
        HomeBanner::create(['type' => 'promo', 'promo_id' => null, 'sort_order' => 4, 'is_active' => true]);

        $this->actingAs($member)->get(route('member.home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Member/Home')
                ->has('banners', 1)
                ->where('banners.0.id', $visibleBanner->id)
            );
    }

    public function test_member_home_returns_at_most_three_banners(): void
    {
        $member = $this->activeMember();

        $promos = Promo::factory()->count(5)->create([
            'status' => Promo::STATUS_APPROVED,
            'is_active' => true,
        ]);

        foreach ($promos as $i => $promo) {
            HomeBanner::create(['type' => 'promo', 'promo_id' => $promo->id, 'sort_order' => $i + 1, 'is_active' => true]);
        }

        $this->actingAs($member)->get(route('member.home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Member/Home')
                ->has('banners', 3)
            );
    }

    public function test_admin_can_record_offline_payment_for_member(): void
    {
        $admin = User::factory()->admin()->create();
        $member = User::factory()->member()->create();
        $plan = MembershipPlan::factory()->create(['duration_months' => 3, 'is_active' => true]);

        $this->actingAs($admin)->post(route('admin.payments.store'), [
            'member_id' => $member->id,
            'plan_id' => $plan->id,
            'notes' => 'Paid offline in cash.',
        ])->assertRedirect(route('admin.payments.index'));

        $payment = Payment::query()->where('member_id', $member->id)->first();

        $this->assertNotNull($payment);
        $this->assertSame(Payment::STATUS_APPROVED, $payment->status);
        $this->assertSame($plan->id, $payment->plan_id);

        $member->load('membership');

        $this->assertTrue($member->hasActiveMembership());
        $this->assertGreaterThanOrEqual(now()->addMonths(3)->subMinute(), $member->membership->expires_at);
    }

    public function test_admin_approval_extends_membership(): void
    {
        $admin = User::factory()->admin()->create();
        $member = User::factory()->member()->create();
        $plan = MembershipPlan::factory()->create(['duration_months' => 3, 'is_active' => true]);

        $payment = $member->payments()->create([
            'invoice_number' => 'INV-TEST-001',
            'plan_id' => $plan->id,
            'period_months' => 3,
            'amount' => $plan->price,
            'status' => Payment::STATUS_PENDING,
            'paid_at' => now(),
        ]);

        $this->actingAs($admin)->put(route('admin.payments.approve', $payment))
            ->assertRedirect(route('admin.payments.index', ['status' => 'approved']));

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => Payment::STATUS_APPROVED,
        ]);

        $member->load('membership');

        $this->assertTrue($member->hasActiveMembership());
        $this->assertGreaterThanOrEqual(now()->addMonths(3)->subMinute(), $member->membership->expires_at);
    }

    public function test_history_lists_member_transactions_and_total_benefit(): void
    {
        $member = $this->activeMember();

        Transaction::factory()->create([
            'member_id' => $member->id,
            'total_amount' => 500000,
            'discount_amount' => 50000,
            'net_amount' => 450000,
        ]);

        $this->actingAs($member)->get(route('member.history.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Member/History/Index')
                ->has('transactions.data', 1)
                ->where('total_benefit', 50000)
            );
    }

    public function test_member_sees_only_own_transactions_in_history(): void
    {
        $member = $this->activeMember();
        $other = $this->activeMember();

        Transaction::factory()->create(['member_id' => $member->id]);
        Transaction::factory()->create(['member_id' => $other->id]);

        $this->actingAs($member)->get(route('member.history.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('transactions.data', 1));
    }
}