export default function AppLogo({ dark = false, className = 'h-8 w-auto' }) {
    return (
        <span className={`inline-flex items-center gap-2 ${className}`}>
            <svg viewBox="0 0 32 32" fill="none" className="h-full" aria-hidden="true">
                <rect width="32" height="32" rx="8" className={dark ? 'fill-gold' : 'fill-ink'} />
                <path
                    d="M10 8h3v6l6-6h4l-7 7.5L23 24h-4l-6-7v7h-3V8Z"
                    fill={dark ? '#0B1526' : '#F5F2EB'}
                />
            </svg>
            <span className={`font-display text-xl font-700 font-bold tracking-tight ${dark ? 'text-ink' : 'text-ink'}`}>
                KBKB
            </span>
        </span>
    );
}
