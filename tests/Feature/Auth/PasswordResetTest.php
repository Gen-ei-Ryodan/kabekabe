<?php

namespace Tests\Feature\Auth;

use App\Mail\OtpMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_screen_can_be_rendered(): void
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);
    }

    public function test_otp_screen_redirects_when_no_email_in_session(): void
    {
        $this->get('/forgot-password/verify-otp')->assertRedirect(route('password.request'));
    }

    public function test_otp_can_be_requested_by_email(): void
    {
        Mail::fake();

        $user = User::factory()->create();

        $response = $this->post('/forgot-password', ['email' => $user->email]);

        $response->assertRedirect(route('password.otp'));

        Mail::assertSent(OtpMail::class, fn (OtpMail $mail) => $mail->hasTo($user->email));

        $user->refresh();

        $this->assertNotNull($user->otp_code);
        $this->assertSame('password_reset', $user->otp_purpose);
        $this->assertTrue($user->otp_expires_at->isFuture());
    }

    public function test_unknown_email_still_redirects_to_otp_screen_without_sending_mail(): void
    {
        Mail::fake();

        $response = $this->post('/forgot-password', ['email' => 'tidak-ada@example.com']);

        $response->assertRedirect(route('password.otp'));

        Mail::assertNothingSent();
    }

    public function test_otp_screen_can_be_rendered(): void
    {
        Mail::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        $this->get('/forgot-password/verify-otp')->assertOk();
    }

    public function test_wrong_otp_is_rejected(): void
    {
        Mail::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        $code = $user->refresh()->otp_code;
        $wrong = $code === '999999' ? '888888' : '999999';

        $this->post('/forgot-password/verify-otp', ['otp' => $wrong])
            ->assertSessionHasErrors('otp');
    }

    public function test_reset_password_screen_requires_verified_otp(): void
    {
        $this->get('/reset-password')->assertRedirect(route('password.request'));
    }

    public function test_password_can_be_reset_with_valid_otp(): void
    {
        Mail::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        $code = $user->refresh()->otp_code;

        $this->post('/forgot-password/verify-otp', ['otp' => $code])
            ->assertRedirect(route('password.reset'));

        $this->get('/reset-password')->assertOk();

        $response = $this->post('/reset-password', [
            'password' => 'PasswordBaru1',
            'password_confirmation' => 'PasswordBaru1',
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('login'));

        $user->refresh();

        $this->assertTrue(Hash::check('PasswordBaru1', $user->password));
        $this->assertNull($user->otp_code);
        $this->assertNull($user->otp_purpose);
    }

    public function test_weak_password_is_rejected_on_reset(): void
    {
        Mail::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        $code = $user->refresh()->otp_code;

        $this->post('/forgot-password/verify-otp', ['otp' => $code]);

        $this->post('/reset-password', [
            'password' => 'hanyahuruf',
            'password_confirmation' => 'hanyahuruf',
        ])->assertSessionHasErrors('password');
    }

    public function test_otp_can_be_resent(): void
    {
        Mail::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        $firstCode = $user->refresh()->otp_code;

        Mail::fake();

        $this->post('/forgot-password/resend-otp')->assertRedirect();

        $user->refresh();

        Mail::assertSent(OtpMail::class, fn (OtpMail $mail) => $mail->hasTo($user->email));
        $this->assertNotNull($firstCode === $user->otp_code ? null : $user->otp_code);
    }
}
