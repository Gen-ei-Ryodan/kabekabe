import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import QrCode from '@/Components/QrCode';
import { formatDate } from '@/Utils/format';

export default function MemberCard({ member }) {
    const wrapRef = useRef(null);
    const cardRef = useRef(null);
    const sheenRef = useRef(null);

    useEffect(() => {
        const wrap = wrapRef.current;
        const card = cardRef.current;
        const sheen = sheenRef.current;
        if (!wrap || !card) return;

        const mm = gsap.matchMedia();

        mm.add({ reduceMotion: '(prefers-reduced-motion: reduce)' }, (ctx) => {
            const { reduceMotion } = ctx.conditions;

            if (reduceMotion) return;

            const timeline = gsap.timeline({
                defaults: { ease: 'power3.out' },
            });

            timeline
                .fromTo(card, { autoAlpha: 0, rotationY: -32, rotationX: 10, y: 48, scale: 0.94 }, { autoAlpha: 1, rotationY: 0, rotationX: 0, y: 0, scale: 1, duration: 1.1 })
                .fromTo(
                    '.card-line',
                    { autoAlpha: 0, y: 10 },
                    { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 },
                    '-=0.5',
                )
                .fromTo(
                    sheen,
                    { xPercent: -130, autoAlpha: 0.9 },
                    { xPercent: 130, autoAlpha: 0, duration: 1.1, ease: 'power2.inOut' },
                    '-=0.4',
                );

            gsap.to(card, { y: -6, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });

            return () => timeline.kill();
        });

        const handleMove = (e) => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            const rect = wrap.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;

            gsap.to(card, {
                rotationY: px * 16,
                rotationX: -py * 14,
                transformPerspective: 900,
                duration: 0.6,
                ease: 'power2.out',
            });
        };

        const handleLeave = () => {
            gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'power3.out' });
        };

        wrap.addEventListener('mousemove', handleMove);
        wrap.addEventListener('mouseleave', handleLeave);

        return () => {
            wrap.removeEventListener('mousemove', handleMove);
            wrap.removeEventListener('mouseleave', handleLeave);
            mm.revert();
        };
    }, []);

    const isActive = member.membership_status === 'active';

    return (
        <div ref={wrapRef} className="relative [perspective:1200px]">
            <div
                ref={cardRef}
                className="relative flex min-h-[15rem] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-br from-ink via-ink-soft to-ink shadow-card will-change-transform sm:aspect-[1.586]"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* ambient glow */}
                <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />

                {/* sheen sweep */}
                <div
                    ref={sheenRef}
                    className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    style={{ transform: 'translateX(-130%)', visibility: 'hidden' }}
                />

                {/* texture */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.15]"
                    style={{
                        backgroundImage:
                            'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                    }}
                />

                {/* top row */}
                <div className="relative flex items-start justify-between px-5 pt-5 sm:px-6 sm:pt-6">
                    <div className="card-line flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gold">
                            <span className="font-display text-sm font-bold text-ink">K</span>
                        </span>
                        <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-paper">
                            KBKB
                        </span>
                    </div>
                    <span className="card-line font-mono text-[10px] uppercase tracking-[0.3em] text-paper/60">
                        Member Card
                    </span>
                </div>

                {/* body */}
                <div className="relative flex items-center justify-between gap-4 px-5 sm:px-6">
                    <div className="min-w-0">
                        <div className="card-line mb-2 flex items-center gap-3">
                            {member.avatar_url ? (
                                <img
                                    src={member.avatar_url}
                                    alt={member.name}
                                    className="h-12 w-12 rounded-full border-2 border-gold object-cover"
                                />
                            ) : (
                                <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold bg-ink-mute/40 font-display text-lg font-bold text-gold-light">
                                    {member.name?.charAt(0) || 'M'}
                                </span>
                            )}
                            <div className="min-w-0">
                                <p className="truncate font-display text-lg font-bold text-paper">{member.name}</p>
                                <p className="font-mono text-[11px] tracking-wider text-gold-light">{member.member_code}</p>
                            </div>
                        </div>
                        <div className="card-line mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-paper/50">
                            Joined {member.joined_at}
                        </div>
                    </div>

                    <div className="card-line shrink-0 rounded-xl bg-paper p-2 shadow-lift">
                        <QrCode value={member.card_token} size={92} />
                    </div>
                </div>

                {/* footer */}
                <div className="relative mt-auto flex items-end justify-between px-5 pb-6 pt-5 sm:px-6 sm:pb-8 sm:pt-6">
                    <div className="card-line">
                        <span
                            className={`chip border ${
                                isActive
                                    ? 'border-sage/40 bg-sage/20 text-sage'
                                    : 'border-ember/40 bg-ember/20 text-ember'
                            }`}
                        >
                            {isActive && (
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                                </span>
                            )}
                            {member.membership_status_label}
                        </span>
                    </div>
                    <div className="card-line text-right">
                        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-paper/50">Valid until</div>
                        <div className="font-display text-sm font-bold text-paper">
                            {member.expires_at ? formatDate(member.expires_at) : '—'}
                        </div>
                    </div>
                </div>

                {!isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-ink/70 backdrop-blur-[2px]">
                        <div className="rounded-2xl border border-ember/40 bg-ember/20 px-5 py-3 text-center">
                            <p className="font-display text-sm font-bold text-paper">Membership Inactive</p>
                            <p className="mt-0.5 text-xs text-paper/70">Renew to use your benefits</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}