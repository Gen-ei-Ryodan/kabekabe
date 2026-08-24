import { Head, Link } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import MemberCard from '@/Components/MemberCard';
import StatusChip from '@/Components/StatusChip';
import Reveal from '@/Components/Reveal';
import { formatDate, formatRupiah, daysUntil } from '@/Utils/format';

function Portrait({ member }) {
    const initial = (member?.name || 'M').charAt(0).toUpperCase();

    return (
        <div className="relative w-36 shrink-0 sm:w-44">
            <div
                aria-hidden="true"
                className="absolute -left-3 -top-3 h-full w-full rounded-2xl border border-gold/30 bg-gold/10"
            />
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-ink shadow-card">
                {member?.avatar_url ? (
                    <img src={member.avatar_url} alt={member.name} className="h-full w-full object-cover" />
                ) : (
                    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-ink via-ink-soft to-ink">
                        <div
                            className="pointer-events-none absolute inset-0 opacity-[0.15]"
                            style={{
                                backgroundImage:
                                    'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
                                backgroundSize: '16px 16px',
                            }}
                        />
                        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/20 blur-3xl" />
                        <span className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-gold/60 bg-ink-mute/40 font-display text-5xl font-bold text-gold-light">
                            {initial}
                        </span>
                        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-paper/50">Member</p>
                    </div>
                )}

                <div className="pointer-events-none absolute inset-3 rounded-xl border border-paper/20" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-4 pt-12">
                    <p className="truncate font-display text-sm font-bold text-paper">{member?.name}</p>
                    <p className="mt-0.5 font-mono text-[10px] tracking-widest text-gold-light">{member?.member_code}</p>
                </div>
            </div>
        </div>
    );
}

function PromoBanner({ promo }) {
    const discountLabel =
        promo.discount_type === 'percent'
            ? `${promo.discount_value}%`
            : formatRupiah(promo.discount_value);

    return (
        <Link
            href={route('member.promos.show', promo.id)}
            className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white/80 shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-card"
        >
            <div className="relative flex items-center justify-between gap-3 bg-ink px-5 py-4 sm:px-6">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-[0.12]"
                    style={{
                        backgroundImage:
                            'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
                        backgroundSize: '14px 14px',
                    }}
                />
                <span className="relative font-display text-2xl font-bold text-gold-light sm:text-3xl">
                    {discountLabel}
                </span>
                <span className="relative truncate rounded-full bg-gold/15 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-gold-light">
                    {promo.partner?.name}
                </span>
            </div>

            <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="eyebrow">Promo</p>
                <h3 className="mt-1.5 font-display font-bold leading-snug text-ink group-hover:text-ink-soft">
                    {promo.title}
                </h3>
                {promo.min_purchase > 0 && (
                    <p className="mt-2 text-xs text-slate">Min. purchase {formatRupiah(promo.min_purchase)}</p>
                )}

                <div className="mt-auto pt-5">
                    <div className="flex items-center justify-between gap-3 border-t border-ink/5 pt-3">
                        <span className="font-mono text-[11px] uppercase tracking-wide text-slate-soft">
                            {formatDate(promo.start_date)} — {formatDate(promo.end_date)}
                        </span>
                        <span className="shrink-0 font-mono text-[11px] font-semibold uppercase tracking-widest text-gold-deep transition-transform duration-300 group-hover:translate-x-0.5">
                            View →
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function AgendaBanner({ agenda }) {
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
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-gold via-gold-light/40 to-transparent" />

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
    const gridClass = count === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2';

    return (
        <section aria-label="Featured" className="flex flex-col gap-6">
            <Reveal>
                <div className="flex items-center gap-3">
                    <p className="eyebrow">Featured</p>
                    <span aria-hidden="true" className="h-px flex-1 bg-ink/10" />
                </div>
            </Reveal>

            <div className={`grid gap-4 sm:gap-5 ${gridClass}`}>
                {banners.map((banner, i) => (
                    <Reveal
                        key={banner.id}
                        delay={0.05 + i * 0.08}
                        className={count === 3 && i === 2 ? 'sm:col-span-2' : ''}
                    >
                        {banner.type === 'promo' && banner.promo ? (
                            <PromoBanner promo={banner.promo} />
                        ) : banner.agenda ? (
                            <AgendaBanner agenda={banner.agenda} />
                        ) : null}
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

export default function Home({ member, banners = [] }) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    const firstName = (member?.name || '').split(' ')[0];
    const active = member?.membership_status === 'active';
    const bannerList = (Array.isArray(banners) ? banners : []).slice(0, 3);

    return (
        <>
            <Head title="Home" />

            <div className="flex flex-col gap-12">
                <header className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <p className="eyebrow">
                            {greeting}, {firstName}
                        </p>
                        <StatusChip status={member?.membership_status} label={member?.membership_status_label} pulse />
                    </div>
                    <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                        Your member card is ready.
                    </h1>
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

                <section className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-6">
                    <Reveal className="shrink-0">
                        <Portrait member={member} />
                    </Reveal>
                    <div className="flex min-w-0 flex-1 justify-center sm:justify-start">
                        <MemberCard member={member} />
                    </div>
                </section>

                {bannerList.length > 0 && <BannerZone banners={bannerList} />}
            </div>
        </>
    );
}

Home.layout = (page) => <MemberLayout>{page}</MemberLayout>;
