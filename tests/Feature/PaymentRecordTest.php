<?php

namespace Tests\Feature;

use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentRecordTest extends TestCase
{
    use RefreshDatabase;

    private User $member;

    private User $admin;

    private MembershipPlan $plan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->member = User::factory()->create(['role' => User::ROLE_MEMBER]);
        $this->admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $this->plan = MembershipPlan::factory()->create([
            'name' => '1 Bulan (30 Hari)',
            'duration_months' => 1,
            'price' => 100000,
            'is_active' => true,
        ]);
    }

    public function test_admin_manual_payment_with_dates_updates_membership(): void
    {
        $this->actingAs($this->admin)->post(route('admin.members.payments.store', $this->member), [
            'paid_at' => '2026-10-01',
            'started_at' => '2026-10-01',
            'expires_at' => '2026-10-31',
            'amount' => 75000,
            'method' => 'Transfer Bank',
            'notes' => 'Bayar tunai di kantor.',
        ])->assertRedirect();

        $payment = Payment::query()->where('member_id', $this->member->id)->first();

        $this->assertNotNull($payment);
        $this->assertSame(Payment::STATUS_APPROVED, $payment->status);
        $this->assertSame(75000, (int) $payment->amount);
        $this->assertSame('Transfer Bank', $payment->method);
        $this->assertSame('2026-10-01', $payment->paid_at->toDateString());
        $this->assertStringContainsString('Bayar tunai di kantor.', (string) $payment->notes);
        $this->assertNull($payment->plan_id);
        $this->assertSame(30, (int) $payment->period_months);

        $this->member->load('membership');
        $this->assertSame('active', $this->member->membership->status);
        $this->assertSame('2026-10-01', $this->member->membership->started_at->toDateString());
        $this->assertSame('2026-10-31', $this->member->membership->expires_at->toDateString());
        $this->assertTrue($this->member->hasActiveMembership());
    }

    public function test_admin_manual_payment_rejects_expiry_before_start(): void
    {
        $this->actingAs($this->admin)->post(route('admin.members.payments.store', $this->member), [
            'paid_at' => '2026-10-01',
            'started_at' => '2026-10-31',
            'expires_at' => '2026-10-01',
            'amount' => 75000,
        ])->assertSessionHasErrors('expires_at');
    }

    public function test_admin_manual_payment_without_plan_is_history_only(): void
    {
        $this->actingAs($this->admin)->post(route('admin.members.payments.store', $this->member), [
            'paid_at' => '2026-09-20',
            'amount' => 250000,
            'method' => 'Cash',
            'notes' => 'Pembayaran offline tanpa paket.',
        ])->assertRedirect();

        $payment = Payment::query()->where('member_id', $this->member->id)->first();

        $this->assertNotNull($payment);
        $this->assertSame(Payment::STATUS_APPROVED, $payment->status);
        $this->assertNull($payment->plan_id);
        $this->assertSame(250000, (int) $payment->amount);
        $this->assertSame('Cash', $payment->method);
        $this->assertSame('2026-09-20', $payment->paid_at->toDateString());

        // Riwayat manual tanpa tanggal aktif tidak mengubah masa aktif membership.
        $this->member->load('membership');
        $this->assertFalse($this->member->hasActiveMembership());
    }

    public function test_admin_manual_payment_requires_amount_and_paid_date(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.members.payments.store', $this->member), [])
            ->assertSessionHasErrors(['paid_at', 'amount']);
    }

    public function test_admin_payment_store_requires_amount_and_date_range(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.payments.store'), ['member_id' => $this->member->id])
            ->assertSessionHasErrors(['amount', 'started_at', 'expires_at']);
    }

    public function test_admin_payment_store_accepts_optional_plan_id_and_sets_membership_dates(): void
    {
        $this->actingAs($this->admin)->post(route('admin.payments.store'), [
            'member_id' => $this->member->id,
            'plan_id' => $this->plan->id,
            'amount' => 100000,
            'started_at' => '2026-10-06',
            'expires_at' => '2026-11-05',
            'method' => 'Transfer Bank',
        ])->assertRedirect(route('admin.payments.index'));

        $payment = Payment::query()->where('member_id', $this->member->id)->first();

        $this->assertNotNull($payment);
        $this->assertSame($this->plan->id, $payment->plan_id);
        $this->assertSame(100000, (int) $payment->amount);

        $this->member->load('membership');

        $this->assertSame('active', $this->member->membership->status);
        $this->assertSame('2026-10-06', $this->member->membership->started_at->toDateString());
        $this->assertSame('2026-11-05', $this->member->membership->expires_at->toDateString());
        $this->assertTrue($this->member->hasActiveMembership());
    }

    public function test_admin_can_activate_member_manually_with_status_and_dates(): void
    {
        $this->actingAs($this->admin)
            ->put(route('admin.members.membership', $this->member), [
                'status' => 'active',
                'started_at' => '2026-10-01',
                'expires_at' => '2027-09-30',
            ])
            ->assertRedirect();

        $this->member->load('membership');

        $this->assertTrue($this->member->hasActiveMembership());
        $this->assertSame('active', $this->member->membership->status);
        $this->assertSame('2026-10-01', $this->member->membership->started_at->toDateString());
        $this->assertSame('2027-09-30', $this->member->membership->expires_at->toDateString());

        // Nonaktifkan lagi lewat endpoint yang sama.
        $this->actingAs($this->admin)
            ->put(route('admin.members.membership', $this->member), [
                'status' => 'inactive',
                'started_at' => '2026-10-01',
                'expires_at' => '2027-09-30',
            ])
            ->assertRedirect();

        $this->member->load('membership');
        $this->assertSame('inactive', $this->member->membership->status);
        $this->assertFalse($this->member->hasActiveMembership());
    }

    public function test_admin_membership_update_validates_dates(): void
    {
        $this->actingAs($this->admin)
            ->put(route('admin.members.membership', $this->member), [
                'status' => 'bogus',
                'started_at' => '2027-01-01',
                'expires_at' => '2026-01-01',
            ])
            ->assertSessionHasErrors(['status', 'expires_at']);
    }
}
