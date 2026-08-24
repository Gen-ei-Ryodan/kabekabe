import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate, formatRupiah } from '@/Utils/format';

export default function ReportIndex({ summary, by_partner, transactions, filters }) {
    const filter = useForm(filters);

    const applyFilter = (e) => {
        e.preventDefault();
        filter.get(route('admin.reports.index'), { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Reports" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Reporting</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Transaction Reports</h1>
                        <p className="mt-2 text-sm text-slate">Summary of transactions from all partners by period.</p>
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
                    <div className="rounded-2xl bg-ink p-5 text-paper shadow-lift">
                        <p className="font-mono text-[11px] uppercase tracking-widest opacity-70">Total Transactions</p>
                        <p className="mt-2 font-display text-2xl font-bold">{summary.total_transactions}</p>
                    </div>
                    <div className="card-surface p-5">
                        <p className="eyebrow">Total Purchase</p>
                        <p className="mt-2 font-display text-2xl font-bold">{formatRupiah(summary.total_amount)}</p>
                    </div>
                    <div className="card-surface p-5">
                        <p className="eyebrow">Total Discount</p>
                        <p className="mt-2 font-display text-2xl font-bold text-ember">{formatRupiah(summary.discount_amount)}</p>
                    </div>
                    <div className="card-surface border-gold/30 bg-gold/10 p-5">
                        <p className="eyebrow">Net Sales</p>
                        <p className="mt-2 font-display text-2xl font-bold text-gold-deep">{formatRupiah(summary.net_amount)}</p>
                    </div>
                </section>

                <section className="card-surface p-6">
                    <h2 className="font-display text-lg font-bold">By Partner</h2>
                    <div className="mt-4 space-y-2">
                        {by_partner.length === 0 ? (
                            <p className="text-sm text-slate">No data for this period yet.</p>
                        ) : (
                            by_partner.map((d) => (
                                <div key={d.partner} className="flex items-center justify-between gap-4 border-b border-ink/5 pb-2 text-sm last:border-0">
                                    <span className="font-semibold">{d.partner}</span>
                                    <span className="text-slate">{d.total_transactions} transactions</span>
                                    <span className="text-slate">{formatRupiah(d.total_discount)} discount</span>
                                    <span className="font-display font-bold">{formatRupiah(d.net_sales)}</span>
                                </div>
                            ))
                        )}
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