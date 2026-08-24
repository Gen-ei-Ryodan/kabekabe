import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLogo from '@/Components/AppLogo';
import FlashMessages from '@/Components/FlashMessages';

const NAV = [
    { name: 'Dashboard', route: 'admin.dashboard', icon: '▦' },
    { name: 'Members', route: 'admin.members.index', icon: '◈' },
    { name: 'Partners', route: 'admin.partners.index', icon: '▤' },
    { name: 'Promos', route: 'admin.promos.index', icon: '◉' },
    { name: 'Home Banners', route: 'admin.banners.index', icon: '❏' },
    { name: 'Payments', route: 'admin.payments.index', icon: '⭑' },
    { name: 'Community', route: 'admin.community.index', icon: '✎' },
    { name: 'Notifications', route: 'admin.notifications.index', icon: '◌' },
    { name: 'Transactions', route: 'admin.transactions.index', icon: '⤹' },
    { name: 'Reports', route: 'admin.reports.index', icon: '⌁' },
];

export default function AdminLayout({ children }) {
    const { ziggy, auth } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    const user = auth?.user;

    const isActive = (routeName) => {
        const base = routeName.split('.').slice(0, 2).join('.');
        return ziggy?.current() === routeName || ziggy?.current()?.startsWith(`${base}.`);
    };

    return (
        <div className="min-h-screen bg-paper">
            <FlashMessages />

            <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-ink/10 bg-ink text-paper lg:flex">
                <div className="flex h-16 items-center px-6">
                    <AppLogo dark />
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                    {NAV.map((item) => (
                        <Link
                            key={item.route}
                            href={route(item.route)}
                            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                                isActive(item.route)
                                    ? 'bg-gold/15 text-gold-light'
                                    : 'text-paper/60 hover:bg-white/5 hover:text-paper'
                            }`}
                        >
                            <span className="w-5 text-center text-base">{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="border-t border-white/10 p-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 font-display text-sm font-bold text-gold-light">
                            {user?.name?.charAt(0)}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-paper">{user?.name}</p>
                            <p className="font-mono text-[10px] uppercase tracking-wider text-paper/50">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.post(route('logout'))}
                        className="mt-3 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-paper/60 hover:bg-ember/20 hover:text-ember"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-ink/10 bg-ink px-4 text-paper lg:hidden">
                <AppLogo dark />
                <button
                    onClick={() => setMobileOpen((v) => !v)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15"
                    aria-label="Menu"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                        {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                    </svg>
                </button>
            </div>

            {mobileOpen && (
                <nav className="border-b border-ink/10 bg-ink px-4 py-3 text-paper lg:hidden">
                    <div className="grid gap-1">
                        {NAV.map((item) => (
                            <Link
                                key={item.route}
                                href={route(item.route)}
                                className="rounded-xl px-4 py-3 text-sm font-medium text-paper/80 hover:bg-white/5"
                                onClick={() => setMobileOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <button
                            onClick={() => router.post(route('logout'))}
                            className="rounded-xl px-4 py-3 text-left text-sm font-medium text-ember hover:bg-ember/20"
                        >
                            Logout
                        </button>
                    </div>
                </nav>
            )}

            <main className="px-4 py-8 sm:px-6 lg:ml-60 lg:px-8">{children}</main>
        </div>
    );
}