<?php

namespace Tests\Feature;

use App\Models\Partner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminApprovalTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    public function test_admin_dashboard_shows_pending_approvals_count(): void
    {
        $admin = $this->admin();

        // 2 pending members, 1 approved member
        User::factory()->member()->create(['approval_status' => User::APPROVAL_PENDING]);
        User::factory()->member()->create(['approval_status' => User::APPROVAL_PENDING]);
        User::factory()->member()->create(['approval_status' => User::APPROVAL_APPROVED]);

        // 1 pending partner
        $partnerUser = User::factory()->vendor()->create(['approval_status' => User::APPROVAL_PENDING]);
        Partner::factory()->create([
            'user_id' => $partnerUser->id,
            'status' => 'inactive',
            'is_active' => false,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->where('stats.pending_member_approvals', 2)
                ->where('stats.pending_partner_approvals', 1)
            );
    }

    public function test_admin_can_filter_and_approve_pending_member(): void
    {
        $admin = $this->admin();
        $pendingMember = User::factory()->member()->create([
            'name' => 'Calon Member',
            'approval_status' => User::APPROVAL_PENDING,
        ]);

        // Verify filter
        $this->actingAs($admin)->get(route('admin.members.index', ['status' => 'pending']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Members/Index')
                ->where('pending_count', 1)
            );

        // Approve member
        $response = $this->actingAs($admin)->put(route('admin.members.approve', $pendingMember->id));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'id' => $pendingMember->id,
            'approval_status' => User::APPROVAL_APPROVED,
        ]);
    }

    public function test_admin_can_reject_pending_member(): void
    {
        $admin = $this->admin();
        $pendingMember = User::factory()->member()->create([
            'approval_status' => User::APPROVAL_PENDING,
        ]);

        $response = $this->actingAs($admin)->put(route('admin.members.reject', $pendingMember->id));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'id' => $pendingMember->id,
            'approval_status' => User::APPROVAL_REJECTED,
        ]);
    }

    public function test_admin_can_filter_and_approve_pending_partner(): void
    {
        $admin = $this->admin();
        $vendorUser = User::factory()->vendor()->create([
            'approval_status' => User::APPROVAL_PENDING,
        ]);
        $partner = Partner::factory()->create([
            'user_id' => $vendorUser->id,
            'status' => 'inactive',
            'is_active' => false,
        ]);

        // Verify filter
        $this->actingAs($admin)->get(route('admin.partners.index', ['status' => 'pending']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Partners/Index')
                ->where('pending_count', 1)
            );

        // Approve partner
        $response = $this->actingAs($admin)->put(route('admin.partners.approve', $partner->id));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('partners', [
            'id' => $partner->id,
            'is_active' => true,
            'status' => Partner::STATUS_ACTIVE,
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $vendorUser->id,
            'approval_status' => User::APPROVAL_APPROVED,
        ]);
    }

    public function test_admin_can_reject_pending_partner(): void
    {
        $admin = $this->admin();
        $vendorUser = User::factory()->vendor()->create([
            'approval_status' => User::APPROVAL_PENDING,
        ]);
        $partner = Partner::factory()->create([
            'user_id' => $vendorUser->id,
            'status' => 'inactive',
            'is_active' => false,
        ]);

        $response = $this->actingAs($admin)->put(route('admin.partners.reject', $partner->id));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('partners', [
            'id' => $partner->id,
            'is_active' => false,
            'status' => Partner::STATUS_INACTIVE,
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $vendorUser->id,
            'approval_status' => User::APPROVAL_REJECTED,
        ]);
    }
}
