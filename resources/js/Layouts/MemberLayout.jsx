import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLogo from '@/Components/AppLogo';
import FlashMessages from '@/Components/FlashMessages';
import ScrollHint from '@/Components/ScrollHint';

const NAV = [
    { name: 'Home', route: 'member.home' },
    { name: 'History', route: 'member.history.index' },
    { name: 'Partner', route: 'member.partners.index' },
    { name: 'Notification', route: 'member.notifications.index', badge: true },
    { name: 'Profile', route: 'member.account.edit' },
];

export default function MemberLayout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const unread = usePage().props.auth?.user?.notifications_unread ?? 0;

    const logout = () => router.post(route('logout'));

    const UnreadBadge = ({ value }) =>
        value > 0 ? (
            <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 font-mono text-[10px] font-bold leading-none text-white">
                {value > 9 ? '9+' : value}
            </span>
        ) : null;

    return (
        <div className="min-h-screen">
            <FlashMessages />

            <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <Link href={route('member.home')} className="shrink-0">
                        <AppLogo />
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex">
                        {NAV.map((item) => (
                            <Link
                                key={item.route}
                                href={route(item.route)}
                                className="rounded-full px-4 py-2 text-sm font-medium text-slate transition-colors hover:bg-ink/5 hover:text-ink"
                            >
                                {item.name}
                                {item.badge && <UnreadBadge value={unread} />}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={logout}
                            className="hidden rounded-full px-3 py-2 text-sm font-medium text-slate hover:bg-ember/10 hover:text-ember md:block"
                        >
                            Logout
                        </button>

                        <button
                            onClick={() => setMobileOpen((v) => !v)}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-white/70 md:hidden"
                            aria-label="Menu"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                                {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                            </svg>
                        </button>
                    </div>
                </div>

                {mobileOpen && (
                    <nav className="border-t border-ink/10 bg-paper px-4 py-3 md:hidden">
                        <div className="grid gap-1">
                            {NAV.map((item) => (
                                <Link
                                    key={item.route}
                                    href={route(item.route)}
                                    className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-ink hover:bg-ink/5"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {item.name}
                                    {item.badge && <UnreadBadge value={unread} />}
                                </Link>
                            ))}

                            <button
                                onClick={logout}
                                className="rounded-xl px-4 py-3 text-left text-sm font-medium text-ember hover:bg-ember/10"
                            >
                                Logout
                            </button>
                        </div>
                    </nav>
                )}
            </header>

            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>

            <ScrollHint />

            <footer className="border-t border-ink/10 py-8">
                <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center sm:px-6">
                    <AppLogo className="h-6 w-auto" />
                    <p className="text-xs text-slate">One card. One community.</p>
                </div>
            </footer>
        </div>
    );
}
