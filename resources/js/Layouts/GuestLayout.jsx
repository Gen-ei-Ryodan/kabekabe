import { Link } from '@inertiajs/react';
import AppLogo from '@/Components/AppLogo';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-ink px-4 py-10 sm:justify-center">
            <Link href="/" className="group mb-6">
                <AppLogo className="h-9 w-auto transition-transform group-hover:scale-105" />
            </Link>

            <div className="w-full max-w-md">
                <div className="relative overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-br from-ink-soft via-ink to-ink-soft p-8 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]">
                    {/* ambient glow */}
                    <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />

                    {/* texture */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.4]"
                        style={{
                            backgroundImage:
                                'radial-gradient(rgba(201,162,39,0.15) 1px, transparent 1px)',
                            backgroundSize: '16px 16px',
                        }}
                    />

                    {/* top row */}
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gold">
                                <span className="font-display text-sm font-bold text-ink">K</span>
                            </span>
                            <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-paper">
                                KBKB
                            </span>
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-paper/50">
                            Member Card
                        </span>
                    </div>

                    <div className="relative mt-6">
                        {children}
                    </div>

                    {/* footer */}
                    <div className="relative mt-6 flex items-center justify-between border-t border-gold/20 pt-4">
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">
                            One card. One community.
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">
                            KBKB
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}