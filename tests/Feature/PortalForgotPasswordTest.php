<?php

namespace Tests\Feature;

use App\Mail\OtpMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class PortalForgotPasswordTest extends TestCase
{
    use RefreshDatabase;

    private const EMAIL = 'test@example.com';

    private function sameEmailUsers(): array
    {
        $member = User::factory()->member()->create(['email' => self::EMAIL]);
        $vendor = User::factory()->vendor()->create(['email' => self::EMAIL]);

        return [$member, $vendor];
    }

    private function resetViaOtp(User $user, string $portal, string $newPassword = 'PasswordBaru1'): TestResponse
    {
        $this->post('/forgot-password', ['email' => self::EMAIL, 'portal' => $portal]);

        $code = $user->refresh()->otp_code;

        $this->post('/forgot-password/verify-otp', ['otp' => $code])
            ->assertRedirect(route('password.reset'));

        return $this->post('/reset-password', [
            'password' => $newPassword,
            'password_confirmation' => $newPassword,
        ]);
    }

    public function test_forgot_password_screen_carries_portal(): void
    {
        $this->get('/forgot-password?portal=partner')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Auth/ForgotPassword')
                ->where('portal', 'partner'));

        $this->get('/forgot-password')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Auth/ForgotPassword')
                ->where('portal', 'member'));
    }

    public function test_invalid_portal_is_rejected(): void
    {
        $this->post('/forgot-password', [
            'email' => self::EMAIL,
            'portal' => 'superadmin',
        ])->assertSessionHasErrors('portal');
    }

    public function test_partner_portal_only_sends_otp_to_vendor(): void
    {
        Mail::fake();

        [$member, $vendor] = $this->sameEmailUsers();

        $this->post('/forgot-password', ['email' => self::EMAIL, 'portal' => 'partner'])
            ->assertRedirect(route('password.otp'))
            ->assertSessionHas('password_reset_role', User::ROLE_VENDOR);

        Mail::assertSent(OtpMail::class, fn (OtpMail $mail) => $mail->hasTo(self::EMAIL));
        Mail::assertSentCount(1);

        $this->assertNull($member->refresh()->otp_code);
        $this->assertNotNull($vendor->refresh()->otp_code);

        $this->get('/forgot-password/verify-otp')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Auth/ForgotPasswordOtp')
                ->where('portal', 'partner'));
    }

    public function test_member_portal_only_sends_otp_to_member(): void
    {
        Mail::fake();

        [$member, $vendor] = $this->sameEmailUsers();

        $this->post('/forgot-password', ['email' => self::EMAIL, 'portal' => 'member'])
            ->assertRedirect(route('password.otp'))
            ->assertSessionHas('password_reset_role', User::ROLE_MEMBER);

        Mail::assertSent(OtpMail::class, fn (OtpMail $mail) => $mail->hasTo(self::EMAIL));
        Mail::assertSentCount(1);

        $this->assertNotNull($member->refresh()->otp_code);
        $this->assertNull($vendor->refresh()->otp_code);
    }

    public function test_partner_portal_reset_changes_only_vendor_password(): void
    {
        Mail::fake();

        [$member, $vendor] = $this->sameEmailUsers();

        $response = $this->resetViaOtp($vendor, 'partner');

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('partner.login'));

        $this->get('/reset-password')->assertRedirect(route('password.request'));

        $this->assertTrue(Hash::check('PasswordBaru1', $vendor->refresh()->password));
        $this->assertTrue(Hash::check('password', $member->refresh()->password));
        $this->assertNull($vendor->otp_code);
        $this->assertNull($member->otp_code);
    }

    public function test_member_portal_reset_changes_only_member_password(): void
    {
        Mail::fake();

        [$member, $vendor] = $this->sameEmailUsers();

        $response = $this->resetViaOtp($member, 'member');

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('login'));

        $this->assertTrue(Hash::check('PasswordBaru1', $member->refresh()->password));
        $this->assertTrue(Hash::check('password', $vendor->refresh()->password));
        $this->assertNull($member->otp_code);
        $this->assertNull($vendor->otp_code);
    }

    public function test_partner_portal_ignores_member_only_email(): void
    {
        Mail::fake();

        $member = User::factory()->member()->create(['email' => self::EMAIL]);

        $this->post('/forgot-password', ['email' => self::EMAIL, 'portal' => 'partner'])
            ->assertRedirect(route('password.otp'));

        Mail::assertNothingSent();
        $this->assertNull($member->refresh()->otp_code);
    }

    public function test_reset_screen_carries_portal_after_partner_otp(): void
    {
        Mail::fake();

        [, $vendor] = $this->sameEmailUsers();

        $this->post('/forgot-password', ['email' => self::EMAIL, 'portal' => 'partner']);

        $this->post('/forgot-password/verify-otp', ['otp' => $vendor->refresh()->otp_code])
            ->assertRedirect(route('password.reset'));

        $this->get('/reset-password')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Auth/ResetPassword')
                ->where('portal', 'partner'));
    }
}
