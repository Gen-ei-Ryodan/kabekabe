import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatCard from '@/Components/StatCard';
import { formatRupiah, formatDate } from '@/Utils/format';

function MonthRow({ label, data }) {
    return (
        <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
            <p className="eyebrow">{label}</p>
            <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
                <div>
                    <p className="text-xs text-slate">Transaksi</p>
                    <p className="font-display text-lg font-bold">{data.total_transactions}</p>
                </div>
                <div>
                    <p className="text-xs text-slate">Penjualan Bersih</p>
                    <p className="font-display text-lg font-bold">{formatRupiah(data.net_sales)}</p>
                </div>
                <div>
                    <p className="text-xs text-slate">Promo Bersih</p>
                    <p className="font-display text-lg font-bold text-ember">{formatRupiah(data.net_promos)}</p>
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard({ stats, recent_transactions }) {
    const quickLinks = [
        { label: 'Tinjau promo', value: stats.pending_promos, href: route('admin.promos.index', { status: 'pending' }), tone: 'ember' },
        { label: 'Verifikasi pembayaran', value: stats.pending_payments, href: route('admin.payments.index', { status: 'pending' }), tone: 'gold' },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-8">
                <header>
                    <p className="eyebrow">Administrasi</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="mt-2 text-sm text-slate">Ringkasan aktivitas di seluruh ekosistem platform.</p>
                </header>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Total Member" value={stats.total_members} tone="ink" sub={`${stats.active_members} aktif · ${stats.inactive_members} tidak aktif`} />
                    <StatCard label="Kadaluarsa Bulan Depan" value={stats.expired_next_month} tone="ember" sub={`${stats.expired_next_2_months} dalam 2 bulan`} />
                    <StatCard label="Partner" value={stats.total_partners} tone="paper" sub={`${stats.total_vendors} vendor`} />
                    <StatCard label="Total Promo" value={stats.total_promos} tone="paper" sub={`${stats.active_promos} Aktif`} />
                </section>

                <section className="grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
                    {quickLinks.map((link) => (
                        <Link key={link.label} href={link.href} className="card-surface flex items-center justify-between p-5 transition-all hover:-translate-y-0.5 hover:shadow-card">
                            <div>
                                <p className="eyebrow">{link.label}</p>
                                <p className="mt-1 font-display text-3xl font-bold">{link.value}</p>
                            </div>
                            <span className="text-2xl">→</span>
                        </Link>
                    ))}

                    <div className="card-surface p-5">
                        <p className="eyebrow">Status Besok</p>
                        <p className="mt-1 font-display text-lg">
                            <span className="font-bold text-sage">{stats.tomorrow_active} aktif</span>
                            {' · '}
                            <span className="font-bold text-ember">{stats.tomorrow_non_active} tidak aktif</span>
                        </p>
                    </div>
                </section>

                <section className="card-surface p-6">
                    <p className="eyebrow">Ringkasan Transaksi & Promo</p>
                    <h2 className="mt-1 font-display text-lg font-bold">Total Transaksi · Penjualan Bersih · Promo Bersih</h2>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-ink/10 bg-paper p-4">
                            <p className="eyebrow">Total Transaksi</p>
                            <p className="mt-1 font-display text-2xl font-bold">{stats.total_transactions}</p>
                        </div>
                        <div className="rounded-2xl border border-ink/10 bg-paper p-4">
                            <p className="eyebrow">Penjualan Bersih</p>
                            <p className="mt-1 font-display text-2xl font-bold text-gold-deep">{formatRupiah(stats.net_sales)}</p>
                        </div>
                        <div className="rounded-2xl border border-ink/10 bg-paper p-4">
                            <p className="eyebrow">Promo Bersih</p>
                            <p className="mt-1 font-display text-2xl font-bold text-ember">{formatRupiah(stats.net_promos)}</p>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <MonthRow label="Bulan Ini" data={stats.this_month} />
                        <MonthRow label="Bulan Lalu" data={stats.last_month} />
                        <MonthRow label="2 Bulan Lalu" data={stats.two_months_ago} />
                    </div>

                    <div className="mt-5 rounded-2xl border border-ink/10 bg-paper p-4">
                        <p className="eyebrow">Total Diskon Diberikan</p>
                        <p className="mt-1 font-display text-2xl font-bold text-ember">{formatRupiah(stats.total_discount)}</p>
                    </div>
                </section>

                <section className="card-surface p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-display text-lg font-bold">Transaksi Terkini</h2>
                        <Link href={route('admin.transactions.index')} className="text-sm font-medium text-gold-deep">Lihat semua →</Link>
                    </div>

                    <div className="space-y-3">
                        {recent_transactions.length === 0 ? (
                            <p className="text-sm text-slate">Belum ada transaksi tercatat.</p>
                        ) : (
                            recent_transactions.map((t) => (
                                <Link key={t.id} href={route('admin.transactions.show', t.id)} className="flex items-center justify-between gap-4 rounded-xl border border-ink/10 bg-paper p-4 transition-colors hover:bg-paper/60">
                                    <div className="min-w-0">
                                        <p className="font-mono text-xs text-slate">{t.transaction_number}</p>
                                        <p className="truncate text-sm font-semibold">{t.member?.name} · {t.partner?.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{formatRupiah(t.net_amount)}</p>
                                        <p className="text-xs text-slate">{formatDate(t.transacted_at)}</p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}

AdminDashboard.layout = (page) => <AdminLayout>{page}</AdminLayout>;
