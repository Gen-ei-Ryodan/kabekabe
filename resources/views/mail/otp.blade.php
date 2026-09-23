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
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:20px;border:1px solid rgba(11,21,38,0.08);overflow:hidden;">
                    <tr>
                        <td style="background-color:#0b1526;padding:24px 32px;">
                            <span style="font-family:'Space Grotesk',Helvetica,Arial,sans-serif;font-size:20px;font-weight:700;color:#e7c873;letter-spacing:0.08em;">KBKB</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <h1 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#0b1526;">{{ $heading }}</h1>
                            <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#4b5563;">{{ $body }}</p>

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="background-color:#f9f7f2;border:1px dashed #d9b45b;border-radius:14px;padding:20px 12px;">
                                        <span style="display:block;font-family:'JetBrains Mono',monospace;font-size:34px;font-weight:700;letter-spacing:0.35em;color:#0b1526;">{{ $code }}</span>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
                                Kode berlaku selama <strong>{{ $minutes }} menit</strong>. Jangan bagikan kode ini kepada siapa pun.
                                Jika Anda tidak meminta kode ini, abaikan email ini — tidak ada perubahan pada akun Anda.
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
