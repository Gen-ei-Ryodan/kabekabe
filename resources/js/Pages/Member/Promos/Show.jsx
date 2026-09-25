import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import StatusChip from '@/Components/StatusChip';
import { formatDate, formatRupiah } from '@/Utils/format';
import { handleBackNavigation } from '@/Utils/backNav';
import { useTranslation } from '@/i18n';

export default function PromoShow({ promo, member_active }) {
    const { t } = useTranslation();

    const images = [
        promo.promo_image_url && { src: promo.promo_image_url, label: t('promos.gallery.promo'), fit: 'object-cover' },
        promo.product_image_url && { src: promo.product_image_url, label: t('promos.gallery.product'), fit: 'object-cover' },
        promo.logo_url && { src: promo.logo_url, label: t('promos.gallery.logo'), fit: 'object-contain bg-paper/50' },
    ].filter(Boolean);

    const [active, setActive] = useState(0);
    const total = images.length;
    const current = images[Math.min(active, total - 1)] || null;
    const goTo = (index) => setActive((index + total) % total);

    const discountLabel = (benefit) => {
        if (promo.discount_type === 'percent') return t('promos.percentOff', { n: promo.discount_value });
        if (promo.discount_type === 'free_item') {
            return benefit
                ? `${t('promos.freeItem')} (${formatRupiah(promo.discount_value)})`
                : t('promos.freeItem');
        }
        return formatRupiah(promo.discount_value);
    };

    return (
        <>
            <Head title={promo.title} />

            <div className="mx-auto max-w-3xl">
                <Link
                    href={route('member.partners.index')}
                    onClick={(e) => handleBackNavigation(e, 'promo')}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate hover:text-ink"
                >
                    {t('common.back')}
                </Link>

                <div className="card-surface overflow-hidden">
                    <div className="relative flex flex-col gap-6 bg-ink p-6 text-paper sm:flex-row sm:items-center sm:justify-between sm:p-10">
                        <div>
                            <p className="font-mono text-xs uppercase tracking-[0.25em] text-paper/50">{promo.partner.name}</p>
                            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-gold-light sm:text-4xl">
                                {discountLabel(false)}
                            </h1>
                            <p className="mt-1 text-paper/70">
                                {promo.discount_type === 'free_item'
                                    ? t('promos.freeItemDesc', { value: formatRupiah(promo.discount_value) })
                                    : t('promos.exclusiveDiscount')}
                            </p>
                        </div>
                        <div className="flex flex-col items-start gap-2 sm:items-end">
                            <StatusChip
                                status={member_active ? 'active' : 'inactive'}
                                label={member_active ? t('promos.status.available') : t('promos.status.needActive')}
                            />
                            <p className="font-mono text-xs text-paper/50">
                                {formatDate(promo.start_date)} — {formatDate(promo.end_date)}
                            </p>
                        </div>
                    </div>

                    {current && (
                        <div className="border-t border-ink/10 bg-paper/30 p-5 sm:p-8">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="eyebrow">{t('promos.gallery.title')}</p>
                                <p className="font-mono text-xs text-slate">
                                    {t('promos.gallery.counter', { i: Math.min(active + 1, total), n: total })}
                                </p>
                            </div>

                            <div className="relative overflow-hidden rounded-xl border border-ink/10 bg-white">
                                <div className="aspect-[4/3] w-full sm:aspect-[16/9]">
                                    <img
                                        src={current.src}
                                        alt={current.label}
                                        className={`h-full w-full ${current.fit}`}
                                    />
                                </div>

                                {total > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => goTo(active - 1)}
                                            aria-label={t('promos.gallery.prev')}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/70 p-2 text-paper transition hover:bg-ink"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => goTo(active + 1)}
                                            aria-label={t('promos.gallery.next')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/70 p-2 text-paper transition hover:bg-ink"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </>
                                )}

                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/70 to-transparent px-4 pb-3 pt-8">
                                    <p className="text-xs font-medium text-paper">{current.label}</p>
                                </div>
                            </div>

                            {total > 1 && (
                                <div className="mt-4 flex items-center justify-center gap-2">
                                    {images.map((image, index) => (
                                        <button
                                            key={image.src}
                                            type="button"
                                            onClick={() => setActive(index)}
                                            aria-label={`${image.label} (${index + 1})`}
                                            className={`h-2 rounded-full transition ${
                                                index === active ? 'w-6 bg-ink' : 'w-2 bg-ink/30 hover:bg-ink/50'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-5 sm:p-10">
                        <h2 className="font-display text-lg font-bold">{t('promos.about')}</h2>
                        <p className="mt-3 leading-relaxed text-slate">{promo.description}</p>

                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-ink/10 bg-paper p-4">
                                <p className="eyebrow">{t('promos.minPurchase')}</p>
                                <p className="mt-1 font-display font-bold">
                                    {promo.min_purchase > 0 ? formatRupiah(promo.min_purchase) : t('promos.noMinimum')}
                                </p>
                            </div>
                            <div className="rounded-xl border border-ink/10 bg-paper p-4">
                                <p className="eyebrow">{t('promos.benefit')}</p>
                                <p className="mt-1 font-display font-bold">{discountLabel(true)}</p>
                            </div>
                            <div className="rounded-xl border border-ink/10 bg-paper p-4">
                                <p className="eyebrow">{t('promos.period')}</p>
                                <p className="mt-1 font-mono text-sm font-semibold">
                                    {formatDate(promo.start_date)} — {formatDate(promo.end_date)}
                                </p>
                            </div>
                        </div>

                        {promo.terms && (
                            <div className="mt-6 rounded-xl bg-ink/5 p-5">
                                <p className="eyebrow">{t('promos.terms')}</p>
                                <p className="mt-2 text-sm text-slate">{promo.terms}</p>
                            </div>
                        )}

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Link href={route('member.partners.show', promo.partner.id)} className="btn-ink">
                                {t('promos.visitPartner', { name: promo.partner.name })}
                            </Link>
                            {member_active ? (
                                <p className="inline-flex items-center rounded-full bg-sage/10 px-4 py-2.5 text-sm font-semibold text-sage">
                                    {t('promos.showCardHint')}
                                </p>
                            ) : (
                                <p className="inline-flex items-center rounded-full bg-ember/10 px-4 py-2.5 text-sm font-semibold text-ember">
                                    {t('promos.inactiveHint')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

PromoShow.layout = (page) => <MemberLayout>{page}</MemberLayout>;
