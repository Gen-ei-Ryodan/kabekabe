<?php

namespace Tests\Feature;

use App\Models\MasterIdentity;
use App\Models\MembershipPlan;
use App\Models\Partner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPartnerEmailTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        MembershipPlan::factory()->create(['is_active' => true]);
    }

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Toko Maju',
            'category' => 'Retail',
            'vendor_name' => 'Budi Santoso',
            'vendor_email' => 'budi@example.com',
            'vendor_password' => 'VendorPass1',
            'vendor_password_confirmation' => 'VendorPass1',
            'pic_name' => 'Budi Santoso',
            'pic_email' => 'pic@example.com',
            'pic_whatsapp' => '081111111111',
            'pic_phone' => '021-1111111',
        ], $overrides);
    }

    public function test_admin_can_create_partner_with_email_matching_an_existing_member(): void
    {
        $identity = MasterIdentity::forEmail('budi@example.com', ['name' => 'Budi Santoso']);
        $member = User::factory()->member()->create(['email' => 'budi@example.com']);
        $member->forceFill(['master_identity_id' => $identity->id])->save();

        $this->actingAs($this->admin())->post(route('admin.partners.store'), $this->payload())
            ->assertRedirect(route('admin.partners.index'));

        $partner = Partner::query()->where('name', 'Toko Maju')->firstOrFail();

        $this->assertSame('budi@example.com', $partner->user->email);
        $this->assertSame($identity->id, $partner->master_identity_id);
        $this->assertSame($member->fresh()->master_identity_id, $partner->master_identity_id);
    }

    public function test_admin_creates_member_partner_from_email_only(): void
    {
        $member = User::factory()->member()->create([
            'email' => 'member-baru@example.com',
            'name' => 'Siti Member',
            'birth_date' => '1992-07-07',
        ]);

        $this->actingAs($this->admin())->post(route('admin.partners.store'), $this->payload([
            'is_member' => true,
            'member_email' => 'member-baru@example.com',
            'vendor_email' => 'siti-partner@example.com',
            'vendor_name' => 'Siti',
            'pic_name' => '',
            'pic_email' => '',
            'pic_whatsapp' => '',
            'pic_phone' => '',
        ]))->assertRedirect(route('admin.partners.index'));

        $partner = Partner::query()->where('name', 'Toko Maju')->firstOrFail();

        $this->assertTrue((bool) $partner->is_member);
        $this->assertSame($member->id, $partner->member_user_id);
        $this->assertSame($member->member_code, $partner->member_id_number);
        $this->assertSame('Siti Member', $partner->member_name);
        $this->assertSame('1992-07-07', $partner->member_birth_date?->toDateString());
        $this->assertSame('Siti Member', $partner->pic_name);
    }

    public function test_admin_member_email_must_point_to_a_member(): void
    {
        User::factory()->vendor()->create(['email' => 'bukan-member@example.com']);

        $this->actingAs($this->admin())->post(route('admin.partners.store'), $this->payload([
            'is_member' => true,
            'member_email' => 'bukan-member@example.com',
        ]))->assertSessionHasErrors('member_email');
    }

    public function test_admin_cannot_create_partner_with_duplicate_vendor_email(): void
    {
        $this->actingAs($this->admin())
            ->post(route('admin.partners.store'), $this->payload())
            ->assertRedirect(route('admin.partners.index'));

        $this->actingAs($this->admin())
            ->post(route('admin.partners.store'), $this->payload(['name' => 'Toko Lain']))
            ->assertSessionHasErrors('vendor_email');
    }

    public function test_admin_cannot_create_two_partners_with_the_same_partner_email(): void
    {
        $this->actingAs($this->admin())->post(route('admin.partners.store'), $this->payload([
            'email' => 'halo@example.com',
        ]))->assertRedirect(route('admin.partners.index'));

        $this->actingAs($this->admin())->post(route('admin.partners.store'), $this->payload([
            'name' => 'Toko Kedua',
            'vendor_name' => 'Siti',
            'vendor_email' => 'siti@example.com',
            'email' => 'halo@example.com',
        ]))->assertSessionHasErrors('email');
    }
}
