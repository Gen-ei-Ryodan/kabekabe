import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate, formatRupiah } from '@/Utils/format';

const RELIGION_LABELS = {
    islam: 'Islam',
    kristen: 'Kristen',
    katolik: 'Katolik',
    buddha: 'Buddha',
    hindu: 'Hindu',
    lainnya: 'Lainnya',
};

const GENDER_LABELS = {
    male: 'Pria',
    female: 'Wanita',
    other: 'Lainnya',
};

function StatBox({ label, value, tone = 'ink' }) {
    return (
        <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
            <p className="eyebrow">{label}</p>
            <p className={`mt-1 font-display text-2xl font-bold ${tone === 'gold' ? 'text-gold-deep' : tone === 'ember' ? 'text-ember' : tone === 'sage' ? 'text-sage' : 'text-ink'}`}>
                {value}
            </p>
        </div>
    );
}

function MonthTable({ title, data }) {
    if (!data || data.length === 0) return null;
    return (
        <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
            <p className="eyebrow">{title}</p>
            <table className="mt-2 w-full text-left text-xs">
                <thead>
                    <tr className="border-b border-ink/10">
                        <th className="table-head px-2 py-1">Bulan</th>
                        <th className="table-head px-2 py-1 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                    {data.map((row, i) => (
                        <tr key={i}>
                            <td className="px-2 py-1 font-mono">{row.month}</td>
                            <td className="px-2 py-1 text-right font-bold">{row.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function ReportIndex({ summary, by_partner, by_member, transactions, member_stats, filters }) {
    const filter = useForm(filters);

    const applyFilter = (e) => {
        e.preventDefault();
        filter.get(route('admin.reports.index'), { preserveState: true, replace: true });
    };

    const relig = member_stats?.religions || {};
    const gen = member_stats?.genders || {};
    const age = member_stats?.ages || {};
    const eventsByMonth = member_stats?.events_by_month || [];

    return (
        <>
            <Head title="Reports" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Reporting</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Reports</h1>
                    </div>

                    <form onSubmit={applyFilter} className="flex flex-wrap items-end gap-2">
                        <div>
                            <label className="label">From</label>
                            <input type="date" className="input" value={filter.data.from} onChange={(e) => filter.setData('from', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">To</label>
                            <input type="date" className="input" value={filter.data.to} onChange={(e) => filter.setData('to', e.target.value)} />
                        </div>
                        <button type="submit" className="btn-ink text-xs">Apply</button>
                    </form>
                </header>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatBox label="Total Transactions" value={summary.total_transactions} />
                    <StatBox label="Total Purchase" value={formatRupiah(summary.total_amount)} />
                    <StatBox label="Total Discount" value={formatRupiah(summary.discount_amount)} tone="ember" />
                    <StatBox label="Net Sales" value={formatRupiah(summary.net_amount)} tone="gold" />
                </section>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <section className="card-surface p-6">
                        <h2 className="font-display text-lg font-bold">Laporan Transaksi Per Vendor</h2>
                        <div className="mt-4 space-y-2">
                            {by_partner.length === 0 ? (
                                <p className="text-sm text-slate">No data for this period yet.</p>
                            ) : (
                                by_partner.map((d) => (
                                    <div key={d.partner} className="flex items-center justify-between gap-4 border-b border-ink/5 pb-2 text-sm last:border-0">
                                        <span className="font-semibold">{d.partner}</span>
                                        <span className="text-slate">{d.total_transactions} trans</span>
                                        <span className="text-slate">{formatRupiah(d.total_discount)} disc</span>
                                        <span className="font-display font-bold">{formatRupiah(d.net_sales)}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="card-surface p-6">
                        <h2 className="font-display text-lg font-bold">Laporan Transaksi Per Member</h2>
                        <div className="mt-4 space-y-2">
                            {by_member.length === 0 ? (
                                <p className="text-sm text-slate">No data for this period yet.</p>
                            ) : (
                                by_member.map((d) => (
                                    <div key={d.member} className="flex items-center justify-between gap-4 border-b border-ink/5 pb-2 text-sm last:border-0">
                                        <span className="font-semibold">{d.member}</span>
                                        <span className="text-slate">{d.member_code}</span>
                                        <span className="font-display font-bold">{formatRupiah(d.net_sales)}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="card-surface p-6">
                        <h2 className="font-display text-lg font-bold">Laporan HUT</h2>
                        <MonthTable title="Kehadiran Acara per Bulan" data={eventsByMonth} />
                    </section>
                </section>

                <section className="card-surface p-6">
                    <h2 className="font-display text-lg font-bold">Laporan Statistik Member</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <StatBox label="Member Terdaftar" value={member_stats?.total_registered || 0} />
                        <StatBox label="Aktif → Non Aktif" value={member_stats?.active_to_inactive || 0} tone="ember" />
                        <StatBox label="Non Aktif → Aktif" value={member_stats?.inactive_to_active || 0} tone="sage" />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
                            <p className="eyebrow">Agama</p>
                            <div className="mt-2 space-y-1 text-xs">
                                {Object.entries(RELIGION_LABELS).map(([key, label]) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <span>{label}</span>
                                        <span className="font-bold">{relig[key] || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
                            <p className="eyebrow">Gender</p>
                            <div className="mt-2 space-y-1 text-xs">
                                {Object.entries(GENDER_LABELS).map(([key, label]) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <span>{label}</span>
                                        <span className="font-bold">{gen[key] || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
                            <p className="eyebrow">Umur</p>
                            <div className="mt-2 space-y-1 text-xs">
                                {['<21', '21-30', '30-40', '40-50', '>50'].map((key) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <span>{key}</span>
                                        <span className="font-bold">{age[key] || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="card-surface overflow-x-auto p-6">
                    <h2 className="font-display text-lg font-bold">Transaction Details</h2>
                    <table className="mt-4 w-full text-left text-sm">
                        <thead className="border-b border-ink/10">
                            <tr>
                                <th className="table-head px-2 py-2">Date</th>
                                <th className="table-head px-2 py-2">No. Transaction</th>
                                <th className="table-head px-2 py-2">Member</th>
                                <th className="table-head px-2 py-2">Partner</th>
                                <th className="table-head px-2 py-2 text-right">Total</th>
                                <th className="table-head px-2 py-2 text-right">Discount</th>
                                <th className="table-head px-2 py-2 text-right">Net</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5">
                            {transactions.map((t) => (
                                <tr key={t.id}>
                                    <td className="px-2 py-2 text-slate">{formatDate(t.transacted_at)}</td>
                                    <td className="px-2 py-2 font-mono text-xs">{t.transaction_number}</td>
                                    <td className="px-2 py-2">{t.member?.name}</td>
                                    <td className="px-2 py-2">{t.partner?.name}</td>
                                    <td className="px-2 py-2 text-right">{formatRupiah(t.total_amount)}</td>
                                    <td className="px-2 py-2 text-right text-sage">-{formatRupiah(t.discount_amount)}</td>
                                    <td className="px-2 py-2 text-right font-bold">{formatRupiah(t.net_amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </>
    );
}

ReportIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;