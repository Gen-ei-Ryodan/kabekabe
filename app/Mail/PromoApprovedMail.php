<?php

namespace App\Mail;

use App\Models\Promo;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PromoApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $member,
        public Promo $promo,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Promo Baru: {$this->promo->title} - KBKB",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'mail.promo-approved');
    }
}
