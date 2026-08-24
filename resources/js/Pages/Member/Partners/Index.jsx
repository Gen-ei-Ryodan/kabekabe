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
            className="group block overflow-hidden rounded-2xl border border-ink/10 bg-white/80 shadow-lift transition-all hover:-translate-y-1 hover:shadow-card"
        >
            <div className="relative flex items-center justify-between gap-3 bg-ink px-5 py-5 text-paper">
                <span className="font-display text-3xl font-bold text-gold-light">
                    {promo.discount_type === 'percent' ? `${promo.discount_value}%` : formatRupiah(promo.discount_value)}
                </span>
                <span className="rounded-full bg-gold/15 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-gold-light">
                    {promo.partner?.name}
                </span>
            </div>
            <div className="p-5">
                <h3 className="font-display font-bold leading-snug">{promo.title}</h3>
                {promo.description && <p className="mt-2 line-clamp-2 text-sm text-slate">{promo.description}</p>}
                {promo.min_purchase > 0 && (
                    <p className="mt-2 font-mono text-[11px] text-gold-deep">Min. purchase {formatRupiah(promo.min_purchase)}</p>
                )}
                <p className="mt-4 font-mono text-[11px] uppercase tracking-wide text-slate-soft">
                    {formatDate(promo.start_date)} — {formatDate(promo.end_date)}
                </p>
            </div>
        </Link>
    );
}

function PartnerCard({ partner }) {
    return (
        <Link
            href={route('member.partners.show', partner.id)}
            className="group block rounded-2xl border border-ink/10 bg-white/80 p-6 shadow-lift transition-all hover:-translate-y-1 hover:shadow-card"
        >
            <div className="flex items-center gap-4">
                {partner.logo_url ? (
                    <img src={partner.logo_url} alt={partner.name} className="h-12 w-12 rounded-xl object-cover" />
                ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink font-display text-lg font-bold text-gold-light">
                        {partner.name.charAt(0)}
                    </span>
                )}
                <div className="min-w-0">
                    <h3 className="font-display text-lg font-bold">{partner.name}</h3>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-gold-deep">{partner.category}</p>
                </div>
            </div>
            <p className="mt-4 line-clamp-2 text-sm text-slate">{partner.description}</p>
            <div className="mt-4 flex items-center justify-between border-t border-ink/5 pt-4">
                <span className="text-xs text-slate-soft">{partner.promos_count} active promos</span>
                <span className="text-sm font-semibold text-ink transition-transform group-hover:translate-x-1">→</span>
            </div>
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
            <Head title="Partner" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="eyebrow">Partners</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Partner & Promos</h1>
                        <p className="mt-2 max-w-xl text-sm text-slate">
                            Exclusive offers and partner stores across the community.
                        </p>
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

                {tab === 'promos' ? (
                    <>
                        <div className="flex flex-wrap gap-2">{Chips}</div>

                        {promoList.length === 0 ? (
                            <EmptyState
                                title="No active promos"
                                description="No promos available for this category right now."
                            />
                        ) : (
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
