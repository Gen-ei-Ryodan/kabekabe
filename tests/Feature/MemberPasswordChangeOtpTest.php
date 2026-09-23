<?php

namespace Tests\Feature;

use App\Mail\OtpMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class MemberPasswordChangeOtpTest extends TestCase
{
    use RefreshDatabase;

    private function member(): User
    {
        return User::factory()->member()->create();
    }

    private function changePayload(User $member, array $extra = []): array
    {
        return array_merge([
            'email' => $member->email,
            'current_password' => 'password',
            'password' => 'PasswordBaru1',
            'password_confirmation' => 'PasswordBaru1',
        ], $extra);
    }

    public function test_account_screen_can_be_rendered(): void
    {
        $this->actingAs($this->member())->get('/member/account')->assertOk();
    }

    public function test_password_change_is_rejected_without_otp(): void
    {
        $member = $this->member();

        $this->actingAs($member)
            ->from('/member/account')
            ->put('/member/account', $this->changePayload($member))
            ->assertSessionHasErrors('otp');

        $this->assertTrue(Hash::check('password', $member->refresh()->password));
    }

    public function test_password_change_is_rejected_with_wrong_current_password(): void
    {
        $member = $this->member();

        $this->actingAs($member)
            ->from('/member/account')
            ->put('/member/account', $this->changePayload($member, [
                'current_password' => 'salah-password',
            ]))
            ->assertSessionHasErrors('current_password');
    }

    public function test_weak_new_password_is_rejected(): void
    {
        $member = $this->member();

        $this->actingAs($member)
            ->from('/member/account')
            ->put('/member/account', $this->changePayload($member, [
                'password' => 'tanpaangka',
                'password_confirmation' => 'tanpaangka',
            ]))
            ->assertSessionHasErrors('password');
    }

    public function test_otp_can_be_requested_by_email(): void
    {
        Mail::fake();

        $member = $this->member();

        $this->actingAs($member)
            ->from('/member/account')
            ->post('/member/account/password/send-otp', $this->changePayload($member))
            ->assertRedirect('/member/account')
            ->assertSessionHasNoErrors();

        Mail::assertSent(OtpMail::class, fn (OtpMail $mail) => $mail->hasTo($member->email));

        $member->refresh();

        $this->assertNotNull($member->otp_code);
        $this->assertSame('change_password', $member->otp_purpose);
        $this->assertTrue($member->otp_expires_at->isFuture());
    }

    public function test_otp_request_requires_valid_current_password(): void
    {
        Mail::fake();

        $member = $this->member();

        $this->actingAs($member)
            ->from('/member/account')
            ->post('/member/account/password/send-otp', $this->changePayload($member, [
                'current_password' => 'salah-password',
            ]))
            ->assertSessionHasErrors('current_password');

        Mail::assertNothingSent();
    }

    public function test_password_can_be_changed_with_valid_otp(): void
    {
        Mail::fake();

        $member = $this->member();

        $this->actingAs($member)
            ->from('/member/account')
            ->post('/member/account/password/send-otp', $this->changePayload($member));

        $code = $member->refresh()->otp_code;

        $this->actingAs($member)
            ->from('/member/account')
            ->put('/member/account', $this->changePayload($member, ['otp' => $code]))
            ->assertSessionHasNoErrors()
            ->assertRedirect('/member/account');

        $member->refresh();

        $this->assertTrue(Hash::check('PasswordBaru1', $member->password));
        $this->assertNull($member->otp_code);
        $this->assertNull($member->otp_purpose);
    }

    public function test_password_change_is_rejected_with_wrong_otp(): void
    {
        Mail::fake();

        $member = $this->member();

        $this->actingAs($member)
            ->from('/member/account')
            ->post('/member/account/password/send-otp', $this->changePayload($member));

        $code = $member->refresh()->otp_code;
        $wrong = $code === '123456' ? '654321' : '123456';

        $this->actingAs($member)
            ->from('/member/account')
            ->put('/member/account', $this->changePayload($member, ['otp' => $wrong]))
            ->assertSessionHasErrors('otp');

        $this->assertTrue(Hash::check('password', $member->refresh()->password));
    }

    public function test_profile_update_without_password_does_not_require_otp(): void
    {
        $member = $this->member();

        $this->actingAs($member)
            ->from('/member/account')
            ->put('/member/account', [
                'email' => $member->email,
                'whatsapp' => '081234567890',
                'company' => 'PT Uji Coba',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/member/account');

        $this->assertSame('PT Uji Coba', $member->refresh()->company);
    }
}
