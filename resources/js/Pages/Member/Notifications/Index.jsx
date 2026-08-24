import { Head, router } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import { formatDate } from '@/Utils/format';

const TYPE_LABEL = {
    membership: 'Membership',
    promo: 'Promo',
    community: 'Community',
    transaction: 'Transaction',
    system: 'System',
};

export default function NotificationIndex({ notifications }) {
    const open = (notification) => {
        router.post(route('member.notifications.read', notification.id), {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Notifications" />

            <div className="flex flex-col gap-8">
                <header className="flex items-end justify-between gap-4">
                    <div>
                        <p className="eyebrow">Notifications</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Your messages</h1>
                    </div>
                    <button onClick={() => router.post(route('member.notifications.read-all'), {}, { preserveScroll: true })} className="btn-ghost text-xs">
                        Mark all as read
                    </button>
                </header>

                {notifications.data.length === 0 ? (
                    <EmptyState title="No notifications" description="Notifications about membership, promos, and community will appear here." />
                ) : (
                    <div className="space-y-2">
                        {notifications.data.map((notification) => (
                            <button
                                key={notification.id}
                                onClick={() => open(notification)}
                                className={`block w-full rounded-2xl border p-5 text-left transition-colors ${
                                    notification.read_at
                                        ? 'border-ink/10 bg-white/60'
                                        : 'border-gold/30 bg-white shadow-lift'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        {!notification.read_at && <span className="h-2 w-2 rounded-full bg-gold" />}
                                        <span className="chip border border-ink/10 bg-ink/5 text-slate">
                                            {TYPE_LABEL[notification.type] || 'Info'}
                                        </span>
                                    </div>
                                    <span className="font-mono text-[10px] text-slate-soft">{formatDate(notification.created_at, true)}</span>
                                </div>
                                <h3 className={`mt-3 font-display font-bold ${notification.read_at ? 'text-slate' : 'text-ink'}`}>
                                    {notification.title}
                                </h3>
                                <p className={`mt-1 text-sm ${notification.read_at ? 'text-slate-soft' : 'text-slate'}`}>{notification.body}</p>
                            </button>
                        ))}
                    </div>
                )}

                <Pagination links={notifications.links} />
            </div>
        </>
    );
}

NotificationIndex.layout = (page) => <MemberLayout>{page}</MemberLayout>;