<?php

namespace Tests\Feature;

use App\Models\MembershipDiscountCode;
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

        config(['services.doku.admin_fee' => 0]);

        $this->member = User::factory()->create(['role' => User::ROLE_MEMBER]);
        $this->admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $this->plan = MembershipPlan::factory()->create([
            'name' => '1 Bulan (30 Hari)',
            'duration_months' => 1,
            'price' => 100000,
            'is_active' => true,
        ]);
    }

    private function discountCode(int $percent = 100): MembershipDiscountCode
    {
        return MembershipDiscountCode::create([
            'code' => 'PROMO'.$percent,
            'name' => 'Promo '.$percent.'%',
            'discount_type' => MembershipDiscountCode::TYPE_PERCENT,
            'discount_value' => $percent,
            'is_active' => true,
        ]);
    }

    public function test_manual_free_promo_checkout_records_zero_amount_payment(): void
    {
        $code = $this->discountCode(100);

        $this->actingAs($this->member)
            ->postJson(route('member.billing.manual.checkout'), [
                'plan_id' => $this->plan->id,
                'promo_code' => $code->code,
            ])
            ->assertOk()
            ->assertJsonPath('is_free', true)
            ->assertJsonPath('amount', 0);

        $payment = Payment::latest('id')->first();

        $this->assertNotNull($payment);
        $this->assertSame($this->member->id, $payment->member_id);
        $this->assertSame(0, (int) $payment->amount);
        $this->assertSame(Payment::STATUS_APPROVED, $payment->status);
        $this->assertStringContainsString($code->code, (string) $payment->notes);
        $this->assertStringContainsString('Harga Paket: Rp100.000', (string) $payment->notes);
        $this->assertStringContainsString('Total Dibayar: Rp0', (string) $payment->notes);

        $this->assertTrue($this->member->fresh()->hasActiveMembership());
        $this->assertSame(1, $code->fresh()->used_count);
    }

    public function test_doku_free_promo_checkout_records_zero_amount_payment(): void
    {
        $code = $this->discountCode(100);

        $this->actingAs($this->member)
            ->postJson(route('member.billing.doku.checkout'), [
                'plan_id' => $this->plan->id,
                'promo_code' => $code->code,
            ])
            ->assertOk()
            ->assertJsonPath('type', 'free_promo')
            ->assertJsonPath('amount', 0);

        $payment = Payment::latest('id')->first();

        $this->assertNotNull($payment);
        $this->assertSame(0, (int) $payment->amount);
        $this->assertSame(Payment::STATUS_APPROVED, $payment->status);
        $this->assertStringContainsString($code->code, (string) $payment->notes);

        $this->assertTrue($this->member->fresh()->hasActiveMembership());
        $this->assertSame(1, $code->fresh()->used_count);
    }

    public function test_zero_price_plan_without_promo_still_records_payment(): void
    {
        $freePlan = MembershipPlan::factory()->create([
            'name' => 'Gratis',
            'duration_months' => 6,
            'price' => 0,
            'is_active' => true,
        ]);

        $this->actingAs($this->member)
            ->postJson(route('member.billing.manual.checkout'), ['plan_id' => $freePlan->id])
            ->assertOk()
            ->assertJsonPath('is_free', true)
            ->assertJsonPath('amount', 0);

        $payment = Payment::latest('id')->first();

        $this->assertNotNull($payment);
        $this->assertSame(0, (int) $payment->amount);
        $this->assertSame(Payment::STATUS_APPROVED, $payment->status);
        $this->assertStringContainsString('Total Dibayar: Rp0', (string) $payment->notes);
        $this->assertStringContainsString('Aktivasi Membership Gratis (Rp0)', (string) $payment->notes);
    }

    public function test_partial_promo_discount_note_survives_admin_approval(): void
    {
        $code = $this->discountCode(50);

        $this->actingAs($this->member)
            ->postJson(route('member.billing.manual.checkout'), [
                'plan_id' => $this->plan->id,
                'promo_code' => $code->code,
            ])
            ->assertOk()
            ->assertJsonPath('is_free', false)
            ->assertJsonPath('amount', 50000);

        $payment = Payment::latest('id')->first();
        $this->assertNotNull($payment);
        $this->assertSame(Payment::STATUS_PENDING, $payment->status);
        $this->assertStringContainsString($code->code, (string) $payment->notes);

        $this->actingAs($this->admin)
            ->put(route('admin.payments.approve', $payment->id), ['notes' => 'Bukti transfer valid'])
            ->assertRedirect();

        $payment->refresh();
        $this->assertSame(Payment::STATUS_APPROVED, $payment->status);
        // Keterangan promo tidak boleh hilang saat approve.
        $this->assertStringContainsString($code->code, (string) $payment->notes);
        $this->assertStringContainsString('Bukti transfer valid', (string) $payment->notes);
    }
}
