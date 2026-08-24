import { Head, useForm } from '@inertiajs/react';
import VendorLayout from '@/Layouts/VendorLayout';
import StatCard from '@/Components/StatCard';
import { formatDate, formatRupiah } from '@/Utils/format';

export default function ReportIndex({ summary, transactions, by_day, filters }) {
    const filter = useForm(filters);

    const applyFilter = (e) => {
        e.preventDefault();
        filter.get(route('vendor.reports.index'), { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Reports" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Reports</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Transaction Reports</h1>
                        <p className="mt-2 text-sm text-slate">Summary and details of benefit transactions by period.</p>
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
                    <StatCard label="Total Transactions" value={summary.total_transactions} tone="ink" />
                    <StatCard label="Total Purchase" value={formatRupiah(summary.total_amount)} tone="slate" />
                    <StatCard label="Total Discount" value={formatRupiah(summary.discount_amount)} tone="ember" />
                    <StatCard label="Net Sales" value={formatRupiah(summary.net_amount)} tone="gold" />
                </section>

                <div className="grid gap-8 lg:grid-cols-2">
                    <section className="card-surface p-6">
                        <h2 className="font-display text-lg font-bold">By Day</h2>
                        <div className="mt-4 space-y-2">
                            {by_day.length === 0 ? (
                                <p className="text-sm text-slate">No data for this period yet.</p>
                            ) : (
                                by_day.map((d) => (
                                    <div key={d.day} className="flex items-center justify-between gap-4 border-b border-ink/5 pb-2 text-sm last:border-0">
                                        <span className="font-mono text-xs">{d.day}</span>
                                        <span className="text-slate">{d.total} transactions</span>
                                        <span className="font-display font-bold">{formatRupiah(d.net)}</span>
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
                                    <th className="table-head px-2 py-2 text-right">Total</th>
                                    <th className="table-head px-2 py-2 text-right">Discount</th>
                                    <th className="table-head px-2 py-2 text-right">Net</th>
                                    <th className="table-head px-2 py-2">Note</th>
                                    <th className="table-head px-2 py-2">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/5">
                                {transactions.map((t) => (
                                    <tr key={t.id}>
                                        <td className="px-2 py-2 whitespace-nowrap text-slate">{formatDate(t.transacted_at)}</td>
                                        <td className="px-2 py-2 font-mono text-xs">{t.transaction_number}</td>
                                        <td className="px-2 py-2">
                                            <p>{t.member?.name}</p>
                                            <p className="font-mono text-[11px] text-slate">{t.member?.member_code}</p>
                                        </td>
                                        <td className="px-2 py-2 text-right whitespace-nowrap">{formatRupiah(t.total_amount)}</td>
                                        <td className="px-2 py-2 text-right text-sage">
                                            -{formatRupiah(t.discount_amount)}
                                            {t.discount_percent != null && <span className="ml-1 text-[11px]">({Number(t.discount_percent)}%)</span>}
                                        </td>
                                        <td className="px-2 py-2 text-right font-bold whitespace-nowrap">{formatRupiah(t.net_amount)}</td>
                                        <td className="max-w-[160px] truncate px-2 py-2 text-slate" title={t.note}>{t.note || '-'}</td>
                                        <td className="px-2 py-2">
                                            {t.proof_url ? (
                                                <a href={t.proof_url} target="_blank" rel="noreferrer" className="text-gold-deep underline underline-offset-2">View</a>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>
            </div>
        </>
    );
}

ReportIndex.layout = (page) => <VendorLayout>{page}</VendorLayout>;