<?php

namespace Tests\Feature;

use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Models\User;
use App\Services\PaymentGateway\DokuService;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

        $this->member = User::factory()->create([
            'role' => 'member',
        ]);

        $this->plan = MembershipPlan::factory()->create([
            'name' => '1 Bulan',
            'duration_months' => 1,
            'price' => 100000,
            'is_active' => true,
        ]);
    }

    public function test_member_can_initiate_doku_checkout(): void
    {
        Http::fake([
            'https://api-sandbox.doku.com/checkout/v1/payment' => Http::response([
                'message' => ['SUCCESS'],
                'response' => [
                    'order' => [
                        'amount' => '100000',
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
            'payment_url' => 'https://staging.doku.com/checkout-link-v2/token123',
        ]);

        $this->assertDatabaseHas('payments', [
            'member_id' => $this->member->id,
            'plan_id' => $this->plan->id,
            'amount' => 100000,
            'status' => Payment::STATUS_PENDING,
        ]);
    }

    public function test_member_can_initiate_direct_va(): void
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
            'amount' => 100000,
            'status' => Payment::STATUS_PENDING,
        ]);

        // Mock DokuService to accept signature
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
                'amount' => 100000,
            ],
        ]);

        $response->assertOk();
        $response->assertJson(['message' => 'SUCCESS']);

        $payment->refresh();
        $this->assertEquals(Payment::STATUS_APPROVED, $payment->status);
        $this->assertNotNull($payment->paid_at);

        // Check membership is active
        $membership = Membership::where('member_id', $this->member->id)->first();
        $this->assertNotNull($membership);
        $this->assertEquals(Membership::STATUS_ACTIVE, $membership->status);
        $this->assertNotNull($membership->expires_at);
    }
}
