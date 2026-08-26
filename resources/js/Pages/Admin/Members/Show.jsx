import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import Avatar from '@/Components/Avatar';
import { formatDate, formatRupiah } from '@/Utils/format';

export default function MemberShow({ member, membership, payments, transactions }) {
    return (
        <>
            <Head title={member.name} />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar src={member.avatar_url} name={member.name} tone="dark" className="h-16 w-16 rounded-2xl text-2xl shadow-card" />
                        <div>
                            <h1 className="font-display text-3xl font-bold tracking-tight">{member.name}</h1>
                            <p className="mt-1 font-mono text-sm text-slate">{member.member_code} · {member.email}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('admin.members.edit', member.id)} className="btn-ghost text-xs">Edit</Link>
                        <button
                            onClick={() => {
                                if (confirm('Delete this member?')) router.delete(route('admin.members.destroy', member.id));
                            }}
                            className="btn-danger text-xs"
                        >
                            Delete
                        </button>
                    </div>
                </header>

                <section className="grid gap-4 lg:grid-cols-3">
                    <div className="card-surface p-6 lg:col-span-1">
                        <h2 className="font-display text-lg font-bold">Membership</h2>
                        {membership ? (
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="eyebrow">Status</span>
                                    <StatusChip status={membership.status} label={membership.status === 'active' ? 'Active' : 'Inactive'} pulse={membership.status === 'active'} />
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate">Plan</span>
                                    <span className="font-semibold">{membership.plan?.name || '-'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate">Start</span>
                                    <span className="font-mono text-xs">{formatDate(membership.starts_at)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate">Valid until</span>
                                    <span className="font-mono text-xs">{formatDate(membership.expires_at)}</span>
                                </div>
                                <Link href={route('admin.members.edit', member.id)} className="btn-ink mt-4 w-full text-xs">Edit Member</Link>
                            </div>
                        ) : (
                            <p className="mt-4 text-sm text-slate">No membership yet.</p>
                        )}
                    </div>

                    <div className="card-surface p-6 lg:col-span-2">
                        <h2 className="font-display text-lg font-bold">Contact Information</h2>
                        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                            {[
                                ['Phone', member.phone || '-'],
                                ['WhatsApp', member.whatsapp || '-'],
                                ['Company', member.company || '-'],
                                ['Joined', member.created_at],
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-xl bg-paper p-3">
                                    <dt className="eyebrow">{label}</dt>
                                    <dd className="mt-1 text-sm font-medium">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>

                <section className="grid gap-8 lg:grid-cols-2">
                    <div className="card-surface p-6">
                        <h2 className="font-display text-lg font-bold">Recent Transactions</h2>
                        <div className="mt-4 space-y-3">
                            {transactions.length === 0 ? (
                                <p className="text-sm text-slate">No transactions yet.</p>
                            ) : (
                                transactions.map((t) => (
                                    <Link key={t.id} href={route('admin.transactions.show', t.id)} className="flex items-center justify-between rounded-xl border border-ink/10 p-4 transition-colors hover:bg-paper/60">
                                        <div>
                                            <p className="font-mono text-xs text-slate">{t.transaction_number}</p>
                                            <p className="text-sm font-semibold">{t.partner?.name}</p>
                                        </div>
                                        <p className="font-bold">{formatRupiah(t.net_amount)}</p>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="card-surface p-6">
                        <h2 className="font-display text-lg font-bold">Payment History</h2>
                        <div className="mt-4 space-y-3">
                            {payments.length === 0 ? (
                                <p className="text-sm text-slate">No payments yet.</p>
                            ) : (
                                payments.map((p) => (
                                    <Link key={p.id} href={route('admin.payments.show', p.id)} className="flex items-center justify-between rounded-xl border border-ink/10 p-4 transition-colors hover:bg-paper/60">
                                        <div>
                                            <p className="text-sm font-semibold">{formatRupiah(p.amount)}</p>
                                            <p className="font-mono text-xs text-slate">{formatDate(p.created_at)}</p>
                                        </div>
                                        <StatusChip status={p.status} label={p.status} />
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

MemberShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;