import { useEffect, useState } from 'react';

export default function ScrollHint() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const check = () => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            setVisible(scrollable > 120 && window.scrollY < 40);
        };

        check();
        window.addEventListener('scroll', check, { passive: true });
        window.addEventListener('resize', check);
        return () => {
            window.removeEventListener('scroll', check);
            window.removeEventListener('resize', check);
        };
    }, []);

    if (!visible) return null;

    return (
        <div
            className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center"
            aria-hidden="true"
        >
            <div className="flex flex-col items-center gap-0.5 rounded-full border border-ink/10 bg-paper/90 px-3 py-1.5 shadow-lift backdrop-blur-sm">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink/50">Scroll</span>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4 animate-bounce text-gold-deep"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>
        </div>
    );
}
