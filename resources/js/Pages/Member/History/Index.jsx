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
    { key: 'attendance', label: 'Attendance' },
];

export default function HistoryIndex({ payments, transactions, total_benefit, total_payment_made, attendances, membership }) {
    const [tab, setTab] = useState(
        () => {
            const urlTab = new URLSearchParams(window.location.search).get('tab');
            if (urlTab === 'usage' || urlTab === 'attendance') return urlTab;
            return 'payments';
        },
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
    const attendanceList = Array.isArray(attendances) ? attendances : attendances?.data ?? [];

    return (
        <>
            <Head title="History" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="font-display text-3xl font-bold tracking-tight">History</h1>
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
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="card-surface flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 sm:px-6">
                                    <span className="text-sm text-slate">Current status:</span>
                                    <StatusChip status={membership?.status} label={membership?.status_label} pulse />
                                    {membership?.expires_at && (
                                        <span className="text-sm text-slate">Valid until {formatDate(membership.expires_at)}</span>
                                    )}
                                </div>
                                <div className="rounded-2xl border border-gold/30 bg-gold/10 px-5 py-3">
                                    <p className="eyebrow">Total Payment Made</p>
                                    <p className="font-display text-2xl font-bold text-gold-deep">
                                        {formatRupiah(total_payment_made || 0)}
                                    </p>
                                </div>
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
                                                {payment.event && (
                                                    <p className="mt-1 text-xs text-slate">
                                                        <span className="font-mono text-[10px] uppercase tracking-wide text-gold-deep">Urunan Kegiatan</span>
                                                        {' · '}
                                                        {payment.event.title}
                                                    </p>
                                                )}
                                            </div>
                                            <StatusChip status={payment.status} label={payment.status_label} />
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        )}

                        <Pagination links={payments?.links} />
                    </>
                ) : tab === 'usage' ? (
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

                                            <div className="grid grid-cols-3 gap-x-3 gap-y-2 text-left min-w-0 sm:min-w-[280px] sm:gap-4 sm:text-right">
                                                <div className="min-w-0">
                                                    <p className="eyebrow">Total Spend</p>
                                                    <p className="mt-0.5 text-xs font-semibold sm:text-sm">
                                                        {formatRupiah(transaction.total_amount)}
                                                    </p>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="eyebrow">Discount</p>
                                                    <p className="mt-0.5 text-xs font-semibold text-sage sm:text-sm">
                                                        -{formatRupiah(transaction.discount_amount)}
                                                    </p>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="eyebrow">Net</p>
                                                    <p className="mt-0.5 text-xs font-bold text-ink sm:text-sm">
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
                ) : (
                    <>
                        <Reveal>
                            <div className="flex flex-col gap-2">
                                <p className="eyebrow">Event Attendance</p>
                                <h2 className="font-display text-2xl font-bold tracking-tight">Kehadiran Acara</h2>
                                <p className="text-sm text-slate">
                                    History absensi event/kegiatan yang Anda hadiri.
                                </p>
                            </div>
                        </Reveal>

                        {attendanceList.length === 0 ? (
                            <EmptyState
                                title="Belum ada attendance"
                                description="Scan QR member Anda di event untuk mulai tercatat."
                            />
                        ) : (
                            <div className="space-y-3">
                                {attendanceList.map((a, i) => (
                                    <Reveal key={a.id} delay={i * 0.04}>
                                        <div className="card-surface flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0">
                                                <p className="font-display text-lg font-bold text-ink">
                                                    {a.event_title || '—'}
                                                </p>
                                                <p className="mt-1 font-mono text-xs text-slate">
                                                    {a.event_date}
                                                    {a.event_location ? ` · ${a.event_location}` : ''}
                                                </p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <span className="chip border border-sage/40 bg-sage/20 text-sage">
                                                    <span className="relative flex h-1.5 w-1.5">
                                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                                                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                                                    </span>
                                                    Hadir
                                                </span>
                                                <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-slate-soft">
                                                    {a.scanned_at_human || a.scanned_at}
                                                </p>
                                            </div>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

HistoryIndex.layout = (page) => <MemberLayout>{page}</MemberLayout>;
