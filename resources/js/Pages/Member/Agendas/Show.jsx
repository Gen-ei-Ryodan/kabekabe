import { Head, Link } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import { formatDate, formatRupiah } from '@/Utils/format';
import { handleBackNavigation } from '@/Utils/backNav';
import { useTranslation } from '@/i18n';

export default function AgendaShow({ agenda }) {
    const { t } = useTranslation();

    const hasFee = agenda.fee !== null && agenda.fee !== undefined;
    const isFree = !hasFee || agenda.fee <= 0;
    const feeLabel = isFree ? t('agenda.free') : t('agenda.fee', { fee: formatRupiah(agenda.fee) });

    return (
        <>
            <Head title={agenda.title} />

            <div className="mx-auto max-w-3xl">
                <Link
                    href={route('member.home')}
                    onClick={(e) => handleBackNavigation(e, 'agenda')}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate hover:text-ink"
                >
                    {t('common.back')}
                </Link>

                <article className="card-surface overflow-hidden">
                    {agenda.image_url && (
                        <div className="relative max-h-80 overflow-hidden bg-ink">
                            <img src={agenda.image_url} alt={agenda.title} className="h-full w-full object-cover" />
                            <div
                                aria-hidden="true"
                                className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-gold via-gold-light/40 to-transparent"
                            />
                        </div>
                    )}

                    <div className="p-6 sm:p-8">
                        <p className="eyebrow">
                            {agenda.type === 'event' ? 'Event' : 'Agenda'}
                            {agenda.event_date ? ` · ${formatDate(agenda.event_date)}` : ''}
                        </p>

                        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                            {agenda.title}
                        </h1>

                        {(agenda.location || feeLabel) && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {agenda.location && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white/70 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-slate">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3 text-gold-deep" aria-hidden="true">
                                            <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" />
                                            <circle cx="12" cy="10" r="2.5" />
                                        </svg>
                                        {agenda.location}
                                    </span>
                                )}
                                {hasFee && (
                                    <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-gold-deep">
                                        {feeLabel}
                                    </span>
                                )}
                            </div>
                        )}

                        {agenda.content && (
                            <div className="mt-5 whitespace-pre-line border-t border-ink/10 pt-5 text-sm leading-relaxed text-slate">
                                {agenda.content}
                            </div>
                        )}
                    </div>
                </article>
            </div>
        </>
    );
}

AgendaShow.layout = (page) => <MemberLayout>{page}</MemberLayout>;
