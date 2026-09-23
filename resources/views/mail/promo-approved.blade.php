<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#f4f1ea;font-family:Inter,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f1ea;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:20px;border:1px solid rgba(11,21,38,0.08);overflow:hidden;">
                    <tr>
                        <td style="background-color:#0b1526;padding:24px 32px;">
                            <span style="font-family:'Space Grotesk',Helvetica,Arial,sans-serif;font-size:20px;font-weight:700;color:#e7c873;letter-spacing:0.08em;">KBKB</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px 32px 8px;">
                            <p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#9ca3af;">Promo Eksklusif Member</p>
                            <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0b1526;">Halo {{ $member->name }}, ada promo baru nih!</h1>
                            <p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563;">
                                Promo dari <strong style="color:#0b1526;">{{ $promo->partner->name }}</strong> baru saja disetujui dan sudah bisa kamu gunakan.
                            </p>
                        </td>
                    </tr>

                    {{-- Kartu Promo --}}
                    <tr>
                        <td style="padding:16px 32px 8px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:16px;overflow:hidden;border:1px solid rgba(11,21,38,0.10);">
                                @if ($promo->promo_image_url)
                                <tr>
                                    <td style="padding:0;background-color:#0b1526;">
                                        <img src="{{ $promo->promo_image_url }}" alt="Foto Promo {{ $promo->title }}" width="496" style="display:block;width:100%;max-height:240px;object-fit:cover;border:0;">
                                    </td>
                                </tr>
                                @endif
                                <tr>
                                    <td style="background-color:#0b1526;padding:20px 24px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td valign="middle">
                                                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.55);">{{ $promo->partner->name }}</p>
                                                    <p style="margin:0;font-family:'Space Grotesk',Helvetica,Arial,sans-serif;font-size:30px;font-weight:700;color:#e7c873;">
                                                        @if ($promo->discount_type === 'percent')
                                                            {{ $promo->discount_value }}%
                                                        @elseif ($promo->discount_type === 'free_item')
                                                            Free Barang
                                                        @else
                                                            Rp{{ number_format($promo->discount_value, 0, ',', '.') }}
                                                        @endif
                                                    </p>
                                                    <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">
                                                        {{ $promo->discount_type === 'free_item' ? 'Hadiah barang senilai Rp' . number_format($promo->discount_value, 0, ',', '.') : 'Diskon eksklusif member' }}
                                                    </p>
                                                </td>
                                                @if ($promo->logo_url)
                                                <td valign="middle" align="right" width="72" style="padding-left:16px;">
                                                    <img src="{{ $promo->logo_url }}" alt="Logo {{ $promo->partner->name }}" width="64" height="64" style="display:block;width:64px;height:64px;object-fit:contain;background-color:rgba(255,255,255,0.08);border-radius:12px;border:0;">
                                                </td>
                                                @endif
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background-color:#ffffff;padding:20px 24px;">
                                        <p style="margin:0 0 12px;font-family:'Space Grotesk',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;color:#0b1526;">{{ $promo->title }}</p>
                                        @if ($promo->description)
                                        <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#4b5563;">{{ $promo->description }}</p>
                                        @endif

                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
                                            <tr>
                                                <td width="33%" style="background-color:#f9f7f2;border-radius:10px;padding:10px 12px;">
                                                    <p style="margin:0;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;">Minimal Belanja</p>
                                                    <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#0b1526;">{{ $promo->min_purchase > 0 ? 'Rp' . number_format($promo->min_purchase, 0, ',', '.') : 'Tanpa Minimal' }}</p>
                                                </td>
                                                <td width="2%" style="font-size:0;line-height:0;">&nbsp;</td>
                                                <td width="33%" style="background-color:#f9f7f2;border-radius:10px;padding:10px 12px;">
                                                    <p style="margin:0;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;">Benefit</p>
                                                    <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#0b1526;">{{ $promo->discountLabel() }}</p>
                                                </td>
                                                <td width="2%" style="font-size:0;line-height:0;">&nbsp;</td>
                                                <td width="30%" style="background-color:#f9f7f2;border-radius:10px;padding:10px 12px;">
                                                    <p style="margin:0;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;">Periode</p>
                                                    <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#0b1526;">{{ $promo->start_date->format('d M Y') }} — {{ $promo->end_date->format('d M Y') }}</p>
                                                </td>
                                            </tr>
                                        </table>

                                        @if ($promo->product_image_url)
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
                                            <tr>
                                                <td style="border:1px solid rgba(11,21,38,0.10);border-radius:10px;padding:8px;text-align:center;">
                                                    <img src="{{ $promo->product_image_url }}" alt="Foto Produk" width="440" style="display:block;width:100%;max-height:200px;object-fit:contain;border-radius:6px;border:0;">
                                                    <p style="margin:8px 0 0;font-size:11px;color:#9ca3af;">Foto produk yang ditawarkan</p>
                                                </td>
                                            </tr>
                                        </table>
                                        @endif

                                        @if ($promo->terms)
                                        <div style="background-color:#f4f1ea;border-radius:10px;padding:12px 14px;margin:0 0 18px;">
                                            <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;">Syarat &amp; Ketentuan</p>
                                            <p style="margin:0;font-size:12px;line-height:1.6;color:#4b5563;">{{ $promo->terms }}</p>
                                        </div>
                                        @endif

                                        <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;">
                                            <tr>
                                                <td style="background-color:#0b1526;border-radius:999px;">
                                                    <a href="{{ route('member.promos.show', $promo->id) }}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:700;color:#e7c873;text-decoration:none;">Lihat Promo →</a>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#6b7280;text-align:center;">
                                            Tunjukkan kartu digital member KBKB yang masih aktif saat pembayaran di kasir.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:12px 32px 28px;">
                            <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
                                Berlaku {{ $promo->start_date->format('d M Y') }} sampai {{ $promo->end_date->format('d M Y') }}. Jangan lewatkan kesempatannya!
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:16px 32px 28px;border-top:1px solid rgba(11,21,38,0.08);">
                            <p style="margin:0;font-size:12px;color:#9ca3af;">Email ini dikirim otomatis oleh sistem KBKB, mohon tidak membalas email ini.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
