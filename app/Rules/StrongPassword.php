<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

/**
 * Aturan password kuat: minimal 8 karakter dan merupakan kombinasi huruf + angka.
 *
 * Diregistrasikan sebagai default melalui Password::defaults() di AppServiceProvider
 * sehingga seluruh field password di aplikasi memakai aturan yang sama.
 */
class StrongPassword implements Rule
{
    public function passes($attribute, $value): bool
    {
        return is_string($value)
            && strlen($value) >= 8
            && preg_match('/[A-Za-z]/', $value) === 1
            && preg_match('/[0-9]/', $value) === 1;
    }

    public function message(): string
    {
        return 'Password minimal 8 karakter dan harus merupakan kombinasi huruf dan angka.';
    }
}
