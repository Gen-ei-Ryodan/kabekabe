import { Head, Link } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import Reveal from '@/Components/Reveal';
import { formatDate, formatRupiah } from '@/Utils/format';
import { rememberBackSource } from '@/Utils/backNav';
import { useTranslation } from '@/i18n';

export default function PartnerShow({ partner }) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={partner.name} />

            <div className="mx-auto max-w-3xl">
                <Link href={route('member.partners.index')} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate hover:text-ink">
                    {t('partners.backToList')}
                </Link>

                <div className="card-surface overflow-hidden">
                    <div className="flex flex-col gap-6 bg-ink p-8 text-paper sm:flex-row sm:items-center sm:gap-8 sm:p-10">
                        {partner.logo_url ? (
                            <img src={partner.logo_url} alt={partner.name} className="h-20 w-20 rounded-2xl object-cover" />
                        ) : (
                            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gold/15 font-display text-3xl font-bold text-gold-light">
                                {partner.name.charAt(0)}
                            </span>
                        )}
                        <div>
                            <p className="font-mono text-xs uppercase tracking-[0.25em] text-paper/50">{partner.category}</p>
                            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{partner.name}</h1>
                            <p className="mt-2 text-paper/70">{partner.description}</p>
                        </div>
                    </div>

                    <div className="grid gap-8 p-8 sm:p-10 md:grid-cols-2">
                        <div>
                            <p className="eyebrow">{t('partners.info')}</p>
                            <dl className="mt-3 space-y-3 text-sm">
                                <div className="flex gap-3"><dt className="w-20 shrink-0 text-slate">{t('partners.address')}</dt><dd>{partner.address || '-'}</dd></div>
                                <div className="flex gap-3"><dt className="w-20 shrink-0 text-slate">{t('partners.phone')}</dt><dd className="font-mono">{partner.phone || '-'}</dd></div>
                                <div className="flex gap-3"><dt className="w-20 shrink-0 text-slate">{t('partners.email')}</dt><dd>{partner.email || '-'}</dd></div>
                            </dl>
                        </div>

                        <div>
                            <p className="eyebrow">{t('partners.activePromos')}</p>
                            <div className="mt-3 space-y-3">
                                {partner.promos.length === 0 ? (
                                    <p className="text-sm text-slate">{t('partners.noActivePromos')}</p>
                                ) : (
                                    partner.promos.map((promo) => (
                                        <Link key={promo.id} href={route('member.promos.show', promo.id)} onClick={() => rememberBackSource('promo')} className="block rounded-xl border border-ink/10 bg-paper p-4 transition-colors hover:border-gold/40">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-display text-lg font-bold text-gold-deep">
                                                    {promo.discount_type === 'percent' ? `${promo.discount_value}%` : formatRupiah(promo.discount_value)}
                                                </span>
                                                <span className="text-xs text-slate">{formatDate(promo.start_date)} — {formatDate(promo.end_date)}</span>
                                            </div>
                                            <p className="mt-1 text-sm font-medium">{promo.title}</p>
                                            {promo.promo_image_url && (
                                                <div className="mt-2">
                                                    <img src={promo.promo_image_url} alt={promo.title} className="h-24 w-full rounded-lg object-cover" />
                                                </div>
                                            )}
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <Reveal className="mt-8">
                    <div className="rounded-2xl border border-gold/30 bg-gold/10 p-6 text-center">
                        <p className="text-sm text-ink">
                            {t('partners.promoHintLead')} <span className="font-semibold">{t('partners.promoHintStatus')}</span>.
                        </p>
                    </div>
                </Reveal>
            </div>
        </>
    );
}

PartnerShow.layout = (page) => <MemberLayout>{page}</MemberLayout>;