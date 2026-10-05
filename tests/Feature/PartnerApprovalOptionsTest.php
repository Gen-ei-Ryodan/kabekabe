<?php

namespace Tests\Feature;

use App\Models\Partner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PartnerApprovalOptionsTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    private function pendingPartner(array $attributes = []): Partner
    {
        $vendor = User::factory()->vendor()->create([
            'approval_status' => User::APPROVAL_PENDING,
        ]);

        return Partner::factory()->create(array_merge([
            'user_id' => $vendor->id,
            'status' => Partner::STATUS_INACTIVE,
            'is_active' => false,
        ], $attributes));
    }

    public function test_partner_can_be_approved_as_non_member_without_member_link(): void
    {
        $admin = $this->admin();
        $partner = $this->pendingPartner();

        $this->actingAs($admin)
            ->put(route('admin.partners.approve', $partner->id), ['member_option' => 'non_member'])
            ->assertSessionHas('success');

        $partner->refresh();

        $this->assertTrue($partner->is_active);
        $this->assertSame(Partner::STATUS_ACTIVE, $partner->status);
        $this->assertNull($partner->member_user_id);
        $this->assertFalse((bool) $partner->is_member);
        $this->assertSame(User::APPROVAL_APPROVED, $partner->user->fresh()->approval_status);
        $this->assertStringContainsString('Non Member', (string) session('success'));
    }

    public function test_non_member_option_clears_previous_member_link(): void
    {
        $admin = $this->admin();
        $member = User::factory()->member()->create();
        $partner = $this->pendingPartner([
            'member_user_id' => $member->id,
            'is_member' => true,
            'member_id_number' => $member->member_code,
        ]);

        $this->actingAs($admin)
            ->put(route('admin.partners.approve', $partner->id), ['member_option' => 'non_member'])
            ->assertSessionHas('success');

        $partner->refresh();

        $this->assertNull($partner->member_user_id);
        $this->assertFalse((bool) $partner->is_member);
        $this->assertNull($partner->member_id_number);
        $this->assertTrue($partner->is_active);
    }

    public function test_partner_can_still_be_linked_to_a_member_on_approve(): void
    {
        $admin = $this->admin();
        $member = User::factory()->member()->create();
        $partner = $this->pendingPartner();

        $this->actingAs($admin)
            ->put(route('admin.partners.approve', $partner->id), [
                'member_option' => 'member',
                'member_user_id' => $member->id,
            ])
            ->assertSessionHas('success');

        $partner->refresh();

        $this->assertSame($member->id, $partner->member_user_id);
        $this->assertTrue((bool) $partner->is_member);
        $this->assertSame($member->member_code, $partner->member_id_number);
        $this->assertSame($member->name, $partner->member_name);
    }

    public function test_approve_without_payload_keeps_backward_compatible_behaviour(): void
    {
        $admin = $this->admin();
        $partner = $this->pendingPartner();

        $this->actingAs($admin)
            ->put(route('admin.partners.approve', $partner->id))
            ->assertSessionHas('success');

        $partner->refresh();

        $this->assertTrue($partner->is_active);
        $this->assertNull($partner->member_user_id);
        $this->assertSame(User::APPROVAL_APPROVED, $partner->user->fresh()->approval_status);
    }

    public function test_partner_already_linked_cannot_be_relinked_to_another_member(): void
    {
        $admin = $this->admin();
        $memberA = User::factory()->member()->create();
        $memberB = User::factory()->member()->create();
        $partner = $this->pendingPartner([
            'member_user_id' => $memberA->id,
            'is_member' => true,
            'member_id_number' => $memberA->member_code,
        ]);

        $this->actingAs($admin)
            ->put(route('admin.partners.approve', $partner->id), [
                'member_option' => 'member',
                'member_user_id' => $memberB->id,
            ])
            ->assertSessionHasErrors('member_user_id');

        $this->assertSame('Partner sudah terhubung dengan Member lain.', session('errors')->first('member_user_id'));

        $partner->refresh();
        $this->assertSame($memberA->id, $partner->member_user_id);
        $this->assertSame(User::APPROVAL_PENDING, $partner->user->fresh()->approval_status);

        // Re-approve ke member yang sama tetap boleh.
        $this->actingAs($admin)
            ->put(route('admin.partners.approve', $partner->id), [
                'member_option' => 'member',
                'member_user_id' => $memberA->id,
            ])
            ->assertSessionHas('success');

        $this->assertSame($memberA->id, $partner->fresh()->member_user_id);
    }
}
