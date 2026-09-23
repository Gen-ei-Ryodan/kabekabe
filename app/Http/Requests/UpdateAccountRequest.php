<?php

namespace App\Http\Requests;

use App\Services\PasswordOtpService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isMember();
    }

    public function rules(): array
    {
        $changingPassword = $this->filled('password');

        return [
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users')->ignore($this->user()->id)],
            'religion' => ['nullable', 'string', 'in:islam,kristen,katolik,hindu,buddha,konghucu,lainnya'],
            'address' => ['nullable', 'string', 'max:500'],
            'whatsapp' => ['nullable', 'string', 'max:30'],
            'company' => ['nullable', 'string', 'max:255'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'current_password' => [$changingPassword ? 'required' : 'nullable', 'current_password'],
            'password' => ['nullable', 'string', Password::defaults(), 'confirmed'],
            // Ganti password wajib dikonfirmasi dengan kode OTP yang dikirim ke email.
            'otp' => [
                $changingPassword ? 'required' : 'nullable',
                'string',
                'size:6',
                function ($attribute, $value, $fail) {
                    if (! $this->filled('password')) {
                        return;
                    }

                    if (! app(PasswordOtpService::class)->verify($this->user(), is_string($value) ? $value : null, PasswordOtpService::PURPOSE_CHANGE)) {
                        $fail('Kode OTP salah atau sudah kedaluwarsa. Silakan klik "Kirim Kode OTP" untuk meminta kode baru.');
                    }
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required' => 'Password saat ini wajib diisi untuk mengganti password.',
            'current_password.current_password' => 'Password saat ini tidak sesuai.',
            'password.confirmed' => 'Konfirmasi password baru tidak cocok.',
            'otp.required' => 'Kode OTP wajib diisi. Klik "Kirim Kode OTP" terlebih dahulu.',
            'otp.size' => 'Kode OTP harus terdiri dari 6 digit.',
            'email.unique' => 'Email ini sudah digunakan oleh akun lain.',
            'avatar.max' => 'Ukuran foto maksimal adalah 2MB.',
        ];
    }

    public function attributes(): array
    {
        return [
            'otp' => 'kode OTP',
        ];
    }
}
