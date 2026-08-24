<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImportRowsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:xlsx,csv,txt', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.mimes' => 'The file must be an .xlsx or .csv spreadsheet.',
        ];
    }
}
