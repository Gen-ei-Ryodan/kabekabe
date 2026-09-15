import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusChip from '@/Components/StatusChip';
import { formatDate, formatRupiah } from '@/Utils/format';

export default function PartnerShow({ partner, transactions, promos }) {
    return (
        <>
            <Head title={partner.name} />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        {partner.logo_url ? (
                            <img src={partner.logo_url} alt={partner.name} className="h-16 w-16 rounded-2xl object-cover shadow-card" />
                        ) : (
                            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink font-display text-2xl font-bold text-gold-light shadow-card">
                                {partner.name.charAt(0)}
                            </span>
                        )}
                        <div>
                            <h1 className="font-display text-3xl font-bold tracking-tight">{partner.name}</h1>
                            <p className="mt-1 text-sm text-slate">{partner.category} · {partner.user?.email}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('admin.partners.index')} className="btn-ghost text-xs">Back</Link>
                        <button
                            onClick={() => router.put(route('admin.partners.toggle', partner.id), { is_active: !partner.is_active }, { preserveScroll: true })}
                            className="btn-ghost text-xs"
                        >
                            {partner.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('Delete this partner?')) router.delete(route('admin.partners.destroy', partner.id));
                            }}
                            className="btn-danger text-xs"
                        >
                            Delete
                        </button>
                    </div>
                </header>

                <section className="grid gap-4 lg:grid-cols-3">
                    <div className="card-surface p-6 lg:col-span-1">
                        <h2 className="font-display text-lg font-bold">Status</h2>
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="eyebrow">Status</span>
                                <StatusChip status={partner.is_active ? 'active' : 'inactive'} label={partner.is_active ? 'Active' : 'Inactive'} pulse={partner.is_active} />
                            </div>
                            {partner.user && (
                                <div className="rounded-xl bg-paper p-3">
                                    <dt className="eyebrow">Vendor Account</dt>
                                    <dd className="mt-1 text-sm font-medium">{partner.user.email}</dd>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card-surface p-6 lg:col-span-2">
                        <h2 className="font-display text-lg font-bold">Company Information</h2>
                        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                            {[
                                ['Company Name', partner.name],
                                ['Address', partner.address || '-'],
                                ['Phone', partner.phone || '-'],
                                ['Email', partner.email || '-'],
                                ['Industry', partner.industry || '-'],
                                ['Employee Count', partner.employee_count || '-'],
                                ['Established Since', partner.established_since || '-'],
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-xl bg-paper p-3">
                                    <dt className="eyebrow">{label}</dt>
                                    <dd className="mt-1 text-sm font-medium">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-3">
                    <div className="card-surface p-6 lg:col-span-1">
                        <h2 className="font-display text-lg font-bold">PIC (Person In Charge)</h2>
                        <dl className="mt-4 space-y-3">
                            <div className="rounded-xl bg-paper p-3">
                                <dt className="eyebrow">Name</dt>
                                <dd className="mt-1 text-sm font-medium">{partner.pic_name || '-'}</dd>
                            </div>
                            <div className="rounded-xl bg-paper p-3">
                                <dt className="eyebrow">Phone</dt>
                                <dd className="mt-1 text-sm font-medium">{partner.pic_phone || '-'}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="card-surface p-6 lg:col-span-2">
                        <h2 className="font-display text-lg font-bold">Additional Information</h2>
                        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl bg-paper p-3">
                                <dt className="eyebrow">Is Member</dt>
                                <dd className="mt-1 text-sm font-medium">{partner.is_member ? 'Yes' : 'No'}</dd>
                            </div>
                            {partner.is_member && partner.member_code && (
                                <div className="rounded-xl bg-paper p-3">
                                    <dt className="eyebrow">Member Code</dt>
                                    <dd className="mt-1 text-sm font-medium font-mono">{partner.member_code}</dd>
                                </div>
                            )}
                            <div className="rounded-xl bg-paper p-3">
                                <dt className="eyebrow">Date of Birth</dt>
                                <dd className="mt-1 text-sm font-medium">{partner.date_of_birth ? formatDate(partner.date_of_birth) : '-'}</dd>
                            </div>
                        </dl>
                    </div>
                </section>

                {partner.hobbies && partner.hobbies.length > 0 && (
                    <section className="card-surface p-6">
                        <h2 className="font-display text-lg font-bold">Hobbies</h2>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {partner.hobbies.map((hobby, index) => (
                                <span key={index} className="rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink">
                                    {hobby}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {partner.description && (
                    <section className="card-surface p-6">
                        <h2 className="font-display text-lg font-bold">Description</h2>
                        <p className="mt-4 text-sm text-slate whitespace-pre-wrap">{partner.description}</p>
                    </section>
                )}

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
                                            <p className="text-sm font-semibold">{t.member?.name}</p>
                                        </div>
                                        <p className="font-bold">{formatRupiah(t.net_amount)}</p>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="card-surface p-6">
                        <h2 className="font-display text-lg font-bold">Promos</h2>
                        <div className="mt-4 space-y-3">
                            {promos.length === 0 ? (
                                <p className="text-sm text-slate">No promos yet.</p>
                            ) : (
                                promos.map((promo) => (
                                    <div key={promo.id} className="flex items-center justify-between rounded-xl border border-ink/10 p-4">
                                        <div>
                                            <p className="text-sm font-semibold">{promo.title}</p>
                                            <p className="font-mono text-xs text-slate">{formatDate(promo.created_at)}</p>
                                        </div>
                                        <StatusChip status={promo.is_active ? 'active' : 'inactive'} label={promo.is_active ? 'Active' : 'Inactive'} />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

PartnerShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;
