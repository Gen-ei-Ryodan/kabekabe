import { Link } from '@inertiajs/react';
import AppLogo from '@/Components/AppLogo';
import LanguageSwitcher from '@/Components/LanguageSwitcher';

export default function GuestLayout({ children, maxWidth = 'max-w-md' }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-paper px-4 py-10 sm:justify-center">
            <div className="relative mb-6 flex w-full max-w-3xl items-center justify-between">
                <Link href="/" className="group">
                    <AppLogo className="h-9 w-auto transition-transform group-hover:scale-105" />
                </Link>
                <LanguageSwitcher />
            </div>

            <div className={`w-full ${maxWidth}`}>
                <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-white/85 p-8 shadow-card backdrop-blur-sm">
                    <div className="relative">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}