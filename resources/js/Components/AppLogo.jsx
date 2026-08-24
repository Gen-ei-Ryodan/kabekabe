export default function AppLogo({ dark = false, className = 'h-8 w-auto' }) {
    return (
        <span className={`inline-flex items-center gap-2 ${className}`}>
            <svg viewBox="0 0 32 32" fill="none" className="h-full" aria-hidden="true">
                <rect width="32" height="32" rx="8" className={dark ? 'fill-gold' : 'fill-ink'} />
                <path
                    d="M9 23V9h4.6c2.6 0 4.4 1.3 4.4 3.6 0 1.6-.9 2.7-2.3 3.2 1.9.3 3.1 1.8 3.1 3.9 0 2.5-1.9 3.3-3.5 3.3H9Zm4.1-7.6h.5c1 0 1.7-.5 1.7-1.4 0-.9-.7-1.4-1.7-1.4h-.5v2.8Zm0 4.9h.5c1.1 0 1.9-.5 1.9-1.5 0-1-.8-1.5-1.9-1.5h-.5v3Z"
                    fill={dark ? '#0B1526' : '#F5F2EB'}
                />
            </svg>
            <span className={`font-display text-xl font-700 font-bold tracking-tight ${dark ? 'text-ink' : 'text-ink'}`}>
                SENTRA
            </span>
        </span>
    );
}