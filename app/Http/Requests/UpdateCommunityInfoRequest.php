<?php

namespace App\Http\Requests;

use App\Models\CommunityInfo;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCommunityInfoRequest extends FormRequest
{
    public function authorize(): bool
    {
        $info = $this->route('info');

        return $this->user()->can('update', $info);
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'in:event,announcement,news,agenda'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'event_date' => ['nullable', 'date'],
            'location' => ['nullable', 'string', 'max:255'],
            'is_published' => ['boolean'],
        ];
    }
}