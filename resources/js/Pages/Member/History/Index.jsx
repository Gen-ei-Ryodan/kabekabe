import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import MemberLayout from '@/Layouts/MemberLayout';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import StatusChip from '@/Components/StatusChip';
import Reveal from '@/Components/Reveal';
import { formatDate, formatRupiah } from '@/Utils/format';
import { useTranslation } from '@/i18n';

const TABS = [
    { key: 'payments', labelKey: 'history.tab.payments' },
    { key: 'usage', labelKey: 'history.tab.usage' },
    { key: 'attendance', labelKey: 'history.tab.attendance' },
];

export default function HistoryIndex({ payments, transactions, total_benefit, total_payment_made, attendances, membership, filters = {} }) {
    const { t } = useTranslation();

    const [tab, setTab] = useState(
        () => {
            const urlTab = new URLSearchParams(window.location.search).get('tab');
            if (urlTab === 'usage' || urlTab === 'attendance') return urlTab;
            return 'payments';
        },
    );

    const [from, setFrom] = useState(filters?.from || '');
    const [to, setTo] = useState(filters?.to || '');

    const switchTab = (next) => {
        setTab(next);
        router.get(
            route('member.history.index'),
            {
                tab: next === 'payments' ? undefined : next,
                from: from || undefined,
                to: to || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const applyDateFilter = (e) => {
        if (e) e.preventDefault();
        router.get(
            route('member.history.index'),
            {
                tab: tab === 'payments' ? undefined : tab,
                from: from || undefined,
                to: to || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const resetDateFilter = () => {
        setFrom('');
        setTo('');
        router.get(
            route('member.history.index'),
            { tab: tab === 'payments' ? undefined : tab },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const paymentList = Array.isArray(payments) ? payments : payments?.data ?? [];
    const transactionList = Array.isArray(transactions) ? transactions : transactions?.data ?? [];
    const attendanceList = Array.isArray(attendances) ? attendances : attendances?.data ?? [];

    return (
        <>
            <Head title={t('history.headTitle')} />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="font-display text-3xl font-bold tracking-tight">{t('history.title')}</h1>
                        <p className="mt-2 text-sm text-slate">{t('history.subtitle')}</p>
                    </div>
                    <div className="inline-flex w-fit rounded-full border border-ink/10 bg-white/70 p-1">
                        {TABS.map((item) => (
                            <button
                                key={item.key}
                                onClick={() => switchTab(item.key)}
                                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                                    tab === item.key ? 'bg-ink text-paper' : 'text-slate hover:text-ink'
                                }`}
                            >
                                {t(item.labelKey)}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Filter Periode Tanggal */}
                <form onSubmit={applyDateFilter} className="card-surface flex flex-wrap items-end gap-3 p-4">
                    <div className="flex-1 min-w-[140px]">
                        <label className="label text-xs mb-1">{t('history.fromDate')}</label>
                        <input
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="input text-xs py-1.5"
                        />
                    </div>
                    <div className="flex-1 min-w-[140px]">
                        <label className="label text-xs mb-1">{t('history.toDate')}</label>
                        <input
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="input text-xs py-1.5"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn-ink text-xs px-4 py-2">
                            {t('history.filter')}
                        </button>
                        {(from || to) && (
                            <button
                                type="button"
                                onClick={resetDateFilter}
                                className="btn-ghost text-xs px-3 py-2"
                            >
                                {t('history.reset')}
                            </button>
                        )}
                    </div>
                </form>

                {tab === 'payments' ? (
                    <>
                        <Reveal>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="card-surface flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 sm:px-6">
                                    <span className="text-sm text-slate">{t('history.currentStatus')}</span>
                                    <StatusChip status={membership?.status} label={membership?.status_label === 'ACTIVE' ? t('history.statusActive') : (membership?.status_label === 'INACTIVE' ? t('history.statusInactive') : membership?.status_label)} pulse />
                                    {membership?.expires_at && (
                                        <span className="text-sm text-slate">{t('history.validUntil', { date: formatDate(membership.expires_at) })}</span>
                                    )}
                                </div>
                                <div className="rounded-2xl border border-gold/30 bg-gold/10 px-5 py-3">
                                    <p className="eyebrow">{t('history.totalPayment')}</p>
                                    <p className="font-display text-2xl font-bold text-gold-deep">
                                        {formatRupiah(total_payment_made || 0)}
                                    </p>
                                </div>
                            </div>
                        </Reveal>

                        {paymentList.length === 0 ? (
                            <EmptyState title={t('history.emptyPaymentsTitle')} description={t('history.emptyPaymentsDesc')} />
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
                                                            <span className="font-mono text-[10px] uppercase tracking-wide text-gold-deep">{t('history.eventContribution')}</span>
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
                                    {t('history.usageDesc')}
                                </p>
                                <div className="rounded-2xl border border-gold/30 bg-gold/10 px-5 py-3">
                                    <p className="eyebrow">{t('history.totalBenefit')}</p>
                                    <p className="font-display text-2xl font-bold text-gold-deep">
                                        {formatRupiah(total_benefit)}
                                    </p>
                                </div>
                            </div>
                        </Reveal>

                        {transactionList.length === 0 ? (
                            <EmptyState
                                title={t('history.emptyTransactionsTitle')}
                                description={t('history.emptyTransactionsDesc')}
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
                                                    <p className="eyebrow">{t('history.totalSpent')}</p>
                                                    <p className="mt-0.5 text-xs font-semibold sm:text-sm">
                                                        {formatRupiah(transaction.total_amount)}
                                                    </p>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="eyebrow">{t('history.discount')}</p>
                                                    <p className="mt-0.5 text-xs font-semibold text-sage sm:text-sm">
                                                        -{formatRupiah(transaction.discount_amount)}
                                                    </p>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="eyebrow">{t('history.totalPaid')}</p>
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
                                <p className="eyebrow">{t('history.attendanceTitle')}</p>
                                <h2 className="font-display text-2xl font-bold tracking-tight">{t('history.attendanceTitle')}</h2>
                                <p className="text-sm text-slate">
                                    {t('history.attendanceDesc')}
                                </p>
                            </div>
                        </Reveal>

                        {attendanceList.length === 0 ? (
                            <EmptyState
                                title={t('history.emptyAttendanceTitle')}
                                description={t('history.emptyAttendanceDesc')}
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
                                                    {t('history.present')}
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
