<?php

namespace Tests\Feature;

use App\Mail\AccountApprovedMail;
use App\Models\Partner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ApprovalNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_approval_regenerates_initial_password_and_sends_email(): void
    {
        Mail::fake();

        $member = User::factory()->member()->create([
            'approval_status' => User::APPROVAL_PENDING,
            'must_change_password' => true,
            'password' => Hash::make('OldSecret123'),
        ]);

        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->put(route('admin.members.approve', $member))
            ->assertRedirect();

        $member->refresh();

        $this->assertSame(User::APPROVAL_APPROVED, $member->approval_status);
        $this->assertTrue($member->must_change_password);

        Mail::assertSent(AccountApprovedMail::class, function (AccountApprovedMail $mail) use ($member) {
            return $mail->hasTo($member->email)
                && $mail->initialPassword !== null
                && preg_match('/^KBKB\d{4}$/', $mail->initialPassword) === 1
                && Hash::check($mail->initialPassword, $member->password);
        });
    }

    public function test_member_rejection_does_not_send_approval_email(): void
    {
        Mail::fake();

        $member = User::factory()->member()->create([
            'approval_status' => User::APPROVAL_PENDING,
            'must_change_password' => true,
        ]);

        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->put(route('admin.members.reject', $member))
            ->assertRedirect();

        $this->assertSame(User::APPROVAL_REJECTED, $member->fresh()->approval_status);

        Mail::assertNotSent(AccountApprovedMail::class);
    }

    public function test_partner_approval_sends_email_with_initial_password(): void
    {
        Mail::fake();

        $partner = Partner::factory()->create();
        $user = $partner->user;
        $user->forceFill([
            'approval_status' => User::APPROVAL_PENDING,
            'must_change_password' => true,
        ])->save();

        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->put(route('admin.partners.approve', $partner))
            ->assertRedirect();

        $partner->refresh();

        $this->assertTrue($partner->is_active);
        $this->assertSame(User::APPROVAL_APPROVED, $user->fresh()->approval_status);

        Mail::assertSent(AccountApprovedMail::class, function (AccountApprovedMail $mail) use ($user) {
            return $mail->hasTo($user->email)
                && $mail->initialPassword !== null
                && Hash::check($mail->initialPassword, $user->fresh()->password);
        });
    }

    public function test_approval_email_omits_password_when_user_already_changed_it(): void
    {
        Mail::fake();

        $member = User::factory()->member()->create([
            'approval_status' => User::APPROVAL_PENDING,
            'must_change_password' => false,
            'password' => Hash::make('ChosenPass123'),
        ]);

        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->put(route('admin.members.approve', $member))
            ->assertRedirect();

        Mail::assertSent(AccountApprovedMail::class, function (AccountApprovedMail $mail) use ($member) {
            return $mail->hasTo($member->email)
                && $mail->initialPassword === null
                && Hash::check('ChosenPass123', $member->fresh()->password);
        });
    }
}
