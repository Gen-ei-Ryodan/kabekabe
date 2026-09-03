import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import MemberLayout from '@/Layouts/MemberLayout';
import MemberCard from '@/Components/MemberCard';
import StatusChip from '@/Components/StatusChip';
import Reveal from '@/Components/Reveal';

import PrimaryButton from '@/Components/PrimaryButton';
import { formatDate, formatRupiah, daysUntil } from '@/Utils/format';

function VendorRanking({ vendors }) {
    const medals = ['🥇', '🥈', '🥉', '4', '5'];

    return (
        <section aria-label="Vendor Ranking" className="flex flex-col gap-5">
            <Reveal>
                <div className="flex items-center gap-3">
                    <p className="eyebrow">Congratulation</p>
                    <span aria-hidden="true" className="h-px flex-1 bg-ink/10" />
                </div>
            </Reveal>

            <div className="space-y-2.5">
                {vendors.map((v, i) => (
                    <Reveal key={v.partner_id} delay={i * 0.05}>
                        <div className="card-surface flex items-center gap-4 p-4">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink font-display text-lg font-bold text-gold-light">
                                {medals[i] || i + 1}
                            </span>
                            {v.logo_url ? (
                                <img
                                    src={v.logo_url}
                                    alt={v.name}
                                    className="h-10 w-10 shrink-0 rounded-xl object-cover"
                                />
                            ) : (
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink font-display text-base font-bold text-gold-light">
                                    {v.name?.charAt(0) || '?'}
                                </span>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-display font-bold text-ink">{v.name || '—'}</p>
                                <p className="font-mono text-[11px] text-slate">{v.total} transactions</p>
                            </div>
                        </div>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

function PromoPopup({ open, onClose, promo }) {
    if (!promo) return null;

    return (
        <Modal show={open} maxWidth="md" closeable={true} onClose={onClose}>
            <div className="overflow-hidden rounded-xl">
                <div className="relative h-48 bg-ink">
                    {promo.image_url ? (
                        <img src={promo.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <span className="font-display text-6xl font-bold text-gold">🎉</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                </div>
                <div className="p-6">
                    <p className="eyebrow">Special Promo</p>
                    <h3 className="mt-1 font-display text-xl font-bold text-ink">{promo.title}</h3>
                    <p className="mt-2 text-sm text-slate">
                        {promo.partner?.name && `from ${promo.partner.name}`}
                    </p>
                    <PrimaryButton
                        className="mt-4 w-full justify-center"
                        onClick={onClose}
                    >
                        Got it
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}

// Toast-style promo hint — non-blocking, only shown if popup wasn't dismissed
function PromoToast({ promo, onDismiss }) {
    if (!promo) return null;
    return (
        <div className="pointer-events-none fixed bottom-4 right-4 z-30 max-w-sm">
            <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-gold/40 bg-white/95 p-3 shadow-lift backdrop-blur">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink font-display text-base font-bold text-gold-light">
                    🎉
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{promo.title}</p>
                    <p className="truncate text-xs text-slate">Lihat di menu Promo</p>
                </div>
                <button
                    onClick={onDismiss}
                    className="shrink-0 rounded-lg p-1.5 text-slate hover:bg-ink/5 hover:text-ink"
                    aria-label="Tutup"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

function BannerImage({ url }) {
    if (!url) return null;

    return (
        <div className="relative h-32 w-full overflow-hidden sm:h-36">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/25 to-transparent" />
        </div>
    );
}

function PromoBanner({ promo, imageUrl }) {
    const discountLabel =
        promo.discount_type === 'percent'
            ? `${promo.discount_value}%`
            : formatRupiah(promo.discount_value);

    return (
        <Link
            href={route('member.promos.show', promo.id)}
            className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white/80 shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-card"
        >
            <BannerImage url={imageUrl} />
            <div className="relative flex items-center justify-between gap-3 bg-ink px-4 py-3 sm:px-5">
                <span className="relative font-display text-xl font-bold text-gold-light sm:text-2xl">
                    {discountLabel}
                </span>
                <span className="relative truncate rounded-full bg-gold/15 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-gold-light">
                    {promo.partner?.name}
                </span>
            </div>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <p className="eyebrow">Promo</p>
                <h3 className="mt-1.5 font-display font-bold leading-snug text-ink group-hover:text-ink-soft">
                    {promo.title}
                </h3>
                {promo.min_purchase > 0 && (
                    <p className="mt-2 text-xs text-slate">Min. purchase {formatRupiah(promo.min_purchase)}</p>
                )}

                <div className="mt-auto pt-4">
                    <div className="flex items-center justify-between gap-3 border-t border-ink/5 pt-3">
                        <span className="font-mono text-[10px] uppercase tracking-wide text-slate-soft">
                            {formatDate(promo.start_date)} — {formatDate(promo.end_date)}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-widest text-gold-deep transition-transform duration-300 group-hover:translate-x-0.5">
                            View →
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function AgendaBanner({ agenda, imageUrl }) {
    const raw = String(agenda.event_date || '').trim();
    const parsedDate = raw ? new Date(raw) : null;
    let day = '';
    let rest = '';

    if (parsedDate && !Number.isNaN(parsedDate.getTime())) {
        day = String(parsedDate.getDate()).padStart(2, '0');
        rest = new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(parsedDate);
    } else {
        const parts = raw.split(/\s+/);
        day = parts[0] || '';
        rest = parts.slice(1).join(' ') || '';
    }

    return (
        <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white/80 shadow-lift">
            <BannerImage url={imageUrl} />
            <div aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-gold via-gold-light/40 to-transparent" />

            <div className="flex flex-1 items-start gap-4 p-5 sm:p-6">
                {day && (
                    <div className="flex w-14 shrink-0 flex-col items-center rounded-xl border border-gold/30 bg-paper px-1 py-2.5 text-center">
                        <span className="font-display text-xl font-bold leading-none text-ink">{day}</span>
                        {rest && (
                            <span className="mt-1.5 font-mono text-[9px] uppercase leading-tight tracking-widest text-gold-deep">
                                {rest}
                            </span>
                        )}
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <p className="eyebrow">Agenda</p>
                    <h3 className="mt-1.5 font-display font-bold leading-snug text-ink">{agenda.title}</h3>
                    {agenda.location && (
                        <p className="mt-2 flex items-start gap-1.5 text-xs text-slate">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="mt-px h-3.5 w-3.5 shrink-0 text-gold-deep"
                                aria-hidden="true"
                            >
                                <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" />
                                <circle cx="12" cy="10" r="2.5" />
                            </svg>
                            {agenda.location}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-ink/5 px-5 py-2.5 sm:px-6">
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-soft">
                    {agenda.type || 'Event'}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate/60">
                    Information
                </span>
            </div>
        </div>
    );
}

function BannerZone({ banners }) {
    const count = banners.length;
    const gridClass = count === 1
        ? 'grid-cols-1'
        : count === 2
            ? 'grid-cols-2'
            : 'grid-cols-3';

    return (
        <section aria-label="Featured" className="flex flex-col gap-6">
            <Reveal>
                <div className="flex items-center gap-3">
                    <p className="eyebrow">Featured</p>
                    <span aria-hidden="true" className="h-px flex-1 bg-ink/10" />
                </div>
            </Reveal>

            <div className={`grid gap-3 sm:gap-4 ${gridClass}`}>
                {banners.map((banner, i) => (
                    <Reveal key={banner.id} delay={0.05 + i * 0.08}>
                        {banner.type === 'promo' && banner.promo ? (
                            <PromoBanner promo={banner.promo} imageUrl={banner.image_url} />
                        ) : banner.agenda ? (
                            <AgendaBanner agenda={banner.agenda} imageUrl={banner.image_url} />
                        ) : null}
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

export default function Home({ member, banners = [], vendor_ranking = [] }) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    const firstName = (member?.name || '').split(' ')[0];
    const active = member?.membership_status === 'active';
    const bannerList = (Array.isArray(banners) ? banners : []).slice(0, 3);

    const [promoPopup, setPromoPopup] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        try {
            if (localStorage.getItem('promo_popup_dismissed')) {
                setDismissed(true);
                return;
            }
        } catch {
            // ignore
        }

        const activePromo = bannerList.find(
            (b) => b.type === 'promo' && b.promo
        );
        if (activePromo) {
            const timer = setTimeout(() => {
                setPromoPopup(activePromo.promo);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismissPopup = () => {
        try {
            localStorage.setItem('promo_popup_dismissed', '1');
        } catch {
            // ignore
        }
        setDismissed(true);
        setPromoPopup(null);
    };

    const closePopup = () => setPromoPopup(null);

    return (
        <>
            <Head title="Home" />

            <div className="flex flex-col gap-12">
                <header className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <p className="eyebrow">
                            Member Card
                        </p>
                        <StatusChip status={member?.membership_status} label={member?.membership_status_label} pulse />
                    </div>
                    <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                        {greeting}, {firstName}
                    </h1>
                    <p className="sr-only">Your member card is ready.</p>
                    {active && member?.expires_at && (
                        <p className="text-sm text-slate">
                            {member.is_expiring_soon ? (
                                <span className="font-medium text-ember">
                                    Expires in {daysUntil(member.expires_at)} days
                                </span>
                            ) : (
                                <>Valid until {formatDate(member.expires_at)}</>
                            )}
                        </p>
                    )}
                </header>

                <section className="flex justify-center px-4 sm:px-0">
                    <MemberCard member={member} />
                </section>

                {vendor_ranking.length > 0 && (
                    <VendorRanking vendors={vendor_ranking} />
                )}

                {bannerList.length > 0 && <BannerZone banners={bannerList} />}
            </div>

            {!dismissed && (
                <PromoToast promo={promoPopup} onDismiss={handleDismissPopup} />
            )}
        </>
    );
}

Home.layout = (page) => <MemberLayout>{page}</MemberLayout>;
