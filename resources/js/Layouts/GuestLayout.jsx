import { Link } from '@inertiajs/react';
import AppLogo from '@/Components/AppLogo';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-paper px-4 py-10 sm:justify-center">
            <Link href="/" className="group mb-6">
                <AppLogo className="h-9 w-auto transition-transform group-hover:scale-105" />
            </Link>

            <div className="w-full max-w-md">
                <div className="card-surface rounded-2xl border border-ink/10 p-8 shadow-card">
                    {children}
                </div>

                <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-slate">
                    One card. One community.
                </p>
            </div>
        </div>
    );
}