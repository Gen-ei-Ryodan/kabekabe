<?php

namespace Tests\Feature;

use App\Models\MasterIdentity;
use App\Models\Partner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PartnerMemberLinkTest extends TestCase
{
    use RefreshDatabase;

    private function memberWithIdentity(): User
    {
        $identity = MasterIdentity::create([
            'email' => 'member-taut@example.com',
            'name' => 'Sri Member',
            'phone' => '0811222333',
            'birth_date' => '1992-07-08',
            'city' => 'Denpasar',
            'hobbies' => ['Memasak'],
        ]);

        return User::factory()->member()->create([
            'email' => 'member-taut@example.com',
            'name' => 'Sri Member',
            'phone' => '0811222333',
            'master_identity_id' => $identity->id,
        ]);
    }

    private function partnerPayload(array $overrides = []): array
    {
        return array_merge([
            'company_name' => 'PT Taut Member',
            'company_address' => 'Jl. Taut No. 9',
            'company_phone' => '0811000111',
            'industry' => ['Retail'],
            'is_member' => true,
            'member_email' => 'member-taut@example.com',
            'email' => 'partner-taut@example.com',
            'password' => 'Rahasia123!',
            'password_confirmation' => 'Rahasia123!',
        ], $overrides);
    }

    private function verifyMemberLink(string $memberEmail): void
    {
        $this->postJson(route('partner.member-link.request'), ['member_email' => $memberEmail])
            ->assertOk()
            ->assertJsonPath('ok', true);

        $code = User::query()->where('email', $memberEmail)->firstOrFail()->fresh()->otp_code;
        $this->assertNotNull($code);

        $this->postJson(route('partner.member-link.verify'), ['otp' => $code])
            ->assertOk()
            ->assertJsonPath('ok', true);
    }

    public function test_unknown_member_email_is_rejected(): void
    {
        $this->postJson(route('partner.member-link.request'), ['member_email' => 'tidak-ada@example.com'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('member_email');
    }

    public function test_wrong_otp_blocks_partner_registration(): void
    {
        $this->memberWithIdentity();

        $this->postJson(route('partner.member-link.request'), ['member_email' => 'member-taut@example.com'])
            ->assertOk();

        $this->postJson(route('partner.member-link.verify'), ['otp' => '999999'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('otp');

        $this->post('/partner/register', $this->partnerPayload())
            ->assertSessionHasErrors('member_email');

        $this->assertNull(Partner::query()->where('email', 'partner-taut@example.com')->first());
    }

    public function test_verified_member_is_linked_and_shares_master_identity(): void
    {
        $member = $this->memberWithIdentity();
        $identityId = $member->master_identity_id;

        $this->verifyMemberLink('member-taut@example.com');

        // Form 4 section biodata tidak dikirim saat link terverifikasi.
        $this->post('/partner/register', $this->partnerPayload())
            ->assertRedirect(route('partner.otp.show'));

        $partner = Partner::query()->where('email', 'partner-taut@example.com')->firstOrFail();
        $vendor = User::query()->where('email', 'partner-taut@example.com')->firstOrFail();

        $this->assertSame($member->id, $partner->member_user_id);
        $this->assertTrue((bool) $partner->is_member);
        $this->assertSame($member->member_code, $partner->member_code);

        // 1 partner → 1 member, dan identity-nya sama dengan milik member.
        $this->assertSame($identityId, $partner->master_identity_id);
        $this->assertSame($identityId, $vendor->master_identity_id);
        $this->assertSame($identityId, $member->fresh()->master_identity_id);

        // Data PIC & nama diambil dari member, bukan dari form yang disingkirkan.
        $this->assertSame('Sri Member', $partner->pic_name);
        $this->assertSame('Sri Member', $vendor->name);
        $this->assertSame($member->phone, $partner->pic_phone);
        $this->assertSame('1992-07-08', $partner->member_birth_date?->toDateString());
        $this->assertSame($member->phone, $vendor->phone);
        $this->assertSame('Denpasar', $vendor->city);
    }

    public function test_one_member_can_link_many_partners(): void
    {
        $member = $this->memberWithIdentity();

        $this->verifyMemberLink('member-taut@example.com');
        $this->post('/partner/register', $this->partnerPayload())
            ->assertRedirect(route('partner.otp.show'));

        $this->verifyMemberLink('member-taut@example.com');
        $this->post('/partner/register', $this->partnerPayload([
            'email' => 'partner-kedua@example.com',
            'company_name' => 'PT Taut Kedua',
        ]))->assertRedirect(route('partner.otp.show'));

        $this->assertSame(
            2,
            Partner::query()->where('member_user_id', $member->id)->count()
        );

        $this->assertSame(
            2,
            Partner::query()->where('master_identity_id', $member->master_identity_id)->count()
        );
    }

    public function test_member_without_identity_gets_one_for_both_sides(): void
    {
        $member = User::factory()->member()->create([
            'email' => 'member-tanpa-identity@example.com',
            'name' => 'Tanpa Identity',
        ]);

        $this->assertNull($member->master_identity_id);

        $this->verifyMemberLink('member-tanpa-identity@example.com');
        $this->post('/partner/register', $this->partnerPayload([
            'member_email' => 'member-tanpa-identity@example.com',
        ]))->assertRedirect(route('partner.otp.show'));

        $partner = Partner::query()->where('email', 'partner-taut@example.com')->firstOrFail();

        $member->refresh();
        $this->assertNotNull($member->master_identity_id);
        $this->assertSame($member->master_identity_id, $partner->master_identity_id);
        $this->assertSame('Tanpa Identity', $partner->masterIdentity?->name);
    }
}
