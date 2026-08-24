<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'body' => ['required', 'string', 'max:2000'],
            'type' => ['nullable', 'in:promo,membership,community,system,transaction'],
            'recipient_id' => ['nullable', 'integer', 'exists:users,id'],
            'action_url' => ['nullable', 'string', 'max:255'],
        ];
    }
}