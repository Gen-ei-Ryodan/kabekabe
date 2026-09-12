<?php

namespace Tests\Feature;

use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Models\User;
use App\Services\PaymentGateway\DokuService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class DokuPaymentTest extends TestCase
{
    use RefreshDatabase;

    private User $member;
    private MembershipPlan $plan;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.doku.admin_fee' => 4500]);

        $this->member = User::factory()->create([
            'role' => 'member',
        ]);

        $this->plan = MembershipPlan::factory()->create([
            'name' => '1 Bulan (30 Hari)',
            'duration_months' => 1,
            'price' => 100000,
            'is_active' => true,
        ]);
    }

    public function test_member_can_initiate_doku_checkout_with_pass_through_admin_fee(): void
    {
        Http::fake([
            'https://api-sandbox.doku.com/checkout/v1/payment' => Http::response([
                'message' => ['SUCCESS'],
                'response' => [
                    'order' => [
                        'amount' => '104500',
                        'invoice_number' => 'INV-TEST-123',
                    ],
                    'payment' => [
                        'url' => 'https://staging.doku.com/checkout-link-v2/token123',
                        'token_id' => 'token123',
                        'expired_datetime' => '2026-09-12T07:44:16Z',
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($this->member)->postJson(route('member.billing.doku.checkout'), [
            'plan_id' => $this->plan->id,
            'channel' => 'all',
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'type' => 'checkout',
            'plan_price' => 100000,
            'admin_fee' => 4500,
            'amount' => 104500,
            'payment_url' => 'https://staging.doku.com/checkout-link-v2/token123',
        ]);

        $this->assertDatabaseHas('payments', [
            'member_id' => $this->member->id,
            'plan_id' => $this->plan->id,
            'amount' => 104500,
            'status' => Payment::STATUS_PENDING,
        ]);
    }

    public function test_member_can_initiate_direct_va_with_admin_fee(): void
    {
        Http::fake([
            'https://api-sandbox.doku.com/bca-virtual-account/v2/payment-code' => Http::response([
                'order' => [
                    'invoice_number' => 'INV-TEST-BCA',
                ],
                'virtual_account_info' => [
                    'virtual_account_number' => '1900800000342457',
                    'how_to_pay_page' => 'https://sandbox.doku.com/how-to-pay/123',
                ],
            ], 200),
        ]);

        $response = $this->actingAs($this->member)->postJson(route('member.billing.doku.checkout'), [
            'plan_id' => $this->plan->id,
            'channel' => 'bca',
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'type' => 'va',
            'bank' => 'BCA',
            'amount' => 104500,
            'va_number' => '1900800000342457',
        ]);
    }

    public function test_member_can_check_payment_status(): void
    {
        $payment = Payment::factory()->create([
            'member_id' => $this->member->id,
            'plan_id' => $this->plan->id,
            'status' => Payment::STATUS_PENDING,
        ]);

        $response = $this->actingAs($this->member)->getJson(route('member.billing.doku.status', $payment));

        $response->assertOk();
        $response->assertJson([
            'payment_id' => $payment->id,
            'status' => Payment::STATUS_PENDING,
            'is_paid' => false,
        ]);
    }

    public function test_webhook_rejects_invalid_signature(): void
    {
        $response = $this->postJson(route('doku.notification'), [
            'order' => ['invoice_number' => 'INV-XYZ'],
            'transaction' => ['status' => 'SUCCESS'],
        ], [
            'Client-Id' => 'INVALID_CLIENT',
            'Request-Id' => 'req-123',
            'Request-Timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
            'Signature' => 'HMACSHA256=invalid',
        ]);

        $response->assertStatus(401);
    }

    public function test_webhook_successfully_approves_payment_and_activates_membership(): void
    {
        $payment = Payment::factory()->create([
            'member_id' => $this->member->id,
            'plan_id' => $this->plan->id,
            'period_months' => 1,
            'amount' => 104500,
            'status' => Payment::STATUS_PENDING,
        ]);

        $this->mock(DokuService::class, function ($mock) {
            $mock->shouldReceive('verifyNotificationSignature')->andReturn(true);
        });

        $response = $this->postJson(route('doku.notification'), [
            'service' => ['id' => 'VIRTUAL_ACCOUNT'],
            'acquirer' => ['id' => 'BCA'],
            'channel' => ['id' => 'VIRTUAL_ACCOUNT_BCA'],
            'transaction' => ['status' => 'SUCCESS'],
            'order' => [
                'invoice_number' => $payment->invoice_number,
                'amount' => 104500,
            ],
        ]);

        $response->assertOk();
        $response->assertJson(['message' => 'SUCCESS']);

        $payment->refresh();
        $this->assertEquals(Payment::STATUS_APPROVED, $payment->status);
        $this->assertNotNull($payment->paid_at);

        $membership = Membership::where('member_id', $this->member->id)->first();
        $this->assertNotNull($membership);
        $this->assertEquals(Membership::STATUS_ACTIVE, $membership->status);
        $this->assertNotNull($membership->expires_at);
    }

    public function test_webhook_is_idempotent_and_prevents_duplicate_approval(): void
    {
        $payment = Payment::factory()->create([
            'member_id' => $this->member->id,
            'plan_id' => $this->plan->id,
            'period_months' => 1,
            'amount' => 104500,
            'status' => Payment::STATUS_APPROVED, // Already approved
            'paid_at' => now(),
        ]);

        $this->mock(DokuService::class, function ($mock) {
            $mock->shouldReceive('verifyNotificationSignature')->andReturn(true);
        });

        $response = $this->postJson(route('doku.notification'), [
            'service' => ['id' => 'VIRTUAL_ACCOUNT'],
            'transaction' => ['status' => 'SUCCESS'],
            'order' => [
                'invoice_number' => $payment->invoice_number,
                'amount' => 104500,
            ],
        ]);

        $response->assertOk();
        $response->assertJson(['message' => 'Payment already approved']);
    }

    public function test_webhook_rejects_tampered_amount(): void
    {
        $payment = Payment::factory()->create([
            'member_id' => $this->member->id,
            'plan_id' => $this->plan->id,
            'period_months' => 1,
            'amount' => 104500,
            'status' => Payment::STATUS_PENDING,
        ]);

        $this->mock(DokuService::class, function ($mock) {
            $mock->shouldReceive('verifyNotificationSignature')->andReturn(true);
        });

        // Webhook sends wrong amount (e.g. 50000 instead of 104500)
        $response = $this->postJson(route('doku.notification'), [
            'service' => ['id' => 'VIRTUAL_ACCOUNT'],
            'transaction' => ['status' => 'SUCCESS'],
            'order' => [
                'invoice_number' => $payment->invoice_number,
                'amount' => 50000,
            ],
        ]);

        $response->assertStatus(400);
        $response->assertJson(['message' => 'Amount mismatch']);

        $payment->refresh();
        $this->assertEquals(Payment::STATUS_PENDING, $payment->status);
    }

    public function test_active_membership_extension_preserves_remaining_days_without_reset(): void
    {
        // Member has active membership expiring in 15 days
        $initialExpiry = Carbon::now()->addDays(15);
        $membership = Membership::factory()->create([
            'member_id' => $this->member->id,
            'status' => Membership::STATUS_ACTIVE,
            'started_at' => Carbon::now()->subDays(15),
            'expires_at' => $initialExpiry,
        ]);

        $payment = Payment::factory()->create([
            'member_id' => $this->member->id,
            'plan_id' => $this->plan->id, // 1 month = 30 days
            'period_months' => 1,
            'amount' => 104500,
            'status' => Payment::STATUS_PENDING,
        ]);

        $this->mock(DokuService::class, function ($mock) {
            $mock->shouldReceive('verifyNotificationSignature')->andReturn(true);
        });

        $this->postJson(route('doku.notification'), [
            'transaction' => ['status' => 'SUCCESS'],
            'order' => [
                'invoice_number' => $payment->invoice_number,
                'amount' => 104500,
            ],
        ])->assertOk();

        $membership->refresh();

        // Expected expiry: initialExpiry + 30 days + 1 day
        // Remaining 15 days were preserved!
        $this->assertTrue($membership->expires_at->isAfter($initialExpiry->copy()->addDays(29)));
        $this->assertEquals(Membership::STATUS_ACTIVE, $membership->status);
    }
}
