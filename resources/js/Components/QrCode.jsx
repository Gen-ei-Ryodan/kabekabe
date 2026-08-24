import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QrCode({ value, size = 168, className = '' }) {
    const [dataUrl, setDataUrl] = useState(null);

    useEffect(() => {
        let active = true;

        QRCode.toDataURL(value, {
            width: size * 2,
            margin: 1,
            errorCorrectionLevel: 'M',
            color: { dark: '#0B1526', light: '#FFFFFF' },
        })
            .then((url) => {
                if (active) setDataUrl(url);
            })
            .catch(() => {});

        return () => {
            active = false;
        };
    }, [value, size]);

    if (!dataUrl) {
        return (
            <div
                className={`animate-pulse rounded-lg bg-white/20 ${className}`}
                style={{ width: size, height: size }}
            />
        );
    }

    return <img src={dataUrl} alt="QR Code member" width={size} height={size} className={className} />;
}