import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate, formatRupiah } from '@/Utils/format';

const TABS = [
    { key: 'transaction', label: 'Transaction Report' },
    { key: 'member_stats', label: 'Member Statistics' },
    { key: 'birthday', label: 'Birthday Report' },
];

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

function TabButton({ active, onClick, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                active ? 'text-ink' : 'text-slate hover:text-ink'
            }`}
        >
            {label}
            {active && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-gold" />}
        </button>
    );
}

function SectionTitle({ children }) {
    return <h2 className="font-display text-lg font-bold">{children}</h2>;
}

function EmptyRow({ colSpan, message }) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-2 py-4 text-center text-sm text-slate">
                {message}
            </td>
        </tr>
    );
}

function TransactionDetails({ transactions }) {
    return (
        <section className="card-surface overflow-x-auto p-6">
            <SectionTitle>Transaction Details</SectionTitle>
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
                    {transactions.length === 0 ? (
                        <EmptyRow colSpan={7} message="No transactions for this period." />
                    ) : (
                        transactions.map((t) => (
                            <tr key={t.id}>
                                <td className="px-2 py-2 text-slate">{formatDate(t.transacted_at)}</td>
                                <td className="px-2 py-2 font-mono text-xs">{t.transaction_number}</td>
                                <td className="px-2 py-2">{t.member?.name}</td>
                                <td className="px-2 py-2">{t.partner?.name}</td>
                                <td className="px-2 py-2 text-right">{formatRupiah(t.total_amount)}</td>
                                <td className="px-2 py-2 text-right text-sage">-{formatRupiah(t.discount_amount)}</td>
                                <td className="px-2 py-2 text-right font-bold">{formatRupiah(t.net_amount)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </section>
    );
}

function VendorReport({ data }) {
    if (data.length === 0) {
        return <p className="text-sm text-slate">No vendor transaction data for this period.</p>;
    }

    return (
        <div className="space-y-6">
            {data.map((month) => (
                <div key={month.month} className="card-surface overflow-x-auto p-6">
                    <p className="eyebrow mb-3">{month.label}</p>
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-ink/10">
                            <tr>
                                <th className="table-head px-2 py-2">Vendor</th>
                                <th className="table-head px-2 py-2 text-right">Transactions</th>
                                <th className="table-head px-2 py-2 text-right">Net Discount</th>
                                <th className="table-head px-2 py-2 text-right">Net Sales</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5">
                            {month.rows.length === 0 ? (
                                <EmptyRow colSpan={4} message="No data for this month." />
                            ) : (
                                month.rows.map((row, i) => (
                                    <tr key={i}>
                                        <td className="px-2 py-2 font-semibold">{row.partner}</td>
                                        <td className="px-2 py-2 text-right">{row.total_transactions}</td>
                                        <td className="px-2 py-2 text-right text-ember">-{formatRupiah(row.net_discount)}</td>
                                        <td className="px-2 py-2 text-right font-bold">{formatRupiah(row.net_sales)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}

function MemberReport({ data }) {
    if (data.length === 0) {
        return <p className="text-sm text-slate">No member transaction data for this period.</p>;
    }

    return (
        <div className="space-y-6">
            {data.map((month) => (
                <div key={month.month} className="card-surface overflow-x-auto p-6">
                    <p className="eyebrow mb-3">{month.label}</p>
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-ink/10">
                            <tr>
                                <th className="table-head px-2 py-2">Member</th>
                                <th className="table-head px-2 py-2">Member Code</th>
                                <th className="table-head px-2 py-2 text-right">Transactions</th>
                                <th className="table-head px-2 py-2 text-right">Total Discount</th>
                                <th className="table-head px-2 py-2 text-right">Net Sales</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5">
                            {month.rows.length === 0 ? (
                                <EmptyRow colSpan={5} message="No data for this month." />
                            ) : (
                                month.rows.map((row, i) => (
                                    <tr key={i}>
                                        <td className="px-2 py-2 font-semibold">{row.member}</td>
                                        <td className="px-2 py-2 font-mono text-xs">{row.member_code}</td>
                                        <td className="px-2 py-2 text-right">{row.total_transactions}</td>
                                        <td className="px-2 py-2 text-right text-ember">-{formatRupiah(row.total_discount)}</td>
                                        <td className="px-2 py-2 text-right font-bold">{formatRupiah(row.net_sales)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}

function MemberStatisticsTable({ data }) {
    const { months, month_labels, rows } = data;

    if (!months || months.length === 0) {
        return <p className="text-sm text-slate">No data available.</p>;
    }

    return (
        <div className="card-surface overflow-x-auto p-6">
            <SectionTitle>Laporan Statistik Member</SectionTitle>
            <table className="mt-4 w-full min-w-[48rem] text-left text-sm">
                <thead className="border-b border-ink/10">
                    <tr>
                        <th className="table-head sticky left-0 bg-paper px-3 py-2">Metric</th>
                        {month_labels.map((label, i) => (
                            <th key={months[i]} className="table-head px-3 py-2 text-right">
                                {label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                    {rows.map((row) => (
                        <tr key={row.key}>
                            <td className="sticky left-0 bg-paper px-3 py-2 font-semibold">{row.label}</td>
                            {row.values.map((value, i) => (
                                <td key={months[i]} className="px-3 py-2 text-right">
                                    {value}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function BirthdayReport({ birthdays }) {
    if (birthdays.length === 0) {
        return <p className="text-sm text-slate">No birthday data available.</p>;
    }

    return (
        <div className="space-y-6">
            {birthdays.map((group) => (
                <div key={group.month} className="card-surface overflow-x-auto p-6">
                    <p className="eyebrow mb-3">{group.month_label}</p>
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-ink/10">
                            <tr>
                                <th className="table-head px-2 py-2">Date</th>
                                <th className="table-head px-2 py-2">Member</th>
                                <th className="table-head px-2 py-2">Member Code</th>
                                <th className="table-head px-2 py-2 text-right">Age</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5">
                            {group.members.map((member) => (
                                <tr key={member.id}>
                                    <td className="px-2 py-2 font-mono text-xs">{formatDate(member.birth_date)}</td>
                                    <td className="px-2 py-2 font-semibold">{member.name}</td>
                                    <td className="px-2 py-2 font-mono text-xs">{member.member_code}</td>
                                    <td className="px-2 py-2 text-right">{member.age}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}

export default function ReportIndex({ summary, by_partner, by_member, transactions, member_stats, birthdays, filters }) {
    const filter = useForm(filters);
    const [activeTab, setActiveTab] = useState('transaction');

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

                <div className="border-b border-ink/10">
                    <div className="flex gap-2">
                        {TABS.map((tab) => (
                            <TabButton
                                key={tab.key}
                                active={activeTab === tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                label={tab.label}
                            />
                        ))}
                    </div>
                </div>

                {activeTab === 'transaction' && (
                    <div className="flex flex-col gap-8">
                        <section className="card-surface p-6">
                            <SectionTitle>Laporan Transaksi Per Vendor</SectionTitle>
                            <div className="mt-4">
                                <VendorReport data={by_partner} />
                            </div>
                        </section>

                        <section className="card-surface p-6">
                            <SectionTitle>Laporan Transaksi Per Member</SectionTitle>
                            <div className="mt-4">
                                <MemberReport data={by_member} />
                            </div>
                        </section>

                        <TransactionDetails transactions={transactions} />
                    </div>
                )}

                {activeTab === 'member_stats' && (
                    <MemberStatisticsTable data={member_stats} />
                )}

                {activeTab === 'birthday' && (
                    <section className="card-surface p-6">
                        <SectionTitle>Laporan HUT</SectionTitle>
                        <div className="mt-4">
                            <BirthdayReport birthdays={birthdays} />
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}

ReportIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
