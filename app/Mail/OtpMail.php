<?php

namespace App\Mail;

use App\Services\PasswordOtpService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code,
        public string $heading,
        public string $body,
        public int $minutes = PasswordOtpService::TTL_MINUTES,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->heading.' - KBKB',
        );
    }

    public function content(): Content
    {
        return new Content(view: 'mail.otp');
    }
}
