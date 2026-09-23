<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'nickname' => ['nullable', 'string', 'max:100'],
            'gender' => ['nullable', 'string', Rule::in(['male', 'female'])],
            'birth_date' => ['nullable', 'date', 'before_or_equal:today'],
            'birth_place' => ['nullable', 'string', 'max:100'],
            'marital_status' => ['nullable', 'string', 'max:50'],
            'religion' => ['nullable', 'string', 'max:100'],
            'place_of_worship_address' => ['nullable', 'string', 'max:500'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', Password::defaults(), 'confirmed'],
            'phone' => ['nullable', 'string', 'max:30'],
            'whatsapp' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:500'],
            'district' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'company' => ['nullable', 'string', 'max:255'],
            'industry' => ['nullable', 'string', 'max:150'],
            'business_fields' => ['nullable', 'array'],
            'business_fields.*' => ['string', 'max:255'],
            'business_address' => ['nullable', 'string', 'max:500'],
            'business_district' => ['nullable', 'string', 'max:100'],
            'business_city' => ['nullable', 'string', 'max:100'],
            'hobbies' => ['nullable', 'array'],
            'hobbies.*' => ['string', 'max:255'],
            'valid_until' => ['nullable', 'date'],
            'membership_period' => ['nullable', 'integer', 'min:1', 'max:120'],
        ];
    }
}
