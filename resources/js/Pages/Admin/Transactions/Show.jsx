import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate, formatRupiah } from '@/Utils/format';

export default function TransactionShow({ transaction }) {
    return (
        <>
            <Head title={`Transaction ${transaction.transaction_number}`} />

            <div className="mx-auto max-w-2xl">
                <header>
                    <p className="eyebrow">Transaction</p>
                    <h1 className="mt-1 font-mono text-2xl font-bold tracking-tight">{transaction.transaction_number}</h1>
                    <p className="mt-1 text-sm text-slate">{formatDate(transaction.transacted_at, true)}</p>
                </header>

                <section className="card-surface mt-8 p-6">
                    <h2 className="font-display text-lg font-bold">Transaction Details</h2>
                    <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[
                            ['Member', `${transaction.member?.name} · ${transaction.member?.member_code}`],
                            ['Company', transaction.member?.company || '-'],
                            ['Partner', transaction.partner?.name],
                            ['Category', transaction.partner?.category],
                            ['Promo', transaction.promo?.title || '-'],
                            ['Notes', transaction.note || '-'],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-xl bg-paper p-3">
                                <dt className="eyebrow">{label}</dt>
                                <dd className="mt-1 text-sm font-medium break-words">{value}</dd>
                            </div>
                        ))}
                    </dl>

                    <div className="mt-6 rounded-xl border border-ink/10 p-4">
                        <div className="flex justify-between text-sm"><span>Total purchase</span><span className="font-semibold">{formatRupiah(transaction.total_amount)}</span></div>
                        <div className="mt-1 flex justify-between text-sm text-sage"><span>Discount</span><span>-{formatRupiah(transaction.discount_amount)}</span></div>
                        <div className="mt-2 flex justify-between border-t border-ink/10 pt-2 font-display text-lg font-bold">
                            <span>Net sales</span><span>{formatRupiah(transaction.net_amount)}</span>
                        </div>
                    </div>

                    {transaction.proof_url && (
                        <div className="mt-4">
                            <a href={transaction.proof_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gold-deep">View receipt photo →</a>
                        </div>
                    )}
                </section>

                <div className="mt-8">
                    <Link href={route('admin.transactions.index')} className="text-sm font-medium text-gold-deep">← Back</Link>
                </div>
            </div>
        </>
    );
}

TransactionShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;