import { useEffect } from 'react';

export default function SlideOver({ open, onClose, title, subtitle, width = 'max-w-xl', children, footer }) {
    useEffect(() => {
        if (!open) return;

        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
            <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="absolute inset-0 animate-[fadeIn_.25s_ease] bg-ink/50 backdrop-blur-sm"
            />

            <div
                className={`absolute inset-y-0 right-0 flex w-full ${width} flex-col bg-paper shadow-2xl animate-[slideInRight_.32s_cubic-bezier(.22,1,.36,1)]`}
            >
                <header className="flex items-start justify-between gap-4 border-b border-ink/10 px-6 py-5">
                    <div>
                        <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
                        {subtitle && <p className="mt-0.5 text-sm text-slate">{subtitle}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                            <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>

                {footer && (
                    <footer className="border-t border-ink/10 bg-paper px-6 py-4">{footer}</footer>
                )}
            </div>
        </div>
    );
}