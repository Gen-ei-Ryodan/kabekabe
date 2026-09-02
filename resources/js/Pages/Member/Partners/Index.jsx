import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import MemberLayout from '@/Layouts/MemberLayout';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import Reveal from '@/Components/Reveal';
import { formatDate, formatRupiah } from '@/Utils/format';

const TABS = [
    { key: 'promos', label: 'Promos' },
    { key: 'partners', label: 'Partners' },
];

function PromoCard({ promo }) {
    return (
        <Link
            href={route('member.promos.show', promo.id)}
            className="group flex h-full items-stretch gap-3 overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-lift transition-all hover:-translate-y-1 hover:shadow-card"
        >
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 bg-ink px-3 py-2 text-paper">
                    {typeof promo.sort_number === 'number' && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gold text-[10px] font-bold text-ink">
                            {promo.sort_number}
                        </span>
                    )}
                    <span className="font-display text-base font-bold text-gold-light">
                        {promo.discount_type === 'percent' ? `${promo.discount_value}%` : formatRupiah(promo.discount_value)}
                    </span>
                    <span className="ml-auto truncate rounded-full bg-gold/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-gold-light">
                        {promo.partner?.name}
                    </span>
                </div>
                <div className="p-3">
                    <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-ink">{promo.title}</h3>
                    {promo.min_purchase > 0 && (
                        <p className="mt-1.5 font-mono text-[10px] text-gold-deep">Min. {formatRupiah(promo.min_purchase)}</p>
                    )}
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-slate-soft">
                        {formatDate(promo.start_date)} — {formatDate(promo.end_date)}
                    </p>
                </div>
            </div>
            {promo.partner?.logo_url ? (
                <img src={promo.partner.logo_url} alt={promo.partner.name} className="my-auto mr-3 h-12 w-12 shrink-0 rounded-lg object-cover" />
            ) : (
                <span className="my-auto mr-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ink font-display text-lg font-bold text-gold-light">
                    {promo.partner?.name?.charAt(0) || '?'}
                </span>
            )}
        </Link>
    );
}

function PartnerCard({ partner }) {
    return (
        <Link
            href={route('member.partners.show', partner.id)}
            className="group flex h-full items-start gap-3 rounded-xl border border-ink/10 bg-white/80 p-3 shadow-lift transition-all hover:-translate-y-1 hover:shadow-card"
        >
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    {typeof partner.sort_number === 'number' && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-ink text-[10px] font-bold text-gold-light">
                            {partner.sort_number}
                        </span>
                    )}
                    <h3 className="truncate font-display text-sm font-bold leading-snug text-ink">{partner.name}</h3>
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-gold-deep">{partner.category}</p>
                <p className="mt-1.5 line-clamp-2 text-xs text-slate">{partner.description}</p>
                <div className="mt-2 flex items-center justify-between border-t border-ink/5 pt-2">
                    <span className="text-[11px] text-slate-soft">{partner.promos_count} promos</span>
                    <span className="text-xs font-semibold text-ink transition-transform group-hover:translate-x-1">→</span>
                </div>
            </div>
            {partner.logo_url ? (
                <img src={partner.logo_url} alt={partner.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
            ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ink font-display text-lg font-bold text-gold-light">
                    {partner.name.charAt(0)}
                </span>
            )}
        </Link>
    );
}

export default function PartnerIndex({ partners, promos, categories, filters }) {
    const [tab, setTab] = useState(
        () => new URLSearchParams(window.location.search).get('tab') === 'partners' ? 'partners' : 'promos',
    );

    const rawCategory = filters?.category || 'all';
    const category = rawCategory === '' ? 'all' : rawCategory;

    const switchTab = (next) => {
        setTab(next);
        router.get(
            route('member.partners.index'),
            {
                ...(category !== 'all' ? { category } : {}),
                tab: next === 'promos' ? undefined : next,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const selectCategory = (value) => {
        router.get(
            route('member.partners.index'),
            {
                category: value === 'all' ? undefined : value,
                ...(tab === 'partners' ? { tab } : {}),
            },
            { preserveState: true, replace: true },
        );
    };

    const categoryList = Array.isArray(categories) ? categories : Object.values(categories || {});
    const promoList = Array.isArray(promos) ? promos : promos?.data ?? [];
    const partnerList = Array.isArray(partners) ? partners : partners?.data ?? [];

    const Chips = (
        <div className="flex flex-wrap gap-2">
            {['all', ...categoryList].map((cat) => (
                <button
                    key={cat}
                    onClick={() => selectCategory(cat)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        category === cat ? 'bg-ink text-paper' : 'border border-ink/15 bg-white/70 text-slate hover:bg-white'
                    }`}
                >
                    {cat === 'all' ? 'All' : cat}
                </button>
            ))}
        </div>
    );

    return (
        <>
            <Head title="Promo & Partner" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <h1 className="font-display text-3xl font-bold tracking-tight">Promo & Partner</h1>
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

                {tab === 'promos' ? (
                    <>
                        <div className="flex flex-wrap gap-2">{Chips}</div>

                        {promoList.length === 0 ? (
                            <EmptyState
                                title="No active promos"
                                description="No promos available for this category right now."
                            />
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {promoList.map((promo, i) => (
                                    <Reveal key={promo.id} delay={i * 0.05}>
                                        <PromoCard promo={promo} />
                                    </Reveal>
                                ))}
                            </div>
                        )}

                        <Pagination links={promos?.links} />
                    </>
                ) : (
                    <>
                        <div className="flex flex-wrap gap-2">{Chips}</div>

                        {partnerList.length === 0 ? (
                            <EmptyState
                                title="No partners yet"
                                description="No partners registered in this category yet."
                            />
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {partnerList.map((partner, i) => (
                                    <Reveal key={partner.id} delay={i * 0.05}>
                                        <PartnerCard partner={partner} />
                                    </Reveal>
                                ))}
                            </div>
                        )}

                        <Pagination links={partners?.links} />
                    </>
                )}
            </div>
        </>
    );
}

PartnerIndex.layout = (page) => <MemberLayout>{page}</MemberLayout>;
