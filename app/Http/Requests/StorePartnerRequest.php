<?php

namespace App\Http\Requests;

use App\Models\User;
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
            'category' => ['nullable', 'string', 'max:50'],
            'industry' => ['nullable'],
            'employee_count' => ['nullable', 'integer', 'min:0'],
            'established_since' => ['nullable', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('partners', 'email')],
            'address' => ['nullable', 'string', 'max:1000'],
            'district' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:2000'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,svg', 'max:5120'],
            'joined_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date'],
            'sort_number' => ['nullable', 'integer', 'min:1'],
            'total_belanja' => ['nullable', 'string', 'max:255'],
            'diskon1' => ['nullable', 'string', 'max:255'],
            'diskon2' => ['nullable', 'string', 'max:255'],
            'diskon3' => ['nullable', 'string', 'max:255'],
            // Keanggotaan KBKB - supports boolean or 'yes'/'no'
            'is_member' => ['nullable'],
            'member_email' => [
                Rule::requiredIf(function () {
                    return filter_var($this->input('is_member'), FILTER_VALIDATE_BOOLEAN) || $this->input('is_member') === 'yes';
                }),
                'nullable',
                'email',
                'max:255',
                Rule::exists('users', 'email')->where('role', User::ROLE_MEMBER),
            ],
            // Biodata PIC / Owner (Master Identity)
            'pic_name' => ['nullable', 'string', 'max:255'],
            'nickname' => ['nullable', 'string', 'max:100'],
            'gender' => ['nullable', 'string', 'max:50'],
            'birth_place' => ['nullable', 'string', 'max:100'],
            'birth_date' => ['nullable', 'date'],
            'marital_status' => ['nullable', 'string', 'max:50'],
            'religion' => ['nullable', 'string', 'max:100'],
            'place_of_worship_address' => ['nullable', 'string', 'max:500'],
            'pic_email' => ['nullable', 'email', 'max:255'],
            'pic_whatsapp' => ['nullable', 'string', 'max:30'],
            'pic_phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:1000'],
            'district' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'member_address' => ['nullable', 'string', 'max:500'],
            'member_district' => ['nullable', 'string', 'max:100'],
            'member_city' => ['nullable', 'string', 'max:100'],
            'is_household' => ['nullable', 'boolean'],
            'companies' => ['nullable', 'array'],
            'business_district' => ['nullable', 'string', 'max:100'],
            'business_city' => ['nullable', 'string', 'max:100'],
            'hobbies' => ['nullable', 'array'],
            'hobbies.*' => ['string', 'max:255'],
            // Vendor Login credentials
            'vendor_name' => ['required', 'string', 'max:255'],
            'vendor_email' => [
                'required',
                'email',
                'max:255',
                // Email boleh sama dengan email Member, dan abaikan user vendor yatim piatu yang tidak punya partner.
                Rule::unique('users', 'email')->where(function ($query) {
                    $query->where('role', User::ROLE_VENDOR)
                        ->whereExists(function ($sub) {
                            $sub->selectRaw(1)
                                ->from('partners')
                                ->whereColumn('partners.user_id', 'users.id');
                        });
                }),
            ],
            'vendor_password' => ['required', 'string', Password::defaults(), 'confirmed'],
        ];
    }
}