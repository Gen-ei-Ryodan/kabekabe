<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isVendor() && $this->user()->partner !== null;
    }

    public function rules(): array
    {
        return [
            'transaction_number' => ['nullable', 'string', 'max:64', Rule::unique('transactions', 'transaction_number')],
            'member_code' => ['required', 'string', 'max:32', 'exists:users,member_code'],
            'scan_id' => ['nullable', 'integer', 'exists:member_scans,id'],
            'promo_id' => ['nullable', 'integer', 'exists:promos,id'],
            'total' => ['required', 'integer', 'min:1'],
            'note' => ['nullable', 'string', 'max:1000'],
            'proof' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ];
    }

    public function messages(): array
    {
        return [
            'member_code.exists' => 'Member ID not found. Please check the entered ID.',
        ];
    }
}
