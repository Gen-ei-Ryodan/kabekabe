<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StorePartnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'trade_name' => ['nullable', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:50'],
            'industry' => ['nullable', 'string', 'max:150'],
            'employee_count' => ['nullable', 'integer', 'min:0'],
            'established_since' => ['nullable', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:1000'],
            'district' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:2000'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,svg', 'max:2048'],
            'joined_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date'],
            'sort_number' => ['nullable', 'integer', 'min:1'],
            'total_belanja' => ['nullable', 'string', 'max:255'],
            'diskon1' => ['nullable', 'string', 'max:255'],
            'diskon2' => ['nullable', 'string', 'max:255'],
            'diskon3' => ['nullable', 'string', 'max:255'],
            // Keanggotaan KBKB
            'is_member' => ['nullable', 'boolean'],
            'member_id_number' => ['nullable', 'string', 'max:100'],
            'member_name' => ['nullable', 'string', 'max:255'],
            'member_birth_date' => ['nullable', 'date'],
            // Biodata PIC / Vendor
            'pic_name' => ['nullable', 'string', 'max:255'],
            'pic_phone' => ['nullable', 'string', 'max:30'],
            'nickname' => ['nullable', 'string', 'max:100'],
            'gender' => ['nullable', 'string', 'max:50'],
            'birth_place' => ['nullable', 'string', 'max:100'],
            'birth_date' => ['nullable', 'date'],
            'marital_status' => ['nullable', 'string', 'max:50'],
            'religion' => ['nullable', 'string', 'max:100'],
            'place_of_worship_address' => ['nullable', 'string', 'max:500'],
            'member_phone' => ['nullable', 'string', 'max:30'],
            'member_address' => ['nullable', 'string', 'max:500'],
            'member_district' => ['nullable', 'string', 'max:100'],
            'member_city' => ['nullable', 'string', 'max:100'],
            'hobbies' => ['nullable', 'array'],
            'hobbies.*' => ['string', 'max:255'],
            // Vendor Login credentials
            'vendor_name' => ['required', 'string', 'max:255'],
            'vendor_email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'vendor_password' => ['required', 'string', Password::defaults(), 'confirmed'],
        ];
    }
}
