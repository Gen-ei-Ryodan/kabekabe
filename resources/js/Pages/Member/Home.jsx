import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import MemberLayout from '@/Layouts/MemberLayout';
import MemberCard from '@/Components/MemberCard';
import StatusChip from '@/Components/StatusChip';
import Reveal from '@/Components/Reveal';

import Modal from '@/Components/Modal';
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

function PromoPopup({ open, onClose, popup }) {
    const promo = popup?.promo;
    if (!promo) return null;

    return (
        <Modal show={open} maxWidth="md" closeable={true} onClose={onClose}>
            <div className="overflow-hidden rounded-xl">
                <div className="relative h-56 bg-ink sm:h-72">
                    {popup.image_url ? (
                        <img src={popup.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <span className="font-display text-6xl font-bold text-gold">🎉</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                </div>
                <div className="p-6">
                    <p className="eyebrow">Member exclusive</p>
                    <h3 className="mt-1 font-display text-2xl font-bold text-ink">{promo.title}</h3>
                    <p className="mt-2 text-sm text-slate">
                        {promo.partner?.name && `from ${promo.partner.name}`}
                    </p>
                    <Link href={route('member.promos.show', promo.id)} onClick={onClose} className="btn-gold mt-5 w-full justify-center">
                        View promo
                    </Link>
                </div>
            </div>
        </Modal>
    );
}

function BannerImage({ url, className = '' }) {
    if (!url) return null;

    return (
        <div className={`relative overflow-hidden ${className}`}>
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

    const [isPortrait, setIsPortrait] = useState(null);

    useEffect(() => {
        if (!imageUrl) return;
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            setIsPortrait(img.height > img.width);
        };
    }, [imageUrl]);

    if (isPortrait === null) {
        return (
            <Link
                href={route('member.promos.show', promo.id)}
                className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-card"
            >
                <BannerImage url={imageUrl} className="h-16 w-full sm:h-20" />
                <div className="relative flex items-center justify-between gap-2 bg-ink px-3 py-1.5 sm:px-4 sm:py-2">
                    <span className="relative font-display text-sm font-bold text-gold-light sm:text-base">
                        {discountLabel}
                    </span>
                    <span className="relative truncate rounded-full bg-gold/15 px-2 py-0.5 font-mono text-[7px] uppercase tracking-widest text-gold-light">
                        {promo.partner?.name}
                    </span>
                </div>
                <div className="flex flex-1 flex-col p-2 sm:p-2.5">
                    <p className="eyebrow text-[8px]">Promo</p>
                    <h3 className="mt-0.5 font-display text-[11px] font-bold leading-snug text-ink group-hover:text-ink-soft line-clamp-1">
                        {promo.title}
                    </h3>
                    <div className="mt-auto pt-1.5">
                        <div className="flex items-center justify-between gap-2 border-t border-ink/5 pt-1.5">
                            <span className="font-mono text-[7px] uppercase tracking-wide text-slate-soft">
                                {formatDate(promo.start_date)} — {formatDate(promo.end_date)}
                            </span>
                            <span className="shrink-0 font-mono text-[7px] font-semibold uppercase tracking-widest text-gold-deep">
                                View →
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    if (isPortrait) {
        return (
            <Link
                href={route('member.promos.show', promo.id)}
                className="group relative flex h-full flex-row overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-card"
            >
                <BannerImage url={imageUrl} className="h-full w-20 shrink-0 sm:w-24" />
                <div className="flex flex-1 flex-col">
                    <div className="relative flex items-center justify-between gap-2 bg-ink px-2.5 py-1 sm:px-3 sm:py-1.5">
                        <span className="relative font-display text-xs font-bold text-gold-light sm:text-sm">
                            {discountLabel}
                        </span>
                        <span className="relative truncate rounded-full bg-gold/15 px-1.5 py-0.5 font-mono text-[6px] uppercase tracking-widest text-gold-light">
                            {promo.partner?.name}
                        </span>
                    </div>
                    <div className="flex flex-1 flex-col p-2 sm:p-2.5">
                        <p className="eyebrow text-[8px]">Promo</p>
                        <h3 className="mt-0.5 font-display text-[11px] font-bold leading-snug text-ink group-hover:text-ink-soft line-clamp-1">
                            {promo.title}
                        </h3>
                        {promo.min_purchase > 0 && (
                            <p className="mt-0.5 text-[9px] text-slate">Min. {formatRupiah(promo.min_purchase)}</p>
                        )}
                        <div className="mt-auto pt-1.5">
                            <div className="flex items-center justify-between gap-2 border-t border-ink/5 pt-1.5">
                                <span className="font-mono text-[7px] uppercase tracking-wide text-slate-soft">
                                    {formatDate(promo.start_date)} — {formatDate(promo.end_date)}
                                </span>
                                <span className="shrink-0 font-mono text-[7px] font-semibold uppercase tracking-widest text-gold-deep">
                                    View →
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={route('member.promos.show', promo.id)}
            className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-card"
        >
            <BannerImage url={imageUrl} className="h-16 w-full sm:h-20" />
            <div className="relative flex items-center justify-between gap-2 bg-ink px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="relative font-display text-sm font-bold text-gold-light sm:text-base">
                    {discountLabel}
                </span>
                <span className="relative truncate rounded-full bg-gold/15 px-2 py-0.5 font-mono text-[7px] uppercase tracking-widest text-gold-light">
                    {promo.partner?.name}
                </span>
            </div>
            <div className="flex flex-1 flex-col p-2 sm:p-2.5">
                <p className="eyebrow text-[8px]">Promo</p>
                <h3 className="mt-0.5 font-display text-[11px] font-bold leading-snug text-ink group-hover:text-ink-soft line-clamp-1">
                    {promo.title}
                </h3>
                {promo.min_purchase > 0 && (
                    <p className="mt-0.5 text-[9px] text-slate">Min. {formatRupiah(promo.min_purchase)}</p>
                )}
                <div className="mt-auto pt-1.5">
                    <div className="flex items-center justify-between gap-2 border-t border-ink/5 pt-1.5">
                        <span className="font-mono text-[7px] uppercase tracking-wide text-slate-soft">
                            {formatDate(promo.start_date)} — {formatDate(promo.end_date)}
                        </span>
                        <span className="shrink-0 font-mono text-[7px] font-semibold uppercase tracking-widest text-gold-deep">
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

    const [isPortrait, setIsPortrait] = useState(null);

    useEffect(() => {
        if (!imageUrl) {
            setIsPortrait(false);
            return;
        }
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            setIsPortrait(img.height > img.width);
        };
    }, [imageUrl]);

    const dateBlock = day ? (
        <div className="flex w-9 shrink-0 flex-col items-center rounded-lg border border-gold/30 bg-paper px-0.5 py-1 text-center">
            <span className="font-display text-xs font-bold leading-none text-ink">{day}</span>
            {rest && (
                <span className="mt-0.5 font-mono text-[6px] uppercase leading-tight tracking-widest text-gold-deep">
                    {rest}
                </span>
            )}
        </div>
    ) : null;

    if (isPortrait === null || isPortrait) {
        return (
            <div className="relative flex h-full flex-row-reverse overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-lift">
                <BannerImage url={imageUrl} className="h-full w-20 shrink-0 sm:w-24" />
                <div aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-gold via-gold-light/40 to-transparent" />
                <div className="flex flex-1 flex-col">
                    <div className="flex flex-1 items-start gap-2 p-2 sm:p-2.5">
                        {dateBlock}
                        <div className="min-w-0 flex-1">
                            <p className="eyebrow text-[8px]">Agenda</p>
                            <h3 className="mt-0.5 font-display text-[11px] font-bold leading-snug text-ink line-clamp-1">{agenda.title}</h3>
                            {agenda.location && (
                                <p className="mt-0.5 flex items-start gap-1 text-[9px] text-slate">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-px h-2.5 w-2.5 shrink-0 text-gold-deep" aria-hidden="true">
                                        <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" />
                                        <circle cx="12" cy="10" r="2.5" />
                                    </svg>
                                    <span className="line-clamp-1">{agenda.location}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-ink/5 px-2 py-1 sm:px-2.5">
                        <span className="font-mono text-[7px] uppercase tracking-widest text-slate-soft">
                            {agenda.type || 'Event'}
                        </span>
                        <span className="font-mono text-[7px] uppercase tracking-widest text-slate/60">
                            Information
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-ink/10 bg-white/80 shadow-lift">
            <BannerImage url={imageUrl} className="h-16 w-full sm:h-20" />
            <div aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-gold via-gold-light/40 to-transparent" />

            <div className="flex flex-1 items-start gap-2 p-2 sm:p-2.5">
                {dateBlock}
                <div className="min-w-0 flex-1">
                    <p className="eyebrow text-[8px]">Agenda</p>
                    <h3 className="mt-0.5 font-display text-[11px] font-bold leading-snug text-ink line-clamp-1">{agenda.title}</h3>
                    {agenda.location && (
                        <p className="mt-0.5 flex items-start gap-1 text-[9px] text-slate">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-px h-2.5 w-2.5 shrink-0 text-gold-deep" aria-hidden="true">
                                <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" />
                                <circle cx="12" cy="10" r="2.5" />
                            </svg>
                            <span className="line-clamp-1">{agenda.location}</span>
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-ink/5 px-2 py-1 sm:px-2.5">
                <span className="font-mono text-[7px] uppercase tracking-widest text-slate-soft">
                    {agenda.type || 'Event'}
                </span>
                <span className="font-mono text-[7px] uppercase tracking-widest text-slate/60">
                    Information
                </span>
            </div>
        </div>
    );
}

function BannerSection({ label, banners, renderBanner }) {
    if (banners.length === 0) return null;

    return (
        <section aria-label={label} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <p className="eyebrow">{label}</p>
                <span aria-hidden="true" className="h-px flex-1 bg-ink/10" />
            </div>

            <div className="flex flex-col gap-2">
                {banners.map((banner, i) => (
                    <Reveal key={banner.id} delay={0.05 + i * 0.08}>
                        {renderBanner(banner)}
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

function BannerZone({ banners }) {
    const promoBanners = banners.filter((banner) => banner.type === 'promo' && banner.promo);
    const agendaBanners = banners.filter((banner) => banner.type === 'agenda' && banner.agenda);

    return (
        <div className="flex flex-col gap-4">
            <BannerSection
                label="Promos"
                banners={promoBanners}
                renderBanner={(banner) => <PromoBanner promo={banner.promo} imageUrl={banner.image_url} />}
            />

            {promoBanners.length > 0 && agendaBanners.length > 0 && (
                <div aria-hidden="true" className="h-px bg-ink/10" />
            )}

            <BannerSection
                label="Agenda"
                banners={agendaBanners}
                renderBanner={(banner) => <AgendaBanner agenda={banner.agenda} imageUrl={banner.image_url} />}
            />
        </div>
    );
}

export default function Home({ member, banners = [], vendor_ranking = [], popup = null }) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    const firstName = (member?.name || '').split(' ')[0];
    const active = member?.membership_status === 'active';
    const bannerList = Array.isArray(banners) ? banners : [];

    const [popupOpen, setPopupOpen] = useState(false);

    useEffect(() => {
        if (popup?.promo) {
            const timer = setTimeout(() => setPopupOpen(true), 3000);
            return () => clearTimeout(timer);
        }
    }, [popup]);

    return (
        <>
            <Head title="Home" />

            <div className="flex flex-col gap-6">
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

                <section className="flex w-full justify-center">
                    <MemberCard member={member} />
                </section>

                {vendor_ranking.length > 0 && (
                    <VendorRanking vendors={vendor_ranking} />
                )}

                {bannerList.length > 0 && <BannerZone banners={bannerList} />}
            </div>

            <PromoPopup popup={popup} open={popupOpen} onClose={() => setPopupOpen(false)} />
        </>
    );
}

Home.layout = (page) => <MemberLayout>{page}</MemberLayout>;
