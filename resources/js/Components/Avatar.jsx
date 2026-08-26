import { useState } from 'react';

export default function Avatar({ src, name, className = '', tone = 'light' }) {
    const [failed, setFailed] = useState(false);

    const initial = name?.charAt(0)?.toUpperCase() || 'M';

    if (!src || failed) {
        return (
            <span
                className={`flex shrink-0 items-center justify-center overflow-hidden font-display font-bold ${
                    tone === 'dark' ? 'bg-gold/20 text-gold-light' : 'bg-gold/15 text-gold-deep'
                } ${className}`}
                aria-label={name}
            >
                {initial}
            </span>
        );
    }

    return (
        <img
            src={src}
            alt={name}
            onError={() => setFailed(true)}
            className={`shrink-0 object-cover ${className}`}
        />
    );
}
