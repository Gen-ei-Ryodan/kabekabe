<?php

namespace Tests\Feature;

use App\Models\MemberScan;
use App\Models\Partner;
use App\Models\Promo;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VendorFlowTest extends TestCase
{
    use RefreshDatabase;

    private function vendorWithPartner(): array
    {
        $partner = Partner::factory()->create();

        return [$partner, $partner->user->fresh()];
    }

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

    private function scanMember(User $member, User $vendor): MemberScan
    {
        return MemberScan::create([
            'member_id' => $member->id,
            'scanned_by_vendor_id' => $vendor->id,
            'scanned_at' => now(),
            'expires_at' => now()->addHours(48),
            'ip_address' => '127.0.0.1',
        ]);
    }

    public function test_vendor_dashboard_renders_stats(): void
    {
        [$partner, $vendor] = $this->vendorWithPartner();

        $this->actingAs($vendor)->get(route('vendor.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Vendor/Dashboard')
                ->where('partner.id', $partner->id)
                ->has('stats')
            );
    }

    public function test_vendor_dashboard_summary_counts_only_active_members_and_own_transactions(): void
    {
        [$partner, $vendor] = $this->vendorWithPartner();

        $this->activeMember();
        $this->activeMember();

        $inactive = User::factory()->member()->create();
        $inactive->membership()->create([
            'status' => 'inactive',
            'started_at' => now()->subYear(),
            'expires_at' => now()->subMonth(),
        ]);

        Transaction::factory()->create([
            'partner_id' => $partner->id,
            'total_amount' => 500_000,
            'discount_amount' => 50_000,
            'net_amount' => 450_000,
        ]);
        Transaction::factory()->create([
            'partner_id' => $partner->id,
            'total_amount' => 200_000,
            'discount_amount' => 0,
            'net_amount' => 200_000,
        ]);

        [$otherPartner] = $this->vendorWithPartner();
        Transaction::factory()->create(['partner_id' => $otherPartner->id]);

        $this->actingAs($vendor)->get(route('vendor.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('stats.active_members', 2)
                ->where('stats.total_transactions', 2)
                ->where('stats.total_sales', 700_000)
                ->where('stats.total_discount', 50_000)
                ->where('stats.net_sales', 650_000)
            );
    }

    public function test_vendor_without_partner_is_blocked(): void
    {
        $vendor = User::factory()->vendor()->create();

        $this->actingAs($vendor)->get(route('vendor.dashboard'))->assertForbidden();
    }

    public function test_verify_active_member_by_member_code(): void
    {
        [, $vendor] = $this->vendorWithPartner();
        $member = $this->activeMember();

        $this->actingAs($vendor)->get(route('vendor.verify.token', $member->member_code))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Vendor/Verify')
                ->where('result.found', true)
                ->where('result.active', true)
                ->where('result.member.member_code', $member->member_code)
            );
    }

    public function test_verify_active_member_by_card_token(): void
    {
        [, $vendor] = $this->vendorWithPartner();
        $member = $this->activeMember();

        $this->actingAs($vendor)->get(route('vendor.verify.token', $member->card_token))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('result.active', true));
    }

    public function test_verify_inactive_member_reports_inactive(): void
    {
        [, $vendor] = $this->vendorWithPartner();
        $member = User::factory()->member()->create();

        $member->membership()->create([
            'status' => 'inactive',
            'expires_at' => now()->subDay(),
        ]);

        $this->actingAs($vendor)->get(route('vendor.verify.token', $member->member_code))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('result.found', true)
                ->where('result.active', false)
            );
    }

    public function test_verify_unknown_token_reports_not_found(): void
    {
        [, $vendor] = $this->vendorWithPartner();

        $this->actingAs($vendor)->get(route('vendor.verify.token', 'DOES-NOT-EXIST'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('result.found', false));
    }

    public function test_vendor_can_submit_promo_for_review(): void
    {
        [$partner, $vendor] = $this->vendorWithPartner();

        User::factory()->admin()->create();

        $this->actingAs($vendor)->post(route('vendor.promos.store'), [
            'title' => 'Diskon 15%',
            'description' => 'Untuk semua produk.',
            'discount_type' => 'percent',
            'discount_value' => 15,
            'min_purchase' => 100000,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(30)->toDateString(),
            'terms' => 'Berlaku untuk member ACTIVE.',
        ])->assertRedirect(route('vendor.promos.index'));

        $this->assertDatabaseHas('promos', [
            'partner_id' => $partner->id,
            'title' => 'Diskon 15%',
            'status' => Promo::STATUS_PENDING,
        ]);
    }

    public function test_vendor_cannot_see_other_partners_promos(): void
    {
        [$partnerA, $vendorA] = $this->vendorWithPartner();
        [$partnerB] = $this->vendorWithPartner();

        Promo::factory()->create(['partner_id' => $partnerA->id]);
        Promo::factory()->create(['partner_id' => $partnerB->id]);

        $this->actingAs($vendorA)->get(route('vendor.promos.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('promos.data', 1));
    }

    public function test_transaction_record_for_inactive_member_fails(): void
    {
        [$partner, $vendor] = $this->vendorWithPartner();

        $inactive = User::factory()->member()->create();

        $this->actingAs($vendor)->post(route('vendor.transactions.store'), [
            'member_code' => $inactive->member_code,
            'total' => 250000,
        ])->assertSessionHasErrors('member_code');

        $this->assertDatabaseCount('transactions', 0);
    }

    public function test_transaction_record_for_active_member_succeeds(): void
    {
        [$partner, $vendor] = $this->vendorWithPartner();
        $member = $this->activeMember();
        $this->scanMember($member, $vendor);

        $promo = Promo::factory()->create([
            'partner_id' => $partner->id,
            'status' => Promo::STATUS_APPROVED,
            'is_active' => true,
            'discount_type' => 'percent',
            'discount_value' => 10,
            'min_purchase' => 0,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDays(15),
        ]);

        $this->actingAs($vendor)->post(route('vendor.transactions.store'), [
            'member_code' => $member->member_code,
            'promo_id' => $promo->id,
            'total' => 200000,
            'note' => 'Pembelian reguler',
        ])->assertRedirect(route('vendor.transactions.index'));

        $this->assertDatabaseHas('transactions', [
            'member_id' => $member->id,
            'partner_id' => $partner->id,
            'promo_id' => $promo->id,
            'total_amount' => 200000,
            'discount_amount' => 20000,
            'net_amount' => 180000,
        ]);
    }

    public function test_vendor_report_contains_brief_fields_and_own_transactions_only(): void
    {
        [$partner, $vendor] = $this->vendorWithPartner();
        $member = $this->activeMember();

        Transaction::factory()->create([
            'partner_id' => $partner->id,
            'member_id' => $member->id,
            'total_amount' => 500_000,
            'discount_percent' => 10,
            'discount_amount' => 50_000,
            'net_amount' => 450_000,
            'note' => 'Pembelian Agustus',
            'transacted_at' => now(),
        ]);

        [$otherPartner] = $this->vendorWithPartner();
        Transaction::factory()->create(['partner_id' => $otherPartner->id]);

        $this->actingAs($vendor)->get(route('vendor.reports.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('transactions', 1)
                ->where('transactions.0.transaction_number', fn ($value) => is_string($value))
                ->where('transactions.0.total_amount', 500_000)
                ->where('transactions.0.discount_percent', 10)
                ->where('transactions.0.discount_amount', 50_000)
                ->where('transactions.0.net_amount', 450_000)
                ->where('transactions.0.note', 'Pembelian Agustus')
                ->where('transactions.0.proof_url', null)
                ->where('transactions.0.member.member_code', $member->member_code)
            );
    }

    public function test_transaction_can_use_custom_receipt_number(): void
    {
        [$partner, $vendor] = $this->vendorWithPartner();
        $member = $this->activeMember();
        $this->scanMember($member, $vendor);

        $this->actingAs($vendor)->post(route('vendor.transactions.store'), [
            'transaction_number' => 'POS-88123',
            'member_code' => $member->member_code,
            'total' => 100000,
        ])->assertRedirect(route('vendor.transactions.index'));

        $this->assertDatabaseHas('transactions', [
            'partner_id' => $partner->id,
            'transaction_number' => 'POS-88123',
        ]);

        $other = $this->activeMember();

        $this->actingAs($vendor)->post(route('vendor.transactions.store'), [
            'transaction_number' => 'POS-88123',
            'member_code' => $other->member_code,
            'total' => 100000,
        ])->assertSessionHasErrors('transaction_number');
    }

    public function test_transaction_with_foreign_promo_fails(): void
    {
        [$partner, $vendor] = $this->vendorWithPartner();
        $member = $this->activeMember();

        $foreignPartner = Partner::factory()->create();
        $foreignPromo = Promo::factory()->create([
            'partner_id' => $foreignPartner->id,
            'status' => Promo::STATUS_APPROVED,
        ]);

        $this->actingAs($vendor)->post(route('vendor.transactions.store'), [
            'member_code' => $member->member_code,
            'promo_id' => $foreignPromo->id,
            'total' => 200000,
        ])->assertNotFound();

        $this->assertDatabaseCount('transactions', 0);
    }
}