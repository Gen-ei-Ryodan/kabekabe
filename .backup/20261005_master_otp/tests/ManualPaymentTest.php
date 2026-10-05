<?php

namespace Tests\Feature;

use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ManualPaymentTest extends TestCase
{
    use RefreshDatabase;

    private User $member;
    private User $admin;
    private MembershipPlan $plan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->member = User::factory()->create([
            'role' => User::ROLE_MEMBER,
        ]);

        $this->admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
        ]);

        $this->plan = MembershipPlan::factory()->create([
            'name' => '1 Bulan (30 Hari)',
            'duration_months' => 1,
            'price' => 100000,
            'is_active' => true,
        ]);
    }

    public function test_member_can_checkout_manual_transfer_payment(): void
    {
        $response = $this->actingAs($this->member)->postJson(route('member.billing.manual.checkout'), [
            'plan_id' => $this->plan->id,
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'payment_id',
            'invoice_number',
            'amount',
        ]);

        $paymentId = $response->json('payment_id');

        $this->assertDatabaseHas('payments', [
            'id' => $paymentId,
            'member_id' => $this->member->id,
            'plan_id' => $this->plan->id,
            'amount' => 100000,
            'status' => Payment::STATUS_PENDING,
        ]);

        // Admin can see it in pending list
        $adminResponse = $this->actingAs($this->admin)->get(route('admin.payments.index', ['status' => 'pending']));
        $adminResponse->assertOk();
    }

    public function test_member_can_upload_payment_proof(): void
    {
        Storage::fake('public');

        $payment = Payment::create([
            'invoice_number' => 'INV-TEST-001',
            'member_id' => $this->member->id,
            'plan_id' => $this->plan->id,
            'period_months' => 1,
            'amount' => 100000,
            'status' => Payment::STATUS_PENDING,
        ]);

        $fakeImage = UploadedFile::fake()->image('bukti_transfer.jpg', 600, 800);

        $response = $this->actingAs($this->member)->postJson(route('member.billing.manual.proof', $payment->id), [
            'proof' => $fakeImage,
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
        ]);

        $payment->refresh();
        $this->assertNotNull($payment->proof_path);
        $this->assertNotNull($payment->paid_at);
        $this->assertNotNull($payment->payment_proof_url);
        Storage::disk('public')->assertExists($payment->proof_path);
    }

    public function test_member_can_cancel_uncompleted_pending_payment(): void
    {
        $payment = Payment::create([
            'invoice_number' => 'INV-TEST-002',
            'member_id' => $this->member->id,
            'plan_id' => $this->plan->id,
            'period_months' => 1,
            'amount' => 100000,
            'status' => Payment::STATUS_PENDING,
        ]);

        $response = $this->actingAs($this->member)->postJson(route('member.billing.manual.cancel', $payment->id));

        $response->assertOk();
        $payment->refresh();
        $this->assertSame(Payment::STATUS_EXPIRED, $payment->status);
    }
}
