<?php

namespace App\Http\Requests;

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
            'discount_type' => ['required', 'in:percent,nominal,free_item'],
            'discount_value' => ['required', 'integer', 'min:1', 'max:100000000'],
            'min_purchase' => ['required', 'integer', 'min:0'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'terms' => ['nullable', 'string', 'max:2000'],
            'sort_number' => ['nullable', 'integer', 'min:1'],
            'logo' => ['nullable', 'file', 'image', 'max:2048'],
            'promo_image' => ['nullable', 'file', 'image', 'max:2048'],
            'product_image' => ['nullable', 'file', 'image', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'discount_value.max' => 'Nilai diskon terlalu besar.',
            'end_date.after_or_equal' => 'Tanggal berakhir harus setelah tanggal mulai.',
            'logo.image' => 'Logo harus berupa gambar.',
            'logo.max' => 'Ukuran logo maksimal 2MB.',
            'promo_image.image' => 'Foto promo harus berupa gambar.',
            'promo_image.max' => 'Ukuran foto promo maksimal 2MB.',
            'product_image.image' => 'Foto produk harus berupa gambar.',
            'product_image.max' => 'Ukuran foto produk maksimal 2MB.',
        ];
    }
}
