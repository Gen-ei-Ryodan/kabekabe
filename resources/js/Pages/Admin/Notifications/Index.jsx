import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import { formatDate } from '@/Utils/format';

const TYPE_LABELS = {
    promo: 'Promo',
    membership: 'Membership',
    community: 'Community',
    system: 'System',
    transaction: 'Transaction',
};

export default function NotificationIndex({ sent, members }) {
    const form = useForm({
        recipient_id: '',
        title: '',
        body: '',
        type: 'system',
        action_url: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.notifications.store'), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Notifications" />

            <div className="flex flex-col gap-8">
                <header>
                    <p className="eyebrow">Notification Center</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Send Notification</h1>
                    <p className="mt-2 text-sm text-slate">Send announcements to all members or specific members.</p>
                </header>

                <div className="grid gap-8 lg:grid-cols-5">
                    <form onSubmit={submit} className="card-surface space-y-6 p-6 lg:col-span-2">
                        <div>
                            <label className="label" htmlFor="recipient_id">Recipient</label>
                            <select id="recipient_id" className="input" value={form.data.recipient_id} onChange={(e) => form.setData('recipient_id', e.target.value)}>
                                <option value="">All members</option>
                                {members.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name} · {m.member_code}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label" htmlFor="type">Type</label>
                            <select id="type" className="input" value={form.data.type} onChange={(e) => form.setData('type', e.target.value)}>
                                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label" htmlFor="title">Title</label>
                            <input id="title" type="text" className="input" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                            {form.errors.title && <p className="mt-1 text-xs text-ember">{form.errors.title}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="body">Message body</label>
                            <textarea id="body" rows={4} className="input" value={form.data.body} onChange={(e) => form.setData('body', e.target.value)} />
                            {form.errors.body && <p className="mt-1 text-xs text-ember">{form.errors.body}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="action_url">Target URL (optional)</label>
                            <input id="action_url" type="text" className="input" value={form.data.action_url} onChange={(e) => form.setData('action_url', e.target.value)} placeholder="/member/promos" />
                        </div>
                        <button type="submit" className="btn-gold w-full" disabled={form.processing}>
                            {form.processing ? 'Sending…' : 'Send Notification'}
                        </button>
                    </form>

                    <section className="card-surface p-6 lg:col-span-3">
                        <h2 className="font-display text-lg font-bold">Sent History</h2>
                        <div className="mt-4 space-y-3">
                            {sent.length === 0 ? (
                                <p className="text-sm text-slate">No notifications sent yet.</p>
                            ) : (
                                sent.map((n) => (
                                    <div key={n.id} className="flex items-start justify-between gap-4 rounded-xl border border-ink/10 p-4">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <StatusChip status={n.read_at ? 'active' : 'inactive'} label={n.read_at ? 'Read' : 'New'} />
                                                <span className="font-mono text-[10px] text-slate">{TYPE_LABELS[n.type] || n.type}</span>
                                            </div>
                                            <p className="mt-1 truncate font-semibold">{n.title}</p>
                                            <p className="line-clamp-2 text-sm text-slate">{n.body}</p>
                                            <p className="mt-1 text-xs text-slate-soft">
                                                {n.user?.name} ({n.user?.member_code}) · {formatDate(n.created_at, true)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

NotificationIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;