<?php

namespace App\Http\Requests;

use App\Models\Promo;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePromoRequest extends FormRequest
{
    public function authorize(): bool
    {
        $promo = $this->route('promo');

        return $this->user()->can('update', $promo);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'discount_type' => ['required', 'in:percent,nominal'],
            'discount_value' => ['required', 'integer', 'min:1', 'max:100000000'],
            'min_purchase' => ['required', 'integer', 'min:0'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'terms' => ['nullable', 'string', 'max:2000'],
            'sort_number' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'discount_value.max' => 'Nilai diskon terlalu besar.',
            'end_date.after_or_equal' => 'Tanggal berakhir harus setelah tanggal mulai.',
        ];
    }
}