import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import TransactionDrawer from '@/Components/Admin/TransactionDrawer';
import { formatDate, formatRupiah } from '@/Utils/format';

export default function TransactionIndex({ transactions, filters, drawer }) {
    const filter = useForm(filters);

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.transactions.index'), { ...filter.data }, { preserveState: true, replace: true });
    };

    const clearFilter = () => {
        router.get(route('admin.transactions.index'), {}, { preserveState: true, replace: true });
    };

    const openShow = (id) => {
        router.get(route('admin.transactions.index'), { drawer: 'show', id }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    const closeDrawer = () => {
        router.get(route('admin.transactions.index'), { from: filters.from || undefined, to: filters.to || undefined, search: filters.search || undefined }, { only: ['drawer'], preserveState: true, preserveScroll: true });
    };

    return (
        <>
            <Head title="Transactions" />

            <div className="flex flex-col gap-8">
                <header>
                    <p className="eyebrow">Monitoring</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Benefit Transactions</h1>
                    <p className="mt-2 text-sm text-slate">Monitor all benefit transactions across every partner.</p>
                </header>

                <form onSubmit={applyFilter} className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                    <div className="grid flex-1 gap-3 sm:grid-cols-3">
                        <div>
                            <label className="label">From date</label>
                            <input type="date" className="input" value={filter.data.from || ''} onChange={(e) => filter.setData('from', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">To date</label>
                            <input type="date" className="input" value={filter.data.to || ''} onChange={(e) => filter.setData('to', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Search</label>
                            <input type="text" className="input" placeholder="No. / name / member ID" value={filter.data.search || ''} onChange={(e) => filter.setData('search', e.target.value)} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn-ink text-xs">Apply</button>
                        <button type="button" onClick={clearFilter} className="btn-ghost text-xs">Reset</button>
                    </div>
                </form>

                {transactions.data.length === 0 ? (
                    <EmptyState title="No transactions found" description="No transactions match this filter yet." />
                ) : (
                    <div className="card-surface overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-ink/10 bg-paper/60">
                                <tr>
                                    <th className="table-head px-4 py-3">No. Transaction</th>
                                    <th className="table-head px-4 py-3">Date</th>
                                    <th className="table-head px-4 py-3">Member</th>
                                    <th className="table-head px-4 py-3">Partner</th>
                                    <th className="table-head px-4 py-3 text-right">Total</th>
                                    <th className="table-head px-4 py-3 text-right">Discount</th>
                                    <th className="table-head px-4 py-3 text-right">Net</th>
                                    <th className="table-head px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/5">
                                {transactions.data.map((t) => (
                                    <tr key={t.id} className="transition-colors hover:bg-paper/50">
                                        <td className="px-4 py-3 font-mono text-xs font-semibold">{t.transaction_number}</td>
                                        <td className="px-4 py-3 text-slate">{formatDate(t.transacted_at, true)}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{t.member?.name}</p>
                                            <p className="font-mono text-[10px] text-slate">{t.member?.member_code}</p>
                                        </td>
                                        <td className="px-4 py-3">{t.partner?.name}</td>
                                        <td className="px-4 py-3 text-right">{formatRupiah(t.total_amount)}</td>
                                        <td className="px-4 py-3 text-right text-sage">-{formatRupiah(t.discount_amount)}</td>
                                        <td className="px-4 py-3 text-right font-bold">{formatRupiah(t.net_amount)}</td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => openShow(t.id)} className="text-sm font-medium text-gold-deep">View →</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination links={transactions.links} />
            </div>

            <TransactionDrawer drawer={drawer} onClose={closeDrawer} />
        </>
    );
}

TransactionIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;