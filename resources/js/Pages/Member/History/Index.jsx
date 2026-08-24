import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import MemberLayout from '@/Layouts/MemberLayout';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import StatusChip from '@/Components/StatusChip';
import Reveal from '@/Components/Reveal';
import { formatDate, formatRupiah } from '@/Utils/format';

const TABS = [
    { key: 'payments', label: 'Payments' },
    { key: 'usage', label: 'Usage' },
];

export default function HistoryIndex({ payments, transactions, total_benefit, membership }) {
    const [tab, setTab] = useState(
        () => new URLSearchParams(window.location.search).get('tab') === 'usage' ? 'usage' : 'payments',
    );

    const switchTab = (next) => {
        setTab(next);
        router.get(
            route('member.history.index'),
            { tab: next === 'payments' ? undefined : next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const paymentList = Array.isArray(payments) ? payments : payments?.data ?? [];
    const transactionList = Array.isArray(transactions) ? transactions : transactions?.data ?? [];

    return (
        <>
            <Head title="History" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="eyebrow">History</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Membership activity</h1>
                        <p className="mt-2 text-sm text-slate">Payments and benefits used across partner stores.</p>
                    </div>
                    <div className="inline-flex w-fit rounded-full border border-ink/10 bg-white/70 p-1">
                        {TABS.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => switchTab(t.key)}
                                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                                    tab === t.key ? 'bg-ink text-paper' : 'text-slate hover:text-ink'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </header>

                {tab === 'payments' ? (
                    <>
                        <Reveal>
                            <div className="card-surface flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 sm:px-6">
                                <span className="text-sm text-slate">Current status:</span>
                                <StatusChip status={membership?.status} label={membership?.status_label} pulse />
                                {membership?.expires_at && (
                                    <span className="text-sm text-slate">Valid until {formatDate(membership.expires_at)}</span>
                                )}
                            </div>
                        </Reveal>

                        {paymentList.length === 0 ? (
                            <EmptyState title="No payments yet" description="Your membership payments will appear here." />
                        ) : (
                            <div className="space-y-3">
                                {paymentList.map((payment, i) => (
                                    <Reveal key={payment.id} delay={i * 0.04}>
                                        <div className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-mono text-xs font-semibold text-slate">
                                                        {payment.invoice_number}
                                                    </span>
                                                    <span className="font-mono text-[10px] uppercase tracking-wide text-slate-soft">
                                                        {formatDate(payment.paid_at || payment.created_at, true)}
                                                    </span>
                                                </div>
                                                <p className="mt-1 font-display text-lg font-bold">
                                                    {formatRupiah(payment.amount)}
                                                </p>
                                            </div>
                                            <StatusChip status={payment.status} label={payment.status_label} />
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        )}

                        <Pagination links={payments?.links} />
                    </>
                ) : (
                    <>
                        <Reveal>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="max-w-lg text-sm text-slate">
                                    Benefits received from partner transactions.
                                </p>
                                <div className="rounded-2xl border border-gold/30 bg-gold/10 px-5 py-3">
                                    <p className="eyebrow">Total benefits received</p>
                                    <p className="font-display text-2xl font-bold text-gold-deep">
                                        {formatRupiah(total_benefit)}
                                    </p>
                                </div>
                            </div>
                        </Reveal>

                        {transactionList.length === 0 ? (
                            <EmptyState
                                title="No transactions yet"
                                description="Visit a partner and show your digital card to start enjoying benefits."
                            />
                        ) : (
                            <div className="space-y-3">
                                {transactionList.map((transaction, i) => (
                                    <Reveal key={transaction.id} delay={i * 0.04}>
                                        <div className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center gap-4">
                                                {transaction.partner.logo_url ? (
                                                    <img
                                                        src={transaction.partner.logo_url}
                                                        alt={transaction.partner.name}
                                                        className="h-12 w-12 rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink font-display text-lg font-bold text-gold-light">
                                                        {transaction.partner.name.charAt(0)}
                                                    </span>
                                                )}
                                                <div>
                                                    <p className="font-display font-bold">{transaction.partner.name}</p>
                                                    <p className="font-mono text-xs text-slate">
                                                        {formatDate(transaction.transacted_at, true)}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-slate-soft">
                                                        {transaction.transaction_number}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 text-right sm:min-w-[280px]">
                                                <div>
                                                    <p className="eyebrow">Total Spend</p>
                                                    <p className="mt-0.5 text-sm font-semibold">
                                                        {formatRupiah(transaction.total_amount)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="eyebrow">Discount</p>
                                                    <p className="mt-0.5 text-sm font-semibold text-sage">
                                                        -{formatRupiah(transaction.discount_amount)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="eyebrow">Net</p>
                                                    <p className="mt-0.5 text-sm font-bold text-ink">
                                                        {formatRupiah(transaction.net_amount)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        )}

                        <Pagination links={transactions?.links} />
                    </>
                )}
            </div>
        </>
    );
}

HistoryIndex.layout = (page) => <MemberLayout>{page}</MemberLayout>;
