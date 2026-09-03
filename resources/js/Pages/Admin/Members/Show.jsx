import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import Avatar from '@/Components/Avatar';
import { formatDate, formatRupiah, daysUntil } from '@/Utils/format';

export default function MemberShow({ member, membership, payments, transactions }) {
    const daysLeft = membership?.expires_at ? daysUntil(membership.expires_at) : null;
    const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;

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
                        <div className="flex items-center justify-between">
                            <h2 className="font-display text-lg font-bold">Membership</h2>
                            {membership && (
                                <StatusChip status={membership.status} label={membership.status === 'active' ? 'Active' : 'Inactive'} pulse={membership.status === 'active'} />
                            )}
                        </div>

                        {membership ? (
                            <div className="mt-4 space-y-3">
                                <div className="rounded-xl bg-paper p-3">
                                    <dt className="eyebrow">Current Plan</dt>
                                    <dd className="mt-1 text-sm font-bold">{membership.plan?.name || '-'}</dd>
                                    {membership.plan?.duration_months && (
                                        <dd className="text-xs text-slate">{membership.plan.duration_months} months · {formatRupiah(membership.plan?.price)}</dd>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl bg-paper p-3">
                                        <dt className="eyebrow">Started</dt>
                                        <dd className="mt-1 font-mono text-xs">{formatDate(membership.started_at)}</dd>
                                    </div>
                                    <div className="rounded-xl bg-paper p-3">
                                        <dt className="eyebrow">Valid Until</dt>
                                        <dd className="mt-1 font-mono text-xs">{formatDate(membership.expires_at)}</dd>
                                    </div>
                                </div>
                                {daysLeft !== null && (
                                    <div className={`rounded-xl p-3 ${isExpiringSoon ? 'bg-amber-50 border border-amber-200' : 'bg-paper'}`}>
                                        <dt className={`eyebrow ${isExpiringSoon ? 'text-amber-700' : ''}`}>Days Remaining</dt>
                                        <dd className={`mt-1 font-mono text-sm font-bold ${isExpiringSoon ? 'text-amber-700' : ''}`}>
                                            {daysLeft >= 0 ? `${daysLeft} days` : 'Expired'}
                                        </dd>
                                    </div>
                                )}
                                <Link
                                    href={route('admin.payments.create')}
                                    method="get"
                                    data={{ member_id: member.id }}
                                    className="btn-gold mt-4 flex w-full items-center justify-center gap-2 text-xs"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Record Payment
                                </Link>
                                <Link href={route('admin.members.edit', member.id)} className="btn-ink flex w-full justify-center text-xs">Edit Member</Link>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                <p className="text-sm text-slate">No membership yet.</p>
                                <Link
                                    href={route('admin.payments.create')}
                                    method="get"
                                    data={{ member_id: member.id }}
                                    className="btn-gold flex w-full items-center justify-center gap-2 text-xs"
                                >
                                    Create Membership
                                </Link>
                            </div>
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
                        <div className="flex items-center justify-between">
                            <h2 className="font-display text-lg font-bold">Payment History</h2>
                            <Link href={route('admin.payments.index')} className="text-xs font-medium text-gold hover:underline">View All</Link>
                        </div>
                        <div className="mt-4 space-y-3">
                            {payments.length === 0 ? (
                                <p className="text-sm text-slate">No payments yet.</p>
                            ) : (
                                payments.map((p) => (
                                    <Link key={p.id} href={route('admin.payments.show', p.id)} className="flex items-center justify-between rounded-xl border border-ink/10 p-4 transition-colors hover:bg-paper/60">
                                        <div>
                                            <p className="text-sm font-semibold">{formatRupiah(p.amount)}</p>
                                            <p className="font-mono text-xs text-slate">{p.plan?.name || '-'} · {formatDate(p.created_at)}</p>
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